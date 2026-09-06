import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, CreditCard, Zap, QrCode, Smartphone, Wallet, X } from 'lucide-react';
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
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [country, setCountry] = useState('India');
  const [paymentProvider, setPaymentProvider] = useState('paytm');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Paytm Modal State
  const [showPaytmModal, setShowPaytmModal] = useState(false);
  const [paytmTab, setPaytmTab] = useState('upi'); // 'upi', 'wallet', 'cards'
  const [upiId, setUpiId] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);
  const [paytmVerifying, setPaytmVerifying] = useState(false);

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
        customer_phone: customerPhone.trim(),
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

      // If Paytm provider is selected, open Paytm Business modal
      if (paymentProvider === 'paytm') {
        setPendingOrder(orderData);
        setShowPaytmModal(true);
        setIsProcessing(false);
        return;
      }

      // If Razorpay provider is selected, trigger Razorpay Standard Checkout modal
      if (paymentProvider === 'razorpay') {
        if (typeof window.Razorpay === 'undefined') {
          throw new Error('Razorpay SDK could not be loaded. Please check your internet connection and try again.');
        }

        let rzpOrderId = orderData.paymentSession?.orderId;
        let rzpAmount = orderData.paymentSession?.amount;
        let rzpCurrency = orderData.paymentSession?.currency || orderData.currency || 'INR';

        // Fallback: If order was not pre-initialized with Razorpay order_id, create via /api/create-order
        if (!rzpOrderId) {
          const createOrderRes = await apiRequest('/api/create-order', {
            method: 'POST',
            body: JSON.stringify({
              amount: Math.round(orderData.totalAmount * 100),
              currency: rzpCurrency,
              receipt: orderData.orderNumber
            })
          });
          rzpOrderId = createOrderRes.order_id;
          rzpAmount = createOrderRes.amount;
          rzpCurrency = createOrderRes.currency || rzpCurrency;
        }

        const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.paymentSession?.keyId || 'rzp_test_TYdMxQomEc4yMe';

        const rzpOptions = {
          key: rzpKey,
          amount: rzpAmount,
          currency: rzpCurrency,
          name: 'Rollixia Marketplace',
          description: `Order ${orderData.orderNumber} - Digital Products`,
          order_id: rzpOrderId,
          prefill: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            contact: customerPhone.trim() || ''
          },
          theme: {
            color: '#6366f1'
          },
          modal: {
            ondismiss: function() {
              console.log('Razorpay checkout modal dismissed by user');
              setIsProcessing(false);
              addToast('Payment cancelled. You can retry anytime or choose another payment method.', 'info');
            }
          },
          handler: async function(response) {
            // Received razorpay_payment_id, razorpay_order_id, razorpay_signature
            try {
              setIsProcessing(true);
              addToast('Verifying payment signature with server...', 'info');

              const verifyRes = await apiRequest('/api/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderNumber: orderData.orderNumber
                })
              });

              if (verifyRes.success) {
                clearCart();
                addToast('Payment verified successfully! Your files are ready.', 'success');
                onNavigate('order-success', { orderNumber: orderData.orderNumber });
              } else {
                throw new Error(verifyRes.error || 'Payment signature verification failed');
              }
            } catch (vErr) {
              console.error('Razorpay verification error:', vErr);
              addToast(vErr.message || 'Payment signature verification failed', 'error');
            } finally {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(rzpOptions);

        // Handle payment.failed event
        rzp.on('payment.failed', function(resp) {
          console.error('Razorpay payment failed event:', resp.error);
          setIsProcessing(false);
          const failureReason = resp.error?.description || resp.error?.reason || 'Payment could not be processed';
          addToast(`Payment failed: ${failureReason}`, 'error');
        });

        rzp.open();
        return;
      }

      // 3. Complete payment verification via backend for simulated provider
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

  const handleCompletePaytmPayment = async (method = 'UPI') => {
    if (!pendingOrder) return;
    setPaytmVerifying(true);

    try {
      const pId = pendingOrder.paymentSession?.txnToken 
        ? `PAYTM_${pendingOrder.paymentSession.txnToken}` 
        : `PAYTM_TXN_${Date.now()}`;

      const verifyRes = await apiRequest('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          orderNumber: pendingOrder.orderNumber,
          paymentId: pId,
          provider: 'paytm',
          method
        })
      });

      if (verifyRes.success) {
        setShowPaytmModal(false);
        clearCart();
        addToast('✓ Paytm payment approved! Your download tokens are generated.', 'success');
        onNavigate('order-success', { orderNumber: pendingOrder.orderNumber });
      } else {
        throw new Error(verifyRes.error || 'Paytm payment verification failed');
      }
    } catch (err) {
      console.error('Paytm payment error:', err);
      addToast(err.message || 'Failed to verify Paytm payment', 'error');
    } finally {
      setPaytmVerifying(false);
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Option 1: Paytm for Business (Primary & Recommended) */}
                  <div
                    onClick={() => setPaymentProvider('paytm')}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${paymentProvider === 'paytm' ? '#00b9f5' : 'var(--border-subtle)'}`,
                      background: paymentProvider === 'paytm' ? 'rgba(0, 185, 245, 0.08)' : 'var(--bg-surface-elevated)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)',
                      boxShadow: paymentProvider === 'paytm' ? '0 0 20px rgba(0, 185, 245, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#002970',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(0, 41, 112, 0.5)',
                        flexShrink: 0
                      }}>
                        <span style={{ fontWeight: 900, color: '#ffffff', fontSize: '0.825rem', letterSpacing: '-0.02em' }}>
                          pay<span style={{ color: '#00b9f5' }}>tm</span>
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Paytm for Business (All-in-One Gateway)
                          </p>
                          <span style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            background: 'rgba(0, 185, 245, 0.15)',
                            color: '#00b9f5',
                            border: '1px solid rgba(0, 185, 245, 0.3)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            RECOMMENDED
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Paytm UPI, Google Pay, PhonePe, Paytm Wallet, NetBanking & Cards
                        </p>
                        <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                          Merchant ID: oCtvhv27957773497297 • Instant Delivery
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>0% UPI FEE</span>
                    </div>
                  </div>

                  {/* Option 2: Instant Simulated Card Gateway */}
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

                  {/* Option 3: Razorpay */}
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
                          Razorpay Gateway
                        </p>
                        <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                          Standard Web Checkout (UPI, Cards, NetBanking, Wallets)
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 700 }}>STANDARD CHECKOUT</span>
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
                {isProcessing ? 'Processing Payment...' : paymentProvider === 'razorpay' ? (
                  <>
                    <CreditCard size={18} /> Pay with Razorpay
                  </>
                ) : (
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

      {/* Interactive Paytm Business Checkout Modal */}
      {showPaytmModal && pendingOrder && (
        <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className="modal-container"
            style={{
              maxWidth: '520px',
              width: '95%',
              background: '#090d16',
              border: '1px solid rgba(0, 185, 245, 0.3)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 50px rgba(0, 41, 112, 0.6), 0 0 30px rgba(0, 185, 245, 0.15)',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Paytm Top Brand Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #002970 0%, #001740 100%)',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(0, 185, 245, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '4px 10px',
                  background: '#ffffff',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontWeight: 900, color: '#002970', fontSize: '1rem', letterSpacing: '-0.03em' }}>
                    pay<span style={{ color: '#00b9f5' }}>tm</span>
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>Paytm for Business</span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      VERIFIED
                    </span>
                  </div>
                  <p style={{ fontSize: '0.725rem', color: '#94a3b8', margin: 0 }}>
                    Rollixia • Merchant ID: oCtvhv27957773497297
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPaytmModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Order Price Strip */}
            <div style={{
              background: 'rgba(0, 185, 245, 0.06)',
              padding: '12px 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Order Ref: {pendingOrder.orderNumber}
                </span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                  Digital Goods • Instant Download
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Payable</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00b9f5', margin: 0 }}>
                  {formatCurrency(pendingOrder.totalAmount, currency)}
                </p>
              </div>
            </div>

            {/* Paytm Method Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <button
                type="button"
                onClick={() => setPaytmTab('upi')}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: 'none',
                  border: 'none',
                  borderBottom: paytmTab === 'upi' ? '2px solid #00b9f5' : '2px solid transparent',
                  color: paytmTab === 'upi' ? '#00b9f5' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <QrCode size={16} /> UPI & QR
              </button>
              <button
                type="button"
                onClick={() => setPaytmTab('wallet')}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: 'none',
                  border: 'none',
                  borderBottom: paytmTab === 'wallet' ? '2px solid #00b9f5' : '2px solid transparent',
                  color: paytmTab === 'wallet' ? '#00b9f5' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Wallet size={16} /> Paytm Wallet
              </button>
              <button
                type="button"
                onClick={() => setPaytmTab('cards')}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: 'none',
                  border: 'none',
                  borderBottom: paytmTab === 'cards' ? '2px solid #00b9f5' : '2px solid transparent',
                  color: paytmTab === 'cards' ? '#00b9f5' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CreditCard size={16} /> Cards / NetBanking
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem' }}>
              {/* Tab 1: UPI & QR Code */}
              {paytmTab === 'upi' && (
                <div style={{ textAlign: 'center' }}>
                  {/* Dynamic Stylized QR Box */}
                  <div style={{
                    width: '180px',
                    height: '180px',
                    margin: '0 auto 1.25rem auto',
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '12px',
                    boxShadow: '0 8px 24px rgba(0, 185, 245, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {/* SVG Stylized QR Pattern with Paytm Logo */}
                    <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="#ffffff" />
                      {/* Top-left position block */}
                      <rect x="5" y="5" width="28" height="28" rx="4" fill="#002970" />
                      <rect x="10" y="10" width="18" height="18" rx="2" fill="#ffffff" />
                      <rect x="14" y="14" width="10" height="10" rx="1" fill="#002970" />

                      {/* Top-right position block */}
                      <rect x="67" y="5" width="28" height="28" rx="4" fill="#002970" />
                      <rect x="72" y="10" width="18" height="18" rx="2" fill="#ffffff" />
                      <rect x="76" y="14" width="10" height="10" rx="1" fill="#002970" />

                      {/* Bottom-left position block */}
                      <rect x="5" y="67" width="28" height="28" rx="4" fill="#002970" />
                      <rect x="10" y="72" width="18" height="18" rx="2" fill="#ffffff" />
                      <rect x="14" y="76" width="10" height="10" rx="1" fill="#002970" />

                      {/* QR Matrix Elements */}
                      <rect x="38" y="10" width="6" height="6" rx="1" fill="#002970" />
                      <rect x="48" y="10" width="6" height="6" rx="1" fill="#002970" />
                      <rect x="58" y="10" width="6" height="6" rx="1" fill="#00b9f5" />
                      <rect x="38" y="22" width="12" height="6" rx="1" fill="#002970" />
                      <rect x="54" y="22" width="8" height="6" rx="1" fill="#002970" />

                      <rect x="10" y="38" width="8" height="6" rx="1" fill="#002970" />
                      <rect x="22" y="38" width="10" height="6" rx="1" fill="#00b9f5" />
                      <rect x="36" y="36" width="28" height="28" rx="6" fill="#002970" />
                      <rect x="40" y="40" width="20" height="20" rx="4" fill="#ffffff" />
                      <text x="42" y="54" fontFamily="sans-serif" fontSize="8" fontWeight="900" fill="#00b9f5">paytm</text>

                      <rect x="68" y="38" width="10" height="6" rx="1" fill="#002970" />
                      <rect x="82" y="38" width="8" height="6" rx="1" fill="#002970" />

                      <rect x="38" y="68" width="8" height="8" rx="1" fill="#00b9f5" />
                      <rect x="50" y="68" width="12" height="6" rx="1" fill="#002970" />
                      <rect x="66" y="68" width="8" height="12" rx="1" fill="#002970" />
                      <rect x="78" y="68" width="12" height="8" rx="1" fill="#002970" />
                      <rect x="40" y="80" width="12" height="10" rx="1" fill="#002970" />
                      <rect x="56" y="78" width="6" height="12" rx="1" fill="#00b9f5" />
                      <rect x="66" y="84" width="24" height="6" rx="1" fill="#002970" />
                    </svg>
                  </div>

                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Scan with any UPI App
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Paytm • Google Pay • PhonePe • BHIM • CRED
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OR ENTER UPI ID</span>
                    <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="mobile-number@paytm"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCompletePaytmPayment('UPI_VPA')}
                      disabled={paytmVerifying}
                      className="btn btn-primary"
                      style={{ padding: '0.6rem 1rem', whiteSpace: 'nowrap', background: '#00b9f5', color: '#002970', fontWeight: 800 }}
                    >
                      Verify & Pay
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Paytm Wallet */}
              {paytmTab === 'wallet' && (
                <div>
                  <div style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <Smartphone size={20} color="#00b9f5" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Linked Paytm Mobile
                      </span>
                    </div>
                    <input
                      type="tel"
                      className="form-input"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      style={{ fontSize: '0.9rem' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      An OTP or 1-click authorization will be sent to your registered Paytm mobile number.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Cards / NetBanking */}
              {paytmTab === 'cards' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Supported Cards</span>
                    <span style={{ fontSize: '0.75rem', color: '#00b9f5' }}>Visa • Mastercard • RuPay • Maestro</span>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Top NetBanking</span>
                    <span style={{ fontSize: '0.75rem', color: '#00b9f5' }}>HDFC • SBI • ICICI • Axis • Kotak</span>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => handleCompletePaytmPayment(paytmTab.toUpperCase())}
                disabled={paytmVerifying}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #00b9f5 0%, #0077c5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 900,
                  fontSize: '1rem',
                  letterSpacing: '0.01em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(0, 185, 245, 0.4)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {paytmVerifying ? (
                  <span>Verifying Transaction with Paytm...</span>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Pay {formatCurrency(pendingOrder.totalAmount, currency)} via Paytm</span>
                  </>
                )}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <ShieldCheck size={14} color="#10b981" />
                <span>256-Bit SSL Encrypted • Paytm for Business Verified Portal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
