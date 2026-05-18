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

        // Sync ID image from registration metadata to profile (first login)
        if (event === 'SIGNED_IN') {
          const meta = session.user.user_metadata
          if (meta?.id_image_url) {
            await supabase.from('profiles').update({
              id_image_url: meta.id_image_url,
              id_submitted_at: meta.id_submitted_at || new Date().toISOString(),
              verification_status: 'pending',
            }).eq('id', session.user.id).is('id_image_url', null)
          }
        }
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
        .navbar-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 28px;
          height: 68px; display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }
        .nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; flex-shrink: 0; }
        .nav-logo-wordmark { display: flex; flex-direction: column; gap: 0; }
        .nav-logo-text {
          font-size: 18px; font-weight: 900; letter-spacing: -0.04em; line-height: 1;
          color: var(--g-dark);
        }
        .nav-logo-sub {
          font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--g-rich); line-height: 1; margin-top: 2px;
        }
        .nav-logo:hover .nav-logo-text { color: var(--g-mid); }
        .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .nav-get-started {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px;
          background: linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid));
          border: 1px solid rgba(92,219,149,0.15);
          color: #FFFFFF; font-size: 13px; font-weight: 700;
          border-radius: 11px; text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 4px 14px rgba(7,24,18,0.2);
          white-space: nowrap;
        }
        .nav-get-started:hover {
          background: linear-gradient(135deg, var(--g-dark), var(--g-mid), var(--g-rich));
          box-shadow: 0 6px 22px rgba(7,24,18,0.3);
          transform: translateY(-1px);
        }
        .nav-signin {
          font-size: 13px; font-weight: 600; color: var(--tx-muted);
          text-decoration: none; padding: 8px 14px;
          border-radius: 10px; transition: color 0.2s; white-space: nowrap;
        }
        .nav-signin:hover { color: var(--g-mid); }
        .nav-hamburger {
          display: none; width: 40px; height: 40px;
          background: var(--bg-raised);
          border: 1.5px solid rgba(27,77,62,0.15);
          border-radius: 11px; align-items: center; justify-content: center;
          cursor: pointer; color: var(--tx-muted); flex-shrink: 0;
        }
        @media (max-width: 1024px) { .nav-links-wrap { display: none !important; } .nav-hamburger { display: flex !important; } }
        @media (max-width: 480px) { .navbar-inner { padding: 0 18px; } .nav-trust-pill { display: none !important; } }
      `}</style>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="nav-logo">
            {/* R icon box */}
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(7,24,18,0.2)',
              flexShrink: 0,
            }}>
              <span style={{ color: '#FFFFFF', fontWeight: '900', fontSize: '18px', letterSpacing: '-0.04em', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>R</span>
            </div>

            {/* Wordmark */}
            <div className="nav-logo-wordmark">
              <span className="nav-logo-text">Rentora</span>
              <span className="nav-logo-sub">Gordon College</span>
            </div>

            {/* Gordon College logo — no border, no background */}
            <img
              src="/gcoc.png"
              alt="Gordon College"
              style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }}
            />
          </Link>

          {/* Center nav */}
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
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--au-dark)' }}>
                      {profile.trust_score}
                    </span>
                  </div>
                )}
                <Link href="/notifications" className="nav-icon-btn">
                  <Bell size={17} strokeWidth={1.8} />
                  {notifCount > 0 && (
                    <span className="nav-notif-dot">{notifCount > 9 ? '9+' : notifCount}</span>
                  )}
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