import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShoppingBag, ExternalLink, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatters';
import { apiRequest } from '../../utils/api';
import { StarRating } from '../common/Badge';
import { getFallbackProductBySlug } from '../../data/catalogFallbackService.js';

export function QuickViewModal({ productSlug, onClose, onNavigateProduct }) {
  const slug = typeof productSlug === 'object' ? productSlug?.slug : productSlug;
  const normalizedSlug = slug ? decodeURIComponent(String(slug)).trim() : '';
  const initialFallback = normalizedSlug ? getFallbackProductBySlug(normalizedSlug) : null;

  const [data, setData] = useState(() => initialFallback);
  const [loading, setLoading] = useState(() => !initialFallback);
  const [selectedLicense, setSelectedLicense] = useState(() => {
    const lics = initialFallback?.licenses || initialFallback?.product?.licenses || [];
    return lics.length > 0 ? lics[0] : null;
  });

  const { addToCart } = useCart();
  const { currency } = useCurrency();

  useEffect(() => {
    if (!normalizedSlug) return;

    const local = getFallbackProductBySlug(normalizedSlug);
    if (local) {
      setData(local);
      const lics = local.licenses || [];
      if (lics.length > 0) {
        setSelectedLicense(lics[0]);
      }
      setLoading(false);
    } else if (!data) {
      setLoading(true);
    }

    apiRequest(`/api/products/${encodeURIComponent(normalizedSlug)}`)
      .then(res => {
        if (res && (res.product || res.id)) {
          setData(res);
          const lics = res.licenses || res.product?.licenses || [];
          if (lics.length > 0) {
            setSelectedLicense(lics[0]);
          }
        }
      })
      .catch(err => {
        console.error('Quick view error:', err);
        if (local) {
          setData(local);
        }
      })
      .finally(() => setLoading(false));
  }, [normalizedSlug]);

  if (!productSlug) return null;

  const product = data?.product || (data?.id ? data : null);
  const media = data?.media || product?.media || [];
  const licenses = data?.licenses || product?.licenses || [];
  const price = selectedLicense
    ? selectedLicense.price
    : (product?.sale_price !== null && product?.sale_price !== undefined ? product?.sale_price : product?.regular_price);

  const mainImageUrl = (media[0] && media[0].media_url) || product?.thumbnail || product?.hero_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '840px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite'
            }} />
            Loading quick preview...
          </div>
        ) : product ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            padding: '1.5rem 2rem 2.5rem 2rem'
          }}>
            {/* Gallery / Image */}
            <div>
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem', background: '#020617', width: '100%', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={mainImageUrl}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {media.slice(0, 4).map((m, idx) => (
                  <img
                    key={idx}
                    src={m.media_url}
                    alt="Thumbnail"
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                  />
                ))}
              </div>
            </div>

            {/* Product Details & Purchase */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {product.category_name || product.product_type || 'Digital Product'}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '6px' }}>
                {product.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <StarRating rating={product.rating_avg} reviewCount={product.review_count} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {product.sales_count || 0} sales</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {product.short_description}
              </p>

              {/* License Selectors */}
              {licenses.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Select License:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {licenses.map(lic => (
                      <div
                        key={lic.id}
                        onClick={() => setSelectedLicense(lic)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${selectedLicense?.id === lic.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                          background: selectedLicense?.id === lic.id ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{lic.license_name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lic.description}</p>
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
                          {formatCurrency(lic.price, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Actions */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Price</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                    {formatCurrency(price, currency)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      addToCart(product, selectedLicense);
                      onClose();
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.8rem', fontWeight: 700 }}
                  >
                    <ShoppingBag size={18} /> Add to Cart
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateProduct) onNavigateProduct(product.slug);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.8rem 1rem' }}
                    title="View Full Sales Page"
                  >
                    Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: 'var(--accent-rose)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Preview Not Available
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This product details could not be previewed at this time.
            </p>
            <button onClick={onClose} className="btn btn-primary">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
