'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Send, Package, MessageCircle } from 'lucide-react'

function ChatInner() {
  const params       = useParams()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const otherUserId  = params.userId as string
  const rentalId     = searchParams.get('rental_id')
  const supabase     = createClient()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser]     = useState<any>(null)
  const [rental, setRental]           = useState<any>(null)
  const [messages, setMessages]       = useState<any[]>([])
  const [content, setContent]         = useState('')
  const [sending, setSending]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true })
    return data || []
  }, [otherUserId])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setCurrentUser(user)

      const [{ data: otherProfile }, msgs] = await Promise.all([
        supabase.from('profiles').select('id, full_name, student_id, email').eq('id', otherUserId).single(),
        fetchMessages(user.id),
      ])

      setOtherUser(otherProfile)
      setMessages(msgs)

      if (rentalId) {
        const { data: rentalData } = await supabase
          .from('rentals')
          .select('*, items(title, image_url)')
          .eq('id', rentalId)
          .single()
        setRental(rentalData)
      }

      // Mark incoming messages as read
      await supabase.from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      setLoading(false)
    }
    init()
  }, [otherUserId, rentalId])

  // Real-time subscription
  useEffect(() => {
    if (!currentUser) return
    const channel = supabase
      .channel(`chat-${currentUser.id}-${otherUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}`,
      }, (payload) => {
        const msg = payload.new as any
        if (msg.sender_id === otherUserId) {
          setMessages(prev => [...prev, msg])
          // Mark as read immediately
          supabase.from('messages').update({ is_read: true }).eq('id', msg.id)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUser, otherUserId])

  const sendMessage = async () => {
    if (!content.trim() || !currentUser) return
    setSending(true)
    const msg = content.trim()
    setContent('')

    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: otherUserId,
      content: msg,
      rental_id: rentalId || null,
    }).select().single()

    if (!error && data) {
      setMessages(prev => [...prev, data])
    }
    setSending(false)
    inputRef.current?.focus()
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  function groupByDate(msgs: any[]) {
    const groups: { date: string; messages: any[] }[] = []
    let currentDate = ''
    msgs.forEach(msg => {
      const date = formatDate(msg.created_at)
      if (date !== currentDate) { currentDate = date; groups.push({ date, messages: [msg] }) }
      else { groups[groups.length - 1].messages.push(msg) }
    })
    return groups
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MessageCircle size={22} color="var(--g-rich)" strokeWidth={1.5} />
      </div>
    </div>
  )

  const grouped = groupByDate(messages)

  return (
    <>
      <style>{`
        .chat-page { height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; display: flex; flex-direction: column; overflow: hidden; }
        .chat-header { background: #FFFFFF; border-bottom: 1.5px solid rgba(4,149,22,0.1); padding: 16px 24px; display: flex; align-items: center; gap: 14px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
        .chat-avatar { width: 44px; height: 44px; background: linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid)); border: 1.5px solid rgba(4,149,22,0.25); border-radius: '12px'; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-weight: 900; font-size: 18px; flex-shrink: 0; border-radius: 12px; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 2px; }
        .chat-bubble-me    { background: linear-gradient(135deg, var(--g-dark), var(--g-mid)); color: #FFFFFF; border-radius: 18px 18px 4px 18px; padding: 10px 16px; max-width: 70%; font-size: 14px; line-height: 1.55; word-break: break-word; }
        .chat-bubble-other { background: #FFFFFF; color: var(--tx-bright); border: 1.5px solid rgba(4,149,22,0.12); border-radius: 18px 18px 18px 4px; padding: 10px 16px; max-width: 70%; font-size: 14px; line-height: 1.55; word-break: break-word; box-shadow: var(--shadow-sm); }
        .chat-input-area { background: #FFFFFF; border-top: 1.5px solid rgba(4,149,22,0.1); padding: 16px 24px; flex-shrink: 0; }
        .chat-input { flex: 1; background: var(--bg-raised); border: 1.5px solid rgba(4,149,22,0.15); border-radius: 14px; padding: 12px 16px; font-size: 14px; color: var(--tx-bright); outline: none; resize: none; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; line-height: 1.5; }
        .chat-input:focus { border-color: rgba(4,149,22,0.35); box-shadow: 0 0 0 3px rgba(4,149,22,0.07); }
        .chat-input::placeholder { color: var(--tx-dim); }
        .rental-context { background: rgba(4,149,22,0.05); border: 1px solid rgba(4,149,22,0.12); border-radius: 12px; padding: 10px 14px; margin-bottom: 16px; display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
      `}</style>

      <div className="chat-page">

        {/* Header */}
        <div className="chat-header">
          <Link href="/messages" style={{ color: 'var(--tx-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
          <div className="chat-avatar">
            {otherUser?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.01em' }}>
              {otherUser?.full_name || 'Unknown'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>
              {otherUser?.student_id ? `Student · ${otherUser.student_id}` : 'Gordon College'}
            </p>
          </div>
          {rentalId && (
            <Link href={`/rentals/${rentalId}`} className="btn-ghost" style={{ fontSize: '12px', padding: '7px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <Package size={13} strokeWidth={2} /> View Rental
            </Link>
          )}
        </div>

        {/* Rental context card */}
        {rental && (
          <div style={{ padding: '12px 24px 0', flexShrink: 0 }}>
            <div className="rental-context">
              {rental.items?.image_url
                ? <img src={rental.items.image_url} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                : <div style={{ width: '36px', height: '36px', background: 'rgba(4,149,22,0.08)', border: '1px solid rgba(4,149,22,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={16} color="var(--g-rich)" strokeWidth={1.8} /></div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--g-rich)', margin: 0 }}>Rental Request</p>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.items?.title}</p>
              </div>
              <span className={`status-${rental.status}`} style={{ fontSize: '11px', flexShrink: 0 }}>{rental.status}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages">
          {grouped.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <MessageCircle size={24} color="var(--g-rich)" strokeWidth={1.5} />
                </div>
                <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--tx-bright)', marginBottom: '6px' }}>Start the conversation</p>
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', maxWidth: '260px', lineHeight: '1.6' }}>
                  Say hello to {otherUser?.full_name?.split(' ')[0]}! Discuss the item, agree on a price, or coordinate a meetup location.
                </p>
              </div>
            </div>
          )}

          {grouped.map(group => (
            <div key={group.date}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0 12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(4,149,22,0.08)' }} />
                <span style={{ fontSize: '11px', color: 'var(--tx-dim)', fontWeight: '600' }}>{group.date}</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(4,149,22,0.08)' }} />
              </div>
              {group.messages.map(msg => {
                const isMe = msg.sender_id === currentUser?.id
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '3px' }}>
                      <div className={isMe ? 'chat-bubble-me' : 'chat-bubble-other'}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--tx-dim)', paddingLeft: '4px', paddingRight: '4px' }}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder={`Message ${otherUser?.full_name?.split(' ')[0] || 'them'}...`}
              rows={1}
              className="chat-input"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !content.trim()}
              style={{ width: '44px', height: '44px', background: content.trim() ? 'linear-gradient(135deg, var(--g-dark), var(--g-mid))' : 'var(--bg-raised)', border: `1.5px solid ${content.trim() ? 'rgba(4,149,22,0.3)' : 'rgba(4,149,22,0.12)'}`, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: content.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'all 0.2s' }}
            >
              {sending
                ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(4,149,22,0.4)', borderTopColor: 'var(--g-rich)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <Send size={16} color={content.trim() ? '#FFFFFF' : 'var(--tx-dim)'} strokeWidth={2} />
              }
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--tx-dim)', marginTop: '8px', textAlign: 'center' }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageCircle size={22} color="var(--g-rich)" strokeWidth={1.5} />
        </div>
      </div>
    }>
      <ChatInner />
    </Suspense>
  )
}