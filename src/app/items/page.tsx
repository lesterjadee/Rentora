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
          padding: 52px 28px 56px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .browse-banner::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 100% -20%, rgba(34,168,118,0.1), transparent 60%);
          pointer-events: none;
        }
        .browse-banner::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
        }
        .browse-search-wrap {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 6px;
          display: flex; gap: 6px; flex-wrap: wrap;
          backdrop-filter: blur(10px);
        }
        .browse-search-input {
          flex: 1; min-width: 200px;
          background: transparent !important;
          border: none !important; outline: none !important;
          padding: 10px 16px 10px 42px !important;
          font-size: 14px; color: var(--tx-bright) !important;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          box-shadow: none !important;
          border-radius: 10px !important;
        }
        .browse-select {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 10px !important; padding: 10px 14px 10px 34px !important;
          font-size: 13px !important; color: var(--tx-body) !important;
          cursor: pointer; min-width: 155px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .browse-select:focus { border-color: rgba(201,168,76,0.3) !important; box-shadow: none !important; }
        .browse-clear {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px; font-size: 12px;
          color: #FCA5A5; cursor: pointer; font-weight: '600';
          transition: all 0.2s;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .browse-clear:hover { background: rgba(239,68,68,0.14); }
        .items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .item-card {
          background: var(--bg-card);
          border: 1px solid var(--border-sub);
          border-radius: 20px; overflow: hidden;
          text-decoration: none; display: block;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: var(--shadow-sm);
          position: relative;
        }
        .item-card::before {
          content: ''; position: absolute; inset: 0;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(201,168,76,0.03), transparent 50%);
          opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 1;
        }
        .item-card:hover {
          border-color: rgba(201,168,76,0.2);
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl), 0 0 0 1px rgba(201,168,76,0.08);
        }
        .item-card:hover::before { opacity: 1; }
        .item-img-wrap {
          height: 185px; background: var(--bg-raised);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          border-bottom: 1px solid var(--border-sub);
        }
        .item-img-wrap::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(6,6,8,0.4));
          pointer-events: none;
        }
        .item-cat-badge {
          position: absolute; top: 12px; left: 12px; z-index: 2;
          background: rgba(6,6,8,0.75);
          border: 1px solid var(--border-mid);
          border-radius: 8px; padding: 5px 11px;
          font-size: 11px; font-weight: 700; color: var(--tx-body);
          backdrop-filter: blur(12px); letter-spacing: 0.02em;
          transition: border-color 0.2s;
        }
        .item-card:hover .item-cat-badge { border-color: rgba(201,168,76,0.2); color: var(--tx-bright); }
        .item-icon-wrap {
          width: 68px; height: 68px;
          background: var(--bg-hover);
          border: 1px solid var(--border-sub);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .item-card:hover .item-icon-wrap {
          border-color: rgba(34,168,118,0.25);
          background: var(--g-glow);
        }
        .item-body { padding: 18px 20px 20px; }
        .item-title { font-weight: '800'; font-size: 15px; color: var(--tx-bright); margin: 0 0 6px; letter-spacing: -0.02em; transition: color 0.2s; }
        .item-card:hover .item-title { color: #F5F3EB; }
        .item-desc { font-size: 12px; color: var(--tx-muted); margin: 0 0 16px; line-height: 1.6; }
        .item-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-dim); }
        .item-price { font-size: 22px; font-weight: 900; color: #2ECC8F; letter-spacing: -0.04em; }
        .item-price-unit { font-size: 11px; color: var(--tx-muted); font-weight: 500; }
        .item-owner { font-size: 11px; color: var(--tx-muted); font-weight: 600; }
        .item-trust { display: flex; align-items: center; gap: 4px; margin-top: 3px; padding: 3px 8px; background: var(--au-glow); border: 1px solid rgba(201,168,76,0.15); border-radius: 999px; }
        @media (max-width: 1024px) { .items-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .items-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="browse">

        <div className="browse-banner">
          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22A876', boxShadow: '0 0 6px rgba(34,168,118,0.6)' }} />
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Marketplace</span>
                </div>
                <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.04em' }}>Browse Items</h1>
              </div>
              <Link href="/items/new" className="btn-gold" style={{ fontSize: '13px', padding: '10px 20px' }}>
                <PlusCircle size={15} strokeWidth={2.5} /> List an Item
              </Link>
            </div>

            <div className="browse-search-wrap">
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
                  <Search size={15} color="var(--tx-muted)" strokeWidth={2} />
                </div>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="browse-search-input" />
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
                  <SlidersHorizontal size={14} color="var(--tx-muted)" strokeWidth={2} />
                </div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="browse-select">
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {(search || selectedCategory) && (
                <button onClick={() => { setSearch(''); setSelectedCategory('') }} className="browse-clear">
                  <X size={13} strokeWidth={2.5} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 28px 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--tx-muted)', fontWeight: '600' }}>
              {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 24px', color: 'var(--tx-muted)' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--bg-card)', border: '1px solid var(--border-sub)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Package size={26} color="var(--tx-dim)" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Loading items...</p>
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
                        <CategoryIcon name={item.categories?.name || 'Other'} size={32} color="#22A876" />
                      </div>
                    )}
                    <span className="item-cat-badge">{item.categories?.name}</span>
                  </div>

                  <div className="item-body">
                    <p className="item-title" style={{ fontWeight: 800 }}>{item.title}</p>
                    {item.description && (
                      <p className="item-desc" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                        {item.description}
                      </p>
                    )}
                    <div className="item-footer">
                      <div>
                        <span className="item-price">₱{item.price_per_day}</span>
                        <span className="item-price-unit">/day</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="item-owner">{item.profiles?.full_name}</p>
                        {item.profiles?.trust_score > 0 && (
                          <div className="item-trust">
                            <Star size={10} fill="#C9A84C" color="#C9A84C" strokeWidth={1} />
                            <span style={{ fontSize: '11px', color: 'var(--au-light)', fontWeight: '800' }}>{item.profiles.trust_score}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-sub)', padding: '100px 24px', textAlign: 'center' }}>
              <div style={{ width: '68px', height: '68px', background: 'var(--bg-raised)', border: '1px solid var(--border-sub)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Package size={30} color="var(--tx-dim)" strokeWidth={1.5} />
              </div>
              <p style={{ fontWeight: '800', fontSize: '20px', color: 'var(--tx-body)', marginBottom: '8px', letterSpacing: '-0.03em' }}>No items found</p>
              <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '28px' }}>
                {search || selectedCategory ? 'Try a different search or category' : 'Be the first to list an item!'}
              </p>
              <Link href="/items/new" className="btn-gold" style={{ display: 'inline-flex', fontSize: '13px', padding: '10px 22px' }}>
                <PlusCircle size={14} strokeWidth={2.5} /> List an Item
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}