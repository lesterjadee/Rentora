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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

      {/* Left Panel */}
      <div style={{
        width: '45%', background: 'linear-gradient(160deg, #1a3a5c 0%, #0f2744 40%, #26619C 100%)',
        padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2), transparent)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(38,97,156,0.3), transparent)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
            <div style={{
              width: '38px', height: '38px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              borderRadius: '12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '18px'
            }}>R</div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>Rentora</span>
          </div>

          <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2', letterSpacing: '-0.02em', marginBottom: '20px' }}>
            The smarter way<br />to rent on campus.
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', maxWidth: '340px' }}>
            Connect with verified Gordon College students to rent and lend academic items safely.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', position: 'relative' }}>
          {[
            { icon: '🔐', text: 'Verified students only' },
            { icon: '⭐', text: 'Trust score system' },
            { icon: '🔔', text: 'Real-time updates' },
            { icon: '🎯', text: 'Smart recommendations' },
          ].map((f, i) => (
            <div key={i} style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '14px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '18px' }}>{f.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1, backgroundColor: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '36px' }}>
            Sign in to your Rentora account
          </p>

          {error && (
            <div style={{
              marginBottom: '20px', padding: '14px 16px',
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '12px', color: '#dc2626', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Institutional Email
              </label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="202411738@gordoncollege.edu.ph"
                style={{
                  width: '100%', padding: '14px 16px', backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '14px 16px', backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a3a5c, #26619C)',
              color: '#ffffff', fontWeight: '700', borderRadius: '12px',
              border: 'none', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(26,58,92,0.3)',
              transition: 'all 0.2s'
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link href="/auth/register" style={{ color: '#26619C', fontWeight: '700', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}