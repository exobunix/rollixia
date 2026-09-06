import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Home,
  Package,
  LayoutGrid,
  Flame,
  Gift,
  ChevronDown
} from 'lucide-react';
import './glowingNav.css';

/**
 * GlowingNavDock
 * Premium floating capsule navigation dock with an animated glowing sliding light ring,
 * ambient floor beam projection, and real-time cursor tracking.
 */
export default function GlowingNavDock({ onNavigate, currentRoute = {}, categories = [] }) {
  const dockRef = useRef(null);
  const tabsRef = useRef({});
  const catMenuRef = useRef(null);

  const [hoveredTabId, setHoveredTabId] = useState(null);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [ringStyle, setRingStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Navigation Items
  const navTabs = useMemo(() => [
    { id: 'home', label: 'Home', icon: Home, color: '#fbbf24' },
    { id: 'products', label: 'All Products', icon: Package, color: '#38bdf8' },
    { id: 'categories', label: 'Categories', icon: LayoutGrid, isDropdown: true, color: '#c084fc' },
    { id: 'deals', label: 'Deals', icon: Flame, color: '#f43f5e' },
    { id: 'freebies', label: 'Freebies', icon: Gift, color: '#10b981' }
  ], []);

  // Determine current active tab from route
  const activeTabId = useMemo(() => {
    const page = currentRoute?.page || '';
    const params = currentRoute?.params || {};

    if (page === 'home' || page === '') return 'home';
    if (page === 'products') {
      if (params.badge === 'TRENDING') return 'deals';
      if (params.badge === 'FREE') return 'freebies';
      if (params.category) return 'categories';
      return 'products';
    }
    return null;
  }, [currentRoute]);

  // Target tab to highlight with the glowing light (hover overrides active)
  const targetTabId = hoveredTabId || activeTabId || 'home';

  // Smoothly position the light ring to the target tab
  const updateLightPosition = (tabId) => {
    const el = tabsRef.current[tabId];
    if (el) {
      setRingStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    updateLightPosition(targetTabId);
  }, [targetTabId]);

  // Reposition on window resize
  useEffect(() => {
    const handleResize = () => updateLightPosition(targetTabId);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetTabId]);

  // Close categories menu on outside click
  useEffect(() => {
    const handleDocClick = (e) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // Mouse move spotlight inside button
  const handleTabMouseMove = (e, tabId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
    setHoveredTabId(tabId);
  };

  const handleTabClick = (tab) => {
    if (tab.isDropdown) {
      setIsCatOpen(!isCatOpen);
      return;
    }
    setIsCatOpen(false);

    if (tab.id === 'home') {
      onNavigate('home');
    } else if (tab.id === 'products') {
      onNavigate('products');
    } else if (tab.id === 'deals') {
      onNavigate('products', { badge: 'TRENDING' });
    } else if (tab.id === 'freebies') {
      onNavigate('products', { badge: 'FREE' });
    }
  };

  return (
    <div className="glowing-nav-wrapper" ref={catMenuRef}>
      {/* Capsule Navigation Dock */}
      <nav
        ref={dockRef}
        className="glowing-nav-dock desktop-nav"
        onMouseLeave={() => {
          setHoveredTabId(null);
        }}
        aria-label="Main Navigation"
      >
        {/* The Animated Glowing Light Ring (glides between tabs) */}
        <div
          className="glowing-light-ring"
          style={{
            transform: `translateX(${ringStyle.left}px)`,
            width: `${ringStyle.width}px`,
            opacity: ringStyle.opacity
          }}
          aria-hidden="true"
        />

        {/* Floor Light Reflection Beam below dock */}
        <div
          className="glowing-floor-beam"
          style={{
            transform: `translateX(${ringStyle.left}px)`,
            width: `${ringStyle.width}px`,
            opacity: ringStyle.opacity
          }}
          aria-hidden="true"
        />

        {/* Navigation Tabs */}
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabId === tab.id;
          const isHovered = hoveredTabId === tab.id;

          return (
            <button
              key={tab.id}
              ref={(el) => (tabsRef.current[tab.id] = el)}
              type="button"
              className={`glowing-nav-tab ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
              onMouseEnter={() => setHoveredTabId(tab.id)}
              onMouseMove={(e) => handleTabMouseMove(e, tab.id)}
              onClick={() => handleTabClick(tab)}
              title={tab.label}
              aria-expanded={tab.isDropdown ? isCatOpen : undefined}
            >
              {/* Inner Cursor Spotlight */}
              <div className="glowing-tab-spotlight" />

              {/* Icon with custom glowing color */}
              <span
                className="glowing-nav-tab-icon"
                style={{
                  color: isActive || isHovered ? tab.color : 'currentColor'
                }}
              >
                <Icon size={16} strokeWidth={2.2} />
              </span>

              {/* Tab Label */}
              <span>{tab.label}</span>

              {/* Dropdown Chevron for Categories */}
              {tab.isDropdown && (
                <ChevronDown
                  size={14}
                  style={{
                    transform: isCatOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.7
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Categories Glass Popover */}
      {isCatOpen && (
        <div className={`glowing-cat-popover ${isCatOpen ? 'is-open' : ''}`}>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {categories.map((c) => (
              <div
                key={c.id}
                className="glowing-cat-item"
                onClick={() => {
                  setIsCatOpen(false);
                  onNavigate('products', { category: c.slug });
                }}
              >
                <span>{c.name}</span>
                <span className="glowing-cat-count">{c.product_count || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
