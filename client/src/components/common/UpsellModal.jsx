import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Clock, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

export function UpsellModal({ isCheckout = true, onScrollToPayment = null }) {
  const { items, cartTotals, couponCode, applyCoupon } = useCart();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1 or 2
  const [activeCoupons, setActiveCoupons] = useState({ step1: null, step2: null });
  const [loading, setLoading] = useState(true);

  // Urgency countdown (10 minutes)
  const [timeLeft, setTimeLeft] = useState(600);

  // Tracking flags
  const step1ShownRef = useRef(false);
  const step1DeclinedRef = useRef(false);
  const step2ShownRef = useRef(false);
  const step2DeclinedRef = useRef(false);
  const isTriggeringRef = useRef(false);

  // Load upselling coupons from server/fallback
  useEffect(() => {
    let isMounted = true;
    async function fetchUpsellCoupons() {
      try {
        const res = await apiRequest('/api/coupons/upsell');
        const list = Array.isArray(res) ? res : (Array.isArray(res?.coupons) ? res.coupons : []);
        if (!isMounted) return;

        // Find active step 1 and step 2 coupons
        const s1 = list.find(c => Number(c.upsell_step) === 1 && (c.is_active === 1 || c.is_active === true));
        const s2 = list.find(c => Number(c.upsell_step) === 2 && (c.is_active === 1 || c.is_active === true));

        // Default fallbacks if none configured
        const finalS1 = s1 || {
          code: 'DEAL10',
          coupon_type: 'upselling',
          upsell_step: 1,
          discount_type: 'percentage',
          discount_value: 10,
          timer_seconds: 30,
          popup_title: 'Wait! Limited Time Deal Only For You 🎁',
          popup_desc: 'Deciding not to purchase? We have an exclusive 10% extra discount waiting for you! Click below to apply instantly.'
        };

        const finalS2 = s2 || {
          code: 'LASTCHANCE15',
          coupon_type: 'upselling',
          upsell_step: 2,
          discount_type: 'percentage',
          discount_value: 15,
          timer_seconds: 30,
          popup_title: '🔥 Final Chance: Additional 15% OFF!',
          popup_desc: 'Here is our absolute best offer: an additional 15% OFF your entire order. Don\'t miss out before your cart expires!'
        };

        setActiveCoupons({ step1: finalS1, step2: finalS2 });
      } catch (err) {
        console.error('Failed to load upsell coupons:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUpsellCoupons();
    return () => { isMounted = false; };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if upsell should show
  const canShowUpsell = () => {
    if (!items || items.length === 0) return false;
    // If user already applied the exact coupon
    if (couponCode && (couponCode === activeCoupons.step1?.code || couponCode === activeCoupons.step2?.code)) {
      return false;
    }
    // Check session storage
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('rollixia_upsell_completed') === 'true') return false;
    }
    return true;
  };

  const triggerModal = (step) => {
    if (isTriggeringRef.current) return;
    if (!canShowUpsell()) return;

    if (step === 1) {
      if (step1ShownRef.current) return;
      step1ShownRef.current = true;
      setCurrentStep(1);
      setIsOpen(true);
    } else if (step === 2) {
      if (step2ShownRef.current) return;
      step2ShownRef.current = true;
      setCurrentStep(2);
      setIsOpen(true);
    }
  };

  // Exit intent and Hold timer listeners
  useEffect(() => {
    if (loading) return;

    // 1. Inactivity / Hold Timer on checkout
    const s1TimerSec = Number(activeCoupons.step1?.timer_seconds) || 30;
    const holdTimer = setTimeout(() => {
      if (!step1ShownRef.current) {
        triggerModal(1);
      } else if (step1DeclinedRef.current && !step2ShownRef.current) {
        triggerModal(2);
      }
    }, s1TimerSec * 1000);

    // 2. Desktop mouse exit intent (cursor leaves viewport top)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 15) {
        if (!step1ShownRef.current) {
          triggerModal(1);
        } else if (step1DeclinedRef.current && !step2ShownRef.current) {
          triggerModal(2);
        }
      }
    };

    // 3. Browser Back / Popstate intent
    const handlePopState = (e) => {
      if (!step1ShownRef.current) {
        window.history.pushState(null, '', window.location.href);
        triggerModal(1);
      } else if (step1DeclinedRef.current && !step2ShownRef.current) {
        window.history.pushState(null, '', window.location.href);
        triggerModal(2);
      }
    };

    // Push state to intercept first back button
    try {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    } catch (e) {}

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(holdTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      try {
        window.removeEventListener('popstate', handlePopState);
      } catch (e) {}
    };
  }, [loading, activeCoupons, items]);

  // Apply upsell coupon automatically and close
  const handleClaimOffer = async () => {
    const targetCoupon = currentStep === 1 ? activeCoupons.step1 : activeCoupons.step2;
    if (!targetCoupon || !targetCoupon.code) return;

    try {
      await applyCoupon(targetCoupon.code);
      try {
        sessionStorage.setItem('rollixia_upsell_completed', 'true');
      } catch (e) {}
      setIsOpen(false);
      addToast(`🎉 ${targetCoupon.discount_value}% Discount automatically applied to your order!`, 'success');

      if (onScrollToPayment) {
        setTimeout(onScrollToPayment, 300);
      } else {
        const payBtn = document.getElementById('checkout-pay-button');
        if (payBtn) payBtn.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to apply deal automatically', 'error');
    }
  };

  // User declines or closes modal
  const handleCloseOrDecline = () => {
    setIsOpen(false);
    if (currentStep === 1) {
      step1DeclinedRef.current = true;
      // After declining step 1, setup step 2 secondary exit trigger
      const s2TimerSec = Number(activeCoupons.step2?.timer_seconds) || 30;
      setTimeout(() => {
        if (!step2ShownRef.current && canShowUpsell()) {
          triggerModal(2);
        }
      }, s2TimerSec * 1000);
    } else {
      step2DeclinedRef.current = true;
      try {
        sessionStorage.setItem('rollixia_upsell_completed', 'true');
      } catch (e) {}
    }
  };

  if (!isOpen) return null;

  const currentCoupon = currentStep === 1 ? activeCoupons.step1 : activeCoupons.step2;
  const isStep2 = currentStep === 2;

  // Estimated savings calculation
  const subtotal = Number(cartTotals?.subtotal || 0);
  const discountVal = Number(currentCoupon?.discount_value || 10);
  const estimatedSavings = currentCoupon?.discount_type === 'percentage'
    ? Math.round((subtotal * discountVal) / 100)
    : discountVal;

  return (
    <div
      className="modal-overlay"
      onClick={handleCloseOrDecline}
      style={{
        zIndex: 99999,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '100%',
          background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
          border: isStep2 ? '2px solid rgba(239, 68, 68, 0.6)' : '2px solid rgba(245, 158, 11, 0.6)',
          borderRadius: '16px',
          boxShadow: isStep2
            ? '0 25px 60px -15px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)'
            : '0 25px 60px -15px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
          padding: '2rem',
          position: 'relative',
          color: '#fff',
          textAlign: 'center',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleCloseOrDecline}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
        >
          <X size={18} />
        </button>

        {/* Step Badge & Countdown Pill */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 12px',
            borderRadius: '20px',
            background: isStep2 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: isStep2 ? '#f87171' : '#fbbf24',
            border: isStep2 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            {isStep2 ? <Sparkles size={13} /> : <Zap size={13} />}
            {isStep2 ? 'Last Chance Offer' : 'Exclusive Deal Just For You'}
          </span>

          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#cbd5e1',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={12} color="#f59e0b" /> {formatTimer(timeLeft)}
          </span>
        </div>

        {/* Headline */}
        <h2 style={{
          fontSize: '1.65rem',
          fontWeight: 900,
          marginBottom: '0.75rem',
          lineHeight: 1.25,
          color: '#fff',
          letterSpacing: '-0.02em'
        }}>
          {currentCoupon?.popup_title || (isStep2 ? 'Final Chance: Additional 15% OFF!' : 'Wait! Limited Time Deal Only For You 🎁')}
        </h2>

        {/* Subtitle / Description */}
        <p style={{
          fontSize: '0.95rem',
          color: '#cbd5e1',
          marginBottom: '1.5rem',
          lineHeight: 1.5,
          padding: '0 0.5rem'
        }}>
          {currentCoupon?.popup_desc || (isStep2
            ? 'We really want you to ship faster with our assets. Take an extra discount applied directly right now!'
            : 'Deciding not to purchase? We have an exclusive extra discount waiting for you. Click below to apply instantly!')}
        </p>

        {/* Discount Highlighting Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px dashed rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Special Promo Code
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isStep2 ? '#f87171' : '#fbbf24', letterSpacing: '0.05em' }}>
              {currentCoupon?.code}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Savings
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399' }}>
              {currentCoupon?.discount_type === 'percentage' ? `${currentCoupon.discount_value}% OFF` : `₹${currentCoupon?.discount_value} OFF`}
              {estimatedSavings > 0 && (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginLeft: '6px' }}>
                  (~{formatCurrency(estimatedSavings)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleClaimOffer}
            style={{
              padding: '14px 20px',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: isStep2
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              boxShadow: isStep2
                ? '0 10px 25px -5px rgba(239, 68, 68, 0.5)'
                : '0 10px 25px -5px rgba(245, 158, 11, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <CheckCircle2 size={18} />
            Claim {currentCoupon?.discount_value}% Discount & Pay with Razorpay
            <ArrowRight size={18} />
          </button>

          <button
            onClick={handleCloseOrDecline}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.825rem',
              cursor: 'pointer',
              padding: '8px',
              transition: 'color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            No thanks, I will pay full price
          </button>
        </div>

        {/* Razorpay Trust Seal */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#10b981" /> 100% Safe Razorpay Checkout
          </span>
          <span>• Instant Digital Download</span>
        </div>
      </div>
    </div>
  );
}
