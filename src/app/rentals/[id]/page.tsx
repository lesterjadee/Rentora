'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Package, Calendar, User, Star, DollarSign, Clock, AlertTriangle } from 'lucide-react'

function getTrustTier(score: number | null) {
  if (!score || score === 0) return 'normal'
  if (score >= 4.0) return 'highly_trusted'
  if (score >= 3.0) return 'normal'
  return 'low_trust'
}

export default function RentalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.id as string
  const supabase = createClient()

  const [rental, setRental] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setCurrentUser(user)

    const { data } = await supabase
      .from('rentals')
      .select(`
        *,
        items (id, title, price_per_day, categories(name)),
        renter:profiles!rentals_renter_id_fkey (id, full_name, trust_score),
        owner:profiles!rentals_owner_id_fkey  (id, full_name, trust_score)
      `)
      .eq('id', rentalId)
      .single()

    if (!data) { router.push('/rentals'); return }

    const isOwner  = data.owner_id  === user.id
    const isRenter = data.renter_id === user.id
    if (!isOwner && !isRenter) { router.push('/rentals'); return }

    setRental(data)
    setLoading(false)
  }, [rentalId])

  useEffect(() => { fetchData() }, [fetchData])

  const doAction = async (updates: Record<string, any>) => {
    setActionLoading(true)
    setError('')
    const { error } = await supabase
      .from('rentals')
      .update(updates)
      .eq('id', rentalId)
    if (error) {
      setError(error.message)
      setActionLoading(false)
    } else {
      await fetchData()
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={24} color="var(--g-rich)" strokeWidth={1.5} />
      </div>
    </div>
  )

  if (!rental || !currentUser) return null

  const isOwner  = rental.owner_id  === currentUser.id
  const isRenter = rental.renter_id === currentUser.id

  const now = new Date()
  const visibleAt = rental.visible_at ? new Date(rental.visible_at) : null
  const isStillDelayed = isOwner && visibleAt !== null && visibleAt > now

  const days = rental.start_date && rental.end_date
    ? Math.max(1, Math.ceil((new Date(rental.end_date).getTime() - new Date(rental.start_date).getTime()) / 86400000))
    : 1
  const total = days * (rental.items?.price_per_day || 0)

  const renterScore = rental.renter?.trust_score || 0
  const renterIsLowTrust = renterScore > 0 && renterScore < 3.0

  return (
    <>
      <style>{`
        .rd { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rd-banner { position: relative; overflow: hidden; padding: 44px 28px 96px; border-bottom: 1px solid rgba(6,214,33,0.08); }
        .rd-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 50% 70% at 90% 0%, rgba(110,255,128,0.06), transparent 55%); pointer-events: none; }
        .rd-banner::after  { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent); }
        .rd-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1); border-radius: 22px; padding: 28px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
        .rd-row { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid rgba(4,149,22,0.07); }
        .rd-row:last-child { border-bottom: none; }
        .rd-icon { width: 36px; height: 36px; background: rgba(4,149,22,0.07); border: 1px solid rgba(4,149,22,0.14); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .btn-danger { display: inline-flex; align-items: center; gap: 7px; padding: 12px 22px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #B91C1C; font-weight: 700; font-size: 14px; border-radius: 12px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .btn-danger:hover { background: rgba(239,68,68,0.14); }
        .btn-purple { display: inline-flex; align-items: center; gap: 7px; padding: 12px 22px; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25); color: #6D28D9; font-weight: 700; font-size: 14px; border-radius: 12px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .btn-purple:hover { background: rgba(124,58,237,0.15); }
        .notice { padding: 14px 18px; border-radius: 14px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
        .notice-gold   { background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25); }
        .notice-red    { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18); }
        .notice-green  { background: rgba(4,149,22,0.07);  border: 1px solid rgba(4,149,22,0.18);  align-items: center; }
        .notice-purple { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); align-items: center; }
      `}</style>

      <div className="rd">
        <div className="rd-banner">
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <Link href="/rentals" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--tx-muted)', textDecoration: 'none', marginBottom: '20px', fontWeight: '600' }}>
              <ArrowLeft size={14} strokeWidth={2} /> Back to Rentals
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6EFF80' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Rental Detail</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: 0 }}>
                {rental.items?.title}
              </h1>
              <span className={`status-${rental.status}`} style={{ fontSize: '13px' }}>{rental.status}</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '-60px auto 0', padding: '0 28px 60px' }}>

          {error && (
            <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Owner: 12-hour delay still active */}
          {isStillDelayed && visibleAt && (
            <div className="notice notice-gold">
              <Clock size={20} color="var(--au-mid)" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--au-dark)', margin: '0 0 4px' }}>12-Hour Review Delay Active</p>
                <p style={{ fontSize: '13px', color: 'var(--au-dark)', margin: 0, opacity: 0.85, lineHeight: '1.5' }}>
                  This renter has a low trust score. You can approve or decline this request from{' '}
                  <strong>{visibleAt.toLocaleString('en-PH', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Owner: low trust warning after delay */}
          {isOwner && renterIsLowTrust && !isStillDelayed && rental.status === 'pending' && (
            <div className="notice notice-red">
              <AlertTriangle size={18} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontWeight: '700', fontSize: '13px', color: '#B91C1C', margin: '0 0 3px' }}>Low Trust Renter</p>
                <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, opacity: 0.85 }}>
                  This renter has a trust score below 3.0. Review carefully before approving.
                </p>
              </div>
            </div>
          )}

          {/* Renter: waiting for owner to confirm return */}
          {isRenter && rental.status === 'returning' && (
            <div className="notice notice-purple">
              <Package size={17} color="#6D28D9" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: '#6D28D9', margin: 0, fontWeight: '600' }}>
                You marked this as returned. Waiting for the owner to <strong>confirm receipt</strong>.
              </p>
            </div>
          )}

          {/* Owner: renter says they returned it */}
          {isOwner && rental.status === 'returning' && (
            <div className="notice notice-green">
              <Package size={17} color="var(--g-rich)" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: 'var(--g-mid)', margin: 0, fontWeight: '600' }}>
                The renter marked this as <strong>returned</strong>. Confirm below if you received it back.
              </p>
            </div>
          )}

          {/* Item Details */}
          <div className="rd-card">
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '14px' }}>Item Details</h3>
            <div className="rd-row">
              <div className="rd-icon"><Package size={16} color="var(--g-rich)" strokeWidth={2} /></div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>{rental.items?.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{rental.items?.categories?.name}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '16px', fontWeight: '900', color: 'var(--g-mid)' }}>₱{rental.items?.price_per_day}/day</span>
            </div>
            {(rental.start_date || rental.end_date) && (
              <div className="rd-row">
                <div className="rd-icon"><Calendar size={16} color="var(--g-rich)" strokeWidth={2} /></div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>Rental Period</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>
                    {rental.start_date} → {rental.end_date} ({days} day{days !== 1 ? 's' : ''})
                  </p>
                </div>
              </div>
            )}
            <div className="rd-row">
              <div className="rd-icon"><DollarSign size={16} color="var(--au-mid)" strokeWidth={2} /></div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>Total Amount</p>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{days} day{days !== 1 ? 's' : ''} × ₱{rental.items?.price_per_day}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '20px', fontWeight: '900', color: 'var(--au-dark)' }}>₱{total}</span>
            </div>
          </div>

          {/* People */}
          <div className="rd-card">
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '14px' }}>People</h3>
            {[
              { label: 'Owner',  profile: rental.owner },
              { label: 'Renter', profile: rental.renter },
            ].map((p, i) => (
              <div key={i} className="rd-row">
                <div className="rd-icon"><User size={16} color="var(--g-rich)" strokeWidth={2} /></div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>{p.profile?.full_name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{p.label}</p>
                </div>
                {p.profile?.trust_score > 0 && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: '999px' }}>
                    <Star size={11} fill="#C9A84C" color="#C9A84C" />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--au-dark)' }}>{p.profile.trust_score}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

            {/* OWNER: approve/decline — only if delay has passed */}
            {isOwner && rental.status === 'pending' && !isStillDelayed && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => doAction({ status: 'approved' })}
                  className="btn-green"
                  style={{ fontSize: '14px', padding: '12px 24px', opacity: actionLoading ? 0.6 : 1 }}
                >
                  {actionLoading ? 'Processing...' : '✓ Approve Request'}
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => doAction({ status: 'declined' })}
                  className="btn-danger"
                >
                  Decline
                </button>
              </>
            )}

            {/* OWNER: delay still active — disabled button */}
            {isOwner && rental.status === 'pending' && isStillDelayed && (
              <button disabled style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(0,0,0,0.04)', border: '1.5px solid var(--border-sub)', color: 'var(--tx-dim)', fontWeight: '600', fontSize: '14px', borderRadius: '12px', cursor: 'not-allowed', fontFamily: 'inherit' }}>
                <Clock size={15} strokeWidth={2} /> Awaiting Delay Period
              </button>
            )}

            {/* OWNER: confirm return */}
            {isOwner && rental.status === 'returning' && (
              <button
                disabled={actionLoading}
                onClick={() => doAction({ status: 'completed' })}
                className="btn-green"
                style={{ fontSize: '14px', padding: '12px 24px', opacity: actionLoading ? 0.6 : 1 }}
              >
                {actionLoading ? 'Processing...' : '✓ Confirm Item Returned'}
              </button>
            )}

            {/* RENTER: cancel pending */}
            {isRenter && rental.status === 'pending' && (
              <button
                disabled={actionLoading}
                onClick={() => doAction({ status: 'cancelled' })}
                className="btn-danger"
              >
                Cancel Request
              </button>
            )}

            {/* RENTER: mark as returned */}
            {isRenter && rental.status === 'approved' && (
              <button
                disabled={actionLoading}
                onClick={() => doAction({ status: 'returning', return_requested_at: new Date().toISOString() })}
                className="btn-purple"
                style={{ opacity: actionLoading ? 0.6 : 1 }}
              >
                {actionLoading ? 'Processing...' : '📦 I Have Returned the Item'}
              </button>
            )}

            {/* Leave review */}
            {rental.status === 'completed' && (
              <Link href={`/reviews/new?rental_id=${rental.id}`} className="btn-gold" style={{ fontSize: '14px', padding: '12px 24px' }}>
                Leave a Review
              </Link>
            )}

            <Link href={`/items/${rental.item_id}`} className="btn-ghost" style={{ fontSize: '14px', padding: '12px 24px' }}>
              View Item
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}