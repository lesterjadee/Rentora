'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ShoppingBag, PlusCircle, ClipboardList,
  Sparkles, Bell, Star, Menu, X, LogIn
} from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notifCount, setNotifCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isAuthPage = pathname.startsWith('/auth')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  if (isAuthPage) return null

  const navLinks = [
    { href: '/items',           label: 'Browse',    icon: <ShoppingBag size={15} strokeWidth={2} /> },
    { href: '/items/new',       label: 'List Item',  icon: <PlusCircle size={15} strokeWidth={2} /> },
    { href: '/rentals',         label: 'Rentals',    icon: <ClipboardList size={15} strokeWidth={2} /> },
    { href: '/recommendations', label: 'For You',    icon: <Sparkles size={15} strokeWidth={2} /> },
  ]

  return (
    <>
      <style>{`
        .nav-root {
          position: sticky; top: 0; z-index: 50;
          background-color: ${scrolled ? 'rgba(10,10,10,0.95)' : '#0A0A0A'};
          border-bottom: 1px solid #1C1C1C;
          backdrop-filter: blur(12px);
          transition: all 0.3s;
          font-family: system-ui, sans-serif;
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 24px;
          display: flex; align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .nav-logo-text {
          font-size: 20px; font-weight: 800;
          background: linear-gradient(135deg, #2ECC8F, #4EDDAA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.03em;
        }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          color: #A3A3A3;
        }
        .nav-link:hover { color: #F0F0F0; background-color: #1C1C1C; }
        .nav-link.active {
          color: #2ECC8F;
          background-color: rgba(46,204,143,0.1);
        }
        .nav-icon-btn {
          width: 38px; height: 38px;
          background: #1C1C1C; border: 1px solid #2E2E2E;
          border-radius: 10px; display: flex;
          align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
          text-decoration: none;
          color: #A3A3A3;
        }
        .nav-icon-btn:hover { background: #242424; border-color: #3a3a3a; color: #F0F0F0; }
        .nav-trust-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 8px;
        }
        .nav-avatar {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #0F3D2E, #1A7A57);
          border: 1px solid rgba(46,204,143,0.3);
          border-radius: 10px; display: flex;
          align-items: center; justify-content: center;
          color: #2ECC8F; font-weight: 800;
          font-size: 14px; cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .nav-avatar:hover { border-color: rgba(46,204,143,0.6); }
        .nav-desktop-links { display: flex; align-items: center; gap: 2px; }
        .nav-right { display: flex; align-items: center; gap: 8px; }
        .nav-mobile-btn { display: none; }
        .nav-mobile-menu { display: none; background: #0A0A0A; border-top: 1px solid #1C1C1C; padding: 12px 24px 16px; }
        .nav-mobile-menu.open { display: flex; flex-direction: column; gap: 4px; }
        .nav-mobile-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 10px;
          font-size: 14px; font-weight: 500;
          text-decoration: none; color: #A3A3A3;
          transition: all 0.15s;
        }
        .nav-mobile-link:hover { background: #1C1C1C; color: #F0F0F0; }
        .nav-mobile-link.active { background: rgba(46,204,143,0.1); color: #2ECC8F; }
        .nav-get-started {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #0F3D2E, #1A7A57);
          border: 1px solid rgba(46,204,143,0.3);
          color: #2ECC8F; font-size: 13px; font-weight: 600;
          border-radius: 10px; text-decoration: none;
          transition: all 0.2s;
        }
        .nav-get-started:hover {
          background: linear-gradient(135deg, #145C42, #1A7A57);
          border-color: rgba(46,204,143,0.5);
          box-shadow: 0 0 16px rgba(46,204,143,0.15);
        }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none; }
          .nav-mobile-btn { display: flex; }
        }
      `}</style>

      <nav className="nav-root">
        <div className="nav-inner">

          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)',
              border: '1px solid rgba(46,204,143,0.3)',
              borderRadius: '9px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: '800', color: '#2ECC8F'
            }}>R</div>
            <span className="nav-logo-text">Rentora</span>
          </Link>

          {/* Desktop Nav Links */}
          {user && (
            <div className="nav-desktop-links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="nav-right">
            {!user && (
              <>
                <Link href="/auth/login" style={{ fontSize: '13px', fontWeight: '500', color: '#A3A3A3', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', transition: 'color 0.2s' }}>
                  Sign in
                </Link>
                <Link href="/auth/register" className="nav-get-started">
                  <LogIn size={14} strokeWidth={2} />
                  Get started
                </Link>
              </>
            )}

            {user && (
              <>
                {profile?.trust_score > 0 && (
                  <div className="nav-trust-badge">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B' }}>{profile.trust_score}</span>
                  </div>
                )}

                <Link href="/notifications" className="nav-icon-btn" style={{ position: 'relative' }}>
                  <Bell size={17} strokeWidth={1.8} />
                  {notifCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      width: '17px', height: '17px',
                      background: '#EF4444', borderRadius: '50%',
                      color: '#fff', fontSize: '9px', fontWeight: '800',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #0A0A0A'
                    }}>{notifCount > 9 ? '9+' : notifCount}</span>
                  )}
                </Link>

                <Link href={`/profile/${user.id}`} className="nav-avatar">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Link>

                <button
                  className="nav-icon-btn nav-mobile-btn"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X size={17} /> : <Menu size={17} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && (
          <div className={`nav-mobile-menu ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-mobile-link ${pathname === link.href ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}