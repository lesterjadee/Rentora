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

  const inputStyle = {
    width: '100%', padding: '13px 16px', backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '14px', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box' as const
  }

  const conditionOptions = [
    { value: 'new',      label: 'New',      icon: <Sparkles size={16} color="#16a34a" strokeWidth={2} />,  activeColor: '#16a34a', activeBg: '#f0fdf4', activeBorder: '#86efac' },
    { value: 'like_new', label: 'Like New', icon: <Star size={16} color="#2563eb" strokeWidth={2} />,      activeColor: '#2563eb', activeBg: '#eff6ff', activeBorder: '#bfdbfe' },
    { value: 'good',     label: 'Good',     icon: <ThumbsUp size={16} color="#d97706" strokeWidth={2} />,  activeColor: '#d97706', activeBg: '#fffbeb', activeBorder: '#fde68a' },
    { value: 'fair',     label: 'Fair',     icon: <Wrench size={16} color="#ea580c" strokeWidth={2} />,    activeColor: '#ea580c', activeBg: '#fff7ed', activeBorder: '#fed7aa' },
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

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/items" style={{
              width: '38px', height: '38px', backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', textDecoration: 'none', flexShrink: 0
            }}>
              <ArrowLeft size={18} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Marketplace</p>
              <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '800', color: '#ffffff', margin: 0 }}>List an Item</h1>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 24px' }}>
          {error && (
            <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="new-item-form">

            {/* Image Upload */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Item Photo</label>
              <div style={{
                border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '20px',
                textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', position: 'relative'
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />
                ) : (
                  <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '52px', height: '52px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={24} color="#26619C" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px', fontWeight: '600' }}>Upload a photo</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>PNG, JPG up to 10MB</p>
                    </div>
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
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder="Describe your item..."
                  style={{ ...inputStyle, resize: 'none' as const, lineHeight: '1.6' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
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
                  {conditionOptions.map((opt) => {
                    const isActive = condition === opt.value
                    return (
                      <button key={opt.value} type="button" onClick={() => setCondition(opt.value)} style={{
                        padding: '12px 8px', borderRadius: '12px', cursor: 'pointer',
                        border: `2px solid ${isActive ? opt.activeBorder : '#e2e8f0'}`,
                        backgroundColor: isActive ? opt.activeBg : '#f8fafc',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        transition: 'all 0.15s'
                      }}>
                        {opt.icon}
                        <span style={{ fontSize: '12px', fontWeight: '600', color: isActive ? opt.activeColor : '#64748b' }}>
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Price Preview */}
            <div style={{
              background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
              borderRadius: '16px', padding: '24px',
              boxShadow: '0 4px 16px rgba(26,58,92,0.25)'
            }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Price Preview
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[{ days: 1, label: '1 day' }, { days: 3, label: '3 days' }, { days: 7, label: '7 days' }].map(({ days, label }) => {
                  const price = pricePerDay && parseFloat(pricePerDay) > 0
                    ? (parseFloat(pricePerDay) * days).toFixed(0) : '--'
                  return (
                    <div key={days} style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px', padding: '14px', textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px', lineHeight: 1 }}>
                        {price !== '--' ? `₱${price}` : '--'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: '600' }}>{label}</p>
                    </div>
                  )
                })}
              </div>
              {(!pricePerDay || parseFloat(pricePerDay) <= 0) && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '12px 0 0', textAlign: 'center' }}>
                  Enter a price above to see the preview
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '16px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a3a5c, #26619C)',
              color: '#ffffff', fontWeight: '700', borderRadius: '14px',
              border: 'none', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(26,58,92,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}>
              <ImagePlus size={20} strokeWidth={2} />
              {loading ? 'Listing item...' : 'List Item'}
            </button>

          </form>
        </div>
      </div>
    </>
  )
}