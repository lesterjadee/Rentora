'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function RegisterPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    if (!email.endsWith('.edu.ph')) {
      setError('Only students with a valid institutional email (.edu.ph) can register.')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, student_id: studentId } }
    })
    if (error) { setError(error.message) }
    else { setMessage('Account created! Please check your email to confirm.') }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '14px', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box' as const
  }

  return (
    <>
      <style>{`
        .register-container { display: flex; min-height: 100vh; font-family: system-ui, sans-serif; }
        .register-left { width: 40%; background: linear-gradient(160deg, #1a3a5c 0%, #0f2744 40%, #26619C 100%); padding: 60px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
        .register-right { flex: 1; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 48px; }
        .register-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pw-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; display: flex; align-items: center; justify-content: center; }
        .pw-toggle:hover { color: #64748b; }
        @media (max-width: 768px) {
          .register-left { display: none; }
          .register-right { padding: 32px 24px; }
          .register-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="register-container">
        <div className="register-left">
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
                <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '18px' }}>R</div>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>Rentora</span>
              </div>
            </Link>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Join your campus<br />rental community.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', marginBottom: '40px' }}>
              Open to all college students. Verify with your institutional .edu.ph email.
            </p>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <span style={{ fontSize: '24px' }}>🎓</span>
              <div>
                <p style={{ fontWeight: '700', color: '#ffffff', margin: '0 0 4px', fontSize: '14px' }}>Students Only</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  Any valid <strong style={{ color: '#60a5fa' }}>.edu.ph</strong> institutional email is accepted.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '16px' }}>R</div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#1a3a5c' }}>Rentora</span>
            </div>

            <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>Create your account</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '32px' }}>Free for all college students</p>

            {error && <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '13px' }}>❌ {error}</div>}
            {message && <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#15803d', fontSize: '13px' }}>✅ {message}</div>}

            <form onSubmit={handleRegister}>
              <div className="register-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Full Name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Student ID</label>
                  <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} required placeholder="Student ID" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Institutional Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="yourname@school.edu.ph" style={inputStyle} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required placeholder="Min. 6 characters" minLength={6}
                    style={{ ...inputStyle, paddingRight: '48px' }}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a3a5c, #26619C)',
                color: '#ffffff', fontWeight: '700', borderRadius: '12px',
                border: 'none', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(26,58,92,0.3)'
              }}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#26619C', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}