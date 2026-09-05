import React, { useState, useEffect } from 'react';
import { Star, Check, X, Pin, Trash2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { addToast } = useToast();

  const loadReviews = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.append('status', statusFilter);

    apiRequest(`/api/admin/reviews?${params.toString()}`)
      .then(res => setReviews(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiRequest(`/api/admin/reviews/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      addToast(`Review marked as ${status}`, 'success');
      loadReviews();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleToggleFeatured = async (id, currentVal) => {
    try {
      await apiRequest(`/api/admin/reviews/${id}/feature`, {
        method: 'PATCH',
        body: JSON.stringify({ is_featured: !currentVal })
      });
      addToast(!currentVal ? 'Review featured on sales page!' : 'Unfeatured review', 'success');
      loadReviews();
    } catch (err) {
      addToast('Failed to feature review', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this review?')) return;
    try {
      await apiRequest(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      addToast('Review deleted', 'info');
      loadReviews();
    } catch (err) {
      addToast('Failed to delete review', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Review Moderation Queue
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Verify customer testimonials, approve feedback, and pin high-converting reviews to the storefront.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {['all', 'approved', 'pending', 'rejected'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className="btn btn-sm"
            style={{
              background: statusFilter === st ? 'var(--primary)' : 'var(--bg-surface-elevated)',
              color: statusFilter === st ? '#fff' : 'var(--text-secondary)',
              textTransform: 'capitalize'
            }}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px' }}>Product</th>
              <th style={{ padding: '10px' }}>Rating</th>
              <th style={{ padding: '10px' }}>Review Content</th>
              <th style={{ padding: '10px' }}>Author</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No reviews in moderation queue.</td></tr>
            ) : (
              reviews.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '180px' }}>
                    {r.product_title}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#f59e0b', fontWeight: 700 }}>
                    {'★'.repeat(r.rating)} ({r.rating})
                  </td>
                  <td style={{ padding: '12px 10px', maxWidth: '300px' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.9rem' }}>{r.title}</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{r.comment}</p>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.author_name || 'Buyer'}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(r.created_at)}</span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge" style={{
                      background: r.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : r.status === 'rejected' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: r.status === 'approved' ? '#10b981' : r.status === 'rejected' ? '#f43f5e' : '#f59e0b'
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleToggleFeatured(r.id, r.is_featured)}
                        className="btn-icon"
                        title={r.is_featured ? 'Unpin from featured' : 'Pin to featured'}
                        style={{ color: r.is_featured ? '#f59e0b' : 'inherit' }}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'approved')}
                        className="btn-icon"
                        style={{ color: '#10b981' }}
                        title="Approve Review"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'rejected')}
                        className="btn-icon"
                        style={{ color: '#f43f5e' }}
                        title="Reject Review"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="btn-icon"
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
