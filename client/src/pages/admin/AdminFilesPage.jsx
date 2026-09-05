import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Search,
  FileArchive,
  DownloadCloud,
  CheckCircle2,
  Plus,
  X,
  FileText,
  HardDrive,
  Edit2,
  Trash2,
  RefreshCw,
  Tag
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { formatBytes, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function AdminFilesPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null); // File currently being edited/replaced

  // Upload/Edit form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/admin/files');
      setFiles(data || []);
    } catch (err) {
      addToast('Failed to load digital files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await apiRequest('/api/admin/products');
      const prodList = data.products || data || [];
      setProducts(prodList);
      if (prodList.length > 0 && !selectedProductId) {
        setSelectedProductId(prodList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchProducts();
  }, []);

  const openNewVersionModal = () => {
    setEditingFile(null);
    setSelectedFile(null);
    setVersion('1.0.0');
    setReleaseNotes('');
    if (products.length > 0) setSelectedProductId(products[0].id);
    setShowUploadModal(true);
  };

  const openEditFileModal = (file) => {
    setEditingFile(file);
    setSelectedFile(null);
    setSelectedProductId(file.product_id);
    setVersion(file.version || '1.0.0');
    setReleaseNotes(file.changelog || '');
    setShowUploadModal(true);
  };

  const handleSubmitFileForm = async (e) => {
    e.preventDefault();

    if (!editingFile && !selectedFile) {
      addToast('Please select a deliverable file package to upload', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('product_id', selectedProductId);
      formData.append('version', version);
      formData.append('changelog', releaseNotes);

      if (editingFile) {
        // Update existing file record
        await apiRequest(`/api/admin/files/${editingFile.id}`, {
          method: 'PUT',
          body: formData
        });
        addToast(`Deliverable file for "${editingFile.product_title}" updated successfully!`, 'success');
      } else {
        // Create new version record
        await apiRequest('/api/admin/files/version', {
          method: 'POST',
          body: formData
        });
        addToast(`Version ${version} published successfully!`, 'success');
      }

      setShowUploadModal(false);
      setEditingFile(null);
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFile = async (id, fileName) => {
    if (!window.confirm(`Permanently delete deliverable file record "${fileName}"?`)) return;
    try {
      await apiRequest(`/api/admin/files/${id}`, { method: 'DELETE' });
      addToast('File record removed', 'info');
      fetchFiles();
    } catch (err) {
      addToast(err.message || 'Failed to delete file', 'error');
    }
  };

  const filteredFiles = files.filter(f =>
    (f.file_name && f.file_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (f.product_title && f.product_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (f.version && f.version.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            Central Deliverable Files & Versions
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Manage and replace product uploads, update delivery versions, and track customer download activity.
          </p>
        </div>
        <button
          onClick={openNewVersionModal}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <UploadCloud size={18} />
          <span>Upload New Version</span>
        </button>
      </div>

      {/* Search Filter & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '420px',
          flex: 1
        }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search file name, product, or version..."
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

        <button
          onClick={fetchFiles}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {/* Files Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Deliverable File</th>
              <th style={{ padding: '12px' }}>Associated Product</th>
              <th style={{ padding: '12px' }}>Version</th>
              <th style={{ padding: '12px' }}>Size</th>
              <th style={{ padding: '12px' }}>Downloads</th>
              <th style={{ padding: '12px' }}>Uploaded Date</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading deliverable files...
                </td>
              </tr>
            ) : filteredFiles.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No deliverable files found. Click "Upload New Version" to attach product files.
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr key={file.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FileArchive size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {file.file_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {file.changelog || 'SHA-256 Verified Package'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {file.product_title || 'Standalone Deliverable'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#a78bfa',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      v{file.version || '1.0.0'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {formatBytes(file.file_size)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600 }}>
                      <DownloadCloud size={14} />
                      <span>{file.download_count || 0}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {formatDate(file.created_at)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: file.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.15)',
                      color: file.is_active ? '#10b981' : 'var(--text-muted)'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: file.is_active ? '#10b981' : '#64748b' }}></span>
                      {file.is_active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditFileModal(file)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Change / Replace Uploaded Deliverable"
                      >
                        <Edit2 size={13} />
                        <span>Change / Replace</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.file_name)}
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '4px 8px',
                          color: '#f43f5e',
                          borderColor: 'rgba(244, 63, 94, 0.3)'
                        }}
                        title="Delete File Record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload or Change/Replace Deliverable Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={20} color="var(--primary)" />
                {editingFile ? `Change Deliverable for "${editingFile.product_title}"` : 'Upload New Product Deliverable'}
              </h3>
              <button
                onClick={() => { setShowUploadModal(false); setEditingFile(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitFileForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Target Digital Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                  disabled={!!editingFile}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Version Tag (e.g. 1.2.0 or 2.0.0)
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  required
                  className="form-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {editingFile ? 'Replace Upload File (ZIP, RAR, PDF, APK, DMG)' : 'Deliverable Archive (ZIP, RAR, PDF, APK, DMG)'}
                  </label>
                  {editingFile && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Current: <strong style={{ color: 'var(--text-primary)' }}>{editingFile.file_name}</strong>
                    </span>
                  )}
                </div>

                <div style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'var(--bg-surface-elevated)'
                }}>
                  <input
                    type="file"
                    id="fileUploadInput"
                    style={{ display: 'none' }}
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                  <label htmlFor="fileUploadInput" style={{ cursor: 'pointer', display: 'block' }}>
                    {selectedFile ? (
                      <div style={{ color: 'var(--primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        ✓ New File Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <UploadCloud size={32} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem' }}>
                          {editingFile ? 'Click to select replacement file package (Max 250MB)' : 'Click to select file package to upload (Max 250MB)'}
                        </span>
                        {editingFile && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            (Leave unchanged to keep current file and only update version/notes)
                          </span>
                        )}
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Changelog / Release Notes
                </label>
                <textarea
                  rows="3"
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="- Bug fixes and performance improvements&#10;- Added new templates & documentation"
                  className="form-input"
                  style={{ width: '100%', resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setEditingFile(null); }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Saving Changes...' : (editingFile ? 'Save & Replace Upload' : 'Publish Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFilesPage;
