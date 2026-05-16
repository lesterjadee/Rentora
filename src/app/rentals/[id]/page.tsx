import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Calendar, User, Star, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { getTrustTier } from '@/lib/trustUtils'

export default async function RentalDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: rental } = await supabase
    .from('rentals')
    .select('*, items(*, categories(name)), renter:profiles!rentals_renter_id_fkey(full_name, trust_score, student_id), owner:profiles!rentals_owner_id_fkey(full_name, trust_score)')
    .eq('id', params.id)
    .single()

  if (!rental) notFound()

  const isOwner  = rental.owner_id  === user.id
  const isRenter = rental.renter_id === user.id
  if (!isOwner && !isRenter) redirect('/rentals')

  const now = new Date()
  const visibleAt = rental.visible_at ? new Date(rental.visible_at) : null
  const isStillDelayed = isOwner && visibleAt && visibleAt > now

  const days = rental.start_date && rental.end_date
    ? Math.max(1, Math.ceil((new Date(rental.end_date).getTime() - new Date(rental.start_date).getTime()) / 86400000))
    : 1
  const total = days * (rental.items?.price_per_day || 0)

  const renterTier = getTrustTier(rental.renter?.trust_score)

  // Server actions
  const approveRental = async () => {
    'use server'
    const sb = await createClient()
    await sb.from('rentals').update({ status: 'approved' }).eq('id', rental.id)
    redirect(`/rentals/${rental.id}`)
  }
  const declineRental = async () => {
    'use server'
    const sb = await createClient()
    await sb.from('rentals').update({ status: 'declined' }).eq('id', rental.id)
    redirect(`/rentals/${rental.id}`)
  }
  const cancelRental = async () => {
    'use server'
    const sb = await createClient()
    await sb.from('rentals').update({ status: 'cancelled' }).eq('id', rental.id)
    redirect(`/rentals/${rental.id}`)
  }
  const requestReturn = async () => {
    'use server'
    const sb = await createClient()
    await sb.from('rentals').update({ status: 'returning', return_requested_at: new Date().toISOString() }).eq('id', rental.id)
    redirect(`/rentals/${rental.id}`)
  }
  const confirmReturn = async () => {
    'use server'
    const sb = await createClient()
    await sb.from('rentals').update({ status: 'completed' }).eq('id', rental.id)
    redirect(`/rentals/${rental.id}`)
  }

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
        .btn-danger { display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #B91C1C; font-weight: 700; font-size: 14px; border-radius: 12px; cursor: pointer; font-family: 'Plus Jakarta Sans, system-ui, sans-serif'; transition: all 0.2s; }
        .btn-danger:hover { background: rgba(239,68,68,0.12); }
        .btn-purple { display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25); color: #6D28D9; font-weight: 700; font-size: 14px; border-radius: 12px; cursor: pointer; font-family: 'Plus Jakarta Sans, system-ui, sans-serif'; transition: all 0.2s; }
        .btn-purple:hover { background: rgba(124,58,237,0.15); }
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
              <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: 0 }}>{rental.items?.title}</h1>
              <span className={`status-${rental.status}`} style={{ fontSize: '13px' }}>{rental.status}</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '-60px auto 0', padding: '0 28px 60px' }}>

          {/* Delay notice for owner */}
          {isStillDelayed && visibleAt && (
            <div style={{ marginBottom: '16px', padding: '16px 20px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <Clock size={20} color="var(--au-mid)" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--au-dark)', margin: '0 0 5px' }}>Rental Request Pending Review Window</p>
                <p style={{ fontSize: '13px', color: 'var(--au-dark)', margin: 0, opacity: 0.8, lineHeight: '1.5' }}>
                  This renter has a low trust score. You can review and approve this request on{' '}
                  <strong>{visibleAt.toLocaleString('en-PH', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Renter trust notice for owner */}
          {isOwner && renterTier === 'low_trust' && !isStillDelayed && (
            <div style={{ marginBottom: '16px', padding: '14px 18px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={16} color="#EF4444" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: '#B91C1C', margin: 0 }}>This renter has a <strong>low trust score</strong> (below 3.0). Proceed with caution.</p>
            </div>
          )}

          {/* Return progress notice for renter */}
          {isRenter && rental.status === 'returning' && (
            <div style={{ marginBottom: '16px', padding: '14px 18px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Package size={16} color="#6D28D9" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: '#6D28D9', margin: 0 }}>You have marked this item as returned. Waiting for the owner to <strong>confirm receipt</strong>.</p>
            </div>
          )}

          {/* Return confirm notice for owner */}
          {isOwner && rental.status === 'returning' && (
            <div style={{ marginBottom: '16px', padding: '14px 18px', background: 'rgba(4,149,22,0.08)', border: '1px solid rgba(4,149,22,0.2)', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Package size={16} color="var(--g-rich)" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: 'var(--g-mid)', margin: 0 }}>The renter has marked this item as <strong>returned</strong>. Please confirm if you have received it back.</p>
            </div>
          )}

          {/* Item Details */}
          <div className="rd-card">
            <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Item Details</h3>
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
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{rental.start_date} → {rental.end_date} ({days} day{days !== 1 ? 's' : ''})</p>
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
            <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>People</h3>
            {[
              { label: 'Owner', profile: rental.owner },
              { label: 'Renter', profile: rental.renter },
            ].map((p, i) => (
              <div key={i} className="rd-row">
                <div className="rd-icon"><User size={16} color="var(--g-rich)" strokeWidth={2} /></div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>{p.profile?.full_name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{p.label}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Trust tier badge */}
                  {(() => {
                    const t = getTrustTier(p.profile?.trust_score)
                    if (t === 'highly_trusted') return <span className="badge-highly-trusted">★ Highly Trusted</span>
                    if (t === 'low_trust') return <span className="badge-low-trust">⚠ Low Trust</span>
                    return null
                  })()}
                  {p.profile?.trust_score > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: '999px' }}>
                      <Star size={11} fill="#C9A84C" color="#C9A84C" />
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--au-dark)' }}>{p.profile.trust_score}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

            {/* OWNER: approve/decline pending (only if not still delayed) */}
            {isOwner && rental.status === 'pending' && !isStillDelayed && (
              <>
                <form action={approveRental}>
                  <button type="submit" className="btn-green" style={{ fontSize: '14px', padding: '11px 24px' }}>Approve Request</button>
                </form>
                <form action={declineRental}>
                  <button type="submit" className="btn-danger">Decline</button>
                </form>
              </>
            )}

            {/* OWNER: confirm return when renter has returned */}
            {isOwner && rental.status === 'returning' && (
              <form action={confirmReturn}>
                <button type="submit" className="btn-green" style={{ fontSize: '14px', padding: '11px 24px' }}>✓ Confirm Item Returned</button>
              </form>
            )}

            {/* RENTER: cancel pending */}
            {isRenter && rental.status === 'pending' && (
              <form action={cancelRental}>
                <button type="submit" className="btn-danger">Cancel Request</button>
              </form>
            )}

            {/* RENTER: mark as returned when approved */}
            {isRenter && rental.status === 'approved' && (
              <form action={requestReturn}>
                <button type="submit" className="btn-purple">📦 I Have Returned the Item</button>
              </form>
            )}

            {/* Leave review on completed */}
            {rental.status === 'completed' && (
              <Link href={`/reviews/new?rental_id=${rental.id}`} className="btn-gold" style={{ fontSize: '14px', padding: '11px 24px' }}>Leave a Review</Link>
            )}

            <Link href={`/items/${rental.item_id}`} className="btn-ghost" style={{ fontSize: '14px', padding: '11px 24px' }}>View Item</Link>
          </div>
        </div>
      </div>
    </>
  )
}