'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ShieldCheck, Clock, CheckCircle2, XCircle, Users, Eye } from 'lucide-react'

export default function AdminVerificationsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [users, setUsers]           = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [filter, setFilter]         = useState<'all'|'pending'|'approved'|'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string|null>(null)
  const [selectedImage, setSelectedImage] = useState<string|null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        router.push('/dashboard'); return
      }

      if (profile.role !== 'admin') {
        router.push('/dashboard'); return
      }

      setAuthChecked(true)
      fetchUsers()
    }
    init()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, student_id, role, is_verified, verification_status, id_image_url, id_submitted_at')
      .not('id_image_url', 'is', null)
      .order('id_submitted_at', { ascending: true, nullsFirst: false })
    setUsers(data || [])
    setLoading(false)
  }

  const handleApprove = async (userId: string) => {
    setActionLoading(userId + '_a')
    await supabase.from('profiles').update({ is_verified: true, verification_status: 'approved' }).eq('id', userId)
    await fetchUsers()
    setActionLoading(null)
  }

  const handleReject = async (userId: string) => {
    setActionLoading(userId + '_r')
    await supabase.from('profiles').update({ is_verified: false, verification_status: 'rejected' }).eq('id', userId)
    await fetchUsers()
    setActionLoading(null)
  }

  const filtered = users.filter(u => filter === 'all' || u.verification_status === filter)
  const counts = {
    all:      users.length,
    pending:  users.filter(u => u.verification_status === 'pending').length,
    approved: users.filter(u => u.verification_status === 'approved').length,
    rejected: users.filter(u => u.verification_status === 'rejected').length,
  }

  if (!authChecked && loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <ShieldCheck size={24} color="var(--g-rich)" strokeWidth={1.5} />
        </div>
        <p style={{ color: 'var(--tx-muted)', fontSize: '14px', fontWeight: '600' }}>Checking access...</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .admin { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .admin-banner { position: relative; overflow: hidden; padding: 44px 28px 96px; border-bottom: 1px solid rgba(6,214,33,0.08); }
        .admin-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 70% at 100% 0%, rgba(110,255,128,0.07), transparent 55%); pointer-events: none; }
        .admin-banner::after  { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent); }
        .filter-tab { padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1.5px solid rgba(4,149,22,0.12); font-family: inherit; background: #FFFFFF; color: var(--tx-muted); transition: all 0.2s; }
        .filter-tab.active { background: rgba(4,149,22,0.08); border-color: rgba(4,149,22,0.25); color: var(--g-rich); }
        .v-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-sm); margin-bottom: 14px; }
        .v-card.pending  { border-left: 4px solid var(--au-mid); }
        .v-card.approved { border-left: 4px solid var(--g-vivid); }
        .v-card.rejected { border-left: 4px solid #EF4444; }
        .id-img { width: 100%; height: 200px; object-fit: cover; cursor: zoom-in; display: block; }
        .btn-approve { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: rgba(4,149,22,0.08); border: 1.5px solid rgba(4,149,22,0.22); color: var(--g-rich); font-weight: 700; font-size: 13px; border-radius: 11px; cursor: pointer; font-family: inherit; }
        .btn-approve:hover { background: rgba(4,149,22,0.14); }
        .btn-reject  { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: rgba(239,68,68,0.07); border: 1.5px solid rgba(239,68,68,0.2); color: #B91C1C; font-weight: 700; font-size: 13px; border-radius: 11px; cursor: pointer; font-family: inherit; }
        .btn-reject:hover { background: rgba(239,68,68,0.13); }
        .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
        .lightbox img { max-width: 100%; max-height: 90vh; border-radius: 12px; }
      `}</style>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="ID Document" />
        </div>
      )}

      <div className="admin">
        <div className="admin-banner">
          <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6EFF80', animation: 'breathe 2s ease infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Admin Panel</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(24px,5vw,36px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: '0 0 6px' }}>ID Verifications</h1>
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0 }}>Review and verify student ID submissions</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { l: 'Total',    v: counts.all,      c: 'var(--tx-bright)' },
                  { l: 'Pending',  v: counts.pending,  c: '#C9A84C' },
                  { l: 'Approved', v: counts.approved, c: 'var(--g-rich)' },
                  { l: 'Rejected', v: counts.rejected, c: '#EF4444' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '22px', fontWeight: '900', color: s.c, margin: 0, lineHeight: 1, letterSpacing: '-0.04em' }}>{s.v}</p>
                    <p style={{ fontSize: '10px', color: 'var(--tx-muted)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '-60px auto 0', padding: '0 28px 60px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {(['all','pending','approved','rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && <span style={{ marginLeft: '6px', padding: '1px 7px', background: filter === f ? 'rgba(4,149,22,0.15)' : 'var(--bg-raised)', borderRadius: '999px', fontSize: '11px' }}>{counts[f]}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <Users size={28} color="var(--tx-dim)" strokeWidth={1.5} style={{ margin: '0 auto 14px' }} />
              <p style={{ color: 'var(--tx-muted)', fontSize: '14px', fontWeight: '600' }}>Loading verifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(4,149,22,0.1)', borderRadius: '22px', padding: '80px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <ShieldCheck size={36} color="var(--tx-dim)" strokeWidth={1.5} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: '700', fontSize: '18px', color: 'var(--tx-bright)', marginBottom: '6px' }}>No {filter === 'all' ? '' : filter} verifications</p>
              <p style={{ fontSize: '14px', color: 'var(--tx-muted)' }}>
                {filter === 'pending' ? 'All submissions have been reviewed.' : `No users with ${filter} status yet.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {filtered.map((u: any) => (
                <div key={u.id} className={`v-card ${u.verification_status || 'pending'}`}>
                  {u.id_image_url ? (
                    <div style={{ position: 'relative' }}>
                      <img src={u.id_image_url} alt="ID" className="id-img" onClick={() => setSelectedImage(u.id_image_url)} />
                      <div onClick={() => setSelectedImage(u.id_image_url)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.55)', borderRadius: '8px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'zoom-in' }}>
                        <Eye size={12} color="#FFF" strokeWidth={2} />
                        <span style={{ fontSize: '11px', color: '#FFF', fontWeight: '700' }}>View Full</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: '140px', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(4,149,22,0.08)' }}>
                      <p style={{ fontSize: '13px', color: 'var(--tx-dim)' }}>No image</p>
                    </div>
                  )}

                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.25)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: '900', fontSize: '15px', flexShrink: 0 }}>
                          {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 2px' }}>{u.full_name || 'Unknown'}</p>
                          <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: 0 }}>{u.student_id || '—'}</p>
                        </div>
                      </div>
                      {u.verification_status === 'pending'  && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '999px', fontSize: '11px', fontWeight: '800', color: 'var(--au-dark)', flexShrink: 0 }}><Clock size={9} strokeWidth={2.5} /> Pending</span>}
                      {u.verification_status === 'approved' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(4,149,22,0.1)', border: '1px solid rgba(4,149,22,0.25)', borderRadius: '999px', fontSize: '11px', fontWeight: '800', color: 'var(--g-rich)', flexShrink: 0 }}><CheckCircle2 size={9} strokeWidth={2.5} /> Approved</span>}
                      {u.verification_status === 'rejected' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '999px', fontSize: '11px', fontWeight: '800', color: '#B91C1C', flexShrink: 0 }}><XCircle size={9} strokeWidth={2.5} /> Rejected</span>}
                    </div>

                    <div style={{ background: 'var(--bg-raised)', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', border: '1px solid rgba(4,149,22,0.07)' }}>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '0 0 2px' }}>{u.email}</p>
                      {u.id_submitted_at && (
                        <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0 }}>
                          Submitted {new Date(u.id_submitted_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {u.verification_status !== 'approved' && (
                        <button onClick={() => handleApprove(u.id)} disabled={actionLoading === u.id + '_a'} className="btn-approve" style={{ flex: 1, justifyContent: 'center', opacity: actionLoading === u.id + '_a' ? 0.6 : 1 }}>
                          <CheckCircle2 size={13} strokeWidth={2.5} />
                          {actionLoading === u.id + '_a' ? '...' : 'Approve'}
                        </button>
                      )}
                      {u.verification_status !== 'rejected' && (
                        <button onClick={() => handleReject(u.id)} disabled={actionLoading === u.id + '_r'} className="btn-reject" style={{ flex: 1, justifyContent: 'center', opacity: actionLoading === u.id + '_r' ? 0.6 : 1 }}>
                          <XCircle size={13} strokeWidth={2.5} />
                          {actionLoading === u.id + '_r' ? '...' : 'Reject'}
                        </button>
                      )}
                      {u.verification_status === 'approved' && (
                        <Link href={`/profile/${u.id}`} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '9px', background: 'var(--bg-raised)', border: '1.5px solid rgba(4,149,22,0.1)', borderRadius: '11px', color: 'var(--tx-muted)', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                          View Profile
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}