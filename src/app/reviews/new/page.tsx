'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Package, Shield } from 'lucide-react'

function ReviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rentalId = searchParams.get('rental')
  const supabase = createClient()

  const [rental, setRental] = useState<any>(null)
  const [communicationRating, setCommunicationRating] = useState(5)
  const [itemQualityRating, setItemQualityRating] = useState(5)
  const [reliabilityRating, setReliabilityRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!rentalId) return
    const fetchRental = async () => {
      const { data } = await supabase
        .from('rentals')
        .select('*, items(title), renter:profiles!rentals_renter_id_fkey(id, full_name), owner:profiles!rentals_owner_id_fkey(id, full_name)')
        .eq('id', rentalId).single()
      if (data) setRental(data)
    }
    fetchRental()
  }, [rentalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: existing } = await supabase.from('reviews').select('id').eq('rental_id', rentalId).eq('reviewer_id', user.id)
    if (existing && existing.length > 0) { setError('You have already reviewed this rental.'); setLoading(false); return }

    const revieweeId = user.id === rental.renter_id ? rental.owner_id : rental.renter_id
    const overallRating = Math.round(((communicationRating + itemQualityRating + reliabilityRating) / 3) / 2)

    const { error: insertError } = await supabase.from('reviews').insert({
      rental_id: rentalId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating: Math.max(1, Math.min(5, overallRating)),
      communication_rating: communicationRating,
      item_quality_rating: itemQualityRating,
      reliability_rating: reliabilityRating,
      comment
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push(`/rentals/${rentalId}`)
    router.refresh()
  }

  const RatingSlider = ({
    label, value, onChange, icon, color, description
  }: {
    label: string, value: number, onChange: (v: number) => void,
    icon: React.ReactNode, color: string, description: string
  }) => {
    const percentage = value * 10

    const getColor = (val: number) => {
      if (val <= 3) return '#EF4444' // Red
      if (val <= 5) return '#F97316' // Orange
      if (val <= 7) return '#FBBF24' // Amber/Gold
      if (val <= 9) return '#22A876' // Brand Green
      return '#2ECC8F'               // Bright Green
    }

    const getLabel = (val: number) => {
      if (val <= 2) return 'Very Poor'
      if (val <= 4) return 'Poor'
      if (val <= 6) return 'Average'
      if (val <= 8) return 'Good'
      if (val === 9) return 'Very Good'
      return 'Excellent'
    }

    const barColor = getColor(value)

    return (
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--bg-raised)', border: `1px solid ${color}40`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 2px' }}>{label}</p>
              <p style={{ fontSize: '12px', color: 'var(--tx-dim)', margin: 0 }}>{description}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: barColor, lineHeight: 1, textShadow: `0 0 12px ${barColor}40` }}>
              {value}<span style={{ fontSize: '14px', color: 'var(--tx-dim)', fontWeight: '600' }}>/10</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: barColor, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{getLabel(value)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: barColor, borderRadius: '999px', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s', boxShadow: `0 0 10px ${barColor}80` }} />
        </div>

        {/* Scale labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
            const isActive = value === n;
            return (
              <button
                key={n} type="button" onClick={() => onChange(n)}
                style={{
                  flex: 1, height: '36px', borderRadius: '8px',
                  border: isActive ? `1px solid ${barColor}` : '1px solid var(--border-sub)',
                  backgroundColor: isActive ? `${barColor}15` : 'var(--bg-raised)',
                  color: isActive ? barColor : 'var(--tx-muted)',
                  fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 8px ${barColor}25` : 'none'
                }}
              >
                {n}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const overallRating = Math.round(((communicationRating + itemQualityRating + reliabilityRating) / 3) / 2)
  const overallPercentage = Math.round((communicationRating + itemQualityRating + reliabilityRating) / 3) * 10

  if (!rental) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--tx-muted)', fontSize: '14px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Loading rental...</p>
    </div>
  )

  return (
    <>
      <style>{`
        .rev-page { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        
        .rev-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .rev-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
        }

        .rev-inner { max-width: 680px; margin: 0 auto; padding: 32px 24px 60px; }

        .rev-card {
          background: var(--bg-card);
          border: 1px solid var(--border-sub);
          border-radius: 20px; padding: 28px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }

        .rev-label {
          display: block; font-size: 11px; font-weight: 800; color: var(--tx-muted);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;
        }

        .score-preview {
          background: linear-gradient(135deg, rgba(10,32,24,0.6), rgba(6,14,9,0.8));
          border: 1px solid rgba(34,168,118,0.2); border-radius: 16px; padding: 24px;
          margin-top: 32px;
        }

        .rev-textarea {
          width: 100%; padding: 16px;
          background: var(--bg-raised); border: 1px solid var(--border-sub);
          border-radius: 14px; color: var(--tx-bright); font-size: 14px;
          font-family: inherit; outline: none; transition: all 0.2s;
          box-sizing: border-box; resize: vertical; line-height: 1.6;
        }
        .rev-textarea:focus {
          border-color: #C9A84C; background: rgba(201,168,76,0.02);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
        }

        .btn-submit {
          width: 100%; padding: 18px; border-radius: 14px; font-weight: 800; font-size: 16px;
          background: linear-gradient(135deg, #C9A84C, #A6842B);
          border: 1px solid rgba(201,168,76,0.3); color: #000000;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(201,168,76,0.2);
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(201,168,76,0.3); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; background: var(--bg-raised); color: var(--tx-muted); border-color: var(--border-sub); }

        .error-box {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 14px 16px; color: #FCA5A5;
          font-size: 13px; font-weight: 600; margin-bottom: 24px;
        }
      `}</style>

      <div className="rev-page">
        {/* Header Banner */}
        <div className="rev-banner">
          <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href={`/rentals/${rentalId}`} style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-body)', textDecoration: 'none', flexShrink: 0, transition: 'all 0.2s' }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Rate Your Experience</p>
              <h1 style={{ fontSize: 'clamp(24px,5vw,32px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.03em' }}>Leave a Review</h1>
            </div>
          </div>
        </div>

        <div className="rev-inner">
          
          {/* Rental Summary */}
          <div className="rev-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={24} color="#C9A84C" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontWeight: '800', fontSize: '17px', color: 'var(--tx-bright)', margin: '0 0 4px' }}>{rental.items?.title}</p>
              <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0, fontWeight: '600' }}>
                <span style={{ color: 'var(--tx-dim)' }}>From</span> {rental.start_date} <span style={{ color: 'var(--tx-dim)' }}>to</span> {rental.end_date}
              </p>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            
            {/* Rating Cards */}
            <div className="rev-card">
              <span className="rev-label">Rate this person (1 = Lowest, 10 = Highest)</span>

              <RatingSlider
                label="Communication"
                value={communicationRating}
                onChange={setCommunicationRating}
                icon={<MessageCircle size={20} strokeWidth={2} />}
                color="#60A5FA" // Blue accent
                description="How responsive and clear were they?"
              />

              <RatingSlider
                label="Item Quality"
                value={itemQualityRating}
                onChange={setItemQualityRating}
                icon={<Package size={20} strokeWidth={2} />}
                color="#A78BFA" // Purple accent
                description="Was the item as described and in good condition?"
              />

              <RatingSlider
                label="Reliability"
                value={reliabilityRating}
                onChange={setReliabilityRating}
                icon={<Shield size={20} strokeWidth={2} />}
                color="#34D399" // Green accent
                description="Did they follow through on the rental agreement?"
              />

              {/* Overall Score Preview */}
              <div className="score-preview">
                <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Overall Score Preview</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${overallPercentage}%`, background: 'linear-gradient(90deg, #22A876, #2ECC8F)', borderRadius: '999px', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px rgba(46,204,143,0.5)' }} />
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '32px', fontWeight: '900', color: '#2ECC8F', textShadow: '0 0 16px rgba(46,204,143,0.4)' }}>{overallPercentage}</span>
                    <span style={{ fontSize: '16px', color: 'var(--tx-dim)', fontWeight: '700' }}>%</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--tx-dim)', fontWeight: '600' }}>Average of 3 categories</span>
                  <div style={{ background: 'var(--au-glow)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#C9A84C' }}>Trust Score: {overallRating}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="rev-card">
              <span className="rev-label" style={{ marginBottom: '12px' }}>Comment (Optional)</span>
              <textarea
                className="rev-textarea"
                value={comment} onChange={(e) => setComment(e.target.value)}
                rows={4} placeholder="Share your experience with this rental..."
              />
            </div>

            {/* Submit */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting Review...' : 'Submit Review'}
            </button>
            
          </form>
        </div>
      </div>
    </>
  )
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#2ECC8F', fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</p>
      </div>
    }>
      <ReviewForm />
    </Suspense>
  )
}