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
 * ambient floor beam projection, real-time cursor tracking, and fluid mobile/tablet responsiveness.
 */
export default function GlowingNavDock({
  onNavigate,
  currentRoute = {},
  categories = [],
  isMobile = false
}) {
  const dockRef = useRef(null);
  const tabsRef = useRef({});
  const catMenuRef = useRef(null);

  const [hoveredTabId, setHoveredTabId] = useState(null);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [ringStyle, setRingStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Navigation Items with full and compact short labels for tablet/mobile
  const navTabs = useMemo(() => [
    { id: 'home', label: 'Home', shortLabel: 'Home', icon: Home, color: '#fbbf24' },
    { id: 'products', label: 'All Products', shortLabel: 'Products', icon: Package, color: '#38bdf8' },
    { id: 'categories', label: 'Categories', shortLabel: 'Categories', icon: LayoutGrid, isDropdown: true, color: '#c084fc' },
    { id: 'deals', label: 'Deals', shortLabel: 'Deals', icon: Flame, color: '#f43f5e' },
    { id: 'freebies', label: 'Freebies', shortLabel: 'Free', icon: Gift, color: '#10b981' }
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
  const targetTabId = hoveredTabId || activeTabId;

  // Smoothly position the light ring to the target tab
  const updateLightPosition = (tabId) => {
    if (!tabId) {
      setRingStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }
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

  // ResizeObserver: auto-recalculate position when container resizes (e.g. tablet rotation, DevTools toggle)
  useEffect(() => {
    if (!dockRef.current) return;
    const observer = new ResizeObserver(() => {
      updateLightPosition(targetTabId);
    });
    observer.observe(dockRef.current);
    return () => observer.disconnect();
  }, [targetTabId]);

  // Fallback window resize
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

  // Drag the light along the bar support
  const isDraggingRef = useRef(false);

  const handlePointerDown = () => {
    isDraggingRef.current = true;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX;
    for (const tab of navTabs) {
      const el = tabsRef.current[tab.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right) {
          setHoveredTabId(tab.id);
          break;
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
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

  const wrapperClass = isMobile
    ? 'glowing-mobile-bottom-dock'
    : 'glowing-nav-wrapper';

  return (
    <div className={wrapperClass} ref={catMenuRef}>
      {/* Capsule Navigation Dock */}
      <nav
        ref={dockRef}
        className={`glowing-nav-dock ${!isMobile ? 'desktop-nav' : 'mobile-dock'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
        {!isMobile && (
          <div
            className="glowing-floor-beam"
            style={{
              transform: `translateX(${ringStyle.left}px)`,
              width: `${ringStyle.width}px`,
              opacity: ringStyle.opacity
            }}
            aria-hidden="true"
          />
        )}

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

              {/* Tab Labels: full label on wide screens, compact short label on tablets */}
              <span className="glowing-nav-tab-label-full">{tab.label}</span>
              <span className="glowing-nav-tab-label-short">{tab.shortLabel || tab.label}</span>

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
