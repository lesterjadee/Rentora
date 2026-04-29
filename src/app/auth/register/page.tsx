'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, X, ArrowRight } from 'lucide-react'

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
    if (!email.endsWith('.edu.ph')) {
      setError('Only students with a valid institutional email (.edu.ph) can register.')
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
    background: '#111111', border: '1px solid #1C1C1C',
    borderRadius: '12px', fontSize: '14px', color: '#F0F0F0',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  }

  const termsContent = [
    { title: '1. Eligibility', content: 'Rentora is exclusively available to currently enrolled college students with a valid institutional (.edu.ph) email address. By registering, you confirm that you are an active student.' },
    { title: '2. User Responsibilities', content: 'You are responsible for all activity under your account. You agree to provide accurate information when creating listings, submitting rental requests, and leaving reviews.' },
    { title: '3. Item Listings', content: 'When listing an item, you confirm you are the rightful owner and have the right to lend it. You agree to accurately describe the item\'s condition and set a fair price.' },
    { title: '4. Rental Transactions', content: 'All rental agreements are made directly between the renter and owner. Rentora facilitates these agreements but is not a party to any transaction and does not handle payments.' },
    { title: '5. Trust Score and Reviews', content: 'You agree to leave reviews that are truthful and based on your actual experience. Fabricated or malicious reviews are prohibited.' },
    { title: '6. Item Condition and Responsibility', content: 'Renters are responsible for returning items in the same condition received. Any damage caused during the rental period is the responsibility of the renter.' },
    { title: '7. Privacy', content: 'Rentora collects your name, student ID, and institutional email for account creation. This information is stored securely and never sold to third parties.' },
    { title: '8. Account Termination', content: 'Rentora reserves the right to suspend or terminate accounts found in violation of these Terms. Users who engage in fraud or harassment may be removed without prior notice.' },
  ]

  return (
    <>
      <style>{`
        body { background: #0A0A0A; }
        .reg-container { display: flex; min-height: 100vh; font-family: system-ui, sans-serif; }
        .reg-left { width: 40%; background: linear-gradient(160deg, #0A2118, #0F3D2E 60%, #0A0A0A); padding: 60px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border-right: 1px solid #1C1C1C; }
        .reg-right { flex: 1; background: #0A0A0A; display: flex; align-items: center; justify-content: center; padding: 48px; overflow-y: auto; }
        .reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .reg-input { width: 100%; padding: 13px 16px; background: #111111; border: 1px solid #1C1C1C; border-radius: 12px; font-size: 14px; color: #F0F0F0; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
        .reg-input::placeholder { color: #606060; }
        .reg-input:focus { border-color: rgba(46,204,143,0.4); }
        .pw-toggle-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #606060; padding: 0; display: flex; align-items: center; transition: color 0.2s; }
        .pw-toggle-btn:hover { color: #A3A3A3; }
        @media (max-width: 768px) {
          .reg-left { display: none; }
          .reg-right { padding: 32px 24px; }
          .reg-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Terms Modal */}
      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={(e) => { if (e.target === e.currentTarget) setShowTerms(false) }}>
          <div style={{ background: '#111111', borderRadius: '20px', border: '1px solid #1C1C1C', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
            <div style={{ padding: '22px 26px', borderBottom: '1px solid #1C1C1C', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#F0F0F0', margin: '0 0 3px' }}>Terms and Conditions</h2>
                <p style={{ fontSize: '12px', color: '#606060', margin: 0 }}>Rentora Student Item Rental Hub</p>
              </div>
              <button onClick={() => setShowTerms(false)} style={{ width: '34px', height: '34px', background: '#1C1C1C', border: '1px solid #2E2E2E', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A3A3A3' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div style={{ padding: '24px 26px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: '13px', color: '#606060', lineHeight: '1.7', marginBottom: '20px' }}>
                Last updated: January 2026. Please read these Terms carefully before creating an account.
              </p>
              {termsContent.map((section, i) => (
                <div key={i} style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#A3A3A3', marginBottom: '6px' }}>{section.title}</h3>
                  <p style={{ fontSize: '13px', color: '#606060', lineHeight: '1.7', margin: 0 }}>{section.content}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '18px 26px', borderTop: '1px solid #1C1C1C', flexShrink: 0, display: 'flex', gap: '10px' }}>
              <button onClick={() => { setAgreedToTerms(true); setShowTerms(false) }} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)', border: '1px solid rgba(46,204,143,0.3)', color: '#2ECC8F', fontWeight: '700', borderRadius: '11px', fontSize: '14px', cursor: 'pointer' }}>
                I Agree to the Terms
              </button>
              <button onClick={() => setShowTerms(false)} style={{ padding: '12px 18px', background: '#1C1C1C', color: '#A3A3A3', fontWeight: '600', borderRadius: '11px', border: '1px solid #2E2E2E', fontSize: '13px', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="reg-container">
        {/* Left */}
        <div className="reg-left">
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,143,0.05), transparent)', pointerEvents: 'none' }} />
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '56px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)', border: '1px solid rgba(46,204,143,0.3)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#2ECC8F', fontSize: '17px' }}>R</div>
            <span style={{ fontSize: '21px', fontWeight: '800', background: 'linear-gradient(135deg, #2ECC8F, #4EDDAA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rentora</span>
          </Link>
          <h2 style={{ fontSize: '34px', fontWeight: '900', color: '#F0F0F0', lineHeight: '1.2', letterSpacing: '-0.04em', marginBottom: '14px' }}>
            Join your campus<br />rental community.
          </h2>
          <p style={{ fontSize: '14px', color: '#606060', lineHeight: '1.8', marginBottom: '36px' }}>
            Open to all college students. Verify with your .edu.ph institutional email.
          </p>
          <div style={{ background: 'rgba(46,204,143,0.06)', border: '1px solid rgba(46,204,143,0.15)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(46,204,143,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎓</div>
            <div>
              <p style={{ fontWeight: '700', color: '#2ECC8F', margin: '0 0 4px', fontSize: '13px' }}>Students Only</p>
              <p style={{ fontSize: '12px', color: '#606060', margin: 0, lineHeight: '1.6' }}>
                Any valid <strong style={{ color: '#4EDDAA' }}>.edu.ph</strong> institutional email is accepted on this platform.
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="reg-right">
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '36px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#F0F0F0', letterSpacing: '-0.04em', marginBottom: '8px' }}>Create your account</h1>
              <p style={{ fontSize: '14px', color: '#606060' }}>Free for all college students</p>
            </div>

            {error && <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#FCA5A5', fontSize: '13px' }}>{error}</div>}
            {message && <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(46,204,143,0.08)', border: '1px solid rgba(46,204,143,0.2)', borderRadius: '12px', color: '#2ECC8F', fontSize: '13px' }}>{message}</div>}

            <form onSubmit={handleRegister}>
              <div className="reg-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A3A3A3', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Full Name" className="reg-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A3A3A3', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Student ID</label>
                  <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} required placeholder="Student ID" className="reg-input" />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A3A3A3', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>School Email (.edu.ph)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="yourname@school.edu.ph" className="reg-input" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A3A3A3', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 6 characters" minLength={6} className="reg-input" style={{ paddingRight: '48px' }} />
                  <button type="button" className="pw-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              {/* Terms checkbox */}
              <div style={{ marginBottom: '24px', padding: '16px', background: '#111111', borderRadius: '12px', border: '1px solid #1C1C1C' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ width: '17px', height: '17px', marginTop: '2px', accentColor: '#2ECC8F', flexShrink: 0, cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: '#A3A3A3', lineHeight: '1.6' }}>
                    By creating an account, you agree to the{' '}
                    <button type="button" onClick={() => setShowTerms(true)} style={{ color: '#2ECC8F', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline' }}>
                      Terms and Conditions
                    </button>
                    {' '}of Rentora.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={loading || !agreedToTerms} style={{
                width: '100%', padding: '14px',
                background: loading || !agreedToTerms ? '#1C1C1C' : 'linear-gradient(135deg, #0F3D2E, #1A7A57)',
                border: `1px solid ${loading || !agreedToTerms ? '#2E2E2E' : 'rgba(46,204,143,0.3)'}`,
                color: loading || !agreedToTerms ? '#606060' : '#2ECC8F',
                fontWeight: '700', borderRadius: '12px',
                fontSize: '15px', cursor: loading || !agreedToTerms ? 'not-allowed' : 'pointer',
                boxShadow: !agreedToTerms ? 'none' : '0 4px 20px rgba(15,61,46,0.4)',
                transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {loading ? 'Creating account...' : (<>Create Account <ArrowRight size={16} strokeWidth={2.5} /></>)}
              </button>
            </form>

            <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#606060' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#2ECC8F', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}