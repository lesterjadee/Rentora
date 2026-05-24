'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Star, Package, MessageSquare, ArrowUpRight,
  ShieldCheck, ShieldAlert, Clock, MessageCircle
} from 'lucide-react'

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

  const [profile, setProfile]         = useState<any>(null)
  const [items, setItems]             = useState<any[]>([])
  const [reviews, setReviews]         = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading]         = useState(true)

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
        supabase.from('items')
          .select('*, categories(name)')
          .eq('owner_id', profileId)
          .eq('status', 'available')
          .order('created_at', { ascending: false }),
        supabase.from('reviews')
          .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name)')
          .eq('reviewee_id', profileId)
          .order('created_at', { ascending: false }),
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '52px', height: '52px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={24} color="var(--g-rich)" strokeWidth={1.5} />
      </div>
    </div>
  )

  if (!profile) return null

  const isOwnProfile = currentUser?.id === profileId
  const tier  = getTrustTier(profile.trust_score)
  const score = Number(profile.trust_score || 0)
  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + (r.communication_rating + r.item_quality_rating + r.reliability_rating) / 3, 0) / reviews.length
    : 0

  const tierColor = tier === 'highly_trusted' ? '#92400E'
    : tier === 'low_trust' ? '#991B1B'
    : '#145523'

  const tierBg = tier === 'highly_trusted' ? 'rgba(201,168,76,0.1)'
    : tier === 'low_trust' ? 'rgba(239,68,68,0.08)'
    : 'rgba(4,149,22,0.07)'

  const tierBorder = tier === 'highly_trusted' ? 'rgba(201,168,76,0.28)'
    : tier === 'low_trust' ? 'rgba(239,68,68,0.2)'
    : 'rgba(4,149,22,0.18)'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .p-page { min-height: 100vh; background: #F0F4F0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        /* banner */
        .p-banner {
          background: linear-gradient(150deg, #011E05 0%, #023D09 50%, #02560E 100%);
          padding: 64px 0 100px;
          position: relative; overflow: hidden;
        }
        .p-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.35) 50%, transparent 100%);
        }
        .p-banner-glow {
          position: absolute; top: -60px; right: -60px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(110,255,128,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .p-banner-inner {
          max-width: 900px; margin: 0 auto; padding: 0 36px;
          position: relative;
        }

        /* avatar */
        .p-avatar {
          width: 100px; height: 100px; flex-shrink: 0;
          background: linear-gradient(145deg, #023D09, #037312);
          border: 3px solid rgba(110,255,128,0.3);
          border-radius: 28px;
          display: flex; align-items: center; justify-content: center;
          color: #FFFFFF; font-weight: 900; font-size: 42px;
          letter-spacing: -0.04em; line-height: 1;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(110,255,128,0.15);
        }

        /* main content */
        .p-main { max-width: 900px; margin: -68px auto 0; padding: 0 36px 80px; }

        /* white card base */
        .p-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(4,149,22,0.1);
          box-shadow: 0 2px 16px rgba(1,30,5,0.07);
          margin-bottom: 20px;
          overflow: hidden;
        }
        .p-card-head {
          padding: 24px 28px 0;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px;
        }
        .p-card-title {
          font-size: 11px; font-weight: 800;
          color: #6B7280;
          text-transform: uppercase; letter-spacing: 0.12em;
        }
        .p-card-body { padding: 20px 28px 28px; }

        /* stats */
        .p-stats {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(4,149,22,0.1);
          box-shadow: 0 2px 16px rgba(1,30,5,0.07);
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          margin-bottom: 20px; overflow: hidden;
        }
        .p-stat {
          padding: 28px 20px; text-align: center;
          border-right: 1px solid #F0F4F0;
          transition: background 0.15s;
        }
        .p-stat:last-child { border-right: none; }
        .p-stat:hover { background: #FAFFF9; }
        .p-stat-num {
          font-size: 36px; font-weight: 900; line-height: 1;
          letter-spacing: -0.05em; margin-bottom: 6px;
        }
        .p-stat-lbl {
          font-size: 11px; font-weight: 700; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: 0.09em;
        }

        /* score bar */
        .p-bar-track { height: 10px; background: #F3F4F6; border-radius: 999px; overflow: hidden; }
        .p-bar-fill  { height: 100%; border-radius: 999px; transition: width 0.8s ease; }

        /* item row */
        .p-item {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #F3F4F6;
          text-decoration: none;
          transition: background 0.15s;
          border-radius: 4px;
        }
        .p-item:last-child { border-bottom: none; }
        .p-item:hover { background: #FAFFF9; margin: 0 -8px; padding-left: 8px; padding-right: 8px; }

        /* review */
        .p-review {
          padding: 22px 0;
          border-bottom: 1px solid #F3F4F6;
        }
        .p-review:last-child { border-bottom: none; }

        /* badge helpers */
        .b { display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; }

        @media (max-width: 640px) {
          .p-banner { padding: 48px 0 96px; }
          .p-banner-inner { padding: 0 20px; }
          .p-main { padding: 0 20px 60px; }
          .p-card-body { padding: 16px 20px 22px; }
          .p-card-head { padding: 20px 20px 0; }
          .p-stats { grid-template-columns: 1fr 1fr 1fr; }
          .p-stat { padding: 20px 12px; }
          .p-stat-num { font-size: 28px; }
          .p-avatar { width: 80px; height: 80px; font-size: 34px; border-radius: 22px; }
        }
      `}</style>

      <div className="p-page">

        {/* ─── BANNER ─── */}
        <div className="p-banner">
          <div className="p-banner-glow" />
          <div className="p-banner-inner">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>

              <div className="p-avatar">
                {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div style={{ flex: 1, minWidth: '200px', paddingTop: '6px' }}>

                {/* Name */}
                <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: '900', color: '#F0FFF2', letterSpacing: '-0.04em', margin: '0 0 14px', lineHeight: 1.05 }}>
                  {profile.full_name || 'Unknown User'}
                </h1>

                {/* Badge row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>

                  {profile.is_verified ? (
                    <span className="b" style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(147,197,253,0.35)', color: '#93C5FD' }}>
                      <ShieldCheck size={13} strokeWidth={2.5} /> Verified ✓
                    </span>
                  ) : profile.id_image_url && profile.verification_status === 'pending' ? (
                    <span className="b" style={{ background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.3)', color: '#E2C07A' }}>
                      <Clock size={12} strokeWidth={2.5} /> Pending Verification
                    </span>
                  ) : (
                    <span className="b" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,255,242,0.45)' }}>
                      <ShieldAlert size={12} strokeWidth={2} /> Not Verified
                    </span>
                  )}

                  {tier === 'highly_trusted' && (
                    <span className="b" style={{ background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.3)', color: '#E2C07A' }}>
                      <Star size={11} fill="#E2C07A" color="#E2C07A" strokeWidth={0} /> Highly Trusted
                    </span>
                  )}
                  {tier === 'low_trust' && (
                    <span className="b" style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
                      ⚠ Low Trust
                    </span>
                  )}
                  {score > 0 && (
                    <span className="b" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2C07A' }}>
                      <Star size={11} fill="#E2C07A" color="#E2C07A" strokeWidth={0} /> {score.toFixed(1)} / 5.0
                    </span>
                  )}
                </div>

                {/* Meta */}
                <p style={{ fontSize: '13px', color: 'rgba(240,255,242,0.45)', margin: 0, fontWeight: '500' }}>
                  {[profile.student_id, profile.email].filter(Boolean).join('  ·  ')}
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                {!isOwnProfile && (
                  <Link
                    href={`/messages/${profileId}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'rgba(4,149,22,0.25)', border: '1px solid rgba(110,255,128,0.25)', borderRadius: '12px', color: '#6EFF80', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}
                  >
                    <MessageCircle size={15} strokeWidth={2} /> Message
                  </Link>
                )}
                {isOwnProfile && (
                  <Link
                    href="/dashboard"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px', color: 'rgba(240,255,242,0.7)', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN ─── */}
        <div className="p-main">

          {/* STATS */}
          <div className="p-stats">
            {[
              { num: items.length,                    lbl: 'Items Listed',    col: '#145523', icon: <Package size={18} color="#145523" strokeWidth={1.8} /> },
              { num: reviews.length,                  lbl: 'Reviews',         col: '#145523', icon: <MessageSquare size={18} color="#145523" strokeWidth={1.8} /> },
              { num: score > 0 ? score.toFixed(1) : '—', lbl: 'Trust Score', col: '#92400E', icon: <Star size={18} fill="#C9A84C" color="#C9A84C" strokeWidth={0} /> },
            ].map((s, i) => (
              <div key={i} className="p-stat">
                <div style={{ marginBottom: '8px' }}>{s.icon}</div>
                <div className="p-stat-num" style={{ color: s.col }}>{s.num}</div>
                <div className="p-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* TRUST SCORE */}
          {score > 0 && (
            <div className="p-card">
              <div className="p-card-head">
                <span className="p-card-title">Trust Score</span>
                {avgRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '999px' }}>
                    <Star size={12} fill="#C9A84C" color="#C9A84C" strokeWidth={0} />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>{avgRating.toFixed(1)} avg</span>
                  </div>
                )}
              </div>
              <div className="p-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-0.06em', lineHeight: 1, color: tierColor }}>{score.toFixed(1)}</span>
                    <span style={{ fontSize: '20px', color: '#9CA3AF', marginLeft: '6px', fontWeight: '500' }}>/ 5.0</span>
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Score</span>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="p-bar-track">
                      <div className="p-bar-fill" style={{
                        width: `${Math.min((score / 5) * 100, 100)}%`,
                        background: tier === 'highly_trusted'
                          ? 'linear-gradient(90deg, #92400E, #C9A84C)'
                          : tier === 'low_trust'
                          ? 'linear-gradient(90deg, #991B1B, #EF4444)'
                          : 'linear-gradient(90deg, #145523, #049516)',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Tier pill */}
                <div style={{ padding: '16px 20px', borderRadius: '14px', background: tierBg, border: `1.5px solid ${tierBorder}` }}>
                  {tier === 'highly_trusted' && (
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: tierColor, lineHeight: '1.6' }}>
                      <strong>★ Highly Trusted</strong> — Score 4.0+. Priority visibility in browse, unlimited rentals, and requests are instantly visible to owners.
                    </p>
                  )}
                  {tier === 'normal' && (
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: tierColor, lineHeight: '1.6' }}>
                      <strong>✓ Normal User</strong> — Score 3.0–3.99. Standard platform experience with no restrictions.
                    </p>
                  )}
                  {tier === 'low_trust' && (
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: tierColor, lineHeight: '1.6' }}>
                      <strong>⚠ Low Trust</strong> — Score below 3.0. Limited to 1 active rental at a time, with a 12-hour delay on new rental requests.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VERIFICATION */}
          <div className="p-card">
            <div className="p-card-head">
              <span className="p-card-title">ID Verification</span>
            </div>
            <div className="p-card-body">
              {profile.is_verified ? (
                <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                  <div style={{ width: '52px', height: '52px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={24} color="#1D4ED8" strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '16px', color: '#1D4ED8', margin: '0 0 6px' }}>Verified User ✅</p>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.65' }}>
                      Identity has been confirmed by a Rentora administrator. This is a real, enrolled Gordon College student.
                    </p>
                  </div>
                </div>
              ) : profile.id_image_url && profile.verification_status === 'pending' ? (
                <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                  <div style={{ width: '52px', height: '52px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={24} color="#C9A84C" strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '16px', color: '#92400E', margin: '0 0 6px' }}>⏳ Verification Pending</p>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.65' }}>
                      ID has been submitted and is currently awaiting review by an administrator.
                    </p>
                  </div>
                </div>
              ) : profile.verification_status === 'rejected' ? (
                <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                  <div style={{ width: '52px', height: '52px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldAlert size={24} color="#EF4444" strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '16px', color: '#991B1B', margin: '0 0 6px' }}>❌ Verification Rejected</p>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 12px', lineHeight: '1.65' }}>
                      {isOwnProfile ? 'Your submitted ID was rejected. Please upload a clearer photo.' : 'This account\'s verification was not approved.'}
                    </p>
                    {isOwnProfile && (
                      <Link href="/upload-id" style={{ display: 'inline-flex', alignItems: 'center', padding: '9px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#991B1B', fontWeight: '700', fontSize: '13px', borderRadius: '10px', textDecoration: 'none' }}>
                        Re-upload ID →
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                  <div style={{ width: '52px', height: '52px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={24} color="#D1D5DB" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '16px', color: '#374151', margin: '0 0 6px' }}>Not Verified</p>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 12px', lineHeight: '1.65' }}>
                      {isOwnProfile ? 'Upload your school ID or government ID to become a verified user.' : 'This user has not completed ID verification yet.'}
                    </p>
                    {isOwnProfile && (
                      <Link href="/upload-id" className="btn-green" style={{ display: 'inline-flex', fontSize: '13px', padding: '9px 18px' }}>
                        Upload ID Now →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ITEMS */}
          {items.length > 0 && (
            <div className="p-card">
              <div className="p-card-head">
                <span className="p-card-title">Listed Items</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-card-body" style={{ paddingTop: '10px' }}>
                {items.map((item: any) => (
                  <Link key={item.id} href={`/items/${item.id}`} className="p-item">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '14px', border: '1px solid #E5E7EB', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: '60px', height: '60px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={24} color="var(--g-rich)" strokeWidth={1.5} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '15px', color: '#111827', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                        {item.categories?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '20px', fontWeight: '900', color: 'var(--g-mid)', margin: '0 0 2px', letterSpacing: '-0.04em' }}>₱{item.price_per_day}</p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>/day</p>
                    </div>
                    <ArrowUpRight size={16} color="#9CA3AF" strokeWidth={2} style={{ flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {reviews.length > 0 && (
            <div className="p-card">
              <div className="p-card-head">
                <span className="p-card-title">Reviews Received</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-card-body" style={{ paddingTop: '8px' }}>
                {reviews.map((review: any) => {
                  const avg = ((review.communication_rating + review.item_quality_rating + review.reliability_rating) / 3)
                  return (
                    <div key={review.id} className="p-review">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Link href={`/profile/${review.reviewer?.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #023D09, #049516)', border: '1.5px solid rgba(4,149,22,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: '900', fontSize: '16px', flexShrink: 0 }}>
                            {review.reviewer?.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: '0 0 2px' }}>
                              {review.reviewer?.full_name}
                            </p>
                            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                              {new Date(review.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '999px' }}>
                          <Star size={13} fill="#C9A84C" color="#C9A84C" strokeWidth={0} />
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#92400E' }}>{avg.toFixed(1)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: review.comment ? '12px' : 0 }}>
                        {[
                          { l: 'Comm',    v: review.communication_rating },
                          { l: 'Quality', v: review.item_quality_rating },
                          { l: 'Trust',   v: review.reliability_rating },
                        ].map((r, i) => (
                          <span key={i} style={{ padding: '4px 12px', background: r.v >= 8 ? 'rgba(4,149,22,0.08)' : r.v >= 5 ? 'rgba(201,168,76,0.08)' : 'rgba(239,68,68,0.07)', border: `1px solid ${r.v >= 8 ? 'rgba(4,149,22,0.18)' : r.v >= 5 ? 'rgba(201,168,76,0.2)' : 'rgba(239,68,68,0.15)'}`, borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: r.v >= 8 ? '#145523' : r.v >= 5 ? '#92400E' : '#991B1B' }}>
                            {r.l} {r.v}/10
                          </span>
                        ))}
                      </div>

                      {review.comment && (
                        <div style={{ padding: '14px 18px', background: '#F9FAF9', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                          <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.7', fontStyle: 'italic' }}>
                            "{review.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty */}
          {items.length === 0 && reviews.length === 0 && (
            <div className="p-card">
              <div style={{ padding: '64px 28px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Package size={28} color="var(--g-rich)" strokeWidth={1.5} />
                </div>
                <p style={{ fontWeight: '800', fontSize: '18px', color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>No activity yet</p>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '0', lineHeight: '1.6' }}>
                  {isOwnProfile ? 'List your first item to get started on Rentora!' : 'This user hasn\'t listed any items or received reviews yet.'}
                </p>
                {isOwnProfile && (
                  <Link href="/items/new" className="btn-green" style={{ display: 'inline-flex', marginTop: '20px', fontSize: '14px', padding: '11px 24px' }}>
                    List an Item
                  </Link>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}