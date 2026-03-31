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
        .select(`
          *,
          items(title),
          renter:profiles!rentals_renter_id_fkey(id, full_name),
          owner:profiles!rentals_owner_id_fkey(id, full_name)
        `)
        .eq('id', rentalId)
        .single()
      if (data) setRental(data)
    }
    fetchRental()
  }, [rentalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if review already exists
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('rental_id', rentalId)
      .eq('reviewer_id', user.id)

    if (existing && existing.length > 0) {
      setError('You have already reviewed this rental')
      setLoading(false)
      return
    }

    // Determine who is being reviewed
    const revieweeId = user.id === rental.renter_id
      ? rental.owner_id
      : rental.renter_id

    // Insert review — trust score updates automatically via DB trigger
    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        rental_id: rentalId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/rentals/${rentalId}`)
    router.refresh()
  }

  if (!rental) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Loading rental...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/rentals/${rentalId}`} className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-[#26619C]">Leave a Review</h1>
        </div>

        {/* Rental Summary */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6">
          <p className="text-gray-400 text-xs">Reviewing rental for</p>
          <p className="font-semibold text-white mt-1">{rental.items?.title}</p>
          <p className="text-gray-400 text-sm mt-1">
            {rental.start_date} → {rental.end_date}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-2xl border border-gray-800">

          {/* Star Rating */}
          <div>
            <label className="block text-gray-300 text-sm mb-3">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= (hoveredStar || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent!'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this rental..."
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
      <ReviewForm />
    </Suspense>
  )
}