'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MessageCircle, ArrowRight } from 'lucide-react'

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [conversations, setConversations] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setCurrentUser(user)

      // Get all messages involving this user
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!msgs) { setLoading(false); return }

      // Group by conversation partner
      const seen = new Set<string>()
      const convMap: Record<string, any> = {}

      for (const msg of msgs) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!seen.has(otherId)) {
          seen.add(otherId)
          convMap[otherId] = { lastMessage: msg, unread: 0, otherId }
        }
        if (msg.receiver_id === user.id && !msg.is_read) {
          convMap[otherId].unread++
        }
      }

      // Fetch other user profiles
      const otherIds = Object.keys(convMap)
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, student_id')
          .in('id', otherIds)

        const profileMap: Record<string, any> = {}
        profiles?.forEach(p => { profileMap[p.id] = p })

        const convList = otherIds.map(id => ({
          ...convMap[id],
          profile: profileMap[id],
        }))
        setConversations(convList)
      }

      setLoading(false)
    }
    init()
  }, [])

  return (
    <>
      <style>{`
        .msg-page { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .msg-banner { position: relative; overflow: hidden; padding: 48px 28px 96px; border-bottom: 1px solid rgba(6,214,33,0.08); }
        .msg-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 50% 70% at 90% 0%, rgba(110,255,128,0.06), transparent 55%); pointer-events: none; }
        .msg-banner::after  { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent); }
        .conv-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1); border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; text-decoration: none; transition: all 0.2s; box-shadow: var(--shadow-sm); margin-bottom: 10px; }
        .conv-card:hover { border-color: rgba(4,149,22,0.25); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .conv-avatar { width: 46px; height: 46px; background: linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid)); border: 1.5px solid rgba(4,149,22,0.25); border-radius: '12px'; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-weight: 900; font-size: 18px; flex-shrink: 0; border-radius: 12px; }
      `}</style>

      <div className="msg-page">
        <div className="msg-banner">
          <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6EFF80', animation: 'breathe 2s ease infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Messages</span>
            </div>
            <h1 style={{ fontSize: 'clamp(24px,5vw,36px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: 0 }}>
              Messages
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: '760px', margin: '-60px auto 0', padding: '0 28px 60px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <MessageCircle size={28} color="var(--tx-dim)" strokeWidth={1.5} style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ color: 'var(--tx-muted)', fontSize: '14px', fontWeight: '600' }}>Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(4,149,22,0.1)', borderRadius: '22px', padding: '80px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <MessageCircle size={36} color="var(--tx-dim)" strokeWidth={1.5} style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontWeight: '700', fontSize: '18px', color: 'var(--tx-bright)', marginBottom: '8px' }}>No conversations yet</p>
              <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '24px' }}>
                Request to rent an item to start a conversation with the owner.
              </p>
              <Link href="/items" className="btn-green" style={{ display: 'inline-flex', fontSize: '13px', padding: '10px 22px' }}>
                Browse Items <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          ) : (
            <div>
              {conversations.map((conv: any) => (
                <Link key={conv.otherId} href={`/messages/${conv.otherId}`} className="conv-card">
                  <div className="conv-avatar">
                    {conv.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--tx-bright)', margin: 0 }}>
                        {conv.profile?.full_name || 'Unknown User'}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--tx-dim)' }}>
                        {new Date(conv.lastMessage.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.lastMessage.sender_id === currentUser?.id ? 'You: ' : ''}{conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <div style={{ width: '20px', height: '20px', background: 'var(--g-vivid)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '10px', fontWeight: '900', color: '#FFFFFF' }}>{conv.unread}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}