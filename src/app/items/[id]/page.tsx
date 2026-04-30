import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Star, MapPin, Tag } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcon'

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('items')
    .select('*, profiles(id, full_name, trust_score, university), categories(name, icon)')
    .eq('id', id).single()

  if (!item) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === item.owner_id

  const conditionMap: Record<string, { label: string; color: string; bg: string }> = {
    new:      { label: 'New',      color: '#2ECC8F',  bg: 'var(--g-glow)' },
    like_new: { label: 'Like New', color: '#93C5FD',  bg: 'rgba(59,130,246,0.1)' },
    good:     { label: 'Good',     color: '#E2C07A',  bg: 'var(--au-glow)' },
    fair:     { label: 'Fair',     color: '#FDBA74',  bg: 'rgba(251,146,60,0.1)' },
  }
  const cond = conditionMap[item.condition] || conditionMap.good

  return (
    <>
      <style>{`
        .id-page { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .id-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .id-banner::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent); }
        .id-inner { max-width: 1100px; margin: 0 auto; padding: 32px 28px 60px; }
        .id-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .id-card { background: var(--bg-card); border: 1px solid var(--border-sub); border-radius: 22px; box-shadow: var(--shadow-md); }
        .id-img-wrap {
          aspect-ratio: 1; background: var(--bg-raised);
          border-radius: 22px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border-sub);
          position: relative;
        }
        .id-img-wrap::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(6,6,8,0.5)); pointer-events: none; }
        .id-info-pad { padding: 28px; }
        .id-meta-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .id-meta-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .id-price { font-size: 40px; font-weight: 900; color: #2ECC8F; letter-spacing: -0.05em; line-height: 1; }
        .id-price-unit { font-size: 14px; color: var(--tx-muted); font-weight: 400; margin-left: 4px; }
        .id-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
        .id-detail-item { background: var(--bg-raised); border: 1px solid var(--border-sub); border-radius: 13px; padding: 14px; }
        .id-detail-label { font-size: 10px; color: var(--tx-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 5px; }
        .id-detail-val { font-size: 13px; font-weight: 700; color: var(--tx-bright); margin: 0; }
        .id-owner-card { background: var(--bg-raised); border: 1px solid var(--border-sub); border-radius: 16px; padding: 18px; margin: 20px 0; }
        .id-rent-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 16px; font-weight: 800; font-size: 16px; border-radius: 14px; text-decoration: none; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; transition: all 0.25s; border: none; cursor: pointer; letter-spacing: -0.01em; }
        @media (max-width: 800px) { .id-grid { grid-template-columns: 1fr; } .id-inner { padding: 24px 20px 48px; } }
      `}</style>

      <div className="id-page">
        <div className="id-banner">
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <Link href="/items" style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-body)', textDecoration: 'none', flexShrink: 0 }}>
              <ArrowLeft size={17} strokeWidth={2} />
            </Link>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '5px' }}>
                {item.categories?.icon} {item.categories?.name}
              </p>
              <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.03em' }}>{item.title}</h1>
            </div>
          </div>
        </div>

        <div className="id-inner">
          <div className="id-grid">

            {/* Image */}
            <div className="id-img-wrap">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '96px', height: '96px', background: 'var(--bg-hover)', border: '1px solid var(--border-mid)', borderRadius: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CategoryIcon name={item.categories?.name || 'Other'} size={48} color="#22A876" />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="id-card id-info-pad">

                {/* Price + Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--tx-muted)', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px' }}>Price</p>
                    <div>
                      <span className="id-price">₱{item.price_per_day}</span>
                      <span className="id-price-unit">/day</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', alignItems: 'flex-end' }}>
                    <span className="id-meta-pill" style={{ background: cond.bg, color: cond.color, border: `1px solid ${cond.color}30` }}>
                      {cond.label}
                    </span>
                    <span className="id-meta-pill" style={{ background: item.status === 'available' ? 'var(--g-glow)' : 'rgba(239,68,68,0.1)', color: item.status === 'available' ? '#2ECC8F' : '#FCA5A5', border: `1px solid ${item.status === 'available' ? 'rgba(34,168,118,0.25)' : 'rgba(239,68,68,0.2)'}` }}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="id-detail-grid">
                  <div className="id-detail-item">
                    <p className="id-detail-label">Location</p>
                    <p className="id-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={12} color="#22A876" strokeWidth={2} />
                      {item.location || 'Not specified'}
                    </p>
                  </div>
                  <div className="id-detail-item">
                    <p className="id-detail-label">Category</p>
                    <p className="id-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Tag size={12} color="#22A876" strokeWidth={2} />
                      {item.categories?.name}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-sub)', borderRadius: '14px', padding: '16px', marginBottom: '18px' }}>
                    <p style={{ fontSize: '10px', color: 'var(--tx-muted)', fontWeight: '800', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px' }}>Description</p>
                    <p style={{ fontSize: '14px', color: 'var(--tx-body)', lineHeight: '1.75', margin: 0 }}>{item.description}</p>
                  </div>
                )}

                {/* Owner */}
                <div className="id-owner-card">
                  <p style={{ fontSize: '10px', color: 'var(--tx-muted)', fontWeight: '800', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '12px' }}>Listed by</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, var(--g-dark), var(--g-rich))', border: '1px solid rgba(34,168,118,0.25)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22A876', fontWeight: '900', fontSize: '18px', flexShrink: 0 }}>
                      {item.profiles?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 3px', letterSpacing: '-0.01em' }}>{item.profiles?.full_name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>College Student</p>
                    </div>
                    {item.profiles?.trust_score > 0 && (
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '999px' }}>
                        <Star size={11} fill="#C9A84C" color="#C9A84C" />
                        <span style={{ fontSize: '12px', color: 'var(--au-light)', fontWeight: '800' }}>{item.profiles.trust_score}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                {isOwner ? (
                  <Link href={`/items/${item.id}/edit`} className="id-rent-btn" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-mid)', color: 'var(--tx-body)' }}>
                    ✏️ Edit This Item
                  </Link>
                ) : item.status === 'available' && user ? (
                  <Link href={`/rentals/new?item=${item.id}`} className="id-rent-btn btn-gold" style={{ fontSize: '15px', padding: '16px' }}>
                    🏷️ Request to Rent
                  </Link>
                ) : !user ? (
                  <Link href="/auth/login" className="id-rent-btn btn-green" style={{ fontSize: '15px', padding: '16px' }}>
                    Sign in to Rent
                  </Link>
                ) : (
                  <div className="id-rent-btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-sub)', color: 'var(--tx-muted)', cursor: 'default' }}>
                    Not Available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}