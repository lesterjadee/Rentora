'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Handle the hash fragment from Supabase email link
    const handleSession = async () => {
      // Get hash params from URL
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (accessToken && type === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })
          if (!error) {
            setReady(true)
            setChecking(false)
            return
          }
        }
      }

      // Check existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setReady(true)
      } else {
        setError('This reset link has expired or is invalid. Please request a new one.')
      }
      setChecking(false)
    }

    handleSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
        setChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully!')
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        .reset-container { display: flex; min-height: 100vh; font-family: system-ui, sans-serif; }
        .reset-left { width: 40%; background: linear-gradient(160deg, #1a3a5c 0%, #0f2744 40%, #26619C 100%); padding: 60px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
        .reset-right { flex: 1; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 48px; }
        @media (max-width: 768px) {
          .reset-left { display: none; }
          .reset-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="reset-container">
        <div className="reset-left">
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
                <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '18px' }}>R</div>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>Rentora</span>
              </div>
            </Link>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Create a new<br />password.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', marginBottom: '40px' }}>
              Choose a strong password to keep your Rentora account secure.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['At least 6 characters', 'Mix of letters and numbers', 'Avoid using your student ID'].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px' }}>✅</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="reset-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '24px' }}>🔒</div>

            <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>New Password</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '32px' }}>Enter and confirm your new password below.</p>

            {checking ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <p style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</p>
                <p>Verifying your reset link...</p>
              </div>
            ) : error && !ready ? (
              <div>
                <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ fontSize: '32px', marginBottom: '12px' }}>❌</p>
                  <p style={{ fontWeight: '700', fontSize: '16px', color: '#dc2626', marginBottom: '8px' }}>Link Expired</p>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>{error}</p>
                </div>
                <Link href="/auth/forgot-password" style={{ display: 'block', textAlign: 'center', padding: '14px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', color: '#ffffff', fontWeight: '700', borderRadius: '12px', textDecoration: 'none', fontSize: '15px' }}>
                  Request New Reset Link →
                </Link>
              </div>
            ) : message ? (
              <div style={{ padding: '24px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</p>
                <p style={{ fontWeight: '700', fontSize: '16px', color: '#15803d', marginBottom: '8px' }}>Password Updated!</p>
                <p style={{ fontSize: '14px', color: '#16a34a' }}>Redirecting you to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>❌ {error}</div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>New Password</label>
                  <input
                    type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required placeholder="Min. 6 characters" minLength={6}
                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Confirm New Password</label>
                  <input
                    type="password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required placeholder="Repeat your password"
                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#ffffff', border: `1.5px solid ${confirmPassword && confirmPassword !== password ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '12px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px' }}>⚠️ Passwords don't match</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '6px' }}>✅ Passwords match!</p>
                  )}
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #059669, #10b981)',
                  color: '#ffffff', fontWeight: '700', borderRadius: '12px',
                  border: 'none', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.3)'
                }}>
                  {loading ? 'Updating...' : '🔒 Update Password'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
              <Link href="/auth/login" style={{ color: '#26619C', fontWeight: '700', textDecoration: 'none' }}>← Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}