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
    <>
      <style>{`
        .nav-links { display: flex; align-items: center; gap: 2px; }
        .nav-right-desktop { display: flex; align-items: center; gap: 10px; }
        .nav-mobile-btn { display: none; }
        .nav-mobile-menu { display: none; }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-mobile-btn { display: flex; }
          .nav-mobile-menu.open { display: flex; flex-direction: column; padding: 12px 0; border-top: 1px solid #f1f5f9; }
          .trust-score-badge { display: none; }
        }
      `}</style>

      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '15px' }}>R</div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1a3a5c' }}>Rentora</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="nav-links">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                  <span style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', display: 'block', color: pathname === link.href ? '#26619C' : '#64748b', backgroundColor: pathname === link.href ? '#eff6ff' : 'transparent' }}>
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
                <Link href="/auth/login" style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textDecoration: 'none' }}>Sign in</Link>
                <Link href="/auth/register" style={{ fontSize: '14px', fontWeight: '600', padding: '8px 18px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', color: '#ffffff', borderRadius: '10px', textDecoration: 'none' }}>Get started</Link>
              </>
            )}

            {user && (
              <>
                {profile?.trust_score > 0 && (
                  <div className="trust-score-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <span style={{ fontSize: '12px' }}>★</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#d97706' }}>{profile.trust_score}</span>
                  </div>
                )}

                <Link href="/notifications" style={{ position: 'relative', textDecoration: 'none' }}>
                  <div style={{ width: '38px', height: '38px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>🔔</div>
                  {notifCount > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', backgroundColor: '#ef4444', borderRadius: '50%', color: '#ffffff', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>

                <Link href={user ? `/profile/${user.id}` : '/dashboard'} style={{ textDecoration: 'none' }}>
                <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
                borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#ffffff',
                fontWeight: '700', fontSize: '15px'
                }}>
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                </Link>

                {/* Mobile Menu Button */}
                <button
                  className="nav-mobile-btn"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  style={{ width: '38px', height: '38px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer' }}
                >
                  {mobileOpen ? '✕' : '☰'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && (
          <div className={`nav-mobile-menu ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px 16px', fontSize: '15px', fontWeight: '500', color: pathname === link.href ? '#26619C' : '#374151', backgroundColor: pathname === link.href ? '#eff6ff' : 'transparent', borderRadius: '10px', margin: '2px 0' }}>
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}