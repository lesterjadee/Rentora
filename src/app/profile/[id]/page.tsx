import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, Package, ClipboardList, MessageSquare, ArrowUpRight } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcon'

function getTrustTier(score: number | null) {
  if (!score || score === 0) return 'normal'
  if (score >= 4.0) return 'highly_trusted'
  if (score >= 3.0) return 'normal'
  return 'low_trust'
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', params.id).single()
  if (!profile) notFound()

  const { data: items } = await supabase
    .from('items').select('*, categories(name, icon)')
    .eq('owner_id', params.id).order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)')
    .eq('reviewee_id', params.id).order('created_at', { ascending: false })

  const isOwnProfile = user.id === params.id
  const tier = getTrustTier(profile.trust_score)

  return (
    <>
      <style>{`
        .prof { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .prof-banner {
          position: relative; overflow: hidden;
          padding: 52px 28px 110px;
          border-bottom: 1px solid rgba(6,214,33,0.08);
        }
        .prof-banner::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 70% at 100% 0%, rgba(110,255,128,0.07), transparent 55%);
          pointer-events: none;
        }
        .prof-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent);
        }
        .prof-avatar {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid));
          border: 3px solid rgba(4,149,22,0.3); border-radius: 22px;
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF; font-weight: 900; font-size: 32px; flex-shrink: 0;
          box-shadow: 0 0 24px rgba(4,149,22,0.15), var(--shadow-lg);
        }
        .prof-stats {
          background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.15);
          border-radius: 20px; display: flex; overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        .prof-stat {
          flex: 1; padding: 22px 20px; text-align: center;
          border-right: 1px solid rgba(4,149,22,0.08); transition: background 0.2s;
        }
        .prof-stat:last-child { border-right: none; }
        .prof-stat:hover { background: var(--bg-raised); }
        .prof-section {
          background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1);
          border-radius: 22px; padding: 28px;
          box-shadow: var(--shadow-sm); margin-bottom: 16px;
        }
        .prof-review-card {
          background: var(--bg-raised); border: 1px solid rgba(4,149,22,0.08);
          border-radius: 14px; padding: 16px; margin-bottom: 10px; transition: border-color 0.2s;
        }
        .prof-review-card:last-child { margin-bottom: 0; }
        .prof-review-card:hover { border-color: rgba(4,149,22,0.2); }
        .prof-item-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; background: var(--bg-raised);
          border: 1px solid rgba(4,149,22,0.07); border-radius: 12px;
          margin-bottom: 8px; text-decoration: none; transition: all 0.2s;
        }
        .prof-item-row:last-child { margin-bottom: 0; }
        .prof-item-row:hover { background: #FFFFFF; border-color: rgba(4,149,22,0.2); box-shadow: var(--shadow-sm); }
        .prof-progress-track { height: 6px; background: var(--bg-hover); border-radius: 999px; overflow: hidden; margin-top: 6px; }
        .prof-progress-fill { height: 100%; background: linear-gradient(90deg, var(--au-dark), var(--au-mid)); border-radius: 999px; }

        .tier-highly-trusted {
          display: inline-flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(226,192,122,0.1));
          border: 1px solid rgba(201,168,76,0.35);
          border-radius: 999px; padding: 4px 12px;
          font-size: 12px; font-weight: 800; color: var(--au-dark);
        }
        .tier-normal {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(4,149,22,0.08); border: 1px solid rgba(4,149,22,0.22);
          border-radius: 999px; padding: 4px 12px;
          font-size: 12px; font-weight: 800; color: var(--g-rich);
        }
        .tier-low-trust {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 999px; padding: 4px 12px;
          font-size: 12px; font-weight: 800; color: #B91C1C;
        }

        @media (max-width: 640px) {
          .prof-stats { flex-direction: column; }
          .prof-stat { border-right: none; border-bottom: 1px solid rgba(4,149,22,0.08); }
          .prof-stat:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="prof">
        <div className="prof-banner">
          <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>

              <div className="prof-avatar">
                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6EFF80' }} />
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Gordon College</span>
                </div>

                <h1 style={{ fontSize: 'clamp(22px,5vw,36px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: '0 0 10px' }}>
                  {profile.full_name}
                </h1>

                {/* Trust tier badge */}
                <div style={{ marginBottom: '8px' }}>
                  {tier === 'highly_trusted' && (
                    <span className="tier-highly-trusted">★ Highly Trusted</span>
                  )}
                  {tier === 'normal' && (
                    <span className="tier-normal">✓ Normal User</span>
                  )}
                  {tier === 'low_trust' && (
                    <span className="tier-low-trust">⚠ Low Trust</span>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0 }}>
                  {profile.student_id} · {profile.email}
                </p>
              </div>

              {isOwnProfile && (
                <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px', color: 'var(--tx-muted)', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '-72px auto 0', padding: '0 28px 60px' }}>

          {/* Stats */}
          <div className="prof-stats" style={{ marginBottom: '20px' }}>
            {[
              { label: 'Items Listed', value: items?.length || 0,   icon: <Package size={16} color="var(--g-rich)" strokeWidth={1.8} /> },
              { label: 'Reviews',      value: reviews?.length || 0, icon: <MessageSquare size={16} color="var(--g-rich)" strokeWidth={1.8} /> },
              { label: 'Trust Score',  value: profile.trust_score ? profile.trust_score.toFixed(1) : '—', icon: <Star size={16} fill="#C9A84C" color="#C9A84C" strokeWidth={1} /> },
            ].map((s, i) => (
              <div key={i} className="prof-stat">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>{s.icon}</div>
                <p style={{ fontSize: '28px', fontWeight: '900', color: 'var(--tx-bright)', margin: '0 0 4px', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Trust Score Detail */}
          {profile.trust_score > 0 && (
            <div className="prof-section">
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Trust Score</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="gold-shimmer" style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {profile.trust_score.toFixed(1)}
                </span>
                <div style={{ flex: 1 }}>
                  <div className="prof-progress-track">
                    <div className="prof-progress-fill" style={{ width: `${Math.min((profile.trust_score / 5) * 100, 100)}%` }} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '6px 0 0' }}>
                    Based on {reviews?.length || 0} review{reviews?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Tier description */}
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-raised)', borderRadius: '12px', border: '1px solid rgba(4,149,22,0.08)' }}>
                {tier === 'highly_trusted' && (
                  <p style={{ fontSize: '13px', color: 'var(--au-dark)', margin: 0, fontWeight: '600' }}>
                    ★ <strong>Highly Trusted</strong> — Score 4.0+. Enjoys unlimited rentals, priority visibility, and no restrictions.
                  </p>
                )}
                {tier === 'normal' && (
                  <p style={{ fontSize: '13px', color: 'var(--g-rich)', margin: 0, fontWeight: '600' }}>
                    ✓ <strong>Normal User</strong> — Score 3.0–3.99. Standard platform experience with no restrictions.
                  </p>
                )}
                {tier === 'low_trust' && (
                  <p style={{ fontSize: '13px', color: '#B91C1C', margin: 0, fontWeight: '600' }}>
                    ⚠ <strong>Low Trust</strong> — Score below 3.0. Limited to 1 active rental at a time, with a 12-hour delay on new requests.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Listed Items */}
          {items && items.length > 0 && (
            <div className="prof-section">
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Listed Items ({items.length})
              </h3>
              {items.map((item: any) => (
                <Link key={item.id} href={`/items/${item.id}`} className="prof-item-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', background: 'rgba(4,149,22,0.07)', border: '1px solid rgba(4,149,22,0.14)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CategoryIcon name={item.categories?.name || 'Other'} size={18} color="var(--g-rich)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--tx-bright)', margin: 0 }}>{item.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: 0 }}>₱{item.price_per_day}/day</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-${item.status}`}>{item.status}</span>
                    <ArrowUpRight size={13} color="var(--tx-dim)" strokeWidth={2} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="prof-section">
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Reviews ({reviews.length})
              </h3>
              {reviews.map((review: any) => {
                const avg = ((review.communication_rating + review.item_quality_rating + review.reliability_rating) / 3).toFixed(1)
                return (
                  <div key={review.id} className="prof-review-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--tx-bright)', margin: 0 }}>
                        {review.reviewer?.full_name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: '999px' }}>
                        <Star size={11} fill="#C9A84C" color="#C9A84C" />
                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--au-dark)' }}>{avg}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: review.comment ? '8px' : 0 }}>
                      {[
                        { l: 'Comm',    v: review.communication_rating },
                        { l: 'Quality', v: review.item_quality_rating },
                        { l: 'Trust',   v: review.reliability_rating },
                      ].map((r, i) => (
                        <div key={i} style={{ padding: '2px 8px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--g-rich)' }}>{r.l}: {r.v}</span>
                        </div>
                      ))}
                    </div>
                    {review.comment && (
                      <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0, lineHeight: '1.6' }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {(!items || items.length === 0) && (!reviews || reviews.length === 0) && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(4,149,22,0.1)', borderRadius: '22px', padding: '60px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <Package size={32} color="var(--tx-dim)" strokeWidth={1.5} style={{ margin: '0 auto 14px' }} />
              <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--tx-body)', marginBottom: '6px' }}>No activity yet</p>
              <p style={{ fontSize: '13px', color: 'var(--tx-muted)' }}>This user hasn't listed any items or received reviews yet.</p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}