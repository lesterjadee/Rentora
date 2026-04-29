import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, ArrowUpRight } from 'lucide-react'

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
      <Link href={`/rentals/${rental.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: '16px',
          border: '1px solid var(--border-sub)',
          padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer', position: 'relative', overflow: 'hidden'
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'rgba(201,168,76,0.18)'
          el.style.background = 'var(--bg-hover)'
          el.style.transform = 'translateX(3px)'
          el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.06)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--border-sub)'
          el.style.background = 'var(--bg-card)'
          el.style.transform = 'translateX(0)'
          el.style.boxShadow = 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
            <div style={{ width: '46px', height: '46px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.15)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              {rental.items?.categories?.icon || '📦'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{rental.items?.title}</p>
              <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: '0 0 3px', fontWeight: '500' }}>{rental.start_date} → {rental.end_date}</p>
              <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0, fontWeight: '600' }}>
                {role === 'renter' ? `Owner: ${rental.profiles?.full_name}` : `Renter: ${rental.profiles?.full_name}`}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span className={s.cls}>{s.label}</span>
            <p style={{ fontSize: '17px', fontWeight: '900', color: '#2ECC8F', margin: 0, letterSpacing: '-0.03em' }}>₱{rental.total_price}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <style>{`
        .rentals { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
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
        .rentals-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
        .rentals-stat-card {
          background: var(--bg-card); border-radius: '16px';
          border: 1px solid var(--border-sub);
          padding: 20px 18px;
          border-radius: 16px;
          position: relative; overflow: hidden;
          transition: all 0.2s;
        }
        .rentals-stat-card:hover { border-color: rgba(201,168,76,0.15); transform: translateY(-1px); }
        .rentals-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        @media (max-width: 640px) {
          .rentals-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="rentals">
        <div className="rentals-banner">
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', position: 'relative' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22A876', boxShadow: '0 0 6px rgba(34,168,118,0.6)' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase', letterSpacing: '0.12em' }}>My Activity</span>
              </div>
              <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.04em' }}>Rentals</h1>
            </div>
            <Link href="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-sub)', color: 'var(--tx-muted)', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              <ShoppingBag size={14} strokeWidth={2} /> Browse Items
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 28px 60px' }}>

          {/* Stats */}
          <div className="rentals-stats">
            {[
              { label: 'Total Requests', value: allRentals.length, color: '#2ECC8F', glow: 'rgba(34,168,118,0.06)' },
              { label: 'As Renter', value: myRentals?.length || 0, color: '#93C5FD', glow: 'rgba(59,130,246,0.06)' },
              { label: 'As Owner', value: ownerRentals?.length || 0, color: '#C4B5FD', glow: 'rgba(167,139,250,0.06)' },
              { label: 'Pending', value: pendingCount, color: '#E2C07A', glow: 'rgba(201,168,76,0.08)' },
            ].map((s, i) => (
              <div key={i} className="rentals-stat-card" style={{ background: `radial-gradient(ellipse 80% 60% at 80% 20%, ${s.glow}, transparent), var(--bg-card)` }}>
                <p style={{ fontSize: '10px', color: 'var(--tx-muted)', fontWeight: '800', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                <p style={{ fontSize: '40px', fontWeight: '900', color: s.color, margin: 0, letterSpacing: '-0.05em', lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* I'm Renting */}
          <div style={{ marginBottom: '32px' }}>
            <div className="rentals-section-head">
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2ECC8F', boxShadow: '0 0 8px rgba(34,168,118,0.5)' }} />
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Items I'm Renting</h2>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#2ECC8F', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', padding: '3px 10px', borderRadius: '999px' }}>
                {myRentals?.length || 0}
              </span>
            </div>
            {myRentals && myRentals.length > 0 ? (
              myRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="renter" />)
            ) : (
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-sub)', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '10px' }}>🔍</p>
                <p style={{ color: 'var(--tx-muted)', fontSize: '14px', fontWeight: '600', margin: '0 0 10px' }}>You haven't rented anything yet</p>
                <Link href="/items" style={{ color: '#2ECC8F', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>Browse items →</Link>
              </div>
            )}
          </div>

          {/* Requests for My Items */}
          <div>
            <div className="rentals-section-head">
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E2C07A', boxShadow: '0 0 8px rgba(201,168,76,0.4)' }} />
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Requests for My Items</h2>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--au-light)', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.2)', padding: '3px 10px', borderRadius: '999px' }}>
                {ownerRentals?.length || 0}
              </span>
            </div>
            {ownerRentals && ownerRentals.length > 0 ? (
              ownerRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="owner" />)
            ) : (
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-sub)', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '10px' }}>📭</p>
                <p style={{ color: 'var(--tx-muted)', fontSize: '14px', fontWeight: '600', margin: 0 }}>No rental requests for your items yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}