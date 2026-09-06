import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Copy,
  Trash2,
  Edit,
  Globe,
  Archive,
  ExternalLink,
  CheckSquare,
  Square
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function AdminProductsPage({ onAddNew, onPreviewProduct, onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const { addToast } = useToast();

  const loadProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter === 'deals') {
      params.append('badge', 'DEAL');
    } else if (statusFilter === 'freebies') {
      params.append('badge', 'FREE');
    } else if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    if (searchQuery.trim()) params.append('q', searchQuery.trim());

    apiRequest(`/api/admin/products?${params.toString()}`)
      .then(res => {
        const list = Array.isArray(res?.products) ? res.products : (Array.isArray(res) ? res : []);
        setProducts(list);
      })
      .catch(err => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [statusFilter, searchQuery]);

  const handleDuplicate = async (id, title) => {
    try {
      await apiRequest(`/api/admin/products/${id}/duplicate`, { method: 'POST' });
      addToast(`Duplicated "${title}" as a draft product!`, 'success');
      loadProducts();
    } catch (err) {
      addToast(err.message || 'Failed to duplicate product', 'error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await apiRequest(`/api/admin/products/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      addToast(`Product marked as ${nextStatus}`, 'success');
      loadProducts();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await apiRequest(`/api/admin/products/${id}`, { method: 'DELETE' });
      addToast(`Deleted "${title}"`, 'info');
      loadProducts();
    } catch (err) {
      addToast('Failed to delete product', 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectedIds.length) return;
    try {
      await apiRequest('/api/admin/products/bulk', {
        method: 'POST',
        body: JSON.stringify({ action, ids: selectedIds })
      });
      addToast(`Bulk ${action} applied to ${selectedIds.length} products`, 'success');
      setSelectedIds([]);
      loadProducts();
    } catch (err) {
      addToast('Bulk action failed', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header & Add Button */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Digital Products Management
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Manage digital licenses, pricing, version updates, and live catalog visibility.
          </p>
        </div>

        <button onClick={onAddNew} className="btn btn-primary">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'var(--bg-surface)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Products' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'deals', label: '🔥 Deals' },
            { id: 'freebies', label: '🎁 Freebies' },
            { id: 'archived', label: 'Archived' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className="btn btn-sm"
              style={{
                background: statusFilter === st.id ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: statusFilter === st.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Bulk Actions if Selected */}
        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedIds.length} selected:</span>
            <button onClick={() => handleBulkAction('publish')} className="btn btn-secondary btn-sm">Publish</button>
            <button onClick={() => handleBulkAction('unpublish')} className="btn btn-secondary btn-sm">Unpublish</button>
            <button onClick={() => handleBulkAction('delete')} className="btn btn-danger btn-sm">Delete</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === safeProducts.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th style={{ padding: '10px' }}>Product</th>
              <th style={{ padding: '10px' }}>Category</th>
              <th style={{ padding: '10px' }}>Price</th>
              <th style={{ padding: '10px' }}>Orders</th>
              <th style={{ padding: '10px' }}>Revenue</th>
              <th style={{ padding: '10px' }}>Rating</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading catalog products...
                </td>
              </tr>
            ) : safeProducts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              safeProducts.map(p => {
                const effectivePrice = p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : p.regular_price;
                const totalRevenue = (p.sales_count || 0) * effectivePrice;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.thumbnail && (
                          <img
                            src={p.thumbnail}
                            alt={p.title}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <strong
                              onClick={() => onEditProduct && onEditProduct(p.id)}
                              style={{ color: 'var(--text-primary)', cursor: 'pointer' }}
                              className="hover-underline"
                            >
                              {p.title}
                            </strong>
                            {p.badge && (
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: p.badge === 'FREE' ? 'rgba(16, 185, 129, 0.2)' : p.badge === 'DEAL' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                color: p.badge === 'FREE' ? '#10b981' : p.badge === 'DEAL' ? '#f43f5e' : '#818cf8',
                                border: '1px solid currentColor'
                              }}>
                                {p.badge === 'FREE' ? '🎁 FREEBIE' : p.badge === 'DEAL' ? '🔥 DEAL' : p.badge}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            SKU: {p.sku} • {p.product_type || 'Digital Resource'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                      {p.category_name}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#10b981' }}>
                      {formatCurrency(effectivePrice)}
                      {p.regular_price > effectivePrice && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                          {formatCurrency(p.regular_price)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                      {p.sales_count || 0}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(totalRevenue)}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {(p.rating_avg || 5.0).toFixed(1)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> ({p.review_count || 0})</span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <button
                        onClick={() => handleToggleStatus(p.id, p.status)}
                        className="badge"
                        style={{
                          background: p.status === 'published' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: p.status === 'published' ? '#10b981' : '#f59e0b',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        title="Click to toggle publish status"
                      >
                        {p.status}
                      </button>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => onEditProduct && onEditProduct(p.id)}
                          className="btn-icon"
                          style={{ color: 'var(--primary)' }}
                          title="Edit in CMS Builder"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onPreviewProduct(p.slug)}
                          className="btn-icon"
                          title="View Live Product Page"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p.id, p.title)}
                          className="btn-icon"
                          title="Duplicate Product"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="btn-icon"
                          style={{ color: '#f43f5e' }}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
