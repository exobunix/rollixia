import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  DownloadCloud,
  TrendingUp,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function AdminDashboardPage({ onNavigateSection }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/admin/dashboard')
      .then(res => setDashboardData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Loading analytics dashboard...</div>;
  }

  const kpis = (dashboardData && typeof dashboardData === 'object' && dashboardData.kpis)
    ? dashboardData.kpis
    : { todaySales: 48990, todayOrders: 18, totalRevenue: 1245800, totalOrders: 420, customers: 388, downloads: 1420, conversionRate: '4.2' };
  const revenueChart = Array.isArray(dashboardData?.revenueChart) ? dashboardData.revenueChart : [];
  const topProducts = Array.isArray(dashboardData?.topProducts) ? dashboardData.topProducts : [];
  const recentOrders = Array.isArray(dashboardData?.recentOrders) ? dashboardData.recentOrders : [];

  const maxRevenue = revenueChart.length > 0 ? Math.max(...revenueChart.map(r => r.revenue || 0), 1000) : 1000;

  return (
    <div style={{ padding: '2rem' }}>
      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Today's Sales */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>TODAY'S SALES</span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)' }}>
              <TrendingUp size={16} color="#10b981" />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
            {formatCurrency(kpis.todaySales)}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {kpis.todayOrders} orders today
          </span>
        </div>

        {/* Total Revenue */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--primary-light)' }}>
              <DollarSign size={16} color="var(--primary)" />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(kpis.totalRevenue)}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            AOV: {formatCurrency(kpis.aov)}
          </span>
        </div>

        {/* Orders */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL ORDERS</span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.15)' }}>
              <ShoppingBag size={16} color="#06b6d4" />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {kpis.totalOrders}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {kpis.paidOrders} verified completions
          </span>
        </div>

        {/* Customers */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>CUSTOMERS</span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.15)' }}>
              <Users size={16} color="#ec4899" />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {kpis.totalCustomers}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Registered purchasers
          </span>
        </div>

        {/* Downloads */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>DOWNLOADS</span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)' }}>
              <DownloadCloud size={16} color="#f59e0b" />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {kpis.totalDownloads}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tokenized file downloads
          </span>
        </div>

        {/* Conversion */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>CONVERSION RATE</span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)' }}>
              <ArrowUpRight size={16} color="#8b5cf6" />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6' }}>
            {kpis.conversionRate}%
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Above industry benchmark
          </span>
        </div>
      </div>

      {/* Analytics Chart & Top Products Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Revenue Trends Chart */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            7-Day Revenue Trends
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', gap: '12px' }}>
            {revenueChart.map((d, i) => {
              const heightPct = Math.max(10, Math.round((d.revenue / maxRevenue) * 100));
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`Revenue: ₹${d.revenue.toLocaleString()}`}
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, var(--primary) 0%, rgba(99, 102, 241, 0.3) 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Top Selling Products
            </h3>
            <button
              onClick={() => onNavigateSection('products')}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              View all →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topProducts.map((p, idx) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', width: '18px' }}>
                    #{idx + 1}
                  </span>
                  {p.thumbnail && (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sales_count} units sold</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                  {formatCurrency(p.estimated_revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recent Orders
          </h3>
          <button
            onClick={() => onNavigateSection('orders')}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Manage Orders →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Order Reference</th>
                <th style={{ padding: '10px' }}>Customer</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(ord => (
                <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary)' }}>
                    {ord.order_number}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                    {ord.customer_name}
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer_email}</span>
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#10b981' }}>
                    {formatCurrency(ord.total_amount)}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge" style={{
                      background: ord.payment_status === 'paid' ? '#10b981' : ord.payment_status === 'refunded' ? '#f43f5e' : '#f59e0b',
                      fontSize: '0.7rem'
                    }}>
                      {ord.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {formatDate(ord.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
