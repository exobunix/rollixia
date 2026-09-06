import React, { useState, useEffect } from 'react';
import { Sliders, Save, Store, Globe, Shield, CheckCircle2, CreditCard, ExternalLink } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export function AdminSettingsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    store_name: 'Rollixia Marketplace',
    tagline: 'World-Class Digital Assets, UI Kits & Software for Creators',
    support_email: 'support@rollixia.com',
    support_phone: '+91 98765 43210',
    currency: 'INR',
    tax_rate: '18',
    max_downloads: '10',
    hero_title: 'World-Class Digital Products Built for Modern Creators',
    hero_subtitle: 'Discover production-ready templates, software, UI kits, and AI tools designed by global engineers to help you ship 10x faster.',
    announcement_banner: '⚡ FLASH SALE: Get 20% OFF everything with code SAVE20 at checkout!',
    banner_active: 'true',
    refund_policy_days: '14',
    paytm_mid: 'oCtvhv27957773497297',
    paytm_key: '',
    paytm_env: 'production',
    paytm_active: 'true'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/admin/settings');
        if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      addToast('Global store settings updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading platform settings...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div className="glass-card" style={{
        padding: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Platform Settings & Content Controls
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Configure global e-commerce policies, store identity, and delivery rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('general')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 14px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          Store & Financials
        </button>
        <button
          onClick={() => setActiveTab('homepage')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 14px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderBottom: activeTab === 'homepage' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'homepage' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          Homepage Content
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 14px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderBottom: activeTab === 'downloads' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'downloads' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          Delivery & Security Policies
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 14px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderBottom: activeTab === 'payments' ? '2px solid #00b9f5' : '2px solid transparent',
            color: activeTab === 'payments' ? '#00b9f5' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <CreditCard size={15} /> Payment Gateways (Paytm)
        </button>
      </div>

      <form onSubmit={handleSave}>
        {activeTab === 'general' && (
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              Business Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Store Name
                </label>
                <input
                  type="text"
                  name="store_name"
                  value={settings.store_name}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Brand Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={settings.tagline}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Customer Support Email
                </label>
                <input
                  type="email"
                  name="support_email"
                  value={settings.support_email}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Customer Support Phone
                </label>
                <input
                  type="text"
                  name="support_phone"
                  value={settings.support_phone}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, paddingTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              Tax & Currency Setup
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Default Base Currency
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%' }}
                >
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Goods & Services Tax (GST / VAT %)
                </label>
                <input
                  type="number"
                  name="tax_rate"
                  value={settings.tax_rate}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homepage' && (
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              Hero Section Content
            </h3>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Hero Main Heading (H1)
              </label>
              <input
                type="text"
                name="hero_title"
                value={settings.hero_title}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Hero Subtitle Paragraph
              </label>
              <textarea
                rows="3"
                name="hero_subtitle"
                value={settings.hero_subtitle}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%', resize: 'vertical' }}
              ></textarea>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, paddingTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              Top Announcement Bar
            </h3>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Banner Announcement Text
              </label>
              <input
                type="text"
                name="announcement_banner"
                value={settings.announcement_banner}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Banner Visibility
              </label>
              <select
                name="banner_active"
                value={settings.banner_active}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%' }}
              >
                <option value="true">Active (Show to all visitors)</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'downloads' && (
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              Download & License Restrictions
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Max Download Attempts per Purchase
                </label>
                <input
                  type="number"
                  name="max_downloads"
                  value={settings.max_downloads}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Prevents account sharing and unauthorized redistribution.
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Money-Back Refund Window (Days)
                </label>
                <input
                  type="number"
                  name="refund_policy_days"
                  value={settings.refund_policy_days}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Number of days after purchase customers can request assistance.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  padding: '6px 14px',
                  background: '#002970',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 41, 112, 0.5)'
                }}>
                  <span style={{ fontWeight: 900, color: '#ffffff', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                    pay<span style={{ color: '#00b9f5' }}>tm</span>
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Paytm for Business Integration
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                    Unified payments: Paytm UPI, Google Pay, PhonePe, Paytm Wallet, NetBanking & Cards
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                background: 'rgba(0, 185, 245, 0.15)',
                color: '#00b9f5',
                border: '1px solid rgba(0, 185, 245, 0.35)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)'
              }}>
                PRIMARY GATEWAY
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Paytm Merchant ID (MID)
                </label>
                <input
                  type="text"
                  name="paytm_mid"
                  value={settings.paytm_mid}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  placeholder="oCtvhv27957773497297"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Production Merchant ID assigned to Rollixia on Paytm Business.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Paytm Merchant Key (Secret Key)
                </label>
                <input
                  type="password"
                  name="paytm_key"
                  value={settings.paytm_key}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                  placeholder="Paste Paytm Merchant Key"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Found in Paytm Dashboard &gt; Developer Settings &gt; API Keys.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Gateway Environment
                </label>
                <select
                  name="paytm_env"
                  value={settings.paytm_env}
                  onChange={handleChange}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="production">Production (Live Settlements)</option>
                  <option value="staging">Staging / Test Sandbox</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Toggle between Production (securegw.paytm.in) and Staging.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Checkout Status
                </label>
                <select
                  name="paytm_active"
                  value={settings.paytm_active}
                  onChange={handleChange}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="true">Enabled (Default on Checkout)</option>
                  <option value="false">Disabled</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Activates Paytm as the primary recommended gateway for buyers.
                </p>
              </div>
            </div>

            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 185, 245, 0.08)',
              border: '1px solid rgba(0, 185, 245, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ color: '#00b9f5', marginTop: '2px' }}>
                <ExternalLink size={20} />
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: '#00b9f5' }}>Paytm Business Integration Status:</strong> Merchant ID <code style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>oCtvhv27957773497297</code> is pre-configured and active on the platform. Once you enable online payments in your Paytm Business portal (<a href="https://dashboard.paytm.com/next/apikeys" target="_blank" rel="noreferrer" style={{ color: '#00b9f5', textDecoration: 'underline' }}>Paytm Dashboard &gt; API Keys</a>), simply paste your production merchant key here to receive direct bank settlements.
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AdminSettingsPage;
