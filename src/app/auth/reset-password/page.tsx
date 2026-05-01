'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, LockKeyhole, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const handleSession = async () => {
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')
        if (accessToken && type === 'recovery') {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' })
          if (!error) { setReady(true); setChecking(false); return }
        }
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { setReady(true) } else { setError('This reset link has expired or is invalid. Please request a new one.') }
      setChecking(false)
    }
    handleSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') { setReady(true); setChecking(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); setLoading(false); return }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message) }
    else { setMessage('success'); setTimeout(() => router.push('/dashboard'), 2500) }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 48px 14px 16px',
    background: 'var(--bg-raised)', border: '1px solid var(--border-sub)',
    borderRadius: '12px', fontSize: '14px', color: 'var(--tx-bright)',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    transition: 'border-color 0.2s'
  }

  return (
    <>
      <style>{`
        body { background: var(--bg-void); }
        .rp { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rp-left { width: 42%; background: linear-gradient(160deg, #060E09 0%, #0A2018 40%, #0D3020 70%, #0C0D10 100%); padding: 64px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; border-right: 1px solid rgba(34,168,118,0.08); }
        .rp-right { flex: 1; background: var(--bg-void); display: flex; align-items: center; justify-content: center; padding: 52px; }
        .pw-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--tx-muted); padding: 0; display: flex; align-items: center; transition: color 0.2s; }
        .pw-eye:hover { color: var(--tx-body); }
        @media (max-width: 768px) { .rp-left { display: none; } .rp-right { padding: 32px 24px; } }
      `}</style>

      <div className="rp">
        <div className="rp-left">
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #0D2B1A, #1A7A52)', border: '1px solid rgba(34,168,118,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#22A876', fontSize: '15px' }}>R</div>
              <span style={{ fontSize: '19px', fontWeight: '900', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #2ECC8F, #4EDDAA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rentora</span>
            </Link>
            <h2 style={{ fontSize: '38px', fontWeight: '900', color: 'var(--tx-bright)', lineHeight: '1.12', letterSpacing: '-0.04em', marginBottom: '16px' }}>
              Create a new<br />password.
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--tx-muted)', lineHeight: '1.8', marginBottom: '40px' }}>
              Choose a strong password to keep your Rentora account secure.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', position: 'relative' }}>
            {['At least 6 characters', 'Mix of letters and numbers', 'Avoid using your student ID'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-sub)', borderRadius: '11px' }}>
                <CheckCircle2 size={15} color="#22A876" strokeWidth={2} />
                <span style={{ fontSize: '13px', color: 'var(--tx-muted)', fontWeight: '500' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rp-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ width: '54px', height: '54px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', boxShadow: '0 0 20px rgba(201,168,76,0.1)' }}>
              <LockKeyhole size={26} color="#C9A84C" strokeWidth={1.8} />
            </div>

            <h1 style={{ fontSize: '30px', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', marginBottom: '8px' }}>New Password</h1>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '36px', lineHeight: '1.6' }}>Enter and confirm your new password below.</p>

            {checking ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--tx-muted)' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--bg-card)', border: '1px solid var(--border-sub)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <LockKeyhole size={22} color="var(--tx-dim)" strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '14px' }}>Verifying your reset link...</p>
              </div>
            ) : error && !ready ? (
              <div>
                <div style={{ padding: '24px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '18px', textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ fontSize: '28px', marginBottom: '12px' }}>🔗</p>
                  <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--tx-bright)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Link Expired</p>
                  <p style={{ fontSize: '13px', color: 'var(--tx-muted)', lineHeight: '1.6' }}>{error}</p>
                </div>
                <Link href="/auth/forgot-password" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6B4C18, var(--au-mid), #A07828)', border: '1px solid rgba(201,168,76,0.4)', color: '#0C0D10', fontWeight: '800', borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}>
                  Request New Link <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            ) : message === 'success' ? (
              <div style={{ padding: '28px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', borderRadius: '18px', textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', background: 'rgba(34,168,118,0.1)', border: '1px solid rgba(34,168,118,0.25)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={26} color="#22A876" strokeWidth={1.8} />
                </div>
                <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--tx-bright)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Password Updated!</p>
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)' }}>Redirecting you to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ marginBottom: '20px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#FCA5A5', fontSize: '13px' }}>
                    {error}
                  </div>
                )}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '9px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" minLength={6} style={inputStyle} />
                    <button type="button" className="pw-eye" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}</button>
                  </div>
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '9px' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat your password" style={{ ...inputStyle, borderColor: confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.4)' : confirmPassword && confirmPassword === password ? 'rgba(34,168,118,0.4)' : 'var(--border-sub)' }} />
                    <button type="button" className="pw-eye" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}</button>
                  </div>
                  {confirmPassword && confirmPassword !== password && <p style={{ fontSize: '12px', color: '#FCA5A5', marginTop: '6px' }}>Passwords don't match</p>}
                  {confirmPassword && confirmPassword === password && <p style={{ fontSize: '12px', color: '#2ECC8F', marginTop: '6px' }}>Passwords match!</p>}
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? 'var(--bg-raised)' : 'linear-gradient(135deg, var(--g-mid), var(--g-rich), var(--g-vivid))', border: `1px solid ${loading ? 'var(--border-sub)' : 'rgba(34,168,118,0.35)'}`, color: loading ? 'var(--tx-muted)' : '#2ECC8F', fontWeight: '800', borderRadius: '12px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 20px rgba(15,61,42,0.4)' }}>
                  <LockKeyhole size={16} strokeWidth={2.5} />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--tx-muted)', marginTop: '24px' }}>
              <Link href="/auth/login" style={{ color: '#22A876', fontWeight: '700', textDecoration: 'none' }}>← Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}