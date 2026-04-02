import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)`)
    .eq('reviewee_id', id).order('created_at', { ascending: false })
  const { data: items } = await supabase
    .from('items').select('*').eq('owner_id', id).eq('status', 'available')

  if (!profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Profile not found</p>
    </div>
  )

  const trustScore = profile.trust_score || 0
  const trustConfig = trustScore >= 4
    ? { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Highly Trusted' }
    : trustScore >= 3
    ? { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Trusted' }
    : trustScore >= 2
    ? { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Building Trust' }
    : { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', label: 'New Member' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '60px 24px 100px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            borderRadius: '24px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#ffffff', fontWeight: '800',
            fontSize: '32px', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)'
          }}>
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{profile.full_name}</h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>Gordon College · Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: '700',
            backgroundColor: trustConfig.bg, color: trustConfig.color,
            border: `1px solid ${trustConfig.border}`,
            padding: '8px 20px', borderRadius: '999px'
          }}>
            <span>★</span> {trustScore} · {trustConfig.label}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-60px auto 0', padding: '0 24px 48px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Trust Score', value: trustScore || '--', color: '#d97706' },
            { label: 'Total Reviews', value: profile.total_reviews || 0, color: '#26619C' },
            { label: 'Items Listed', value: items?.length || 0, color: '#7c3aed' },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff', borderRadius: '16px',
              border: '1px solid #e8edf2', padding: '24px', textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              <p style={{ fontSize: '36px', fontWeight: '800', color: stat.color, margin: '0 0 6px' }}>{stat.value}</p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, fontWeight: '600' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Reviews */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '4px', height: '20px', backgroundColor: '#d97706', borderRadius: '999px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Reviews ({reviews?.length || 0})</h2>
            </div>
            {reviews && reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reviews.map((review: any) => (
                  <div key={review.id} style={{
                    backgroundColor: '#ffffff', borderRadius: '14px',
                    border: '1px solid #e8edf2', padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', margin: 0 }}>{review.reviewer?.full_name}</p>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ fontSize: '13px', filter: s <= review.rating ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                        ))}
                      </div>
                    </div>
                    {review.comment && <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px', lineHeight: '1.6' }}>{review.comment}</p>}
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e8edf2', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>⭐</p>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No reviews yet</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '4px', height: '20px', backgroundColor: '#26619C', borderRadius: '999px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Listed Items ({items?.length || 0})</h2>
            </div>
            {items && items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item: any) => (
                  <Link key={item.id} href={`/items/${item.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      backgroundColor: '#ffffff', borderRadius: '14px',
                      border: '1px solid #e8edf2', padding: '16px 20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <p style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a', margin: 0 }}>{item.title}</p>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#26619C' }}>₱{item.price_per_day}<span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '400' }}>/day</span></span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e8edf2', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>📦</p>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No items listed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}