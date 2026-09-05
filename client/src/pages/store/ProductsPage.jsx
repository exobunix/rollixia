import React, { useState, useEffect } from 'react';
import { ProductCard } from '../../components/store/ProductCard';
import { QuickViewModal } from '../../components/store/QuickViewModal';
import { apiRequest } from '../../utils/api';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { getFallbackProducts, FALLBACK_CATEGORIES } from '../../data/catalogFallbackService.js';

export function ProductsPage({ initialCategory, initialBadge, initialSearch, onNavigate }) {
  const [products, setProducts] = useState(() => {
    const fb = getFallbackProducts(new URLSearchParams({
      ...(initialCategory ? { category: initialCategory } : {}),
      ...(initialBadge ? { badge: initialBadge } : {}),
      ...(initialSearch ? { q: initialSearch } : {})
    }));
    return fb.products || [];
  });
  const [categories, setCategories] = useState(() => FALLBACK_CATEGORIES || []);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [selectedBadge, setSelectedBadge] = useState(initialBadge || '');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewSlug, setQuickViewSlug] = useState(null);

  // Sync props to state if route changes
  useEffect(() => {
    setSelectedCategory(initialCategory || '');
    setSelectedBadge(initialBadge || '');
    setSearchQuery(initialSearch || '');
  }, [initialCategory, initialBadge, initialSearch]);

  useEffect(() => {
    apiRequest('/api/categories').then(data => {
      if (Array.isArray(data) && data.length > 0) setCategories(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedBadge) params.append('badge', selectedBadge);
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (sortBy) params.append('sort', sortBy);
    if (maxPrice < 10000) params.append('max_price', maxPrice);

    apiRequest(`/api/products?${params.toString()}`)
      .then(res => {
        if (res && Array.isArray(res.products) && res.products.length > 0) {
          setProducts(res.products);
        } else {
          const fb = getFallbackProducts(params);
          setProducts(fb.products || []);
        }
      })
      .catch(err => {
        console.warn('API fetch error, using fallback catalog:', err);
        const fb = getFallbackProducts(params);
        setProducts(fb.products || []);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedBadge, searchQuery, sortBy, maxPrice]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBadge('');
    setSearchQuery('');
    setSortBy('popular');
    setMaxPrice(10000);
    if (onNavigate) {
      onNavigate('products');
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="display-title gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', marginBottom: '0.5rem' }}>
            Digital Products Catalog
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Explore premium templates, UI kits, full-stack software, and engineered AI prompt packs.
          </p>
        </div>

        {/* Search & Sort Controls Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem 1.25rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)'
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1,
            minWidth: '240px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 1rem'
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search products by title, tag, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Mobile Filter Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={16} color="var(--text-muted)" />
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', width: 'auto' }}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="btn btn-secondary mobile-filter-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem' }}
            >
              <SlidersHorizontal size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          {/* Desktop Sidebar Filters */}
          <aside className="desktop-filters" style={{ width: '260px', flexShrink: 0 }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              position: 'sticky',
              top: '100px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Filters</h3>
                {(selectedCategory || selectedBadge || searchQuery || maxPrice < 10000) && (
                  <button
                    onClick={resetFilters}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Category
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    onClick={() => setSelectedCategory('')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: selectedCategory === '' ? 700 : 500,
                      background: selectedCategory === '' ? 'var(--primary-light)' : 'transparent',
                      color: selectedCategory === '' ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    All Categories
                  </div>
                  {categories.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: selectedCategory === c.slug ? 700 : 500,
                        background: selectedCategory === c.slug ? 'var(--primary-light)' : 'transparent',
                        color: selectedCategory === c.slug ? 'var(--primary)' : 'var(--text-secondary)',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{c.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.product_count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges Filter */}
              <div style={{ marginBottom: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Collection
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['', 'BESTSELLER', 'TRENDING', 'TOP RATED', 'FREE'].map(b => (
                    <button
                      key={b || 'all'}
                      onClick={() => setSelectedBadge(b)}
                      className="btn btn-sm"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        background: selectedBadge === b ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                        color: selectedBadge === b ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {b || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Max Price
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {maxPrice === 10000 ? 'Any' : `₹${maxPrice.toLocaleString()}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
          </aside>

          {/* Products Grid Area */}
          <main style={{ flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                Loading catalog products...
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No matching products</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  No digital assets match your current search and filter combination.
                </p>
                <button onClick={resetFilters} className="btn btn-primary btn-sm">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Showing {products.length} digital products
                </p>
                <div className="grid-products">
                  {products.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={(slug) => onNavigate('product-detail', { slug })}
                      onQuickView={(prod) => setQuickViewSlug(prod.slug)}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        productSlug={quickViewSlug}
        onClose={() => setQuickViewSlug(null)}
        onNavigateProduct={(slug) => {
          setQuickViewSlug(null);
          onNavigate('product-detail', { slug });
        }}
      />

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="drawer-right" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Filters & Categories</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>Collection</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['', 'BESTSELLER', 'TRENDING', 'TOP RATED', 'FREE'].map(b => (
                    <button
                      key={b || 'all'}
                      onClick={() => setSelectedBadge(b)}
                      className="btn btn-sm"
                      style={{
                        background: selectedBadge === b ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                        color: selectedBadge === b ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      {b || 'All'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-filters { display: none !important; }
        }
        @media (min-width: 861px) {
          .mobile-filter-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
