import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShoppingBag, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatters';
import { apiRequest } from '../../utils/api';
import { StarRating } from '../common/Badge';

export function QuickViewModal({ productSlug, onClose, onNavigateProduct }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const { addToCart } = useCart();
  const { currency } = useCurrency();

  useEffect(() => {
    if (!productSlug) return;
    setLoading(true);
    apiRequest(`/api/products/${productSlug}`)
      .then(res => {
        setData(res);
        if (res.licenses && res.licenses.length > 0) {
          setSelectedLicense(res.licenses[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productSlug]);

  if (!productSlug) return null;

  const product = data?.product;
  const price = selectedLicense
    ? selectedLicense.price
    : (product?.sale_price !== null && product?.sale_price !== undefined ? product?.sale_price : product?.regular_price);

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
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading preview...
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
                  src={data.media && data.media[0] ? data.media[0].media_url : product.thumbnail}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {data.media?.slice(0, 4).map((m, idx) => (
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
                {product.category_name}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '6px' }}>
                {product.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <StarRating rating={product.rating_avg} reviewCount={product.review_count} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {product.sales_count} sales</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {product.short_description}
              </p>

              {/* License Selectors */}
              {data.licenses && data.licenses.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Select License:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.licenses.map(lic => (
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
        ) : null}
      </div>
    </div>
  );
}
