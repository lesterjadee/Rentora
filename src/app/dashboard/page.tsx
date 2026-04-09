import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RealtimeRentals from '@/components/RealtimeRentals'
import { ShoppingBag, PlusCircle, ClipboardList, Sparkles, Package, Star, RefreshCw } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcon'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myItems } = await supabase.from('items').select('*, categories(name, icon)').eq('owner_id', user.id)
  const { data: myRentals } = await supabase.from('rentals').select('*').eq('renter_id', user.id)
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const quickLinks = [
    {
      href: '/items', label: 'Browse Items', desc: 'Find items to rent',
      icon: <ShoppingBag size={26} color="#ffffff" strokeWidth={1.8} />,
      gradient: 'linear-gradient(135deg, #1a3a5c, #26619C)', shadow: 'rgba(26,58,92,0.3)'
    },
    {
      href: '/items/new', label: 'List an Item', desc: 'Earn from your stuff',
      icon: <PlusCircle size={26} color="#ffffff" strokeWidth={1.8} />,
      gradient: 'linear-gradient(135deg, #059669, #10b981)', shadow: 'rgba(16,185,129,0.3)'
    },
    {
      href: '/rentals', label: 'My Rentals', desc: 'Track your rentals',
      icon: <ClipboardList size={26} color="#ffffff" strokeWidth={1.8} />,
      gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', shadow: 'rgba(8,145,178,0.3)'
    },
    {
      href: '/recommendations', label: 'For You', desc: 'Personalized picks',
      icon: <Sparkles size={26} color="#ffffff" strokeWidth={1.8} />,
      gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', shadow: 'rgba(124,58,237,0.3)'
    },
  ]

  return (
    <>
      <style>{`
        .dash-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .dash-links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
        @media (max-width: 768px) {
          .dash-stats { grid-template-columns: 1fr 1fr; }
          .dash-links { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .dash-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
        <RealtimeRentals userId={user.id} />

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px 80px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Dashboard</p>
              <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                Welcome back, {profile?.full_name?.split(' ')[0]}!
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                {profile?.student_id || user.email}
              </p>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" style={{
                padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
              }}>Sign Out</button>
            </form>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '-48px auto 0', padding: '0 24px 48px' }}>

          {/* Stats */}
          <div className="dash-stats">
            {[
              {
                label: 'My Listings', value: myItems?.length || 0,
                color: '#26619C', gradient: 'linear-gradient(135deg, #26619C, #3b82f6)',
                icon: <Package size={20} color="#26619C" strokeWidth={1.8} />, bg: '#eff6ff'
              },
              {
                label: 'Active Rentals', value: myRentals?.length || 0,
                color: '#0891b2', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                icon: <RefreshCw size={20} color="#0891b2" strokeWidth={1.8} />, bg: '#ecfeff'
              },
              {
                label: 'Trust Score', value: profile?.trust_score || '--',
                color: '#d97706', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
                icon: <Star size={20} color="#d97706" strokeWidth={1.8} fill="#d97706" />, bg: '#fffbeb'
              },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff', borderRadius: '20px',
                border: '1px solid #e8edf2', padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
                  borderRadius: '50%', background: stat.gradient, opacity: 0.06,
                  transform: 'translate(30px, -30px)'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', margin: 0 }}>{stat.label}</p>
                  <div style={{
                    width: '38px', height: '38px', backgroundColor: stat.bg,
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{stat.icon}</div>
                </div>
                <p style={{ fontSize: '44px', fontWeight: '800', color: stat.color, margin: 0, lineHeight: 1 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="dash-links">
            {quickLinks.map((link, i) => (
              <Link key={i} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: link.gradient, borderRadius: '18px',
                  padding: '22px 20px', cursor: 'pointer',
                  boxShadow: `0 8px 24px ${link.shadow}`, transition: 'transform 0.2s'
                }}>
                  <div style={{ marginBottom: '14px' }}>{link.icon}</div>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: '#ffffff', margin: '0 0 4px' }}>{link.label}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* My Items */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>My Listed Items</h2>
              <Link href="/items/new" style={{
                fontSize: '13px', fontWeight: '600', color: '#26619C',
                textDecoration: 'none', padding: '8px 16px',
                backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <PlusCircle size={14} strokeWidth={2} /> Add New
              </Link>
            </div>

            {myItems && myItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myItems.map((item: any) => (
                  <Link key={item.id} href={`/items/${item.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      borderRadius: '14px', border: '1px solid #f1f5f9', padding: '16px 20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: '#fafbfc', transition: 'all 0.15s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '44px', height: '44px', backgroundColor: '#eff6ff',
                          borderRadius: '12px', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0
                        }}>
                          <CategoryIcon name={item.categories?.name || 'Other'} size={22} color="#26619C" />
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '15px', color: '#0f172a', margin: '0 0 3px' }}>{item.title}</p>
                          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>₱{item.price_per_day}/day</p>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '12px', fontWeight: '700', padding: '6px 14px', borderRadius: '999px',
                        backgroundColor: item.status === 'available' ? '#dcfce7' : '#fee2e2',
                        color: item.status === 'available' ? '#15803d' : '#dc2626',
                        border: `1px solid ${item.status === 'available' ? '#86efac' : '#fca5a5'}`
                      }}>{item.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Package size={28} color="#26619C" strokeWidth={1.5} />
                </div>
                <p style={{ fontWeight: '600', fontSize: '16px', color: '#0f172a', marginBottom: '6px' }}>No items yet</p>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Start earning by listing your first item</p>
                <Link href="/items/new" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 24px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
                  color: '#ffffff', fontWeight: '600', borderRadius: '10px', textDecoration: 'none', fontSize: '14px'
                }}>
                  <PlusCircle size={16} strokeWidth={2} /> List Your First Item
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}