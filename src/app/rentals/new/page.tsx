'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Calendar, AlignLeft, Tag, ShieldCheck } from 'lucide-react'

function RentalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get('item')
  const supabase = createClient()

  const [item, setItem] = useState<any>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!itemId) return
    const fetchItem = async () => {
      const { data } = await supabase
        .from('items')
        .select('*, profiles(full_name)')
        .eq('id', itemId)
        .single()
      if (data) setItem(data)
    }
    fetchItem()
  }, [itemId])

  useEffect(() => {
    if (startDate && endDate && item) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        setTotalPrice(days * item.price_per_day)
      } else {
        setTotalPrice(0)
      }
    }
  }, [startDate, endDate, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start < today) {
      setError('Start date cannot be in the past')
      setLoading(false)
      return
    }

    if (end <= start) {
      setError('End date must be after start date')
      setLoading(false)
      return
    }

    // Check for overlapping rentals
    const { data: existing } = await supabase
      .from('rentals')
      .select('id')
      .eq('item_id', itemId)
      .in('status', ['approved', 'active'])
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    if (existing && existing.length > 0) {
      setError('This item is already booked for the selected dates')
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
      message,
      status: 'pending'
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/rentals')
    router.refresh()
  }

  if (!item) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void, #0A0F14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--tx-muted, #94a3b8)', fontSize: '14px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Loading item...</p>
    </div>
  )

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <style>{`
        .rent-page { min-height: 100vh; background: var(--bg-void, #05080A); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        
        .rent-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .rent-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
        }

        .rent-inner { max-width: 680px; margin: 0 auto; padding: 32px 24px 60px; }

        .rent-card {
          background: var(--bg-card, #0D141C);
          border: 1px solid var(--border-sub, rgba(255,255,255,0.05));
          border-radius: 20px; padding: 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          margin-bottom: 24px;
        }

        .input-group { margin-bottom: 20px; }
        .input-label {
          display: flex; alignItems: center; gap: 8px;
          font-size: 12px; font-weight: 800; color: var(--tx-muted, #94A3B8);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;
        }

        .rent-input {
          width: 100%; padding: 14px 16px;
          background: var(--bg-raised, #131B24); 
          border: 1px solid var(--border-mid, rgba(255,255,255,0.1));
          border-radius: 12px; color: var(--tx-bright, #FFFFFF); 
          font-size: 15px; font-family: inherit; outline: none; 
          transition: all 0.2s ease; box-sizing: border-box;
          color-scheme: dark;
        }
        .rent-input:focus {
          border-color: #C9A84C; background: rgba(201,168,76,0.03);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.15);
        }
        .rent-input::placeholder { color: rgba(255,255,255,0.3); }

        .price-preview {
          background: linear-gradient(135deg, rgba(10,32,24,0.6), rgba(6,14,9,0.8));
          border: 1px solid rgba(34,168,118,0.2); border-radius: 16px; padding: 24px;
          margin: 28px 0; display: flex; justify-content: space-between; align-items: center;
        }

        .btn-submit {
          width: 100%; padding: 18px; border-radius: 14px; font-weight: 800; font-size: 16px;
          background: linear-gradient(135deg, #C9A84C, #A6842B);
          border: 1px solid rgba(201,168,76,0.3); color: #000000;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(201,168,76,0.2);
          display: flex; justify-content: center; align-items: center; gap: 10px;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(201,168,76,0.35); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; background: var(--bg-raised, #131B24); color: var(--tx-muted, #94A3B8); border-color: var(--border-sub, rgba(255,255,255,0.05)); }

        .error-box {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 14px 16px; color: #FCA5A5;
          font-size: 13px; font-weight: 600; margin-bottom: 24px;
        }
      `}</style>

      <div className="rent-page">
        {/* Header Banner */}
        <div className="rent-banner">
          <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href={`/items/${itemId}`} style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', textDecoration: 'none', flexShrink: 0, transition: 'all 0.2s' }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Secure Your Dates</p>
              <h1 style={{ fontSize: 'clamp(24px,5vw,32px)', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '-0.03em' }}>Request to Rent</h1>
            </div>
          </div>
        </div>

        <div className="rent-inner">
          
          {/* Item Summary */}
          <div className="rent-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Tag size={24} color="#C9A84C" strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '800', fontSize: '18px', color: '#FFFFFF', margin: '0 0 4px' }}>{item.title}</p>
              <p style={{ fontSize: '14px', color: '#2ECC8F', margin: 0, fontWeight: '700', textShadow: '0 0 10px rgba(46,204,143,0.3)' }}>
                ₱{item.price_per_day} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '500', fontSize: '12px' }}>/day</span>
              </p>
            </div>
            <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Owner</p>
              <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '600', margin: 0 }}>{item.profiles?.full_name}</p>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="rent-card">
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label"><Calendar size={14} color="#C9A84C" /> Start Date *</label>
                <input
                  type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  min={today} required className="rent-input"
                />
              </div>
              <div className="input-group">
                <label className="input-label"><Calendar size={14} color="#C9A84C" /> End Date *</label>
                <input
                  type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today} required className="rent-input"
                />
              </div>
            </div>

            {/* Dynamic Price Preview */}
            {totalPrice > 0 ? (
              <div className="price-preview">
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Total Price</p>
                  <p style={{ fontSize: '13px', color: '#2ECC8F', margin: 0, fontWeight: '600' }}>
                    {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days × ₱{item.price_per_day}/day
                  </p>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#2ECC8F', textShadow: '0 0 20px rgba(46,204,143,0.4)' }}>
                  ₱{totalPrice.toFixed(2)}
                </div>
              </div>
            ) : (
              <div style={{ height: '24px' }}></div> /* Spacer when no price */
            )}

            <div className="input-group" style={{ marginBottom: '32px' }}>
              <label className="input-label"><AlignLeft size={14} color="#C9A84C" /> Message to Owner (optional)</label>
              <textarea
                value={message} onChange={(e) => setMessage(e.target.value)}
                rows={3} placeholder="Tell the owner why you need this item, when you can pick it up, etc..."
                className="rent-input" style={{ resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading || totalPrice === 0}>
              {loading ? (
                'Sending request...'
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Request Rental {totalPrice > 0 ? `— ₱${totalPrice.toFixed(2)}` : ''}
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </>
  )
}

export default function NewRentalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg-void, #0A0F14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#2ECC8F', fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</p>
      </div>
    }>
      <RentalForm />
    </Suspense>
  )
}