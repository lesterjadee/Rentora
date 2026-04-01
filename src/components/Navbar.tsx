'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notifCount, setNotifCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, trust_score')
        .eq('id', user.id)
        .single()
      setProfile(prof)

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setNotifCount(count || 0)
    }
    fetchData()
  }, [pathname])

  if (!user) return null

  const navLinks = [
    { href: '/items', label: 'Browse' },
    { href: '/items/new', label: 'List Item' },
    { href: '/rentals', label: 'Rentals' },
    { href: '/recommendations', label: 'For You' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold text-gradient">
          Rentora
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-[#26619C]/20 text-[#26619C]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {profile && profile.trust_score > 0 && (
            <span className="text-yellow-400 text-sm hidden md:flex items-center gap-1">
              ⭐ <span className="font-semibold">{profile.trust_score}</span>
            </span>
          )}

          <NotificationBell count={notifCount} />

          <Link
            href="/dashboard"
            className="w-8 h-8 bg-[#26619C] hover:bg-[#1e4f82] rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-200"
          >
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-3 pb-3 border-t border-gray-800 pt-3 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
                isActive(link.href)
                  ? 'bg-[#26619C]/20 text-[#26619C]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}