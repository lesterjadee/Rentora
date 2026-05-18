'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, XCircle, Users, Eye } from 'lucide-react'

export default function AdminVerificationsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard'); return
      }

      fetchUsers()
    }
    init()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .not('id_image_url', 'is', null)
      .order('id_submitted_at', { ascending: true, nullsFirst: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  const handleApprove = async (userId: string) => {
    setActionLoading(userId + '_approve')
    await supabase.from('profiles').update({
      is_verified: true,
      verification_status: 'approved',
    }).eq('id', userId)
    await fetchUsers()
    setActionLoading(null)
  }

  const handleReject = async (userId: string, reason?: string) => {
    setActionLoading(userId + '_reject')
    await supabase.from('profiles').update({
      is_verified: false,
      verification_status: 'rejected',
    }).eq('id', userId)
    await fetchUsers()
    setActionLoading(null)
  }

  const filtered = users.filter(u => {
    if (filter === 'all') return true
    return u.verification_status === filter
  })

  const counts = {
    all: users.length,
    pending: users.filter(u => u.verification_status === 'pending').length,
    approved: users.filter(u => u.verification_status === 'approved').length,
    rejected: users.filter(u => u.verification_status === 'rejected').length,
  }

  return (
    <>
      <style>{`
        .admin { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .admin-banner {
          position: relative; overflow: hidden;
          padding: 44px 28px 96px;
          border-bottom: 1px solid rgba(6,214,33,0.08);
        }
        .admin-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 70% at 100% 0%, rgba(110,255,128,0.07), transparent 55%); pointer-events: none; }
        .admin-banner::after  { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent); }
        .admin-inner { max-width: 1100px; margin: 0 auto; position: relative; }
        .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
        .filter-tab {
          padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700;
          cursor: pointer; border: 1.5px solid transparent; transition: all 0.2s;
          font-family: inherit; background: #FFFFFF;
          border-color: rgba(4,149,22,0.12); color: var(--tx-muted);
        }
        .filter-tab.active { background: rgba(4,149,22,0.08); border-color: rgba(4,149,22,0.25); color: var(--g-rich); }
        .filter-tab:hover:not(.active) { border-color: rgba(4,149,22,0.2); color: var(--g-mid); }
        .v-card {
          background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1);
          border-radius: 20px; overflow: hidden;
          box-shadow: var(--shadow-sm); margin-bottom: 14px;
          transition: box-shadow 0.2s;
        }
        .v-card:hover { box-shadow: var(--shadow-md); }
        .v-card.pending  { border-left: 4px solid var(--au-mid); }
        .v-card.approved { border-left: 4px solid var(--g-vivid); }
        .v-card.rejected { border-left: 4px solid #EF4444; }
        .status-badge-pending  { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 999px; font-size: 11px; font-weight: 800; color: var(--au-dark); }
        .status-badge-approved { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: rgba(4,149,22,0.1); border: 1px solid rgba(4,149,22,0.25); border-radius: 999px; font-size: 11px; font-weight: 800; color: var(--g-rich); }
        .status-badge-rejected { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 999px; font-size: 11px; font-weight: 800; color: #B91C1C; }
        .id-img { width: 100%; height: 200px; object-fit: cover; cursor: pointer; transition: opacity 0.2s; }
        .id-img:hover { opacity: 0.9; }
        .id-img-placeholder { width: 100%; height: 200px; background: var(--bg-raised); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(4,149,22,0.08); }
        .btn-approve { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; background: rgba(4,149,22,0.1); border: 1.5px solid rgba(4,149,22,0.25); color: var(--g-rich); font-weight: 700; font-size: 13px; border-radius: 11px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .btn-approve:hover { background: rgba(4,149,22,0.15); border-color: rgba(4,149,22,0.4); }
        .btn-reject { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; background: rgba(239,68,68,0.07); border: 1.5px solid rgba(239,68,68,0.2); color: #B91C1C; font-weight: 700; font-size: 13px; border-radius: 11px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .btn-reject:hover { background: rgba(239,68,68,0.13); }

        /* Lightbox */
        .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .lightbox img { max-width: 100%; max-height: 90vh; border-radius: 12px; }

        @media (max-width: 640px) { .admin-banner { padding: 36px 20px 88px; } }
      `}</style>

      {/* Lightbox for full ID view */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="ID Document" />
        </div>
      )}

      <div className="admin">
        <div className="admin-banner">
          <div className="admin-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6EFF80', boxShadow: '0 0 6px rgba(110,255,128,0.7)', animation: 'breathe 2s ease infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Admin</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(24px,5vw,36px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: '0 0 6px' }}>
                  ID Verifications
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0 }}>
                  Review and verify student ID submissions
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { label: 'Total',    value: counts.all,      color: 'var(--tx-muted)' },
                  { label: 'Pending',  value: counts.pending,  color: 'var(--au-dark)' },
                  { label: 'Approved', value: counts.approved, color: 'var(--g-rich)' },
                  { label: 'Rejected', value: counts.rejected, color: '#B91C1C' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '22px', fontWeight: '900', color: s.color === 'var(--tx-muted)' ? 'var(--tx-bright)' : s.color, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: '10px', color: 'var(--tx-muted)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '-60px auto 0', padding: '0 28px 60px' }}>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span style={{ marginLeft: '6px', padding: '1px 7px', background: filter === f ? 'rgba(4,149,22,0.15)' : 'var(--bg-raised)', borderRadius: '999px', fontSize: '11px' }}>
                    {counts[f]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ width: '52px', height: '52px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Users size={24} color="var(--g-rich)" strokeWidth={1.5} />
              </div>
              <p style={{ color: 'var(--tx-muted)', fontSize: '14px', fontWeight: '600' }}>Loading verifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(4,149,22,0.1)', borderRadius: '22px', padding: '80px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <ShieldCheck size={36} color="var(--tx-dim)" strokeWidth={1.5} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: '700', fontSize: '18px', color: 'var(--tx-bright)', marginBottom: '6px' }}>
                {filter === 'pending' ? 'No pending verifications' : `No ${filter} verifications`}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--tx-muted)' }}>
                {filter === 'pending' ? 'All ID submissions have been reviewed.' : `No users with ${filter} status.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {filtered.map((u: any) => (
                <div key={u.id} className={`v-card ${u.verification_status}`}>

                  {/* ID Image */}
                  {u.id_image_url ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={u.id_image_url}
                        alt="Submitted ID"
                        className="id-img"
                        onClick={() => setSelectedImage(u.id_image_url)}
                      />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={() => setSelectedImage(u.id_image_url)}>
                        <Eye size={13} color="#FFFFFF" strokeWidth={2} />
                        <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: '700' }}>View Full</span>
                      </div>
                    </div>
                  ) : (
                    <div className="id-img-placeholder">
                      <p style={{ fontSize: '13px', color: 'var(--tx-dim)' }}>No ID uploaded</p>
                    </div>
                  )}

                  {/* User Info */}
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: '900', fontSize: '16px', flexShrink: 0 }}>
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>{u.full_name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: 0 }}>{u.student_id}</p>
                        </div>
                      </div>
                      {u.verification_status === 'pending'  && <span className="status-badge-pending"><Clock size={10} strokeWidth={2.5} /> Pending</span>}
                      {u.verification_status === 'approved' && <span className="status-badge-approved"><CheckCircle2 size={10} strokeWidth={2.5} /> Approved</span>}
                      {u.verification_status === 'rejected' && <span className="status-badge-rejected"><XCircle size={10} strokeWidth={2.5} /> Rejected</span>}
                    </div>

                    <div style={{ background: 'var(--bg-raised)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', border: '1px solid rgba(4,149,22,0.07)' }}>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '0 0 2px' }}>{u.email}</p>
                      {u.id_submitted_at && (
                        <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0 }}>
                          Submitted: {new Date(u.id_submitted_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {u.verification_status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(u.id)}
                          disabled={actionLoading === u.id + '_approve'}
                          className="btn-approve"
                          style={{ flex: 1, justifyContent: 'center', opacity: actionLoading === u.id + '_approve' ? 0.6 : 1 }}
                        >
                          <CheckCircle2 size={14} strokeWidth={2.5} />
                          {actionLoading === u.id + '_approve' ? 'Approving...' : 'Approve'}
                        </button>
                      )}
                      {u.verification_status !== 'rejected' && (
                        <button
                          onClick={() => handleReject(u.id)}
                          disabled={actionLoading === u.id + '_reject'}
                          className="btn-reject"
                          style={{ flex: 1, justifyContent: 'center', opacity: actionLoading === u.id + '_reject' ? 0.6 : 1 }}
                        >
                          <XCircle size={14} strokeWidth={2.5} />
                          {actionLoading === u.id + '_reject' ? 'Rejecting...' : 'Reject'}
                        </button>
                      )}
                      {u.verification_status === 'approved' && (
                        <Link href={`/profile/${u.id}`} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'var(--bg-raised)', border: '1.5px solid rgba(4,149,22,0.1)', borderRadius: '11px', color: 'var(--tx-muted)', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
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