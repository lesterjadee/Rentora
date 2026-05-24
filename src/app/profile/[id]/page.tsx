'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Star, Package, MessageSquare, ArrowUpRight, ShieldCheck, ShieldAlert, Clock, TrendingUp } from 'lucide-react'

function getTrustTier(score: number | null) {
  if (!score || score === 0) return 'normal'
  if (score >= 4.0) return 'highly_trusted'
  if (score >= 3.0) return 'normal'
  return 'low_trust'
}

export default function ProfilePage() {
  const params    = useParams()
  const router    = useRouter()
  const profileId = params.id as string
  const supabase  = createClient()

  const [profile, setProfile]     = useState<any>(null)
  const [items, setItems]         = useState<any[]>([])
  const [reviews, setReviews]     = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setCurrentUser(user)

      const [
        { data: profileData },
        { data: itemsData },
        { data: reviewsData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', profileId).single(),
        supabase.from('items').select('*, categories(name)').eq('owner_id', profileId).eq('status', 'available').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name)').eq('reviewee_id', profileId).order('created_at', { ascending: false }),
      ])

      if (!profileData) { router.push('/dashboard'); return }
      setProfile(profileData)
      setItems(itemsData || [])
      setReviews(reviewsData || [])
      setLoading(false)
    }
    init()
  }, [profileId])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <div style={{ width: '52px', height: '52px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={24} color="var(--g-rich)" strokeWidth={1.5} />
      </div>
    </div>
  )

  if (!profile) return null

  const isOwnProfile = currentUser?.id === profileId
  const tier = getTrustTier(profile.trust_score)
  const score = Number(profile.trust_score || 0)

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + ((r.communication_rating + r.item_quality_rating + r.reliability_rating) / 3), 0) / reviews.length)
    : 0

  return (
    <>
      <style>{`
        .prof-page { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        /* ── BANNER ── */
        .prof-banner {
          position: relative; overflow: hidden;
          padding: 56px 28px 120px;
          border-bottom: 1px solid rgba(6,214,33,0.08);
        }
        .prof-banner::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 100% 0%, rgba(110,255,128,0.08), transparent 55%);
          pointer-events: none;
        }
        .prof-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent);
        }

        /* ── AVATAR ── */
        .prof-avatar-ring {
          width: 96px; height: 96px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--g-deep), var(--g-dark) 50%, var(--g-mid));
          border: 3px solid rgba(110,255,128,0.25);
          border-radius: 26px;
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF; font-weight: 900; font-size: 38px;
          letter-spacing: -0.04em;
          box-shadow: 0 0 30px rgba(4,149,22,0.2), 0 8px 32px rgba(1,30,5,0.3);
        }

        /* ── BODY LAYOUT ── */
        .prof-body { max-width: 960px; margin: -72px auto 0; padding: 0 28px 80px; }
        .prof-cols { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }

        /* ── CARDS ── */
        .prof-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(4,149,22,0.1);
          border-radius: 22px;
          box-shadow: 0 2px 12px rgba(1,30,5,0.06);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .prof-card-header {
          padding: 22px 26px 16px;
          border-bottom: 1px solid rgba(4,149,22,0.07);
          display: flex; align-items: center; justify-content: space-between;
        }
        .prof-card-title {
          font-size: 12px; font-weight: 800; color: var(--tx-muted);
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .prof-card-body { padding: 20px 26px; }

        /* ── STATS ROW ── */
        .prof-stats {
          background: #FFFFFF;
          border: 1.5px solid rgba(4,149,22,0.15);
          border-radius: 20px;
          display: grid; grid-template-columns: repeat(3, 1fr);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(1,30,5,0.1);
          margin-bottom: 20px;
        }
        .prof-stat-cell {
          padding: 22px 16px; text-align: center;
          border-right: 1px solid rgba(4,149,22,0.08);
          transition: background 0.2s;
        }
        .prof-stat-cell:last-child { border-right: none; }
        .prof-stat-cell:hover { background: var(--bg-raised); }

        /* ── SCORE BAR ── */
        .score-track { height: 8px; background: rgba(4,149,22,0.08); border-radius: 999px; overflow: hidden; margin-top: 10px; }
        .score-fill  { height: 100%; background: linear-gradient(90deg, var(--g-mid), var(--au-mid)); border-radius: 999px; transition: width 0.6s ease; }

        /* ── ITEMS ── */
        .prof-item-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(4,149,22,0.07);
          text-decoration: none;
          transition: background 0.15s;
        }
        .prof-item-row:last-child { border-bottom: none; }

        /* ── REVIEW CARD ── */
        .prof-review {
          padding: 18px 0;
          border-bottom: 1px solid rgba(4,149,22,0.07);
        }
        .prof-review:last-child { border-bottom: none; }

        /* ── BADGES ── */
        .badge-verified  { display: inline-flex; align-items: center; gap: 5px; padding: 5px 13px; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.25); border-radius: 999px; font-size: 12px; font-weight: 800; color: #1D4ED8; }
        .badge-pending   { display: inline-flex; align-items: center; gap: 5px; padding: 5px 13px; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 999px; font-size: 12px; font-weight: 800; color: var(--au-dark); }
        .badge-rejected  { display: inline-flex; align-items: center; gap: 5px; padding: 5px 13px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22); border-radius: 999px; font-size: 12px; font-weight: 800; color: #B91C1C; }
        .badge-high-trust{ display: inline-flex; align-items: center; gap: 5px; padding: 5px 13px; background: linear-gradient(135deg, rgba(201,168,76,0.14), rgba(226,192,122,0.08)); border: 1px solid rgba(201,168,76,0.35); border-radius: 999px; font-size: 12px; font-weight: 800; color: var(--au-dark); }
        .badge-low-trust { display: inline-flex; align-items: center; gap: 5px; padding: 5px 13px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 999px; font-size: 12px; font-weight: 800; color: #B91C1C; }

        /* ── RATING PILLS ── */
        .rating-pill { padding: 3px 9px; background: rgba(4,149,22,0.07); border: 1px solid rgba(4,149,22,0.14); border-radius: 7px; font-size: 11px; font-weight: 700; color: var(--g-rich); }

        /* ── EMPTY ── */
        .prof-empty { padding: 40px 20px; text-align: center; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px)  { .prof-cols { grid-template-columns: 1fr; } }
        @media (max-width: 640px)  { .prof-stats { grid-template-columns: 1fr 1fr 1fr; } .prof-banner { padding: 48px 20px 112px; } .prof-body { padding: 0 20px 60px; } .prof-avatar-ring { width: 80px; height: 80px; font-size: 30px; border-radius: 22px; } }
      `}</style>

      <div className="prof-page">

        {/* ── BANNER ── */}
        <div className="prof-banner">
          <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>

              <div className="prof-avatar-ring">
                {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
                {/* Name */}
                <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: '0 0 12px', lineHeight: 1.05 }}>
                  {profile.full_name || 'Unknown User'}
                </h1>

                {/* Badges row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {profile.is_verified && (
                    <span className="badge-verified">
                      <ShieldCheck size={12} strokeWidth={2.5} /> Verified User
                    </span>
                  )}
                  {!profile.is_verified && profile.id_image_url && profile.verification_status === 'pending' && (
                    <span className="badge-pending">
                      <Clock size={11} strokeWidth={2.5} /> Verification Pending
                    </span>
                  )}
                  {profile.verification_status === 'rejected' && (
                    <span className="badge-rejected">
                      <ShieldAlert size={11} strokeWidth={2.5} /> Not Verified
                    </span>
                  )}
                  {tier === 'highly_trusted' && (
                    <span className="badge-high-trust">
                      <Star size={11} fill="#C9A84C" color="#C9A84C" strokeWidth={0} /> Highly Trusted
                    </span>
                  )}
                  {tier === 'low_trust' && (
                    <span className="badge-low-trust">⚠ Low Trust</span>
                  )}
                </div>

                {/* Meta info */}
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.student_id && (
                    <span style={{ fontWeight: '600' }}>{profile.student_id}</span>
                  )}
                  {profile.student_id && profile.email && (
                    <span style={{ color: 'rgba(240,255,242,0.2)', fontSize: '10px' }}>·</span>
                  )}
                  {profile.email && (
                    <span>{profile.email}</span>
                  )}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', flexShrink: 0, paddingBottom: '4px' }}>
                {isOwnProfile ? (
                  <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px', color: 'rgba(240,255,242,0.7)', fontWeight: '700', fontSize: '13px', textDecoration: 'none', transition: 'all 0.2s' }}>
                    My Dashboard
                  </Link>
                ) : (
                  <Link href={`/messages/${profileId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: 'rgba(4,149,22,0.15)', border: '1px solid rgba(110,255,128,0.2)', borderRadius: '12px', color: '#6EFF80', fontWeight: '700', fontSize: '13px', textDecoration: 'none', transition: 'all 0.2s' }}>
                    <MessageSquare size={14} strokeWidth={2} /> Message
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="prof-body">

          {/* ── STATS ROW ── */}
          <div className="prof-stats">
            {[
              {
                label: 'Items Listed',
                value: items.length,
                icon: <Package size={18} color="var(--g-rich)" strokeWidth={1.8} />,
                color: 'var(--g-mid)',
              },
              {
                label: 'Reviews',
                value: reviews.length,
                icon: <MessageSquare size={18} color="var(--g-rich)" strokeWidth={1.8} />,
                color: 'var(--g-mid)',
              },
              {
                label: 'Trust Score',
                value: score > 0 ? score.toFixed(1) : '—',
                icon: <Star size={18} fill="#C9A84C" color="#C9A84C" strokeWidth={0} />,
                color: 'var(--au-dark)',
              },
            ].map((s, i) => (
              <div key={i} className="prof-stat-cell">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>{s.icon}</div>
                <p style={{ fontSize: '30px', fontWeight: '900', color: s.color, margin: '0 0 5px', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--tx-muted)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="prof-cols">
            {/* ── LEFT COLUMN ── */}
            <div>

              {/* Listed Items */}
              {items.length > 0 && (
                <div className="prof-card">
                  <div className="prof-card-header">
                    <span className="prof-card-title">Listed Items</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx-dim)' }}>{items.length} available</span>
                  </div>
                  <div className="prof-card-body" style={{ padding: '6px 26px 20px' }}>
                    {items.map((item: any) => (
                      <Link key={item.id} href={`/items/${item.id}`} className="prof-item-row">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '13px', border: '1px solid rgba(4,149,22,0.1)', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '52px', height: '52px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={22} color="var(--g-rich)" strokeWidth={1.5} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--tx-muted)' }}>
                              {item.categories?.name}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: '18px', fontWeight: '900', color: 'var(--g-mid)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>₱{item.price_per_day}</p>
                          <p style={{ fontSize: '10px', color: 'var(--tx-dim)', margin: 0 }}>/day</p>
                        </div>
                        <ArrowUpRight size={15} color="var(--tx-dim)" strokeWidth={2} style={{ flexShrink: 0 }} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {reviews.length > 0 && (
                <div className="prof-card">
                  <div className="prof-card-header">
                    <span className="prof-card-title">Reviews</span>
                    {avgRating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '999px' }}>
                        <Star size={11} fill="#C9A84C" color="#C9A84C" strokeWidth={0} />
                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--au-dark)' }}>{avgRating.toFixed(1)}</span>
                        <span style={{ fontSize: '11px', color: 'var(--tx-dim)' }}>avg</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '4px 26px 16px' }}>
                    {reviews.map((review: any) => {
                      const avg = ((review.communication_rating + review.item_quality_rating + review.reliability_rating) / 3).toFixed(1)
                      return (
                        <div key={review.id} className="prof-review">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <Link href={`/profile/${review.reviewer?.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: '900', fontSize: '13px', flexShrink: 0 }}>
                                {review.reviewer?.full_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--tx-bright)', margin: 0 }}>
                                  {review.reviewer?.full_name}
                                </p>
                                <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0 }}>
                                  {new Date(review.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: '999px', flexShrink: 0 }}>
                              <Star size={11} fill="#C9A84C" color="#C9A84C" strokeWidth={0} />
                              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--au-dark)' }}>{avg}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: review.comment ? '10px' : 0 }}>
                            {[
                              { l: 'Communication', v: review.communication_rating },
                              { l: 'Item Quality',  v: review.item_quality_rating },
                              { l: 'Reliability',   v: review.reliability_rating },
                            ].map((r, i) => (
                              <span key={i} className="rating-pill">{r.l}: <strong>{r.v}</strong>/10</span>
                            ))}
                          </div>
                          {review.comment && (
                            <p style={{ fontSize: '13px', color: 'var(--tx-body)', margin: 0, lineHeight: '1.7', background: 'var(--bg-raised)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(4,149,22,0.07)' }}>
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {items.length === 0 && reviews.length === 0 && (
                <div className="prof-card">
                  <div className="prof-empty">
                    <div style={{ width: '56px', height: '56px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Package size={26} color="var(--g-rich)" strokeWidth={1.5} />
                    </div>
                    <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--tx-body)', marginBottom: '6px' }}>No activity yet</p>
                    <p style={{ fontSize: '13px', color: 'var(--tx-muted)' }}>
                      {isOwnProfile ? 'List your first item to get started!' : 'This user has no items or reviews yet.'}
                    </p>
                    {isOwnProfile && (
                      <Link href="/items/new" className="btn-green" style={{ display: 'inline-flex', fontSize: '13px', padding: '10px 22px', marginTop: '16px' }}>
                        List an Item
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div>

              {/* Trust Score Card */}
              <div className="prof-card" style={{ marginBottom: '16px' }}>
                <div className="prof-card-header">
                  <span className="prof-card-title">Trust Score</span>
                  <TrendingUp size={14} color="var(--tx-dim)" strokeWidth={2} />
                </div>
                <div className="prof-card-body">
                  {score > 0 ? (
                    <>
                      {/* Big score number */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '-0.06em', lineHeight: 1, color: tier === 'highly_trusted' ? 'var(--au-dark)' : tier === 'low_trust' ? '#B91C1C' : 'var(--g-mid)' }}>
                          {score.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '16px', color: 'var(--tx-dim)', marginBottom: '6px', fontWeight: '600' }}>/ 5.0</span>
                      </div>

                      {/* Score bar */}
                      <div className="score-track">
                        <div className="score-fill" style={{ width: `${Math.min((score / 5) * 100, 100)}%`, background: tier === 'highly_trusted' ? 'linear-gradient(90deg, var(--au-dark), var(--au-mid))' : tier === 'low_trust' ? 'linear-gradient(90deg, #B91C1C, #EF4444)' : 'linear-gradient(90deg, var(--g-mid), var(--g-rich))' }} />
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--tx-dim)', margin: '8px 0 18px', fontWeight: '600' }}>
                        Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                      </p>

                      {/* Tier description */}
                      <div style={{ padding: '14px', borderRadius: '14px', background: tier === 'highly_trusted' ? 'rgba(201,168,76,0.08)' : tier === 'low_trust' ? 'rgba(239,68,68,0.07)' : 'rgba(4,149,22,0.06)', border: `1px solid ${tier === 'highly_trusted' ? 'rgba(201,168,76,0.22)' : tier === 'low_trust' ? 'rgba(239,68,68,0.18)' : 'rgba(4,149,22,0.14)'}` }}>
                        {tier === 'highly_trusted' && (
                          <>
                            <p style={{ fontWeight: '800', fontSize: '13px', color: 'var(--au-dark)', margin: '0 0 4px' }}>★ Highly Trusted</p>
                            <p style={{ fontSize: '12px', color: 'var(--au-dark)', margin: 0, opacity: 0.8, lineHeight: '1.5' }}>
                              Score 4.0+. Enjoys priority visibility, unlimited rentals, and instant request delivery.
                            </p>
                          </>
                        )}
                        {tier === 'normal' && (
                          <>
                            <p style={{ fontWeight: '800', fontSize: '13px', color: 'var(--g-rich)', margin: '0 0 4px' }}>✓ Normal User</p>
                            <p style={{ fontSize: '12px', color: 'var(--g-rich)', margin: 0, opacity: 0.8, lineHeight: '1.5' }}>
                              Score 3.0–3.99. Standard experience with no restrictions.
                            </p>
                          </>
                        )}
                        {tier === 'low_trust' && (
                          <>
                            <p style={{ fontWeight: '800', fontSize: '13px', color: '#B91C1C', margin: '0 0 4px' }}>⚠ Low Trust</p>
                            <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, opacity: 0.85, lineHeight: '1.5' }}>
                              Score below 3.0. Limited to 1 active rental at a time with a 12-hour delay on requests.
                            </p>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ width: '48px', height: '48px', background: 'var(--bg-raised)', border: '1px solid rgba(4,149,22,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <Star size={22} color="var(--tx-dim)" strokeWidth={1.5} />
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--tx-muted)', margin: '0 0 4px' }}>No score yet</p>
                      <p style={{ fontSize: '12px', color: 'var(--tx-dim)', margin: 0 }}>Score builds after completed rentals.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Card */}
              <div className="prof-card">
                <div className="prof-card-header">
                  <span className="prof-card-title">ID Verification</span>
                  <ShieldCheck size={14} color="var(--tx-dim)" strokeWidth={2} />
                </div>
                <div className="prof-card-body">
                  {profile.is_verified ? (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '42px', height: '42px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.22)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={20} color="#1D4ED8" strokeWidth={2} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '800', fontSize: '14px', color: '#1D4ED8', margin: '0 0 4px' }}>Verified User ✅</p>
                        <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, lineHeight: '1.5' }}>
                          Identity confirmed by a Rentora admin. This user is a real Gordon College student.
                        </p>
                      </div>
                    </div>
                  ) : profile.id_image_url && profile.verification_status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '42px', height: '42px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Clock size={20} color="var(--au-mid)" strokeWidth={2} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--au-dark)', margin: '0 0 4px' }}>⏳ Pending Review</p>
                        <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, lineHeight: '1.5' }}>
                          ID submitted and awaiting admin verification.
                        </p>
                      </div>
                    </div>
                  ) : profile.verification_status === 'rejected' ? (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '42px', height: '42px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldAlert size={20} color="#EF4444" strokeWidth={2} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '800', fontSize: '14px', color: '#B91C1C', margin: '0 0 4px' }}>❌ Verification Rejected</p>
                        <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, lineHeight: '1.5' }}>
                          {isOwnProfile ? 'Your ID was not accepted. Please re-upload a clearer photo.' : 'Verification was not approved for this account.'}
                        </p>
                        {isOwnProfile && (
                          <Link href="/upload-id" style={{ display: 'inline-flex', marginTop: '10px', fontSize: '12px', padding: '7px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#B91C1C', borderRadius: '9px', fontWeight: '700', textDecoration: 'none' }}>
                            Re-upload ID
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '42px', height: '42px', background: 'var(--bg-raised)', border: '1px solid rgba(4,149,22,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={20} color="var(--tx-dim)" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-muted)', margin: '0 0 4px' }}>Not Verified</p>
                        <p style={{ fontSize: '12px', color: 'var(--tx-dim)', margin: 0, lineHeight: '1.5' }}>
                          {isOwnProfile ? 'Upload your ID to get verified and build trust.' : 'No ID has been submitted for this account.'}
                        </p>
                        {isOwnProfile && (
                          <Link href="/upload-id" className="btn-green" style={{ display: 'inline-flex', fontSize: '12px', padding: '8px 16px', marginTop: '12px' }}>
                            Upload ID Now
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}