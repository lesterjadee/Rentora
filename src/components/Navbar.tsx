import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NotificationBell from './NotificationBell'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, trust_score')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold text-[#26619C]">
          Rentora
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/items" className="text-gray-400 hover:text-white transition text-sm">
            Browse
          </Link>
          <Link href="/items/new" className="text-gray-400 hover:text-white transition text-sm">
            List Item
          </Link>
          <Link href="/rentals" className="text-gray-400 hover:text-white transition text-sm">
            Rentals
          </Link>
          <Link href="/recommendations" className="text-gray-400 hover:text-white transition text-sm">
            For You
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Trust Score */}
          {profile && profile.trust_score > 0 && (
            <span className="text-yellow-400 text-sm hidden md:block">
              ⭐ {profile.trust_score}
            </span>
          )}

          {/* Notification Bell */}
          <NotificationBell count={count || 0} />

          {/* Profile */}
          <Link
            href="/dashboard"
            className="w-8 h-8 bg-[#26619C] rounded-full flex items-center justify-center text-white font-bold text-sm"
          >
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </Link>
        </div>
      </div>
    </nav>
  )
}