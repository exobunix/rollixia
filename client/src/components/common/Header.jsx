import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Layers,
  Flame,
  Gift,
  Sun,
  Moon
} from 'lucide-react';
import RollixiaLogo from './RollixiaLogo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../utils/api';
import { FALLBACK_CATEGORIES } from '../../data/catalogFallbackService.js';
import GlowingNavDock from './GlowingNavDock';

export function Header({ onNavigate, onOpenSearch, currentRoute }) {
  const { user, logout } = useAuth();
  const { count: cartCount, setIsCartOpen } = useCart();
  const { currency, toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();

  const [categories, setCategories] = useState(() => FALLBACK_CATEGORIES || []);
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    apiRequest('/api/categories')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setCategories(data);
      })
      .catch(() => {});

    if (user) {
      apiRequest('/api/wishlist')
        .then(data => setWishlistCount(data.length))
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Announcement Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
        color: '#ffffff',
        padding: '5px 1rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <Sparkles size={14} />
        <span>⚡ Flash Sale: Use code <strong>SAVE20</strong> for 20% off all commercial products today!</span>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <RollixiaLogo
          size={38}
          textSize="1.4rem"
          onClick={() => onNavigate('home')}
        />

        {/* Desktop Glowing Sliding Light Capsule Navigation Dock */}
        <GlowingNavDock
          onNavigate={onNavigate}
          currentRoute={currentRoute}
          categories={categories}
        />

        {/* Action Controls (Search, Currency, Wishlist, Cart, Profile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.45rem 0.85rem' }}
            title="Search products (Ctrl+K)"
          >
            <Search size={16} color="var(--primary)" />
            <span style={{ display: 'none', fontSize: '0.8rem', color: 'var(--text-muted)' }} className="search-shortcut-text">
              Search... (Ctrl+K)
            </span>
          </button>

          {/* Currency Toggle */}
          <button
            onClick={toggleCurrency}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700, fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
            title="Switch Currency (INR ₹ / USD $)"
          >
            {currency === 'INR' ? '₹ INR' : '$ USD'}
          </button>

          {/* Theme Toggle (Dark / Light Mode) */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.45rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} color="#f59e0b" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} color="#6366f1" />
                <span>Dark</span>
              </>
            )}
          </button>


          {/* Wishlist */}
          {user && (
            <button
              onClick={() => onNavigate('dashboard', { tab: 'wishlist' })}
              className="btn-icon"
              title="My Wishlist"
              style={{ position: 'relative' }}
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ec4899',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-icon"
            style={{ position: 'relative' }}
            title="Open Shopping Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name || 'Account'}
                </span>
                <ChevronDown size={14} />
              </button>

              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  width: '220px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.full_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>

                  <button
                    onClick={() => { setIsUserMenuOpen(false); onNavigate('dashboard', { tab: 'orders' }); }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    My Purchases & Orders
                  </button>

                  <button
                    onClick={() => { setIsUserMenuOpen(false); onNavigate('dashboard', { tab: 'downloads' }); }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    My Downloads & Licenses
                  </button>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

                  <button
                    onClick={() => { setIsUserMenuOpen(false); logout(); onNavigate('home'); }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      color: '#f43f5e',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onNavigate('login')}
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 600, padding: '6px 14px' }}
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 600, padding: '6px 16px' }}
                id="header-get-started-btn"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="btn-icon mobile-menu-btn"
            style={{ display: 'flex' }}
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Responsive Styles Injection */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .search-shortcut-text { display: inline !important; }
          .mobile-menu-btn { display: none !important; }
          #header-get-started-btn { display: inline-flex !important; }
        }
      `}</style>

      {/* Mobile Menu Drawer */}
      {isMobileNavOpen && (
        <div style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-medium)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <button
            onClick={() => { setIsMobileNavOpen(false); onNavigate('products'); }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            All Products
          </button>
          <button
            onClick={() => { setIsMobileNavOpen(false); onNavigate('products', { badge: 'TRENDING' }); }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            <Flame size={16} color="#f43f5e" /> Deals & Trending
          </button>
          <button
            onClick={() => { setIsMobileNavOpen(false); onNavigate('products', { badge: 'FREE' }); }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            <Gift size={16} color="#10b981" /> Free Digital Assets
          </button>
          {/* Mobile Theme & Currency Row */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={16} color="#f59e0b" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={16} color="#6366f1" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            <button
              onClick={toggleCurrency}
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {currency === 'INR' ? '₹ INR Currency' : '$ USD Currency'}
            </button>
          </div>

          {/* Mobile Auth Options */}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={() => { setIsMobileNavOpen(false); onNavigate('dashboard', { tab: 'orders' }); }}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start' }}
                >
                  My Purchases & Orders
                </button>

                <button
                  onClick={() => { setIsMobileNavOpen(false); onNavigate('dashboard', { tab: 'downloads' }); }}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start' }}
                >
                  My Downloads & Licenses
                </button>

                <button
                  onClick={() => { setIsMobileNavOpen(false); logout(); onNavigate('home'); }}
                  className="btn btn-outline"
                  style={{
                    justifyContent: 'center',
                    color: '#f43f5e',
                    borderColor: 'rgba(244,63,94,0.3)',
                    gap: '8px',
                    fontWeight: 600
                  }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => { setIsMobileNavOpen(false); onNavigate('login'); }}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontWeight: 600 }}
                >
                  Log In
                </button>
                <button
                  onClick={() => { setIsMobileNavOpen(false); onNavigate('register'); }}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontWeight: 600 }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
