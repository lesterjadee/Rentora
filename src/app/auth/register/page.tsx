'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, ShieldCheck, X, Upload } from 'lucide-react'

export default function RegisterPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('ID image must be under 5MB.'); return }
    setIdFile(file)
    setIdPreview(URL.createObjectURL(file))
    setError('')
  }

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
    if (!idFile) {
      setError('Please upload your school ID or a valid government ID to continue.')
      setLoading(false); return
    }

    try {
      // 1. Upload ID image first
      const ext = idFile.name.split('.').pop()
      const path = `${studentId || Date.now()}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('id-images')
        .upload(path, idFile, { upsert: true })
      if (uploadError) throw new Error('Failed to upload ID image. Please try again.')

      const { data: { publicUrl } } = supabase.storage.from('id-images').getPublicUrl(path)

      // 2. Sign up with ID URL in metadata
      const { error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            full_name: fullName,
            student_id: studentId,
            id_image_url: publicUrl,
            id_submitted_at: new Date().toISOString(),
          }
        }
      })
      if (signUpError) throw signUpError

      setMessage('Account created! Please check your email to confirm, then log in.')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: '#FFFFFF', border: '1.5px solid rgba(4,149,22,0.15)',
    borderRadius: '12px', fontSize: '14px', color: 'var(--tx-bright)',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
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
        .id-upload-zone { height: 130px; border: 2px dashed rgba(4,149,22,0.25); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; background: var(--bg-raised); transition: all 0.2s; }
        .id-upload-zone:hover { border-color: rgba(4,149,22,0.4); background: rgba(4,149,22,0.03); }
        @media (max-width: 768px) { .reg-left { display: none; } .reg-right { padding: 32px 20px; } .reg-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Terms Modal */}
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
                ['2. ID Verification', 'You must upload a valid school ID or government ID during registration. Your ID will only be visible to platform administrators for verification purposes.'],
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
              <button onClick={() => { setAgreedToTerms(true); setShowTerms(false) }} className="btn-gold" style={{ flex: 1, justifyContent: 'center', fontSize: '14px', padding: '12px' }}>
                I Agree
              </button>
              <button onClick={() => setShowTerms(false)} className="btn-ghost" style={{ padding: '12px 18px', fontSize: '13px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="reg">
        {/* Left panel */}
        <div className="reg-left">
          <div style={{ position: 'relative' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/gcoc.png" alt="GC" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0 }}>Rentora</p>
                <p style={{ fontSize: '9px', color: 'var(--g-vivid)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gordon College</p>
              </div>
            </Link>
            <h2 style={{ fontSize: 'clamp(28px,4vw,36px)', fontWeight: '900', color: 'var(--tx-bright)', lineHeight: '1.15', letterSpacing: '-0.04em', marginBottom: '14px' }}>
              Join the Gordon<br />College community.
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--tx-muted)', lineHeight: '1.8', marginBottom: '36px' }}>
              Exclusively for Gordon College students. Register using your official school email and a valid ID.
            </p>
          </div>
          <div style={{ background: 'rgba(110,255,128,0.06)', border: '1px solid rgba(110,255,128,0.12)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', background: 'rgba(110,255,128,0.1)', border: '1px solid rgba(110,255,128,0.15)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={20} color="#6EFF80" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontWeight: '700', color: '#6EFF80', margin: '0 0 5px', fontSize: '13px' }}>ID Verification Required</p>
              <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0, lineHeight: '1.6' }}>
                Upload your <strong style={{ color: 'var(--tx-body)' }}>school ID</strong> or a valid <strong style={{ color: 'var(--tx-body)' }}>government ID</strong> to complete registration.
              </p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="reg-right">
          <div style={{ width: '100%', maxWidth: '440px' }}>
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

            {error && (
              <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px', lineHeight: '1.5' }}>
                ⚠️ {error}
              </div>
            )}
            {message && (
              <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(4,149,22,0.08)', border: '1px solid rgba(4,149,22,0.2)', borderRadius: '12px', color: 'var(--g-mid)', fontSize: '13px' }}>
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

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" minLength={6} className="reg-input" style={{ paddingRight: '48px' }} />
                  <button type="button" className="pw-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              {/* ID Upload — REQUIRED */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  School ID or Government ID <span style={{ color: '#EF4444' }}>*</span>
                </label>

                {idPreview ? (
                  <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid rgba(4,149,22,0.2)' }}>
                    <img src={idPreview} alt="ID Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                    <button type="button" onClick={() => { setIdFile(null); setIdPreview('') }}
                      style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFFFFF' }}>
                      <X size={13} strokeWidth={2.5} />
                    </button>
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(4,149,22,0.85)', borderRadius: '6px', padding: '3px 10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>✓ ID uploaded</span>
                    </div>
                  </div>
                ) : (
                  <label className="id-upload-zone">
                    <input type="file" accept="image/*,.pdf" onChange={handleIdFile} style={{ display: 'none' }} />
                    <div style={{ width: '40px', height: '40px', background: 'rgba(4,149,22,0.07)', border: '1px solid rgba(4,149,22,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={18} color="var(--g-rich)" strokeWidth={2} />
                    </div>
                    <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--tx-bright)', margin: 0 }}>Click to upload your ID</p>
                    <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: 0 }}>School ID or Government ID · Max 5MB</p>
                  </label>
                )}

                <p style={{ fontSize: '11px', color: 'var(--tx-dim)', marginTop: '6px', lineHeight: '1.5' }}>
                  🔒 Your ID is only visible to platform administrators for verification. It will never be shown publicly.
                </p>
              </div>

              {/* Terms */}
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

              <button type="submit" disabled={loading || !agreedToTerms || !idFile}
                className="btn-gold"
                style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', opacity: (loading || !agreedToTerms || !idFile) ? 0.6 : 1 }}>
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