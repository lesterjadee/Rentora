import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ItemPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('items')
    .select(`
      *,
      profiles(id, full_name, trust_score, university),
      categories(name, icon)
    `)
    .eq('id', params.id)
    .single()

  if (!item) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === item.owner_id

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/items" className="text-gray-400 hover:text-white transition mb-6 inline-block">
          ← Back to Items
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-full h-80 object-cover" />
            ) : (
              <div className="w-full h-80 flex items-center justify-center">
                <p className="text-8xl">📦</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-sm bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                {item.categories?.icon} {item.categories?.name}
              </span>
              <h1 className="text-2xl font-bold text-white mt-2">{item.title}</h1>
              <p className="text-3xl font-bold text-[#26619C] mt-2">
                ₱{item.price_per_day}<span className="text-lg text-gray-400">/day</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-xs">Condition</p>
                <p className="text-white capitalize">{item.condition?.replace('_', ' ')}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-xs">Status</p>
                <p className={`capitalize ${item.status === 'available' ? 'text-green-400' : 'text-red-400'}`}>
                  {item.status}
                </p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-xs">Location</p>
                <p className="text-white">{item.location || 'Not specified'}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-xs">Owner</p>
                <p className="text-white">{item.profiles?.full_name}</p>
              </div>
            </div>

            {item.description && (
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-xs mb-1">Description</p>
                <p className="text-gray-300">{item.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwner ? (
                <>
                  <Link
                    href={`/items/${item.id}/edit`}
                    className="flex-1 text-center py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                  >
                    Edit Item
                  </Link>
                </>
              ) : (
                item.status === 'available' && user && (
                  <Link
                    href={`/rentals/new?item=${item.id}`}
                    className="flex-1 text-center py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition"
                  >
                    Request to Rent
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}