'use client'

import Link from 'next/link'

export default function NotificationBell({ count }: { count: number }) {
  return (
    <Link href="/notifications" className="relative">
      <div className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition">
        <span className="text-xl">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
    </Link>
  )
}