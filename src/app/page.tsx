import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: itemCount } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'available')
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: rentalCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true })

  const features = [
    { icon: '🔐', title: 'Verified Students Only', desc: 'Restricted to @gordoncollege.edu.ph emails. Every person is a verified member of your campus.' },
    { icon: '⭐', title: 'Trust Score System', desc: 'Every completed rental generates a rating. Build your reputation over time.' },
    { icon: '🎯', title: 'Smart Recommendations', desc: 'Rentora surfaces items most relevant to you based on your activity.' },
    { icon: '🔔', title: 'Real-time Notifications', desc: 'Instant alerts the moment your rental is approved, declined, or completed.' },
    { icon: '📷', title: 'Photo Listings', desc: 'Upload clear photos so renters know exactly what they are getting.' },
    { icon: '📅', title: 'Conflict-free Booking', desc: 'Automatic date validation prevents double bookings every time.' },
  ]

  return (
    <>
      <style>{`
        .hero-section { border-bottom: 1px solid #f3f4f6; padding: 60px 24px 80px; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; max-width: 1100px; margin: 0 auto; }
        .hero-card { display: flex; justify-content: center; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
        .hero-stats { display: flex; gap: 32px; padding-top: 32px; border-top: 1px solid #f3f4f6; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .trust-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .trust-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        @media (max-width: 768px) {
          .hero-section { padding: 40px 20px 60px; }
          .hero-grid { grid-template-columns: 1fr; gap: 32px; }
          .hero-card { display: none; }
          .hero-btns { flex-direction: column; }
          .hero-btns a { text-align: center; }
          .hero-stats { gap: 20px; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr; gap: 24px; }
          .trust-grid { grid-template-columns: 1fr; gap: 40px; }
          .footer-inner { flex-direction: column; text-align: center; }
        }
        @media (max-width: 480px) {
          .trust-stats { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div style={{ backgroundColor: '#ffffff', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #dbeafe', backgroundColor: '#eff6ff', borderRadius: '999px', padding: '6px 16px', marginBottom: '28px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#26619C', letterSpacing: '0.05em' }}>Gordon College · Campus Rental Platform</span>
              </div>

              <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '20px', color: '#0f172a' }}>
                Rent smarter.<br />
                <span style={{ color: '#26619C' }}>Save more.</span>
              </h1>

              <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#6b7280', lineHeight: '1.7', marginBottom: '32px', maxWidth: '460px' }}>
                Rentora connects Gordon College students to rent, lend, and manage academic items — from calculators to lab equipment — all within a trusted campus network.
              </p>

              <div className="hero-btns">
                {user ? (
                  <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 28px', backgroundColor: '#26619C', color: '#ffffff', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '15px' }}>
                    Go to Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 28px', backgroundColor: '#26619C', color: '#ffffff', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '15px' }}>
                      Get started free →
                    </Link>
                    <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 28px', backgroundColor: '#ffffff', color: '#374151', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', border: '1px solid #e5e7eb' }}>
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              <div className="hero-stats">
                {[
                  { value: itemCount ?? 0, label: 'Items available' },
                  { value: userCount ?? 0, label: 'Students enrolled' },
                  { value: rentalCount ?? 0, label: 'Rentals completed' },
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: i > 0 ? '32px' : '0' }}>
                    {i > 0 && <div style={{ width: '1px', height: '36px', backgroundColor: '#e5e7eb' }} />}
                    <div>
                      <p style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: '800', color: '#0f172a', margin: 0 }}>{stat.value}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Card - hidden on mobile */}
            <div className="hero-card">
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', right: '-12px', bottom: '-12px', backgroundColor: '#eff6ff', borderRadius: '20px', border: '1px solid #dbeafe' }} />
                <div style={{ position: 'relative', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured Item</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '999px', padding: '4px 12px' }}>Available</span>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '14px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid #f1f5f9', fontSize: '64px' }}>🔬</div>
                  <h3 style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', margin: '0 0 4px' }}>Scientific Calculator</h3>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 16px' }}>Casio fx-991EX · Like New</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><span style={{ fontSize: '22px', fontWeight: '800', color: '#26619C' }}>₱50</span><span style={{ fontSize: '13px', color: '#9ca3af' }}>/day</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#f59e0b' }}>★</span><span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>4.9</span></div>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: '-16px', right: '-16px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✅</div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Rental Approved!</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#26619C', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Why Rentora</p>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '16px' }}>
                Everything you need.<br />Nothing you don't.
              </h2>
              <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#6b7280', maxWidth: '480px', lineHeight: '1.7' }}>
                Built specifically for Gordon College students with safety and trust in mind.
              </p>
            </div>
            <div className="features-grid">
              {features.map((f, i) => (
                <div key={i} style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>{f.icon}</div>
                  <h3 style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px', backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#26619C', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '16px' }}>Up and running in minutes</h2>
            <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#6b7280', marginBottom: '48px' }}>Three simple steps stand between you and the item you need.</p>
            <div className="steps-grid">
              {[
                { n: '01', title: 'Create your account', desc: 'Sign up with your Gordon College institutional email. Verification is automatic.' },
                { n: '02', title: 'Browse or list items', desc: 'Find what you need or list your own items to earn while helping others.' },
                { n: '03', title: 'Rent with confidence', desc: 'Request a rental, agree on dates, and transact safely within a trusted network.' },
              ].map((step, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#ffffff', border: '2px solid #dbeafe', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '20px', fontWeight: '800', color: '#26619C' }}>{step.n}</div>
                  <h3 style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a', marginBottom: '10px' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', maxWidth: '280px', margin: '0 auto' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="trust-grid">
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#26619C', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Trust & Safety</p>
                <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '20px' }}>
                  Your reputation matters.<br />We make it visible.
                </h2>
                <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#6b7280', lineHeight: '1.7', marginBottom: '32px' }}>
                  Every rental you complete builds your Trust Score — a transparent rating visible to the entire community.
                </p>
                {[
                  { label: 'Identity verified', desc: 'Institutional email required for all accounts' },
                  { label: 'Ratings after every rental', desc: 'Both parties rate each other after completion' },
                  { label: 'Transparent trust scores', desc: 'Visible on every user profile' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#26619C' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937', margin: '0 0 2px' }}>{item.label}</p>
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ width: '52px', height: '52px', backgroundColor: '#26619C', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '800', fontSize: '20px' }}>L</div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', margin: 0 }}>Lester Jade Lobos</p>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Gordon College · 2024</p>
                  </div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '14px', padding: '18px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Trust Score</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '38px', fontWeight: '800', color: '#26619C', lineHeight: 1 }}>4.8</span>
                    <span style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>/ 5.0</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <div key={s} style={{ height: '6px', flex: 1, borderRadius: '999px', backgroundColor: s <= 4 ? '#26619C' : '#dbeafe' }} />
                    ))}
                  </div>
                </div>
                <div className="trust-stats">
                  {[{ l: 'Rentals', v: '12' }, { l: 'Reviews', v: '10' }, { l: 'Items', v: '3' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px 8px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{s.v}</p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#26619C', borderRadius: '24px', padding: 'clamp(40px, 8vw, 80px) clamp(24px, 5vw, 48px)', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '16px', lineHeight: '1.2' }}>
                Your campus marketplace<br />is waiting.
              </h2>
              <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#bfdbfe', marginBottom: '36px', maxWidth: '420px', margin: '0 auto 36px', lineHeight: '1.6' }}>
                Join Gordon College students already using Rentora to save money and share resources.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {user ? (
                  <Link href="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', backgroundColor: '#ffffff', color: '#26619C', fontWeight: '700', borderRadius: '12px', textDecoration: 'none', fontSize: '15px' }}>
                    Browse items now →
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', backgroundColor: '#ffffff', color: '#26619C', fontWeight: '700', borderRadius: '12px', textDecoration: 'none', fontSize: '15px' }}>
                      Create free account →
                    </Link>
                    <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 28px', backgroundColor: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: '#ffffff', fontWeight: '600', borderRadius: '12px', textDecoration: 'none', fontSize: '15px' }}>
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid #f3f4f6', padding: '32px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="footer-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#26619C' }}>Rentora</span>
                <span style={{ color: '#e5e7eb' }}>|</span>
                <span style={{ fontSize: '14px', color: '#9ca3af' }}>Student Item Rental Hub</span>
              </div>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>© 2026 Rentora · Built for Gordon College · By Lester Jade Lobos</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}