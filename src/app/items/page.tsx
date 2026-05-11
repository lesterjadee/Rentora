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
      .eq('status', 'available').order('created_at', { ascending: false })
    if (search) query = query.ilike('title', `%${search}%`)
    if (selectedCategory) query = query.eq('category_id', selectedCategory)
    const { data } = await query
    if (data) setItems(data)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        .browse { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .browse-banner {
          position: relative; overflow: hidden;
          padding: 48px 28px 56px;
          border-bottom: 1px solid rgba(92,219,149,0.1);
        }
        .browse-banner::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 100% -10%, rgba(92,219,149,0.07), transparent 55%);
          pointer-events: none;
        }
        .browse-banner::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent);
        }
        .browse-search-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
        .browse-search-box {
          flex: 1; min-width: 200px; position: relative;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px; overflow: hidden;
        }
        .browse-search-input {
          width: 100%; padding: 11px 16px 11px 42px !important;
          background: transparent !important; border: none !important;
          font-size: 14px; color: #F0FDF4 !important; outline: none;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          box-shadow: none !important;
        }
        .browse-search-input::placeholder { color: rgba(240,253,244,0.45) !important; }
        .browse-search-input:focus { border: none !important; box-shadow: none !important; }
        .browse-select {
          padding: 11px 14px 11px 36px !important;
          background: rgba(255,255,255,0.1) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 12px !important; font-size: 13px !important;
          color: #F0FDF4 !important; cursor: pointer; min-width: 160px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .browse-select option { background: var(--g-dark); color: #F0FDF4; }
        .browse-select:focus { border-color: rgba(127,255,196,0.35) !important; box-shadow: none !important; }
        .browse-clear-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 11px 16px; background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.25); border-radius: 12px;
          font-size: 13px; color: #FCA5A5; cursor: pointer; font-weight: 600;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif; transition: all 0.2s;
        }
        .browse-clear-btn:hover { background: rgba(239,68,68,0.22); }
        .items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .item-card {
          background: #FFFFFF; border: 1.5px solid rgba(27,77,62,0.1);
          border-radius: 20px; overflow: hidden;
          text-decoration: none; display: block;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: var(--shadow-sm); position: relative;
        }
        .item-card:hover {
          border-color: rgba(27,77,62,0.3);
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl), 0 0 0 1px rgba(27,77,62,0.08);
        }
        .item-img-wrap {
          height: 185px; background: var(--bg-raised);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          border-bottom: 1px solid rgba(27,77,62,0.08);
        }
        .item-img-wrap::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(7,24,18,0.06)); pointer-events: none; }
        .item-cat-badge {
          position: absolute; top: 12px; left: 12px; z-index: 2;
          background: rgba(255,255,255,0.95); border: 1px solid rgba(27,77,62,0.18);
          border-radius: 8px; padding: 4px 10px;
          font-size: 11px; font-weight: 700; color: var(--g-mid);
          backdrop-filter: blur(8px); transition: all 0.2s;
        }
        .item-card:hover .item-cat-badge { background: rgba(255,255,255,1); border-color: rgba(27,77,62,0.28); }
        .item-icon-wrap { width: 68px; height: 68px; background: rgba(27,77,62,0.06); border: 1px solid rgba(27,77,62,0.12); border-radius: 20px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .item-card:hover .item-icon-wrap { background: rgba(27,77,62,0.1); border-color: rgba(27,77,62,0.25); }
        .item-body { padding: 18px 20px 20px; }
        .item-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid rgba(27,77,62,0.07); }
        .item-trust { display: flex; align-items: center; gap: 4px; padding: 3px 8px; background: var(--au-glow); border: 1px solid rgba(201,168,76,0.2); border-radius: 999px; }
        @media (max-width: 1024px) { .items-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px)  { .items-grid { grid-template-columns: 1fr; } .browse-banner { padding: 40px 20px 48px; } }
      `}</style>

      <div className="browse">

        <div className="browse-banner">
          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7FFFC4', boxShadow: '0 0 6px rgba(127,255,196,0.6)' }} />
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#7FFFC4', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Marketplace</span>
                </div>
                <h1 style={{ fontSize: 'clamp(24px,5vw,36px)', fontWeight: '900', color: '#F0FDF4', margin: 0, letterSpacing: '-0.04em' }}>Browse Items</h1>
              </div>
              <Link href="/items/new" className="btn-gold" style={{ fontSize: '13px', padding: '10px 20px' }}>
                <PlusCircle size={15} strokeWidth={2.5} /> List an Item
              </Link>
            </div>
            <div className="browse-search-row">
              <div className="browse-search-box">
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Search size={15} color="rgba(240,253,244,0.5)" strokeWidth={2} />
                </div>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="browse-search-input" />
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
                  <SlidersHorizontal size={14} color="rgba(240,253,244,0.5)" strokeWidth={2} />
                </div>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="browse-select">
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {(search || selectedCategory) && (
                <button onClick={() => { setSearch(''); setSelectedCategory('') }} className="browse-clear-btn">
                  <X size={13} strokeWidth={2.5} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 28px 60px' }}>
          <p style={{ fontSize: '13px', color: 'var(--tx-muted)', marginBottom: '20px', fontWeight: '600' }}>
            {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} available`}
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 24px' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(27,77,62,0.06)', border: '1px solid rgba(27,77,62,0.12)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Package size={26} color="var(--g-rich)" strokeWidth={1.5} />
              </div>
              <p style={{ color: 'var(--tx-muted)', fontSize: '14px', fontWeight: '600' }}>Loading items...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="items-grid">
              {items.map((item: any) => (
                <Link href={`/items/${item.id}`} key={item.id} className="item-card">
                  <div className="item-img-wrap">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="item-icon-wrap">
                        <CategoryIcon name={item.categories?.name || 'Other'} size={32} color="var(--g-rich)" />
                      </div>
                    )}
                    <span className="item-cat-badge">{item.categories?.name}</span>
                  </div>
                  <div className="item-body">
                    <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--tx-bright)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>{item.title}</p>
                    {item.description && (
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '0 0 14px', lineHeight: '1.6', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                        {item.description}
                      </p>
                    )}
                    <div className="item-footer">
                      <div>
                        <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--g-mid)', letterSpacing: '-0.04em' }}>₱{item.price_per_day}</span>
                        <span style={{ fontSize: '11px', color: 'var(--tx-muted)' }}>/day</span>
                      </div>
                      <div style={{ textAlign: 'right' as const }}>
                        <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: 0, fontWeight: '600' }}>{item.profiles?.full_name}</p>
                        {item.profiles?.trust_score > 0 && (
                          <div className="item-trust" style={{ marginTop: '3px', display: 'flex' }}>
                            <Star size={10} fill="#C9A84C" color="#C9A84C" strokeWidth={1} />
                            <span style={{ fontSize: '11px', color: 'var(--au-dark)', fontWeight: '800' }}>{item.profiles.trust_score}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1.5px solid rgba(27,77,62,0.1)', padding: '100px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '68px', height: '68px', background: 'rgba(27,77,62,0.06)', border: '1px solid rgba(27,77,62,0.14)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Package size={30} color="var(--g-rich)" strokeWidth={1.5} />
              </div>
              <p style={{ fontWeight: '800', fontSize: '20px', color: 'var(--tx-bright)', marginBottom: '8px', letterSpacing: '-0.03em' }}>No items found</p>
              <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '28px' }}>{search || selectedCategory ? 'Try a different search or category' : 'Be the first to list an item!'}</p>
              <Link href="/items/new" className="btn-green" style={{ display: 'inline-flex', fontSize: '13px', padding: '10px 22px' }}>
                <PlusCircle size={14} strokeWidth={2.5} /> List an Item
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}