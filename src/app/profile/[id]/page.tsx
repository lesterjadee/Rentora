import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcon'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  const { data: reviews } = await supabase
    .from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)')
    .eq('reviewee_id', id).order('created_at', { ascending: false })
  const { data: items } = await supabase
    .from('items').select('*, categories(name, icon)').eq('owner_id', id).eq('status', 'available')

  if (!profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <p style={{ color: 'var(--tx-muted)' }}>Profile not found</p>
    </div>
  )

  const trustScore = profile.trust_score || 0
  const totalReviews = reviews?.length || 0
  const itemsListed = items?.length || 0

  const trustConfig = trustScore >= 4
    ? { color: '#2ECC8F', bg: 'var(--g-glow)', border: 'rgba(34,168,118,0.25)', label: 'Highly Trusted' }
    : trustScore >= 3
    ? { color: '#93C5FD', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', label: 'Trusted' }
    : trustScore >= 2
    ? { color: '#E2C07A', bg: 'var(--au-glow)', border: 'rgba(201,168,76,0.25)', label: 'Building Trust' }
    : { color: 'var(--tx-muted)', bg: 'rgba(255,255,255,0.04)', border: 'var(--border-sub)', label: 'New Member' }

  const commScore = totalReviews > 0
    ? Math.round((reviews!.reduce((sum, r) => sum + (r.communication_rating || r.rating * 2), 0) / totalReviews) * 10)
    : 0
  const qualScore = totalReviews > 0
    ? Math.round((reviews!.reduce((sum, r) => sum + (r.item_quality_rating || r.rating * 2), 0) / totalReviews) * 10)
    : 0
  const relScore = totalReviews > 0
    ? Math.round((reviews!.reduce((sum, r) => sum + (r.reliability_rating || r.rating * 2), 0) / totalReviews) * 10)
    : 0

  const StarRow = ({ rating }: { rating: number }) => (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1,2,3,4,5].map(s => (
        <div key={s} style={{ width: '11px', height: '11px', borderRadius: '3px', background: s <= rating ? 'linear-gradient(135deg, var(--au-dark), var(--au-mid))' : 'var(--bg-hover)', border: s <= rating ? 'none' : '1px solid var(--border-sub)' }} />
      ))}
    </div>
  )

  return (
    <>
      <style>{`
        .prof { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .prof-banner {
          position: relative; overflow: hidden;
          padding: 64px 28px 110px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 35%, #0D1A0F 60%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
          text-align: center;
        }
        .prof-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,168,118,0.07), transparent 60%); pointer-events: none; }
        .prof-banner::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent); }
        .prof-avatar {
          width: 84px; height: 84px;
          background: linear-gradient(135deg, var(--g-dark), var(--g-rich), var(--g-vivid));
          border: 2px solid rgba(34,168,118,0.3);
          border-radius: 24px; margin: 0 auto 18px;
          display: flex; align-items: center; justify-content: center;
          color: #22A876; font-weight: 900; font-size: 34px;
          box-shadow: 0 0 32px rgba(34,168,118,0.2), var(--shadow-xl);
          position: relative;
        }
        .prof-avatar::after { content: ''; position: absolute; inset: -4px; border-radius: 28px; border: 1px solid rgba(34,168,118,0.12); pointer-events: none; }
        .prof-inner { max-width: 1100px; margin: 0 auto; padding: 0 28px 60px; }
        .prof-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0; margin-top: -60px; margin-bottom: 28px;
          background: var(--bg-card); border: 1px solid var(--border-mid);
          border-radius: 20px; overflow: hidden;
          box-shadow: var(--shadow-xl);
          position: relative; z-index: 1;
        }
        .prof-stat { padding: 26px 20px; text-align: center; transition: background 0.2s; border-right: 1px solid var(--border-sub); }
        .prof-stat:last-child { border-right: none; }
        .prof-stat:hover { background: var(--bg-hover); }
        .prof-content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .prof-section { background: var(--bg-card); border: 1px solid var(--border-sub); border-radius: 22px; padding: 26px; box-shadow: var(--shadow-md); }
        .prof-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-sub); }
        .prof-section-bar { width: 3px; height: 20px; border-radius: 999px; flex-shrink: 0; }
        .prof-review-card { background: var(--bg-raised); border: 1px solid var(--border-sub); border-radius: 14px; padding: 16px; margin-bottom: 10px; transition: border-color 0.2s; }
        .prof-review-card:hover { border-color: rgba(201,168,76,0.15); }
        .prof-item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-raised); border: 1px solid var(--border-sub); border-radius: 12px; margin-bottom: 8px; text-decoration: none; transition: all 0.2s; }
        .prof-item-row:hover { border-color: rgba(34,168,118,0.2); background: var(--bg-hover); }
        .prof-progress-track { height: 5px; background: var(--bg-raised); border-radius: 999px; overflow: hidden; margin-top: 8px; }
        @media (max-width: 800px) { .prof-content { grid-template-columns: 1fr; } .prof-banner { padding: 52px 20px 96px; } }
        @media (max-width: 560px) { .prof-stats { grid-template-columns: 1fr; } .prof-stat { border-right: none; border-bottom: 1px solid var(--border-sub); } .prof-stat:last-child { border-bottom: none; } }
      `}</style>

      <div className="prof">
        {/* Banner */}
        <div className="prof-banner">
          <div style={{ position: 'relative' }}>
            <div className="prof-avatar">{profile.full_name?.charAt(0).toUpperCase()}</div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: '900', color: 'var(--tx-bright)', margin: '0 0 6px', letterSpacing: '-0.04em' }}>{profile.full_name}</h1>
            <p style={{ fontSize: '13px', color: 'var(--tx-muted)', marginBottom: '18px' }}>
              College Student · Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            {trustScore > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 18px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '999px', boxShadow: '0 0 16px rgba(201,168,76,0.1)' }}>
                <Star size={13} fill="#C9A84C" color="#C9A84C" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--au-light)', letterSpacing: '0.02em' }}>{trustScore} · {trustConfig.label}</span>
              </div>
            )}
          </div>
        </div>

        <div className="prof-inner">
          {/* Stats */}
          <div className="prof-stats">
            {[
              { label: 'Trust Score',  value: trustScore || '--', color: '#E2C07A' },
              { label: 'Total Reviews', value: totalReviews,       color: '#2ECC8F' },
              { label: 'Items Listed', value: itemsListed,         color: '#C4B5FD' },
            ].map((stat, i) => (
              <div key={i} className="prof-stat">
                <p style={{ fontSize: '10px', color: 'var(--tx-muted)', fontWeight: '800', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: '0 0 10px' }}>{stat.label}</p>
                <p style={{ fontSize: '38px', fontWeight: '900', color: stat.color, margin: 0, letterSpacing: '-0.05em', lineHeight: 1 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="prof-content">

            {/* Reviews */}
            <div className="prof-section">
              <div className="prof-section-head">
                <div className="prof-section-bar" style={{ background: 'var(--au-mid)', boxShadow: '0 0 8px rgba(201,168,76,0.4)' }} />
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Reviews</h2>
                {totalReviews > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--au-light)', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.2)', padding: '3px 10px', borderRadius: '999px', marginLeft: 'auto' }}>
                    {totalReviews}
                  </span>
                )}
              </div>
              {reviews && reviews.length > 0 ? (
                reviews.map((review: any) => (
                  <div key={review.id} className="prof-review-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontWeight: '800', fontSize: '13px', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.01em' }}>{review.reviewer?.full_name}</p>
                      <StarRow rating={review.rating} />
                    </div>
                    {review.comment && <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: '0 0 8px', lineHeight: '1.6' }}>{review.comment}</p>}
                    <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0, fontWeight: '600' }}>{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: '28px', marginBottom: '10px' }}>⭐</p>
                  <p style={{ fontWeight: '700', color: 'var(--tx-muted)', fontSize: '14px', margin: 0 }}>No reviews yet</p>
                </div>
              )}
            </div>

            {/* Items + Trust Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>

              {/* Listed Items */}
              <div className="prof-section">
                <div className="prof-section-head">
                  <div className="prof-section-bar" style={{ background: '#2ECC8F', boxShadow: '0 0 8px rgba(34,168,118,0.4)' }} />
                  <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Listed Items</h2>
                  {itemsListed > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#2ECC8F', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', padding: '3px 10px', borderRadius: '999px', marginLeft: 'auto' }}>
                      {itemsListed}
                    </span>
                  )}
                </div>
                {items && items.length > 0 ? (
                  items.map((item: any) => (
                    <Link key={item.id} href={`/items/${item.id}`} className="prof-item-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CategoryIcon name={item.categories?.name || 'Other'} size={17} color="#22A876" />
                        </div>
                        <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.01em' }}>{item.title}</p>
                      </div>
                      <div style={{ textAlign: 'right' as const }}>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#2ECC8F', letterSpacing: '-0.02em' }}>₱{item.price_per_day}</span>
                        <span style={{ fontSize: '10px', color: 'var(--tx-muted)' }}>/day</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                    <p style={{ fontWeight: '700', color: 'var(--tx-muted)', fontSize: '13px', margin: 0 }}>No items listed</p>
                  </div>
                )}
              </div>

              {/* Trust Breakdown */}
              {totalReviews > 0 && (
                <div className="prof-section">
                  <div className="prof-section-head">
                    <div className="prof-section-bar" style={{ background: 'var(--au-mid)', boxShadow: '0 0 8px rgba(201,168,76,0.4)' }} />
                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Trust Breakdown</h2>
                  </div>
                  {[
                    { label: 'Communication', value: commScore, color: '#2ECC8F', gradient: 'linear-gradient(90deg, #22A876, #2ECC8F)' },
                    { label: 'Item Quality',  value: qualScore, color: '#93C5FD', gradient: 'linear-gradient(90deg, #3B82F6, #93C5FD)' },
                    { label: 'Reliability',   value: relScore,  color: '#E2C07A', gradient: 'linear-gradient(90deg, var(--au-dark), var(--au-mid))' },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: i < 2 ? '16px' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx-muted)', margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{item.label}</p>
                        <p style={{ fontSize: '13px', fontWeight: '800', color: item.color, margin: 0 }}>{item.value}%</p>
                      </div>
                      <div className="prof-progress-track">
                        <div style={{ height: '100%', width: `${item.value}%`, background: item.gradient, borderRadius: '999px', boxShadow: `0 0 8px ${item.color}40`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--border-sub)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx-muted)', margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Overall</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRow rating={Math.round(trustScore)} />
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#E2C07A', letterSpacing: '-0.03em' }}>{trustScore}</span>
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