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
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })

  const { data: ownerRentals } = await supabase
    .from('rentals')
    .select('*, items(title, image_url, price_per_day, categories(name, icon)), profiles!rentals_renter_id_fkey(full_name)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const statusConfig: any = {
    pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)',  label: 'Pending' },
    approved:  { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6', border: 'rgba(59,130,246,0.25)',  label: 'Approved' },
    active:    { bg: 'rgba(46,204,143,0.1)',  color: '#2ECC8F', border: 'rgba(46,204,143,0.25)',  label: 'Active' },
    completed: { bg: 'rgba(160,160,160,0.1)', color: '#A3A3A3', border: 'rgba(160,160,160,0.2)', label: 'Completed' },
    declined:  { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)',   label: 'Declined' },
    cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)',   label: 'Cancelled' },
  }

  const allRentals = [...(myRentals || []), ...(ownerRentals || [])]
  const pendingCount = allRentals.filter(r => r.status === 'pending').length

  const RentalCard = ({ rental, role }: { rental: any, role: 'renter' | 'owner' }) => {
    const s = statusConfig[rental.status] || statusConfig.pending
    return (
      <Link href={`/rentals/${rental.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
        <div style={{ background: '#111111', borderRadius: '14px', border: '1px solid #1C1C1C', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(46,204,143,0.2)'; (e.currentTarget as HTMLElement).style.background = '#141414' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1C1C1C'; (e.currentTarget as HTMLElement).style.background = '#111111' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
            <div style={{ width: '44px', height: '44px', background: '#1C1C1C', border: '1px solid #2E2E2E', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              {rental.items?.categories?.icon || '📦'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: '700', fontSize: '14px', color: '#F0F0F0', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.items?.title}</p>
              <p style={{ fontSize: '12px', color: '#606060', margin: '0 0 3px' }}>{rental.start_date} → {rental.end_date}</p>
              <p style={{ fontSize: '11px', color: '#606060', margin: 0 }}>
                {role === 'renter' ? `Owner: ${rental.profiles?.full_name}` : `Renter: ${rental.profiles?.full_name}`}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '5px 12px', borderRadius: '999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: 'block', marginBottom: '8px', whiteSpace: 'nowrap' }}>{s.label}</span>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#2ECC8F', margin: 0, letterSpacing: '-0.02em' }}>₱{rental.total_price}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <style>{`
        body { background: #0A0A0A; }
        .rentals-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 28px; }
        @media (min-width: 640px) { .rentals-stats { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', fontFamily: 'system-ui, sans-serif', color: '#F0F0F0' }}>

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0A2118, #0F3D2E 60%, #0A0A0A)', padding: '48px 24px 56px', borderBottom: '1px solid #1C1C1C', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,143,0.06), transparent)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', position: 'relative' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#2ECC8F', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>My Activity</p>
              <h1 style={{ fontSize: 'clamp(24px,5vw,34px)', fontWeight: '900', color: '#F0F0F0', margin: 0, letterSpacing: '-0.03em' }}>Rentals</h1>
            </div>
            <Link href="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid #2E2E2E', color: '#A3A3A3', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              <ShoppingBag size={15} strokeWidth={2} /> Browse Items
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px' }}>

          {/* Stats */}
          <div className="rentals-stats">
            {[
              { label: 'Total Requests', value: allRentals.length, color: '#2ECC8F' },
              { label: 'As Renter', value: myRentals?.length || 0, color: '#3B82F6' },
              { label: 'As Owner', value: ownerRentals?.length || 0, color: '#A78BFA' },
              { label: 'Pending', value: pendingCount, color: '#F59E0B' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#111111', borderRadius: '14px', border: '1px solid #1C1C1C', padding: '18px 16px', transition: 'border-color 0.2s' }}>
                <p style={{ fontSize: '11px', color: '#606060', fontWeight: '700', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                <p style={{ fontSize: '34px', fontWeight: '900', color: s.color, margin: 0, letterSpacing: '-0.04em' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Items I'm Renting */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2ECC8F', flexShrink: 0 }} />
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#F0F0F0', margin: 0 }}>Items I'm Renting</h2>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#2ECC8F', background: 'rgba(46,204,143,0.1)', border: '1px solid rgba(46,204,143,0.2)', padding: '2px 10px', borderRadius: '999px' }}>
                {myRentals?.length || 0}
              </span>
            </div>
            {myRentals && myRentals.length > 0 ? (
              myRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="renter" />)
            ) : (
              <div style={{ background: '#111111', borderRadius: '14px', border: '1px solid #1C1C1C', padding: '36px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</p>
                <p style={{ color: '#606060', fontSize: '14px', margin: '0 0 10px' }}>You haven't rented anything yet</p>
                <Link href="/items" style={{ color: '#2ECC8F', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>Browse items →</Link>
              </div>
            )}
          </div>

          {/* Requests for My Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#A78BFA', flexShrink: 0 }} />
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#F0F0F0', margin: 0 }}>Requests for My Items</h2>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#A78BFA', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', padding: '2px 10px', borderRadius: '999px' }}>
                {ownerRentals?.length || 0}
              </span>
            </div>
            {ownerRentals && ownerRentals.length > 0 ? (
              ownerRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="owner" />)
            ) : (
              <div style={{ background: '#111111', borderRadius: '14px', border: '1px solid #1C1C1C', padding: '36px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>📭</p>
                <p style={{ color: '#606060', fontSize: '14px', margin: 0 }}>No rental requests for your items yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}