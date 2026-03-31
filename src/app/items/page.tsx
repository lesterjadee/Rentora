'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ItemsPage() {
  const supabase = createClient()

  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchItems()
  }, [])

  useEffect(() => {
    fetchItems()
  }, [search, selectedCategory])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchItems = async () => {
    setLoading(true)
    let query = supabase
      .from('items')
      .select(`*, profiles(full_name, trust_score), categories(name, icon)`)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }

    const { data } = await query
    if (data) setItems(data)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {(search || selectedCategory) && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory('') }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Loading items...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <Link href={`/items/${item.id}`} key={item.id}>
                <div className="bg-gray-900 rounded-xl border border-gray-800 hover:border-[#26619C] transition cursor-pointer overflow-hidden">
                  <div className="h-48 bg-gray-800 flex items-center justify-center">
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
                      <span className="text-xs text-gray-500 capitalize">
                        {item.condition?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mt-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[#26619C] font-bold">₱{item.price_per_day}/day</p>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-gray-400 text-xl">No items found</p>
            <p className="text-gray-500 mt-2">
              {search || selectedCategory ? 'Try a different search or category' : 'Be the first to list an item!'}
            </p>
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