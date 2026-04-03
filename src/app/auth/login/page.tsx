'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <>
      <style>{`
        .login-container { display: flex; min-height: 100vh; font-family: system-ui, sans-serif; }
        .login-left { width: 45%; background: linear-gradient(160deg, #1a3a5c 0%, #0f2744 40%, #26619C 100%); padding: 60px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
        .login-right { flex: 1; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 48px; }
        .login-features { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-container">
        <div className="login-left">
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.2), transparent)' }} />

          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
                <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '18px' }}>R</div>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>Rentora</span>
              </div>
            </Link>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2', letterSpacing: '-0.02em', marginBottom: '20px' }}>
              The smarter way<br />to rent on campus.
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', maxWidth: '340px' }}>
              Connect with verified Gordon College students to rent and lend academic items safely.
            </p>
          </div>

          <div className="login-features">
            {[
              { icon: '🔐', text: 'Verified students only' },
              { icon: '⭐', text: 'Trust score system' },
              { icon: '🔔', text: 'Real-time updates' },
              { icon: '🎯', text: 'Smart recommendations' },
            ].map((f, i) => (
              <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{f.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '16px' }}>R</div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#1a3a5c' }}>Rentora</span>
            </div>

            <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>Welcome back</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '36px' }}>Sign in to your Rentora account</p>

            {error && (
              <div style={{ marginBottom: '20px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Institutional Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="202411738@gordoncollege.edu.ph"
                  style={{ width: '100%', padding: '14px 16px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Password</label>
                  <Link href="/auth/forgot-password" style={{ fontSize: '13px', fontWeight: '600', color: '#26619C', textDecoration: 'none' }}>Forgot password?</Link>
                </div>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '14px 16px', backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a3a5c, #26619C)',
                color: '#ffffff', fontWeight: '700', borderRadius: '12px',
                border: 'none', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(26,58,92,0.3)'
              }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              Don't have an account?{' '}
              <Link href="/auth/register" style={{ color: '#26619C', fontWeight: '700', textDecoration: 'none' }}>Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}