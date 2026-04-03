import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: rental } = await supabase
    .from('rentals')
    .select(`*, items(id, title, image_url, price_per_day, condition), renter:profiles!rentals_renter_id_fkey(id, full_name, email, trust_score), owner:profiles!rentals_owner_id_fkey(id, full_name, email, trust_score)`)
    .eq('id', id).single()

  if (!rental) redirect('/rentals')

  const isOwner = user.id === rental.owner_id
  const isRenter = user.id === rental.renter_id

  const statusConfig: any = {
    pending:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending Review', icon: '⏳' },
    approved:  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Approved', icon: '✅' },
    active:    { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Active', icon: '🟢' },
    completed: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'Completed', icon: '🏁' },
    declined:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Declined', icon: '❌' },
    cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Cancelled', icon: '🚫' },
  }
  const s = statusConfig[rental.status] || statusConfig.pending

  return (
    <>
      <style>{`
        .rental-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .action-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .rental-grid { grid-template-columns: 1fr; }
          .action-btns { flex-direction: column; }
          .action-btns form, .action-btns a { width: 100%; }
          .action-btns button, .action-btns a { width: 100%; text-align: center; box-sizing: border-box; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/rentals" style={{ width: '38px', height: '38px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none', fontSize: '18px', flexShrink: 0 }}>←</Link>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Rental Details</p>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', color: '#ffffff', margin: 0 }}>{rental.items?.title}</h1>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 24px' }}>
          <div style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', padding: '18px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>{s.icon}</span>
            <div>
              <p style={{ fontWeight: '700', fontSize: '16px', color: s.color, margin: '0 0 4px' }}>Status: {s.label}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {rental.status === 'pending' && isOwner && 'Review this request and approve or decline it.'}
                {rental.status === 'pending' && isRenter && 'Waiting for the owner to respond to your request.'}
                {rental.status === 'approved' && 'This rental has been approved and is ready to proceed.'}
                {rental.status === 'completed' && 'This rental has been completed successfully.'}
              </p>
            </div>
          </div>

          <div className="rental-grid">
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Item</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>📦</div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', margin: '0 0 4px' }}>{rental.items?.title}</p>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#26619C', margin: 0 }}>₱{rental.items?.price_per_day}<span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '400' }}>/day</span></p>
                </div>
              </div>
              <Link href={`/items/${rental.items?.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#26619C', textDecoration: 'none', padding: '8px 14px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>View Item →</Link>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Rental Period</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div><p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }}>From</p><p style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', margin: 0 }}>{rental.start_date}</p></div>
                <span style={{ fontSize: '18px', color: '#94a3b8' }}>→</span>
                <div><p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }}>To</p><p style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', margin: 0 }}>{rental.end_date}</p></div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }}>Total Price</p>
                <p style={{ fontSize: '26px', fontWeight: '800', color: '#26619C', margin: 0 }}>₱{rental.total_price}</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Renter</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #0891b2, #06b6d4)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px', flexShrink: 0 }}>{rental.renter?.full_name?.charAt(0)}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.renter?.full_name}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.renter?.email}</p>
                  {rental.renter?.trust_score > 0 && <p style={{ fontSize: '12px', color: '#d97706', margin: 0, fontWeight: '700' }}>★ Trust Score: {rental.renter.trust_score}</p>}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Owner</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px', flexShrink: 0 }}>{rental.owner?.full_name?.charAt(0)}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.owner?.full_name}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.owner?.email}</p>
                  {rental.owner?.trust_score > 0 && <p style={{ fontSize: '12px', color: '#d97706', margin: 0, fontWeight: '700' }}>★ Trust Score: {rental.owner.trust_score}</p>}
                </div>
              </div>
            </div>
          </div>

          {rental.message && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '22px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Message from Renter</p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>"{rental.message}"</p>
            </div>
          )}

          <div className="action-btns">
            {isOwner && rental.status === 'pending' && (
              <>
                <form action={`/api/rentals/${id}/approve`} method="POST" style={{ flex: 1 }}>
                  <button type="submit" style={{ width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#ffffff', fontWeight: '700', borderRadius: '12px', border: 'none', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>✅ Approve Request</button>
                </form>
                <form action={`/api/rentals/${id}/decline`} method="POST">
                  <button type="submit" style={{ width: '100%', padding: '14px 24px', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: '700', borderRadius: '12px', border: '1px solid #fecaca', fontSize: '15px', cursor: 'pointer' }}>❌ Decline</button>
                </form>
              </>
            )}
            {isOwner && rental.status === 'approved' && (
              <form action={`/api/rentals/${id}/complete`} method="POST" style={{ flex: 1 }}>
                <button type="submit" style={{ width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', color: '#ffffff', fontWeight: '700', borderRadius: '12px', border: 'none', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(26,58,92,0.3)' }}>🏁 Mark as Completed</button>
              </form>
            )}
            {isRenter && rental.status === 'pending' && (
              <form action={`/api/rentals/${id}/cancel`} method="POST" style={{ flex: 1 }}>
                <button type="submit" style={{ width: '100%', padding: '14px 24px', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: '700', borderRadius: '12px', border: '1px solid #fecaca', fontSize: '15px', cursor: 'pointer' }}>🚫 Cancel Request</button>
              </form>
            )}
            {rental.status === 'completed' && (isOwner || isRenter) && (
              <Link href={`/reviews/new?rental=${id}`} style={{ flex: 1, display: 'block', textAlign: 'center', padding: '14px 24px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#ffffff', fontWeight: '700', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', boxShadow: '0 4px 16px rgba(217,119,6,0.3)' }}>⭐ Leave a Review</Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}