import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, DownloadCloud, FileText, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';

export function OrderSuccessPage({ orderNumber, onNavigate }) {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();

  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (orderNumber) {
      apiRequest(`/api/orders/${orderNumber}`)
        .then(res => setOrderData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Retrieving your verified order details and secure download tokens...
      </div>
    );
  }

  if (!orderData || !orderData.order) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>Order Not Found</h2>
        <button onClick={() => onNavigate('home')} className="btn btn-primary">Return Home</button>
      </div>
    );
  }

  const { order, items = [], downloads = [] } = orderData;

  const handleDownload = (token, fileName) => {
    // Open secure token download URL directly
    window.location.href = `/api/downloads/file/${token}`;
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div style={{ padding: '4rem 0 7rem 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Success Banner */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          padding: '2rem 1rem'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle2 size={40} color="#10b981" />
          </div>

          <h1 className="display-title gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>
            Payment Verified & Access Granted!
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
            Thank you, <strong>{order.customer_name}</strong>! Your digital products are prepared and ready for immediate download.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-bright)',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.95rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Reference:</span>
            <strong style={{ color: 'var(--primary)', letterSpacing: '0.05em' }}>{order.order_number}</strong>
          </div>
        </div>

        {/* Digital Downloads Vault Card */}
        <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2.5rem', border: '1px solid var(--border-bright)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Your Digital Downloads
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Direct cryptographic token download access (Valid 48 hours).
              </p>
            </div>
            <span className="badge badge-free">Instant Delivery</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {downloads.map(dl => (
              <div
                key={dl.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {dl.product_title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Version: <strong style={{ color: 'var(--primary)' }}>{dl.version}</strong></span>
                    <span>•</span>
                    <span>File: {dl.file_name}</span>
                    <span>•</span>
                    <span>Size: {formatFileSize(dl.file_size)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(dl.token, dl.file_name)}
                  className="btn btn-success"
                  style={{ fontWeight: 700, padding: '0.65rem 1.25rem' }}
                >
                  <DownloadCloud size={18} /> Download Now
                </button>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '1.5rem',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.1)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <span>Files are permanently archived in your account. You can re-download at any time from your Customer Dashboard.</span>
          </div>
        </div>

        {/* Invoice & Order Summary Card (Printable) */}
        <div className="glass-card invoice-box" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>TAX INVOICE</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rollixia Global Marketplace</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>support@rollixia.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={handlePrintInvoice} className="btn btn-secondary btn-sm" style={{ marginBottom: '6px' }}>
                <Printer size={15} /> Print / Save Invoice
              </button>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {formatDateTime(order.created_at)}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Billed To:</p>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{order.customer_name}</p>
              <p style={{ color: 'var(--text-secondary)' }}>{order.customer_email}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Payment Details:</p>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Provider: {order.payment_provider?.toUpperCase()}</p>
              <p style={{ color: 'var(--text-secondary)' }}>Txn: {order.payment_id || 'Instant Access Verified'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '1rem 0', marginBottom: '1.5rem' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{item.product_title}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({item.license_name})</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(item.price, currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Total Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', maxWidth: '300px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal, currency)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <span>Discount:</span>
                <span>-{formatCurrency(order.discount_amount, currency)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>GST (18%):</span>
              <span>{formatCurrency(order.tax_amount, currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem', color: '#10b981', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
              <span>Total Paid:</span>
              <span>{formatCurrency(order.total_amount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('dashboard', { tab: 'downloads' })}
            className="btn btn-primary btn-lg"
          >
            Go to Customer Dashboard <ArrowRight size={18} />
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="btn btn-secondary btn-lg"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
