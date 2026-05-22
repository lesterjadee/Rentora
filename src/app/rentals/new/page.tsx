'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, AlertTriangle, ShieldCheck, MessageCircle } from 'lucide-react'

function getTrustTier(score: number | null | undefined) {
  if (!score || score === 0) return 'normal'
  if (score >= 4.0) return 'highly_trusted'
  if (score >= 3.0) return 'normal'
  return 'low_trust'
}

function NewRentalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get('item_id') || searchParams.get('item')
  const supabase = createClient()

  const [item, setItem]                 = useState<any>(null)
  const [userProfile, setUserProfile]   = useState<any>(null)
  const [activeRentalCount, setActiveRentalCount] = useState(0)
  const [startDate, setStartDate]       = useState('')
  const [endDate, setEndDate]           = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    if (!itemId) return
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: itemData }, { data: profileData }, { count }] = await Promise.all([
        supabase.from('items').select('*, categories(name), profiles(id, full_name, trust_score)').eq('id', itemId).single(),
        supabase.from('profiles').select('trust_score').eq('id', user.id).single(),
        supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('renter_id', user.id).in('status', ['pending', 'approved']),
      ])

      if (itemData) setItem(itemData)
      else router.push('/items')
      if (profileData) setUserProfile(profileData)
      setActiveRentalCount(count || 0)
    }
    init()
  }, [itemId])

  const tier       = getTrustTier(userProfile?.trust_score)
  const isLowTrust = tier === 'low_trust'
  const isBlocked  = isLowTrust && activeRentalCount >= 1

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 0
  const total = days * (item?.price_per_day || 0)

  const delayLiftTime = new Date(Date.now() + 12 * 60 * 60 * 1000)
    .toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isBlocked) { setError('Low trust users can only have 1 active rental at a time.'); setLoading(false); return }
    if (!startDate || !endDate) { setError('Please select both start and end dates.'); setLoading(false); return }
    if (new Date(endDate) <= new Date(startDate)) { setError('End date must be after start date.'); setLoading(false); return }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const visibleAt = isLowTrust
        ? new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
        : null

      const { data, error: insertError } = await supabase.from('rentals').insert({
        renter_id: user.id,
        owner_id: item.owner_id,
        item_id: itemId,
        start_date: startDate,
        end_date: endDate,
        status: 'pending',
        total_price: total,
        visible_at: visibleAt,
      }).select().single()

      if (insertError) throw insertError

      // Redirect to chat with the item owner
      router.push(`/messages/${item.owner_id}?rental_id=${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  if (!item) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={24} color="var(--g-rich)" strokeWidth={1.5} />
      </div>
    </div>
  )

  const inputStyle: React.CSSProperties  = { width: '100%', padding: '13px 16px', fontSize: '14px', borderRadius: '12px', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties  = { display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }

  return (
    <>
      <style>{`
        .rn { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rn-banner { position: relative; overflow: hidden; padding: 44px 28px 96px; border-bottom: 1px solid rgba(6,214,33,0.08); }
        .rn-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 50% 70% at 90% 0%, rgba(110,255,128,0.06), transparent 55%); pointer-events: none; }
        .rn-banner::after  { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent); }
        .rn-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1); border-radius: 22px; padding: 28px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
        .rn-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        .rn-summary { position: sticky; top: 84px; background: linear-gradient(135deg, #011E05, #023D09 50%, #011E05); border: 1px solid rgba(6,214,33,0.08); border-radius: 20px; padding: 24px; overflow: hidden; }
        .rn-summary::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(110,255,128,0.2), transparent); }
        .rn-total-box { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.22); border-radius: 14px; padding: 16px; margin-top: 16px; }
        .notice-blocked { background: rgba(239,68,68,0.06); border: 1.5px solid rgba(239,68,68,0.25); border-radius: 20px; padding: 32px 28px; text-align: center; margin-bottom: 16px; }
        .notice-delay { background: rgba(201,168,76,0.08); border: 1.5px solid rgba(201,168,76,0.28); border-radius: 16px; padding: 16px 20px; margin-bottom: 16px; display: flex; gap: 14px; align-items: flex-start; }
        .chat-notice { background: rgba(4,149,22,0.07); border: 1.5px solid rgba(4,149,22,0.18); border-radius: 14px; padding: 14px 18px; margin-bottom: 16px; display: flex; gap: 12px; align-items: center; }
        @media (max-width: 900px) { .rn-grid { grid-template-columns: 1fr; } .rn-summary { position: static; } }
      `}</style>

      <div className="rn">
        <div className="rn-banner">
          <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>
            <Link href={`/items/${itemId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--tx-muted)', textDecoration: 'none', marginBottom: '20px', fontWeight: '600' }}>
              <ArrowLeft size={14} strokeWidth={2} /> Back to Item
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6EFF80' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>New Rental</span>
            </div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: 0 }}>
              Request to Rent
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: '860px', margin: '-60px auto 0', padding: '0 28px 60px' }}>

          {isBlocked && (
            <div className="notice-blocked">
              <AlertTriangle size={28} color="#EF4444" strokeWidth={1.8} style={{ margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#B91C1C', margin: '0 0 10px' }}>Cannot Rent Another Item</h3>
              <p style={{ fontSize: '14px', color: '#B91C1C', margin: '0 0 20px', opacity: 0.85, lineHeight: '1.65' }}>
                Trust score <strong>{userProfile?.trust_score?.toFixed(2)}</strong> — Low trust users can only have 1 active rental at a time.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/rentals" style={{ display: 'inline-flex', padding: '11px 22px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#B91C1C', fontWeight: '700', fontSize: '14px', borderRadius: '12px', textDecoration: 'none' }}>
                  View My Rentals
                </Link>
                <Link href="/items" className="btn-ghost" style={{ fontSize: '14px', padding: '11px 22px' }}>Browse Items</Link>
              </div>
            </div>
          )}

          {isLowTrust && !isBlocked && (
            <div className="notice-delay">
              <div style={{ width: '38px', height: '38px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={18} color="var(--au-mid)" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--au-dark)', margin: '0 0 4px' }}>12-Hour Delay</p>
                <p style={{ fontSize: '13px', color: 'var(--au-dark)', margin: 0, opacity: 0.85, lineHeight: '1.6' }}>
                  Score <strong>{userProfile?.trust_score?.toFixed(2)}</strong> — owner can see your request from <strong>{delayLiftTime}</strong>.
                </p>
              </div>
            </div>
          )}

          {tier === 'highly_trusted' && (
            <div style={{ marginBottom: '16px', padding: '14px 18px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <ShieldCheck size={18} color="var(--au-mid)" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: 'var(--au-dark)', margin: 0, fontWeight: '600' }}>
                <strong>Highly Trusted</strong> — Your request is instantly visible to the owner.
              </p>
            </div>
          )}

          {/* Chat notice */}
          {!isBlocked && (
            <div className="chat-notice">
              <MessageCircle size={18} color="var(--g-rich)" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: 'var(--g-mid)', margin: 0, fontWeight: '600' }}>
                After submitting, you'll be taken to a chat with <strong>{item.profiles?.full_name}</strong> to discuss details, price, and meetup location.
              </p>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          {!isBlocked && (
            <div className="rn-grid">
              <form onSubmit={handleSubmit}>
                <div className="rn-card">
                  <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '16px' }}>Item</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '13px', border: '1px solid rgba(4,149,22,0.12)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '56px', height: '56px', background: 'rgba(4,149,22,0.07)', border: '1px solid rgba(4,149,22,0.14)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={24} color="var(--g-rich)" strokeWidth={1.8} />
                      </div>
                    )}
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--tx-bright)', margin: '0 0 3px' }}>{item.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>Owner: {item.profiles?.full_name} · ₱{item.price_per_day}/day</p>
                    </div>
                  </div>
                </div>

                <div className="rn-card">
                  <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '20px' }}>Rental Period</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Start Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>End Date</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required min={startDate || new Date().toISOString().split('T')[0]} style={inputStyle} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" disabled={loading || days === 0} className="btn-gold" style={{ fontSize: '15px', padding: '13px 32px', opacity: (loading || days === 0) ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {loading ? 'Submitting...' : <><MessageCircle size={16} strokeWidth={2.5} /> Submit & Chat with Owner</>}
                  </button>
                  <Link href={`/items/${itemId}`} className="btn-ghost" style={{ fontSize: '15px', padding: '13px 24px' }}>Cancel</Link>
                </div>
              </form>

              <div>
                <div className="rn-summary" style={{ position: 'relative' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(240,255,242,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Summary</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { l: 'Item',      v: item.title },
                      { l: 'Price/day', v: `₱${item.price_per_day}` },
                      { l: 'Owner',     v: item.profiles?.full_name },
                      { l: 'Duration',  v: days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : '—' },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'rgba(240,255,242,0.5)', fontWeight: '600' }}>{row.l}</span>
                        <span style={{ fontSize: '12px', color: '#F0FFF2', fontWeight: '700', maxWidth: '160px', textAlign: 'right' as const }}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rn-total-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#E2C07A' }}>Total</span>
                      <span style={{ fontSize: '24px', fontWeight: '900', color: '#E2C07A', letterSpacing: '-0.04em' }}>₱{total > 0 ? total : '—'}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(4,149,22,0.1)', border: '1px solid rgba(4,149,22,0.18)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                      <MessageCircle size={12} color="#6EFF80" strokeWidth={2.5} />
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>After Submit</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(240,255,242,0.65)', margin: 0, lineHeight: '1.6' }}>
                      You'll go straight to a chat with the owner to discuss details and meetup location.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function NewRentalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={24} color="var(--g-rich)" strokeWidth={1.5} />
        </div>
      </div>
    }>
      <NewRentalForm />
    </Suspense>
  )
}