import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: myItems } = await supabase
    .from('items')
    .select('*')
    .eq('owner_id', user.id)

  const { data: myRentals } = await supabase
    .from('rentals')
    .select('*')
    .eq('renter_id', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#26619C]">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Welcome back, {profile?.full_name || user.email}!
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">My Listings</p>
            <p className="text-3xl font-bold text-white mt-1">{myItems?.length || 0}</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">Active Rentals</p>
            <p className="text-3xl font-bold text-white mt-1">{myRentals?.length || 0}</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">Trust Score</p>
            <p className="text-3xl font-bold text-[#26619C] mt-1">
              {profile?.trust_score || '--'}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/items"
            className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition"
          >
            <p className="text-2xl mb-2">🛍️</p>
            <p className="font-semibold text-white">Browse Items</p>
            <p className="text-gray-400 text-sm mt-1">Find items to rent</p>
          </Link>
          <Link
            href="/items/new"
            className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition"
          >
            <p className="text-2xl mb-2">➕</p>
            <p className="font-semibold text-white">List an Item</p>
            <p className="text-gray-400 text-sm mt-1">Rent out your items</p>
          </Link>
        </div>

        {/* My Items */}
        {myItems && myItems.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">My Listed Items</h2>
            <div className="space-y-3">
              {myItems.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition"
                >
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-gray-400 text-sm">₱{item.price_per_day}/day</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'available'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}