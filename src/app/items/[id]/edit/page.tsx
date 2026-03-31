'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [condition, setCondition] = useState('good')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('available')
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: item }, { data: cats }] = await Promise.all([
        supabase.from('items').select('*').eq('id', params.id).single(),
        supabase.from('categories').select('*')
      ])

      if (item) {
        setTitle(item.title)
        setDescription(item.description || '')
        setPricePerDay(item.price_per_day.toString())
        setCondition(item.condition)
        setCategoryId(item.category_id?.toString() || '')
        setLocation(item.location || '')
        setStatus(item.status)
      }
      if (cats) setCategories(cats)
    }
    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('items')
      .update({
        title,
        description,
        price_per_day: parseFloat(pricePerDay),
        condition,
        category_id: categoryId ? parseInt(categoryId) : null,
        location,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/items/${params.id}`)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return

    await supabase.from('items').delete().eq('id', params.id)
    router.push('/items')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/items/${params.id}`} className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-[#26619C]">Edit Item</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Price per Day (₱) *</label>
              <input
                type="number"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}