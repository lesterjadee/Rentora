'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, AlertCircle } from 'lucide-react'

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) as { id: string }
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [condition, setCondition] = useState('good')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('available')
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: item }, { data: cats }] = await Promise.all([
        supabase.from('items').select('*').eq('id', id).single(),
        supabase.from('categories').select('*')
      ])
      if (item) {
        setTitle(item.title)
        setDescription(item.description || '')
        setPricePerDay(item.price_per_day.toString())
        setCondition(item.condition)
        setCategoryId(item.category_id?.toString() || '')
        setLocation(item.location || '')
        setStatus(item.status)
      }
      if (cats) setCategories(cats)
    }
    fetchData()
  }, [id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.from('items').update({
      title, description,
      price_per_day: parseFloat(pricePerDay),
      condition, category_id: categoryId ? parseInt(categoryId) : null,
      location, status, updated_at: new Date().toISOString()
    }).eq('id', id)
    
    if (error) { 
      setError(error.message)
      setLoading(false)
      return 
    }
    router.push(`/items/${id}`)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return
    await supabase.from('items').delete().eq('id', id)
    router.push('/items')
    router.refresh()
  }

  const conditionOptions = [
    { value: 'new',      label: '✨ New',      color: '#2ECC8F', bg: 'var(--g-glow)' },
    { value: 'like_new', label: '👌 Like New', color: '#93C5FD', bg: 'rgba(59,130,246,0.1)' },
    { value: 'good',     label: '👍 Good',     color: '#E2C07A', bg: 'var(--au-glow)' },
    { value: 'fair',     label: '🔧 Fair',     color: '#FDBA74', bg: 'rgba(251,146,60,0.1)' },
  ]

  const statusOptions = [
    { value: 'available',   label: '✅ Available',   color: '#2ECC8F', bg: 'var(--g-glow)',   border: 'rgba(34,168,118,0.3)' },
    { value: 'unavailable', label: '⏸️ Unavailable', color: '#9CA3AF', bg: 'rgba(156,163,175,0.05)', border: 'rgba(156,163,175,0.2)' },
  ]

  return (
    <>
      <style>{`
        .edit-page { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        
        .edit-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .edit-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
        }

        .edit-inner { max-width: 800px; margin: 0 auto; padding: 32px 28px 60px; }

        .edit-card {
          background: var(--bg-card);
          border: 1px solid var(--border-sub);
          border-radius: 20px; padding: 32px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }

        .edit-section-title {
          font-size: 16px; font-weight: 800; color: var(--tx-bright); margin: 0 0 24px;
          padding-bottom: 16px; border-bottom: 1px solid var(--border-sub);
          letter-spacing: -0.02em;
        }

        .form-group { margin-bottom: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        
        .edit-label {
          display: block; font-size: 11px; font-weight: 800; color: var(--tx-muted);
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;
        }

        .edit-input, .edit-select, .edit-textarea {
          width: 100%; padding: 14px 16px;
          background: var(--bg-raised); border: 1px solid var(--border-sub);
          border-radius: 12px; color: var(--tx-bright); font-size: 14px;
          font-family: inherit; outline: none; transition: all 0.2s;
          box-sizing: border-box;
        }
        .edit-input:focus, .edit-select:focus, .edit-textarea:focus {
          border-color: #22A876; background: rgba(34,168,118,0.02);
          box-shadow: 0 0 0 3px rgba(34,168,118,0.1);
        }

        .pill-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .pill-btn {
          padding: 12px 8px; border-radius: 12px; font-weight: 700; font-size: 13px;
          cursor: pointer; border: 1px solid var(--border-sub);
          background: var(--bg-raised); color: var(--tx-muted);
          transition: all 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .pill-btn:hover { background: rgba(255,255,255,0.03); border-color: var(--border-mid); }

        .edit-actions { display: flex; gap: 14px; }
        .btn-save {
          flex: 1; padding: 16px; border-radius: 14px; font-weight: 800; font-size: 15px;
          background: linear-gradient(135deg, var(--g-mid), var(--g-vivid));
          border: 1px solid rgba(34,168,118,0.3); color: var(--g-neon);
          cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(15,61,42,0.4);
        }
        .btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(15,61,42,0.6); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .btn-delete {
          padding: 16px 24px; border-radius: 14px; font-weight: 800; font-size: 15px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          color: #FCA5A5; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-delete:hover { background: rgba(239,68,68,0.12); }

        .error-box {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 14px 16px; color: #FCA5A5;
          font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px;
        }

        @media (max-width: 640px) {
          .pill-grid { grid-template-columns: repeat(2, 1fr); }
          .form-row { grid-template-columns: 1fr; gap: 20px; margin-bottom: 20px; }
          .edit-actions { flex-direction: column; }
          .edit-inner { padding: 24px 20px 48px; }
          .edit-card { padding: 24px; }
        }
      `}</style>

      <div className="edit-page">
        {/* Banner */}
        <div className="edit-banner">
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <Link href={`/items/${id}`} style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-body)', textDecoration: 'none', flexShrink: 0, transition: 'all 0.2s' }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '5px' }}>My Listing</p>
              <h1 style={{ fontSize: 'clamp(24px,5vw,32px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.03em' }}>Edit Item</h1>
            </div>
          </div>
        </div>

        <div className="edit-inner">
          {error && (
            <div className="error-box">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="edit-card">
              <h2 className="edit-section-title">Item Details</h2>

              <div className="form-group">
                <label className="edit-label">Title *</label>
                <input type="text" className="edit-input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Sony A7III Camera" />
              </div>

              <div className="form-group">
                <label className="edit-label">Description</label>
                <textarea className="edit-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe your item, features, and what's included..." style={{ resize: 'vertical' }} />
              </div>

              <div className="form-row">
                <div>
                  <label className="edit-label">Category</label>
                  <select className="edit-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="edit-label">Price per Day (₱) *</label>
                  <input type="number" className="edit-input" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required min="1" placeholder="0.00" />
                </div>
              </div>

              <div className="form-group">
                <label className="edit-label">Location / Pickup Area</label>
                <input type="text" className="edit-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main Library, Gate 1" />
              </div>

              <div className="form-group">
                <label className="edit-label">Condition</label>
                <div className="pill-grid">
                  {conditionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className="pill-btn"
                      onClick={() => setCondition(opt.value)}
                      style={{
                        borderColor: condition === opt.value ? opt.color : 'var(--border-sub)',
                        background: condition === opt.value ? opt.bg : 'var(--bg-raised)',
                        color: condition === opt.value ? opt.color : 'var(--tx-muted)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="edit-label">Availability Status</label>
                <div className="status-grid">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className="pill-btn"
                      onClick={() => setStatus(opt.value)}
                      style={{
                        padding: '14px',
                        borderColor: status === opt.value ? opt.border : 'var(--border-sub)',
                        background: status === opt.value ? opt.bg : 'var(--bg-raised)',
                        color: status === opt.value ? opt.color : 'var(--tx-muted)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="edit-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                <Save size={18} strokeWidth={2.5} />
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>

              <button type="button" className="btn-delete" onClick={handleDelete}>
                <Trash2 size={18} strokeWidth={2.5} />
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}