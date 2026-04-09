import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  InboxIcon, CheckCircle, XCircle, Flag,
  Star, Bell, ArrowLeft
} from 'lucide-react'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: notifications } = await supabase
    .from('notifications').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })

  await supabase.from('notifications').update({ read: true })
    .eq('user_id', user.id).eq('read', false)

  const typeConfig: any = {
    rental_request:   {
      icon: <InboxIcon size={20} color="#2563eb" strokeWidth={1.8} />,
      bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb', label: 'New Request'
    },
    rental_approved:  {
      icon: <CheckCircle size={20} color="#16a34a" strokeWidth={1.8} />,
      bg: '#f0fdf4', border: '#86efac', color: '#16a34a', label: 'Approved'
    },
    rental_declined:  {
      icon: <XCircle size={20} color="#dc2626" strokeWidth={1.8} />,
      bg: '#fef2f2', border: '#fecaca', color: '#dc2626', label: 'Declined'
    },
    rental_completed: {
      icon: <Flag size={20} color="#26619C" strokeWidth={1.8} />,
      bg: '#eff6ff', border: '#bfdbfe', color: '#26619C', label: 'Completed'
    },
    new_review:       {
      icon: <Star size={20} color="#d97706" strokeWidth={1.8} fill="#d97706" />,
      bg: '#fffbeb', border: '#fde68a', color: '#d97706', label: 'New Review'
    },
  }

  const unread = notifications?.filter(n => !n.read).length || 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #26619C 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Activity</p>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              Notifications
              {unread > 0 && (
                <span style={{ fontSize: '13px', fontWeight: '700', backgroundColor: '#ef4444', color: '#ffffff', padding: '3px 10px', borderRadius: '999px' }}>
                  {unread} new
                </span>
              )}
            </h1>
          </div>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#ffffff', fontWeight: '600', borderRadius: '12px',
            textDecoration: 'none', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <ArrowLeft size={16} strokeWidth={2} /> Dashboard
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
        {notifications && notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((notif: any) => {
              const t = typeConfig[notif.type] || typeConfig.rental_request
              return (
                <Link key={notif.id} href={notif.rental_id ? `/rentals/${notif.rental_id}` : '/dashboard'} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: '#ffffff', borderRadius: '16px',
                    border: `1px solid ${!notif.read ? t.border : '#e8edf2'}`,
                    padding: '18px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer',
                    opacity: notif.read ? 0.75 : 1, transition: 'all 0.15s'
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '14px',
                      backgroundColor: t.bg, border: `1px solid ${t.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>{t.icon}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <p style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', margin: 0 }}>{notif.title}</p>
                          <span style={{
                            fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                            borderRadius: '999px', backgroundColor: t.bg, color: t.color,
                            border: `1px solid ${t.border}`
                          }}>{t.label}</span>
                        </div>
                        {!notif.read && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#26619C', flexShrink: 0, marginTop: '4px' }} />
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px' }}>{notif.message}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                        {new Date(notif.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(notif.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e8edf2',
            padding: '80px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#f8fafc', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Bell size={28} color="#94a3b8" strokeWidth={1.5} />
            </div>
            <p style={{ fontWeight: '700', fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>All caught up!</p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>No notifications yet. Start renting to see activity here.</p>
          </div>
        )}
      </div>
    </div>
  )
}