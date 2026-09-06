import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  ShoppingBag,
  Heart,
  User,
  Shield,
  LifeBuoy,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../utils/api';
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from '../../utils/formatters';
import { downloadEntitledDeliverable } from '../../utils/fileStorage';

export function CustomerDashboardPage({ initialTab = 'orders', onNavigate }) {
  const { user, updateProfile } = useAuth();
  const { currency } = useCurrency();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Support Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState('');

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }

    setLoading(true);
    Promise.all([
      apiRequest('/api/orders/my-orders').catch(() => []),
      apiRequest('/api/downloads/my-downloads').catch(() => []),
      apiRequest('/api/wishlist').catch(() => []),
      apiRequest('/api/support/tickets').catch(() => [])
    ]).then(([ordersData, downloadsData, wishlistData, ticketsData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : (ordersData?.orders || []));
      setDownloads(Array.isArray(downloadsData) ? downloadsData : (downloadsData?.downloads || []));
      setWishlist(Array.isArray(wishlistData) ? wishlistData : (wishlistData?.items || []));
      setTickets(Array.isArray(ticketsData) ? ticketsData : (ticketsData?.tickets || []));
    }).catch(err => {
      console.warn('Dashboard data load fallback:', err);
      setOrders([]);
      setDownloads([]);
      setWishlist([]);
      setTickets([]);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleDownloadFile = async (dl) => {
    await downloadEntitledDeliverable(dl, addToast);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ full_name: fullName });
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
      addToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error');
    }
  };

  const handleOpenTicket = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage })
      });
      addToast('Support ticket created successfully! We will reply promptly.', 'success');
      setTicketSubject('');
      setTicketMessage('');
      const updated = await apiRequest('/api/support/tickets');
      setTickets(updated);
    } catch (err) {
      addToast(err.message || 'Failed to create ticket', 'error');
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicket) return;
    try {
      await apiRequest(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: ticketReply })
      });
      addToast('Reply sent!', 'success');
      setTicketReply('');
      const updated = await apiRequest('/api/support/tickets');
      setTickets(updated);
      setSelectedTicket(updated.find(t => t.id === selectedTicket.id));
    } catch (err) {
      addToast(err.message || 'Failed to send reply', 'error');
    }
  };

  if (!user) return null;

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeDownloads = Array.isArray(downloads) ? downloads : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  return (
    <div style={{ padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2.5rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer Portal
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              Welcome back, {user.full_name}!
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Manage your digital licenses, download version updates, and view your receipts.
            </p>
          </div>

          {/* Quick stats pills */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 18px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{safeOrders.length}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Orders</p>
            </div>
            <div style={{ padding: '10px 18px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{safeDownloads.length}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Downloads</p>
            </div>
            <div style={{ padding: '10px 18px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ec4899' }}>{safeWishlist.length}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wishlist</p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'downloads', label: `My Downloads (${safeDownloads.length})`, icon: <DownloadCloud size={16} /> },
            { id: 'orders', label: `My Orders (${safeOrders.length})`, icon: <ShoppingBag size={16} /> },
            { id: 'wishlist', label: `Wishlist (${safeWishlist.length})`, icon: <Heart size={16} /> },
            { id: 'profile', label: 'Profile & Security', icon: <User size={16} /> },
            { id: 'support', label: `Support Tickets (${safeTickets.length})`, icon: <LifeBuoy size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading dashboard data...
          </div>
        ) : (
          <div>
            {/* 1. MY DOWNLOADS */}
            {activeTab === 'downloads' && (
              <div>
                {safeDownloads.length === 0 ? (
                  <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                    <DownloadCloud size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Downloads Available Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Purchased digital products will automatically appear here with lifetime access.</p>
                    <button onClick={() => onNavigate('products')} className="btn btn-primary btn-sm">
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {safeDownloads.map(dl => (
                      <div
                        key={dl.download_id}
                        className="glass-card"
                        style={{
                          padding: '1.75rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1.5rem',
                          border: dl.has_update ? '1px solid #10b981' : '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          {dl.thumbnail && (
                            <img
                              src={dl.thumbnail}
                              alt={dl.product_title}
                              style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          )}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h3
                                onClick={() => onNavigate('product-detail', { slug: dl.product_slug })}
                                style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}
                              >
                                {dl.product_title}
                              </h3>
                              {dl.has_update && (
                                <span className="badge badge-free" style={{ fontSize: '0.7rem' }}>
                                  UPDATE: v{dl.latest_version}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                              <span>License: <strong style={{ color: 'var(--primary)' }}>{dl.license_name}</strong></span>
                              <span>•</span>
                              <span>Version: <strong>{dl.purchased_version}</strong></span>
                              <span>•</span>
                              <span>Purchased: {formatDate(dl.purchase_date)}</span>
                              <span>•</span>
                              <span>Remaining: <strong style={{ color: dl.downloads_remaining <= 2 ? '#f43f5e' : '#10b981' }}>{dl.downloads_remaining} downloads</strong></span>
                            </div>

                            {dl.has_update && dl.latest_changelog && (
                              <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '6px' }}>
                                <strong>Release Notes:</strong> {dl.latest_changelog}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          {dl.is_limit_reached ? (
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.8rem', color: '#f43f5e', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                Download Limit Reached
                              </span>
                              <button
                                onClick={() => setActiveTab('support')}
                                className="btn btn-secondary btn-sm"
                              >
                                Contact Support
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                              <button
                                onClick={() => handleDownloadFile(dl)}
                                className="btn btn-success"
                                style={{ fontWeight: 700, padding: '0.65rem 1.4rem' }}
                              >
                                <DownloadCloud size={18} /> Download Files
                              </button>
                              {(dl.external_access_url || dl.access_item_url) && (
                                <a
                                  href={dl.external_access_url || dl.access_item_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <ExternalLink size={14} />
                                  <span>
                                    {dl.access_type === 'google_drive'
                                      ? 'Open Google Drive'
                                      : dl.access_type === 'course_access'
                                      ? 'Access Course Portal'
                                      : 'Open Resource Link'}
                                  </span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. MY ORDERS */}
            {activeTab === 'orders' && (
              <div>
                {safeOrders.length === 0 ? (
                  <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                    <ShoppingBag size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Orders Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your purchased orders and invoices will be listed here.</p>
                    <button onClick={() => onNavigate('products')} className="btn btn-primary btn-sm">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {safeOrders.map(o => (
                      <div key={o.id} className="glass-card" style={{ padding: '1.75rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Reference</span>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                              {o.order_number}
                            </h3>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed on</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{formatDate(o.created_at)}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total</span>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{formatCurrency(o.total_amount, currency)}</p>
                          </div>
                          <div>
                            <button
                              onClick={() => onNavigate('order-success', { orderNumber: o.order_number })}
                              className="btn btn-secondary btn-sm"
                            >
                              <FileText size={15} /> View Invoice & Downloads
                            </button>
                          </div>
                        </div>

                        {/* Items */}
                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(Array.isArray(o?.items) ? o.items : []).map(it => (
                            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span>{it.product_title} <em style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({it.license_name})</em></span>
                              <span style={{ fontWeight: 600 }}>{formatCurrency(it.price, currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. WISHLIST */}
            {activeTab === 'wishlist' && (
              <div>
                {safeWishlist.length === 0 ? (
                  <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                    <Heart size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Wishlist is Empty</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Save products you're considering to easily purchase later.</p>
                    <button onClick={() => onNavigate('products')} className="btn btn-primary btn-sm">
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="grid-products">
                    {safeWishlist.map(p => (
                      <div key={p.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                        />
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{p.title}</h4>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginBottom: '1rem' }}>
                          {formatCurrency(p.sale_price !== null ? p.sale_price : p.regular_price, currency)}
                        </span>
                        <button
                          onClick={() => addToCart(p)}
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: 'auto' }}
                        >
                          <ShoppingBag size={16} /> Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. PROFILE & SECURITY */}
            {activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Profile Form */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                    Personal Details
                  </h3>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address (Read-only)</label>
                      <input
                        type="email"
                        disabled
                        className="form-input"
                        value={user.email}
                        style={{ opacity: 0.6 }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save Profile Changes
                    </button>
                  </form>
                </div>

                {/* Password Form */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                    Change Password
                  </h3>
                  <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        required
                        className="form-input"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="form-input"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary btn-sm">
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 5. SUPPORT TICKETS */}
            {activeTab === 'support' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* New Ticket Form */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                    Open a Support Request
                  </h3>
                  <form onSubmit={handleOpenTicket}>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Question regarding React 19 template integration"
                        value={ticketSubject}
                        onChange={e => setTicketSubject(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Describe your question or issue</label>
                      <textarea
                        required
                        className="form-textarea"
                        placeholder="Please include product details or order number..."
                        value={ticketMessage}
                        onChange={e => setTicketMessage(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Submit Ticket
                    </button>
                  </form>
                </div>

                {/* Existing Tickets List & Thread */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                    Ticket History
                  </h3>
                  {safeTickets.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No support tickets filed yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {safeTickets.map(t => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          style={{
                            padding: '12px',
                            background: selectedTicket?.id === t.id ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${selectedTicket?.id === t.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.subject}</strong>
                            <span className="badge" style={{
                              background: t.status === 'open' ? '#f59e0b' : t.status === 'resolved' ? '#10b981' : 'var(--primary)',
                              fontSize: '0.7rem'
                            }}>
                              {t.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Created: {formatDate(t.created_at)} • {t.messages?.length || 0} messages
                          </p>
                        </div>
                      ))}

                      {/* Selected Ticket Conversation Modal/Drawer */}
                      {selectedTicket && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                            Conversation: {selectedTicket.subject}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {selectedTicket.messages?.map(m => (
                              <div
                                key={m.id}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  background: m.sender_role === 'admin' ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface)',
                                  alignSelf: m.sender_role === 'admin' ? 'flex-start' : 'flex-end',
                                  maxWidth: '85%'
                                }}
                              >
                                <p style={{ fontSize: '0.85rem' }}>{m.message}</p>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {m.sender_role === 'admin' ? 'Support Agent' : 'You'}
                                </span>
                              </div>
                            ))}
                          </div>
                          <form onSubmit={handleSendTicketReply} style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Write a reply..."
                              value={ticketReply}
                              onChange={e => setTicketReply(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary btn-sm">Send</button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
