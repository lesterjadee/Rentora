'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewItemPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [condition, setCondition] = useState('good')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    let imageUrl = ''

    // Upload image if selected
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(fileName, image)

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('items')
        .getPublicUrl(fileName)

      imageUrl = urlData.publicUrl
    }

    // Insert item
    const { error: insertError } = await supabase.from('items').insert({
      owner_id: user.id,
      title,
      description,
      price_per_day: parseFloat(pricePerDay),
      condition,
      category_id: categoryId ? parseInt(categoryId) : null,
      location,
      image_url: imageUrl || null,
      status: 'available'
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/items')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/items" className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-[#26619C]">List an Item</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 p-6 rounded-2xl border border-gray-800">

          {/* Image Upload */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Item Photo</label>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-[#26619C] transition">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2" />
              ) : (
                <p className="text-gray-500 text-4xl mb-2">📷</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-gray-400 text-sm"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Item Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Scientific Calculator Casio fx-991"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your item..."
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C] resize-none"
            />
          </div>

          {/* Category & Condition */}
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

          {/* Price & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Price per Day (₱) *</label>
              <input
                type="number"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                required
                min="1"
                placeholder="e.g. 50"
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Engineering Building"
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Listing item...' : 'List Item'}
          </button>
        </form>
      </div>
    </main>
  )
}