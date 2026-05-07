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
  const [mounted, setMounted] = useState(false)

  const isAuthPage = pathname.startsWith('/auth')

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    const getInitialUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
        fetchNotifCount(session.user.id)
      }
    }
    getInitialUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
        fetchNotifCount(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setNotifCount(0)
      }
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) fetchNotifCount(user.id)
  }, [pathname])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('full_name, trust_score').eq('id', userId).single()
    if (data) setProfile(data)
  }

  const fetchNotifCount = async (userId: string) => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false)
    setNotifCount(count || 0)
  }

  if (!mounted) return null
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
          position: sticky; top: 0; z-index: 200; width: 100%;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: rgba(6,6,8,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          transition: box-shadow 0.3s;
        }
        .navbar.scrolled { box-shadow: 0 4px 32px rgba(0,0,0,0.5); border-bottom-color: rgba(255,255,255,0.1); }
        .navbar-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 24px;
          height: 66px; display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .nav-logo-text { font-size: 17px; font-weight: 900; letter-spacing: -0.03em; background: linear-gradient(135deg, #2ECC8F 30%, #4EDDAA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .nav-logo-sub { font-size: 9px; color: var(--g-bright); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1; }
        .nav-links-wrap { display: flex; align-items: center; gap: 2px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 4px; }
        .nav-link { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; color: #5E5C56; white-space: nowrap; border: 1px solid transparent; }
        .nav-link:hover { color: #A8A59A; background: rgba(255,255,255,0.05); }
        .nav-link.active { color: #2ECC8F; background: rgba(34,168,118,0.1); border-color: rgba(34,168,118,0.15); }
        .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .nav-trust-pill { display: flex; align-items: center; gap: 5px; padding: 6px 12px; background: linear-gradient(135deg, rgba(42,30,8,0.9), rgba(90,63,20,0.5)); border: 1px solid rgba(201,168,76,0.3); border-radius: 999px; box-shadow: 0 0 12px rgba(201,168,76,0.08); }
        .nav-icon-btn { position: relative; width: 40px; height: 40px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; text-decoration: none; color: #A8A59A; flex-shrink: 0; }
        .nav-icon-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); color: #F2F0E8; }
        .nav-notif-dot { position: absolute; top: -5px; right: -5px; min-width: 18px; height: 18px; padding: 0 4px; background: linear-gradient(135deg, #C9A84C, #E2C07A); border-radius: 9px; color: #0C0D10; font-size: 9px; font-weight: 900; display: flex; align-items: center; justify-content: center; border: 2px solid #060608; box-shadow: 0 0 8px rgba(201,168,76,0.5); }
        .nav-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #0D2B1A, #145738); border: 1px solid rgba(34,168,118,0.3); border-radius: 11px; display: flex; align-items: center; justify-content: center; color: #22A876; font-weight: 900; font-size: 15px; cursor: pointer; text-decoration: none; transition: all 0.2s; flex-shrink: 0; box-shadow: 0 0 12px rgba(34,168,118,0.1); }
        .nav-avatar:hover { border-color: rgba(34,168,118,0.5); box-shadow: 0 0 20px rgba(34,168,118,0.2); }
        .nav-get-started { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; background: linear-gradient(135deg, #6B4C18, #C9A84C, #A07828); border: 1px solid rgba(201,168,76,0.4); color: #0C0D10; font-size: 13px; font-weight: 800; border-radius: 11px; text-decoration: none; transition: all 0.25s; box-shadow: 0 4px 16px rgba(201,168,76,0.2); white-space: nowrap; }
        .nav-get-started:hover { background: linear-gradient(135deg, #7A5520, #E2C07A, #B8922E); box-shadow: 0 6px 24px rgba(201,168,76,0.3); transform: translateY(-1px); }
        .nav-signin { font-size: 13px; font-weight: 600; color: #5E5C56; text-decoration: none; padding: 8px 14px; border-radius: 10px; transition: color 0.2s; white-space: nowrap; }
        .nav-signin:hover { color: #A8A59A; }
        .nav-hamburger { display: none; width: 40px; height: 40px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 11px; align-items: center; justify-content: center; cursor: pointer; color: #A8A59A; flex-shrink: 0; }
        .nav-mobile-menu { display: none; background: rgba(6,6,8,0.99); border-top: 1px solid rgba(255,255,255,0.06); padding: 10px 20px 16px; flex-direction: column; gap: 3px; }
        .nav-mobile-menu.open { display: flex; }
        .nav-mobile-link { display: flex; align-items: center; gap: 11px; padding: 13px 14px; border-radius: 11px; font-size: 14px; font-weight: 600; text-decoration: none; color: #5E5C56; transition: all 0.15s; border: 1px solid transparent; }
        .nav-mobile-link:hover { background: rgba(255,255,255,0.05); color: #A8A59A; }
        .nav-mobile-link.active { background: rgba(34,168,118,0.1); color: #2ECC8F; border-color: rgba(34,168,118,0.15); }
        @media (max-width: 900px) { .nav-links-wrap { display: none !important; } .nav-hamburger { display: flex !important; } }
        @media (max-width: 480px) { .navbar-inner { padding: 0 16px; } .nav-trust-pill { display: none !important; } }
      `}</style>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="nav-logo">
            <img src="/gcoc.png" alt="Gordon College" style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }} />
            <div>
              <div className="nav-logo-text">Rentora</div>
              <div className="nav-logo-sub">Gordon College</div>
            </div>
          </Link>

          {/* Center links */}
          {user && (
            <div className="nav-links-wrap">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right */}
          <div className="nav-right">
            {!user && (
              <>
                <Link href="/auth/login" className="nav-signin">Sign in</Link>
                <Link href="/auth/register" className="nav-get-started">
                  <LogIn size={14} strokeWidth={2.5} /> Get started
                </Link>
              </>
            )}
            {user && (
              <>
                {profile?.trust_score > 0 && (
                  <div className="nav-trust-pill">
                    <Star size={11} fill="#C9A84C" color="#C9A84C" strokeWidth={1} />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#E2C07A' }}>{profile.trust_score}</span>
                  </div>
                )}
                <Link href="/notifications" className="nav-icon-btn">
                  <Bell size={17} strokeWidth={1.8} />
                  {notifCount > 0 && <span className="nav-notif-dot">{notifCount > 9 ? '9+' : notifCount}</span>}
                </Link>
                <Link href={`/profile/${user.id}`} className="nav-avatar">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Link>
                <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} style={{ border: 'none' }}>
                  {mobileOpen ? <X size={17} strokeWidth={2} /> : <Menu size={17} strokeWidth={2} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {user && (
          <div className={`nav-mobile-menu ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`nav-mobile-link ${pathname === link.href ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
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