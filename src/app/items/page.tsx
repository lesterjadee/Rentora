import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ItemsPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('items')
    .select(`
      *,
      profiles(full_name, trust_score),
      categories(name, icon)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#26619C]">Browse Items</h1>
            <p className="text-gray-400 mt-1">Find items to rent from fellow students</p>
          </div>
          <Link
            href="/items/new"
            className="px-4 py-2 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition"
          >
            + List an Item
          </Link>
        </div>

        {/* Items Grid */}
        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <Link href={`/items/${item.id}`} key={item.id}>
                <div className="bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition cursor-pointer overflow-hidden">
                  {/* Image */}
                  <div className="h-48 bg-gray-800 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-gray-600 text-4xl">📦</p>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {item.categories?.icon} {item.categories?.name}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {item.condition?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mt-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[#26619C] font-bold">
                        ₱{item.price_per_day}/day
                      </p>
                      <p className="text-gray-500 text-xs">
                        {item.profiles?.full_name}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-gray-400 text-xl">No items available yet</p>
            <p className="text-gray-500 mt-2">Be the first to list an item!</p>
            <Link
              href="/items/new"
              className="inline-block mt-6 px-6 py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition"
            >
              List an Item
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}