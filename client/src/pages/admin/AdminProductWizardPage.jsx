import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Eye,
  Sparkles,
  Layers,
  Save,
  Globe
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export function AdminProductWizardPage({ onComplete, onCancel }) {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // STEP 1: Basic Details
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productType, setProductType] = useState('UI Kit & Templates');
  const [author, setAuthor] = useState('Antigravity Studio');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');

  // STEP 2: Pricing
  const [regularPrice, setRegularPrice] = useState(2999);
  const [salePrice, setSalePrice] = useState(1499);
  const [badge, setBadge] = useState('NEW');

  // STEP 3: Media
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // STEP 4: Digital Files
  const [fileName, setFileName] = useState('');
  const [fileVersion, setFileVersion] = useState('1.0.0');
  const [changelog, setChangelog] = useState('Initial production release.');

  // STEP 5: Features
  const [features, setFeatures] = useState([
    { title: 'Production-ready code architecture', description: 'Clean modular layout with zero bloat' },
    { title: 'Responsive dark & light mode', description: 'Tailored for mobile, tablet, and desktop screens' }
  ]);

  // STEP 6: Compatibility
  const [compatList, setCompatList] = useState([
    { platform: 'React / Next.js', version: '18 / 19' },
    { platform: 'Figma', version: '2025+' },
    { platform: 'Browsers', version: 'Chrome, Safari, Edge, Firefox' }
  ]);

  // STEP 7: Licenses
  const [licenses, setLicenses] = useState([
    { name: 'Personal License', price: 1499, description: 'Single personal project or portfolio use' },
    { name: 'Commercial License', price: 2999, description: 'Unlimited commercial client projects and apps' },
    { name: 'Extended / Agency', price: 5999, description: 'Unlimited team seats and redistributable SaaS integration' }
  ]);

  // STEP 8: FAQs
  const [faqs, setFaqs] = useState([
    { question: 'Do I get lifetime updates for free?', answer: 'Yes! All buyers receive free access to future version updates directly in their Customer Dashboard.' },
    { question: 'What is included in the download package?', answer: 'You receive uncompressed source files, documentation, components, and a verified commercial license.' }
  ]);

  // STEP 9: SEO & Status
  const [status, setStatus] = useState('published');

  useEffect(() => {
    apiRequest('/api/categories').then(data => {
      setCategories(data);
      if (data.length > 0) setCategoryId(data[0].id);
    }).catch(() => {});
  }, []);

  const handleTitleChange = (val) => {
    setTitle(val);
    const generated = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(generated);
    setSku(`SKU-${val.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
    setFileName(`${generated}-v1.0.0.zip`);
  };

  const handleAddFeature = () => {
    setFeatures(prev => [...prev, { title: '', description: '' }]);
  };

  const handleRemoveFeature = (idx) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddCompat = () => {
    setCompatList(prev => [...prev, { platform: '', version: '' }]);
  };

  const handleRemoveCompat = (idx) => {
    setCompatList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddFaq = () => {
    setFaqs(prev => [...prev, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (idx) => {
    setFaqs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinalPublish = async (publishStatus = 'published') => {
    if (!title.trim() || !categoryId) {
      addToast('Product title and category are required', 'error');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        slug,
        sku,
        category_id: categoryId,
        short_description: shortDesc || `High quality ${title} digital package.`,
        full_description: fullDesc || `## About ${title}\n\n${shortDesc}\n\n### Highlights:\n- Production ready\n- Lifetime access\n- Free updates`,
        product_type: productType,
        author,
        regular_price: regularPrice,
        sale_price: salePrice,
        badge,
        status: publishStatus,
        demo_url: demoUrl,
        video_url: videoUrl,
        media: [mediaUrl],
        licenses,
        features,
        compatibility: compatList,
        faqs,
        file: {
          file_name: fileName || `${slug}-v1.0.0.zip`,
          version: fileVersion,
          changelog,
          download_limit: 10
        }
      };

      const res = await apiRequest('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      addToast(`Product "${title}" created and published live to the storefront!`, 'success');
      if (onComplete) onComplete(res.slug);
    } catch (err) {
      console.error('Wizard publish error:', err);
      addToast(err.message || 'Failed to publish product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    'Basic Info',
    'Pricing',
    'Media',
    'Digital Files',
    'Features',
    'Compatibility',
    'Licenses',
    'FAQs',
    'Preview & Publish'
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Wizard Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Non-Technical Product Creator
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
          Add New Digital Product
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Follow the 9-step wizard to deploy digital products live with automatic SEO, licenses, and secure download tokens.
        </p>
      </div>

      {/* Step Progress Pills */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {stepsList.map((stName, idx) => {
          const stepNum = idx + 1;
          const isCurrent = step === stepNum;
          const isDone = step > stepNum;
          return (
            <button
              key={stepNum}
              onClick={() => setStep(stepNum)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: isCurrent ? 'var(--primary)' : isDone ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface-elevated)',
                color: isCurrent ? '#ffffff' : isDone ? '#10b981' : 'var(--text-muted)',
                fontWeight: isCurrent ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{stepNum}.</span>
              <span>{stName}</span>
            </button>
          );
        })}
      </div>

      {/* STEP CONTAINER */}
      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Step 1: Basic Product Information
            </h3>

            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Nexus Pro UI Kit & Design System"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">URL Slug (Auto-generated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  type="text"
                  className="form-input"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Type / Subtitle</label>
                <input
                  type="text"
                  className="form-input"
                  value={productType}
                  onChange={e => setProductType(e.target.value)}
                  placeholder="e.g. Website Template, Figma Kit, Mobile App"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Short Value Proposition (1-2 sentences for cards)</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '80px' }}
                placeholder="Describe what makes this product high-converting..."
                value={shortDesc}
                onChange={e => setShortDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Sales Page Description (Markdown supported)</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '140px' }}
                placeholder="Write headings, highlights, what users receive..."
                value={fullDesc}
                onChange={e => setFullDesc(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Pricing */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Step 2: Base Pricing & Badges
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Regular Price (INR ₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={regularPrice}
                  onChange={e => setRegularPrice(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sale / Discount Price (INR ₹) (Optional)</label>
                <input
                  type="number"
                  className="form-input"
                  value={salePrice}
                  onChange={e => setSalePrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Badge</label>
              <select
                className="form-select"
                value={badge}
                onChange={e => setBadge(e.target.value)}
              >
                <option value="">None</option>
                <option value="BESTSELLER">BESTSELLER</option>
                <option value="TRENDING">TRENDING</option>
                <option value="NEW">NEW</option>
                <option value="TOP RATED">TOP RATED</option>
                <option value="FREE">FREE</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: Media */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Step 3: Product Media & Demos
            </h3>

            <div className="form-group">
              <label className="form-label">Main Preview Image URL</label>
              <input
                type="url"
                required
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
              />
            </div>

            {mediaUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img
                  src={mediaUrl}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Live Demo URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://preview.digitalstore.com/your-demo"
                  value={demoUrl}
                  onChange={e => setDemoUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Video Tour Embed URL (YouTube/Vimeo)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://www.youtube-nocookie.com/embed/..."
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Digital Files */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Step 4: Digital Deliverable File & Versioning
            </h3>

            <div className="form-group">
              <label className="form-label">Archive File Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. apex-ui-kit-v1.0.0.zip"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Version Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="1.0.0"
                value={fileVersion}
                onChange={e => setFileVersion(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Release Notes / Changelog</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '80px' }}
                value={changelog}
                onChange={e => setChangelog(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 5: Features */}
        {step === 5 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Step 5: Key Features</h3>
              <button type="button" onClick={handleAddFeature} className="btn btn-secondary btn-sm">
                <Plus size={15} /> Add Feature
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Feature Title (e.g. 50+ Responsive Screens)"
                      value={f.title}
                      onChange={e => {
                        const next = [...features];
                        next[idx].title = e.target.value;
                        setFeatures(next);
                      }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Short Description"
                      value={f.description}
                      onChange={e => {
                        const next = [...features];
                        next[idx].description = e.target.value;
                        setFeatures(next);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Compatibility */}
        {step === 6 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Step 6: Compatibility Matrix</h3>
              <button type="button" onClick={handleAddCompat} className="btn btn-secondary btn-sm">
                <Plus size={15} /> Add Platform
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {compatList.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Platform / Tool (e.g. Figma, React, Flutter)"
                    value={c.platform}
                    onChange={e => {
                      const next = [...compatList];
                      next[idx].platform = e.target.value;
                      setCompatList(next);
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Version (e.g. 18 / 19, Latest)"
                    value={c.version}
                    onChange={e => {
                      const next = [...compatList];
                      next[idx].version = e.target.value;
                      setCompatList(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCompat(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: Licenses */}
        {step === 7 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Step 7: License Tiers & Permissions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {licenses.map((lic, idx) => (
                <div key={idx} style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="License Name"
                      value={lic.name}
                      onChange={e => {
                        const next = [...licenses];
                        next[idx].name = e.target.value;
                        setLicenses(next);
                      }}
                    />
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Price (₹)"
                      value={lic.price}
                      onChange={e => {
                        const next = [...licenses];
                        next[idx].price = Number(e.target.value);
                        setLicenses(next);
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Description / Permissions"
                    value={lic.description}
                    onChange={e => {
                      const next = [...licenses];
                      next[idx].description = e.target.value;
                      setLicenses(next);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: FAQs */}
        {step === 8 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Step 8: Product FAQ</h3>
              <button type="button" onClick={handleAddFaq} className="btn btn-secondary btn-sm">
                <Plus size={15} /> Add FAQ
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((f, idx) => (
                <div key={idx} style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Question"
                      value={f.question}
                      onChange={e => {
                        const next = [...faqs];
                        next[idx].question = e.target.value;
                        setFaqs(next);
                      }}
                    />
                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '60px' }}
                      placeholder="Answer"
                      value={f.answer}
                      onChange={e => {
                        const next = [...faqs];
                        next[idx].answer = e.target.value;
                        setFaqs(next);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 9: Preview & Publish */}
        {step === 9 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              Step 9: Review & Deploy Product
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Here is an exact live preview of how your product card will appear in the catalog:
            </p>

            {/* Live Card Preview */}
            <div style={{ maxWidth: '320px', margin: '0 auto 2rem auto' }}>
              <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
                <img
                  src={mediaUrl}
                  alt={title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {productType}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0' }}>{title || 'Your Product Title'}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{shortDesc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                    {formatCurrency(salePrice || regularPrice)}
                  </span>
                  <span className="badge badge-bestseller">{badge || 'NEW'}</span>
                </div>
              </div>
            </div>

            {/* Publishing controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => handleFinalPublish('draft')}
                className="btn btn-secondary btn-lg"
                disabled={submitting}
              >
                <Save size={18} /> Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleFinalPublish('published')}
                className="btn btn-primary btn-lg"
                disabled={submitting}
              >
                <Globe size={18} /> {submitting ? 'Publishing...' : 'Publish Live Now'}
              </button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
            >
              Cancel
            </button>
          )}

          {step < 9 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn btn-primary"
            >
              Next Step ({step + 1}/9) <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
