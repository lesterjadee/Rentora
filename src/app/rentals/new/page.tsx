'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, MessageSquare, Tag } from 'lucide-react'

function RentalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get('item')
  const supabase = createClient()

  const [item, setItem] = useState<any>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!itemId) return
    const fetchItem = async () => {
      const { data } = await supabase
        .from('items')
        .select('*, profiles(full_name, trust_score), categories(name, icon)')
        .eq('id', itemId)
        .single()
      if (data) setItem(data)
    }
    fetchItem()
  }, [itemId])

  const totalDays = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0
  const totalPrice = item ? totalDays * item.price_per_day : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.')
      setLoading(false)
      return
    }

    const { data: conflicts } = await supabase
      .from('rentals')
      .select('id')
      .eq('item_id', itemId)
      .in('status', ['approved', 'active'])
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)

    if (conflicts && conflicts.length > 0) {
      setError('This item is already booked for the selected dates. Please choose different dates.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('rentals').insert({
      item_id: itemId,
      renter_id: user.id,
      owner_id: item.owner_id,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      message: message || null,
      status: 'pending'
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/rentals')
    router.refresh()
  }

  const today = new Date().toISOString().split('T')[0]

  if (!item) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <p style={{ color: 'var(--tx-muted)', fontSize: '14px' }}>Loading item details...</p>
    </div>
  )

  return (
    <>
      <style>{`
        .rn { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rn-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .rn-banner::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
        }
        .rn-inner { max-width: 820px; margin: 0 auto; padding: 32px 28px 60px; }
        .rn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .rn-card {
          background: var(--bg-card);
          border: 1px solid var(--border-sub);
          border-radius: 20px; padding: 26px;
          box-shadow: var(--shadow-sm);
        }
        .rn-label {
          display: block; font-size: 11px; font-weight: 800;
          color: var(--tx-muted); text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 10px;
        }
        .rn-input {
          width: 100%; padding: 13px 16px;
          background: var(--bg-raised) !important;
          border: 1px solid var(--border-sub) !important;
          border-radius: 12px !important;
          font-size: 14px; color: var(--tx-bright) !important;
          outline: none; box-sizing: border-box;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rn-input:focus {
          border-color: rgba(201,168,76,0.4) !important;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.08) !important;
        }
        .rn-input::placeholder { color: var(--tx-muted) !important; }
        .rn-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5) sepia(1) hue-rotate(90deg);
          cursor: pointer; opacity: 0.6;
        }
        .rn-summary {
          background: linear-gradient(135deg, #080E0A, #0D2B1A 50%, #080808);
          border: 1px solid rgba(34,168,118,0.15);
          border-radius: 20px; padding: 26px;
          position: relative; overflow: hidden;
          margin-bottom: 14px;
        }
        .rn-summary::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,168,118,0.4), transparent);
        }
        .rn-summary-row {
          display: flex; justify-content: space-between;
          align-items: center; padding: 10px 0;
          border-bottom: 1px solid var(--border-dim);
        }
        .rn-summary-row:last-child { border-bottom: none; }
        .rn-total-box {
          background: linear-gradient(135deg, var(--au-deep), rgba(42,30,8,0.5));
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 14px; padding: 18px 20px;
          margin-top: 16px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .rn-submit {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #6B4C18, var(--au-mid), #A07828);
          border: 1px solid rgba(201,168,76,0.4);
          color: #0C0D10; font-weight: 800; font-size: 16px;
          border-radius: 14px; cursor: pointer;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 4px 20px rgba(201,168,76,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
          letter-spacing: -0.01em;
        }
        .rn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #7A5520, var(--au-light), #C9A030);
          box-shadow: 0 6px 32px rgba(201,168,76,0.35);
          transform: translateY(-1px);
        }
        .rn-submit:disabled {
          background: var(--bg-raised); border-color: var(--border-sub);
          color: var(--tx-muted); cursor: not-allowed;
          box-shadow: none; transform: none;
        }
        @media (max-width: 640px) {
          .rn-grid { grid-template-columns: 1fr; }
          .rn-inner { padding: 24px 20px 48px; }
          .rn-banner { padding: 32px 20px 44px; }
        }
      `}</style>

      <div className="rn">
        {/* Banner */}
        <div className="rn-banner">
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <Link href={`/items/${itemId}`} style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-body)', textDecoration: 'none', flexShrink: 0 }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '5px' }}>New Rental</p>
              <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.03em' }}>
                Request to Rent
              </h1>
            </div>
          </div>
        </div>

        <div className="rn-inner">

          {error && (
            <div style={{ marginBottom: '16px', padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', color: '#FCA5A5', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Item Preview Card */}
          <div className="rn-card" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--bg-raised)', border: '1px solid var(--border-sub)', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '28px' }}>{item.categories?.icon || '📦'}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', borderRadius: '999px' }}>
                  <Tag size={10} color="#22A876" strokeWidth={2} />
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{item.categories?.name}</span>
                </div>
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 4px', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{item.title}</h2>
              <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0 }}>Owner: <span style={{ color: 'var(--tx-body)', fontWeight: '600' }}>{item.profiles?.full_name}</span></p>
            </div>
            <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
              <p style={{ fontSize: '26px', fontWeight: '900', color: '#2ECC8F', margin: 0, letterSpacing: '-0.04em' }}>₱{item.price_per_day}</p>
              <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: '2px 0 0' }}>per day</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Dates */}
            <div className="rn-card" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-sub)' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarDays size={16} color="#22A876" strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Select Dates</h3>
              </div>
              <div className="rn-grid">
                <div>
                  <label className="rn-label">Start Date</label>
                  <input
                    type="date" value={startDate} min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    required className="rn-input"
                  />
                </div>
                <div>
                  <label className="rn-label">End Date</label>
                  <input
                    type="date" value={endDate} min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    required className="rn-input"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="rn-card" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-sub)' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} color="#C9A84C" strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Message <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--tx-muted)' }}>(Optional)</span></h3>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Introduce yourself or ask the owner a question..."
                style={{ width: '100%', padding: '13px 16px', background: 'var(--bg-raised)', border: '1px solid var(--border-sub)', borderRadius: '12px', fontSize: '14px', color: 'var(--tx-bright)', outline: 'none', resize: 'none' as const, lineHeight: '1.6', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-sub)'}
              />
            </div>

            {/* Price Summary */}
            <div className="rn-summary">
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '14px' }}>Price Summary</p>

              <div className="rn-summary-row">
                <span style={{ fontSize: '13px', color: 'var(--tx-muted)', fontWeight: '600' }}>Daily rate</span>
                <span style={{ fontSize: '13px', color: 'var(--tx-bright)', fontWeight: '700' }}>₱{item.price_per_day}/day</span>
              </div>
              <div className="rn-summary-row">
                <span style={{ fontSize: '13px', color: 'var(--tx-muted)', fontWeight: '600' }}>Duration</span>
                <span style={{ fontSize: '13px', color: 'var(--tx-bright)', fontWeight: '700' }}>
                  {totalDays > 0 ? `${totalDays} day${totalDays !== 1 ? 's' : ''}` : 'Select dates'}
                </span>
              </div>
              <div className="rn-total-box">
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--tx-muted)', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: '0 0 4px' }}>Total</p>
                  <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0 }}>
                    {startDate && endDate && totalDays > 0 ? `${startDate} → ${endDate}` : 'Choose dates above'}
                  </p>
                </div>
                <p className={totalDays > 0 ? 'gold-shimmer' : ''} style={{ fontSize: '34px', fontWeight: '900', margin: 0, letterSpacing: '-0.05em', color: totalDays > 0 ? undefined : 'var(--tx-dim)' }}>
                  {totalDays > 0 ? `₱${totalPrice}` : '--'}
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading || totalDays === 0} className="rn-submit">
              {loading ? 'Submitting request...' : totalDays === 0 ? 'Select dates to continue' : `Submit Rental Request · ₱${totalPrice}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--tx-dim)', marginTop: '14px', lineHeight: '1.6' }}>
              Your request will be sent to the owner for approval. No payment is collected at this stage.
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

export default function NewRentalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
        <p style={{ color: 'var(--tx-muted)', fontSize: '14px' }}>Loading...</p>
      </div>
    }>
      <RentalForm />
    </Suspense>
  )
}