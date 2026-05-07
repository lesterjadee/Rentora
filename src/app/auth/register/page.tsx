'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, X, ArrowRight, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    if (!email.endsWith('@gordoncollege.edu.ph')) {
      setError('Only Gordon College students with a valid @gordoncollege.edu.ph email can register.')
      setLoading(false)
      return
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions before creating an account.')
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'var(--bg-raised)', border: '1px solid var(--border-sub)',
    borderRadius: '12px', fontSize: '14px', color: 'var(--tx-bright)',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    transition: 'border-color 0.2s'
  }

  const termsContent = [
    { title: '1. Eligibility', content: 'Rentora is exclusively available to currently enrolled Gordon College students with a valid @gordoncollege.edu.ph email address. By registering, you confirm that you are an active Gordon College student.' },
    { title: '2. User Responsibilities', content: 'You are responsible for all activity under your account. You agree to provide accurate information when creating listings, submitting rental requests, and leaving reviews.' },
    { title: '3. Item Listings', content: 'When listing an item, you confirm you are the rightful owner and have the right to lend it. You agree to accurately describe the item\'s condition and set a fair price.' },
    { title: '4. Rental Transactions', content: 'All rental agreements are made directly between the renter and owner. Rentora facilitates these agreements but is not a party to any transaction and does not handle payments.' },
    { title: '5. Trust Score and Reviews', content: 'You agree to leave reviews that are truthful and based on your actual experience. Fabricated or malicious reviews are prohibited.' },
    { title: '6. Item Condition and Responsibility', content: 'Renters are responsible for returning items in the same condition received. Any damage caused during the rental period is the responsibility of the renter.' },
    { title: '7. Privacy', content: 'Rentora collects your name, student ID, and Gordon College email for account creation. This information is stored securely and never sold to third parties.' },
    { title: '8. Account Termination', content: 'Rentora reserves the right to suspend or terminate accounts found in violation of these Terms. Users who engage in fraud or harassment may be removed without prior notice.' },
  ]

  return (
    <>
      <style>{`
        body { background: var(--bg-void); }
        .reg { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .reg-left {
          width: 42%;
          background: linear-gradient(160deg, #060E09 0%, #0A2018 40%, #0D3020 70%, #0C0D10 100%);
          padding: 56px; display: flex; flex-direction: column;
          justify-content: space-between; position: relative;
          overflow: hidden; border-right: 1px solid rgba(34,168,118,0.08);
        }
        .reg-left::before { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(34,168,118,0.06), transparent); pointer-events: none; }
        .reg-right { flex: 1; background: var(--bg-void); display: flex; align-items: center; justify-content: center; padding: 48px; overflow-y: auto; }
        .reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .reg-input { width: 100%; padding: 13px 16px; background: var(--bg-raised); border: 1px solid var(--border-sub); border-radius: 12px; font-size: 14px; color: var(--tx-bright); outline: none; box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; transition: border-color 0.2s; }
        .reg-input::placeholder { color: var(--tx-muted); }
        .reg-input:focus { border-color: rgba(201,168,76,0.4); box-shadow: 0 0 0 3px rgba(201,168,76,0.08); }
        .pw-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--tx-muted); padding: 0; display: flex; align-items: center; transition: color 0.2s; }
        .pw-toggle:hover { color: var(--tx-body); }
        @media (max-width: 768px) { .reg-left { display: none; } .reg-right { padding: 32px 20px; } .reg-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Terms Modal */}
      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowTerms(false) }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-mid)', maxWidth: '580px', width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-sub)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>Terms and Conditions</h2>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>Rentora · Gordon College</p>
              </div>
              <button onClick={() => setShowTerms(false)} style={{ width: '34px', height: '34px', background: 'var(--bg-raised)', border: '1px solid var(--border-sub)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--tx-muted)' }}>
                <X size={15} strokeWidth={2} />
              </button>
            </div>
            <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--tx-muted)', lineHeight: '1.7', marginBottom: '18px' }}>
                Last updated: January 2026. Please read these Terms carefully before creating an account on Rentora.
              </p>
              {termsContent.map((s, i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx-body)', marginBottom: '5px' }}>{s.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--tx-muted)', lineHeight: '1.7', margin: 0 }}>{s.content}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-sub)', flexShrink: 0, display: 'flex', gap: '10px' }}>
              <button onClick={() => { setAgreedToTerms(true); setShowTerms(false) }} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #6B4C18, var(--au-mid), #A07828)', border: '1px solid rgba(201,168,76,0.4)', color: '#0C0D10', fontWeight: '800', borderRadius: '11px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                I Agree to the Terms
              </button>
              <button onClick={() => setShowTerms(false)} style={{ padding: '12px 18px', background: 'var(--bg-raised)', color: 'var(--tx-muted)', fontWeight: '600', borderRadius: '11px', border: '1px solid var(--border-sub)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="reg">
        {/* Left panel */}
        <div className="reg-left">
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <img src="/gcoc.png" alt="Gordon College" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
              <div>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Rentora</p>
                <p style={{ fontSize: '11px', color: 'var(--g-bright)', margin: 0, fontWeight: '600' }}>Gordon College</p>
              </div>
            </Link>
            <h2 style={{ fontSize: 'clamp(28px,4vw,36px)', fontWeight: '900', color: 'var(--tx-bright)', lineHeight: '1.15', letterSpacing: '-0.04em', marginBottom: '14px' }}>
              Join the Gordon<br />College community.
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', lineHeight: '1.8', marginBottom: '36px' }}>
              Exclusively for Gordon College students. Register using your official school email to get started.
            </p>
          </div>
          <div style={{ background: 'rgba(34,168,118,0.06)', border: '1px solid rgba(34,168,118,0.15)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
            <div style={{ width: '38px', height: '38px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={20} color="#22A876" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontWeight: '700', color: 'var(--g-neon)', margin: '0 0 5px', fontSize: '13px' }}>Gordon College Students Only</p>
              <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, lineHeight: '1.6' }}>
                Only <strong style={{ color: 'var(--tx-body)' }}>@gordoncollege.edu.ph</strong> emails are accepted on this platform.
              </p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="reg-right">
          <div style={{ width: '100%', maxWidth: '420px' }}>

            {/* Logo top */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
              <img src="/gcoc.png" alt="Gordon College" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
              <div>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.02em' }}>Rentora</p>
                <p style={{ fontSize: '10px', color: 'var(--g-bright)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gordon College</p>
              </div>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', marginBottom: '6px' }}>Create your account</h1>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '28px' }}>For Gordon College students only</p>

            {error && (
              <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#FCA5A5', fontSize: '13px', lineHeight: '1.5' }}>
                ⚠️ {error}
              </div>
            )}
            {message && (
              <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.25)', borderRadius: '12px', color: 'var(--g-neon)', fontSize: '13px' }}>
                ✅ {message}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="reg-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Full Name" className="reg-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Student ID</label>
                  <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} required placeholder="e.g. 202411738" className="reg-input" />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gordon College Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="studentid@gordoncollege.edu.ph" className="reg-input" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" minLength={6} className="reg-input" style={{ paddingRight: '48px' }} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              {/* Terms checkbox */}
              <div style={{ marginBottom: '22px', padding: '14px 16px', background: 'var(--bg-raised)', borderRadius: '12px', border: '1px solid var(--border-sub)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ width: '17px', height: '17px', marginTop: '2px', accentColor: '#C9A84C', flexShrink: 0, cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: 'var(--tx-muted)', lineHeight: '1.6' }}>
                    By creating an account, you agree to the{' '}
                    <button type="button" onClick={() => setShowTerms(true)} style={{ color: 'var(--au-mid)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
                      Terms and Conditions
                    </button>
                    {' '}of Rentora.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={loading || !agreedToTerms} style={{
                width: '100%', padding: '14px',
                background: loading || !agreedToTerms ? 'var(--bg-raised)' : 'linear-gradient(135deg, #6B4C18, var(--au-mid), #A07828)',
                border: `1px solid ${loading || !agreedToTerms ? 'var(--border-sub)' : 'rgba(201,168,76,0.4)'}`,
                color: loading || !agreedToTerms ? 'var(--tx-muted)' : '#0C0D10',
                fontWeight: '800', borderRadius: '12px', fontSize: '15px',
                cursor: loading || !agreedToTerms ? 'not-allowed' : 'pointer',
                boxShadow: !agreedToTerms ? 'none' : '0 4px 20px rgba(201,168,76,0.2)',
                transition: 'all 0.25s', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {loading ? 'Creating account...' : (<>Create Account <ArrowRight size={16} strokeWidth={2.5} /></>)}
              </button>
            </form>

            <p style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--tx-muted)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--au-mid)', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}