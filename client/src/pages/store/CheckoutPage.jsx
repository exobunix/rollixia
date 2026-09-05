import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, CreditCard, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { apiRequest } from '../../utils/api';

export function CheckoutPage({ onNavigate }) {
  const { items, cartTotals, couponCode, clearCart } = useCart();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { addToast } = useToast();

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [country, setCountry] = useState('India');
  const [paymentProvider, setPaymentProvider] = useState('simulated');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>No items in checkout</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please select products to proceed with checkout.</p>
        <button onClick={() => onNavigate('products')} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!customerEmail.trim() || !customerName.trim()) {
      addToast('Please provide your name and valid email for digital delivery', 'error');
      return;
    }

    if (!agreedTerms) {
      addToast('Please agree to the terms and digital delivery policy', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on server
      const orderPayload = {
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim(),
        items: items.map(i => ({ productId: i.productId, licenseId: i.licenseId })),
        coupon_code: couponCode || null,
        payment_provider: paymentProvider,
        currency
      };

      const orderData = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      // 2. If order is free (₹0), server already marked it paid and granted access
      if (orderData.isFree) {
        clearCart();
        addToast('Free product order processed instantly!', 'success');
        onNavigate('order-success', { orderNumber: orderData.orderNumber });
        return;
      }

      // 3. Complete payment verification via backend
      const verifyPayload = {
        orderNumber: orderData.orderNumber,
        paymentId: orderData.paymentSession?.paymentId || `PAY-SIM-${Date.now()}`,
        provider: paymentProvider
      };

      const verifyRes = await apiRequest('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify(verifyPayload)
      });

      if (verifyRes.success) {
        clearCart();
        addToast('Payment verified successfully! Your files are ready.', 'success');
        onNavigate('order-success', { orderNumber: orderData.orderNumber });
      } else {
        throw new Error(verifyRes.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      addToast(err.message || 'An error occurred during payment processing', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        <h1 className="display-title gradient-text" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Secure Checkout
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Instant tokenized delivery right after payment confirmation.
        </p>

        <form onSubmit={handleCheckoutSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'start'
          }}>
            {/* Left: Customer Information & Payment Methods */}
            <div>
              {/* Customer Contact */}
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  1. Digital Delivery Contact
                </h3>

                <div className="form-group">
                  <label className="form-label">Email Address (Downloads & Invoices will be sent here)</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="alex@company.com"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Alex Morgan"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Billing Country / Region</label>
                  <select
                    className="form-select"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  2. Payment Architecture
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Option 1: Instant Simulated Card Gateway (Demo) */}
                  <div
                    onClick={() => setPaymentProvider('simulated')}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${paymentProvider === 'simulated' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: paymentProvider === 'simulated' ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Zap size={20} color="var(--primary)" />
                      <div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Instant Direct Payment Gateway (Simulated / Verified)
                        </p>
                        <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                          One-click test checkout with instant server verification & token issuance
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>VERIFIED</span>
                  </div>

                  {/* Option 2: Razorpay */}
                  <div
                    onClick={() => setPaymentProvider('razorpay')}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${paymentProvider === 'razorpay' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: paymentProvider === 'razorpay' ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CreditCard size={20} color="#06b6d4" />
                      <div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Razorpay / UPI / NetBanking
                        </p>
                        <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                          Supports Google Pay, PhonePe, Cards & Indian Banks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    I agree to the <span onClick={() => onNavigate('legal', { tab: 'terms' })} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Terms of Service</span>, commercial license terms, and instant digital delivery policy.
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '0.9rem' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.licenseName}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>
                      {formatCurrency(item.price, currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotals.subtotal, currency)}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                    <span>Discount ({cartTotals.coupon?.code})</span>
                    <span>-{formatCurrency(cartTotals.discount, currency)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Tax (18% GST)</span>
                  <span>{formatCurrency(cartTotals.tax, currency)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}>
                  <span>Final Total</span>
                  <span style={{ color: '#10b981' }}>
                    {formatCurrency(cartTotals.total, currency)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success btn-lg"
                disabled={isProcessing}
                style={{ width: '100%', fontWeight: 700 }}
              >
                {isProcessing ? 'Verifying Payment...' : (
                  <>
                    <Lock size={18} /> Pay & Get Instant Access
                  </>
                )}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginTop: '1.25rem'
              }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>Verified Server-Side Encryption</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
