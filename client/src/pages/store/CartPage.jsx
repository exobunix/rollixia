import React, { useState } from 'react';
import { Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatters';

export function CartPage({ onNavigate }) {
  const { items, removeFromCart, clearCart, cartTotals, couponCode, applyCoupon, removeCoupon, calculating } = useCart();
  const { currency } = useCurrency();
  const [couponInput, setCouponInput] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <ShoppingBag size={32} color="var(--text-muted)" />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '440px', margin: '0 auto 2rem auto' }}>
          Explore our collection of production-ready software, UI kits, website templates, and AI prompts.
        </p>
        <button onClick={() => onNavigate('products')} className="btn btn-primary btn-lg">
          Explore Products <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 6rem 0' }}>
      <div className="container">
        <button
          onClick={() => onNavigate('products')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          <ArrowLeft size={16} /> Continue Shopping
        </button>

        <h1 className="display-title gradient-text" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', marginBottom: '2rem' }}>
          Shopping Cart ({items.length} items)
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, idx) => (
              <div
                key={`${item.productId}-${item.licenseId}-${idx}`}
                className="glass-card"
                style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                ) : (
                  <div style={{ width: '80px', height: '80px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={24} color="var(--text-muted)" />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {item.licenseName}
                  </span>
                  <h3
                    onClick={() => onNavigate('product-detail', { slug: item.slug })}
                    style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', margin: '3px 0' }}
                  >
                    {item.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Instant Token Delivery</span>
                    <span>•</span>
                    <span>Lifetime Access</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginBottom: '6px' }}>
                    {formatCurrency(item.price, currency)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId, item.licenseId)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#f43f5e',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                onClick={clearCart}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Clear entire cart
              </button>
            </div>
          </div>

          {/* Order Summary & Coupon Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Order Summary
            </h3>

            {/* Coupon input */}
            <div style={{ marginBottom: '1.5rem' }}>
              {cartTotals.coupon && !cartTotals.coupon.invalid ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px dashed #10b981',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} color="#10b981" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                      {cartTotals.coupon.code} (-{formatCurrency(cartTotals.coupon.discountAmount, currency)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn-secondary" disabled={!couponInput.trim()}>
                    Apply
                  </button>
                </form>
              )}

              {cartTotals.coupon && cartTotals.coupon.invalid && (
                <p style={{ fontSize: '0.8rem', color: '#f43f5e', marginTop: '6px' }}>
                  {cartTotals.coupon.reason || 'Invalid coupon'}
                </p>
              )}
            </div>

            {/* Price lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotals.subtotal, currency)}</span>
              </div>

              {cartTotals.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-{formatCurrency(cartTotals.discount, currency)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Tax (18% GST)</span>
                <span>{formatCurrency(cartTotals.tax, currency)}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--text-primary)'
              }}>
                <span>Total</span>
                <span style={{ color: '#10b981' }}>
                  {formatCurrency(cartTotals.total, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="btn btn-primary btn-lg"
              disabled={calculating}
              style={{ width: '100%', fontWeight: 700 }}
            >
              Proceed to Secure Checkout <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '1rem'
            }}>
              <ShieldCheck size={16} color="#10b981" /> 256-Bit SSL Encrypted Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
