import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(full_name)
    `)
    .eq('reviewee_id', id)
    .order('created_at', { ascending: false })

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('owner_id', id)
    .eq('status', 'available')

  if (!profile) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Profile not found</p>
    </main>
  )

  const trustPercentage = profile.trust_score
    ? Math.round(profile.trust_score * 100)
    : 0

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getTrustLabel = (score: number) => {
    if (score >= 80) return 'Highly Trusted'
    if (score >= 60) return 'Trusted'
    if (score >= 40) return 'Moderate'
    return 'New Member'
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/items" className="text-gray-400 hover:text-white transition mb-6 inline-block">
          ← Back
        </Link>

        {/* Profile Header */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-16 h-16 bg-[#26619C] rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                {profile.full_name?.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
              <p className="text-gray-400 text-sm mt-1">{profile.university || 'Gordon College'}</p>
              <p className="text-gray-500 text-xs mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Trust Score */}
            <div className="text-right">
              <p className="text-gray-400 text-xs mb-1">TRUST SCORE</p>
              <p className={`text-4xl font-bold ${getTrustColor(trustPercentage)}`}>
                {trustPercentage}%
              </p>
              <p className={`text-sm ${getTrustColor(trustPercentage)}`}>
                {getTrustLabel(trustPercentage)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Based on {profile.total_reviews || 0} reviews
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reviews Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              ⭐ Reviews ({reviews?.length || 0})
            </h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review: any) => (
                  <div key={review.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm font-semibold">
                        {review.reviewer?.full_name}
                      </p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-sm">
                            {star <= review.rating ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-400 text-sm">{review.comment}</p>
                    )}
                    <p className="text-gray-600 text-xs mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
                <p className="text-gray-400">No reviews yet</p>
              </div>
            )}
          </div>

          {/* Listed Items */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              📦 Listed Items ({items?.length || 0})
            </h2>
            {items && items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item: any) => (
                  <Link key={item.id} href={`/items/${item.id}`}>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-[#26619C] transition">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-[#26619C] font-bold text-sm mt-1">
                        ₱{item.price_per_day}/day
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
                <p className="text-gray-400">No items listed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}