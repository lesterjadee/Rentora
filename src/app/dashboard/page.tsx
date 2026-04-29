import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RealtimeRentals from '@/components/RealtimeRentals'
import {
  ShoppingBag, PlusCircle, ClipboardList,
  Sparkles, Package, Star, RefreshCw, ArrowRight
} from 'lucide-react'
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
        body { background-color: #0A0A0A; }
        .dash-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .dash-links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .dash-stat-card {
          background: #111111; border: 1px solid #1C1C1C;
          border-radius: 18px; padding: 24px;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .dash-stat-card:hover { border-color: rgba(46,204,143,0.2); transform: translateY(-1px); }
        .dash-quick-link {
          border-radius: 16px; padding: 22px 20px;
          cursor: pointer; transition: all 0.25s;
          text-decoration: none; display: block;
          border: 1px solid transparent;
        }
        .dash-quick-link:hover { transform: translateY(-2px); }
        .dash-item-row {
          border-radius: 12px; border: 1px solid #1C1C1C;
          padding: 14px 18px;
          display: flex; justify-content: space-between; align-items: center;
          background: #111111; transition: all 0.15s;
          text-decoration: none; margin-bottom: 8px; display: flex;
        }
        .dash-item-row:hover { border-color: rgba(46,204,143,0.2); background: #141414; }
        @media (max-width: 768px) {
          .dash-stats { grid-template-columns: 1fr 1fr; }
          .dash-links { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .dash-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', fontFamily: 'system-ui, sans-serif', color: '#F0F0F0' }}>
        <RealtimeRentals userId={user.id} />

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0A2118 0%, #0F3D2E 60%, #111111 100%)', padding: '48px 24px 96px', borderBottom: '1px solid #1C1C1C', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,143,0.06), transparent)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#2ECC8F', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px', opacity: 0.8 }}>Dashboard</p>
              <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: '900', color: '#F0F0F0', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                Welcome back, {profile?.full_name?.split(' ')[0]}!
              </h1>
              <p style={{ fontSize: '14px', color: '#606060', margin: 0 }}>
                {profile?.student_id || user.email}
              </p>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" style={{
                padding: '9px 18px',
                background: 'rgba(255,255,255,0.05)',
                color: '#A3A3A3', border: '1px solid #2E2E2E',
                borderRadius: '10px', fontWeight: '600',
                fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}>Sign Out</button>
            </form>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '-56px auto 0', padding: '0 24px 48px' }}>

          {/* Stats */}
          <div className="dash-stats" style={{ marginBottom: '16px' }}>
            {[
              { label: 'My Listings', value: myItems?.length || 0, color: '#2ECC8F', icon: <Package size={18} color="#2ECC8F" strokeWidth={1.8} />, glow: 'rgba(46,204,143,0.08)' },
              { label: 'Active Rentals', value: myRentals?.length || 0, color: '#3B82F6', icon: <RefreshCw size={18} color="#3B82F6" strokeWidth={1.8} />, glow: 'rgba(59,130,246,0.08)' },
              { label: 'Trust Score', value: profile?.trust_score || '--', color: '#F59E0B', icon: <Star size={18} color="#F59E0B" strokeWidth={1.8} fill="#F59E0B" />, glow: 'rgba(245,158,11,0.08)' },
            ].map((stat, i) => (
              <div key={i} className="dash-stat-card">
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 20%, ${stat.glow}, transparent)`, borderRadius: '18px', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative' }}>
                  <p style={{ fontSize: '12px', color: '#606060', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
                  <div style={{ width: '36px', height: '36px', background: '#1C1C1C', border: '1px solid #2E2E2E', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                </div>
                <p style={{ fontSize: '48px', fontWeight: '900', color: stat.color, margin: 0, lineHeight: 1, letterSpacing: '-0.04em', position: 'relative' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="dash-links" style={{ marginBottom: '28px' }}>
            {[
              { href: '/items', label: 'Browse Items', desc: 'Find items to rent', icon: <ShoppingBag size={24} color="#2ECC8F" strokeWidth={1.8} />, bg: 'linear-gradient(135deg, #0A2118, #0F3D2E)', border: 'rgba(46,204,143,0.2)', glow: 'rgba(46,204,143,0.1)' },
              { href: '/items/new', label: 'List an Item', desc: 'Earn from your stuff', icon: <PlusCircle size={24} color="#34D399" strokeWidth={1.8} />, bg: 'linear-gradient(135deg, #052218, #0a3320)', border: 'rgba(52,211,153,0.2)', glow: 'rgba(52,211,153,0.1)' },
              { href: '/rentals', label: 'My Rentals', desc: 'Track your rentals', icon: <ClipboardList size={24} color="#3B82F6" strokeWidth={1.8} />, bg: 'linear-gradient(135deg, #0c1a2e, #1a2f4f)', border: 'rgba(59,130,246,0.2)', glow: 'rgba(59,130,246,0.1)' },
              { href: '/recommendations', label: 'For You', desc: 'Personalized picks', icon: <Sparkles size={24} color="#A78BFA" strokeWidth={1.8} />, bg: 'linear-gradient(135deg, #1a0a2e, #2d1a4f)', border: 'rgba(167,139,250,0.2)', glow: 'rgba(167,139,250,0.1)' },
            ].map((link, i) => (
              <Link key={i} href={link.href} className="dash-quick-link" style={{ background: link.bg, border: `1px solid ${link.border}`, boxShadow: `0 8px 24px ${link.glow}` }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>{link.icon}</div>
                <p style={{ fontWeight: '700', fontSize: '14px', color: '#F0F0F0', margin: '0 0 4px' }}>{link.label}</p>
                <p style={{ fontSize: '12px', color: '#606060', margin: 0 }}>{link.desc}</p>
              </Link>
            ))}
          </div>

          {/* My Items */}
          <div style={{ background: '#111111', borderRadius: '20px', border: '1px solid #1C1C1C', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#F0F0F0', margin: 0 }}>My Listed Items</h2>
              <Link href="/items/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: '600', color: '#2ECC8F',
                textDecoration: 'none', padding: '7px 14px',
                background: 'rgba(46,204,143,0.08)',
                border: '1px solid rgba(46,204,143,0.2)',
                borderRadius: '8px', transition: 'all 0.2s'
              }}>
                <PlusCircle size={13} strokeWidth={2.5} /> Add New
              </Link>
            </div>

            {myItems && myItems.length > 0 ? (
              <div>
                {myItems.map((item: any) => (
                  <Link key={item.id} href={`/items/${item.id}`} className="dash-item-row" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', border: '1px solid #1C1C1C', background: '#111111', marginBottom: '8px', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', background: '#1C1C1C', border: '1px solid #2E2E2E', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CategoryIcon name={item.categories?.name || 'Other'} size={20} color="#2ECC8F" />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '14px', color: '#F0F0F0', margin: '0 0 2px' }}>{item.title}</p>
                        <p style={{ fontSize: '12px', color: '#606060', margin: 0 }}>₱{item.price_per_day}/day</p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      padding: '5px 12px', borderRadius: '999px',
                      background: item.status === 'available' ? 'rgba(46,204,143,0.1)' : 'rgba(239,68,68,0.1)',
                      color: item.status === 'available' ? '#2ECC8F' : '#EF4444',
                      border: `1px solid ${item.status === 'available' ? 'rgba(46,204,143,0.25)' : 'rgba(239,68,68,0.25)'}`
                    }}>{item.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ width: '56px', height: '56px', background: '#1C1C1C', border: '1px solid #2E2E2E', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Package size={26} color="#606060" strokeWidth={1.5} />
                </div>
                <p style={{ fontWeight: '600', fontSize: '15px', color: '#A3A3A3', marginBottom: '6px' }}>No items yet</p>
                <p style={{ fontSize: '13px', color: '#606060', marginBottom: '20px' }}>Start earning by listing your first item</p>
                <Link href="/items/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)', border: '1px solid rgba(46,204,143,0.3)', color: '#2ECC8F', fontWeight: '600', borderRadius: '10px', textDecoration: 'none', fontSize: '13px' }}>
                  <PlusCircle size={15} strokeWidth={2} /> List Your First Item
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}