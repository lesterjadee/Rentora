'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ShoppingBag, PlusCircle, ClipboardList,
  Sparkles, Bell, Star, Menu, X, LogIn, ArrowRight
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
      const { data: prof } = await supabase.from('profiles').select('full_name, trust_score').eq('id', user.id).single()
      setProfile(prof)
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false)
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
        .nav-root {
          position: sticky; top: 0; z-index: 100;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .nav-root.scrolled {
          background: rgba(6,6,8,0.92);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 32px rgba(0,0,0,0.5);
        }
        .nav-root.top {
          background: transparent;
          border-bottom: 1px solid transparent;
        }
        .nav-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 28px;
          display: flex; align-items: center;
          justify-content: space-between;
          height: 68px;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .nav-logo-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #0D2B1A, #1A7A52);
          border: 1px solid rgba(34,168,118,0.3);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 900; color: #22A876;
          box-shadow: 0 0 16px rgba(34,168,118,0.15), inset 0 1px 0 rgba(46,204,143,0.2);
          transition: all 0.3s;
        }
        .nav-logo:hover .nav-logo-mark {
          box-shadow: 0 0 24px rgba(34,168,118,0.25), inset 0 1px 0 rgba(46,204,143,0.3);
        }
        .nav-logo-text {
          font-size: 18px; font-weight: 900;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #2ECC8F 30%, #4EDDAA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav-links {
          display: flex; align-items: center;
          gap: 2px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 4px;
        }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          color: #5E5C56;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: #A8A59A;
          background: rgba(255,255,255,0.05);
        }
        .nav-link.active {
          color: #2ECC8F;
          background: rgba(34,168,118,0.12);
          border: 1px solid rgba(34,168,118,0.15);
        }
        .nav-link.active svg { color: #2ECC8F; }
        .nav-right { display: flex; align-items: center; gap: 8px; }
        .nav-icon-btn {
          position: relative; width: 40px; height: 40px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
          text-decoration: none; color: #5E5C56;
        }
        .nav-icon-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.12);
          color: #A8A59A;
        }
        .nav-trust {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 11px;
          background: linear-gradient(135deg, rgba(42,30,8,0.8), rgba(90,63,20,0.4));
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 999px;
          cursor: default;
          box-shadow: 0 0 12px rgba(201,168,76,0.08);
        }
        .nav-notif-badge {
          position: absolute; top: -4px; right: -4px;
          width: 17px; height: 17px;
          background: linear-gradient(135deg, #C9A84C, #E2C07A);
          border-radius: 50%; color: #0C0D10;
          font-size: 9px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #060608;
          box-shadow: 0 0 8px rgba(201,168,76,0.3);
        }
        .nav-avatar {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #0D2B1A, #145738);
          border: 1px solid rgba(34,168,118,0.25);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          color: #22A876; font-weight: 900; font-size: 14px;
          cursor: pointer; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 0 12px rgba(34,168,118,0.08);
        }
        .nav-avatar:hover {
          border-color: rgba(34,168,118,0.4);
          box-shadow: 0 0 20px rgba(34,168,118,0.15);
        }
        .nav-get-started {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #6B4C18, #C9A84C, #A07828);
          border: 1px solid rgba(201,168,76,0.4);
          color: #0C0D10; font-size: 13px; font-weight: 800;
          border-radius: 11px; text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 4px 16px rgba(201,168,76,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
          letter-spacing: 0.01em;
        }
        .nav-get-started:hover {
          background: linear-gradient(135deg, #7A5520, #E2C07A, #B8922E);
          box-shadow: 0 6px 24px rgba(201,168,76,0.3), inset 0 1px 0 rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }
        .nav-mobile-toggle { display: none; }
        .nav-mobile-menu {
          display: none;
          background: rgba(6,6,8,0.98);
          backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 12px 20px 20px;
        }
        .nav-mobile-menu.open { display: flex; flex-direction: column; gap: 3px; }
        .nav-mobile-link {
          display: flex; align-items: center; gap: 11px;
          padding: 13px 14px; border-radius: 11px;
          font-size: 14px; font-weight: 600;
          text-decoration: none; color: #5E5C56;
          transition: all 0.15s;
        }
        .nav-mobile-link:hover { background: rgba(255,255,255,0.05); color: #A8A59A; }
        .nav-mobile-link.active {
          background: rgba(34,168,118,0.1);
          color: #2ECC8F;
          border: 1px solid rgba(34,168,118,0.15);
        }
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
        @media (max-width: 480px) {
          .nav-inner { padding: 0 18px; }
        }
      `}</style>

      <nav className={`nav-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="nav-inner">

          <Link href={user ? '/dashboard' : '/'} className="nav-logo">
            <div className="nav-logo-mark">R</div>
            <span className="nav-logo-text">Rentora</span>
          </Link>

          {user && (
            <div className="nav-links">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="nav-right">
            {!user && (
              <>
                <Link href="/auth/login" style={{ fontSize: '13px', fontWeight: '600', color: '#5E5C56', textDecoration: 'none', padding: '8px 14px', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#A8A59A')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5E5C56')}
                >
                  Sign in
                </Link>
                <Link href="/auth/register" className="nav-get-started">
                  <LogIn size={14} strokeWidth={2.5} />
                  Get started
                </Link>
              </>
            )}

            {user && (
              <>
                {profile?.trust_score > 0 && (
                  <div className="nav-trust">
                    <Star size={11} fill="#C9A84C" color="#C9A84C" />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#E2C07A', letterSpacing: '0.02em' }}>{profile.trust_score}</span>
                  </div>
                )}

                <Link href="/notifications" className="nav-icon-btn">
                  <Bell size={16} strokeWidth={1.8} />
                  {notifCount > 0 && (
                    <span className="nav-notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                  )}
                </Link>

                <Link href={`/profile/${user.id}`} className="nav-avatar">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Link>

                <button className="nav-mobile-toggle nav-icon-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ border: 'none', cursor: 'pointer' }}>
                  {mobileOpen ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
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