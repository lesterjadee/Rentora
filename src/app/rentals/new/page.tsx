'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Suspense } from 'react'

function RentalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get('item')
  const supabase = createClient()

  const [item, setItem] = useState<any>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!itemId) return
    const fetchItem = async () => {
      const { data } = await supabase
        .from('items')
        .select('*, profiles(full_name)')
        .eq('id', itemId)
        .single()
      if (data) setItem(data)
    }
    fetchItem()
  }, [itemId])

  useEffect(() => {
    if (startDate && endDate && item) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        setTotalPrice(days * item.price_per_day)
      } else {
        setTotalPrice(0)
      }
    }
  }, [startDate, endDate, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start < today) {
      setError('Start date cannot be in the past')
      setLoading(false)
      return
    }

    if (end <= start) {
      setError('End date must be after start date')
      setLoading(false)
      return
    }

    // Check for overlapping rentals
    const { data: existing } = await supabase
      .from('rentals')
      .select('id')
      .eq('item_id', itemId)
      .in('status', ['approved', 'active'])
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    if (existing && existing.length > 0) {
      setError('This item is already booked for the selected dates')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('rentals').insert({
      item_id: itemId,
      renter_id: user.id,
      owner_id: item.owner_id,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      message,
      status: 'pending'
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/rentals')
    router.refresh()
  }

  if (!item) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Loading item...</p>
    </main>
  )

  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/items/${itemId}`} className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-[#26619C]">Request to Rent</h1>
        </div>

        {/* Item Summary */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6 flex gap-4">
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Item</p>
            <p className="font-semibold text-white">{item.title}</p>
            <p className="text-[#26619C] font-bold mt-1">₱{item.price_per_day}/day</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Owner</p>
            <p className="text-white text-sm">{item.profiles?.full_name}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 p-6 rounded-2xl border border-gray-800">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                required
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                required
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C]"
              />
            </div>
          </div>

          {/* Price Preview */}
          {totalPrice > 0 && (
            <div className="p-4 bg-[#26619C]/10 border border-[#26619C]/30 rounded-lg">
              <p className="text-gray-400 text-sm">Total Price</p>
              <p className="text-2xl font-bold text-[#26619C]">₱{totalPrice.toFixed(2)}</p>
              <p className="text-gray-500 text-xs mt-1">
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days × ₱{item.price_per_day}/day
              </p>
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm mb-1">Message to Owner (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Tell the owner why you need this item..."
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-[#26619C] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || totalPrice === 0}
            className="w-full py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Sending request...' : `Request Rental — ₱${totalPrice.toFixed(2)}`}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function NewRentalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
      <RentalForm />
    </Suspense>
  )
}