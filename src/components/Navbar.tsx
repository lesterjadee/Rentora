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
    const handleScroll = () => setScrolled(window.scrollY > 20)
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
    { href: '/items',           label: 'Browse',    icon: <ShoppingBag size={14} strokeWidth={2} /> },
    { href: '/items/new',       label: 'List Item',  icon: <PlusCircle size={14} strokeWidth={2} /> },
    { href: '/rentals',         label: 'Rentals',    icon: <ClipboardList size={14} strokeWidth={2} /> },
    { href: '/recommendations', label: 'For You',    icon: <Sparkles size={14} strokeWidth={2} /> },
  ]

  return (
    <>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 200;
          width: 100%;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: rgba(6,6,8,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: box-shadow 0.3s;
        }
        .navbar.scrolled {
          box-shadow: 0 4px 32px rgba(0,0,0,0.5);
        }
        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 66px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* ── LOGO ── */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }
        .nav-logo-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #0D2B1A, #1A7A52);
          border: 1px solid rgba(34,168,118,0.35);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 900; color: #22A876;
          box-shadow: 0 0 16px rgba(34,168,118,0.15);
          transition: box-shadow 0.2s;
        }
        .nav-logo:hover .nav-logo-mark {
          box-shadow: 0 0 24px rgba(34,168,118,0.28);
        }
        .nav-logo-text {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #2ECC8F 30%, #4EDDAA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── CENTER NAV LINKS ── */
        .nav-links-wrap {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 4px;
        }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          color: #5E5C56;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .nav-link:hover {
          color: #A8A59A;
          background: rgba(255,255,255,0.05);
        }
        .nav-link.active {
          color: #2ECC8F;
          background: rgba(34,168,118,0.1);
          border-color: rgba(34,168,118,0.15);
        }

        /* ── RIGHT SIDE ── */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .nav-trust-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px;
          background: linear-gradient(135deg, rgba(42,30,8,0.9), rgba(90,63,20,0.5));
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 999px;
          box-shadow: 0 0 12px rgba(201,168,76,0.08);
        }
        .nav-icon-btn {
          position: relative;
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          color: #A8A59A;
          flex-shrink: 0;
        }
        .nav-icon-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.14);
          color: #F2F0E8;
        }
        .nav-notif-dot {
          position: absolute;
          top: -4px; right: -4px;
          width: 18px; height: 18px;
          background: linear-gradient(135deg, #C9A84C, #E2C07A);
          border-radius: 50%;
          color: #0C0D10;
          font-size: 9px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #060608;
          box-shadow: 0 0 8px rgba(201,168,76,0.4);
        }
        .nav-avatar {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #0D2B1A, #145738);
          border: 1px solid rgba(34,168,118,0.3);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          color: #22A876;
          font-weight: 900; font-size: 15px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(34,168,118,0.1);
        }
        .nav-avatar:hover {
          border-color: rgba(34,168,118,0.5);
          box-shadow: 0 0 20px rgba(34,168,118,0.2);
        }
        .nav-get-started {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #6B4C18, #C9A84C, #A07828);
          border: 1px solid rgba(201,168,76,0.4);
          color: #0C0D10; font-size: 13px; font-weight: 800;
          border-radius: 11px; text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 4px 16px rgba(201,168,76,0.2);
          white-space: nowrap;
        }
        .nav-get-started:hover {
          background: linear-gradient(135deg, #7A5520, #E2C07A, #B8922E);
          box-shadow: 0 6px 24px rgba(201,168,76,0.3);
          transform: translateY(-1px);
        }
        .nav-signin-link {
          font-size: 13px; font-weight: 600;
          color: #5E5C56; text-decoration: none;
          padding: 8px 14px;
          border-radius: 10px;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-signin-link:hover { color: #A8A59A; }

        /* ── MOBILE TOGGLE ── */
        .nav-hamburger {
          display: none;
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px;
          align-items: center; justify-content: center;
          cursor: pointer; color: #A8A59A;
          flex-shrink: 0;
        }

        /* ── MOBILE MENU ── */
        .nav-mobile-menu {
          display: none;
          background: rgba(6,6,8,0.99);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 10px 20px 16px;
          flex-direction: column;
          gap: 3px;
        }
        .nav-mobile-menu.open { display: flex; }
        .nav-mobile-link {
          display: flex; align-items: center; gap: 11px;
          padding: 13px 14px; border-radius: 11px;
          font-size: 14px; font-weight: 600;
          text-decoration: none; color: #5E5C56;
          transition: all 0.15s;
          border: 1px solid transparent;
        }
        .nav-mobile-link:hover {
          background: rgba(255,255,255,0.05);
          color: #A8A59A;
        }
        .nav-mobile-link.active {
          background: rgba(34,168,118,0.1);
          color: #2ECC8F;
          border-color: rgba(34,168,118,0.15);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .nav-links-wrap { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (max-width: 480px) {
          .navbar-inner { padding: 0 16px; }
          .nav-trust-pill { display: none; }
        }
      `}</style>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* ── LOGO ── */}
          <Link href={user ? '/dashboard' : '/'} className="nav-logo">
            <div className="nav-logo-mark">R</div>
            <span className="nav-logo-text">Rentora</span>
          </Link>

          {/* ── CENTER LINKS (logged in only) ── */}
          {user && (
            <div className="nav-links-wrap">
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

          {/* ── RIGHT SIDE ── */}
          <div className="nav-right">

            {/* Not logged in */}
            {!user && (
              <>
                <Link href="/auth/login" className="nav-signin-link">Sign in</Link>
                <Link href="/auth/register" className="nav-get-started">
                  <LogIn size={14} strokeWidth={2.5} />
                  Get started
                </Link>
              </>
            )}

            {/* Logged in */}
            {user && (
              <>
                {/* Trust score pill */}
                {profile?.trust_score > 0 && (
                  <div className="nav-trust-pill">
                    <Star size={11} fill="#C9A84C" color="#C9A84C" strokeWidth={1} />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#E2C07A', letterSpacing: '0.02em' }}>
                      {profile.trust_score}
                    </span>
                  </div>
                )}

                {/* Notification bell */}
                <Link href="/notifications" className="nav-icon-btn">
                  <Bell size={17} strokeWidth={1.8} />
                  {notifCount > 0 && (
                    <span className="nav-notif-dot">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>

                {/* Profile avatar */}
                <Link href={`/profile/${user.id}`} className="nav-avatar">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Link>

                {/* Hamburger (mobile only) */}
                <button
                  className="nav-hamburger"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  style={{ border: 'none' }}
                >
                  {mobileOpen ? <X size={17} strokeWidth={2} /> : <Menu size={17} strokeWidth={2} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── MOBILE DROPDOWN ── */}
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