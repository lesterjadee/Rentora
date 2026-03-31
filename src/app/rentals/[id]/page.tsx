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
    .select(`
      *,
      items(id, title, image_url, price_per_day, condition),
      renter:profiles!rentals_renter_id_fkey(id, full_name, email, trust_score),
      owner:profiles!rentals_owner_id_fkey(id, full_name, email, trust_score)
    `)
    .eq('id', id)
    .single()

  if (!rental) redirect('/rentals')

  const isOwner = user.id === rental.owner_id
  const isRenter = user.id === rental.renter_id

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'approved': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'completed': return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
      case 'declined': return 'text-red-400 bg-red-400/10 border-red-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/rentals" className="text-gray-400 hover:text-white transition">
            ← Back to Rentals
          </Link>
          <h1 className="text-3xl font-bold text-[#26619C]">Rental Details</h1>
        </div>

        {/* Status Banner */}
        <div className={`p-4 rounded-xl border mb-6 ${getStatusColor(rental.status)}`}>
          <p className="font-semibold capitalize text-lg">Status: {rental.status}</p>
          {rental.status === 'pending' && isOwner && (
            <p className="text-sm opacity-80 mt-1">Review and respond to this rental request</p>
          )}
          {rental.status === 'pending' && isRenter && (
            <p className="text-sm opacity-80 mt-1">Waiting for the owner to respond</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Item Info */}
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-xs mb-2">ITEM</p>
            <p className="font-semibold text-white text-lg">{rental.items?.title}</p>
            <p className="text-[#26619C] font-bold mt-1">₱{rental.items?.price_per_day}/day</p>
            <p className="text-gray-400 text-sm mt-1 capitalize">
              Condition: {rental.items?.condition?.replace('_', ' ')}
            </p>
            <Link
              href={`/items/${rental.items?.id}`}
              className="text-[#26619C] text-sm hover:underline mt-2 inline-block"
            >
              View Item →
            </Link>
          </div>

          {/* Rental Info */}
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-xs mb-2">RENTAL PERIOD</p>
            <p className="text-white font-semibold">{rental.start_date}</p>
            <p className="text-gray-400 text-sm">to</p>
            <p className="text-white font-semibold">{rental.end_date}</p>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-xs">Total Price</p>
              <p className="text-2xl font-bold text-[#26619C]">₱{rental.total_price}</p>
            </div>
          </div>

          {/* Renter Info */}
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-xs mb-2">RENTER</p>
            <p className="text-white font-semibold">{rental.renter?.full_name}</p>
            <p className="text-gray-400 text-sm">{rental.renter?.email}</p>
            <p className="text-gray-500 text-xs mt-1">
              Trust Score: {rental.renter?.trust_score || 'N/A'}
            </p>
          </div>

          {/* Owner Info */}
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-xs mb-2">OWNER</p>
            <p className="text-white font-semibold">{rental.owner?.full_name}</p>
            <p className="text-gray-400 text-sm">{rental.owner?.email}</p>
            <p className="text-gray-500 text-xs mt-1">
              Trust Score: {rental.owner?.trust_score || 'N/A'}
            </p>
          </div>
        </div>

        {/* Message */}
        {rental.message && (
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 mb-6">
            <p className="text-gray-400 text-xs mb-2">MESSAGE FROM RENTER</p>
            <p className="text-gray-300">{rental.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {/* Owner actions */}
          {isOwner && rental.status === 'pending' && (
            <>
              <form action={`/api/rentals/${id}/approve`} method="POST">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 font-semibold rounded-lg transition"
                >
                  ✅ Approve
                </button>
              </form>
              <form action={`/api/rentals/${id}/decline`} method="POST">
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg transition"
                >
                  ❌ Decline
                </button>
              </form>
            </>
          )}

          {isOwner && rental.status === 'approved' && (
            <form action={`/api/rentals/${id}/complete`} method="POST">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold rounded-lg transition"
              >
                ✅ Mark as Completed
              </button>
            </form>
          )}

          {/* Renter actions */}
          {isRenter && rental.status === 'pending' && (
            <form action={`/api/rentals/${id}/cancel`} method="POST">
              <button
                type="submit"
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg transition"
              >
                Cancel Request
              </button>
            </form>
          )}

          {/* Review button for completed rentals */}
          {rental.status === 'completed' && (isOwner || isRenter) && (
            <Link
              href={`/reviews/new?rental=${id}`}
              className="px-6 py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition"
            >
              ⭐ Leave a Review
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}