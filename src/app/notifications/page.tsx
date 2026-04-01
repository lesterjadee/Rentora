import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Mark all as read
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rental_request': return '📬'
      case 'rental_approved': return '✅'
      case 'rental_declined': return '❌'
      case 'rental_completed': return '🎉'
      case 'new_review': return '⭐'
      default: return '🔔'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rental_request': return 'border-blue-500/30 bg-blue-500/5'
      case 'rental_approved': return 'border-green-500/30 bg-green-500/5'
      case 'rental_declined': return 'border-red-500/30 bg-red-500/5'
      case 'rental_completed': return 'border-[#26619C]/30 bg-[#26619C]/5'
      case 'new_review': return 'border-yellow-500/30 bg-yellow-500/5'
      default: return 'border-gray-700 bg-gray-900'
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#26619C]">Notifications</h1>
            <p className="text-gray-400 mt-1">{notifications?.length || 0} total</p>
          </div>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition text-sm">
            ← Dashboard
          </Link>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <Link
                key={notif.id}
                href={notif.rental_id ? `/rentals/${notif.rental_id}` : '/dashboard'}
              >
                <div className={`p-4 rounded-xl border transition hover:border-[#26619C] ${getTypeColor(notif.type)} ${!notif.read ? 'opacity-100' : 'opacity-60'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTypeIcon(notif.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{notif.title}</p>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-[#26619C] rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{notif.message}</p>
                      <p className="text-gray-600 text-xs mt-2">
                        {new Date(notif.created_at).toLocaleDateString()} at{' '}
                        {new Date(notif.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔔</p>
            <p className="text-gray-400 text-xl">No notifications yet</p>
            <p className="text-gray-500 mt-2">We'll notify you when something happens!</p>
          </div>
        )}
      </div>
    </main>
  )
}