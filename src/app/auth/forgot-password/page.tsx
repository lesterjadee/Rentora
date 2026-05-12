'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!email.endsWith('.edu.ph')) {
      setError('Please use your institutional .edu.ph email address.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) { setError(error.message) }
    else { setMessage('Password reset link sent! Check your email inbox.') }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        .forgot-container { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .forgot-left {
          width: 40%;
          background: linear-gradient(150deg, #011E05 0%, #023D09 40%, #02560E 100%);
          padding: 60px; display: flex; flex-direction: column; justify-content: center;
          position: relative; overflow: hidden;
          border-right: 1px solid rgba(6,214,33,0.07);
        }
        .forgot-left::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 100% 0%, rgba(92,219,149,0.08), transparent 55%),
            radial-gradient(ellipse 40% 40% at 0% 100%, rgba(201,168,76,0.05), transparent 50%);
          pointer-events: none;
        }
        .forgot-right { flex: 1; background-color: var(--bg-void); display: flex; align-items: center; justify-content: center; padding: 48px; }
        @media (max-width: 768px) {
          .forgot-left { display: none; }
          .forgot-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="forgot-container">
        {/* Left Panel */}
        <div className="forgot-left">
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
                <div style={{
                  width: '38px', height: '38px',
                  background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))',
                  border: '1.5px solid rgba(92,219,149,0.2)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(7,24,18,0.3)',
                }}>
                  <span style={{ color: '#FFFFFF', fontWeight: '900', fontSize: '18px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>R</span>
                </div>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#F0FFF2', letterSpacing: '-0.03em' }}>Rentora</span>
              </div>
            </Link>

            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#F0FFF2', lineHeight: '1.2', letterSpacing: '-0.03em', marginBottom: '16px' }}>
              Forgot your<br />password?
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(240,255,242,0.55)', lineHeight: '1.7', marginBottom: '40px' }}>
              No worries! Enter your institutional email and we'll send you a reset link instantly.
            </p>

            <div style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(92,219,149,0.15)',
              borderRadius: '16px', padding: '20px',
              display: 'flex', alignItems: 'flex-start', gap: '14px',
            }}>
              <span style={{ fontSize: '24px' }}>🔐</span>
              <div>
                <p style={{ fontWeight: '700', color: '#F0FFF2', margin: '0 0 4px', fontSize: '14px' }}>Secure Reset</p>
                <p style={{ fontSize: '13px', color: 'rgba(240,255,242,0.55)', margin: 0 }}>
                  The reset link expires in <strong style={{ color: '#7FFFC4' }}>1 hour</strong> for your security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="forgot-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <div style={{
                width: '34px', height: '34px',
                background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))',
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(7,24,18,0.15)',
              }}>
                <span style={{ color: '#FFFFFF', fontWeight: '900', fontSize: '16px', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>R</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--g-dark)', letterSpacing: '-0.03em' }}>Rentora</span>
            </div>

            <div style={{
              width: '56px', height: '56px',
              backgroundColor: 'rgba(4,149,22,0.07)',
              border: '1px solid rgba(4,149,22,0.2)',
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', marginBottom: '24px',
            }}>🔑</div>

            <h1 style={{ fontSize: '30px', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.03em', marginBottom: '8px' }}>Reset Password</h1>
            <p style={{ fontSize: '15px', color: 'var(--tx-muted)', marginBottom: '32px' }}>Enter your institutional email and we'll send you a recovery link.</p>

            {error && (
              <div style={{ marginBottom: '20px', padding: '14px 16px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '14px' }}>
                ❌ {error}
              </div>
            )}

            {message ? (
              <div style={{ padding: '24px', backgroundColor: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.2)', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📬</p>
                <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--g-mid)', marginBottom: '8px' }}>Check your email!</p>
                <p style={{ fontSize: '14px', color: 'var(--g-rich)', marginBottom: '16px' }}>
                  We sent a password reset link to<br /><strong>{email}</strong>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--tx-muted)' }}>
                  Didn't receive it? Check your spam folder or{' '}
                  <button onClick={() => setMessage('')} style={{ color: 'var(--g-mid)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>try again</button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--tx-body)', marginBottom: '8px' }}>Institutional Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="yourname@school.edu.ph"
                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#ffffff', border: '1.5px solid var(--border-mid)', borderRadius: '12px', fontSize: '14px', color: 'var(--tx-bright)', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'var(--bg-overlay)' : 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))',
                  color: '#ffffff', fontWeight: '700', borderRadius: '12px',
                  border: '1px solid rgba(92,219,149,0.15)', fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(7,24,18,0.2)',
                  marginBottom: '16px', transition: 'all 0.2s',
                }}>
                  {loading ? 'Sending...' : '📧 Send Reset Link'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--tx-muted)', marginTop: '24px' }}>
              Remember your password?{' '}
              <Link href="/auth/login" style={{ color: 'var(--g-mid)', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}