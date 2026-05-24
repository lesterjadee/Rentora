'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Upload, X, ShieldCheck, ArrowRight } from 'lucide-react'

export default function UploadIdPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)
      setPageLoading(false)
    }
    init()
  }, [])

  const handleIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB.'); return }
    setIdFile(file)
    setIdPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idFile || !user) return
    setLoading(true)
    setError('')

    try {
      const ext = idFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('id-images')
        .upload(path, idFile, { upsert: true })

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage.from('id-images').getPublicUrl(path)

      const { error: updateError } = await supabase.from('profiles').update({
        id_image_url: publicUrl,
        id_submitted_at: new Date().toISOString(),
        verification_status: 'pending',
        is_verified: false,
      }).eq('id', user.id)

      if (updateError) throw new Error(updateError.message)

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (pageLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '48px', height: '48px', background: 'rgba(4,149,22,0.06)', border: '1px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ShieldCheck size={22} color="var(--g-rich)" strokeWidth={1.5} />
      </div>
    </div>
  )

  // Already uploaded
  if (profile?.id_image_url) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1.5px solid rgba(4,149,22,0.15)', padding: '48px 40px', textAlign: 'center', maxWidth: '420px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(4,149,22,0.08)', border: '1.5px solid rgba(4,149,22,0.2)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShieldCheck size={30} color="var(--g-rich)" strokeWidth={1.8} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--tx-bright)', margin: '0 0 10px', letterSpacing: '-0.03em' }}>ID Already Submitted</h2>
        <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '28px', lineHeight: '1.7' }}>
          Your ID has been submitted and is <strong style={{ color: 'var(--au-dark)' }}>pending review</strong> by an administrator.
        </p>
        <Link href="/dashboard" className="btn-green" style={{ display: 'inline-flex', justifyContent: 'center', fontSize: '14px', padding: '12px 28px' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        body { background: var(--bg-void); }
        .uid { min-height: 100vh; background: var(--bg-void); display: flex; align-items: center; justify-content: center; padding: 24px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .uid-card { background: #FFFFFF; border-radius: 24px; border: 1.5px solid rgba(4,149,22,0.15); padding: 40px; max-width: 500px; width: 100%; box-shadow: var(--shadow-xl); }
        .uid-upload-zone { height: 160px; border: 2px dashed rgba(4,149,22,0.25); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; background: var(--bg-raised); transition: all 0.2s; }
        .uid-upload-zone:hover { border-color: rgba(4,149,22,0.4); background: rgba(4,149,22,0.03); }
      `}</style>

      <div className="uid">
        <div className="uid-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.25)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/gcoc.png" alt="GC" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0 }}>Rentora</p>
              <p style={{ fontSize: '9px', color: 'var(--g-vivid)', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>⚡ Powered by Gordon College</p>
            </div>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.04em', margin: '0 0 8px' }}>Upload Your ID</h1>
          <p style={{ fontSize: '14px', color: 'var(--tx-muted)', marginBottom: '28px', lineHeight: '1.7' }}>
            To use Rentora, please upload your <strong>school ID</strong> or a valid <strong>government ID</strong>. An admin will review and verify your account.
          </p>

          {error && (
            <div style={{ marginBottom: '16px', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#B91C1C', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                School ID or Government ID
              </label>

              {idPreview ? (
                <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid rgba(4,149,22,0.2)' }}>
                  <img src={idPreview} alt="ID Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={() => { setIdFile(null); setIdPreview('') }}
                    style={{ position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFFFFF' }}>
                    <X size={14} strokeWidth={2.5} />
                  </button>
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(4,149,22,0.85)', borderRadius: '6px', padding: '4px 10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>✓ ID ready to upload</span>
                  </div>
                </div>
              ) : (
                <label className="uid-upload-zone">
                  <input type="file" accept="image/*,.pdf" onChange={handleIdFile} style={{ display: 'none' }} />
                  <div style={{ width: '44px', height: '44px', background: 'rgba(4,149,22,0.07)', border: '1px solid rgba(4,149,22,0.18)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={20} color="var(--g-rich)" strokeWidth={2} />
                  </div>
                  <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-bright)', margin: 0 }}>Click to upload your ID</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>JPG, PNG or PDF · Max 5MB</p>
                </label>
              )}

              <p style={{ fontSize: '11px', color: 'var(--tx-dim)', marginTop: '8px', lineHeight: '1.5' }}>
                🔒 Your ID is only visible to platform administrators. It will never be shown publicly.
              </p>
            </div>

            <button type="submit" disabled={loading || !idFile} className="btn-gold"
              style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', opacity: (loading || !idFile) ? 0.6 : 1 }}>
              {loading ? 'Uploading...' : (<>Submit ID for Verification <ArrowRight size={16} strokeWidth={2.5} /></>)}
            </button>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <Link href="/dashboard" style={{ fontSize: '13px', color: 'var(--tx-muted)', textDecoration: 'none', fontWeight: '600' }}>
                Skip for now →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}