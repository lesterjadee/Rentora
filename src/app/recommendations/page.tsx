import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcon'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: popularItems } = await supabase
    .from('items').select('*, profiles(full_name, trust_score), categories(name, icon)')
    .eq('status', 'available').order('created_at', { ascending: false }).limit(6)

  let recommendedItems: any[] = []
  let preferredCategory: any = null

  if (user) {
    const { data: myRentals } = await supabase
      .from('rentals').select('items(category_id, categories(name, icon))')
      .eq('renter_id', user.id).limit(10)

    if (myRentals && myRentals.length > 0) {
      const categoryCount: Record<string, number> = {}
      myRentals.forEach((rental: any) => {
        const catId = rental.items?.category_id
        if (catId) categoryCount[catId] = (categoryCount[catId] || 0) + 1
      })
      const topCategoryId = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0]
      if (topCategoryId) {
        const { data: catItems } = await supabase
          .from('items').select('*, profiles(full_name, trust_score), categories(name, icon)')
          .eq('status', 'available').eq('category_id', topCategoryId)
          .neq('owner_id', user.id).limit(6)
        if (catItems && catItems.length > 0) {
          recommendedItems = catItems
          preferredCategory = catItems[0]?.categories
        }
      }
    }
  }

  const { data: categories } = await supabase.from('categories').select('*')

  const ItemCard = ({ item }: { item: any }) => (
    <Link href={`/items/${item.id}`} className="rec-item-card">
      <div className="rec-item-img">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="rec-item-icon">
            <CategoryIcon name={item.categories?.name || 'Other'} size={30} color="#22A876" />
          </div>
        )}
        <span className="rec-item-cat">{item.categories?.name}</span>
      </div>
      <div className="rec-item-body">
        <p className="rec-item-title">{item.title}</p>
        <div className="rec-item-footer">
          <div>
            <span className="rec-item-price">₱{item.price_per_day}</span>
            <span className="rec-item-per">/day</span>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <p className="rec-item-owner">{item.profiles?.full_name}</p>
            {item.profiles?.trust_score > 0 && (
              <div className="rec-item-trust">
                <Star size={9} fill="#C9A84C" color="#C9A84C" strokeWidth={1} />
                <span>{item.profiles.trust_score}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <>
      <style>{`
        .rec { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rec-banner {
          position: relative; overflow: hidden;
          padding: 52px 28px 56px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .rec-banner::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent); }
        .rec-inner { max-width: 1280px; margin: 0 auto; padding: 32px 28px 60px; }
        .rec-section { margin-bottom: 48px; }
        .rec-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
        .rec-section-bar { width: 3px; height: 22px; border-radius: 999px; flex-shrink: 0; }
        .rec-section-title { font-size: 18px; font-weight: 800; color: var(--tx-bright); margin: 0; letter-spacing: -0.03em; }
        .rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .rec-item-card {
          text-decoration: none; display: block;
          background: var(--bg-card); border: 1px solid var(--border-sub);
          border-radius: 18px; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: var(--shadow-sm);
        }
        .rec-item-card:hover {
          border-color: rgba(201,168,76,0.2);
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(201,168,76,0.06);
        }
        .rec-item-img {
          height: 150px; background: var(--bg-raised);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          border-bottom: 1px solid var(--border-sub);
        }
        .rec-item-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(6,6,8,0.5)); pointer-events: none; }
        .rec-item-icon { width: 60px; height: 60px; background: var(--bg-hover); border: 1px solid var(--border-sub); border-radius: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .rec-item-card:hover .rec-item-icon { background: var(--g-glow); border-color: rgba(34,168,118,0.2); }
        .rec-item-cat { position: absolute; top: 10px; left: 10px; z-index: 2; background: rgba(6,6,8,0.75); border: 1px solid var(--border-mid); border-radius: 7px; padding: 4px 10px; font-size: 10px; font-weight: 700; color: var(--tx-muted); backdrop-filter: blur(12px); transition: all 0.2s; }
        .rec-item-card:hover .rec-item-cat { border-color: rgba(201,168,76,0.2); color: var(--tx-bright); }
        .rec-item-body { padding: 14px 16px; }
        .rec-item-title { font-weight: 800; font-size: 13px; color: var(--tx-bright); margin: 0 0 10px; letter-spacing: -0.01em; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .rec-item-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-dim); }
        .rec-item-price { font-size: 18px; font-weight: 900; color: #2ECC8F; letter-spacing: -0.03em; }
        .rec-item-per { font-size: 10px; color: var(--tx-muted); }
        .rec-item-owner { font-size: 10px; color: var(--tx-muted); margin: 0; font-weight: 600; }
        .rec-item-trust { display: flex; align-items: center; gap: 3px; margin-top: 3px; background: var(--au-glow); border: 1px solid rgba(201,168,76,0.15); border-radius: 999px; padding: 2px 7px; justify-content: flex-end; }
        .rec-item-trust span { font-size: 10px; color: var(--au-light); font-weight: 800; }
        .rec-cat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .rec-cat-card {
          background: var(--bg-card); border: 1px solid var(--border-sub);
          border-radius: 16px; padding: 18px 10px;
          text-align: center; text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          display: block;
        }
        .rec-cat-card:hover { border-color: rgba(34,168,118,0.25); background: var(--bg-hover); transform: translateY(-2px); box-shadow: var(--shadow-md), 0 0 0 1px rgba(34,168,118,0.08); }
        .rec-cat-icon { font-size: 26px; margin-bottom: 8px; display: block; }
        .rec-cat-name { font-size: 11px; font-weight: 700; color: var(--tx-muted); line-height: 1.3; transition: color 0.2s; }
        .rec-cat-card:hover .rec-cat-name { color: var(--tx-bright); }
        @media (max-width: 1024px) { .rec-grid { grid-template-columns: repeat(2, 1fr); } .rec-cat-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 640px) { .rec-grid { grid-template-columns: 1fr 1fr; } .rec-cat-grid { grid-template-columns: repeat(3, 1fr); } .rec-inner { padding: 24px 20px 48px; } }
      `}</style>

      <div className="rec">
        <div className="rec-banner">
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '12px', position: 'relative' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22A876' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Personalized</span>
              </div>
              <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.04em' }}>For You</h1>
            </div>
            <Link href="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-sub)', color: 'var(--tx-muted)', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', whiteSpace: 'nowrap' as const }}>
              Browse All →
            </Link>
          </div>
        </div>

        <div className="rec-inner">

          {/* Based on History */}
          {recommendedItems.length > 0 && (
            <div className="rec-section">
              <div className="rec-section-head">
                <div className="rec-section-bar" style={{ background: '#C4B5FD', boxShadow: '0 0 8px rgba(167,139,250,0.4)' }} />
                <h2 className="rec-section-title">Based on Your History</h2>
                {preferredCategory && (
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#C4B5FD', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', padding: '4px 12px', borderRadius: '999px' }}>
                    {preferredCategory.icon} {preferredCategory.name}
                  </span>
                )}
              </div>
              <div className="rec-grid">
                {recommendedItems.map((item: any) => <ItemCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {/* Recently Listed */}
          <div className="rec-section">
            <div className="rec-section-head">
              <div className="rec-section-bar" style={{ background: '#2ECC8F', boxShadow: '0 0 8px rgba(34,168,118,0.4)' }} />
              <h2 className="rec-section-title">Recently Listed</h2>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#2ECC8F', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', padding: '3px 10px', borderRadius: '999px' }}>
                {popularItems?.length}
              </span>
            </div>
            <div className="rec-grid">
              {popularItems?.map((item: any) => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>

          {/* Browse by Category */}
          <div className="rec-section" style={{ marginBottom: 0 }}>
            <div className="rec-section-head">
              <div className="rec-section-bar" style={{ background: '#E2C07A', boxShadow: '0 0 8px rgba(201,168,76,0.4)' }} />
              <h2 className="rec-section-title">Browse by Category</h2>
            </div>
            <div className="rec-cat-grid">
              {categories?.map((cat: any) => (
                <Link key={cat.id} href={`/items?category=${cat.id}`} className="rec-cat-card">
                  <span className="rec-cat-icon">{cat.icon}</span>
                  <span className="rec-cat-name">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}