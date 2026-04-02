import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RentalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myRentals } = await supabase
    .from('rentals')
    .select(`*, items(title, image_url, price_per_day), profiles!rentals_owner_id_fkey(full_name)`)
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

  const RentalCard = ({ rental, role }: { rental: any, role: 'renter' | 'owner' }) => {
    const s = statusConfig[rental.status] || statusConfig.pending
    return (
      <Link href={`/rentals/${rental.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          border: '1px solid #e8edf2', padding: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer',
          transition: 'all 0.15s', marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', backgroundColor: '#eff6ff',
              borderRadius: '14px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0
            }}>📦</div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', margin: '0 0 4px' }}>
                {rental.items?.title}
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 4px' }}>
                {rental.start_date} → {rental.end_date}
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {role === 'renter' ? `Owner: ${rental.profiles?.full_name}` : `Renter: ${rental.profiles?.full_name}`}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{
              fontSize: '12px', fontWeight: '700', padding: '6px 14px',
              borderRadius: '999px', border: `1px solid ${s.border}`,
              backgroundColor: s.bg, color: s.color, display: 'block', marginBottom: '8px'
            }}>{s.label}</span>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#26619C', margin: 0 }}>
              ₱{rental.total_price}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>My Activity</p>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>Rentals</h1>
          </div>
          <Link href="/items" style={{
            padding: '10px 22px', backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#ffffff', fontWeight: '600', borderRadius: '12px',
            textDecoration: 'none', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)'
          }}>Browse Items →</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Total Requests', value: (myRentals?.length || 0) + (ownerRentals?.length || 0), color: '#26619C', bg: '#eff6ff' },
            { label: 'As Renter', value: myRentals?.length || 0, color: '#0891b2', bg: '#ecfeff' },
            { label: 'As Owner', value: ownerRentals?.length || 0, color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Pending', value: [...(myRentals || []), ...(ownerRentals || [])].filter(r => r.status === 'pending').length, color: '#d97706', bg: '#fffbeb' },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff', borderRadius: '16px',
              border: '1px solid #e8edf2', padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Items I'm Renting */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#26619C' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Items I'm Renting</h2>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#26619C', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '999px' }}>
              {myRentals?.length || 0}
            </span>
          </div>
          {myRentals && myRentals.length > 0 ? (
            myRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="renter" />)
          ) : (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</p>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>You haven't rented anything yet</p>
              <Link href="/items" style={{ color: '#26619C', fontSize: '14px', fontWeight: '600', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>Browse items →</Link>
            </div>
          )}
        </div>

        {/* Requests for My Items */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Requests for My Items</h2>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '3px 10px', borderRadius: '999px' }}>
              {ownerRentals?.length || 0}
            </span>
          </div>
          {ownerRentals && ownerRentals.length > 0 ? (
            ownerRentals.map((r: any) => <RentalCard key={r.id} rental={r} role="owner" />)
          ) : (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No rental requests for your items yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}