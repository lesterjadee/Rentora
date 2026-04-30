import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bell, Inbox, CheckCircle, XCircle, Flag, Star } from 'lucide-react'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: notifications } = await supabase
    .from('notifications').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })

  await supabase.from('notifications').update({ read: true })
    .eq('user_id', user.id).eq('read', false)

  const unread = notifications?.filter(n => !n.read).length || 0

  type NotifConfig = {
    iconEl: React.ReactNode
    bg: string
    border: string
    color: string
    label: string
  }

  const typeConfig: Record<string, NotifConfig> = {
    rental_request: {
      iconEl: <Inbox size={18} color="#93C5FD" strokeWidth={1.8} />,
      bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)', color: '#93C5FD', label: 'New Request'
    },
    rental_approved: {
      iconEl: <CheckCircle size={18} color="#2ECC8F" strokeWidth={1.8} />,
      bg: 'var(--g-glow)', border: 'rgba(34,168,118,0.2)', color: '#2ECC8F', label: 'Approved'
    },
    rental_declined: {
      iconEl: <XCircle size={18} color="#FCA5A5" strokeWidth={1.8} />,
      bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)', color: '#FCA5A5', label: 'Declined'
    },
    rental_completed: {
      iconEl: <Flag size={18} color="#E2C07A" strokeWidth={1.8} />,
      bg: 'var(--au-glow)', border: 'rgba(201,168,76,0.2)', color: '#E2C07A', label: 'Completed'
    },
    new_review: {
      iconEl: <Star size={18} color="#C9A84C" strokeWidth={1.8} fill="#C9A84C" />,
      bg: 'var(--au-glow)', border: 'rgba(201,168,76,0.2)', color: '#E2C07A', label: 'New Review'
    },
  }

  return (
    <>
      <style>{`
        .notif-page { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .notif-banner {
          position: relative; overflow: hidden;
          padding: 40px 28px 52px;
          background: linear-gradient(150deg, #060E09 0%, #0A2018 40%, #0C0D10 100%);
          border-bottom: 1px solid rgba(34,168,118,0.08);
        }
        .notif-banner::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent); }
        .notif-inner { max-width: 700px; margin: 0 auto; padding: 28px 28px 60px; }
        .notif-item-link { text-decoration: none; display: block; margin-bottom: 8px; }
        .notif-item {
          background: var(--bg-card); border-radius: 18px;
          border: 1px solid var(--border-sub);
          padding: 18px 20px;
          display: flex; gap: 16px; align-items: flex-start;
          box-shadow: var(--shadow-sm);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          position: relative;
        }
        .notif-item-link:hover .notif-item {
          border-color: rgba(201,168,76,0.15);
          background: var(--bg-hover);
          transform: translateX(4px);
          box-shadow: var(--shadow-md), 0 0 0 1px rgba(201,168,76,0.05);
        }
        .notif-item.unread { border-color: var(--border-mid); }
        .notif-icon-box {
          width: 44px; height: 44px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s;
        }
        .notif-unread-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #E2C07A;
          box-shadow: 0 0 6px rgba(201,168,76,0.5);
          flex-shrink: 0; margin-top: 5px;
        }
        .notif-empty {
          background: var(--bg-card); border-radius: 24px;
          border: 1px solid var(--border-sub);
          padding: 96px 24px; text-align: center;
          box-shadow: var(--shadow-md);
        }
        @media (max-width: 560px) { .notif-inner { padding: 24px 20px 48px; } }
      `}</style>

      <div className="notif-page">
        <div className="notif-banner">
          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', flexWrap: 'wrap' as const, gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22A876', boxShadow: '0 0 6px rgba(34,168,118,0.6)' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#22A876', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Activity</span>
              </div>
              <h1 style={{ fontSize: 'clamp(24px,5vw,34px)', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '14px' }}>
                Notifications
                {unread > 0 && (
                  <span style={{ fontSize: '13px', fontWeight: '800', background: 'linear-gradient(135deg, var(--au-dark), var(--au-mid))', color: '#0C0D10', padding: '3px 12px', borderRadius: '999px', letterSpacing: '0.01em' }}>
                    {unread} new
                  </span>
                )}
              </h1>
            </div>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-sub)', color: 'var(--tx-muted)', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '13px' }}>
              <ArrowLeft size={14} strokeWidth={2} /> Dashboard
            </Link>
          </div>
        </div>

        <div className="notif-inner">
          {notifications && notifications.length > 0 ? (
            notifications.map((notif: any) => {
              const t = typeConfig[notif.type] || typeConfig.rental_request
              return (
                <Link key={notif.id} href={notif.rental_id ? `/rentals/${notif.rental_id}` : '/dashboard'} className="notif-item-link">
                  <div className={`notif-item ${!notif.read ? 'unread' : ''}`} style={{ opacity: notif.read ? 0.65 : 1 }}>
                    <div className="notif-icon-box" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                      {t.iconEl}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', flexWrap: 'wrap' as const, gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
                          <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.01em' }}>{notif.title}</p>
                          <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 9px', borderRadius: '999px', background: t.bg, color: t.color, border: `1px solid ${t.border}`, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{t.label}</span>
                        </div>
                        {!notif.read && <div className="notif-unread-dot" />}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: '0 0 6px', lineHeight: '1.5' }}>{notif.message}</p>
                      <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0, fontWeight: '600' }}>
                        {new Date(notif.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}
                        {new Date(notif.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="notif-empty">
              <div style={{ width: '68px', height: '68px', background: 'var(--bg-raised)', border: '1px solid var(--border-sub)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Bell size={30} color="var(--tx-dim)" strokeWidth={1.5} />
              </div>
              <p style={{ fontWeight: '800', fontSize: '20px', color: 'var(--tx-body)', marginBottom: '8px', letterSpacing: '-0.03em' }}>All caught up!</p>
              <p style={{ fontSize: '14px', color: 'var(--tx-muted)' }}>No notifications yet. Start renting to see activity here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}