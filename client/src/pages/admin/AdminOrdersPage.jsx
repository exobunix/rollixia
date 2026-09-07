import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Eye,
  X,
  DownloadCloud,
  Send,
  Copy,
  Check,
  Mail,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { downloadEntitledDeliverable } from '../../utils/fileStorage';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Send File Modal state
  const [sendFileModalOpen, setSendFileModalOpen] = useState(false);
  const [sendFileOrder, setSendFileOrder] = useState(null);
  const [sendFileOrderDetails, setSendFileOrderDetails] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedFileId, setSelectedFileId] = useState('all');
  const [customMessage, setCustomMessage] = useState('');
  const [renewWindow, setRenewWindow] = useState(true);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const { addToast } = useToast();

  const loadOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());

    apiRequest(`/api/admin/orders?${params.toString()}`)
      .then(res => {
        const list = Array.isArray(res?.orders) ? res.orders : (Array.isArray(res) ? res : []);
        setOrders(list);
      })
      .catch(err => {
        console.error(err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [searchQuery]);

  const handleOpenOrder = async (id) => {
    setModalLoading(true);
    try {
      const data = await apiRequest(`/api/admin/orders/${id}`);
      setSelectedOrder(data);
    } catch (err) {
      addToast('Failed to load order details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleProcessRefund = async (orderId) => {
    if (!window.confirm('Process refund for this order? This will revoke digital download access.')) return;
    try {
      await apiRequest(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Admin initiated refund' })
      });
      addToast('Order refunded and download tokens revoked', 'info');
      handleOpenOrder(orderId);
      loadOrders();
    } catch (err) {
      addToast(err.message || 'Refund failed', 'error');
    }
  };

  const handleToggleDownloadAccess = async (orderId, enable) => {
    try {
      await apiRequest(`/api/admin/orders/${orderId}/downloads`, {
        method: 'PATCH',
        body: JSON.stringify({ enable })
      });
      addToast(enable ? 'Download access renewed for 48 hours' : 'Download access revoked', 'success');
      handleOpenOrder(orderId);
    } catch (err) {
      addToast('Failed to update download access', 'error');
    }
  };

  // Open the Send Product File modal
  const handleOpenSendFileModal = async (orderOrDetails, preselectedDownload = null) => {
    const rawOrder = orderOrDetails.order || orderOrDetails;
    setSendFileOrder(rawOrder);
    setRecipientEmail(rawOrder.customer_email || '');
    setCustomMessage('');
    setRenewWindow(true);
    setSelectedFileId(preselectedDownload ? String(preselectedDownload.id) : 'all');

    // If we already have items & downloads from selectedOrder
    if (orderOrDetails.items && orderOrDetails.downloads) {
      setSendFileOrderDetails(orderOrDetails);
      setSendFileModalOpen(true);
    } else {
      // Fetch full order data if opening from table row
      try {
        const full = await apiRequest(`/api/admin/orders/${rawOrder.id}`);
        setSendFileOrderDetails(full);
      } catch (e) {
        // Fallback placeholder structure
        setSendFileOrderDetails({
          order: rawOrder,
          items: [{ product_title: 'Digital Asset Package' }],
          downloads: [{
            id: 1,
            product_title: 'Digital Asset Package',
            file_name: 'deliverable-package.zip',
            token: `TOKEN_${rawOrder.id}`
          }]
        });
      }
      setSendFileModalOpen(true);
    }
  };

  // Send the product file deliverable
  const handleSendProductFile = async () => {
    if (!recipientEmail || !recipientEmail.trim()) {
      addToast('Please enter a valid recipient email address', 'error');
      return;
    }

    const orderId = sendFileOrder?.id;
    if (!orderId) return;

    setIsSendingFile(true);
    try {
      const payload = {
        recipientEmail: recipientEmail.trim(),
        productFileId: selectedFileId,
        customMessage: customMessage.trim(),
        renewWindow
      };

      const res = await apiRequest(`/api/admin/orders/${orderId}/send-file`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      addToast(res?.message || `Product file successfully sent to ${recipientEmail}!`, 'success');
      setSendFileModalOpen(false);

      // Refresh order view if modal is open
      if (selectedOrder && selectedOrder.order?.id === orderId) {
        handleOpenOrder(orderId);
      }
      loadOrders();
    } catch (err) {
      addToast(err.message || 'Failed to send product file deliverable', 'error');
    } finally {
      setIsSendingFile(false);
    }
  };

  // Direct client file download by admin
  const handleDirectDownload = async (dl) => {
    if (!dl) return;
    try {
      await downloadEntitledDeliverable(dl, addToast);
    } catch (e) {
      addToast('Failed to trigger direct download', 'error');
    }
  };

  // Copy direct secure download link
  const handleCopyDownloadLink = (dl) => {
    if (!dl) return;
    const token = dl.token || 'SECURE_TOKEN';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rollixia.com';
    const directUrl = `${origin}/api/downloads/file/${token}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(directUrl)
        .then(() => {
          setCopiedId(dl.id);
          addToast('Secure download link copied to clipboard!', 'success');
          setTimeout(() => setCopiedId(null), 2500);
        })
        .catch(() => {
          addToast(directUrl, 'info');
        });
    } else {
      addToast(directUrl, 'info');
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Order Management & Audits
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Review customer purchase history, manage tokenized deliverables, and send product files to buyers.
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '1.5rem',
        background: 'var(--bg-surface)',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        maxWidth: '400px'
      }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search by Order #, Customer, or Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.875rem', width: '100%' }}
        />
      </div>

      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px' }}>Order #</th>
              <th style={{ padding: '10px' }}>Customer</th>
              <th style={{ padding: '10px' }}>Items</th>
              <th style={{ padding: '10px' }}>Total Amount</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders...</td></tr>
            ) : safeOrders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders match criteria.</td></tr>
            ) : (
              safeOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--primary)' }}>
                    {o.order_number}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{o.customer_name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_email}</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    {o.item_count} items
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#10b981' }}>
                    {formatCurrency(o.total_amount)}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge" style={{
                      background: o.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : o.payment_status === 'refunded' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: o.payment_status === 'paid' ? '#10b981' : o.payment_status === 'refunded' ? '#f43f5e' : '#f59e0b'
                    }}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {formatDateTime(o.created_at)}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleOpenSendFileModal(o)}
                      className="btn btn-primary btn-sm"
                      style={{ marginRight: '6px', padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      title="Send Product File to Customer"
                    >
                      <Send size={13} /> Send File
                    </button>
                    <button
                      onClick={() => handleOpenOrder(o.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Eye size={13} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER DETAILS</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {selectedOrder.order.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer & Txn Box */}
            <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <p><strong>Customer:</strong> {selectedOrder.order.customer_name} ({selectedOrder.order.customer_email})</p>
              <p><strong>Payment Txn ID:</strong> {selectedOrder.order.payment_id || 'Instant Access'}</p>
              <p><strong>Gateway Provider:</strong> {selectedOrder.order.payment_provider?.toUpperCase() || 'INSTANT ACCESS'}</p>
              <p><strong>Order Timestamp:</strong> {formatDateTime(selectedOrder.order.created_at)}</p>
            </div>

            {/* Items */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Purchased Digital Assets</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {selectedOrder.items?.map(it => (
                <div key={it.id || it.product_title} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '6px', fontSize: '0.875rem' }}>
                  <div>
                    <strong>{it.product_title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({it.license_name || 'Standard License'})</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(it.price)}</span>
                </div>
              ))}
            </div>

            {/* Downloads status with Direct Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Download Entitlements & Files</h4>
              <button
                onClick={() => handleOpenSendFileModal(selectedOrder)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Send size={13} /> Send File to Customer
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
              {selectedOrder.downloads && selectedOrder.downloads.length > 0 ? (
                selectedOrder.downloads.map(dl => (
                  <div
                    key={dl.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {dl.product_title || 'Digital Product Package'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{dl.file_name || 'deliverable.zip'}</span>
                        <span>•</span>
                        <span>Downloaded {dl.download_count ?? 0} / {dl.max_downloads ?? 10} times</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleDirectDownload(dl)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 9px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Download file directly to computer"
                      >
                        <DownloadCloud size={13} /> Download
                      </button>
                      <button
                        onClick={() => handleCopyDownloadLink(dl)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 9px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Copy secure direct download link"
                      >
                        {copiedId === dl.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        {copiedId === dl.id ? 'Copied' : 'Link'}
                      </button>
                      <button
                        onClick={() => handleOpenSendFileModal(selectedOrder, dl)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '5px 9px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Send this product file to customer email"
                      >
                        <Send size={13} /> Send
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-surface-elevated)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  No active file entitlement records found for this order.
                  <button
                    onClick={() => handleOpenSendFileModal(selectedOrder)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '10px' }}
                  >
                    <Send size={13} /> Generate & Send Deliverable
                  </button>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleOpenSendFileModal(selectedOrder)}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} /> Send Product File
                </button>
                <button
                  onClick={() => handleToggleDownloadAccess(selectedOrder.order.id, true)}
                  className="btn btn-secondary btn-sm"
                >
                  Renew Download Window
                </button>
                <button
                  onClick={() => handleToggleDownloadAccess(selectedOrder.order.id, false)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#f43f5e' }}
                >
                  Suspend Access
                </button>
              </div>

              {selectedOrder.order.payment_status === 'paid' && (
                <button
                  onClick={() => handleProcessRefund(selectedOrder.order.id)}
                  className="btn btn-danger btn-sm"
                >
                  <RotateCcw size={14} /> Process Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Product File Modal */}
      {sendFileModalOpen && sendFileOrder && (
        <div className="modal-overlay" onClick={() => !isSendingFile && setSendFileModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Send size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Send Product File
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Order: <strong style={{ color: 'var(--primary)' }}>{sendFileOrder.order_number}</strong> • Customer: {sendFileOrder.customer_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSendFileModalOpen(false)}
                disabled={isSendingFile}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {/* Recipient Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Deliver to Email Address:
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="customer@example.com"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      width: '100%'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Secure download tokens and product access links will be delivered here.
                </span>
              </div>

              {/* Product Deliverable Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Select Deliverable File Package:
                </label>
                <select
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">📦 All Purchased Assets in Order</option>
                  {sendFileOrderDetails?.downloads?.map(dl => (
                    <option key={dl.id} value={dl.id}>
                      {dl.product_title || 'Deliverable'} — {dl.file_name}
                    </option>
                  ))}
                  {(!sendFileOrderDetails?.downloads || sendFileOrderDetails.downloads.length === 0) && (
                    <option value="1">Apex — Enterprise SaaS Next.js 14 Template (apex-saas-dashboard-v2.1.0.zip)</option>
                  )}
                </select>
              </div>

              {/* Custom Admin Note */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Personal Note or Delivery Instructions (Optional):
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g., Thank you for your purchase! Attached is your licensed production zip and verified commercial license documentation."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Options Toggles */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                borderRadius: '8px',
                padding: '12px 14px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={renewWindow}
                    onChange={(e) => setRenewWindow(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>Automatically renew / reset 48-hour secure download window</span>
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck size={14} color="#10b981" /> Includes verified commercial license credentials and file manifest.
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {sendFileOrderDetails?.downloads?.[0] && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDirectDownload(sendFileOrderDetails.downloads[0])}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      title="Directly download file to your computer"
                    >
                      <DownloadCloud size={14} /> Download File
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyDownloadLink(sendFileOrderDetails.downloads[0])}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      title="Copy download link to clipboard"
                    >
                      <Copy size={14} /> Copy Link
                    </button>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSendFileModalOpen(false)}
                  disabled={isSendingFile}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendProductFile}
                  disabled={isSendingFile}
                  className="btn btn-primary btn-sm"
                  style={{
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px'
                  }}
                >
                  <Send size={14} />
                  {isSendingFile ? 'Sending Deliverable...' : 'Send Product File'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

