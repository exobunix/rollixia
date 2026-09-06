import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

// Storefront Components & Pages
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { SearchModal } from './components/common/SearchModal';
import { HomePage } from './pages/store/HomePage';
import { ProductsPage } from './pages/store/ProductsPage';
import { ProductDetailPage } from './pages/store/ProductDetailPage';
import { CartPage } from './pages/store/CartPage';
import { CheckoutPage } from './pages/store/CheckoutPage';
import { OrderSuccessPage } from './pages/store/OrderSuccessPage';
import { CustomerDashboardPage } from './pages/store/CustomerDashboardPage';
import { LoginPage } from './pages/store/LoginPage';
import { RegisterPage } from './pages/store/RegisterPage';
import GlassAuthContainer from './components/auth/GlassAuthContainer';
import { LegalPage } from './pages/store/LegalPage';
import { DownloadCloud } from 'lucide-react';
import { downloadEntitledDeliverable, findDeliverableBlob, triggerBrowserDownload } from './utils/fileStorage';

// Admin Components & Pages
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductWizardPage } from './pages/admin/AdminProductWizardPage';
import { AdminProductBuilderPage } from './pages/admin/AdminProductBuilderPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminFilesPage } from './pages/admin/AdminFilesPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Panel error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2.5rem',
          maxWidth: '640px',
          margin: '3rem auto',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '0.75rem', fontWeight: 800 }}>Builder Render Issue</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {this.state.error?.message || 'An unexpected error occurred while loading this section.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="btn btn-primary"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DirectDownloadHandler({ token, onNavigate }) {
  const [downloading, setDownloading] = useState(true);
  const [downloadedName, setDownloadedName] = useState('');

  useEffect(() => {
    async function run() {
      try {
        const stored = await findDeliverableBlob();
        if (stored && stored.blob) {
          triggerBrowserDownload(stored.blob, stored.fileName);
          setDownloadedName(stored.fileName);
        } else {
          await downloadEntitledDeliverable({ token });
        }
      } catch (e) {
        console.warn('Direct download error:', e);
      } finally {
        setDownloading(false);
      }
    }
    run();
  }, [token]);

  return (
    <div style={{ padding: '6rem 1rem 8rem 1rem', textAlign: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <DownloadCloud size={36} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          {downloading ? 'Delivering Your Digital Package...' : 'Your Download Has Started!'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {downloadedName ? `Delivered "${downloadedName}".` : 'Your verified digital product package has been delivered.'}
          <br />If your browser did not start the download automatically, click below:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => downloadEntitledDeliverable({ token })}
            className="btn btn-primary"
            style={{ fontWeight: 700, padding: '0.75rem 2rem' }}
          >
            <DownloadCloud size={18} /> Download Package Again
          </button>
          <button
            onClick={() => onNavigate('dashboard', { tab: 'downloads' })}
            className="btn btn-secondary btn-sm"
          >
            Go to Customer Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const { user, isAdmin } = useAuth();
  const { setIsCartOpen } = useCart();

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState({ page: 'home', params: {} });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);

  // Pathname Location Parser (Removes '#' and supports clean URLs)
  const parseLocation = () => {
    // If legacy hash is present, migrate immediately to clean pathname
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanHashPath = window.location.hash.replace(/^#/, '');
      window.history.replaceState(null, '', cleanHashPath);
    } else if (window.location.hash === '#' || window.location.hash === '#/') {
      window.history.replaceState(null, '', '/');
    }

    const pathname = window.location.pathname || '/';
    const search = window.location.search;
    const queryParams = {};
    if (search) {
      const searchParams = new URLSearchParams(search);
      for (const [key, value] of searchParams.entries()) {
        queryParams[key] = value;
      }
    }

    // Direct tokenized download URL catch
    if (pathname.includes('/downloads/file/') || pathname.includes('/api/downloads/file/')) {
      const token = pathname.split('/downloads/file/')[1] || queryParams.token || '';
      return { page: 'direct-download', params: { token, ...queryParams } };
    }

    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] || 'home';

    if (firstSegment === 'admin') {
      const rawSection = segments[1] || 'dashboard';
      const section = decodeURIComponent(rawSection).trim().toLowerCase().replace(/\s+/g, '-');
      return { page: 'admin', params: { section, ...queryParams } };
    }

    if (firstSegment === 'products') {
      if (segments[1]) {
        let slug = segments[1];
        try { slug = decodeURIComponent(segments[1]); } catch (e) {}
        return { page: 'product-detail', params: { slug, ...queryParams } };
      }
      return { page: 'products', params: queryParams };
    }

    if (['terms', 'privacy', 'refund-policy', 'license-policy'].includes(firstSegment)) {
      return { page: 'legal', params: { policy: firstSegment, ...queryParams } };
    }

    return { page: firstSegment, params: queryParams };
  };

  // Sync route on mount, popstate (browser back/forward), and legacy hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(parseLocation());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial parse and hash cleanup
    setCurrentRoute(parseLocation());

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Programmatic navigation helper using HTML5 pushState (no '#')
  const navigate = (page, params = {}) => {
    let newPath = '/';
    const query = new URLSearchParams();

    if (page === 'home') {
      newPath = '/';
    } else if (page === 'admin') {
      const section = params.section || 'dashboard';
      newPath = `/admin/${section}`;
      if (params.id) query.append('id', params.id);
    } else if (page === 'product-detail') {
      newPath = `/products/${params.slug || ''}`;
    } else if (page === 'products') {
      newPath = '/products';
      if (params.category) query.append('category', params.category);
      if (params.badge) query.append('badge', params.badge);
      if (params.search) query.append('q', params.search);
    } else if (page === 'order-success') {
      newPath = '/order-success';
      if (params.orderNumber) query.append('orderNumber', params.orderNumber);
    } else if (page === 'dashboard') {
      newPath = '/dashboard';
      if (params.tab) query.append('tab', params.tab);
    } else if (['terms', 'privacy', 'refund-policy', 'license-policy'].includes(page)) {
      newPath = `/${page}`;
    } else {
      newPath = `/${page}`;
    }

    const queryString = query.toString();
    if (queryString) {
      newPath += `?${queryString}`;
    }

    window.history.pushState(null, '', newPath);
    setCurrentRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if current route is admin
  const isAdminRoute = currentRoute.page === 'admin';
  const adminSection = currentRoute.params.section || 'dashboard';

  // If on admin route but not admin, show dedicated Admin Login Page (email & password)
  if (isAdminRoute && !isAdmin) {
    return (
      <AdminLoginPage
        onNavigate={navigate}
        onSuccess={() => setCurrentRoute(parseLocation())}
      />
    );
  }

  // Render Admin View
  if (isAdminRoute && isAdmin) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}>
        <AdminSidebar
          currentSection={adminSection}
          onSelectSection={(sec) => navigate('admin', { section: sec })}
          onReturnToStore={() => navigate('home')}
          isOpen={adminSidebarOpen}
          onClose={() => setAdminSidebarOpen(false)}
        />

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-main)'
        }}>
          <AdminHeader
            currentSection={adminSection}
            onToggleSidebar={() => setAdminSidebarOpen(!adminSidebarOpen)}
            onReturnToStore={() => navigate('home')}
          />

          <main style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem 2rem',
            backgroundColor: 'var(--bg-main)'
          }}>
            <AdminErrorBoundary>
              {adminSection === 'dashboard' && (
                <AdminDashboardPage onNavigateSection={(sec) => navigate('admin', { section: sec })} />
              )}
              {adminSection === 'products' && (
                <AdminProductsPage
                  onAddNew={() => navigate('admin', { section: 'add-product' })}
                  onEditProduct={(id) => navigate('admin', { section: 'edit-product', id })}
                  onPreviewProduct={(slug) => navigate('product-detail', { slug })}
                />
              )}
              {(adminSection === 'add-product' || adminSection === 'edit-product') && (
                <AdminProductBuilderPage
                  productId={currentRoute.params.id}
                  onBack={() => navigate('admin', { section: 'products' })}
                  onSaved={(slug) => navigate('admin', { section: 'products' })}
                />
              )}
              {adminSection === 'orders' && <AdminOrdersPage />}
              {adminSection === 'customers' && <AdminCustomersPage />}
              {adminSection === 'reviews' && <AdminReviewsPage />}
              {adminSection === 'coupons' && <AdminCouponsPage />}
              {adminSection === 'files' && <AdminFilesPage />}
              {adminSection === 'categories' && <AdminCategoriesPage />}
              {adminSection === 'settings' && <AdminSettingsPage />}
              {adminSection === 'logs' && <AdminAuditLogsPage />}
            </AdminErrorBoundary>
          </main>
        </div>
      </div>
    );
  }

  // Render Public Storefront View
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <Header
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        {currentRoute.page === 'home' && (
          <HomePage onNavigate={navigate} />
        )}

        {currentRoute.page === 'products' && (
          <ProductsPage
            key={`products-${currentRoute.params.category || ''}-${currentRoute.params.badge || ''}-${currentRoute.params.q || ''}`}
            initialCategory={currentRoute.params.category}
            initialBadge={currentRoute.params.badge}
            initialSearch={currentRoute.params.q}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'product-detail' && (
          <ProductDetailPage
            slug={currentRoute.params.slug}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'cart' && (
          <CartPage onNavigate={navigate} />
        )}

        {currentRoute.page === 'checkout' && (
          <CheckoutPage onNavigate={navigate} />
        )}

        {currentRoute.page === 'order-success' && (
          <OrderSuccessPage
            orderNumber={currentRoute.params.orderNumber}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'direct-download' && (
          <DirectDownloadHandler
            token={currentRoute.params.token}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'dashboard' && (
          <CustomerDashboardPage
            initialTab={currentRoute.params.tab || 'orders'}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'login' && (
          <LoginPage onNavigate={navigate} />
        )}

        {(currentRoute.page === 'register' || currentRoute.page === 'signup') && (
          <RegisterPage onNavigate={navigate} />
        )}

        {(currentRoute.page === 'forgot-password' || currentRoute.page === 'forgot') && (
          <GlassAuthContainer initialMode="forgot" onNavigate={navigate} />
        )}

        {currentRoute.page === 'legal' && (
          <LegalPage
            policy={currentRoute.params.policy || 'terms'}
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Global Slide-Out Cart Drawer */}
      <CartDrawer
        onNavigateCheckout={() => {
          setIsCartOpen(false);
          navigate('checkout');
        }}
        onNavigateShopping={() => {
          setIsCartOpen(false);
          navigate('products');
        }}
      />

      {/* Global Quick Search Modal (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(slug) => {
          setIsSearchOpen(false);
          navigate('product-detail', { slug });
        }}
        onSelectCategory={(catSlug) => {
          setIsSearchOpen(false);
          navigate('products', { category: catSlug });
        }}
      />

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default App;
