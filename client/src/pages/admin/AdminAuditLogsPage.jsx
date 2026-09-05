import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function AdminAuditLogsPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/admin/logs');
      setLogs(data || []);
    } catch (err) {
      addToast('Failed to load audit trail', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.admin_name && log.admin_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.entity_type && log.entity_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getActionBadgeStyle = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('REFUND') || act.includes('DISABLE')) {
      return { background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' };
    }
    if (act.includes('CREATE') || act.includes('PUBLISH') || act.includes('UPLOAD')) {
      return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return { background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--border-bright)' };
    }
    return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
  };

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
            Security & Activity Audit Log
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Trace all critical administrative events, catalog modifications, and system updates.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem' }}
        >
          <RefreshCw size={16} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '420px'
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter by action, operator, entity or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            width: '100%'
          }}
        />
      </div>

      {/* Logs Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Timestamp</th>
              <th style={{ padding: '12px' }}>Operator</th>
              <th style={{ padding: '12px' }}>Action</th>
              <th style={{ padding: '12px' }}>Target Entity</th>
              <th style={{ padding: '12px' }}>Activity Details</th>
              <th style={{ padding: '12px' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Fetching audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No activity logs recorded yet.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {formatDate(log.created_at)}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {log.admin_name || 'Super Admin'}
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      ...getActionBadgeStyle(log.action)
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', maxWidth: '360px', wordBreak: 'break-word' }}>
                    {log.details || '—'}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAuditLogsPage;
