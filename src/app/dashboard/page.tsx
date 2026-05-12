import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RealtimeRentals from '@/components/RealtimeRentals'
import { ShoppingBag, PlusCircle, ClipboardList, Sparkles, Package, Star, RefreshCw, ArrowUpRight } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcon'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myItems } = await supabase.from('items').select('*, categories(name, icon)').eq('owner_id', user.id)
  const { data: myRentals } = await supabase.from('rentals').select('*').eq('renter_id', user.id)
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <>
      <style>{`
        .dash { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .dash-banner {
          position: relative; overflow: hidden;
          padding: 52px 28px 100px;
          border-bottom: 1px solid rgba(92,219,149,0.1);
        }
        .dash-banner::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 100% 0%, rgba(92,219,149,0.08), transparent 55%),
            radial-gradient(ellipse 40% 50% at 0% 100%, rgba(201,168,76,0.05), transparent 50%);
          pointer-events: none;
        }
        .dash-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent);
        }
        .dash-inner { max-width: 1280px; margin: 0 auto; position: relative; }
        .dash-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px; }
        .dash-stat-card {
          background: #FFFFFF; border: 1.5px solid rgba(27,77,62,0.1);
          border-radius: 20px; padding: 26px;
          position: relative; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: var(--shadow-sm);
        }
        .dash-stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .dash-stat-green { border-color: rgba(27,77,62,0.18); }
        .dash-stat-green:hover { border-color: rgba(27,77,62,0.32); box-shadow: var(--shadow-md), 0 0 0 1px rgba(27,77,62,0.06); }
        .dash-stat-blue:hover { border-color: rgba(59,130,246,0.25); }
        .dash-stat-gold { border-color: rgba(201,168,76,0.18); }
        .dash-stat-gold:hover { border-color: rgba(201,168,76,0.35); }
        .dash-links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .dash-link-card {
          border-radius: 18px; padding: 22px 20px;
          display: block; text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          border: 1.5px solid transparent; position: relative; overflow: hidden;
        }
        .dash-link-card:hover { transform: translateY(-3px); }
        .dash-link-arrow { opacity: 0.5; transition: all 0.2s; }
        .dash-link-card:hover .dash-link-arrow { opacity: 1; transform: translate(2px,-2px); }
        .dash-items-card {
          background: #FFFFFF; border: 1.5px solid rgba(27,77,62,0.1);
          border-radius: 22px; padding: 28px; box-shadow: var(--shadow-sm);
        }
        .dash-item-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 18px; border-radius: 14px;
          border: 1px solid rgba(27,77,62,0.06);
          background: var(--bg-raised); margin-bottom: 8px;
          text-decoration: none; transition: all 0.2s;
        }
        .dash-item-row:last-child { margin-bottom: 0; }
        .dash-item-row:hover { border-color: rgba(27,77,62,0.2); background: #FFFFFF; box-shadow: var(--shadow-sm); transform: translateX(3px); }
        @media (max-width: 900px) { .dash-stats { grid-template-columns: 1fr 1fr; } .dash-links { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .dash-stats { grid-template-columns: 1fr; } }
      `}</style>

      <div className="dash">
        <RealtimeRentals userId={user.id} />

        <div className="dash-banner">
          <div className="dash-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7FFFC4', boxShadow: '0 0 6px rgba(127,255,196,0.6)', animation: 'breathe 2s ease infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#7FFFC4', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Dashboard</span>
                </div>
                <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: '900', color: '#F0FDF4', letterSpacing: '-0.04em', margin: '0 0 8px' }}>
                  Welcome back, <span className="gold-shimmer">{profile?.full_name?.split(' ')[0]}!</span>
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(240,253,244,0.55)', margin: 0 }}>{profile?.student_id || user.email}</p>
              </div>
              <form action="/auth/signout" method="post">
                <button type="submit" style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #991B1B, #DC2626)', color: '#FFFFFF', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', boxShadow: '0 2px 8px rgba(220,38,38,0.25)' }}>
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '-64px auto 0', padding: '0 28px 60px' }}>

          {/* Stats */}
          <div className="dash-stats">
            {[
              { label: 'My Listings', value: myItems?.length || 0, color: 'var(--g-mid)', cls: 'dash-stat-green', icon: <Package size={18} color="var(--g-rich)" strokeWidth={1.8} />, iconBg: 'rgba(27,77,62,0.08)', iconBorder: 'rgba(27,77,62,0.18)', glow: 'radial-gradient(circle at 80% 20%, rgba(27,77,62,0.07), transparent)' },
              { label: 'Active Rentals', value: myRentals?.length || 0, color: '#1D4ED8', cls: 'dash-stat-blue', icon: <RefreshCw size={18} color="#2563EB" strokeWidth={1.8} />, iconBg: 'rgba(59,130,246,0.08)', iconBorder: 'rgba(59,130,246,0.18)', glow: 'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.06), transparent)' },
              { label: 'Trust Score', value: profile?.trust_score || '--', color: 'var(--au-dark)', cls: 'dash-stat-gold', icon: <Star size={18} color="var(--au-mid)" strokeWidth={1.8} fill="var(--au-mid)" />, iconBg: 'rgba(201,168,76,0.1)', iconBorder: 'rgba(201,168,76,0.22)', glow: 'radial-gradient(circle at 80% 20%, rgba(201,168,76,0.08), transparent)' },
            ].map((stat, i) => (
              <div key={i} className={`dash-stat-card ${stat.cls}`}>
                <div style={{ position: 'absolute', inset: 0, background: stat.glow, borderRadius: '20px', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative' }}>
                  <p style={{ fontSize: '11px', color: 'var(--tx-muted)', fontWeight: '700', margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{stat.label}</p>
                  <div style={{ width: '38px', height: '38px', background: stat.iconBg, border: `1px solid ${stat.iconBorder}`, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                </div>
                <p style={{ fontSize: '52px', fontWeight: '900', color: stat.color, margin: 0, lineHeight: 1, letterSpacing: '-0.05em', position: 'relative' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="dash-links">
            {[
              { href: '/items',           label: 'Browse Items', desc: 'Find items to rent',   icon: <ShoppingBag size={22} strokeWidth={1.8} />,   iconColor: '#FFFFFF',   iconBg: 'rgba(255,255,255,0.12)', bg: 'linear-gradient(135deg, #071812, #0D2B20, #1B4D3E)', border: 'rgba(92,219,149,0.15)',  shadow: '0 6px 20px rgba(7,24,18,0.25)',   arrowColor: 'rgba(127,255,196,0.7)' },
              { href: '/items/new',       label: 'List an Item', desc: 'Earn from your stuff', icon: <PlusCircle size={22} strokeWidth={1.8} />,     iconColor: '#E2C07A',   iconBg: 'rgba(201,168,76,0.15)', bg: 'linear-gradient(135deg, #1A0F02, #2A1A04, #3D2608)', border: 'rgba(201,168,76,0.2)',   shadow: '0 6px 20px rgba(26,15,2,0.25)',   arrowColor: 'rgba(226,192,122,0.7)' },
              { href: '/rentals',         label: 'My Rentals',   desc: 'Track your rentals',   icon: <ClipboardList size={22} strokeWidth={1.8} />, iconColor: '#93C5FD',   iconBg: 'rgba(59,130,246,0.15)', bg: 'linear-gradient(135deg, #020B18, #051828, #0A2540)', border: 'rgba(59,130,246,0.2)',   shadow: '0 6px 20px rgba(2,11,24,0.25)',   arrowColor: 'rgba(147,197,253,0.7)' },
              { href: '/recommendations', label: 'For You',      desc: 'Personalized picks',   icon: <Sparkles size={22} strokeWidth={1.8} />,      iconColor: '#C4B5FD',   iconBg: 'rgba(124,58,237,0.15)', bg: 'linear-gradient(135deg, #0D0514, #1A0A28, #260F3D)', border: 'rgba(124,58,237,0.2)',   shadow: '0 6px 20px rgba(13,5,20,0.25)',   arrowColor: 'rgba(196,181,253,0.7)' },
            ].map((link, i) => (
              <Link key={i} href={link.href} className="dash-link-card" style={{ background: link.bg, border: `1.5px solid ${link.border}`, boxShadow: link.shadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', background: link.iconBg, border: `1px solid ${link.border}`, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.iconColor }}>
                    {link.icon}
                  </div>
                  <ArrowUpRight size={16} color={link.arrowColor} strokeWidth={2} className="dash-link-arrow" />
                </div>
                <p style={{ fontWeight: '800', fontSize: '14px', color: '#F0FDF4', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{link.label}</p>
                <p style={{ fontSize: '12px', color: 'rgba(240,253,244,0.55)', margin: 0 }}>{link.desc}</p>
              </Link>
            ))}
          </div>

          {/* Listed Items */}
          <div className="dash-items-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1px solid rgba(27,77,62,0.08)' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>My Listed Items</h2>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{myItems?.length || 0} item{myItems?.length !== 1 ? 's' : ''} listed</p>
              </div>
              <Link href="/items/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#FFFFFF', textDecoration: 'none', padding: '8px 16px', background: 'linear-gradient(135deg, var(--g-dark), var(--g-mid))', border: '1px solid rgba(92,219,149,0.15)', borderRadius: '10px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(7,24,18,0.15)' }}>
                <PlusCircle size={13} strokeWidth={2.5} /> Add New
              </Link>
            </div>
            {myItems && myItems.length > 0 ? (
              <div>
                {myItems.map((item: any) => (
                  <Link key={item.id} href={`/items/${item.id}`} className="dash-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', background: 'rgba(27,77,62,0.08)', border: '1px solid rgba(27,77,62,0.15)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CategoryIcon name={item.categories?.name || 'Other'} size={20} color="var(--g-rich)" />
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>{item.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>₱{item.price_per_day}/day</p>
                      </div>
                    </div>
                    <span className={`status-${item.status}`}>{item.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '52px 24px' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(27,77,62,0.06)', border: '1px solid rgba(27,77,62,0.12)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <Package size={28} color="var(--g-rich)" strokeWidth={1.5} />
                </div>
                <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--tx-bright)', marginBottom: '6px' }}>No items yet</p>
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', marginBottom: '22px' }}>Start earning by listing your first item</p>
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