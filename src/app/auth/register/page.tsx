'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    if (!email.endsWith('@gordoncollege.edu.ph')) {
      setError('Only Gordon College students can register. Please use your @gordoncollege.edu.ph email.')
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
    boxSizing: 'border-box' as const, transition: 'border-color 0.2s'
  }

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '600' as const,
    color: '#374151', marginBottom: '8px'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

      {/* Left Panel */}
      <div style={{
        width: '40%', background: 'linear-gradient(160deg, #1a3a5c 0%, #0f2744 40%, #26619C 100%)',
        padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{
              width: '38px', height: '38px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              borderRadius: '12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '18px'
            }}>R</div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>Rentora</span>
          </div>

          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Join your campus<br />rental community.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', marginBottom: '40px' }}>
            Exclusive to Gordon College students. Verify your identity with your institutional email.
          </p>

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px', padding: '20px',
            display: 'flex', alignItems: 'flex-start', gap: '14px'
          }}>
            <span style={{ fontSize: '24px' }}>🎓</span>
            <div>
              <p style={{ fontWeight: '700', color: '#ffffff', margin: '0 0 4px', fontSize: '14px' }}>Gordon College Only</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Only <strong style={{ color: '#60a5fa' }}>@gordoncollege.edu.ph</strong> emails are accepted on this platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1, backgroundColor: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '32px' }}>
            Free forever for Gordon College students
          </p>

          {error && (
            <div style={{
              marginBottom: '16px', padding: '14px 16px',
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '12px', color: '#dc2626', fontSize: '13px'
            }}>❌ {error}</div>
          )}
          {message && (
            <div style={{
              marginBottom: '16px', padding: '14px 16px',
              backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '12px', color: '#15803d', fontSize: '13px'
            }}>✅ {message}</div>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Lester Jade" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Student ID</label>
                <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} required placeholder="202411738" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Institutional Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="202411738@gordoncollege.edu.ph" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 6 characters" minLength={6} style={inputStyle} />
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
  )
}