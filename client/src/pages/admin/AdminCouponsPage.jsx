import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { addToast } = useToast();

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrder, setMinOrder] = useState(1000);
  const [maxDiscount, setMaxDiscount] = useState(2000);
  const [usageLimit, setUsageLimit] = useState(500);

  const loadCoupons = () => {
    setLoading(true);
    apiRequest('/api/admin/coupons')
      .then(res => setCoupons(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code,
          discount_type: discountType,
          discount_value: discountValue,
          min_order_value: minOrder,
          max_discount: maxDiscount,
          usage_limit: usageLimit
        })
      });
      addToast(`Coupon "${code.toUpperCase()}" created successfully!`, 'success');
      setIsCreateOpen(false);
      setCode('');
      loadCoupons();
    } catch (err) {
      addToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id, cCode) => {
    if (!window.confirm(`Delete coupon "${cCode}"?`)) return;
    try {
      await apiRequest(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      addToast('Coupon deleted', 'info');
      loadCoupons();
    } catch (err) {
      addToast('Failed to delete coupon', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Promotional Coupons & Deals
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Create discount codes, set minimum order conditions, and view redemption usage stats.
          </p>
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
          <Plus size={18} /> + Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px' }}>Coupon Code</th>
              <th style={{ padding: '10px' }}>Discount Value</th>
              <th style={{ padding: '10px' }}>Min Order</th>
              <th style={{ padding: '10px' }}>Redemptions</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading coupons...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No promotional coupons configured.</td></tr>
            ) : (
              coupons.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--primary)' }}>
                    <span style={{ padding: '4px 8px', background: 'var(--primary-light)', borderRadius: '4px' }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#10b981' }}>
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    {formatCurrency(c.min_order_value)}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {c.times_used} / {c.usage_limit} used
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge" style={{
                      background: c.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                      color: c.is_active ? '#10b981' : '#f43f5e'
                    }}>
                      {c.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteCoupon(c.id, c.code)}
                      className="btn-icon"
                      style={{ color: '#f43f5e' }}
                      title="Delete Coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Coupon Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create New Discount Coupon</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon}>
              <div className="form-group">
                <label className="form-label">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH50"
                  className="form-input"
                  style={{ textTransform: 'uppercase' }}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select className="form-select" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Min Order Value (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={minOrder}
                    onChange={e => setMinOrder(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxDiscount}
                    onChange={e => setMaxDiscount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Total Usage Limit</label>
                <input
                  type="number"
                  className="form-input"
                  value={usageLimit}
                  onChange={e => setUsageLimit(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
