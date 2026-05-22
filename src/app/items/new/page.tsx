'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Upload, DollarSign, Tag, FileText, X } from 'lucide-react'

export default function NewItemPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) { setError('Please upload a photo of the item before publishing.'); return }
    if (!title.trim()) { setError('Please enter an item title.'); return }
    if (!pricePerDay || parseFloat(pricePerDay) <= 0) { setError('Please enter a valid price per day.'); return }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Upload image
      const ext = imageFile.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(path, imageFile, { upsert: false })

      if (uploadError) {
        throw new Error(`Photo upload failed: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(path)

      // Insert item
      const { data, error: insertError } = await supabase.from('items').insert({
        owner_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId || null,
        price_per_day: parseFloat(pricePerDay),
        image_url: publicUrl,
        status: 'available',
      }).select().single()

      if (insertError) throw new Error(insertError.message)

      router.push(`/items/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 800,
    color: 'var(--tx-muted)', marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    fontSize: '14px', borderRadius: '12px',
    boxSizing: 'border-box',
  }

  return (
    <>
      <style>{`
        .ni { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .ni-banner { position: relative; overflow: hidden; padding: 44px 28px 96px; border-bottom: 1px solid rgba(6,214,33,0.08); }
        .ni-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 50% 70% at 90% 0%, rgba(110,255,128,0.06), transparent 55%); pointer-events: none; }
        .ni-banner::after  { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent); }
        .ni-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1); border-radius: 22px; padding: 28px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
        .ni-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        .ni-upload-zone { height: 200px; background: var(--bg-raised); border: 2px dashed rgba(4,149,22,0.22); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; gap: 10px; }
        .ni-upload-zone:hover { border-color: rgba(4,149,22,0.4); background: rgba(4,149,22,0.03); }
        .ni-preview { background: linear-gradient(135deg, #011E05, #023D09 50%, #011E05); border: 1px solid rgba(6,214,33,0.08); border-radius: 20px; padding: 24px; position: sticky; top: 84px; overflow: hidden; }
        .ni-preview::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(110,255,128,0.2), transparent); }
        @media (max-width: 900px) { .ni-grid { grid-template-columns: 1fr; } .ni-preview { position: static; } }
      `}</style>

      <div className="ni">
        <div className="ni-banner">
          <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            <Link href="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--tx-muted)', textDecoration: 'none', marginBottom: '20px', fontWeight: '600' }}>
              <ArrowLeft size={14} strokeWidth={2} /> Back to Browse
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6EFF80' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>New Listing</span>
            </div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: 0 }}>
              List an Item
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '-60px auto 0', padding: '0 28px 60px' }}>
          {error && (
            <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px', lineHeight: '1.5' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="ni-grid">
              <div>
                {/* Photo — REQUIRED */}
                <div className="ni-card">
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Item Photo <span style={{ color: '#EF4444' }}>*</span>
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', marginBottom: '14px', lineHeight: '1.5' }}>
                    Required — so renters can see the current condition of your item before requesting.
                  </p>

                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '14px', border: '1.5px solid rgba(4,149,22,0.15)', display: 'block' }} />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview('') }}
                        style={{ position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFFFFF' }}>
                        <X size={14} strokeWidth={2.5} />
                      </button>
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(4,149,22,0.88)', borderRadius: '7px', padding: '4px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>✓ Photo ready</span>
                      </div>
                    </div>
                  ) : (
                    <label className="ni-upload-zone">
                      <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                      <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.07)', border: '1px solid rgba(4,149,22,0.18)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={22} color="var(--g-rich)" strokeWidth={1.8} />
                      </div>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-bright)', margin: 0 }}>Click to upload photo</p>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>JPG, PNG · Max 10MB</p>
                    </label>
                  )}
                </div>

                {/* Item Info */}
                <div className="ni-card">
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>Item Information</h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>
                      <Tag size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      Item Title <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Scientific Calculator" style={inputStyle} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>
                      <FileText size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe the item's condition, what's included, any usage notes..."
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical' as const }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        <DollarSign size={10} style={{ display: 'inline', marginRight: '4px' }} />
                        Price per Day (₱) <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="number"
                        value={pricePerDay}
                        onChange={e => setPricePerDay(e.target.value)}
                        required placeholder="0.00" min="1" step="0.01"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    disabled={loading || !imageFile}
                    className="btn-gold"
                    style={{ fontSize: '15px', padding: '13px 32px', opacity: (loading || !imageFile) ? 0.55 : 1 }}
                  >
                    {loading ? 'Publishing...' : 'Publish Listing'}
                  </button>
                  <Link href="/items" className="btn-ghost" style={{ fontSize: '15px', padding: '13px 24px' }}>Cancel</Link>
                </div>

                {!imageFile && (
                  <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '10px', fontWeight: '600' }}>
                    ⚠ Upload a photo before publishing.
                  </p>
                )}
              </div>

              {/* Preview */}
              <div>
                <div className="ni-preview" style={{ position: 'relative' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(240,255,242,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                    Listing Preview
                  </p>
                  {imagePreview && (
                    <img src={imagePreview} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  )}
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#F0FFF2', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                    {title || 'Your item title'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'rgba(240,255,242,0.5)', margin: '0 0 18px', lineHeight: '1.6' }}>
                    {description || 'Description will appear here'}
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(240,255,242,0.55)', fontWeight: '600' }}>Price per day</span>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: '#6EFF80', letterSpacing: '-0.04em' }}>₱{pricePerDay || '0'}</span>
                  </div>
                  {!imageFile && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '11px', color: '#FCA5A5', margin: 0, fontWeight: '600' }}>📷 Photo required to publish</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}