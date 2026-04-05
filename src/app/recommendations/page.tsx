import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: popularItems } = await supabase
    .from('items').select(`*, profiles(full_name, trust_score), categories(name, icon)`)
    .eq('status', 'available').order('created_at', { ascending: false }).limit(6)

  let recommendedItems: any[] = []
  let preferredCategory: any = null

  if (user) {
    const { data: myRentals } = await supabase
      .from('rentals').select(`items(category_id, categories(name, icon))`)
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
          .from('items').select(`*, profiles(full_name, trust_score), categories(name, icon)`)
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
    <Link href={`/items/${item.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
        <div style={{ height: '150px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '44px' }}>{item.categories?.icon || '📦'}</span>
          )}
          <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', fontWeight: '600', color: '#374151' }}>
            {item.categories?.name}
          </span>
        </div>
        <div style={{ padding: '14px' }}>
          <p style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', margin: '0 0 8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.title}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={{ fontSize: '18px', fontWeight: '800', color: '#26619C' }}>₱{item.price_per_day}</span><span style={{ fontSize: '11px', color: '#94a3b8' }}>/day</span></div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{item.profiles?.full_name}</p>
              {item.profiles?.trust_score > 0 && <p style={{ fontSize: '11px', color: '#d97706', margin: '2px 0 0', fontWeight: '700' }}>★ {item.profiles.trust_score}</p>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <>
      <style>{`
        .rec-items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .rec-cat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        @media (max-width: 768px) {
          .rec-items-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .rec-cat-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
        }
        @media (max-width: 480px) {
          .rec-items-grid { grid-template-columns: repeat(2, 1fr); }
          .rec-cat-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Personalized</p>
              <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '800', color: '#ffffff', margin: 0 }}>For You</h1>
            </div>
            <Link href="/items" style={{ padding: '10px 22px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>Browse All →</Link>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>

          {recommendedItems.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ width: '4px', height: '22px', backgroundColor: '#7c3aed', borderRadius: '999px', flexShrink: 0 }} />
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Based on Your History</h2>
                {preferredCategory && (
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '999px', border: '1px solid #ddd6fe' }}>
                    {preferredCategory.icon} {preferredCategory.name}
                  </span>
                )}
              </div>
              <div className="rec-items-grid">
                {recommendedItems.map((item: any) => <ItemCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '4px', height: '22px', backgroundColor: '#26619C', borderRadius: '999px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recently Listed</h2>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#26619C', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '999px' }}>{popularItems?.length}</span>
            </div>
            <div className="rec-items-grid">
              {popularItems?.map((item: any) => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '4px', height: '22px', backgroundColor: '#0891b2', borderRadius: '999px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Browse by Category</h2>
            </div>
            <div className="rec-cat-grid">
              {categories?.map((cat: any) => (
                <Link key={cat.id} href={`/items?category=${cat.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e8edf2', padding: '16px 10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <p style={{ fontSize: '24px', marginBottom: '6px' }}>{cat.icon}</p>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#374151', margin: 0, lineHeight: '1.3' }}>{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}