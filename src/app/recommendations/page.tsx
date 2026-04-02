import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: popularItems } = await supabase
    .from('items')
    .select(`*, profiles(full_name, trust_score), categories(name, icon)`)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)

  let recommendedItems: any[] = []
  let preferredCategory: any = null

  if (user) {
    const { data: myRentals } = await supabase
      .from('rentals')
      .select(`items(category_id, categories(name, icon))`)
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
          .from('items')
          .select(`*, profiles(full_name, trust_score), categories(name, icon)`)
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
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px',
        border: '1px solid #e8edf2', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer', transition: 'all 0.2s'
      }}>
        <div style={{ height: '150px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '44px' }}>📦</span>
          )}
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px',
            padding: '3px 8px', fontSize: '11px', fontWeight: '600', color: '#374151'
          }}>{item.categories?.icon} {item.categories?.name}</span>
        </div>
        <div style={{ padding: '14px' }}>
          <p style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', margin: '0 0 8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.title}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#26619C' }}>₱{item.price_per_day}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>/day</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{item.profiles?.full_name}</p>
              {item.profiles?.trust_score > 0 && (
                <p style={{ fontSize: '11px', color: '#d97706', margin: '2px 0 0', fontWeight: '700' }}>★ {item.profiles.trust_score}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  const SectionHeader = ({ title, count, color }: { title: string, count?: number, color: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{ width: '4px', height: '24px', backgroundColor: color, borderRadius: '999px' }} />
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{title}</h2>
      {count !== undefined && (
        <span style={{ fontSize: '13px', fontWeight: '600', color, backgroundColor: `${color}15`, padding: '3px 10px', borderRadius: '999px' }}>{count}</span>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Personalized</p>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>For You</h1>
          </div>
          <Link href="/items" style={{
            padding: '10px 22px', backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#ffffff', fontWeight: '600', borderRadius: '12px',
            textDecoration: 'none', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)'
          }}>Browse All →</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Personalized */}
        {recommendedItems.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '4px', height: '24px', backgroundColor: '#7c3aed', borderRadius: '999px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Based on Your History</h2>
              {preferredCategory && (
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '4px 12px', borderRadius: '999px', border: '1px solid #ddd6fe' }}>
                  {preferredCategory.icon} {preferredCategory.name}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {recommendedItems.map((item: any) => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {/* Recently Listed */}
        <div style={{ marginBottom: '40px' }}>
          <SectionHeader title="Recently Listed" count={popularItems?.length} color="#26619C" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {popularItems?.map((item: any) => <ItemCard key={item.id} item={item} />)}
          </div>
        </div>

        {/* Browse by Category */}
        <div>
          <SectionHeader title="Browse by Category" color="#0891b2" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {categories?.map((cat: any) => (
              <Link key={cat.id} href={`/items?category=${cat.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#ffffff', borderRadius: '14px',
                  border: '1px solid #e8edf2', padding: '20px',
                  textAlign: 'center', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s'
                }}>
                  <p style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</p>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', margin: 0 }}>{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}