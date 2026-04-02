'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function ReviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rentalId = searchParams.get('rental')
  const supabase = createClient()

  const [rental, setRental] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    if (!rentalId) return
    const fetchRental = async () => {
      const { data } = await supabase
        .from('rentals')
        .select(`*, items(title), renter:profiles!rentals_renter_id_fkey(id, full_name), owner:profiles!rentals_owner_id_fkey(id, full_name)`)
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
    if (existing && existing.length > 0) { setError('You have already reviewed this rental'); setLoading(false); return }

    const revieweeId = user.id === rental.renter_id ? rental.owner_id : rental.renter_id

    const { error: insertError } = await supabase.from('reviews').insert({
      rental_id: rentalId, reviewer_id: user.id,
      reviewee_id: revieweeId, rating, comment
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push(`/rentals/${rentalId}`)
    router.refresh()
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!']
  const ratingColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']

  if (!rental) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading rental...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href={`/rentals/${rentalId}`} style={{
            width: '38px', height: '38px', backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', textDecoration: 'none', fontSize: '18px'
          }}>←</Link>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Rate Your Experience</p>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Leave a Review</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Rental Summary */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          border: '1px solid #e8edf2', padding: '20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', margin: '0 0 4px' }}>{rental.items?.title}</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{rental.start_date} → {rental.end_date}</p>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>

            {/* Star Rating */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Rating *</p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star} type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    style={{
                      fontSize: '42px', background: 'none', border: 'none',
                      cursor: 'pointer', padding: '4px',
                      transform: star <= (hoveredStar || rating) ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s', filter: star <= (hoveredStar || rating) ? 'none' : 'grayscale(1) opacity(0.3)'
                    }}
                  >⭐</button>
                ))}
              </div>
              {rating > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '999px',
                  backgroundColor: `${ratingColors[rating]}15`,
                  border: `1px solid ${ratingColors[rating]}40`
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ratingColors[rating] }} />
                  <span style={{ fontSize: '14px', fontWeight: '700', color: ratingColors[rating] }}>{ratingLabels[rating]}</span>
                </div>
              )}
            </div>

            {/* Comment */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Comment (Optional)</p>
              <textarea
                value={comment} onChange={(e) => setComment(e.target.value)}
                rows={4} placeholder="Share your experience with this rental..."
                style={{
                  width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  fontSize: '14px', color: '#0f172a', outline: 'none',
                  boxSizing: 'border-box', resize: 'none', lineHeight: '1.6'
                }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #d97706, #f59e0b)',
            color: '#ffffff', fontWeight: '700', borderRadius: '14px',
            border: 'none', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(217,119,6,0.3)'
          }}>{loading ? 'Submitting...' : '⭐ Submit Review'}</button>
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