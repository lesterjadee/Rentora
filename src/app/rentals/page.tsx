import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RentalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Rentals where I am the renter
  const { data: myRentals } = await supabase
    .from('rentals')
    .select(`*, items(title, image_url, price_per_day), profiles!rentals_owner_id_fkey(full_name)`)
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })

  // Rentals where I am the owner
  const { data: ownerRentals } = await supabase
    .from('rentals')
    .select(`*, items(title, image_url, price_per_day), profiles!rentals_renter_id_fkey(full_name)`)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10'
      case 'approved': return 'text-blue-400 bg-blue-400/10'
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'completed': return 'text-gray-400 bg-gray-400/10'
      case 'declined': return 'text-red-400 bg-red-400/10'
      case 'cancelled': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#26619C]">My Rentals</h1>
            <p className="text-gray-400 mt-1">Manage your rental requests</p>
          </div>
          <Link href="/items" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition">
            Browse Items
          </Link>
        </div>

        {/* Rentals I requested */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">📦 Items I'm Renting</h2>
          {myRentals && myRentals.length > 0 ? (
            <div className="space-y-3">
              {myRentals.map((rental: any) => (
                <Link key={rental.id} href={`/rentals/${rental.id}`}>
                  <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{rental.items?.title}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {rental.start_date} → {rental.end_date}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Owner: {rental.profiles?.full_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(rental.status)}`}>
                          {rental.status}
                        </span>
                        <p className="text-[#26619C] font-bold mt-2">₱{rental.total_price}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 text-center">
              <p className="text-gray-400">You haven't rented anything yet</p>
              <Link href="/items" className="text-[#26619C] text-sm hover:underline mt-2 inline-block">
                Browse items →
              </Link>
            </div>
          )}
        </div>

        {/* Rental requests for my items */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">🏠 Requests for My Items</h2>
          {ownerRentals && ownerRentals.length > 0 ? (
            <div className="space-y-3">
              {ownerRentals.map((rental: any) => (
                <Link key={rental.id} href={`/rentals/${rental.id}`}>
                  <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{rental.items?.title}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {rental.start_date} → {rental.end_date}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Renter: {rental.profiles?.full_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(rental.status)}`}>
                          {rental.status}
                        </span>
                        <p className="text-[#26619C] font-bold mt-2">₱{rental.total_price}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 text-center">
              <p className="text-gray-400">No rental requests for your items yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}