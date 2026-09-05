function logAdminActivity(db, adminId, action, entityType, entityId = null, details = null, ipAddress = null) {
  try {
    db.run(
      `INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        action,
        entityType,
        entityId,
        typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress || '127.0.0.1'
      ]
    );
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}

module.exports = {
  logAdminActivity
};
