import React, { useState } from 'react';
import { ShoppingBag, Eye, Heart, Check, Sparkles } from 'lucide-react';
import { Badge, StarRating } from '../common/Badge';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatters';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function ProductCard({ product, onSelect, onQuickView }) {
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const price = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.regular_price;
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.regular_price;
  const discountPercent = hasDiscount ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100) : 0;

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      addToast('Please sign in to add items to your wishlist', 'info');
      return;
    }
    try {
      const res = await apiRequest('/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id })
      });
      setIsWishlisted(res.in_wishlist);
      addToast(res.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative'
      }}
      onClick={() => onSelect(product.slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)'
          }}
        />

        {/* Badge Overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', zIndex: 2 }}>
          {product.badge && <Badge variant={product.badge}>{product.badge}</Badge>}
          {hasDiscount && <span className="badge" style={{ background: '#f43f5e', color: '#fff' }}>-{discountPercent}%</span>}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isWishlisted ? '#f43f5e' : '#ffffff',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'all var(--transition-fast)'
          }}
        >
          <Heart size={16} fill={isWishlisted ? '#f43f5e' : 'none'} />
        </button>

        {/* Hover Quick Action Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(9, 13, 22, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity var(--transition-normal)',
          zIndex: 3
        }}>
          {onQuickView && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="card-quick-view-btn"
            >
              <Eye size={15} /> Quick View
            </button>
          )}
        </div>
      </div>

      {/* Product Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.category_name || product.product_type || 'Digital Asset'}
          </span>
          <StarRating rating={product.rating_avg} reviewCount={product.review_count} size={13} />
        </div>

        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
          marginBottom: '0.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.8rem'
        }}>
          {product.title}
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.short_description}
        </p>

        {/* Pricing & CTA Row */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                {formatCurrency(price, currency)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatCurrency(product.regular_price, currency)}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Commercial License Included
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem' }}
          >
            <ShoppingBag size={15} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
