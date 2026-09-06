import React, { useState, useEffect } from 'react';
import { Search, UserX, UserCheck } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  const loadCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());

    apiRequest(`/api/admin/customers?${params.toString()}`)
      .then(res => setCustomers(Array.isArray(res) ? res : (Array.isArray(res?.customers) ? res.customers : [])))
      .catch(err => {
        console.error(err);
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await apiRequest(`/api/admin/customers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      addToast(`Customer account marked as ${nextStatus}`, 'success');
      loadCustomers();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const safeCustomers = Array.isArray(customers) ? customers : [];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Customer Management
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Monitor customer lifetime value, purchases, download activity, and account status.
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-surface)',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        maxWidth: '380px',
        marginBottom: '1.5rem'
      }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', width: '100%' }}
        />
      </div>

      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px' }}>Customer</th>
              <th style={{ padding: '10px' }}>Orders</th>
              <th style={{ padding: '10px' }}>Lifetime Spend</th>
              <th style={{ padding: '10px' }}>Downloads Tracked</th>
              <th style={{ padding: '10px' }}>Joined Date</th>
              <th style={{ padding: '10px' }}>Account Status</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading customer accounts...</td></tr>
            ) : safeCustomers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No customers found.</td></tr>
            ) : (
              safeCustomers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{c.full_name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    {c.total_orders} orders
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#10b981' }}>
                    {formatCurrency(c.lifetime_spend)}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {c.total_downloads} downloads
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {formatDate(c.created_at)}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge" style={{
                      background: c.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                      color: c.status === 'active' ? '#10b981' : '#f43f5e'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: c.status === 'active' ? '#f43f5e' : '#10b981' }}
                    >
                      {c.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
