import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit3, X, Zap, Clock, Sparkles, Check, HelpCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'normal' | 'upselling'
  const { addToast } = useToast();

  // Form State
  const [code, setCode] = useState('');
  const [couponType, setCouponType] = useState('normal'); // 'normal' | 'upselling'
  const [upsellStep, setUpsellStep] = useState(1); // 1 | 2
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupDesc, setPopupDesc] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrder, setMinOrder] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(5000);
  const [usageLimit, setUsageLimit] = useState(1000);
  const [isActive, setIsActive] = useState(1);

  const loadCoupons = () => {
    setLoading(true);
    apiRequest('/api/admin/coupons')
      .then(res => setCoupons(Array.isArray(res) ? res : (Array.isArray(res?.coupons) ? res.coupons : [])))
      .catch(err => {
        console.error(err);
        setCoupons([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateModal = (type = 'normal', step = 1) => {
    setEditingId(null);
    setCouponType(type);
    setUpsellStep(step);
    if (type === 'upselling') {
      setCode(step === 1 ? 'DEAL10' : 'LASTCHANCE15');
      setDiscountType('percentage');
      setDiscountValue(step === 1 ? 10 : 15);
      setTimerSeconds(30);
      setPopupTitle(
        step === 1
          ? 'Wait! Limited Time Deal Only For You 🎁'
          : '🔥 Final Chance: We Really Want You On Board!'
      );
      setPopupDesc(
        step === 1
          ? 'Deciding not to purchase? We have an exclusive 10% extra discount waiting for you! Click below to apply instantly.'
          : 'Here is our absolute best offer: an additional 15% OFF your entire cart. Don\'t miss out before this session expires!'
      );
    } else {
      setCode('');
      setDiscountType('percentage');
      setDiscountValue(20);
      setTimerSeconds(30);
      setPopupTitle('');
      setPopupDesc('');
    }
    setMinOrder(0);
    setMaxDiscount(5000);
    setUsageLimit(1000);
    setIsActive(1);
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingId(c.id);
    setCode(c.code || '');
    setCouponType(c.coupon_type || 'normal');
    setUpsellStep(Number(c.upsell_step) || 1);
    setTimerSeconds(Number(c.timer_seconds) || 30);
    setPopupTitle(c.popup_title || '');
    setPopupDesc(c.popup_desc || '');
    setDiscountType(c.discount_type || 'percentage');
    setDiscountValue(Number(c.discount_value) || 10);
    setMinOrder(Number(c.min_order_amount ?? c.min_order_value) || 0);
    setMaxDiscount(Number(c.max_discount_amount ?? c.max_discount) || 5000);
    setUsageLimit(Number(c.usage_limit) || 1000);
    setIsActive(c.is_active !== undefined ? (c.is_active ? 1 : 0) : 1);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      addToast('Coupon code is required', 'error');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      coupon_type: couponType,
      upsell_step: Number(upsellStep),
      timer_seconds: Number(timerSeconds) || 30,
      popup_title: popupTitle.trim(),
      popup_desc: popupDesc.trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_amount: Number(minOrder) || 0,
      min_order_value: Number(minOrder) || 0,
      max_discount_amount: Number(maxDiscount) || 0,
      max_discount: Number(maxDiscount) || 0,
      usage_limit: Number(usageLimit) || 1000,
      is_active: isActive ? 1 : 0
    };

    try {
      if (editingId) {
        await apiRequest(`/api/admin/coupons/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        addToast(`Coupon "${payload.code}" updated successfully!`, 'success');
      } else {
        await apiRequest('/api/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        addToast(`Coupon "${payload.code}" created successfully!`, 'success');
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      addToast(err.message || 'Failed to save coupon', 'error');
    }
  };

  const handleToggleStatus = async (c) => {
    const newStatus = c.is_active ? 0 : 1;
    try {
      await apiRequest(`/api/admin/coupons/${c.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: newStatus })
      });
      addToast(`Coupon "${c.code}" ${newStatus ? 'activated' : 'deactivated'}`, 'info');
      loadCoupons();
    } catch (err) {
      addToast('Failed to update status', 'error');
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

  const safeCoupons = Array.isArray(coupons) ? coupons : [];

  const filteredCoupons = safeCoupons.filter(c => {
    if (activeTab === 'normal') return (c.coupon_type || 'normal') === 'normal';
    if (activeTab === 'upselling') return c.coupon_type === 'upselling';
    return true;
  });

  const step1Upsell = safeCoupons.find(c => c.coupon_type === 'upselling' && Number(c.upsell_step) === 1 && (c.is_active === 1 || c.is_active === true));
  const step2Upsell = safeCoupons.find(c => c.coupon_type === 'upselling' && Number(c.upsell_step) === 2 && (c.is_active === 1 || c.is_active === true));

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Promotions & Upselling Engine
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Manage manual discount codes and multi-step exit-intent / hold-time upselling popups.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openCreateModal('upselling', 1)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="#f59e0b" /> + Add Upsell Deal
          </button>
          <button onClick={() => openCreateModal('normal')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> + Create Promo Code
          </button>
        </div>
      </div>

      {/* Upselling Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Step 1 Upsell Card */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b', background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={14} /> 1st Step Upsell Popup
            </span>
            <span className="badge" style={{
              background: step1Upsell ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.15)',
              color: step1Upsell ? '#10b981' : '#ef4444'
            }}>
              {step1Upsell ? 'Live' : 'Not Configured'}
            </span>
          </div>
          {step1Upsell ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{step1Upsell.code}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                  {step1Upsell.discount_type === 'percentage' ? `${step1Upsell.discount_value}% OFF` : `₹${step1Upsell.discount_value} FLAT`}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                "{step1Upsell.popup_title}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {step1Upsell.timer_seconds || 30}s Inactivity Hold
                </span>
                <span>• Exit-intent detection</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Triggers when user moves to leave or stays 30s on checkout.
            </p>
          )}
        </div>

        {/* Step 2 Upsell Card */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444', background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} /> 2nd Step Last Chance Deal
            </span>
            <span className="badge" style={{
              background: step2Upsell ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.15)',
              color: step2Upsell ? '#10b981' : '#ef4444'
            }}>
              {step2Upsell ? 'Live' : 'Not Configured'}
            </span>
          </div>
          {step2Upsell ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{step2Upsell.code}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                  {step2Upsell.discount_type === 'percentage' ? `${step2Upsell.discount_value}% OFF` : `₹${step2Upsell.discount_value} FLAT`}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                "{step2Upsell.popup_title}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Secondary Exit Trigger
                </span>
                <span>• Auto-applied to cart</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Triggers if customer declines the 1st offer or tries back button again.
            </p>
          )}
        </div>
      </div>

      {/* Tabs Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'all' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'all' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          All Offers ({safeCoupons.length})
        </button>
        <button
          onClick={() => setActiveTab('normal')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'normal' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'normal' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Normal Promo Codes ({safeCoupons.filter(c => (c.coupon_type || 'normal') === 'normal').length})
        </button>
        <button
          onClick={() => setActiveTab('upselling')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'upselling' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'upselling' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Zap size={14} color={activeTab === 'upselling' ? '#fff' : '#f59e0b'} />
          Upselling Popups ({safeCoupons.filter(c => c.coupon_type === 'upselling').length})
        </button>
      </div>

      {/* Coupons Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 10px' }}>Coupon Code & Type</th>
              <th style={{ padding: '12px 10px' }}>Discount</th>
              <th style={{ padding: '12px 10px' }}>Trigger / Behavior</th>
              <th style={{ padding: '12px 10px' }}>Popup Headline & Message</th>
              <th style={{ padding: '12px 10px' }}>Min Order</th>
              <th style={{ padding: '12px 10px' }}>Status</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading coupons...</td></tr>
            ) : filteredCoupons.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No coupons found in this category.</td></tr>
            ) : (
              filteredCoupons.map(c => {
                const isUpsell = c.coupon_type === 'upselling';
                const step = Number(c.upsell_step) || 1;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          background: isUpsell ? (step === 1 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'var(--primary-light)',
                          color: isUpsell ? (step === 1 ? '#d97706' : '#ef4444') : 'var(--primary)',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}>
                          {c.code}
                        </span>
                        {isUpsell ? (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: step === 1 ? '#fef3c7' : '#fee2e2',
                            color: step === 1 ? '#b45309' : '#991b1b'
                          }}>
                            {step === 1 ? '1st Step Upsell' : '2nd Step Last Chance'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Normal Promo
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 10px', fontWeight: 700, color: '#10b981' }}>
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                    </td>
                    <td style={{ padding: '14px 10px', color: 'var(--text-secondary)' }}>
                      {isUpsell ? (
                        <div style={{ fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Exit Intent & Hold</span>
                          <div style={{ color: 'var(--text-muted)' }}>Timer: {c.timer_seconds || 30}s Inactivity</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Manual Cart Input</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 10px', maxWidth: '240px' }}>
                      {isUpsell ? (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {c.popup_title || 'Limited Time Offer'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {c.popup_desc || 'Additional discount applied automatically'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 10px', color: 'var(--text-secondary)' }}>
                      {c.min_order_amount || c.min_order_value ? formatCurrency(c.min_order_amount || c.min_order_value) : 'No Min'}
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '20px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: c.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: c.is_active ? '#10b981' : '#ef4444'
                        }}
                      >
                        {c.is_active ? '● Active' : '○ Disabled'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          className="btn-icon"
                          style={{ color: 'var(--primary)' }}
                          title="Edit Coupon"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="btn-icon"
                          style={{ color: '#ef4444' }}
                          title="Delete Coupon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {editingId ? 'Edit Promotion / Coupon' : (couponType === 'upselling' ? 'Create Upselling Popup Deal' : 'Create Promo Code')}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Configure discount parameters, trigger rules, and modal copy.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              {/* Coupon Type Selector */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Coupon Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCouponType('normal')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: couponType === 'normal' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: couponType === 'normal' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      color: couponType === 'normal' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    🏷️ Normal Promo Code
                    <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '2px' }}>
                      Entered manually by buyer
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCouponType('upselling')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: couponType === 'upselling' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
                      background: couponType === 'upselling' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                      color: couponType === 'upselling' ? '#d97706' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    ⚡ Upselling Deal Popup
                    <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '2px' }}>
                      Auto-applied on exit / hold
                    </div>
                  </button>
                </div>
              </div>

              {/* Upselling Specific Settings */}
              {couponType === 'upselling' && (
                <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#b45309', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={15} /> Upselling Behavior & Content Settings
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Upsell Step</label>
                      <select
                        className="form-select"
                        value={upsellStep}
                        onChange={e => {
                          const step = Number(e.target.value);
                          setUpsellStep(step);
                          if (!editingId) {
                            setCode(step === 1 ? 'DEAL10' : 'LASTCHANCE15');
                            setDiscountValue(step === 1 ? 10 : 15);
                            setPopupTitle(step === 1 ? 'Wait! Limited Time Deal Only For You 🎁' : '🔥 Final Chance: We Really Want You On Board!');
                            setPopupDesc(step === 1 ? 'Deciding not to purchase? We have an exclusive 10% extra discount waiting for you! Click below to apply instantly.' : 'Here is our absolute best offer: an additional 15% OFF your entire cart. Don\'t miss out before this session expires!');
                          }
                        }}
                      >
                        <option value={1}>1st Step (Exit Intent or Hold Timer)</option>
                        <option value={2}>2nd Step (Last Chance / 2nd Denial)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Inactivity Hold Timer (Seconds)</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        className="form-input"
                        value={timerSeconds}
                        onChange={e => setTimerSeconds(Number(e.target.value))}
                        placeholder="e.g. 30"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Popup Headline Title</label>
                    <input
                      type="text"
                      required={couponType === 'upselling'}
                      className="form-input"
                      value={popupTitle}
                      onChange={e => setPopupTitle(e.target.value)}
                      placeholder="e.g. Wait! Limited Time Deal Only For You 🎁"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Popup Description Copy</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={popupDesc}
                      onChange={e => setPopupDesc(e.target.value)}
                      placeholder="e.g. Claim an additional 10% instant discount applied directly to your cart right now!"
                    />
                  </div>
                </div>
              )}

              {/* Coupon Code & Discount Details */}
              <div className="form-group">
                <label className="form-label">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DEAL10"
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
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
                    min="1"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Usage Limit</label>
                  <input
                    type="number"
                    className="form-input"
                    value={usageLimit}
                    onChange={e => setUsageLimit(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={isActive} onChange={e => setIsActive(Number(e.target.value))}>
                    <option value={1}>Active & Live</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> {editingId ? 'Save Changes' : 'Create & Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
