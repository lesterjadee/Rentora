import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'

export default async function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: rental } = await supabase
    .from('rentals')
    .select(`*, items(id, title, image_url, price_per_day, condition),
      renter:profiles!rentals_renter_id_fkey(id, full_name, email, trust_score),
      owner:profiles!rentals_owner_id_fkey(id, full_name, email, trust_score)`)
    .eq('id', id).single()

  if (!rental) redirect('/rentals')

  const isOwner = user.id === rental.owner_id
  const isRenter = user.id === rental.renter_id

  const statusMap: Record<string, { label: string; cls: string; desc: string }> = {
    pending:   { label: 'Pending Review', cls: 'status-pending',   desc: isOwner ? 'Review this request and approve or decline it.' : 'Waiting for the owner to respond.' },
    approved:  { label: 'Approved',       cls: 'status-approved',  desc: 'This rental has been approved and is ready to proceed.' },
    active:    { label: 'Active',          cls: 'status-available', desc: 'Rental is currently active.' },
    completed: { label: 'Completed',       cls: 'status-completed', desc: 'This rental has been completed successfully.' },
    declined:  { label: 'Declined',        cls: 'status-declined',  desc: 'This rental request was declined.' },
    cancelled: { label: 'Cancelled',       cls: 'status-cancelled', desc: 'This rental was cancelled.' },
  }
  const s = statusMap[rental.status] || statusMap.pending

  return (
    <>
      <style>{`
        .rd { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rd-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .rd-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
        }
        .rd-inner { max-width: 900px; margin: 0 auto; padding: 28px 28px 60px; }
        .rd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .rd-card {
          background: var(--bg-card); border: 1px solid var(--border-sub);
          border-radius: 20px; padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        .rd-card-label {
          font-size: 10px; font-weight: 800; color: var(--tx-muted);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;
        }
        .rd-status-bar {
          border-radius: 18px; padding: 18px 22px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 14px;
        }
        .rd-person-avatar {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 18px; flex-shrink: 0;
        }
        .rd-action-btn {
          padding: 13px 22px; border-radius: 12px;
          font-weight: 700; font-size: 14px; cursor: pointer;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: all 0.25s; border: none; flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .rd-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        @media (max-width: 700px) {
          .rd-grid { grid-template-columns: 1fr; }
          .rd-actions { flex-direction: column; }
          .rd-inner { padding: 24px 20px 48px; }
          .rd-banner { padding: 32px 20px 44px; }
        }
      `}</style>

      <div className="rd">
        {/* Banner */}
        <div className="rd-banner">
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <Link href="/rentals" style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-body)', textDecoration: 'none', flexShrink: 0, transition: 'all 0.2s' }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '5px' }}>Rental Details</p>
              <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.03em' }}>{rental.items?.title}</h1>
            </div>
          </div>
        </div>

        <div className="rd-inner">

          {/* Status bar */}
          <div className="rd-status-bar" style={{
            background: rental.status === 'pending' ? 'rgba(201,168,76,0.06)' : rental.status === 'approved' || rental.status === 'active' ? 'rgba(34,168,118,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${rental.status === 'pending' ? 'rgba(201,168,76,0.2)' : rental.status === 'approved' || rental.status === 'active' ? 'rgba(34,168,118,0.2)' : 'var(--border-sub)'}`,
          }}>
            <span className={s.cls} style={{ flexShrink: 0 }}>{s.label}</span>
            <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0 }}>{s.desc}</p>
          </div>

          {/* Info Grid */}
          <div className="rd-grid">

            {/* Item */}
            <div className="rd-card">
              <p className="rd-card-label">Item</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <div style={{ width: '52px', height: '52px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.15)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                <div>
                  <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--tx-bright)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{rental.items?.title}</p>
                  <p style={{ fontSize: '22px', fontWeight: '900', color: '#2ECC8F', margin: 0, letterSpacing: '-0.03em' }}>₱{rental.items?.price_per_day}<span style={{ fontSize: '12px', color: 'var(--tx-muted)', fontWeight: '400' }}>/day</span></p>
                </div>
              </div>
              <Link href={`/items/${rental.items?.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#22A876', textDecoration: 'none', padding: '8px 14px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', borderRadius: '9px' }}>
                View Item →
              </Link>
            </div>

            {/* Rental Period */}
            <div className="rd-card">
              <p className="rd-card-label">Rental Period</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' as const }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: '0 0 4px', fontWeight: '600' }}>From</p>
                  <p style={{ fontWeight: '800', fontSize: '17px', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>{rental.start_date}</p>
                </div>
                <p style={{ fontSize: '18px', color: 'var(--tx-dim)', margin: 0 }}>→</p>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: '0 0 4px', fontWeight: '600' }}>To</p>
                  <p style={{ fontWeight: '800', fontSize: '17px', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>{rental.end_date}</p>
                </div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, var(--au-deep), rgba(42,30,8,0.4))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '14px', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: '0 0 5px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Total Price</p>
                <p className="gold-shimmer" style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-0.04em' }}>₱{rental.total_price}</p>
              </div>
            </div>

            {/* Renter */}
            <div className="rd-card">
              <p className="rd-card-label">Renter</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="rd-person-avatar" style={{ background: 'linear-gradient(135deg, #0c1525, #1a2f4f)', border: '1px solid rgba(59,130,246,0.2)', color: '#93C5FD' }}>
                  {rental.renter?.full_name?.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--tx-bright)', margin: '0 0 3px', letterSpacing: '-0.01em' }}>{rental.renter?.full_name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{rental.renter?.email}</p>
                  {rental.renter?.trust_score > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '999px' }}>
                      <Star size={10} fill="#C9A84C" color="#C9A84C" />
                      <span style={{ fontSize: '11px', color: 'var(--au-light)', fontWeight: '800' }}>{rental.renter.trust_score}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Owner */}
            <div className="rd-card">
              <p className="rd-card-label">Owner</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="rd-person-avatar" style={{ background: 'linear-gradient(135deg, var(--g-dark), var(--g-rich))', border: '1px solid rgba(34,168,118,0.2)', color: '#22A876' }}>
                  {rental.owner?.full_name?.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--tx-bright)', margin: '0 0 3px', letterSpacing: '-0.01em' }}>{rental.owner?.full_name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{rental.owner?.email}</p>
                  {rental.owner?.trust_score > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '999px' }}>
                      <Star size={10} fill="#C9A84C" color="#C9A84C" />
                      <span style={{ fontSize: '11px', color: 'var(--au-light)', fontWeight: '800' }}>{rental.owner.trust_score}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {rental.message && (
            <div className="rd-card" style={{ marginBottom: '14px' }}>
              <p className="rd-card-label">Message from Renter</p>
              <p style={{ fontSize: '15px', color: 'var(--tx-body)', lineHeight: '1.75', margin: 0, fontStyle: 'italic' }}>"{rental.message}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="rd-actions">
            {isOwner && rental.status === 'pending' && (
              <>
                <form action={`/api/rentals/${id}/approve`} method="POST" style={{ flex: 1, display: 'flex' }}>
                  <button type="submit" className="rd-action-btn" style={{ background: 'linear-gradient(135deg, var(--g-mid), var(--g-vivid))', border: '1px solid rgba(34,168,118,0.3)', color: 'var(--g-neon)', boxShadow: '0 4px 20px rgba(15,61,42,0.4)' }}>
                    ✅ Approve Request
                  </button>
                </form>
                <form action={`/api/rentals/${id}/decline`} method="POST">
                  <button type="submit" className="rd-action-btn" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', flex: 'none', paddingLeft: '24px', paddingRight: '24px' }}>
                    ❌ Decline
                  </button>
                </form>
              </>
            )}
            {isOwner && rental.status === 'approved' && (
              <form action={`/api/rentals/${id}/complete`} method="POST" style={{ flex: 1, display: 'flex' }}>
                <button type="submit" className="rd-action-btn btn-gold" style={{ fontSize: '14px', padding: '13px 22px' }}>
                  🏁 Mark as Completed
                </button>
              </form>
            )}
            {isRenter && rental.status === 'pending' && (
              <form action={`/api/rentals/${id}/cancel`} method="POST" style={{ flex: 1, display: 'flex' }}>
                <button type="submit" className="rd-action-btn" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                  🚫 Cancel Request
                </button>
              </form>
            )}
            {rental.status === 'completed' && (isOwner || isRenter) && (
              <Link href={`/reviews/new?rental=${id}`} className="btn-gold" style={{ flex: 1, justifyContent: 'center', fontSize: '14px', padding: '13px 22px' }}>
                <Star size={15} strokeWidth={2} /> Leave a Review
              </Link>
            )}
          </div>

        </div>
      </div>
    </>
  )
}