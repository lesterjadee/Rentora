import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default async function RentalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myRentals } = await supabase
    .from('rentals')
    .select('*, items(title, image_url, price_per_day, categories(name, icon)), profiles!rentals_owner_id_fkey(full_name)')
    .eq('renter_id', user.id).order('created_at', { ascending: false })

  const { data: ownerRentals } = await supabase
    .from('rentals')
    .select('*, items(title, image_url, price_per_day, categories(name, icon)), profiles!rentals_renter_id_fkey(full_name)')
    .eq('owner_id', user.id).order('created_at', { ascending: false })

  const allRentals = [...(myRentals || []), ...(ownerRentals || [])]
  const pendingCount = allRentals.filter(r => r.status === 'pending').length

  const statusConfig: Record<string, { cls: string; label: string }> = {
    pending:   { cls: 'status-pending',   label: 'Pending' },
    approved:  { cls: 'status-approved',  label: 'Approved' },
    active:    { cls: 'status-available', label: 'Active' },
    completed: { cls: 'status-completed', label: 'Completed' },
    declined:  { cls: 'status-declined',  label: 'Declined' },
    cancelled: { cls: 'status-cancelled', label: 'Cancelled' },
  }

  const RentalCard = ({ rental, role }: { rental: any; role: 'renter' | 'owner' }) => {
    const s = statusConfig[rental.status] || statusConfig.pending
    return (
      <Link href={`/rentals/${rental.id}`} className="rental-card-link">
        <div className="rental-card">
          <div className="rental-card-left">
            <div className="rental-icon-box">
              {rental.items?.categories?.icon || '📦'}
            </div>
            <div className="rental-card-info">
              <p className="rental-card-title">{rental.items?.title}</p>
              <p className="rental-card-dates">{rental.start_date} → {rental.end_date}</p>
              <p className="rental-card-person">
                {role === 'renter'
                  ? `Owner: ${rental.profiles?.full_name}`
                  : `Renter: ${rental.profiles?.full_name}`}
              </p>
            </div>
          </div>
          <div className="rental-card-right">
            <span className={s.cls}>{s.label}</span>
            <p className="rental-card-price">₱{rental.total_price}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <style>{`
        .rentals-page { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        .rentals-banner {
          position: relative; overflow: hidden;
          padding: 52px 28px 56px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .rentals-banner::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 70% at 90% 0%, rgba(34,168,118,0.08), transparent 60%);
          pointer-events: none;
        }
        .rentals-banner::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
        }

        .rentals-inner { max-width: 1100px; margin: 0 auto; padding: 32px 28px 60px; }

        .rentals-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 12px; margin-bottom: 32px;
        }
        .rentals-stat {
          background: var(--bg-card);
          border: 1px solid var(--border-sub);
          border-radius: 16px; padding: 20px 18px;
          transition: all 0.25s;
        }
        .rentals-stat:hover { border-color: rgba(201,168,76,0.15); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .rentals-stat-label { font-size: 10px; color: var(--tx-muted); font-weight: 800; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.08em; }
        .rentals-stat-value { font-size: 40px; font-weight: 900; margin: 0; letter-spacing: -0.05em; line-height: 1; }

        .section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .section-dot-green { width: 7px; height: 7px; border-radius: 50%; background: #2ECC8F; box-shadow: 0 0 8px rgba(34,168,118,0.5); flex-shrink: 0; }
        .section-dot-gold { width: 7px; height: 7px; border-radius: 50%; background: #E2C07A; box-shadow: 0 0 8px rgba(201,168,76,0.4); flex-shrink: 0; }
        .section-title { font-size: 16px; font-weight: 800; color: var(--tx-bright); margin: 0; letter-spacing: -0.02em; }
        .section-count-green { font-size: 11px; font-weight: 800; color: #2ECC8F; background: var(--g-glow); border: 1px solid rgba(34,168,118,0.2); padding: 3px 10px; border-radius: 999px; }
        .section-count-gold { font-size: 11px; font-weight: 800; color: var(--au-light); background: var(--au-glow); border: 1px solid rgba(201,168,76,0.2); padding: 3px 10px; border-radius: 999px; }

        .rental-section { margin-bottom: 32px; }

        .rental-card-link { text-decoration: none; display: block; margin-bottom: 8px; }
        .rental-card {
          background: var(--bg-card);
          border: 1px solid var(--border-sub);
          border-radius: 16px; padding: 16px 20px;
          display: flex; justify-content: space-between; align-items: center; gap: 12px;
          box-shadow: var(--shadow-sm);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .rental-card-link:hover .rental-card {
          border-color: rgba(201,168,76,0.18);
          background: var(--bg-hover);
          transform: translateX(4px);
          box-shadow: var(--shadow-md), 0 0 0 1px rgba(201,168,76,0.06);
        }
        .rental-card-left { display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1; }
        .rental-icon-box {
          width: 46px; height: 46px;
          background: var(--g-glow); border: 1px solid rgba(34,168,118,0.15);
          border-radius: 13px; display: flex; align-items: center;
          justify-content: center; font-size: 20px; flex-shrink: 0;
          transition: all 0.2s;
        }
        .rental-card-link:hover .rental-icon-box { background: rgba(34,168,118,0.12); border-color: rgba(34,168,118,0.25); }
        .rental-card-info { min-width: 0; }
        .rental-card-title { font-weight: 800; font-size: 14px; color: var(--tx-bright); margin: 0 0 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.01em; }
        .rental-card-dates { font-size: 11px; color: var(--tx-muted); margin: 0 0 2px; font-weight: 500; }
        .rental-card-person { font-size: 11px; color: var(--tx-dim); margin: 0; font-weight: 600; }
        .rental-card-right { text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .rental-card-price { font-size: 18px; font-weight: 900; color: #2ECC8F; margin: 0; letter-spacing: -0.03em; }

        .rental-empty {
          background: var(--bg-card); border-radius: 16px;
          border: 1px solid var(--border-sub); padding: 48px;
          text-align: center;
        }
        .rental-empty-icon { font-size: 28px; margin-bottom: 12px; }
        .rental-empty-text { color: var(--tx-muted); font-size: 14px; font-weight: 600; margin: 0 0 12px; }

        @media (max-width: 640px) {
          .rentals-stats { grid-template-columns: repeat(2, 1fr); }
          .rentals-inner { padding: 24px 20px 48px; }
          .rentals-banner { padding: 40px 20px 48px; }
        }
      `}</style>

      <div className="rentals-page">

        {/* Banner */}
        <div className="rentals-banner">
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', position: 'relative' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22A876', boxShadow: '0 0 6px rgba(34,168,118,0.6)' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>My Activity</span>
              </div>
              <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.04em' }}>Rentals</h1>
            </div>
            <Link href="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-sub)', color: 'var(--tx-muted)', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', whiteSpace: 'nowrap' as const }}>
              <ShoppingBag size={14} strokeWidth={2} /> Browse Items
            </Link>
          </div>
        </div>

        <div className="rentals-inner">

          {/* Stats */}
          <div className="rentals-stats">
            {[
              { label: 'Total Requests', value: allRentals.length, color: '#2ECC8F' },
              { label: 'As Renter',      value: myRentals?.length || 0, color: '#93C5FD' },
              { label: 'As Owner',       value: ownerRentals?.length || 0, color: '#C4B5FD' },
              { label: 'Pending',        value: pendingCount, color: '#E2C07A' },
            ].map((s, i) => (
              <div key={i} className="rentals-stat">
                <p className="rentals-stat-label">{s.label}</p>
                <p className="rentals-stat-value" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Items I'm Renting */}
          <div className="rental-section">
            <div className="section-head">
              <div className="section-dot-green" />
              <h2 className="section-title">Items I'm Renting</h2>
              <span className="section-count-green">{myRentals?.length || 0}</span>
            </div>
            {myRentals && myRentals.length > 0 ? (
              myRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="renter" />)
            ) : (
              <div className="rental-empty">
                <div className="rental-empty-icon">🔍</div>
                <p className="rental-empty-text">You haven't rented anything yet</p>
                <Link href="/items" style={{ color: '#2ECC8F', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>Browse items →</Link>
              </div>
            )}
          </div>

          {/* Requests for My Items */}
          <div className="rental-section">
            <div className="section-head">
              <div className="section-dot-gold" />
              <h2 className="section-title">Requests for My Items</h2>
              <span className="section-count-gold">{ownerRentals?.length || 0}</span>
            </div>
            {ownerRentals && ownerRentals.length > 0 ? (
              ownerRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="owner" />)
            ) : (
              <div className="rental-empty">
                <div className="rental-empty-icon">📭</div>
                <p className="rental-empty-text">No rental requests for your items yet</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}