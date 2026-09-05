import React from 'react';
import { Menu, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminHeader({ currentSection, onToggleSidebar, onReturnToStore }) {
  const { user, logout } = useAuth();

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard': return 'Operational Dashboard';
      case 'products': return 'Digital Products Catalog';
      case 'add-product': return 'Product Builder Engine';
      case 'edit-product': return 'Edit Product Specifications';
      case 'orders': return 'Orders, Receipts & Invoices';
      case 'customers': return 'Customer Accounts & Access';
      case 'reviews': return 'Review Moderation & Ratings';
      case 'coupons': return 'Discount Codes & Promotions';
      case 'files': return 'Deliverable Files & Versions';
      case 'categories': return 'Taxonomy & Categories';
      case 'settings': return 'Store Settings & Configurations';
      case 'logs': return 'Security & Audit Logs';
      default: return 'Administration';
    }
  };

  return (
    <header style={{
      height: '64px',
      minHeight: '64px',
      maxHeight: '64px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Left: Mobile Toggle & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            padding: '8px',
            borderRadius: '8px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'none'
          }}
          className="admin-mobile-toggle-btn"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>Admin Center</span>
            <span>/</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600, textTransform: 'capitalize' }}>
              {currentSection.replace('-', ' ')}
            </span>
          </div>
          <h1 style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '2px 0 0 0',
            lineHeight: 1.2
          }}>
            {getSectionTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Return to Store & User Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onReturnToStore}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <ExternalLink size={14} color="var(--primary)" />
          <span>View Public Store</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '1rem',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.full_name || 'Administrator'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ShieldCheck size={11} /> Super Admin
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign Out of Admin Console"
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
