'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, X } from 'lucide-react'

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
        .register-right { flex: 1; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 48px; overflow-y: auto; }
        .register-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pw-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; display: flex; align-items: center; justify-content: center; }
        .pw-toggle:hover { color: #64748b; }
        .terms-modal-overlay { position: fixed; inset: 0; backgroundColor: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .terms-modal { background: #ffffff; borderRadius: 20px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 32px; position: relative; }
        @media (max-width: 768px) {
          .register-left { display: none; }
          .register-right { padding: 32px 24px; }
          .register-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowTerms(false) }}
        >
          <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '620px', width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>Terms and Conditions</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Rentora Student Item Rental Hub</p>
              </div>
              <button onClick={() => setShowTerms(false)} style={{ width: '36px', height: '36px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color="#64748b" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.7', marginBottom: '20px' }}>
                Last updated: January 2026. Please read these Terms and Conditions carefully before creating an account on Rentora. By registering, you confirm that you have read, understood, and agreed to be bound by these terms.
              </p>

              {[
                {
                  title: '1. Eligibility',
                  content: 'Rentora is exclusively available to currently enrolled college students with a valid institutional (.edu.ph) email address. By registering, you confirm that you are an active student and that the email address you used to sign up belongs to you. Rentora reserves the right to suspend or remove any account found to be using an email address that does not belong to the registered user.'
                },
                {
                  title: '2. User Responsibilities',
                  content: 'As a registered user of Rentora, you are responsible for all activity that occurs under your account. You agree to provide accurate and truthful information when creating listings, submitting rental requests, and leaving reviews. You are expected to treat other users with respect and professionalism at all times. Any form of harassment, fraud, or misuse of the platform will result in immediate account suspension.'
                },
                {
                  title: '3. Item Listings',
                  content: 'When listing an item on Rentora, you confirm that you are the rightful owner of the item and that you have the right to lend it to others. You agree to accurately describe the item\'s condition, provide clear photos, and set a fair and reasonable daily rental price. Rentora does not allow the listing of illegal, dangerous, or prohibited items. Any listing found to be in violation of this policy will be removed without prior notice.'
                },
                {
                  title: '4. Rental Transactions',
                  content: 'All rental agreements are made directly between the renter and the owner. Rentora serves as a platform to facilitate these agreements and is not a party to any rental transaction. Rentora does not handle payments between users. All payment arrangements must be agreed upon and settled directly between the renter and the owner. Rentora is not responsible for any disputes, losses, or damages arising from rental transactions between users.'
                },
                {
                  title: '5. Trust Score and Reviews',
                  content: 'The Trust Score and review system on Rentora is designed to promote honesty and accountability among users. You agree to leave reviews that are truthful, fair, and based on your actual experience with the other party. Fabricated, misleading, or malicious reviews are strictly prohibited. Rentora reserves the right to remove any review that violates this policy and may take action against the account responsible.'
                },
                {
                  title: '6. Item Condition and Responsibility',
                  content: 'Owners are responsible for accurately representing the condition of their items at the time of listing. Renters are responsible for returning items in the same condition they received them. Any damage caused during the rental period is the responsibility of the renter. Rentora does not provide insurance or compensation for damaged, lost, or stolen items and is not liable for any losses incurred as a result of a rental transaction.'
                },
                {
                  title: '7. Privacy',
                  content: 'Rentora collects basic personal information including your name, student ID, and institutional email address for the purpose of account creation and verification. This information is stored securely in our database and is never sold or shared with third parties outside of what is necessary to operate the platform. By registering, you consent to the collection and use of your information as described in this section.'
                },
                {
                  title: '8. Account Termination',
                  content: 'Rentora reserves the right to suspend or permanently terminate any account that is found to be in violation of these Terms and Conditions. Users who engage in fraudulent activity, harassment, misrepresentation, or any other form of misconduct may have their accounts removed without prior notice. Users who wish to delete their own accounts may do so by contacting the platform administrator.'
                },
                {
                  title: '9. Changes to Terms',
                  content: 'Rentora reserves the right to update or modify these Terms and Conditions at any time. Users will be notified of significant changes through the platform. Continued use of Rentora after any changes have been made constitutes acceptance of the updated terms.'
                },
                {
                  title: '10. Contact',
                  content: 'If you have any questions or concerns about these Terms and Conditions, you may reach out through the platform. Rentora is a student project developed for academic purposes as part of a college course in Application Development and Emerging Technologies.'
                },
              ].map((section, i) => (
                <div key={i} style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{section.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.7', margin: 0 }}>{section.content}</p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid #f1f5f9', flexShrink: 0, display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setAgreedToTerms(true); setShowTerms(false) }}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', color: '#ffffff', fontWeight: '700', borderRadius: '12px', border: 'none', fontSize: '14px', cursor: 'pointer' }}
              >
                I Agree to the Terms
              </button>
              <button
                onClick={() => setShowTerms(false)}
                style={{ padding: '12px 20px', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: '600', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="register-container">
        {/* Left Panel */}
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

        {/* Right Panel */}
        <div className="register-right">
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #1a3a5c, #26619C)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '16px' }}>R</div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#1a3a5c' }}>Rentora</span>
            </div>

            <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>Create your account</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '32px' }}>Free for all college students</p>

            {error && <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '13px' }}>
              {error}
            </div>}
            {message && <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#15803d', fontSize: '13px' }}>
              {message}
            </div>}

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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>School Email (.edu.ph)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="yourname@school.edu.ph" style={inputStyle} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required placeholder="Min. 6 characters" minLength={6}
                    style={{ ...inputStyle, paddingRight: '48px' }}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions checkbox */}
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ width: '18px', height: '18px', marginTop: '1px', accentColor: '#26619C', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                    By creating an account, you agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      style={{ color: '#26619C', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline' }}
                    >
                      Terms and Conditions
                    </button>
                    {' '}of Rentora. Please read them carefully before proceeding.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={loading || !agreedToTerms} style={{
                width: '100%', padding: '14px',
                background: loading || !agreedToTerms ? '#94a3b8' : 'linear-gradient(135deg, #1a3a5c, #26619C)',
                color: '#ffffff', fontWeight: '700', borderRadius: '12px',
                border: 'none', fontSize: '15px',
                cursor: loading || !agreedToTerms ? 'not-allowed' : 'pointer',
                boxShadow: !agreedToTerms ? 'none' : '0 4px 16px rgba(26,58,92,0.3)'
              }}>
                {loading ? 'Creating account...' : 'Create Account'}
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