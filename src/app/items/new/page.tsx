'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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

  const inputStyle = {
    width: '100%', padding: '13px 16px', backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '14px', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box' as const
  }

  const conditionOptions = [
    { value: 'new', label: '✨ New', color: '#16a34a' },
    { value: 'like_new', label: '👌 Like New', color: '#2563eb' },
    { value: 'good', label: '👍 Good', color: '#d97706' },
    { value: 'fair', label: '🔧 Fair', color: '#ea580c' },
  ]

  return (
    <>
      <style>{`
        .new-item-form { display: flex; flex-direction: column; gap: 16px; }
        .price-loc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .condition-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        @media (max-width: 480px) {
          .price-loc-grid { grid-template-columns: 1fr; }
          .condition-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/items" style={{ width: '38px', height: '38px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none', fontSize: '18px', flexShrink: 0 }}>←</Link>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Marketplace</p>
              <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '800', color: '#ffffff', margin: 0 }}>List an Item</h1>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 24px' }}>
          {error && (
            <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>❌ {error}</div>
          )}

          <form onSubmit={handleSubmit} className="new-item-form">

            {/* Image Upload */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Item Photo</label>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', position: 'relative' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />
                ) : (
                  <div style={{ padding: '20px 0' }}>
                    <p style={{ fontSize: '36px', marginBottom: '8px' }}>📷</p>
                    <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 4px', fontWeight: '600' }}>Upload a photo</p>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              </div>
            </div>

            {/* Details */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Item Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Scientific Calculator Casio fx-991" style={inputStyle} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your item..." style={{ ...inputStyle, resize: 'none' as const, lineHeight: '1.6' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>

              <div className="price-loc-grid" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Price per Day (₱) *</label>
                  <input type="number" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required min="1" placeholder="e.g. 50" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Engineering Bldg" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Condition</label>
                <div className="condition-grid">
                  {conditionOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setCondition(opt.value)} style={{
                      padding: '12px 8px', borderRadius: '10px', cursor: 'pointer',
                      border: condition === opt.value ? `2px solid ${opt.color}` : '2px solid #e2e8f0',
                      backgroundColor: condition === opt.value ? `${opt.color}15` : '#f8fafc',
                      color: condition === opt.value ? opt.color : '#64748b',
                      fontWeight: '600', fontSize: '13px'
                    }}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Preview */}
            {pricePerDay && parseFloat(pricePerDay) > 0 && (
              <div style={{ background: 'linear-gradient(135deg, #1a3a5c, #26619C)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(26,58,92,0.25)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0 0 10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Preview</p>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {[1, 3, 7].map(days => (
                    <div key={days} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 2px' }}>₱{(parseFloat(pricePerDay) * days).toFixed(0)}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{days}d</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '16px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a3a5c, #26619C)',
              color: '#ffffff', fontWeight: '700', borderRadius: '14px',
              border: 'none', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(26,58,92,0.3)'
            }}>{loading ? 'Listing item...' : '🚀 List Item'}</button>

          </form>
        </div>
      </div>
    </>
  )
}