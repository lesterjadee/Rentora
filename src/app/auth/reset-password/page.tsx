'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMessage('Password updated! Redirecting...')
      setTimeout(() => router.push('/auth/login'), 2000)
    }
  }

  return (
    <>
      <style>{`
        body { background: var(--bg-void); }
        .rp { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .rp-left {
          width: 44%; padding: 60px;
          display: flex; flex-direction: column; justify-content: center;
          position: relative; overflow: hidden;
          border-right: 1px solid rgba(6,214,33,0.07);
        }
        .rp-left::before {
          content: ''; position: absolute; top: -80px; right: -80px;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(110,255,128,0.05), transparent);
          pointer-events: none;
        }
        .rp-right {
          flex: 1; background: var(--bg-void);
          display: flex; align-items: center; justify-content: center; padding: 52px;
        }
        .rp-input {
          width: 100%; padding: 13px 16px;
          background: #FFFFFF !important;
          border: 1.5px solid rgba(4,149,22,0.15) !important;
          border-radius: 12px; font-size: 14px;
          color: var(--tx-bright) !important; outline: none;
          box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .rp-input:focus {
          border-color: var(--g-vivid) !important;
          box-shadow: 0 0 0 3px rgba(4,149,22,0.08) !important;
        }
        .rp-input::placeholder { color: var(--tx-dim) !important; }
        .pw-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--tx-muted); padding: 0;
          display: flex; align-items: center;
        }
        @media (max-width: 768px) { .rp-left { display: none; } .rp-right { padding: 32px 20px; } }
      `}</style>

      <div className="rp">
        <div className="rp-left">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/gcoc.png" alt="GC" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0 }}>Rentora</p>
              <p style={{ fontSize: '9px', color: 'var(--g-vivid)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>⚡ Powered by Gordon College</p>
            </div>
          </Link>
          <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: '900', color: 'var(--tx-bright)', lineHeight: '1.12', letterSpacing: '-0.04em', marginBottom: '16px' }}>
            Set your new<br />password.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--tx-muted)', lineHeight: '1.8' }}>
            Choose a strong password to keep your Rentora account secure.
          </p>
        </div>

        <div className="rp-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', marginBottom: '6px' }}>New password</h1>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '32px' }}>Enter and confirm your new password</p>

            {error && (
              <div style={{ marginBottom: '20px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}
            {message && (
              <div style={{ marginBottom: '20px', padding: '13px 16px', background: 'rgba(4,149,22,0.08)', border: '1px solid rgba(4,149,22,0.2)', borderRadius: '12px', color: 'var(--g-mid)', fontSize: '13px' }}>
                ✅ {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {[
                { label: 'New Password',     value: password, setter: setPassword },
                { label: 'Confirm Password', value: confirm,  setter: setConfirm  },
              ].map((f, i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {f.label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={f.value}
                      onChange={e => f.setter(e.target.value)}
                      required
                      placeholder="Min. 6 characters"
                      minLength={6}
                      className="rp-input"
                      style={{ paddingRight: '48px' }}
                    />
                    {i === 0 && (
                      <button type="button" className="pw-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '24px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Updating...' : (<>Update Password <ArrowRight size={16} strokeWidth={2.5} /></>)}
                </button>
              </div>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--tx-muted)' }}>
              <Link href="/auth/login" style={{ color: 'var(--au-dark)', fontWeight: '700', textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}