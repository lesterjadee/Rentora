'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, ShieldCheck, Star, Bell, Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        body { background: var(--bg-void); }
        .login { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .login-left {
          width: 44%;
          background: linear-gradient(160deg, #060E09 0%, #0A2018 40%, #0D3020 70%, #0C0D10 100%);
          padding: 60px; display: flex; flex-direction: column;
          justify-content: space-between; position: relative;
          overflow: hidden; border-right: 1px solid rgba(34,168,118,0.08);
        }
        .login-left::before { content: ''; position: absolute; top: -100px; right: -100px; width: 350px; height: 350px; border-radius: 50%; background: radial-gradient(circle, rgba(34,168,118,0.07), transparent); pointer-events: none; }
        .login-right { flex: 1; background: var(--bg-void); display: flex; align-items: center; justify-content: center; padding: 52px; }
        .login-input { width: 100%; padding: 14px 16px; background: var(--bg-raised); border: 1px solid var(--border-sub); border-radius: 12px; font-size: 14px; color: var(--tx-bright); outline: none; box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; transition: border-color 0.2s; }
        .login-input::placeholder { color: var(--tx-muted); }
        .login-input:focus { border-color: rgba(201,168,76,0.4); box-shadow: 0 0 0 3px rgba(201,168,76,0.08); }
        .pw-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--tx-muted); padding: 0; display: flex; align-items: center; transition: color 0.2s; }
        .pw-toggle:hover { color: var(--tx-body); }
        @media (max-width: 768px) { .login-left { display: none; } .login-right { padding: 32px 20px; } }
      `}</style>

      <div className="login">
        {/* Left */}
        <div className="login-left">
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '56px' }}>
              <img src="/gcoc.png" alt="Gordon College" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
              <div>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Rentora</p>
                <p style={{ fontSize: '11px', color: 'var(--g-bright)', margin: 0, fontWeight: '600' }}>Gordon College</p>
              </div>
            </Link>
            <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: '900', color: 'var(--tx-bright)', lineHeight: '1.12', letterSpacing: '-0.04em', marginBottom: '16px' }}>
              The smarter way<br />to rent on campus.
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', lineHeight: '1.8', maxWidth: '320px' }}>
              Built exclusively for Gordon College students — borrow, lend, and earn within your school community.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', position: 'relative' }}>
            {[
              { icon: <ShieldCheck size={15} color="#22A876" strokeWidth={2} />, text: 'GC students only' },
              { icon: <Star size={15} color="#C9A84C" strokeWidth={2} />, text: 'Trust scores' },
              { icon: <Bell size={15} color="#93C5FD" strokeWidth={2} />, text: 'Real-time alerts' },
              { icon: <Sparkles size={15} color="#C4B5FD" strokeWidth={2} />, text: 'Smart picks' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-sub)', borderRadius: '12px' }}>
                {f.icon}
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--tx-muted)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="login-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
              <img src="/gcoc.png" alt="Gordon College" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
              <div>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Rentora</p>
                <p style={{ fontSize: '10px', color: 'var(--g-bright)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gordon College</p>
              </div>
            </div>

            <h1 style={{ fontSize: '30px', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', marginBottom: '6px' }}>Welcome back</h1>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '32px' }}>Sign in with your Gordon College account</p>

            {error && (
              <div style={{ marginBottom: '20px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#FCA5A5', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gordon College Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="studentid@gordoncollege.edu.ph" className="login-input" />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" className="login-input" style={{ paddingRight: '48px' }} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? 'var(--bg-raised)' : 'linear-gradient(135deg, #6B4C18, var(--au-mid), #A07828)',
                border: `1px solid ${loading ? 'var(--border-sub)' : 'rgba(201,168,76,0.4)'}`,
                color: loading ? 'var(--tx-muted)' : '#0C0D10',
                fontWeight: '800', borderRadius: '12px', fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.2)',
                transition: 'all 0.25s', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {loading ? 'Signing in...' : (<>Sign In <ArrowRight size={16} strokeWidth={2.5} /></>)}
              </button>

              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <Link href="/auth/forgot-password" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--g-bright)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--tx-muted)' }}>Don't have an account? </span>
                <Link href="/auth/register" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--au-mid)', textDecoration: 'none' }}>
                  Register here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}