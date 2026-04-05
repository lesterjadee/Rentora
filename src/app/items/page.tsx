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

  useEffect(() => { fetchCategories(); fetchItems() }, [])
  useEffect(() => { fetchItems() }, [search, selectedCategory])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchItems = async () => {
    setLoading(true)
    let query = supabase.from('items').select(`*, profiles(full_name, trust_score), categories(name, icon)`).eq('status', 'available').order('created_at', { ascending: false })
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
        .search-bar { display: flex; gap: 12px; flex-wrap: wrap; }
        .search-bar input { flex: 1; min-width: 150px; }
        @media (max-width: 768px) {
          .items-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
        @media (max-width: 480px) {
          .items-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Marketplace</p>
                <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '800', color: '#ffffff', margin: 0 }}>Browse Items</h1>
              </div>
              <Link href="/items/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>+ List an Item</Link>
            </div>

            <div className="search-bar">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..."
                style={{ padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '14px', color: '#ffffff', outline: 'none', width: '100%' }}
              />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '14px', color: '#ffffff', outline: 'none', cursor: 'pointer', minWidth: '140px' }}>
                <option value="" style={{ color: '#0f172a', backgroundColor: '#fff' }}>All Categories</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id} style={{ color: '#0f172a', backgroundColor: '#fff' }}>{cat.icon} {cat.name}</option>)}
              </select>
              {(search || selectedCategory) && (
                <button onClick={() => { setSearch(''); setSelectedCategory('') }}
                  style={{ padding: '12px 18px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '14px', color: '#ffffff', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  Clear ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} available`}
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading items...</div>
          ) : items.length > 0 ? (
            <div className="items-grid">
              {items.map((item: any) => (
                <Link href={`/items/${item.id}`} key={item.id} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e8edf2', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                    <div style={{ height: '160px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
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
                      <p style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{item.title}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f8fafc' }}>
                        <div><span style={{ fontSize: '18px', fontWeight: '800', color: '#26619C' }}>₱{item.price_per_day}</span><span style={{ fontSize: '11px', color: '#94a3b8' }}>/day</span></div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{item.profiles?.full_name}</p>
                          {item.profiles?.trust_score > 0 && <p style={{ fontSize: '11px', color: '#d97706', margin: '2px 0 0', fontWeight: '700' }}>★ {item.profiles.trust_score}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2', padding: '60px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
              <p style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>No items found</p>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>{search || selectedCategory ? 'Try a different search or category' : 'Be the first to list an item!'}</p>
              <Link href="/items/new" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', color: '#ffffff', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}>List an Item →</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}