import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  Star,
  Tag,
  FolderTree,
  FileArchive,
  Sliders,
  History,
  Store,
  BarChart3,
  X
} from 'lucide-react';
import RollixiaLogo from '../common/RollixiaLogo';

export function AdminSidebar({ currentSection, onSelectSection, onReturnToStore, isOpen, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'All Products', icon: <Package size={18} /> },
    { id: 'add-product', label: '+ Add Product (Builder)', icon: <PlusCircle size={18} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { id: 'files', label: 'Product Files', icon: <FileArchive size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
    { id: 'orders', label: 'Orders & Receipts', icon: <ShoppingBag size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'coupons', label: 'Coupons & Deals', icon: <Tag size={18} /> },
    { id: 'settings', label: 'Store Settings', icon: <Sliders size={18} /> },
    { id: 'logs', label: 'Audit Activity Logs', icon: <History size={18} /> }
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 190,
            display: 'block'
          }}
          className="admin-mobile-overlay"
        />
      )}

      <aside style={{
        width: '260px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 200
      }} className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RollixiaLogo size={32} showText={false} />
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Admin Center</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>ROLLIXIA</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="admin-sidebar-close"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(item => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  if (onClose) onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Return to Storefront Link */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onReturnToStore}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}
          >
            <Store size={16} /> Return to Storefront
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            position: fixed !important;
            left: -280px;
            transition: left 0.3s ease;
          }
          .admin-sidebar.open {
            left: 0 !important;
          }
          .admin-sidebar-close {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

export function AdminHeader({ title, onToggleSidebar, onReturnToStore }) {
  return (
    <header style={{
      height: '68px',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-icon"
          style={{ display: 'none' }}
          id="admin-menu-toggle-btn"
        >
          ☰
        </button>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(16, 185, 129, 0.15)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#10b981'
        }}>
          ● Server Live
        </div>
        <button
          onClick={onReturnToStore}
          className="btn btn-outline btn-sm"
        >
          View Storefront
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #admin-menu-toggle-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
