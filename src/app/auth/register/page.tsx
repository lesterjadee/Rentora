'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, ShieldCheck, X } from 'lucide-react'

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
      setLoading(false); return
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions before creating an account.')
      setLoading(false); return
    }
    const hasMinLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)
    if (!hasMinLength || !hasUppercase || !hasSymbol) {
      setError('Password must be at least 8 characters, include 1 capital letter, and 1 symbol.')
      setLoading(false); return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, student_id: studentId } }
    })

    if (signUpError) { setError(signUpError.message) }
    else { setMessage('Account created! Check your email to confirm, then log in to upload your ID.') }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        body { background: var(--bg-void); }
        .reg { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .reg-left {
          width: 42%; padding: 56px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
          border-right: 1px solid rgba(6,214,33,0.07);
        }
        .reg-left::before { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(110,255,128,0.05), transparent); pointer-events: none; }
        .reg-right { flex: 1; background: var(--bg-void); display: flex; align-items: center; justify-content: center; padding: 48px; overflow-y: auto; }
        .reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .reg-input { width: 100%; padding: 13px 16px; background: #FFFFFF !important; border: 1.5px solid rgba(4,149,22,0.15) !important; border-radius: 12px; font-size: 14px; color: var(--tx-bright) !important; outline: none; box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .reg-input:focus { border-color: var(--g-vivid) !important; box-shadow: 0 0 0 3px rgba(4,149,22,0.08) !important; }
        .reg-input::placeholder { color: var(--tx-dim) !important; }
        .pw-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--tx-muted); padding: 0; display: flex; align-items: center; }
        @media (max-width: 768px) { .reg-left { display: none; } .reg-right { padding: 32px 20px; } .reg-grid { grid-template-columns: 1fr; } }
      `}</style>

      {showTerms && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowTerms(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid rgba(4,149,22,0.15)', maxWidth: '560px', width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(4,149,22,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 3px' }}>Terms and Conditions</h2>
                <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>Rentora · Gordon College</p>
              </div>
              <button onClick={() => setShowTerms(false)} style={{ width: '34px', height: '34px', background: 'var(--bg-raised)', border: '1px solid var(--border-sub)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} strokeWidth={2} />
              </button>
            </div>
            <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, fontSize: '13px', color: 'var(--tx-muted)', lineHeight: '1.7' }}>
              {[
                ['1. Eligibility', 'Rentora is exclusively for enrolled Gordon College students with a valid @gordoncollege.edu.ph email.'],
                ['2. ID Verification', 'You must upload a valid school ID or government ID after registration. Your ID is only visible to platform administrators.'],
                ['3. User Responsibilities', 'You are responsible for all activity under your account. Provide accurate information at all times.'],
                ['4. Item Listings', "When listing an item, confirm you are the rightful owner and describe the item's condition accurately."],
                ['5. Rental Transactions', 'All agreements are made directly between renter and owner. Rentora facilitates but does not handle payments.'],
                ['6. Trust Score & Reviews', 'Leave truthful reviews based on actual experience. Fabricated reviews are prohibited.'],
                ['7. Privacy', 'Your ID image is stored securely and only accessible to platform administrators. It is never shared publicly.'],
                ['8. Account Termination', 'Rentora may suspend accounts found in violation of these Terms.'],
              ].map(([title, content], i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '700', color: 'var(--tx-body)', margin: '0 0 4px' }}>{title}</p>
                  <p style={{ margin: 0 }}>{content}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(4,149,22,0.08)', display: 'flex', gap: '10px' }}>
              <button onClick={() => { setAgreedToTerms(true); setShowTerms(false) }} className="btn-gold" style={{ flex: 1, justifyContent: 'center', fontSize: '14px', padding: '12px' }}>I Agree</button>
              <button onClick={() => setShowTerms(false)} className="btn-ghost" style={{ padding: '12px 18px', fontSize: '13px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="reg">
        <div className="reg-left">
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/gcoc.png" alt="GC" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0 }}>Rentora</p>
                <p style={{ fontSize: '9px', color: 'var(--g-vivid)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>⚡ Powered by Gordon College</p>
              </div>
            </Link>
            <h2 style={{ fontSize: 'clamp(28px,4vw,36px)', fontWeight: '900', color: 'var(--tx-bright)', lineHeight: '1.15', letterSpacing: '-0.04em', marginBottom: '14px' }}>
              Join the Gordon<br />College community.
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', lineHeight: '1.8', marginBottom: '36px' }}>
              Register with your official school email. After confirming your email, log in to upload your ID for verification.
            </p>
          </div>
          <div style={{ background: 'rgba(110,255,128,0.06)', border: '1px solid rgba(110,255,128,0.12)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', background: 'rgba(110,255,128,0.1)', border: '1px solid rgba(110,255,128,0.15)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={20} color="#6EFF80" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontWeight: '700', color: '#6EFF80', margin: '0 0 5px', fontSize: '13px' }}>Gordon College Students Only</p>
              <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, lineHeight: '1.6' }}>
                Only <strong style={{ color: 'var(--tx-body)' }}>@gordoncollege.edu.ph</strong> emails are accepted.
              </p>
            </div>
          </div>
        </div>

        <div className="reg-right">
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.25)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/gcoc.png" alt="GC" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0 }}>Rentora</p>
                <p style={{ fontSize: '9px', color: 'var(--g-vivid)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gordon College</p>
              </div>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', marginBottom: '6px' }}>Create your account</h1>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '24px' }}>For Gordon College students only</p>

            {error   && <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px' }}>⚠️ {error}</div>}
            {message && <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(4,149,22,0.08)', border: '1px solid rgba(4,149,22,0.2)', borderRadius: '12px', color: 'var(--g-mid)', fontSize: '13px', lineHeight: '1.6' }}>✅ {message}</div>}

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
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="reg-input" style={{ paddingRight: '48px' }} />
                  <button type="button" className="pw-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {[
                      { label: 'At least 8 characters', met: password.length >= 8 },
                      { label: 'At least 1 capital letter (A-Z)', met: /[A-Z]/.test(password) },
                      { label: 'At least 1 symbol (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password) },
                    ].map((rule, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: rule.met ? 'rgba(4,149,22,0.12)' : 'rgba(0,0,0,0.06)', border: `1.5px solid ${rule.met ? 'rgba(4,149,22,0.4)' : 'rgba(0,0,0,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                          {rule.met && <span style={{ fontSize: '9px', color: 'var(--g-rich)', fontWeight: '900' }}>✓</span>}
                        </div>
                        <span style={{ fontSize: '12px', color: rule.met ? 'var(--g-rich)' : 'var(--tx-muted)', fontWeight: rule.met ? '700' : '500', transition: 'all 0.2s' }}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '22px', padding: '14px 16px', background: 'var(--bg-raised)', borderRadius: '12px', border: '1.5px solid rgba(4,149,22,0.1)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ width: '17px', height: '17px', marginTop: '2px', accentColor: 'var(--g-vivid)', flexShrink: 0, cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: 'var(--tx-muted)', lineHeight: '1.6' }}>
                    I agree to the{' '}
                    <button type="button" onClick={() => setShowTerms(true)} style={{ color: 'var(--au-dark)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline', fontFamily: 'inherit' }}>
                      Terms and Conditions
                    </button>
                  </span>
                </label>
              </div>

              <button type="submit" disabled={loading || !agreedToTerms} className="btn-gold"
                style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', opacity: (loading || !agreedToTerms) ? 0.6 : 1 }}>
                {loading ? 'Creating account...' : (<>Create Account <ArrowRight size={16} strokeWidth={2.5} /></>)}
              </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--tx-muted)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--au-dark)', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}