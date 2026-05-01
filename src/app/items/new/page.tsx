'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft, Camera, Sparkles, Star,
  ThumbsUp, Wrench, ImagePlus, MapPin,
  Tag, Type, AlignLeft, DollarSign
} from 'lucide-react'

export default function NewItemPage() {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [condition, setCondition] = useState('good')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    let imageUrl = ''
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('items').upload(fileName, image)
      if (uploadError) { setError('Image upload failed: ' + uploadError.message); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('items').getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
    }
    const { error: insertError } = await supabase.from('items').insert({
      owner_id: user.id, title, description,
      price_per_day: parseFloat(pricePerDay),
      condition, category_id: categoryId ? parseInt(categoryId) : null,
      location, image_url: imageUrl || null, status: 'available'
    })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/items')
    router.refresh()
  }

  const conditionOptions = [
    { value: 'new',      label: 'New',      icon: <Sparkles size={16} strokeWidth={2} />, color: '#2ECC8F', bg: 'var(--g-glow)', border: 'rgba(34,168,118,0.3)' },
    { value: 'like_new', label: 'Like New', icon: <Star size={16} strokeWidth={2} />,    color: '#93C5FD', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
    { value: 'good',     label: 'Good',     icon: <ThumbsUp size={16} strokeWidth={2} />,color: '#E2C07A', bg: 'var(--au-glow)', border: 'rgba(201,168,76,0.3)' },
    { value: 'fair',     label: 'Fair',     icon: <Wrench size={16} strokeWidth={2} />,  color: '#FDBA74', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)' },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'var(--bg-raised)', border: '1px solid var(--border-sub)',
    borderRadius: '12px', fontSize: '14px', color: 'var(--tx-bright)',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    transition: 'border-color 0.2s'
  }

  return (
    <>
      <style>{`
        .ni { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .ni-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .ni-banner::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent); }
        .ni-inner { max-width: 780px; margin: 0 auto; padding: 32px 28px 60px; }
        .ni-card { background: var(--bg-card); border: 1px solid var(--border-sub); border-radius: 22px; padding: 28px; box-shadow: var(--shadow-sm); margin-bottom: 14px; }
        .ni-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid var(--border-sub); }
        .ni-card-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ni-card-title { font-size: 15px; font-weight: 800; color: var(--tx-bright); margin: 0; letter-spacing: -0.02em; }
        .ni-label { display: block; font-size: '11px'; font-weight: 800; color: var(--tx-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 9px; font-size: 11px; }
        .ni-field { margin-bottom: 18px; }
        .ni-field:last-child { margin-bottom: 0; }
        .ni-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ni-condition-btn {
          padding: 13px 10px; border-radius: 12px; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .ni-condition-btn span { font-size: 12px; font-weight: 700; }
        .ni-upload-zone {
          border: 2px dashed var(--border-mid); border-radius: 16px;
          padding: 32px 20px; text-align: center; cursor: pointer;
          background: var(--bg-raised); position: relative;
          transition: all 0.2s;
        }
        .ni-upload-zone:hover { border-color: rgba(34,168,118,0.3); background: var(--bg-hover); }
        .ni-preview-img { width: 100%; height: 220px; object-fit: cover; border-radius: 12px; }
        .ni-price-preview {
          background: linear-gradient(135deg, #080E0A, #0D2B1A 50%, #080808);
          border: 1px solid rgba(34,168,118,0.15);
          border-radius: 20px; padding: 24px;
          position: relative; overflow: hidden;
          margin-bottom: 14px;
        }
        .ni-price-preview::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(34,168,118,0.4), transparent); }
        .ni-price-boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 14px; }
        .ni-price-box { background: rgba(255,255,255,0.04); border: 1px solid var(--border-sub); border-radius: 12px; padding: 14px; text-align: center; }
        .ni-submit {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #6B4C18, var(--au-mid), #A07828);
          border: 1px solid rgba(201,168,76,0.4);
          color: #0C0D10; font-weight: 800; font-size: 16px;
          border-radius: 14px; cursor: pointer;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: all 0.25s; letter-spacing: -0.01em;
          box-shadow: 0 4px 20px rgba(201,168,76,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .ni-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #7A5520, var(--au-light), #C9A030);
          box-shadow: 0 6px 32px rgba(201,168,76,0.35); transform: translateY(-1px);
        }
        .ni-submit:disabled { background: var(--bg-raised); border-color: var(--border-sub); color: var(--tx-muted); cursor: not-allowed; box-shadow: none; transform: none; }
        @media (max-width: 560px) {
          .ni-grid { grid-template-columns: 1fr; }
          .ni-inner { padding: 24px 20px 48px; }
          .ni-banner { padding: 32px 20px 44px; }
        }
      `}</style>

      <div className="ni">
        <div className="ni-banner">
          <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <Link href="/items" style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-body)', textDecoration: 'none', flexShrink: 0 }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '5px' }}>Marketplace</p>
              <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.03em' }}>List an Item</h1>
            </div>
          </div>
        </div>

        <div className="ni-inner">
          {error && (
            <div style={{ marginBottom: '14px', padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', color: '#FCA5A5', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Photo Upload */}
            <div className="ni-card">
              <div className="ni-card-head">
                <div className="ni-card-icon" style={{ background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)' }}>
                  <Camera size={17} color="#22A876" strokeWidth={2} />
                </div>
                <h3 className="ni-card-title">Item Photo</h3>
              </div>
              <div className="ni-upload-zone">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="ni-preview-img" />
                ) : (
                  <>
                    <div style={{ width: '56px', height: '56px', background: 'var(--bg-hover)', border: '1px solid var(--border-mid)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Camera size={24} color="var(--tx-muted)" strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--tx-body)', marginBottom: '4px' }}>Click to upload a photo</p>
                    <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>PNG, JPG up to 10MB</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              </div>
            </div>

            {/* Item Details */}
            <div className="ni-card">
              <div className="ni-card-head">
                <div className="ni-card-icon" style={{ background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <Type size={17} color="#C9A84C" strokeWidth={2} />
                </div>
                <h3 className="ni-card-title">Item Details</h3>
              </div>

              <div className="ni-field">
                <label className="ni-label">Item Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Scientific Calculator Casio fx-991" style={inputStyle} />
              </div>

              <div className="ni-field">
                <label className="ni-label">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe your item, its condition, and any important notes..." style={{ ...inputStyle, resize: 'none' as const, lineHeight: '1.6' }} />
              </div>

              <div className="ni-field">
                <label className="ni-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={12} color="var(--tx-muted)" strokeWidth={2} /> Category
                </label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                  <option value="" style={{ background: 'var(--bg-card)' }}>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} style={{ background: 'var(--bg-card)' }}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="ni-grid ni-field">
                <div>
                  <label className="ni-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={12} color="var(--tx-muted)" strokeWidth={2} /> Price per Day (₱) *
                  </label>
                  <input type="number" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} required min="1" placeholder="e.g. 50" style={inputStyle} />
                </div>
                <div>
                  <label className="ni-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} color="var(--tx-muted)" strokeWidth={2} /> Location
                  </label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Engineering Bldg" style={inputStyle} />
                </div>
              </div>

              <div className="ni-field">
                <label className="ni-label">Condition</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {conditionOptions.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setCondition(opt.value)} className="ni-condition-btn" style={{
                      background: condition === opt.value ? opt.bg : 'var(--bg-raised)',
                      border: `2px solid ${condition === opt.value ? opt.border : 'var(--border-sub)'}`,
                      color: condition === opt.value ? opt.color : 'var(--tx-muted)',
                      boxShadow: condition === opt.value ? `0 0 12px ${opt.color}20` : 'none'
                    }}>
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Preview */}
            <div className="ni-price-preview">
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: 0 }}>Price Preview</p>
              <div className="ni-price-boxes">
                {[{ days: 1, label: '1 day' }, { days: 3, label: '3 days' }, { days: 7, label: '7 days' }].map(({ days, label }) => {
                  const price = pricePerDay && parseFloat(pricePerDay) > 0
                    ? `₱${(parseFloat(pricePerDay) * days).toFixed(0)}` : '--'
                  return (
                    <div key={days} className="ni-price-box">
                      <p className={price !== '--' ? 'gold-shimmer' : ''} style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-0.03em', color: price === '--' ? 'var(--tx-dim)' : undefined }}>{price}</p>
                      <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: 0, fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{label}</p>
                    </div>
                  )
                })}
              </div>
              {(!pricePerDay || parseFloat(pricePerDay) <= 0) && (
                <p style={{ fontSize: '12px', color: 'var(--tx-dim)', margin: '12px 0 0', textAlign: 'center' as const }}>Enter a price above to see the preview</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="ni-submit">
              <ImagePlus size={20} strokeWidth={2} />
              {loading ? 'Listing item...' : 'Publish Listing'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}