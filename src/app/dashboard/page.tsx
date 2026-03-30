import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#26619C]">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Welcome back, {user.user_metadata?.full_name || user.email}!
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">My Listings</p>
            <p className="text-3xl font-bold text-white mt-1">0</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">Active Rentals</p>
            <p className="text-3xl font-bold text-white mt-1">0</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">Trust Score</p>
            <p className="text-3xl font-bold text-[#26619C] mt-1">--</p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Logged in as</p>
          <p className="text-white">{user.email}</p>
          <p className="text-gray-500 text-xs mt-1">ID: {user.id}</p>
        </div>
      </div>
    </main>
  )
}