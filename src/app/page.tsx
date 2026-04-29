import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ShieldCheck, Star, Bell, Sparkles,
  Camera, CalendarCheck, ArrowRight,
  Users, Package, TrendingUp
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: itemCount } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'available')
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: rentalCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true })

  const features = [
    { icon: <ShieldCheck size={22} color="#2ECC8F" strokeWidth={1.8} />, title: 'Verified Students Only', desc: 'Only .edu.ph institutional emails are accepted, so every user is a confirmed enrolled student.' },
    { icon: <Star size={22} color="#F59E0B" strokeWidth={1.8} />, title: 'Trust Score System', desc: 'Every completed rental builds a public reputation. Know who you are dealing with before you commit.' },
    { icon: <Sparkles size={22} color="#3B82F6" strokeWidth={1.8} />, title: 'Smart Recommendations', desc: 'The For You page learns from your rental history and surfaces items most relevant to you.' },
    { icon: <Bell size={22} color="#A78BFA" strokeWidth={1.8} />, title: 'Real-Time Notifications', desc: 'Instant alerts the moment your rental is approved, declined, or completed.' },
    { icon: <Camera size={22} color="#2ECC8F" strokeWidth={1.8} />, title: 'Photo Listings', desc: 'Upload clear photos so renters know exactly what they are getting before they request.' },
    { icon: <CalendarCheck size={22} color="#F59E0B" strokeWidth={1.8} />, title: 'Conflict-Free Booking', desc: 'Automatic date validation prevents double bookings on every single request.' },
  ]

  const steps = [
    { n: '01', title: 'Create your account', desc: 'Sign up with your .edu.ph email. Verification is automatic.' },
    { n: '02', title: 'Browse or list items', desc: 'Find what you need or list your own items to earn from them.' },
    { n: '03', title: 'Rent with confidence', desc: 'Request, agree on dates, and transact safely within a trusted community.' },
  ]

  return (
    <>
      <style>{`
        body { background-color: #0A0A0A; }
        .hp-section { padding: 100px 24px; }
        .hp-inner { max-width: 1100px; margin: 0 auto; }
        .hp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(46,204,143,0.08);
          border: 1px solid rgba(46,204,143,0.2);
          border-radius: 999px; padding: 6px 16px;
          font-size: 12px; font-weight: 600;
          color: #2ECC8F; letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .hp-dot { width: 6px; height: 6px; background: #2ECC8F; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .hp-h1 {
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 900; line-height: 1.05;
          letter-spacing: -0.04em; color: #F0F0F0;
          margin: 0;
        }
        .hp-h1-accent {
          background: linear-gradient(135deg, #2ECC8F, #4EDDAA, #2ECC8F);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hp-sub {
          font-size: clamp(15px, 2vw, 18px);
          color: #606060; line-height: 1.8;
          max-width: 480px;
        }
        .hp-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #0F3D2E, #1A7A57);
          border: 1px solid rgba(46,204,143,0.3);
          color: #2ECC8F; font-size: 15px; font-weight: 700;
          border-radius: 12px; text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 0 30px rgba(15,61,46,0.4);
        }
        .hp-btn-primary:hover {
          background: linear-gradient(135deg, #145C42, #1A7A57);
          border-color: rgba(46,204,143,0.5);
          box-shadow: 0 0 40px rgba(46,204,143,0.2);
          transform: translateY(-1px);
        }
        .hp-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px;
          background: transparent;
          border: 1px solid #2E2E2E;
          color: #A3A3A3; font-size: 15px; font-weight: 600;
          border-radius: 12px; text-decoration: none;
          transition: all 0.2s;
        }
        .hp-btn-ghost:hover { border-color: #3a3a3a; color: #F0F0F0; background: #1C1C1C; }
        .hp-stat-card {
          background: #111111;
          border: 1px solid #1C1C1C;
          border-radius: 14px; padding: 24px;
          text-align: center;
          transition: border-color 0.2s;
        }
        .hp-stat-card:hover { border-color: rgba(46,204,143,0.2); }
        .hp-feature-card {
          background: #111111;
          border: 1px solid #1C1C1C;
          border-radius: 16px; padding: 28px;
          transition: all 0.25s;
        }
        .hp-feature-card:hover {
          border-color: rgba(46,204,143,0.2);
          background: #141414;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .hp-feature-icon {
          width: 48px; height: 48px;
          background: #1C1C1C;
          border: 1px solid #2E2E2E;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .hp-step-num {
          font-size: 48px; font-weight: 900;
          color: #1C1C1C; letter-spacing: -0.04em;
          line-height: 1; margin-bottom: 12px;
        }
        .hp-divider { height: 1px; background: linear-gradient(90deg, transparent, #1C1C1C, transparent); }
        .hp-cta-box {
          background: linear-gradient(135deg, #0A2118, #0F3D2E);
          border: 1px solid rgba(46,204,143,0.15);
          border-radius: 24px;
          padding: clamp(48px, 8vw, 80px) clamp(24px, 5vw, 64px);
          text-align: center;
          position: relative; overflow: hidden;
        }
        .hp-cta-glow {
          position: absolute; top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(46,204,143,0.08), transparent);
          pointer-events: none;
        }
        .hp-footer-inner {
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 16px;
        }
        .hp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .hp-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .hp-stats-grid { display: flex; gap: 32px; padding-top: 40px; border-top: 1px solid #1C1C1C; flex-wrap: wrap; }
        .hp-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hp-trust-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        @media (max-width: 900px) {
          .hp-features-grid { grid-template-columns: 1fr 1fr; }
          .hp-hero-grid { grid-template-columns: 1fr; }
          .hp-trust-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .hp-features-grid { grid-template-columns: 1fr; }
          .hp-steps-grid { grid-template-columns: 1fr; gap: 24px; }
          .hp-section { padding: 64px 20px; }
        }
      `}</style>

      <div style={{ backgroundColor: '#0A0A0A', color: '#F0F0F0', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>

        {/* HERO */}
        <section className="hp-section" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="hp-inner">
            <div className="hp-hero-grid">
              <div>
                <div className="hp-badge" style={{ marginBottom: '28px' }}>
                  <div className="hp-dot" />
                  Campus Rental Platform
                </div>
                <h1 className="hp-h1" style={{ marginBottom: '20px' }}>
                  Rent smarter.<br />
                  <span className="hp-h1-accent">Save more.</span>
                </h1>
                <p className="hp-sub" style={{ marginBottom: '36px' }}>
                  Rentora connects college students to rent, lend, and manage academic items — from calculators to lab equipment — within a trusted campus network.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
                  {user ? (
                    <Link href="/dashboard" className="hp-btn-primary">
                      Go to Dashboard <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/register" className="hp-btn-primary">
                        Get started free <ArrowRight size={16} strokeWidth={2.5} />
                      </Link>
                      <Link href="/auth/login" className="hp-btn-ghost">
                        Sign in
                      </Link>
                    </>
                  )}
                </div>

                <div className="hp-stats-grid">
                  {[
                    { icon: <Package size={16} color="#2ECC8F" />, value: itemCount ?? 0, label: 'Items available' },
                    { icon: <Users size={16} color="#2ECC8F" />, value: userCount ?? 0, label: 'Students enrolled' },
                    { icon: <TrendingUp size={16} color="#2ECC8F" />, value: rentalCount ?? 0, label: 'Rentals completed' },
                  ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        {stat.icon}
                      </div>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: '#F0F0F0', margin: 0, letterSpacing: '-0.03em' }}>{stat.value}</p>
                      <p style={{ fontSize: '12px', color: '#606060', margin: 0 }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Card */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '12px', right: '-12px', bottom: '-12px', background: 'linear-gradient(135deg, #0F3D2E, #0A2118)', borderRadius: '20px', border: '1px solid rgba(46,204,143,0.1)' }} />
                  <div style={{ position: 'relative', background: '#111111', borderRadius: '20px', border: '1px solid #1C1C1C', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured Item</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#2ECC8F', background: 'rgba(46,204,143,0.1)', border: '1px solid rgba(46,204,143,0.2)', borderRadius: '999px', padding: '3px 10px' }}>Available</span>
                    </div>
                    <div style={{ background: '#1C1C1C', borderRadius: '14px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '56px', border: '1px solid #2E2E2E' }}>🔬</div>
                    <h3 style={{ fontWeight: '700', fontSize: '16px', color: '#F0F0F0', margin: '0 0 4px' }}>Scientific Calculator</h3>
                    <p style={{ fontSize: '12px', color: '#606060', margin: '0 0 16px' }}>Casio fx-991EX · Like New</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #1C1C1C' }}>
                      <div>
                        <span style={{ fontSize: '22px', fontWeight: '800', color: '#2ECC8F' }}>₱50</span>
                        <span style={{ fontSize: '12px', color: '#606060' }}>/day</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={12} fill="#F59E0B" color="#F59E0B" />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#A3A3A3' }}>4.9</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', background: '#111111', border: '1px solid #1C1C1C', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(46,204,143,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✅</div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#F0F0F0', margin: 0 }}>Rental Approved!</p>
                      <p style={{ fontSize: '11px', color: '#606060', margin: 0 }}>Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="hp-divider" />

        {/* FEATURES */}
        <section className="hp-section">
          <div className="hp-inner">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="hp-badge" style={{ marginBottom: '20px' }}>Why Rentora</div>
              <h2 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: '800', color: '#F0F0F0', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
                Everything you need.<br />Nothing you don't.
              </h2>
              <p style={{ fontSize: '16px', color: '#606060', maxWidth: '440px', margin: '0 auto', lineHeight: '1.7' }}>
                Built for college students with safety and trust as the foundation.
              </p>
            </div>
            <div className="hp-features-grid">
              {features.map((f, i) => (
                <div key={i} className="hp-feature-card">
                  <div className="hp-feature-icon">{f.icon}</div>
                  <h3 style={{ fontWeight: '700', fontSize: '15px', color: '#F0F0F0', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '13px', color: '#606060', lineHeight: '1.7', margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hp-divider" />

        {/* HOW IT WORKS */}
        <section className="hp-section">
          <div className="hp-inner">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="hp-badge" style={{ marginBottom: '20px' }}>How it works</div>
              <h2 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: '800', color: '#F0F0F0', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
                Up and running in minutes
              </h2>
              <p style={{ fontSize: '16px', color: '#606060', lineHeight: '1.7' }}>
                Three simple steps between you and the item you need.
              </p>
            </div>
            <div className="hp-steps-grid">
              {steps.map((step, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div className="hp-step-num">{step.n}</div>
                  <div style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, #0F3D2E, #2ECC8F)', borderRadius: '999px', margin: '0 auto 18px' }} />
                  <h3 style={{ fontWeight: '700', fontSize: '17px', color: '#F0F0F0', marginBottom: '10px' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: '#606060', lineHeight: '1.7', maxWidth: '260px', margin: '0 auto' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hp-divider" />

        {/* TRUST SECTION */}
        <section className="hp-section">
          <div className="hp-inner">
            <div className="hp-trust-grid">
              <div>
                <div className="hp-badge" style={{ marginBottom: '20px' }}>Trust & Safety</div>
                <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: '800', color: '#F0F0F0', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '20px' }}>
                  Your reputation<br />matters here.
                </h2>
                <p style={{ fontSize: '15px', color: '#606060', lineHeight: '1.8', marginBottom: '32px' }}>
                  Every rental you complete builds your Trust Score — a transparent rating visible to the entire community.
                </p>
                {[
                  { title: 'Identity verified', desc: 'Institutional email required for all accounts' },
                  { title: 'Ratings after every rental', desc: 'Both parties rate each other after completion' },
                  { title: 'Transparent trust scores', desc: 'Visible on every user profile' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(46,204,143,0.1)', border: '1px solid rgba(46,204,143,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ECC8F' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px', color: '#F0F0F0', margin: '0 0 2px' }}>{item.title}</p>
                      <p style={{ fontSize: '12px', color: '#606060', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#111111', border: '1px solid #1C1C1C', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)', border: '1px solid rgba(46,204,143,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2ECC8F', fontWeight: '800', fontSize: '20px' }}>L</div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '16px', color: '#F0F0F0', margin: 0 }}>Lester Jade Lobos</p>
                    <p style={{ fontSize: '12px', color: '#606060', margin: 0 }}>College Student · 2024</p>
                  </div>
                </div>
                <div style={{ background: '#1C1C1C', borderRadius: '14px', padding: '18px', marginBottom: '16px', border: '1px solid #2E2E2E' }}>
                  <p style={{ fontSize: '11px', color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Trust Score</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '40px', fontWeight: '800', color: '#2ECC8F', lineHeight: 1 }}>4.8</span>
                    <span style={{ fontSize: '13px', color: '#606060', marginBottom: '4px' }}>/ 5.0</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <div key={s} style={{ height: '6px', flex: 1, borderRadius: '999px', background: s <= 4 ? '#2ECC8F' : '#1C1C1C', border: s > 4 ? '1px solid #2E2E2E' : 'none' }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[{ l: 'Rentals', v: '12' }, { l: 'Reviews', v: '10' }, { l: 'Items', v: '3' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px 8px', background: '#1C1C1C', borderRadius: '12px', border: '1px solid #2E2E2E' }}>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: '#F0F0F0', margin: 0 }}>{s.v}</p>
                      <p style={{ fontSize: '11px', color: '#606060', margin: '4px 0 0' }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="hp-divider" />

        {/* CTA */}
        <section className="hp-section">
          <div className="hp-inner">
            <div className="hp-cta-box">
              <div className="hp-cta-glow" />
              <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: '900', color: '#F0F0F0', letterSpacing: '-0.04em', marginBottom: '16px', lineHeight: '1.1', position: 'relative' }}>
                Your campus marketplace<br />is waiting.
              </h2>
              <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: '#606060', marginBottom: '36px', maxWidth: '420px', margin: '0 auto 36px', lineHeight: '1.7', position: 'relative' }}>
                Join students already using Rentora to save money and share resources.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                {user ? (
                  <Link href="/items" className="hp-btn-primary">
                    Browse items now <ArrowRight size={16} strokeWidth={2.5} />
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" className="hp-btn-primary">
                      Create free account <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>
                    <Link href="/auth/login" className="hp-btn-ghost">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid #1C1C1C', padding: '32px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="hp-footer-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg, #0F3D2E, #1A7A57)', border: '1px solid rgba(46,204,143,0.3)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#2ECC8F' }}>R</div>
                <span style={{ fontWeight: '700', color: '#A3A3A3', fontSize: '14px' }}>Rentora</span>
                <span style={{ color: '#2E2E2E' }}>·</span>
                <span style={{ fontSize: '13px', color: '#606060' }}>Student Item Rental Hub</span>
              </div>
              <p style={{ fontSize: '12px', color: '#606060', margin: 0 }}>© 2026 Rentora · Built for College Students · By Lester Jade Lobos</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}