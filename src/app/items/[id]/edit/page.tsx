'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
      title, description,
      price_per_day: parseFloat(pricePerDay),
      condition, category_id: categoryId ? parseInt(categoryId) : null,
      location, status, updated_at: new Date().toISOString()
    }).eq('id', id)
    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/items/${id}`)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return
    await supabase.from('items').delete().eq('id', id)
    router.push('/items')
    router.refresh()
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '14px', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box' as const
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: '600' as const, color: '#374151', marginBottom: '8px'
  }

  const conditionOptions = [
    { value: 'new', label: '✨ New', color: '#16a34a' },
    { value: 'like_new', label: '👌 Like New', color: '#2563eb' },
    { value: 'good', label: '👍 Good', color: '#d97706' },
    { value: 'fair', label: '🔧 Fair', color: '#ea580c' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href={`/items/${id}`} style={{
            width: '38px', height: '38px', backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', textDecoration: 'none', fontSize: '18px'
          }}>←</Link>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>My Listing</p>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Edit Item</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

        {error && (
          <div style={{ marginBottom: '20px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>Item Details</h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' as const, lineHeight: '1.6' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Price per Day (₱) *</label>
                <input type="number" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required min="1" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Condition</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {conditionOptions.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setCondition(opt.value)} style={{
                    padding: '10px 8px', borderRadius: '10px', cursor: 'pointer',
                    border: condition === opt.value ? `2px solid ${opt.color}` : '2px solid #e2e8f0',
                    backgroundColor: condition === opt.value ? `${opt.color}15` : '#f8fafc',
                    color: condition === opt.value ? opt.color : '#64748b',
                    fontWeight: '600', fontSize: '12px'
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Availability Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { value: 'available', label: '✅ Available', color: '#16a34a' },
                  { value: 'unavailable', label: '⏸️ Unavailable', color: '#64748b' },
                ].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setStatus(opt.value)} style={{
                    padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    border: status === opt.value ? `2px solid ${opt.color}` : '2px solid #e2e8f0',
                    backgroundColor: status === opt.value ? `${opt.color}15` : '#f8fafc',
                    color: status === opt.value ? opt.color : '#64748b',
                    fontWeight: '600', fontSize: '13px'
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '16px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a3a5c, #26619C)',
              color: '#ffffff', fontWeight: '700', borderRadius: '14px',
              border: 'none', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(26,58,92,0.3)'
            }}>{loading ? 'Saving...' : '💾 Save Changes'}</button>

            <button type="button" onClick={handleDelete} style={{
              padding: '16px 24px', backgroundColor: '#fef2f2',
              color: '#dc2626', fontWeight: '700', borderRadius: '14px',
              border: '1px solid #fecaca', fontSize: '15px', cursor: 'pointer'
            }}>🗑️ Delete</button>
          </div>
        </form>
      </div>
    </div>
  )
}