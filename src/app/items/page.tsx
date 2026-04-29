'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, SlidersHorizontal, PlusCircle, X, Package, Star } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcon'

export default function ItemsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCategories(); fetchItems() }, [])
  useEffect(() => { fetchItems() }, [search, selectedCategory])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchItems = async () => {
    setLoading(true)
    let query = supabase.from('items')
      .select('*, profiles(full_name, trust_score), categories(name, icon)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
    if (search) query = query.ilike('title', `%${search}%`)
    if (selectedCategory) query = query.eq('category_id', selectedCategory)
    const { data } = await query
    if (data) setItems(data)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        .items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 900px) { .items-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
        @media (max-width: 480px) { .items-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' as const, gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Marketplace</p>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Browse Items</h1>
              </div>
              <Link href="/items/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff', fontWeight: '600', borderRadius: '12px',
                textDecoration: 'none', fontSize: '14px',
                border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' as const
              }}>
                <PlusCircle size={16} strokeWidth={2} />
                List an Item
              </Link>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
              <div style={{ flex: 1, minWidth: '180px', position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' as const }}>
                  <Search size={16} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                </div>
                <input
                  type="text" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items..."
                  style={{
                    width: '100%', padding: '12px 16px 12px 42px',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px', fontSize: '14px', color: '#ffffff',
                    outline: 'none', boxSizing: 'border-box' as const
                  }}
                />
              </div>

              <div style={{ position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' as const }}>
                  <SlidersHorizontal size={15} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '12px 14px 12px 34px',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px', fontSize: '14px', color: '#ffffff',
                    outline: 'none', cursor: 'pointer', minWidth: '160px'
                  }}
                >
                  <option value="" style={{ color: '#0f172a', backgroundColor: '#fff' }}>All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={{ color: '#0f172a', backgroundColor: '#fff' }}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {(search || selectedCategory) && (
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px', fontSize: '14px', color: '#ffffff',
                    cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  <X size={14} strokeWidth={2.5} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '18px', fontWeight: '500' }}>
            {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} available`}
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>Loading items...</div>
          ) : items.length > 0 ? (
            <div className="items-grid">
              {items.map((item: any) => (
                <Link href={`/items/${item.id}`} key={item.id} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: '#ffffff', borderRadius: '18px',
                    border: '1px solid #e8edf2', overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer'
                  }}>
                    {/* Image */}
                    <div style={{
                      height: '170px', backgroundColor: '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative' as const, overflow: 'hidden'
                    }}>
                      {item.image_url ? (
                        <img
                          src={item.image_url} alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                        />
                      ) : (
                        <div style={{
                          width: '64px', height: '64px', backgroundColor: '#eff6ff',
                          borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <CategoryIcon name={item.categories?.name || 'Other'} size={32} color="#26619C" />
                        </div>
                      )}
                      <span style={{
                        position: 'absolute' as const, top: '12px', left: '12px',
                        backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px',
                        padding: '4px 10px', fontSize: '11px', fontWeight: '600', color: '#374151',
                        border: '1px solid #f1f5f9'
                      }}>
                        {item.categories?.name}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px 18px' }}>
                      <p style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', margin: '0 0 6px' }}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p style={{
                          fontSize: '13px', color: '#94a3b8', margin: '0 0 14px', lineHeight: '1.5',
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any
                        }}>{item.description}</p>
                      )}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: '12px', borderTop: '1px solid #f8fafc'
                      }}>
                        <div>
                          <span style={{ fontSize: '22px', fontWeight: '800', color: '#26619C' }}>
                            ₱{item.price_per_day}
                          </span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>/day</span>
                        </div>
                        <div style={{ textAlign: 'right' as const }}>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: '500' }}>
                            {item.profiles?.full_name}
                          </p>
                          {item.profiles?.trust_score > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', marginTop: '2px' }}>
                              <Star size={11} fill="#d97706" color="#d97706" strokeWidth={1} />
                              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '700' }}>
                                {item.profiles.trust_score}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: '#ffffff', borderRadius: '20px',
              border: '1px solid #e8edf2', padding: '80px 24px', textAlign: 'center'
            }}>
              <div style={{
                width: '64px', height: '64px', backgroundColor: '#f8fafc',
                borderRadius: '18px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <Package size={28} color="#94a3b8" strokeWidth={1.5} />
              </div>
              <p style={{ fontWeight: '700', fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>No items found</p>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '28px' }}>
                {search || selectedCategory ? 'Try a different search or category' : 'Be the first to list an item!'}
              </p>
              <Link href="/items/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #1a3a5c, #26619C)',
                color: '#ffffff', fontWeight: '600', borderRadius: '12px',
                textDecoration: 'none', fontSize: '14px'
              }}>
                <PlusCircle size={16} strokeWidth={2} /> List an Item
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}