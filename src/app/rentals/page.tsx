import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RentalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myRentals } = await supabase
    .from('rentals')
    .select(`*, items(title, image_url, price_per_day, categories(name, icon)), profiles!rentals_owner_id_fkey(full_name)`)
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })

  const { data: ownerRentals } = await supabase
    .from('rentals')
    .select(`*, items(title, image_url, price_per_day), profiles!rentals_renter_id_fkey(full_name)`)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const statusConfig: any = {
    pending:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending' },
    approved:  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Approved' },
    active:    { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Active' },
    completed: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'Completed' },
    declined:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Declined' },
    cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Cancelled' },
  }

  const allRentals = [...(myRentals || []), ...(ownerRentals || [])]
  const pendingCount = allRentals.filter(r => r.status === 'pending').length

  const RentalCard = ({ rental, role }: { rental: any, role: 'renter' | 'owner' }) => {
    const s = statusConfig[rental.status] || statusConfig.pending
    return (
      <Link href={`/rentals/${rental.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '10px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
            {rental.items?.categories?.icon || '📦'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.items?.title}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 3px' }}>{rental.start_date} → {rental.end_date}</p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {role === 'renter' ? `Owner: ${rental.profiles?.full_name}` : `Renter: ${rental.profiles?.full_name}`}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '5px 10px', borderRadius: '999px', border: `1px solid ${s.border}`, backgroundColor: s.bg, color: s.color, display: 'block', marginBottom: '6px', whiteSpace: 'nowrap' }}>{s.label}</span>
            <p style={{ fontSize: '15px', fontWeight: '800', color: '#26619C', margin: 0 }}>₱{rental.total_price}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <style>{`
        .rentals-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 28px; }
        @media (min-width: 640px) {
          .rentals-stats { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>My Activity</p>
              <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '800', color: '#ffffff', margin: 0 }}>Rentals</h1>
            </div>
            <Link href="/items" style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>Browse Items →</Link>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px' }}>

          {/* Stats — 2 cols on mobile, 4 on desktop */}
          <div className="rentals-stats">
            {[
              { label: 'Total Requests', value: allRentals.length, color: '#26619C' },
              { label: 'As Renter', value: myRentals?.length || 0, color: '#0891b2' },
              { label: 'As Owner', value: ownerRentals?.length || 0, color: '#7c3aed' },
              { label: 'Pending', value: pendingCount, color: '#d97706' },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                <p style={{ fontSize: '30px', fontWeight: '800', color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Items I'm Renting */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#26619C', flexShrink: 0 }} />
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Items I'm Renting</h2>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#26619C', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '999px' }}>{myRentals?.length || 0}</span>
            </div>
            {myRentals && myRentals.length > 0 ? (
              myRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="renter" />)
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '36px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</p>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 8px' }}>You haven't rented anything yet</p>
                <Link href="/items" style={{ color: '#26619C', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Browse items →</Link>
              </div>
            )}
          </div>

          {/* Requests for My Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7c3aed', flexShrink: 0 }} />
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Requests for My Items</h2>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '3px 10px', borderRadius: '999px' }}>{ownerRentals?.length || 0}</span>
            </div>
            {ownerRentals && ownerRentals.length > 0 ? (
              ownerRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="owner" />)
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '36px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>📭</p>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No rental requests for your items yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}