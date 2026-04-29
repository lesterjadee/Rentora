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
    label: string
    value: number
    onChange: (v: number) => void
    icon: React.ReactNode
    color: string
    description: string
  }) => {
    const percentage = value * 10

    const getColor = (val: number) => {
      if (val <= 3) return '#ef4444'
      if (val <= 5) return '#f97316'
      if (val <= 7) return '#f59e0b'
      if (val <= 9) return '#22c55e'
      return '#16a34a'
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
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', backgroundColor: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{label}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{description}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: barColor, lineHeight: 1 }}>{value}<span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '400' }}>/10</span></div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: barColor, marginTop: '2px' }}>{getLabel(value)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', marginBottom: '10px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: barColor, borderRadius: '999px', transition: 'width 0.2s, background-color 0.2s' }} />
        </div>

        {/* Slider */}
        <input
          type="range" min={1} max={10} value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: barColor, cursor: 'pointer', height: '4px' }}
        />

        {/* Scale labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: value === n ? `2px solid ${barColor}` : '1.5px solid #e2e8f0',
                backgroundColor: value === n ? `${barColor}15` : '#f8fafc',
                color: value === n ? barColor : '#94a3b8',
                fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const overallRating = Math.round(((communicationRating + itemQualityRating + reliabilityRating) / 3) / 2)
  const overallPercentage = Math.round((communicationRating + itemQualityRating + reliabilityRating) / 3) * 10

  if (!rental) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading rental...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href={`/rentals/${rentalId}`} style={{ width: '38px', height: '38px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none', flexShrink: 0 }}>
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Rate Your Experience</p>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Leave a Review</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Rental Summary */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={24} color="#26619C" strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', margin: '0 0 4px' }}>{rental.items?.title}</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{rental.start_date} to {rental.end_date}</p>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Rating Cards */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '24px', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
              Rate this person (1 = lowest, 10 = highest)
            </p>

            <RatingSlider
              label="Communication"
              value={communicationRating}
              onChange={setCommunicationRating}
              icon={<MessageCircle size={18} color="#26619C" strokeWidth={1.8} />}
              color="#26619C"
              description="How responsive and clear were they?"
            />

            <RatingSlider
              label="Item Quality"
              value={itemQualityRating}
              onChange={setItemQualityRating}
              icon={<Package size={18} color="#7c3aed" strokeWidth={1.8} />}
              color="#7c3aed"
              description="Was the item as described and in good condition?"
            />

            <RatingSlider
              label="Reliability"
              value={reliabilityRating}
              onChange={setReliabilityRating}
              icon={<Shield size={18} color="#0891b2" strokeWidth={1.8} />}
              color="#0891b2"
              description="Did they follow through on the rental agreement?"
            />

            {/* Overall Score Preview */}
            <div style={{ marginTop: '8px', padding: '18px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: '0 0 12px' }}>Overall Score</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1, height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${overallPercentage}%`, background: 'linear-gradient(90deg, #26619C, #3b82f6)', borderRadius: '999px', transition: 'width 0.3s' }} />
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#26619C' }}>{overallPercentage}</span>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>%</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Average of 3 categories</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#26619C' }}>Trust Score contribution: {overallRating}/5</span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Comment (Optional)</p>
            <textarea
              value={comment} onChange={(e) => setComment(e.target.value)}
              rows={4} placeholder="Share your experience with this rental..."
              style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const, resize: 'none' as const, lineHeight: '1.6' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #d97706, #f59e0b)',
            color: '#ffffff', fontWeight: '700', borderRadius: '14px',
            border: 'none', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(217,119,6,0.3)'
          }}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#94a3b8' }}>Loading...</p></div>}>
      <ReviewForm />
    </Suspense>
  )
}