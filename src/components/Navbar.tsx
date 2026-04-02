'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notifCount, setNotifCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAuthPage = pathname.startsWith('/auth')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('full_name, trust_score').eq('id', user.id).single()
      setProfile(prof)
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false)
      setNotifCount(count || 0)
    }
    fetchData()
  }, [pathname])

  if (isAuthPage) return null

  const navLinks = [
    { href: '/items', label: 'Browse' },
    { href: '/items/new', label: 'List Item' },
    { href: '/rentals', label: 'Rentals' },
    { href: '/recommendations', label: 'For You' },
  ]

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2744 100%)',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 4px 24px rgba(15,39,68,0.3)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', background: 'linear-gradient(135deg, #26619C, #3b82f6)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '800', color: '#ffffff'
          }}>R</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
            Rentora
          </span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <span style={{
                  padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
                  display: 'block', transition: 'all 0.15s',
                  color: pathname === link.href ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  backgroundColor: pathname === link.href ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!user && (
            <>
              <Link href="/auth/login" style={{
                fontSize: '14px', fontWeight: '500',
                color: 'rgba(255,255,255,0.7)', textDecoration: 'none'
              }}>Sign in</Link>
              <Link href="/auth/register" style={{
                fontSize: '14px', fontWeight: '600', padding: '9px 22px',
                background: 'linear-gradient(135deg, #26619C, #3b82f6)',
                color: '#ffffff', borderRadius: '10px', textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(38,97,156,0.4)'
              }}>Get started</Link>
            </>
          )}

          {user && (
            <>
              {profile?.trust_score > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', backgroundColor: 'rgba(245,158,11,0.15)',
                  borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)'
                }}>
                  <span style={{ fontSize: '14px' }}>★</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24' }}>{profile.trust_score}</span>
                </div>
              )}

              <Link href="/notifications" style={{ position: 'relative', textDecoration: 'none' }}>
                <div style={{
                  width: '38px', height: '38px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '17px', cursor: 'pointer'
                }}>🔔</div>
                {notifCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '18px', height: '18px', backgroundColor: '#ef4444',
                    borderRadius: '50%', color: '#ffffff', fontSize: '10px',
                    fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #1a3a5c'
                  }}>{notifCount > 9 ? '9+' : notifCount}</span>
                )}
              </Link>

              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{
                  width: '38px', height: '38px',
                  background: 'linear-gradient(135deg, #26619C, #3b82f6)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#ffffff',
                  fontWeight: '700', fontSize: '15px',
                  boxShadow: '0 2px 8px rgba(38,97,156,0.4)'
                }}>
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}