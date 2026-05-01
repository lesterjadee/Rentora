'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Star, ThumbsUp, Wrench, Trash2, Save } from 'lucide-react'

export default function EditItemPage({ params }: { params: any }) {
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
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.from('items').update({
      title, description, price_per_day: parseFloat(pricePerDay),
      condition, category_id: categoryId ? parseInt(categoryId) : null,
      location, status, updated_at: new Date().toISOString()
    }).eq('id', id)
    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/items/${id}`)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return
    await supabase.from('items').delete().eq('id', id)
    router.push('/items')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'var(--bg-raised)', border: '1px solid var(--border-sub)',
    borderRadius: '12px', fontSize: '14px', color: 'var(--tx-bright)',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    transition: 'border-color 0.2s'
  }

  const conditionOptions = [
    { value: 'new',      label: 'New',      icon: <Sparkles size={15} strokeWidth={2} />, color: '#2ECC8F', bg: 'var(--g-glow)', border: 'rgba(34,168,118,0.3)' },
    { value: 'like_new', label: 'Like New', icon: <Star size={15} strokeWidth={2} />,    color: '#93C5FD', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
    { value: 'good',     label: 'Good',     icon: <ThumbsUp size={15} strokeWidth={2} />,color: '#E2C07A', bg: 'var(--au-glow)', border: 'rgba(201,168,76,0.3)' },
    { value: 'fair',     label: 'Fair',     icon: <Wrench size={15} strokeWidth={2} />,  color: '#FDBA74', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)' },
  ]

  const statusOptions = [
    { value: 'available',   label: 'Available',   color: '#2ECC8F', bg: 'var(--g-glow)', border: 'rgba(34,168,118,0.3)' },
    { value: 'unavailable', label: 'Unavailable',  color: 'var(--tx-muted)', bg: 'var(--bg-raised)', border: 'var(--border-sub)' },
  ]

  return (
    <>
      <style>{`
        .ei { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .ei-banner { position: relative; overflow: hidden; padding: 40px 28px 52px; background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%); border-bottom: 1px solid rgba(34,168,118,0.08); }
        .ei-banner::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent); }
        .ei-inner { max-width: 720px; margin: 0 auto; padding: 32px 28px 60px; }
        .ei-card { background: var(--bg-card); border: 1px solid var(--border-sub); border-radius: 22px; padding: 28px; box-shadow: var(--shadow-sm); margin-bottom: 14px; }
        .ei-label { display: block; font-size: 11px; font-weight: 800; color: var(--tx-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 9px; }
        .ei-field { margin-bottom: 18px; }
        .ei-field:last-child { margin-bottom: 0; }
        .ei-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ei-toggle-btn { padding: 12px; border-radius: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: all 0.2s; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .ei-toggle-btn span { font-size: 12px; font-weight: 700; }
        @media (max-width: 560px) { .ei-grid { grid-template-columns: 1fr; } .ei-inner { padding: 24px 20px 48px; } }
      `}</style>

      <div className="ei">
        <div className="ei-banner">
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <Link href={`/items/${id}`} style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-body)', textDecoration: 'none', flexShrink: 0 }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '5px' }}>My Listing</p>
              <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.03em' }}>Edit Item</h1>
            </div>
          </div>
        </div>

        <div className="ei-inner">
          {error && (
            <div style={{ marginBottom: '14px', padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', color: '#FCA5A5', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="ei-card">
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 22px', paddingBottom: '16px', borderBottom: '1px solid var(--border-sub)', letterSpacing: '-0.02em' }}>Item Details</h3>

              <div className="ei-field">
                <label className="ei-label">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
              </div>

              <div className="ei-field">
                <label className="ei-label">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' as const, lineHeight: '1.6' }} />
              </div>

              <div className="ei-grid ei-field">
                <div>
                  <label className="ei-label">Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                    <option value="" style={{ background: 'var(--bg-card)' }}>Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} style={{ background: 'var(--bg-card)' }}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ei-label">Price per Day (₱) *</label>
                  <input type="number" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} required min="1" style={inputStyle} />
                </div>
              </div>

              <div className="ei-field">
                <label className="ei-label">Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} />
              </div>

              <div className="ei-field">
                <label className="ei-label">Condition</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {conditionOptions.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setCondition(opt.value)} className="ei-toggle-btn" style={{ background: condition === opt.value ? opt.bg : 'var(--bg-raised)', border: `2px solid ${condition === opt.value ? opt.border : 'var(--border-sub)'}`, color: condition === opt.value ? opt.color : 'var(--tx-muted)' }}>
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ei-field">
                <label className="ei-label">Availability</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {statusOptions.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setStatus(opt.value)} className="ei-toggle-btn" style={{ background: status === opt.value ? opt.bg : 'var(--bg-raised)', border: `2px solid ${status === opt.value ? opt.border : 'var(--border-sub)'}`, color: status === opt.value ? opt.color : 'var(--tx-muted)' }}>
                      <span style={{ fontSize: '13px' }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', background: loading ? 'var(--bg-raised)' : 'linear-gradient(135deg, #6B4C18, var(--au-mid), #A07828)', border: `1px solid ${loading ? 'var(--border-sub)' : 'rgba(201,168,76,0.4)'}`, color: loading ? 'var(--tx-muted)' : '#0C0D10', fontWeight: '800', borderRadius: '13px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.25s', boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.2)' }}>
                <Save size={17} strokeWidth={2.5} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleDelete} style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontWeight: '700', borderRadius: '13px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.2s' }}>
                <Trash2 size={16} strokeWidth={2} /> Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}