const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');

// GET /api/support/tickets (List user tickets)
router.get('/tickets', authenticateUser, async (req, res) => {
  try {
    const db = await getDatabase();
    const tickets = db.query(`
      SELECT t.*, o.order_number
      FROM support_tickets t
      LEFT JOIN orders o ON o.id = t.order_id
      WHERE t.user_id = ?
      ORDER BY t.id DESC
    `, [req.user.id]);

    const enriched = tickets.map(t => {
      const messages = db.query(
        'SELECT m.*, u.full_name as sender_name FROM support_messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.ticket_id = ? ORDER BY m.id ASC',
        [t.id]
      );
      return { ...t, messages };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// POST /api/support/tickets (Open ticket)
router.post('/tickets', authenticateUser, async (req, res) => {
  try {
    const { subject, order_id, message, priority = 'normal' } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const db = await getDatabase();
    const ticketRes = db.run(
      `INSERT INTO support_tickets (user_id, order_id, subject, status, priority)
       VALUES (?, ?, ?, 'open', ?)`,
      [req.user.id, order_id || null, subject.trim(), priority]
    );
    const ticketId = ticketRes.lastInsertRowid;

    db.run(
      `INSERT INTO support_messages (ticket_id, sender_id, sender_role, message)
       VALUES (?, ?, 'customer', ?)`,
      [ticketId, req.user.id, message.trim()]
    );

    res.status(201).json({ message: 'Support ticket submitted successfully', ticketId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// POST /api/support/tickets/:id/reply
router.post('/tickets/:id/reply', authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message content is required' });

    const db = await getDatabase();
    const ticket = db.get('SELECT * FROM support_tickets WHERE id = ?', [req.params.id]);

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const role = (req.user.role === 'admin' || req.user.role === 'super_admin') ? 'admin' : 'customer';
    db.run(
      `INSERT INTO support_messages (ticket_id, sender_id, sender_role, message)
       VALUES (?, ?, ?, ?)`,
      [ticket.id, req.user.id, role, message.trim()]
    );

    // If admin replies, update status to pending user reply; if customer replies, status to open
    const newStatus = role === 'admin' ? 'pending' : 'open';
    db.run('UPDATE support_tickets SET status = ? WHERE id = ?', [newStatus, ticket.id]);

    res.json({ message: 'Reply sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

module.exports = router;
