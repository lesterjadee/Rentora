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
        .forgot-container { display: flex; min-height: 100vh; font-family: system-ui, sans-serif; }
        .forgot-left { width: 40%; background: linear-gradient(160deg, #1a3a5c 0%, #0f2744 40%, #26619C 100%); padding: 60px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
        .forgot-right { flex: 1; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 48px; }
        @media (max-width: 768px) {
          .forgot-left { display: none; }
          .forgot-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="forgot-container">
        <div className="forgot-left">
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent)' }} />
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
                <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '18px' }}>R</div>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>Rentora</span>
              </div>
            </Link>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Forgot your<br />password?
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', marginBottom: '40px' }}>
              No worries! Enter your institutional email and we'll send you a reset link instantly.
            </p>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <span style={{ fontSize: '24px' }}>🔐</span>
              <div>
                <p style={{ fontWeight: '700', color: '#ffffff', margin: '0 0 4px', fontSize: '14px' }}>Secure Reset</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  The reset link expires in <strong style={{ color: '#60a5fa' }}>1 hour</strong> for your security.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="forgot-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '16px' }}>R</div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#1a3a5c' }}>Rentora</span>
            </div>

            <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '24px' }}>🔑</div>

            <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>Reset Password</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '32px' }}>Enter your institutional email and we'll send you a recovery link.</p>

            {error && (
              <div style={{ marginBottom: '20px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>❌ {error}</div>
            )}

            {message ? (
              <div style={{ padding: '24px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📬</p>
                <p style={{ fontWeight: '700', fontSize: '16px', color: '#15803d', marginBottom: '8px' }}>Check your email!</p>
                <p style={{ fontSize: '14px', color: '#16a34a', marginBottom: '16px' }}>
                  We sent a password reset link to<br /><strong>{email}</strong>
                </p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Didn't receive it? Check your spam folder or{' '}
                  <button onClick={() => setMessage('')} style={{ color: '#26619C', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>try again</button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Institutional Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="yourname@school.edu.ph"
                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a3a5c, #26619C)',
                  color: '#ffffff', fontWeight: '700', borderRadius: '12px',
                  border: 'none', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(26,58,92,0.3)', marginBottom: '16px'
                }}>
                  {loading ? 'Sending...' : '📧 Send Reset Link'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
              Remember your password?{' '}
              <Link href="/auth/login" style={{ color: '#26619C', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}