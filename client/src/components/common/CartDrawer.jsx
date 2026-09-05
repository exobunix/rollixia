import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatters';

export function CartDrawer({ onNavigateCheckout, onNavigateShopping }) {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, cartTotals, couponCode, applyCoupon, removeCoupon, calculating } = useCart();
  const { currency } = useCurrency();
  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon.trim());
      setInputCoupon('');
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="drawer-right">
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Your Cart ({items.length})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <ShoppingBag size={28} color="var(--text-muted)" />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your cart is empty</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Explore our curated digital assets, templates, and full-stack software.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setIsCartOpen(false);
                  if (onNavigateShopping) onNavigateShopping();
                }}
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.licenseId || 'def'}-${idx}`}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  ) : (
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShoppingBag size={20} color="var(--text-muted)" />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: '0.925rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.title}
                    </h4>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      color: 'var(--primary)',
                      background: 'var(--primary-light)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      margin: '3px 0'
                    }}>
                      {item.licenseName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#10b981' }}>
                        {formatCurrency(item.price, currency)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.productId, item.licenseId)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f43f5e',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.775rem'
                        }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                {cartTotals.coupon && !cartTotals.coupon.invalid ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px dashed #10b981',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={16} color="#10b981" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                        {cartTotals.coupon.code} (-{formatCurrency(cartTotals.coupon.discountAmount, currency)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Coupon (e.g. SAVE20)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      style={{ textTransform: 'uppercase', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    />
                    <button type="submit" className="btn btn-secondary btn-sm" disabled={!inputCoupon.trim()}>
                      Apply
                    </button>
                  </form>
                )}

                {cartTotals.coupon && cartTotals.coupon.invalid && (
                  <p style={{ fontSize: '0.775rem', color: '#f43f5e', marginTop: '4px' }}>
                    {cartTotals.coupon.reason || 'Invalid coupon code'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotals.subtotal, currency)}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Discount</span>
                  <span>-{formatCurrency(cartTotals.discount, currency)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>GST / Tax (18%)</span>
                <span>{formatCurrency(cartTotals.tax, currency)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: 'var(--text-primary)',
                paddingTop: '6px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <span>Total</span>
                <span style={{ color: '#10b981' }}>
                  {formatCurrency(cartTotals.total, currency)}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
              disabled={calculating}
              onClick={() => {
                setIsCartOpen(false);
                if (onNavigateCheckout) onNavigateCheckout();
              }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.75rem'
            }}>
              <ShieldCheck size={14} color="#10b981" /> 256-Bit SSL Encrypted & Instant Digital Access
            </div>
          </div>
        )}
      </div>
    </>
  );
}
