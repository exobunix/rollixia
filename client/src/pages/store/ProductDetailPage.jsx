import React from 'react';
import { DynamicProductPage } from '../../components/store/DynamicProductPage';

class ProductErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ProductDetailPage Crash:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#f43f5e', background: '#0e1424', borderRadius: '1rem', border: '1px solid rgba(244,63,94,0.3)', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Component Render Error</h2>
          <p style={{ color: '#fff', marginBottom: '1rem' }}>{this.state.error?.toString()}</p>
          <pre style={{ background: '#000', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>
            {this.state.info?.componentStack || this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ProductDetailPage({ slug, onNavigate }) {
  console.log('Rendering ProductDetailPage for slug:', slug);
  return (
    <ProductErrorBoundary>
      <DynamicProductPage slug={slug} onNavigate={onNavigate} />
    </ProductErrorBoundary>
  );
}

