import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('items')
    .select(`*, profiles(id, full_name, trust_score, university), categories(name, icon)`)
    .eq('id', id)
    .single()

  if (!item) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === item.owner_id

  const conditionConfig: any = {
    new:      { label: 'New',      bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    like_new: { label: 'Like New', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    good:     { label: 'Good',     bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
    fair:     { label: 'Fair',     bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  }
  const c = conditionConfig[item.condition] || conditionConfig.good

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/items" style={{
            width: '38px', height: '38px', backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', textDecoration: 'none', fontSize: '18px'
          }}>←</Link>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              {item.categories?.icon} {item.categories?.name}
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0 }}>{item.title}</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Image */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '380px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '380px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '80px' }}>📦</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Price & Status */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '38px', fontWeight: '800', color: '#26619C', margin: 0, lineHeight: 1 }}>
                    ₱{item.price_per_day}
                  </p>
                  <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0' }}>per day</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '6px 14px', borderRadius: '999px',
                    backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`
                  }}>{c.label}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '6px 14px', borderRadius: '999px',
                    backgroundColor: item.status === 'available' ? '#f0fdf4' : '#fef2f2',
                    color: item.status === 'available' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${item.status === 'available' ? '#86efac' : '#fca5a5'}`
                  }}>{item.status}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Location</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>{item.location || 'Not specified'}</p>
                </div>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Category</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>{item.categories?.icon} {item.categories?.name}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Description</p>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{item.description}</p>
              </div>
            )}

            {/* Owner Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>Listed by</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
                  borderRadius: '12px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#ffffff', fontWeight: '800', fontSize: '18px'
                }}>{item.profiles?.full_name?.charAt(0)}</div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', margin: '0 0 3px' }}>{item.profiles?.full_name}</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Gordon College</p>
                  {item.profiles?.trust_score > 0 && (
                    <p style={{ fontSize: '12px', color: '#d97706', margin: '3px 0 0', fontWeight: '700' }}>★ Trust Score: {item.profiles.trust_score}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwner ? (
              <Link href={`/items/${item.id}/edit`} style={{
                display: 'block', textAlign: 'center', padding: '14px',
                backgroundColor: '#f8fafc', color: '#374151', fontWeight: '700',
                borderRadius: '14px', textDecoration: 'none', fontSize: '15px',
                border: '1px solid #e2e8f0'
              }}>✏️ Edit This Item</Link>
            ) : (
              item.status === 'available' && user && (
                <Link href={`/rentals/new?item=${item.id}`} style={{
                  display: 'block', textAlign: 'center', padding: '16px',
                  background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
                  color: '#ffffff', fontWeight: '700', borderRadius: '14px',
                  textDecoration: 'none', fontSize: '16px',
                  boxShadow: '0 4px 16px rgba(26,58,92,0.3)'
                }}>🏷️ Request to Rent</Link>
              )
            )}
            {!user && (
              <Link href="/auth/login" style={{
                display: 'block', textAlign: 'center', padding: '16px',
                background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
                color: '#ffffff', fontWeight: '700', borderRadius: '14px',
                textDecoration: 'none', fontSize: '16px',
                boxShadow: '0 4px 16px rgba(26,58,92,0.3)'
              }}>Sign in to Rent</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}