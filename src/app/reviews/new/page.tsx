'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Star, Package } from 'lucide-react'

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)' }}>{label}</label>
        <span style={{ fontSize: '13px', fontWeight: '800', color: value > 0 ? 'var(--au-dark)' : 'var(--tx-dim)' }}>
          {value > 0 ? `${value}/10` : 'Not rated'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            style={{
              flex: 1, height: '36px',
              background: n <= (hovered || value)
                ? (n <= 3 ? 'rgba(239,68,68,0.15)' : n <= 6 ? 'rgba(201,168,76,0.18)' : 'rgba(4,149,22,0.12)')
                : 'var(--bg-raised)',
              border: `1.5px solid ${n <= (hovered || value)
                ? (n <= 3 ? 'rgba(239,68,68,0.3)' : n <= 6 ? 'rgba(201,168,76,0.3)' : 'rgba(4,149,22,0.25)')
                : 'var(--border-sub)'}`,
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontWeight: '800',
              color: n <= (hovered || value)
                ? (n <= 3 ? '#B91C1C' : n <= 6 ? 'var(--au-dark)' : 'var(--g-rich)')
                : 'var(--tx-dim)',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function ReviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rentalId = searchParams.get('rental_id')
  const supabase = createClient()

  const [rental, setRental] = useState<any>(null)
  const [communication, setCommunication] = useState(0)
  const [quality, setQuality] = useState(0)
  const [reliability, setReliability] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!rentalId) return
    supabase
      .from('rentals')
      .select('*, items(title), reviewee:profiles!rentals_owner_id_fkey(id, full_name)')
      .eq('id', rentalId)
      .single()
      .then(({ data }) => {
        if (data) setRental(data)
        else router.push('/rentals')
      })
  }, [rentalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (communication === 0 || quality === 0 || reliability === 0) {
      setError('Please rate all three categories.')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const avgScore = (communication + quality + reliability) / 3

      const { error: reviewError } = await supabase.from('reviews').insert({
        reviewer_id: user.id,
        reviewee_id: rental.reviewee?.id,
        rental_id: rentalId,
        item_id: rental.item_id,
        communication_rating: communication,
        item_quality_rating: quality,
        reliability_rating: reliability,
        comment: comment || null,
      })

      if (reviewError) throw reviewError

      // Update trust score
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('trust_score, review_count')
        .eq('id', rental.reviewee?.id)
        .single()

      if (currentProfile) {
        const count = (currentProfile.review_count || 0) + 1
        const newScore = ((currentProfile.trust_score || 0) * (count - 1) + avgScore) / count
        await supabase
          .from('profiles')
          .update({ trust_score: parseFloat(newScore.toFixed(2)), review_count: count })
          .eq('id', rental.reviewee?.id)
      }

      router.push(`/rentals/${rentalId}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  if (!rental) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Star size={22} color="var(--g-rich)" strokeWidth={1.5} />
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .rv { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rv-banner { position: relative; overflow: hidden; padding: 44px 28px 96px; border-bottom: 1px solid rgba(6,214,33,0.08); }
        .rv-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 50% 70% at 90% 0%, rgba(110,255,128,0.06), transparent 55%); pointer-events: none; }
        .rv-banner::after  { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent); }
        .rv-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1); border-radius: 22px; padding: 28px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
      `}</style>

      <div className="rv">
        <div className="rv-banner">
          <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>
            <Link href={`/rentals/${rentalId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--tx-muted)', textDecoration: 'none', marginBottom: '20px', fontWeight: '600' }}>
              <ArrowLeft size={14} strokeWidth={2} /> Back to Rental
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6EFF80' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Leave a Review</span>
            </div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: 0 }}>
              Review {rental.reviewee?.full_name}
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: '680px', margin: '-60px auto 0', padding: '0 28px 60px' }}>

          {error && (
            <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Item context */}
          <div className="rv-card">
            <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Rental</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(4,149,22,0.07)', border: '1px solid rgba(4,149,22,0.14)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package size={18} color="var(--g-rich)" strokeWidth={1.8} />
              </div>
              <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--tx-bright)', margin: 0 }}>{rental.items?.title}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rv-card">
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
                Ratings (1–10)
              </h3>
              <RatingInput label="Communication"       value={communication} onChange={setCommunication} />
              <RatingInput label="Item Quality"         value={quality}       onChange={setQuality} />
              <RatingInput label="Reliability / Trust"  value={reliability}   onChange={setReliability} />
            </div>

            <div className="rv-card">
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                Comment (optional)
              </h3>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with this rental..."
                rows={4}
                style={{ width: '100%', padding: '13px 16px', fontSize: '14px', borderRadius: '12px', resize: 'vertical' as const, boxSizing: 'border-box' as const }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading || communication === 0 || quality === 0 || reliability === 0}
                className="btn-gold"
                style={{ fontSize: '15px', padding: '13px 32px', opacity: (loading || communication === 0 || quality === 0 || reliability === 0) ? 0.6 : 1 }}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              <Link href={`/rentals/${rentalId}`} className="btn-ghost" style={{ fontSize: '15px', padding: '13px 24px' }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default function ReviewsNewPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Star size={22} color="var(--g-rich)" strokeWidth={1.5} />
        </div>
      </div>
    }>
      <ReviewForm />
    </Suspense>
  )
}