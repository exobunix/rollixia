import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, ShieldCheck, ShieldAlert, Eye, X, DownloadCloud } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { addToast } = useToast();

  const loadOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());

    apiRequest(`/api/admin/orders?${params.toString()}`)
      .then(res => setOrders(res.orders || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [searchQuery]);

  const handleOpenOrder = async (id) => {
    setModalLoading(true);
    try {
      const data = await apiRequest(`/api/admin/orders/${id}`);
      setSelectedOrder(data);
    } catch (err) {
      addToast('Failed to load order details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleProcessRefund = async (orderId) => {
    if (!window.confirm('Process refund for this order? This will revoke digital download access.')) return;
    try {
      await apiRequest(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Admin initiated refund' })
      });
      addToast('Order refunded and download tokens revoked', 'info');
      handleOpenOrder(orderId);
      loadOrders();
    } catch (err) {
      addToast(err.message || 'Refund failed', 'error');
    }
  };

  const handleToggleDownloadAccess = async (orderId, enable) => {
    try {
      await apiRequest(`/api/admin/orders/${orderId}/downloads`, {
        method: 'PATCH',
        body: JSON.stringify({ enable })
      });
      addToast(enable ? 'Download access renewed for 48 hours' : 'Download access revoked', 'success');
      handleOpenOrder(orderId);
    } catch (err) {
      addToast('Failed to update download access', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Order Management & Audits
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Inspect verified transactions, process refunds, and govern customer download permissions.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-surface)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        maxWidth: '380px',
        marginBottom: '1.5rem'
      }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search by Order #, email, or txn ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', width: '100%' }}
        />
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px' }}>Order Reference</th>
              <th style={{ padding: '10px' }}>Customer</th>
              <th style={{ padding: '10px' }}>Items</th>
              <th style={{ padding: '10px' }}>Amount</th>
              <th style={{ padding: '10px' }}>Payment Status</th>
              <th style={{ padding: '10px' }}>Downloads Tracked</th>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders match criteria.</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--primary)' }}>
                    {o.order_number}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{o.customer_name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_email}</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    {o.item_count} items
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#10b981' }}>
                    {formatCurrency(o.total_amount)}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge" style={{
                      background: o.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : o.payment_status === 'refunded' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: o.payment_status === 'paid' ? '#10b981' : o.payment_status === 'refunded' ? '#f43f5e' : '#f59e0b'
                    }}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {o.total_downloads} downloaded
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {formatDateTime(o.created_at)}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenOrder(o.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER DETAILS</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {selectedOrder.order.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer & Txn Box */}
            <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <p><strong>Customer:</strong> {selectedOrder.order.customer_name} ({selectedOrder.order.customer_email})</p>
              <p><strong>Payment Txn ID:</strong> {selectedOrder.order.payment_id || 'Instant Access'}</p>
              <p><strong>Gateway Provider:</strong> {selectedOrder.order.payment_provider?.toUpperCase()}</p>
              <p><strong>Order Timestamp:</strong> {formatDateTime(selectedOrder.order.created_at)}</p>
            </div>

            {/* Items */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Purchased Digital Assets</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {selectedOrder.items?.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '6px', fontSize: '0.875rem' }}>
                  <div>
                    <strong>{it.product_title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({it.license_name})</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(it.price)}</span>
                </div>
              ))}
            </div>

            {/* Downloads status */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Download Entitlements</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
              {selectedOrder.downloads?.map(dl => (
                <div key={dl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <span>{dl.product_title} ({dl.file_name})</span>
                  <span style={{ color: 'var(--text-muted)' }}>Downloaded {dl.download_count} / {dl.max_downloads} times</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleToggleDownloadAccess(selectedOrder.order.id, true)}
                  className="btn btn-secondary btn-sm"
                >
                  Renew Download Window
                </button>
                <button
                  onClick={() => handleToggleDownloadAccess(selectedOrder.order.id, false)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#f43f5e' }}
                >
                  Suspend Access
                </button>
              </div>

              {selectedOrder.order.payment_status === 'paid' && (
                <button
                  onClick={() => handleProcessRefund(selectedOrder.order.id)}
                  className="btn btn-danger btn-sm"
                >
                  <RotateCcw size={14} /> Process Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
