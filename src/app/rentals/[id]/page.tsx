'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Package, Calendar, User, Star, DollarSign, Clock, AlertTriangle, MapPin, ExternalLink, MessageCircle, Save } from 'lucide-react'
import type { MeetupLocation } from '@/components/MapPickerInner'

function getTrustTier(score: number | null) {
  if (!score || score === 0) return 'normal'
  if (score >= 4.0) return 'highly_trusted'
  if (score >= 3.0) return 'normal'
  return 'low_trust'
}

const MapPicker = dynamic(() => import('@/components/MapPickerInner'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '300px', background: 'var(--bg-raised)', borderRadius: '14px', border: '1.5px solid rgba(4,149,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '13px', color: 'var(--tx-muted)', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>Loading map...</p>
    </div>
  ),
})

const MapDisplay = dynamic(() => import('@/components/MapDisplayInner'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '240px', background: 'var(--bg-raised)', borderRadius: '14px', border: '1.5px solid rgba(4,149,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '13px', color: 'var(--tx-muted)', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>Loading map...</p>
    </div>
  ),
})

export default function RentalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.id as string
  const supabase = createClient()

  const [rental, setRental]             = useState<any>(null)
  const [currentUser, setCurrentUser]   = useState<any>(null)
  const [loading, setLoading]           = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]               = useState('')

  // Owner meetup state
  const [meetup, setMeetup]             = useState<MeetupLocation | null>(null)
  const [meetupNotes, setMeetupNotes]   = useState('')
  const [savingMeetup, setSavingMeetup] = useState(false)
  const [meetupSaved, setMeetupSaved]   = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setCurrentUser(user)

    const { data } = await supabase
      .from('rentals')
      .select(`
        *,
        items (id, title, price_per_day, image_url, categories(name)),
        renter:profiles!rentals_renter_id_fkey (id, full_name, trust_score),
        owner:profiles!rentals_owner_id_fkey  (id, full_name, trust_score)
      `)
      .eq('id', rentalId)
      .single()

    if (!data) { router.push('/rentals'); return }

    const isOwner  = data.owner_id  === user.id
    const isRenter = data.renter_id === user.id
    if (!isOwner && !isRenter) { router.push('/rentals'); return }

    setRental(data)

    // Pre-fill meetup if already set
    if (data.meetup_lat && data.meetup_lng) {
      setMeetup({ lat: data.meetup_lat, lng: data.meetup_lng, name: data.meetup_location_name || '' })
    }
    if (data.meetup_notes) setMeetupNotes(data.meetup_notes)

    setLoading(false)
  }, [rentalId])

  useEffect(() => { fetchData() }, [fetchData])

  const doAction = async (updates: Record<string, any>) => {
    setActionLoading(true)
    setError('')
    const { error } = await supabase.from('rentals').update(updates).eq('id', rentalId)
    if (error) { setError(error.message); setActionLoading(false) }
    else { await fetchData(); setActionLoading(false) }
  }

  const saveMeetupLocation = async () => {
    if (!meetup) return
    setSavingMeetup(true)
    const { error } = await supabase.from('rentals').update({
      meetup_lat: meetup.lat,
      meetup_lng: meetup.lng,
      meetup_location_name: meetup.name,
      meetup_notes: meetupNotes.trim() || null,
    }).eq('id', rentalId)

    if (error) { setError(error.message) }
    else { setMeetupSaved(true); setTimeout(() => setMeetupSaved(false), 3000) }
    setSavingMeetup(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={24} color="var(--g-rich)" strokeWidth={1.5} />
      </div>
    </div>
  )

  if (!rental || !currentUser) return null

  const isOwner  = rental.owner_id  === currentUser.id
  const isRenter = rental.renter_id === currentUser.id
  const otherUserId = isOwner ? rental.renter_id : rental.owner_id
  const otherUser   = isOwner ? rental.renter : rental.owner

  const now = new Date()
  const visibleAt = rental.visible_at ? new Date(rental.visible_at) : null
  const isStillDelayed = isOwner && visibleAt !== null && visibleAt > now

  const days = rental.start_date && rental.end_date
    ? Math.max(1, Math.ceil((new Date(rental.end_date).getTime() - new Date(rental.start_date).getTime()) / 86400000))
    : 1
  const total = days * (rental.items?.price_per_day || 0)

  const renterScore    = rental.renter?.trust_score || 0
  const renterIsLowTrust = renterScore > 0 && renterScore < 3.0
  const hasMeetup = rental.meetup_lat && rental.meetup_lng

  // Owner can set meetup when rental is pending or approved
  const ownerCanSetMeetup = isOwner && (rental.status === 'pending' || rental.status === 'approved')

  return (
    <>
      <style>{`
        .rd { min-height: 100vh; background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rd-banner { position: relative; overflow: hidden; padding: 44px 28px 96px; border-bottom: 1px solid rgba(6,214,33,0.08); }
        .rd-banner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 50% 70% at 90% 0%, rgba(110,255,128,0.06), transparent 55%); pointer-events: none; }
        .rd-banner::after  { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent); }
        .rd-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1); border-radius: 22px; padding: 28px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
        .rd-row { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid rgba(4,149,22,0.07); }
        .rd-row:last-child { border-bottom: none; }
        .rd-icon { width: 36px; height: 36px; background: rgba(4,149,22,0.07); border: 1px solid rgba(4,149,22,0.14); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .btn-danger  { display: inline-flex; align-items: center; gap: 7px; padding: 12px 22px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #B91C1C; font-weight: 700; font-size: 14px; border-radius: 12px; cursor: pointer; font-family: inherit; }
        .btn-danger:hover { background: rgba(239,68,68,0.14); }
        .btn-purple  { display: inline-flex; align-items: center; gap: 7px; padding: 12px 22px; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25); color: #6D28D9; font-weight: 700; font-size: 14px; border-radius: 12px; cursor: pointer; font-family: inherit; }
        .btn-purple:hover { background: rgba(124,58,237,0.15); }
        .btn-chat { display: inline-flex; align-items: center; gap: 7px; padding: 12px 20px; background: rgba(4,149,22,0.08); border: 1.5px solid rgba(4,149,22,0.22); color: var(--g-rich); font-weight: 700; font-size: 14px; border-radius: 12px; text-decoration: none; transition: all 0.2s; }
        .btn-chat:hover { background: rgba(4,149,22,0.14); }
        .gmaps-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(4,149,22,0.08); border: 1.5px solid rgba(4,149,22,0.2); color: var(--g-rich); font-weight: 700; font-size: 12px; border-radius: 10px; text-decoration: none; }
        .notice { padding: 14px 18px; border-radius: 14px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
        .notice-gold   { background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25); }
        .notice-red    { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18); }
        .notice-green  { background: rgba(4,149,22,0.07); border: 1px solid rgba(4,149,22,0.18); align-items: center; }
        .notice-purple { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); align-items: center; }
        .meetup-notes-input { width: 100%; padding: 12px 16px; font-size: 13px; borderRadius: 12px; border: 1.5px solid rgba(4,149,22,0.15); background: var(--bg-raised); color: var(--tx-bright); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; resize: vertical; box-sizing: border-box; outline: none; line-height: 1.6; }
        .meetup-notes-input:focus { border-color: rgba(4,149,22,0.35); box-shadow: 0 0 0 3px rgba(4,149,22,0.07); }
        .meetup-notes-input::placeholder { color: var(--tx-dim); }
      `}</style>

      <div className="rd">
        <div className="rd-banner">
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <Link href="/rentals" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--tx-muted)', textDecoration: 'none', marginBottom: '20px', fontWeight: '600' }}>
              <ArrowLeft size={14} strokeWidth={2} /> Back to Rentals
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6EFF80' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#6EFF80', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Rental Detail</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: 0 }}>
                {rental.items?.title}
              </h1>
              <span className={`status-${rental.status}`} style={{ fontSize: '13px' }}>{rental.status}</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '-60px auto 0', padding: '0 28px 60px' }}>

          {error && (
            <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          {isStillDelayed && visibleAt && (
            <div className="notice notice-gold">
              <Clock size={20} color="var(--au-mid)" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--au-dark)', margin: '0 0 4px' }}>12-Hour Review Delay</p>
                <p style={{ fontSize: '13px', color: 'var(--au-dark)', margin: 0, opacity: 0.85, lineHeight: '1.5' }}>
                  Low trust renter. You can approve from <strong>{visibleAt.toLocaleString('en-PH', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>.
                </p>
              </div>
            </div>
          )}

          {isOwner && renterIsLowTrust && !isStillDelayed && rental.status === 'pending' && (
            <div className="notice notice-red">
              <AlertTriangle size={18} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontWeight: '700', fontSize: '13px', color: '#B91C1C', margin: '0 0 3px' }}>Low Trust Renter</p>
                <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, opacity: 0.85 }}>Trust score below 3.0. Review carefully before approving.</p>
              </div>
            </div>
          )}

          {isRenter && rental.status === 'returning' && (
            <div className="notice notice-purple">
              <Package size={17} color="#6D28D9" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: '#6D28D9', margin: 0, fontWeight: '600' }}>
                Marked as returned. Waiting for owner to <strong>confirm receipt</strong>.
              </p>
            </div>
          )}

          {isOwner && rental.status === 'returning' && (
            <div className="notice notice-green">
              <Package size={17} color="var(--g-rich)" strokeWidth={2} />
              <p style={{ fontSize: '13px', color: 'var(--g-mid)', margin: 0, fontWeight: '600' }}>
                Renter marked as <strong>returned</strong>. Confirm below if received.
              </p>
            </div>
          )}

          {/* Item Details */}
          <div className="rd-card">
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '14px' }}>Item Details</h3>
            <div className="rd-row">
              <div className="rd-icon">
                {rental.items?.image_url
                  ? <img src={rental.items.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9px' }} />
                  : <Package size={16} color="var(--g-rich)" strokeWidth={2} />
                }
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>{rental.items?.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{rental.items?.categories?.name}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '16px', fontWeight: '900', color: 'var(--g-mid)' }}>₱{rental.items?.price_per_day}/day</span>
            </div>
            {(rental.start_date || rental.end_date) && (
              <div className="rd-row">
                <div className="rd-icon"><Calendar size={16} color="var(--g-rich)" strokeWidth={2} /></div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>Rental Period</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{rental.start_date} → {rental.end_date} ({days} day{days !== 1 ? 's' : ''})</p>
                </div>
              </div>
            )}
            <div className="rd-row">
              <div className="rd-icon"><DollarSign size={16} color="var(--au-mid)" strokeWidth={2} /></div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>Total</p>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{days} day{days !== 1 ? 's' : ''} × ₱{rental.items?.price_per_day}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '20px', fontWeight: '900', color: 'var(--au-dark)' }}>₱{total}</span>
            </div>
          </div>

          {/* People */}
          <div className="rd-card">
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '14px' }}>People</h3>
            {[
              { label: 'Owner',  profile: rental.owner },
              { label: 'Renter', profile: rental.renter },
            ].map((p, i) => (
              <div key={i} className="rd-row">
                <div className="rd-icon"><User size={16} color="var(--g-rich)" strokeWidth={2} /></div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>{p.profile?.full_name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{p.label}</p>
                </div>
                {p.profile?.trust_score > 0 && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: '999px' }}>
                    <Star size={11} fill="#C9A84C" color="#C9A84C" />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--au-dark)' }}>{p.profile.trust_score}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── MEETUP LOCATION ── */}
          <div className="rd-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="rd-icon"><MapPin size={16} color="var(--g-rich)" strokeWidth={2} /></div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 2px' }}>Meetup Location</h3>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>
                    {isOwner ? 'Set the item handoff point for the renter' : 'Where to collect/return the item'}
                  </p>
                </div>
              </div>
              {hasMeetup && (
                <a href={`https://www.google.com/maps?q=${rental.meetup_lat},${rental.meetup_lng}`} target="_blank" rel="noopener noreferrer" className="gmaps-btn">
                  <ExternalLink size={12} strokeWidth={2} /> Google Maps
                </a>
              )}
            </div>

            {/* OWNER: Interactive map picker + notes */}
            {ownerCanSetMeetup && (
              <>
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', marginBottom: '14px', padding: '10px 14px', background: 'rgba(4,149,22,0.05)', borderRadius: '10px', border: '1px solid rgba(4,149,22,0.1)' }}>
                  📍 As the item owner, choose where the renter should come to pick up or return the item. Click the map to place a pin, then drag to adjust.
                </p>

                <MapPicker value={meetup} onChange={setMeetup} />

                {meetup && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.15)', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <MapPin size={14} color="var(--g-rich)" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--g-rich)', margin: '0 0 2px' }}>Pin placed ✓</p>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, lineHeight: '1.5' }}>{meetup.name}</p>
                    </div>
                    <button type="button" onClick={() => setMeetup(null)} style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--tx-dim)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                      Clear
                    </button>
                  </div>
                )}

                {/* Additional notes */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Additional Location Info
                  </label>
                  <textarea
                    value={meetupNotes}
                    onChange={e => setMeetupNotes(e.target.value)}
                    placeholder="e.g. Meet at the lobby, 2nd floor near the elevator. Call me when you arrive. Available 8AM–6PM on weekdays."
                    rows={3}
                    className="meetup-notes-input"
                  />
                  <p style={{ fontSize: '11px', color: 'var(--tx-dim)', marginTop: '6px' }}>
                    Include floor, landmark, schedule, or any specific instructions for the renter.
                  </p>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    disabled={!meetup || savingMeetup}
                    onClick={saveMeetupLocation}
                    className="btn-green"
                    style={{ fontSize: '13px', padding: '10px 22px', opacity: (!meetup || savingMeetup) ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: '7px' }}
                  >
                    <Save size={14} strokeWidth={2.5} />
                    {savingMeetup ? 'Saving...' : 'Save Meetup Location'}
                  </button>
                  {meetupSaved && (
                    <span style={{ fontSize: '13px', color: 'var(--g-rich)', fontWeight: '700' }}>✓ Saved!</span>
                  )}
                </div>
              </>
            )}

            {/* RENTER or view-only: Map display */}
            {!ownerCanSetMeetup && hasMeetup && (
              <>
                <MapDisplay lat={rental.meetup_lat} lng={rental.meetup_lng} name={rental.meetup_location_name} />
                {rental.meetup_location_name && (
                  <div style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: '10px', border: '1px solid rgba(4,149,22,0.08)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <MapPin size={14} color="var(--g-rich)" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--tx-body)', margin: '0 0 3px', fontWeight: '600', lineHeight: '1.5' }}>{rental.meetup_location_name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--tx-dim)', margin: 0 }}>{Number(rental.meetup_lat).toFixed(5)}, {Number(rental.meetup_lng).toFixed(5)}</p>
                    </div>
                  </div>
                )}
                {rental.meetup_notes && (
                  <div style={{ marginTop: '10px', padding: '12px 14px', background: 'rgba(4,149,22,0.05)', borderRadius: '10px', border: '1px solid rgba(4,149,22,0.1)' }}>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--g-rich)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Owner's Notes</p>
                    <p style={{ fontSize: '13px', color: 'var(--tx-body)', margin: 0, lineHeight: '1.65' }}>{rental.meetup_notes}</p>
                  </div>
                )}
              </>
            )}

            {/* Owner can see display of saved location */}
            {isOwner && hasMeetup && !ownerCanSetMeetup && (
              <>
                <MapDisplay lat={rental.meetup_lat} lng={rental.meetup_lng} name={rental.meetup_location_name} />
                {rental.meetup_notes && (
                  <div style={{ marginTop: '10px', padding: '12px 14px', background: 'rgba(4,149,22,0.05)', borderRadius: '10px', border: '1px solid rgba(4,149,22,0.1)' }}>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--g-rich)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Your Notes</p>
                    <p style={{ fontSize: '13px', color: 'var(--tx-body)', margin: 0, lineHeight: '1.65' }}>{rental.meetup_notes}</p>
                  </div>
                )}
              </>
            )}

            {!hasMeetup && !ownerCanSetMeetup && (
              <div style={{ padding: '28px 20px', textAlign: 'center', background: 'var(--bg-raised)', borderRadius: '14px' }}>
                <MapPin size={28} color="var(--tx-dim)" strokeWidth={1.5} style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0, fontWeight: '600' }}>No meetup location set yet</p>
                <p style={{ fontSize: '12px', color: 'var(--tx-dim)', margin: '4px 0 0' }}>The owner will set a location once the rental is approved.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

            {/* OWNER: approve/decline */}
            {isOwner && rental.status === 'pending' && !isStillDelayed && (
              <>
                <button disabled={actionLoading} onClick={() => doAction({ status: 'approved' })} className="btn-green" style={{ fontSize: '14px', padding: '12px 24px', opacity: actionLoading ? 0.6 : 1 }}>
                  {actionLoading ? 'Processing...' : '✓ Approve Request'}
                </button>
                <button disabled={actionLoading} onClick={() => doAction({ status: 'declined' })} className="btn-danger">Decline</button>
              </>
            )}

            {isOwner && rental.status === 'pending' && isStillDelayed && (
              <button disabled style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(0,0,0,0.04)', border: '1.5px solid var(--border-sub)', color: 'var(--tx-dim)', fontWeight: '600', fontSize: '14px', borderRadius: '12px', cursor: 'not-allowed', fontFamily: 'inherit' }}>
                <Clock size={15} strokeWidth={2} /> Awaiting Delay
              </button>
            )}

            {isOwner && rental.status === 'returning' && (
              <button disabled={actionLoading} onClick={() => doAction({ status: 'completed' })} className="btn-green" style={{ fontSize: '14px', padding: '12px 24px', opacity: actionLoading ? 0.6 : 1 }}>
                {actionLoading ? 'Processing...' : '✓ Confirm Item Returned'}
              </button>
            )}

            {isRenter && rental.status === 'pending' && (
              <button disabled={actionLoading} onClick={() => doAction({ status: 'cancelled' })} className="btn-danger">Cancel Request</button>
            )}

            {isRenter && rental.status === 'approved' && (
              <button disabled={actionLoading} onClick={() => doAction({ status: 'returning', return_requested_at: new Date().toISOString() })} className="btn-purple" style={{ opacity: actionLoading ? 0.6 : 1 }}>
                {actionLoading ? 'Processing...' : '📦 I Have Returned the Item'}
              </button>
            )}

            {rental.status === 'completed' && (
              <Link href={`/reviews/new?rental_id=${rental.id}`} className="btn-gold" style={{ fontSize: '14px', padding: '12px 24px' }}>
                Leave a Review
              </Link>
            )}

            {/* Chat button */}
            <Link href={`/messages/${otherUserId}?rental_id=${rental.id}`} className="btn-chat">
              <MessageCircle size={15} strokeWidth={2} />
              Chat with {otherUser?.full_name?.split(' ')[0]}
            </Link>

            <Link href={`/items/${rental.item_id}`} className="btn-ghost" style={{ fontSize: '14px', padding: '12px 24px' }}>
              View Item
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}