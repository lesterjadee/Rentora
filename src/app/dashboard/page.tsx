import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RealtimeRentals from '@/components/RealtimeRentals'
import {
  ShoppingBag, PlusCircle, ClipboardList,
  Sparkles, Package, Star, RefreshCw, ArrowUpRight
} from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcon'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myItems } = await supabase
    .from('items').select('*, categories(name, icon)').eq('owner_id', user.id)
  const { data: myRentals } = await supabase
    .from('rentals').select('*').eq('renter_id', user.id)
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <>
      <style>{`
        .dash { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        .dash-banner {
          position: relative; overflow: hidden;
          padding: 52px 28px 100px;
          border-bottom: 1px solid rgba(34,197,94,0.15);
        }
        .dash-banner::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 80% at 100% 0%, rgba(165,255,172,0.2), transparent 60%),
            radial-gradient(ellipse 40% 60% at 0% 100%, rgba(34,197,94,0.08), transparent 50%);
          pointer-events: none;
        }
        .dash-banner::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
        }

        .dash-inner { max-width: 1280px; margin: 0 auto; position: relative; }

        .dash-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 14px; margin-bottom: 16px;
        }
        .dash-stat-card {
          background: #FFFFFF;
          border: 1px solid var(--border-sub);
          border-radius: 20px; padding: 26px;
          position: relative; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: var(--shadow-sm);
        }
        .dash-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .dash-stat-green { border-color: rgba(34,197,94,0.2); }
        .dash-stat-green:hover { border-color: rgba(34,197,94,0.35); box-shadow: var(--shadow-md), 0 0 0 1px rgba(165,255,172,0.2); }
        .dash-stat-blue:hover { border-color: rgba(59,130,246,0.25); }
        .dash-stat-gold { border-color: rgba(201,168,76,0.18); }
        .dash-stat-gold:hover { border-color: rgba(201,168,76,0.35); box-shadow: var(--shadow-md), 0 0 0 1px rgba(201,168,76,0.1); }

        .dash-links {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 28px;
        }
        .dash-link-card {
          border-radius: 18px; padding: 22px 20px;
          display: block; text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          position: relative; overflow: hidden;
        }
        .dash-link-card:hover {
          transform: translateY(-3px);
          filter: brightness(0.97);
        }
        .dash-link-card:hover .dash-link-arrow {
          opacity: 1;
          transform: translate(2px, -2px);
        }
        .dash-link-arrow {
          opacity: 0.4;
          transition: all 0.2s;
        }

        .dash-items-card {
          background: #FFFFFF;
          border: 1px solid var(--border-sub);
          border-radius: 22px; padding: 28px;
          box-shadow: var(--shadow-sm);
        }

        .dash-item-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 18px; border-radius: 14px;
          border: 1px solid var(--border-dim);
          background: var(--bg-raised);
          margin-bottom: 8px; text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .dash-item-row:last-child { margin-bottom: 0; }
        .dash-item-row:hover {
          border-color: rgba(34,197,94,0.25);
          background: #FFFFFF;
          box-shadow: var(--shadow-sm);
          transform: translateX(3px);
        }

        @media (max-width: 900px) {
          .dash-stats { grid-template-columns: 1fr 1fr; }
          .dash-links { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .dash-stats { grid-template-columns: 1fr; }
          .dash-inner { padding: 0 20px; }
          .dash-banner { padding: 40px 20px 88px; }
        }
      `}</style>

      <div className="dash">
        <RealtimeRentals userId={user.id} />

        {/* ── BANNER ── */}
        <div className="dash-banner">
          <div className="dash-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--g-vivid)', boxShadow: '0 0 6px rgba(34,197,94,0.5)', animation: 'breathe 2s ease infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--g-vivid)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Dashboard</span>
                </div>
                <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: '0 0 8px' }}>
                  Welcome back,{' '}
                  <span style={{ background: 'linear-gradient(135deg, var(--g-deep), var(--g-vivid))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {profile?.full_name?.split(' ')[0]}!
                  </span>
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--tx-muted)', margin: 0 }}>
                  {profile?.student_id || user.email}
                </p>
              </div>
              <form action="/auth/signout" method="post">
                <button type="submit" style={{
                  padding: '9px 18px',
                  background: 'rgba(0,0,0,0.04)',
                  color: 'var(--tx-muted)',
                  border: '1px solid var(--border-sub)',
                  borderRadius: '10px', fontWeight: '600',
                  fontSize: '13px', cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
                }}>
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: '1280px', margin: '-64px auto 0', padding: '0 28px 60px' }}>

          {/* Stats */}
          <div className="dash-stats">
            {[
              {
                label: 'My Listings',
                value: myItems?.length || 0,
                color: 'var(--g-deep)',
                cls: 'dash-stat-green',
                icon: <Package size={18} color="var(--g-vivid)" strokeWidth={1.8} />,
                iconBg: 'rgba(165,255,172,0.25)',
                iconBorder: 'rgba(34,197,94,0.2)',
                glow: 'radial-gradient(circle at 80% 20%, rgba(165,255,172,0.15), transparent)'
              },
              {
                label: 'Active Rentals',
                value: myRentals?.length || 0,
                color: '#1D4ED8',
                cls: 'dash-stat-blue',
                icon: <RefreshCw size={18} color="#2563EB" strokeWidth={1.8} />,
                iconBg: 'rgba(59,130,246,0.1)',
                iconBorder: 'rgba(59,130,246,0.2)',
                glow: 'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.07), transparent)'
              },
              {
                label: 'Trust Score',
                value: profile?.trust_score || '--',
                color: 'var(--au-dark)',
                cls: 'dash-stat-gold',
                icon: <Star size={18} color="var(--au-mid)" strokeWidth={1.8} fill="var(--au-mid)" />,
                iconBg: 'rgba(201,168,76,0.12)',
                iconBorder: 'rgba(201,168,76,0.25)',
                glow: 'radial-gradient(circle at 80% 20%, rgba(201,168,76,0.1), transparent)'
              },
            ].map((stat, i) => (
              <div key={i} className={`dash-stat-card ${stat.cls}`}>
                <div style={{ position: 'absolute', inset: 0, background: stat.glow, borderRadius: '20px', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative' }}>
                  <p style={{ fontSize: '11px', color: 'var(--tx-muted)', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {stat.label}
                  </p>
                  <div style={{ width: '38px', height: '38px', background: stat.iconBg, border: `1px solid ${stat.iconBorder}`, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                </div>
                <p style={{ fontSize: '52px', fontWeight: '900', color: stat.color, margin: 0, lineHeight: 1, letterSpacing: '-0.05em', position: 'relative' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="dash-links">
            {[
              {
                href: '/items',
                label: 'Browse Items',
                desc: 'Find items to rent',
                icon: <ShoppingBag size={22} strokeWidth={1.8} />,
                iconColor: '#15803d',
                iconBg: 'rgba(165,255,172,0.35)',
                iconBorder: 'rgba(34,197,94,0.25)',
                bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: 'rgba(34,197,94,0.25)',
                shadow: '0 4px 16px rgba(34,197,94,0.12)',
              },
              {
                href: '/items/new',
                label: 'List an Item',
                desc: 'Earn from your stuff',
                icon: <PlusCircle size={22} strokeWidth={1.8} />,
                iconColor: '#92400E',
                iconBg: 'rgba(201,168,76,0.2)',
                iconBorder: 'rgba(201,168,76,0.3)',
                bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: 'rgba(201,168,76,0.3)',
                shadow: '0 4px 16px rgba(201,168,76,0.12)',
              },
              {
                href: '/rentals',
                label: 'My Rentals',
                desc: 'Track your rentals',
                icon: <ClipboardList size={22} strokeWidth={1.8} />,
                iconColor: '#1D4ED8',
                iconBg: 'rgba(59,130,246,0.12)',
                iconBorder: 'rgba(59,130,246,0.25)',
                bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                border: 'rgba(59,130,246,0.25)',
                shadow: '0 4px 16px rgba(59,130,246,0.10)',
              },
              {
                href: '/recommendations',
                label: 'For You',
                desc: 'Personalized picks',
                icon: <Sparkles size={22} strokeWidth={1.8} />,
                iconColor: '#6D28D9',
                iconBg: 'rgba(124,58,237,0.12)',
                iconBorder: 'rgba(124,58,237,0.2)',
                bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                border: 'rgba(124,58,237,0.2)',
                shadow: '0 4px 16px rgba(124,58,237,0.10)',
              },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="dash-link-card"
                style={{
                  background: link.bg,
                  border: `1px solid ${link.border}`,
                  boxShadow: link.shadow,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: link.iconBg,
                    border: `1px solid ${link.iconBorder}`,
                    borderRadius: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: link.iconColor,
                  }}>
                    {link.icon}
                  </div>
                  <ArrowUpRight
                    size={16}
                    color={link.iconColor}
                    strokeWidth={2}
                    className="dash-link-arrow"
                  />
                </div>
                <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                  {link.label}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>
                  {link.desc}
                </p>
              </Link>
            ))}
          </div>

          {/* Listed Items */}
          <div className="dash-items-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1px solid var(--border-sub)' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
                  My Listed Items
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>
                  {myItems?.length || 0} item{myItems?.length !== 1 ? 's' : ''} listed
                </p>
              </div>
              <Link href="/items/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: '700',
                color: 'var(--g-deep)', textDecoration: 'none',
                padding: '8px 16px',
                background: 'rgba(165,255,172,0.25)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '10px', transition: 'all 0.2s',
              }}>
                <PlusCircle size={13} strokeWidth={2.5} /> Add New
              </Link>
            </div>

            {myItems && myItems.length > 0 ? (
              <div>
                {myItems.map((item: any) => (
                  <Link key={item.id} href={`/items/${item.id}`} className="dash-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px', height: '44px',
                        background: 'rgba(165,255,172,0.2)',
                        border: '1px solid rgba(34,197,94,0.18)',
                        borderRadius: '13px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <CategoryIcon name={item.categories?.name || 'Other'} size={20} color="var(--g-vivid)" />
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>
                          ₱{item.price_per_day}/day
                        </p>
                      </div>
                    </div>
                    <span className={`status-${item.status}`}>{item.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '52px 24px' }}>
                <div style={{
                  width: '60px', height: '60px',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-sub)',
                  borderRadius: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                }}>
                  <Package size={28} color="var(--tx-dim)" strokeWidth={1.5} />
                </div>
                <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--tx-body)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
                  No items yet
                </p>
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', marginBottom: '22px' }}>
                  Start earning by listing your first item
                </p>
                <Link href="/items/new" className="btn-green" style={{ display: 'inline-flex', fontSize: '13px', padding: '10px 22px' }}>
                  <PlusCircle size={14} strokeWidth={2.5} /> List Your First Item
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}