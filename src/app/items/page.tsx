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
        body { background-color: #0A0A0A; }
        .items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .item-card {
          background: #111111; border: 1px solid #1C1C1C;
          border-radius: 18px; overflow: hidden;
          transition: all 0.25s; cursor: pointer;
          text-decoration: none; display: block;
        }
        .item-card:hover {
          border-color: rgba(46,204,143,0.25);
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(46,204,143,0.1);
        }
        .item-card:hover .item-card-img { background: #1C1C1C; }
        .item-card-img {
          height: 180px; background: #161616;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          border-bottom: 1px solid #1C1C1C;
          transition: background 0.2s;
        }
        .item-card-cat-badge {
          position: absolute; top: 12px; left: 12px;
          background: rgba(10,10,10,0.85);
          border: 1px solid #2E2E2E;
          border-radius: 8px; padding: 4px 10px;
          font-size: 11px; font-weight: 600; color: #A3A3A3;
          backdrop-filter: blur(8px);
        }
        .search-input {
          flex: 1; min-width: 180px;
          background: #111111; border: 1px solid #1C1C1C;
          border-radius: 12px; padding: 12px 16px 12px 42px;
          font-size: 14px; color: #F0F0F0; outline: none;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: #606060; }
        .search-input:focus { border-color: rgba(46,204,143,0.4); }
        .filter-select {
          background: #111111; border: 1px solid #1C1C1C;
          border-radius: 12px; padding: 12px 14px 12px 34px;
          font-size: 14px; color: #A3A3A3; outline: none;
          cursor: pointer; min-width: 160px;
          transition: border-color 0.2s;
        }
        .filter-select:focus { border-color: rgba(46,204,143,0.4); }
        .clear-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 12px 16px; background: #111111;
          border: 1px solid #1C1C1C; border-radius: 12px;
          font-size: 13px; color: #A3A3A3;
          cursor: pointer; font-weight: '600';
          transition: all 0.2s;
        }
        .clear-btn:hover { border-color: #2E2E2E; color: #F0F0F0; background: #1C1C1C; }
        @media (max-width: 900px) { .items-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .items-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', fontFamily: 'system-ui, sans-serif', color: '#F0F0F0' }}>

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0A2118 0%, #0F3D2E 60%, #0A0A0A 100%)', padding: '48px 24px 56px', borderBottom: '1px solid #1C1C1C', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,143,0.07), transparent)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#2ECC8F', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>Marketplace</p>
                <h1 style={{ fontSize: 'clamp(24px,5vw,34px)', fontWeight: '900', color: '#F0F0F0', margin: 0, letterSpacing: '-0.03em' }}>Browse Items</h1>
              </div>
              <Link href="/items/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 20px',
                background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)',
                border: '1px solid rgba(46,204,143,0.3)',
                color: '#2ECC8F', fontWeight: '600', borderRadius: '12px',
                textDecoration: 'none', fontSize: '13px',
                transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}>
                <PlusCircle size={15} strokeWidth={2} /> List an Item
              </Link>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Search size={16} color="#606060" strokeWidth={2} />
                </div>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="search-input" />
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <SlidersHorizontal size={15} color="#606060" strokeWidth={2} />
                </div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
                  <option value="" style={{ background: '#111111' }}>All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={{ background: '#111111' }}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {(search || selectedCategory) && (
                <button onClick={() => { setSearch(''); setSelectedCategory('') }} className="clear-btn">
                  <X size={14} strokeWidth={2.5} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>
          <p style={{ fontSize: '13px', color: '#606060', marginBottom: '20px', fontWeight: '500' }}>
            {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} available`}
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#606060' }}>
              <div style={{ width: '48px', height: '48px', background: '#1C1C1C', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Package size={24} color="#606060" strokeWidth={1.5} />
              </div>
              Loading items...
            </div>
          ) : items.length > 0 ? (
            <div className="items-grid">
              {items.map((item: any) => (
                <Link href={`/items/${item.id}`} key={item.id} className="item-card">
                  <div className="item-card-img">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '64px', height: '64px', background: '#1C1C1C', border: '1px solid #2E2E2E', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CategoryIcon name={item.categories?.name || 'Other'} size={30} color="#2ECC8F" />
                      </div>
                    )}
                    <span className="item-card-cat-badge">{item.categories?.name}</span>
                  </div>

                  <div style={{ padding: '18px' }}>
                    <p style={{ fontWeight: '700', fontSize: '15px', color: '#F0F0F0', margin: '0 0 6px' }}>{item.title}</p>
                    {item.description && (
                      <p style={{ fontSize: '12px', color: '#606060', margin: '0 0 14px', lineHeight: '1.6', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #1C1C1C' }}>
                      <div>
                        <span style={{ fontSize: '22px', fontWeight: '800', color: '#2ECC8F', letterSpacing: '-0.02em' }}>₱{item.price_per_day}</span>
                        <span style={{ fontSize: '11px', color: '#606060' }}>/day</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: '#A3A3A3', margin: 0, fontWeight: '500' }}>{item.profiles?.full_name}</p>
                        {item.profiles?.trust_score > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', marginTop: '3px' }}>
                            <Star size={10} fill="#F59E0B" color="#F59E0B" strokeWidth={1} />
                            <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: '700' }}>{item.profiles.trust_score}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ background: '#111111', borderRadius: '20px', border: '1px solid #1C1C1C', padding: '80px 24px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: '#1C1C1C', border: '1px solid #2E2E2E', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Package size={28} color="#606060" strokeWidth={1.5} />
              </div>
              <p style={{ fontWeight: '700', fontSize: '18px', color: '#A3A3A3', marginBottom: '8px' }}>No items found</p>
              <p style={{ fontSize: '13px', color: '#606060', marginBottom: '24px' }}>
                {search || selectedCategory ? 'Try a different search or category' : 'Be the first to list an item!'}
              </p>
              <Link href="/items/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)', border: '1px solid rgba(46,204,143,0.3)', color: '#2ECC8F', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '13px' }}>
                <PlusCircle size={15} strokeWidth={2} /> List an Item
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}