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
        body { background: #0A0A0A; }
        .auth-container { display: flex; min-height: 100vh; font-family: system-ui, sans-serif; }
        .auth-left { width: 44%; background: linear-gradient(160deg, #0A2118 0%, #0F3D2E 60%, #0A0A0A 100%); padding: 60px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; border-right: 1px solid #1C1C1C; }
        .auth-right { flex: 1; background: #0A0A0A; display: flex; align-items: center; justify-content: center; padding: 48px; }
        .auth-input {
          width: 100%; padding: 14px 16px;
          background: #111111; border: 1px solid #1C1C1C;
          border-radius: 12px; font-size: 14px; color: #F0F0F0;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .auth-input::placeholder { color: #606060; }
        .auth-input:focus { border-color: rgba(46,204,143,0.4); }
        .auth-btn-primary {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #0F3D2E, #1A7A57);
          border: 1px solid rgba(46,204,143,0.3);
          color: #2ECC8F; font-weight: 700; border-radius: 12px;
          font-size: 15px; cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(15,61,46,0.4);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn-primary:hover {
          background: linear-gradient(135deg, #145C42, #1A7A57);
          box-shadow: 0 4px 30px rgba(46,204,143,0.2);
          transform: translateY(-1px);
        }
        .auth-btn-primary:disabled { background: #1C1C1C; border-color: #2E2E2E; color: #606060; cursor: not-allowed; transform: none; box-shadow: none; }
        .auth-feature-pill {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 12px 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .pw-toggle-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; cursor: pointer; color: #606060;
          padding: 0; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .pw-toggle-btn:hover { color: #A3A3A3; }
        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="auth-container">
        {/* Left */}
        <div className="auth-left">
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,143,0.06), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,143,0.04), transparent)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)', border: '1px solid rgba(46,204,143,0.3)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#2ECC8F', fontSize: '17px' }}>R</div>
              <span style={{ fontSize: '21px', fontWeight: '800', background: 'linear-gradient(135deg, #2ECC8F, #4EDDAA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rentora</span>
            </Link>
            <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#F0F0F0', lineHeight: '1.15', letterSpacing: '-0.04em', marginBottom: '16px' }}>
              The smarter way<br />to rent on campus.
            </h2>
            <p style={{ fontSize: '15px', color: '#606060', lineHeight: '1.8', maxWidth: '320px' }}>
              Connect with verified students to rent and lend academic items safely.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', position: 'relative' }}>
            {[
              { icon: <ShieldCheck size={16} color="#2ECC8F" strokeWidth={2} />, text: 'Verified students' },
              { icon: <Star size={16} color="#F59E0B" strokeWidth={2} />, text: 'Trust scores' },
              { icon: <Bell size={16} color="#A78BFA" strokeWidth={2} />, text: 'Real-time alerts' },
              { icon: <Sparkles size={16} color="#3B82F6" strokeWidth={2} />, text: 'Smart picks' },
            ].map((f, i) => (
              <div key={i} className="auth-feature-pill">
                {f.icon}
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#A3A3A3' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="auth-right">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#F0F0F0', letterSpacing: '-0.04em', marginBottom: '8px' }}>Welcome back</h1>
              <p style={{ fontSize: '14px', color: '#606060' }}>Sign in to your Rentora account</p>
            </div>

            {error && (
              <div style={{ marginBottom: '20px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#FCA5A5', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A3A3A3', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  School Email
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="yourname@school.edu.ph" className="auth-input" />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A3A3A3', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" className="auth-input" style={{ paddingRight: '48px' }} />
                  <button type="button" className="pw-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-btn-primary" style={{ marginBottom: '16px' }}>
                {loading ? 'Signing in...' : (<>Sign In <ArrowRight size={16} strokeWidth={2.5} /></>)}
              </button>

              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <Link href="/auth/forgot-password" style={{ fontSize: '13px', fontWeight: '600', color: '#2ECC8F', textDecoration: 'none', opacity: 0.8, transition: 'opacity 0.2s' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#606060' }}>Don't have an account? </span>
                <Link href="/auth/register" style={{ fontSize: '13px', fontWeight: '700', color: '#2ECC8F', textDecoration: 'none' }}>Register here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}