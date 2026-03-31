import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Get popular items (most rental requests)
  const { data: popularItems } = await supabase
    .from('items')
    .select(`
      *,
      profiles(full_name, trust_score),
      categories(name, icon)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)

  // 2. Get user's rental history to find preferred categories
  let recommendedItems: any[] = []
  let preferredCategory: any = null

  if (user) {
    const { data: myRentals } = await supabase
      .from('rentals')
      .select(`items(category_id, categories(name, icon))`)
      .eq('renter_id', user.id)
      .limit(10)

    if (myRentals && myRentals.length > 0) {
      // Count category frequency
      const categoryCount: Record<string, number> = {}
      myRentals.forEach((rental: any) => {
        const catId = rental.items?.category_id
        if (catId) {
          categoryCount[catId] = (categoryCount[catId] || 0) + 1
        }
      })

      // Find most rented category
      const topCategoryId = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0]

      if (topCategoryId) {
        // Get items from that category
        const { data: catItems } = await supabase
          .from('items')
          .select(`*, profiles(full_name, trust_score), categories(name, icon)`)
          .eq('status', 'available')
          .eq('category_id', topCategoryId)
          .neq('owner_id', user.id)
          .limit(6)

        if (catItems && catItems.length > 0) {
          recommendedItems = catItems
          preferredCategory = catItems[0]?.categories
        }
      }
    }
  }

  // 3. Get highly trusted owner items
  const { data: trustedItems } = await supabase
    .from('items')
    .select(`*, profiles(full_name, trust_score), categories(name, icon)`)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)

  const ItemCard = ({ item }: { item: any }) => (
    <Link href={`/items/${item.id}`}>
      <div className="bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition cursor-pointer overflow-hidden">
        <div className="h-40 bg-gray-800 flex items-center justify-center">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <p className="text-gray-600 text-4xl">📦</p>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
              {item.categories?.icon} {item.categories?.name}
            </span>
          </div>
          <h3 className="font-semibold text-white text-sm mt-1">{item.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[#26619C] font-bold text-sm">₱{item.price_per_day}/day</p>
            <div className="text-right">
              <p className="text-gray-500 text-xs">{item.profiles?.full_name}</p>
              {item.profiles?.trust_score > 0 && (
                <p className="text-yellow-400 text-xs">⭐ {item.profiles?.trust_score}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#26619C]">Recommendations</h1>
            <p className="text-gray-400 mt-1">Items picked just for you</p>
          </div>
          <Link
            href="/items"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition"
          >
            Browse All Items
          </Link>
        </div>

        {/* Personalized Recommendations */}
        {user && recommendedItems.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-white">
                🎯 Based on Your History
              </h2>
              {preferredCategory && (
                <span className="text-sm bg-[#26619C]/20 text-[#26619C] px-3 py-1 rounded-full">
                  {preferredCategory.icon} {preferredCategory.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedItems.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Popular Items */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">🔥 Recently Listed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularItems?.map((item: any) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Trusted Owners */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">⭐ From Trusted Owners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustedItems
              ?.filter((item: any) => item.profiles?.trust_score > 0)
              .map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            {trustedItems?.filter((item: any) => item.profiles?.trust_score > 0).length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-400">No reviewed owners yet — be the first to complete a rental!</p>
              </div>
            )}
          </div>
        </div>

        {/* Browse by Category */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">📂 Browse by Category</h2>
          <CategoryBrowser supabase={supabase} />
        </div>

      </div>
    </main>
  )
}

async function CategoryBrowser({ supabase }: { supabase: any }) {
  const { data: categories } = await supabase.from('categories').select('*')

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {categories?.map((cat: any) => (
        <Link
          key={cat.id}
          href={`/items?category=${cat.id}`}
          className="p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition text-center"
        >
          <p className="text-3xl mb-2">{cat.icon}</p>
          <p className="text-gray-300 text-sm font-semibold">{cat.name}</p>
        </Link>
      ))}
    </div>
  )
}