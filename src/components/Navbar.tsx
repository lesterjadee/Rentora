'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, Star, ShoppingBag, PlusSquare, ClipboardList, Sparkles, Menu, X } from 'lucide-react'

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
    { href: '/items',           label: 'Browse',    icon: <ShoppingBag size={15} strokeWidth={2} /> },
    { href: '/items/new',       label: 'List Item',  icon: <PlusSquare size={15} strokeWidth={2} /> },
    { href: '/rentals',         label: 'Rentals',    icon: <ClipboardList size={15} strokeWidth={2} /> },
    { href: '/recommendations', label: 'For You',    icon: <Sparkles size={15} strokeWidth={2} /> },
  ]

  return (
    <>
      <style>{`
        .nav-links-desktop { display: flex; align-items: center; gap: 2px; }
        .nav-mobile-btn { display: none !important; }
        .nav-mobile-menu { display: none; }
        .nav-mobile-menu.open { display: flex; flex-direction: column; padding: 10px 0 14px; border-top: 1px solid #f1f5f9; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>

      <nav style={{
        backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
              borderRadius: '9px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '15px'
            }}>R</div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1a3a5c' }}>Rentora</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="nav-links-desktop">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '10px', fontSize: '14px',
                      fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
                      color: isActive ? '#26619C' : '#64748b',
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    }}>
                      <span style={{ color: isActive ? '#26619C' : '#94a3b8' }}>{link.icon}</span>
                      {link.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!user && (
              <>
                <Link href="/auth/login" style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none', padding: '8px 14px' }}>Sign in</Link>
                <Link href="/auth/register" style={{
                  fontSize: '14px', fontWeight: '600', padding: '8px 18px',
                  background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
                  color: '#ffffff', borderRadius: '10px', textDecoration: 'none'
                }}>Get started</Link>
              </>
            )}

            {user && (
              <>
                {/* Trust Score */}
                {profile?.trust_score > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 10px', backgroundColor: '#fffbeb',
                    borderRadius: '8px', border: '1px solid #fde68a'
                  }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#d97706' }}>{profile.trust_score}</span>
                  </div>
                )}

                {/* Notifications */}
                <Link href="/notifications" style={{ position: 'relative', textDecoration: 'none' }}>
                  <div style={{
                    width: '38px', height: '38px', backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Bell size={18} color="#64748b" strokeWidth={1.8} />
                  </div>
                  {notifCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      width: '18px', height: '18px', backgroundColor: '#ef4444',
                      borderRadius: '50%', color: '#ffffff', fontSize: '10px',
                      fontWeight: '700', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', border: '2px solid #fff'
                    }}>{notifCount > 9 ? '9+' : notifCount}</span>
                  )}
                </Link>

                {/* Avatar */}
                <Link href={user ? `/profile/${user.id}` : '/dashboard'} style={{ textDecoration: 'none' }}>
                  <div style={{
                    width: '38px', height: '38px',
                    background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
                    borderRadius: '10px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#ffffff',
                    fontWeight: '700', fontSize: '15px', cursor: 'pointer'
                  }}>
                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Link>

                {/* Mobile hamburger */}
                <button
                  className="nav-mobile-btn"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  style={{
                    width: '38px', height: '38px', backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0', borderRadius: '10px',
                    display: 'none', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {mobileOpen ? <X size={18} color="#374151" /> : <Menu size={18} color="#374151" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && (
          <div className={`nav-mobile-menu ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '13px 16px', fontSize: '15px', fontWeight: '500',
                    color: isActive ? '#26619C' : '#374151',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    borderRadius: '10px', margin: '2px 0'
                  }}>
                    <span style={{ color: isActive ? '#26619C' : '#94a3b8' }}>{link.icon}</span>
                    {link.label}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </nav>
    </>
  )
}