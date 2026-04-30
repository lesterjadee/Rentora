'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Camera, Sparkles, Star, ThumbsUp, Wrench, ImagePlus } from 'lucide-react'

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
    { value: 'new',      label: 'New',      icon: <Sparkles size={16} />, color: '#2ECC8F', bg: 'var(--g-glow)' },
    { value: 'like_new', label: 'Like New', icon: <Star size={16} />,     color: '#93C5FD', bg: 'rgba(59,130,246,0.1)' },
    { value: 'good',     label: 'Good',     icon: <ThumbsUp size={16} />, color: '#E2C07A', bg: 'var(--au-glow)' },
    { value: 'fair',     label: 'Fair',     icon: <Wrench size={16} />,   color: '#FDBA74', bg: 'rgba(251,146,60,0.1)' },
  ]

  return (
    <>
      <style>{`
        .new-page { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        
        .new-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .new-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
        }

        .new-inner { max-width: 680px; margin: 0 auto; padding: 32px 28px 60px; }

        .new-card {
          background: var(--bg-card);
          border: 1px solid var(--border-sub);
          border-radius: 20px; padding: 28px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }

        .new-label {
          display: block; font-size: 11px; font-weight: 800; color: var(--tx-muted);
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
        }

        .new-input, .new-select, .new-textarea {
          width: 100%; padding: 14px 16px;
          background: var(--bg-raised); border: 1px solid var(--border-sub);
          border-radius: 12px; color: var(--tx-bright); font-size: 14px;
          font-family: inherit; outline: none; transition: all 0.2s;
          box-sizing: border-box;
        }
        .new-input:focus, .new-select:focus, .new-textarea:focus {
          border-color: #22A876; background: rgba(34,168,118,0.02);
          box-shadow: 0 0 0 3px rgba(34,168,118,0.1);
        }

        .form-group { margin-bottom: 20px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }

        .upload-area {
          border: 2px dashed var(--border-mid); border-radius: 14px; padding: 28px 20px;
          text-align: center; cursor: pointer; background: var(--bg-raised);
          position: relative; transition: all 0.2s;
        }
        .upload-area:hover { border-color: rgba(34,168,118,0.4); background: rgba(34,168,118,0.02); }

        .condition-btn {
          padding: 14px 8px; border-radius: 12px; cursor: pointer;
          border: 1px solid var(--border-sub); background: var(--bg-raised);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          transition: all 0.2s;
        }

        .price-preview {
          background: linear-gradient(135deg, var(--au-deep), rgba(42,30,8,0.4));
          border: 1px solid rgba(201,168,76,0.2); border-radius: 18px; padding: 24px;
          margin-bottom: 24px;
        }

        .btn-submit {
          width: 100%; padding: 18px; border-radius: 14px; font-weight: 800; font-size: 16px;
          background: linear-gradient(135deg, var(--g-mid), var(--g-vivid));
          border: 1px solid rgba(34,168,118,0.3); color: var(--g-neon);
          cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 4px 20px rgba(15,61,42,0.4);
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(15,61,42,0.6); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

        .error-box {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 14px 16px; color: #FCA5A5;
          font-size: 13px; font-weight: 600; margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr; }
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
          .new-inner { padding: 24px 20px 48px; }
          .new-card { padding: 20px; }
        }
      `}</style>

      <div className="new-page">
        {/* Banner */}
        <div className="new-banner">
          <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <Link href="/items" style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-body)', textDecoration: 'none', flexShrink: 0, transition: 'all 0.2s' }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Marketplace</p>
              <h1 style={{ fontSize: 'clamp(24px,5vw,32px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.03em' }}>List an Item</h1>
            </div>
          </div>
        </div>

        <div className="new-inner">
          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            
            {/* Image Upload */}
            <div className="new-card">
              <label className="new-label">Item Photo</label>
              <div className="upload-area">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '10px' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '56px', height: '56px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2ECC8F' }}>
                      <Camera size={26} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', color: 'var(--tx-bright)', margin: '0 0 4px', fontWeight: '800' }}>Upload a photo</p>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, fontWeight: '600' }}>PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              </div>
            </div>

            {/* Details */}
            <div className="new-card">
              <div className="form-group">
                <label className="new-label">Item Title *</label>
                <input type="text" className="new-input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Scientific Calculator Casio fx-991" />
              </div>

              <div className="form-group">
                <label className="new-label">Description</label>
                <textarea className="new-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your item..." style={{ resize: 'vertical' }} />
              </div>

              <div className="form-group">
                <label className="new-label">Category</label>
                <select className="new-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group grid-2">
                <div>
                  <label className="new-label">Price per Day (₱) *</label>
                  <input type="number" className="new-input" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required min="1" placeholder="e.g. 50" />
                </div>
                <div>
                  <label className="new-label">Location</label>
                  <input type="text" className="new-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Engineering Bldg" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="new-label">Condition</label>
                <div className="grid-4">
                  {conditionOptions.map((opt) => {
                    const isActive = condition === opt.value
                    return (
                      <button key={opt.value} type="button" className="condition-btn" onClick={() => setCondition(opt.value)} style={{
                        borderColor: isActive ? opt.color : 'var(--border-sub)',
                        backgroundColor: isActive ? opt.bg : 'var(--bg-raised)',
                        color: isActive ? opt.color : 'var(--tx-muted)'
                      }}>
                        {opt.icon}
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Price Preview */}
            <div className="price-preview">
              <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: '0 0 16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price Preview</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[{ days: 1, label: '1 day' }, { days: 3, label: '3 days' }, { days: 7, label: '7 days' }].map(({ days, label }) => {
                  const price = pricePerDay && parseFloat(pricePerDay) > 0 ? (parseFloat(pricePerDay) * days).toFixed(0) : '--'
                  return (
                    <div key={days} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '12px', padding: '16px 12px', textAlign: 'center' }}>
                      <p className="gold-shimmer" style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.03em' }}>
                        {price !== '--' ? `₱${price}` : '--'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0, fontWeight: '700' }}>{label}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-submit" disabled={loading}>
              <ImagePlus size={20} strokeWidth={2.5} />
              {loading ? 'Listing item...' : 'List Item'}
            </button>

          </form>
        </div>
      </div>
    </>
  )
}