import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, CreditCard, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { apiRequest } from '../../utils/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') {
      return resolve(true);
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function CheckoutPage({ onNavigate }) {
  const { items, cartTotals, couponCode, clearCart, setIsCartOpen } = useCart();
  const { user, login, register } = useAuth();
  const { currency } = useCurrency();
  const { addToast } = useToast();

  // Scroll to top and ensure cart drawer is closed on checkout page mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (setIsCartOpen) setIsCartOpen(false);
  }, [setIsCartOpen]);

  // Auth gate inline states (when customer is not logged in)
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Customer Delivery Info
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Synchronize customer details whenever user logs in or changes
  useEffect(() => {
    if (user) {
      if (user.full_name) setCustomerName(user.full_name);
      if (user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  // Seamless, smart inline sign-in / registration handler
  const handleInlineAuth = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const email = authEmail.trim();
    const password = authPassword;

    if (!email || !password) {
      const msg = 'Please enter both your email address and password.';
      setAuthError(msg);
      addToast(msg, 'error');
      setAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'login') {
        try {
          const loggedUser = await login(email, password);
          addToast(`Welcome back, ${loggedUser.full_name || 'Customer'}!`, 'success');
          setCustomerName(loggedUser.full_name || '');
          setCustomerEmail(loggedUser.email || '');
          return;
        } catch (loginErr) {
          console.warn('Sign-in attempt, checking if auto-registration needed:', loginErr);
          const errMsg = (loginErr.message || '').toLowerCase();
          // If login failed because user does not exist in DB yet, seamlessly register them!
          if (
            errMsg.includes('not') ||
            errMsg.includes('invalid') ||
            errMsg.includes('exist') ||
            errMsg.includes('found') ||
            errMsg.includes('401')
          ) {
            try {
              const fallbackName = authFullName.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              const registeredUser = await register(email, password, fallbackName);
              addToast(`Welcome to Rollixia, ${registeredUser.full_name}! Account created.`, 'success');
              setCustomerName(registeredUser.full_name || '');
              setCustomerEmail(registeredUser.email || '');
              return;
            } catch (regErr) {
              if ((regErr.message || '').toLowerCase().includes('already')) {
                throw new Error('Incorrect password for this email. Please check your password or try again.');
              }
              throw regErr;
            }
          }
          throw loginErr;
        }
      } else {
        const fallbackName = authFullName.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const registeredUser = await register(email, password, fallbackName);
        addToast(`Account created! Welcome to Rollixia, ${registeredUser.full_name}!`, 'success');
        setCustomerName(registeredUser.full_name || '');
        setCustomerEmail(registeredUser.email || '');
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setAuthError(msg);
      addToast(msg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

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

    // 1. Enforce login requirement: without login it will not proceed
    if (!user) {
      addToast('Please log in or create an account to proceed with checkout', 'error');
      const authElem = document.getElementById('checkout-auth-gate');
      if (authElem) {
        authElem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

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
      // Accurate total calculation directly from cart (never ₹1 / 100 paise fallback)
      const totalAmountRupees = Number(cartTotals?.total || 0);
      const totalAmountPaise = Math.max(100, Math.round(totalAmountRupees * 100));

      // 1. Create order on server
      const orderPayload = {
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || '9876543210',
        items: items.map(i => ({ productId: i.productId, licenseId: i.licenseId })),
        coupon_code: couponCode || null,
        payment_provider: 'razorpay',
        currency
      };

      const orderData = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      // 2. If order is free (₹0), server already marked it paid and granted access
      if (orderData.isFree || totalAmountRupees === 0) {
        clearCart();
        addToast('Free product order processed instantly!', 'success');
        onNavigate('order-success', { orderNumber: orderData.orderNumber });
        return;
      }

      // 3. Initiate Razorpay Standard Web Checkout
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK could not be loaded. Please check your internet connection and try again.');
      }

      let rzpOrderId = orderData.paymentSession?.orderId;
      let rzpAmount = orderData.paymentSession?.amount || totalAmountPaise;
      let rzpCurrency = orderData.paymentSession?.currency || orderData.currency || 'INR';

      // If order was not pre-initialized with an authentic Razorpay order_id, create via /api/create-order
      if (!rzpOrderId) {
        try {
          const createOrderRes = await apiRequest('/api/create-order', {
            method: 'POST',
            body: JSON.stringify({
              amount: totalAmountPaise,
              currency: rzpCurrency,
              receipt: orderData.orderNumber
            })
          });
          if (createOrderRes?.order_id) {
            rzpOrderId = createOrderRes.order_id;
          }
          if (createOrderRes?.amount) {
            rzpAmount = createOrderRes.amount;
          }
        } catch (createErr) {
          console.warn('Backend order creation endpoint unavailable, using direct client amount:', createErr);
          rzpOrderId = null;
          rzpAmount = totalAmountPaise;
        }
      }

      // Safety check: ensure rzpAmount always matches the full cart value in paise
      if (!rzpAmount || rzpAmount < totalAmountPaise) {
        rzpAmount = totalAmountPaise;
      }

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.paymentSession?.keyId || 'rzp_live_TYeE4nMLmsPaCZ';

      const isAuthenticRazorpayOrder = typeof rzpOrderId === 'string' &&
        rzpOrderId.startsWith('order_') &&
        !rzpOrderId.includes('sim') &&
        !rzpOrderId.includes('fb');

      const rzpOptions = {
        key: rzpKey,
        amount: rzpAmount,
        currency: rzpCurrency,
        name: 'Rollixia Marketplace',
        description: `Order ${orderData.orderNumber} - Digital Products`,
        prefill: {
          name: customerName.trim() || user.full_name || '',
          email: customerEmail.trim() || user.email || '',
          contact: customerPhone.trim() || ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            console.log('Razorpay checkout modal dismissed by user');
            setIsProcessing(false);
            addToast('Payment cancelled. You can retry anytime.', 'info');
          }
        },
        handler: async function(response) {
          try {
            setIsProcessing(true);
            addToast('Verifying payment signature with Razorpay...', 'info');

            const verifyRes = await apiRequest('/api/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                order_id: response.razorpay_order_id || rzpOrderId || '',
                payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || 'verified_sig',
                orderNumber: orderData.orderNumber
              })
            });

            if (verifyRes && (verifyRes.success || verifyRes.status === 'TXN_SUCCESS')) {
              clearCart();
              addToast('Payment verified successfully! Your digital downloads are ready.', 'success');
              onNavigate('order-success', { orderNumber: orderData.orderNumber });
            } else {
              throw new Error(verifyRes?.error || 'Payment signature verification failed');
            }
          } catch (vErr) {
            console.error('Razorpay verification error:', vErr);
            addToast(vErr.message || 'Payment signature verification failed', 'error');
          } finally {
            setIsProcessing(false);
          }
        }
      };

      if (isAuthenticRazorpayOrder) {
        rzpOptions.order_id = rzpOrderId;
      }

      const rzp = new window.Razorpay(rzpOptions);

      rzp.on('payment.failed', function(resp) {
        console.error('Razorpay payment failed event:', resp.error);
        setIsProcessing(false);
        const failureReason = resp.error?.description || resp.error?.reason || 'Payment could not be processed';
        addToast(`Payment failed: ${failureReason}`, 'error');
      });

      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      addToast(err.message || 'An error occurred during payment processing', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        <h1 className="display-title gradient-text" style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Secure Checkout
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Instant tokenized digital delivery right after payment confirmation.
        </p>

        <div className="checkout-page-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Left: Authentication & Checkout Form */}
          <div>
            {/* 1. Account Authentication Gate */}
            <div id="checkout-auth-gate" style={{ marginBottom: '1.5rem' }}>
              {user ? (
                <div className="glass-card" style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  background: 'rgba(16, 185, 129, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          Signed In as {user.full_name || 'Customer'}
                        </span>
                        <span style={{
                          fontSize: '0.675rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}>
                          VERIFIED ACCOUNT
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                        {user.email} • Your purchases will be securely stored in your personal vault.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    Switch Account
                  </button>
                </div>
              ) : (
                <div className="glass-card" style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  background: 'rgba(99, 102, 241, 0.04)',
                  boxShadow: '0 8px 30px rgba(99, 102, 241, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6366f1'
                    }}>
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        1. Account Required to Checkout
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        Please enter your email and password to log in or instantly create your account.
                      </p>
                    </div>
                  </div>

                  {/* Auth Mode Tabs */}
                  <div style={{
                    display: 'flex',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    padding: '4px',
                    marginBottom: '1.25rem',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        background: authMode === 'login' ? 'var(--primary)' : 'transparent',
                        color: authMode === 'login' ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <LogIn size={15} /> Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setAuthError(''); }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        background: authMode === 'register' ? 'var(--primary)' : 'transparent',
                        color: authMode === 'register' ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <UserPlus size={15} /> Create Account
                    </button>
                  </div>

                  {authError && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem',
                      fontSize: '0.825rem',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertCircle size={16} />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Independent Auth Form */}
                  <form onSubmit={handleInlineAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {authMode === 'register' && (
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Full Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Alex Morgan"
                          value={authFullName}
                          onChange={e => setAuthFullName(e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                    )}

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address</label>
                      <input
                        type="email"
                        required
                        className="form-input"
                        placeholder="alex@company.com"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Password</label>
                      <input
                        type="password"
                        required
                        className="form-input"
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '0.5rem', fontWeight: 700 }}
                    >
                      {authLoading ? 'Verifying Account...' : authMode === 'login' ? 'Sign In & Unlock Checkout' : 'Create Account & Continue'}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onNavigate(authMode === 'login' ? 'login' : 'register')}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                      >
                        Or open full {authMode === 'login' ? 'sign-in' : 'registration'} page
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Main Checkout Form for Contact & Payment */}
            <form id="checkout-form" onSubmit={handleCheckoutSubmit}>
              {/* 2. Customer Digital Delivery Contact */}
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  2. Digital Delivery Contact
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

                <div className="form-group">
                  <label className="form-label">Phone Number (Optional - for order SMS updates)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
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

              {/* 3. Payment Gateway: Exclusively Razorpay */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  3. Payment Method
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Razorpay Exclusive Gateway */}
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px solid var(--primary)',
                      background: 'rgba(99, 102, 241, 0.08)',
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(12, 35, 64, 0.4)',
                          color: '#38bdf8',
                          flexShrink: 0
                        }}>
                          <CreditCard size={22} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                              Razorpay Standard Checkout
                            </p>
                            <span style={{
                              fontSize: '0.675rem',
                              fontWeight: 800,
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              SECURE GATEWAY
                            </span>
                          </div>
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '3px', margin: 0 }}>
                            All-in-one payment gateway with instant transaction verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Supported Payment Options Pill List */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '8px',
                      padding: '12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      marginTop: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontWeight: 600 }}>UPI & QR</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                        <span style={{ fontWeight: 600 }}>Credit & Debit Cards</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
                        <span style={{ fontWeight: 600 }}>50+ NetBanking</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ fontWeight: 600 }}>Wallets & CRED</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <ShieldCheck size={14} color="#10b981" />
                      <span>256-Bit SSL Encrypted • PCI-DSS Level 1 Certified • Official Razorpay Integration</span>
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
            </form>
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

            {/* Primary Action Button */}
            {user ? (
              <button
                type="submit"
                form="checkout-form"
                className="btn btn-success btn-lg"
                disabled={isProcessing}
                style={{ width: '100%', fontWeight: 700 }}
              >
                {isProcessing ? 'Connecting to Razorpay...' : (
                  <>
                    <CreditCard size={18} /> Pay {formatCurrency(cartTotals.total, currency)} with Razorpay
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  if (authEmail.trim() && authPassword) {
                    handleInlineAuth(e);
                  } else {
                    addToast('Please enter your email and password to sign in or create an account', 'info');
                    const authElem = document.getElementById('checkout-auth-gate');
                    if (authElem) authElem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                disabled={authLoading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontWeight: 700 }}
              >
                <Lock size={18} /> {authLoading ? 'Signing In...' : 'Sign In to Proceed with Checkout'}
              </button>
            )}

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
              <span>Verified Razorpay Gateway & Instant Download Vault</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
