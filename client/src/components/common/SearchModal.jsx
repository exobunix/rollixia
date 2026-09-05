import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles, Folder } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatters';

export function SearchModal({ isOpen, onClose, onSelectProduct, onSelectCategory }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ suggestions: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const { currency } = useCurrency();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ suggestions: [], categories: [] });
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const data = await apiRequest(`/api/products/search/suggestions?q=${encodeURIComponent(query.trim())}`);
          setResults(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ suggestions: [], categories: [] });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Search input bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <Search size={22} color="var(--primary)" />
          <input
            autoFocus
            type="text"
            placeholder="Search software, templates, UI kits, AI prompts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: 'var(--text-primary)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
          <kbd style={{
            fontSize: '0.75rem',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--text-muted)'
          }}>
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {loading && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
              Searching catalog...
            </p>
          )}

          {!loading && query.length >= 2 && results.suggestions.length === 0 && results.categories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No matching products found</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try searching for "SaaS", "Flutter", "Notion", or "Figma".</p>
            </div>
          )}

          {/* Matching categories */}
          {results.categories.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Categories
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {results.categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => {
                      onClose();
                      if (onSelectCategory) onSelectCategory(c.slug);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    <Folder size={14} color="var(--primary)" /> {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching products */}
          {results.suggestions.length > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Products
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {results.suggestions.map((p) => (
                  <div
                    key={p.slug}
                    onClick={() => {
                      onClose();
                      if (onSelectProduct) onSelectProduct(p.slug);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface-elevated)')}
                  >
                    {p.thumbnail && (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                        {formatCurrency(p.sale_price !== null ? p.sale_price : p.regular_price, currency)}
                      </span>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick recommendations when query is empty */}
          {query.length < 2 && (
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Popular Searches
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {['SaaS Kit', 'Next.js 15', 'Flutter Fintech', 'AI Prompts', 'Notion OS', '3D Icons'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                  >
                    <Sparkles size={12} color="var(--accent-violet)" /> {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
