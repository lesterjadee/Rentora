import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)`)
    .eq('reviewee_id', id)
    .order('created_at', { ascending: false })
  const { data: items } = await supabase
    .from('items')
    .select('*, categories(name, icon)')
    .eq('owner_id', id)
    .eq('status', 'available')

  if (!profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Profile not found</p>
    </div>
  )

  const trustScore = profile.trust_score || 0
  const totalReviews = reviews?.length || 0
  const itemsListed = items?.length || 0

  const trustConfig = trustScore >= 4
    ? { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Highly Trusted' }
    : trustScore >= 3
    ? { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Trusted' }
    : trustScore >= 2
    ? { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Building Trust' }
    : { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', label: 'New Member' }

  // Calculate trust score breakdown from reviews
  const avgRating = totalReviews > 0
    ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews)
    : 0
  const commScore = totalReviews > 0
  ? Math.round((reviews!.reduce((sum, r) => sum + (r.communication_rating || (r.rating * 2)), 0) / totalReviews) * 10)
  : 0
  const qualScore = totalReviews > 0
  ? Math.round((reviews!.reduce((sum, r) => sum + (r.item_quality_rating || (r.rating * 2)), 0) / totalReviews) * 10)
  : 0
  const relScore = totalReviews > 0
  ? Math.round((reviews!.reduce((sum, r) => sum + (r.reliability_rating || (r.rating * 2)), 0) / totalReviews) * 10)
  : 0

  const StarRating = ({ rating }: { rating: number }) => (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <div key={s} style={{
          width: '12px', height: '12px', borderRadius: '3px',
          backgroundColor: s <= rating ? '#f59e0b' : '#e2e8f0'
        }} />
      ))}
    </div>
  )

  return (
    <>
      <style>{`
        .profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin: 0 0 32px; }
        .profile-content { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 768px) {
          .profile-stats { grid-template-columns: 1fr; }
          .profile-content { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

        {/* Profile Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)',
          padding: '60px 24px 100px', textAlign: 'center'
        }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            borderRadius: '22px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#ffffff', fontWeight: '800',
            fontSize: '32px', margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)'
          }}>
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {profile.full_name}
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', margin: '0 0 20px' }}>
            Gordon College · Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>

          {trustScore > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: trustConfig.bg, border: `1px solid ${trustConfig.border}`,
              borderRadius: '999px', padding: '8px 20px'
            }}>
              <span style={{ fontSize: '16px', color: '#f59e0b' }}>★</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: trustConfig.color }}>
                {trustScore} · {trustConfig.label}
              </span>
            </div>
          )}
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 48px' }}>

          {/* Stats Row — overlaps banner */}
          <div className="profile-stats" style={{ marginTop: '-60px', marginBottom: '32px' }}>
            {[
              { label: 'Trust Score', value: trustScore || '--', color: '#d97706' },
              { label: 'Total Reviews', value: totalReviews, color: '#26619C' },
              { label: 'Items Listed', value: itemsListed, color: '#7c3aed' },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderTop: i > 0 ? 'none' : undefined,
                borderLeft: i > 0 ? 'none' : undefined,
                border: '1px solid #e8edf2',
                borderRadius: i === 0 ? '16px 0 0 16px' : i === 2 ? '0 16px 16px 0' : '0',
                padding: '28px', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: stat.color, margin: 0, lineHeight: 1 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="profile-content">

            {/* Left — Reviews */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '22px', backgroundColor: '#26619C', borderRadius: '999px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Reviews {totalReviews > 0 && <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>({totalReviews})</span>}
                </h2>
              </div>

              {reviews && reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviews.map((review: any) => (
                    <div key={review.id} style={{
                      backgroundColor: '#fafbfc', borderRadius: '14px',
                      border: '1px solid #f1f5f9', padding: '16px 18px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', margin: 0 }}>
                          {review.reviewer?.full_name}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && (
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px', lineHeight: '1.6' }}>
                          {review.comment}
                        </p>
                      )}
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</p>
                  <p style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>No reviews yet</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Reviews appear after completed rentals</p>
                </div>
              )}
            </div>

            {/* Right — Listed Items + Trust Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Listed Items */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: '4px', height: '22px', backgroundColor: '#7c3aed', borderRadius: '999px' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    Listed Items {itemsListed > 0 && <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>({itemsListed})</span>}
                  </h2>
                </div>

                {items && items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {items.map((item: any) => (
                      <Link key={item.id} href={`/items/${item.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '14px 16px', backgroundColor: '#fafbfc',
                          borderRadius: '12px', border: '1px solid #f1f5f9',
                          transition: 'all 0.15s'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', backgroundColor: '#eff6ff',
                              borderRadius: '10px', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '18px', flexShrink: 0
                            }}>
                              {item.categories?.icon || '📦'}
                            </div>
                            <p style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a', margin: 0 }}>
                              {item.title}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: '#26619C' }}>₱{item.price_per_day}</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>/day</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ fontSize: '32px', marginBottom: '10px' }}>📦</p>
                    <p style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>No items listed</p>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>This user hasn't listed any items yet</p>
                  </div>
                )}
              </div>

              {/* Trust Score Breakdown */}
              {totalReviews > 0 && (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px' }}>
                    Trust Score Breakdown
                  </h2>

                  {[
                    { label: 'Communication', value: commScore, color: '#10b981' },
                    { label: 'Item Quality', value: qualScore, color: '#26619C' },
                    { label: 'Reliability', value: relScore, color: '#f59e0b' },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: i < 2 ? '18px' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{item.value}%</p>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${item.value}%`,
                          backgroundColor: item.color,
                          borderRadius: '999px',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                  ))}

                  {/* Overall score */}
                  <div style={{
                    marginTop: '20px', paddingTop: '20px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', margin: 0 }}>Overall Trust Score</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <div key={s} style={{
                            width: '14px', height: '14px', borderRadius: '4px',
                            backgroundColor: s <= Math.round(trustScore) ? '#f59e0b' : '#e2e8f0'
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#d97706' }}>{trustScore}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}