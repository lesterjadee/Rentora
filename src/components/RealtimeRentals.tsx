'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeRentals({ userId }: { userId: string }) {
  const supabase = createClient()
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('rentals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rentals',
          filter: `owner_id=eq.${userId}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setNotification('🔔 New rental request received!')
          } else if (payload.eventType === 'UPDATE') {
            const status = payload.new.status
            if (status === 'cancelled') {
              setNotification('❌ A rental request was cancelled')
            }
          }
          // Auto hide after 5 seconds
          setTimeout(() => setNotification(null), 5000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (!notification) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-[#26619C] text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-pulse">
      <p className="font-semibold">{notification}</p>
      <button
        onClick={() => setNotification(null)}
        className="text-gray-400 text-xs mt-1 hover:text-white"
      >
        Dismiss
      </button>
    </div>
  )
}