import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ShieldCheck, Star, Bell, Sparkles,
  Camera, CalendarCheck, ArrowRight,
  Users, Package, TrendingUp, ChevronRight,
  Calculator, CheckCircle2
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { count: itemCount } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'available')
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: rentalCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true })

  const features = [
    { icon: <ShieldCheck size={20} strokeWidth={1.8} />, color: '#22A876', label: 'green', title: 'Verified Students Only', desc: 'Only .edu.ph institutional emails accepted. Every user is a confirmed enrolled student.' },
    { icon: <Star size={20} strokeWidth={1.8} />, color: '#C9A84C', label: 'gold', title: 'Trust Score System', desc: 'Every completed rental builds a public reputation. Know who you\'re dealing with before you commit.' },
    { icon: <Sparkles size={20} strokeWidth={1.8} />, color: '#22A876', label: 'green', title: 'Smart Recommendations', desc: 'The For You page learns from your history and surfaces items most relevant to you.' },
    { icon: <Bell size={20} strokeWidth={1.8} />, color: '#C9A84C', label: 'gold', title: 'Real-Time Notifications', desc: 'Instant alerts the moment your rental is approved, declined, or completed.' },
    { icon: <Camera size={20} strokeWidth={1.8} />, color: '#22A876', label: 'green', title: 'Photo Listings', desc: 'Upload clear photos so renters know exactly what they\'re getting before requesting.' },
    { icon: <CalendarCheck size={20} strokeWidth={1.8} />, color: '#C9A84C', label: 'gold', title: 'Conflict-Free Booking', desc: 'Automatic date validation prevents double bookings on every single request.' },
  ]

  return (
    <>
      <style>{`
        .hp { background: var(--bg-void); color: var(--tx-body); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; overflow-x: hidden; }
        .hp-hero {
          position: relative; padding: 140px 28px 120px;
          overflow: hidden;
        }
        .hp-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 60% -10%, rgba(15,61,42,0.5) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 10% 80%, rgba(13,43,26,0.3) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 90% 60%, rgba(201,168,76,0.04) 0%, transparent 40%);
        }
        .hp-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1280px; margin: 0 auto; position: relative; }
        .hp-overline {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 800;
          color: #22A876; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 24px;
        }
        .hp-overline-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #22A876;
          box-shadow: 0 0 8px rgba(34,168,118,0.6);
          animation: breathe 2s ease infinite;
        }
        .hp-h1 {
          font-size: clamp(44px, 6.5vw, 76px);
          font-weight: 900; line-height: 1.02;
          letter-spacing: -0.05em;
          color: var(--tx-bright); margin-bottom: 24px;
        }
        .hp-h1-line2 {
          display: block;
          background: linear-gradient(135deg, #2ECC8F 0%, #4EDDAA 40%, #C9A84C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hp-sub {
          font-size: clamp(15px, 1.8vw, 17px);
          color: var(--tx-muted); line-height: 1.85;
          max-width: 460px; margin-bottom: 40px;
          font-weight: 400;
        }
        .hp-cta-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 56px; }
        .hp-stats-row {
          display: flex; gap: 0;
          border: 1px solid var(--border-sub);
          border-radius: 16px; overflow: hidden;
          background: var(--bg-raised);
        }
        .hp-stat {
          flex: 1; padding: 18px 22px;
          border-right: 1px solid var(--border-sub);
          transition: background 0.2s;
        }
        .hp-stat:last-child { border-right: none; }
        .hp-stat:hover { background: var(--bg-card); }
        .hp-stat-val { font-size: 26px; font-weight: 900; color: var(--tx-bright); letter-spacing: -0.04em; margin-bottom: 3px; }
        .hp-stat-lbl { font-size: 11px; color: var(--tx-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
        .hp-hero-card {
          background: var(--bg-card);
          border: 1px solid var(--border-mid);
          border-radius: 24px;
          padding: 26px;
          box-shadow: var(--shadow-xl), 0 0 0 1px rgba(34,168,118,0.06);
          position: relative;
        }
        .hp-hero-card-glow {
          position: absolute; inset: -1px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(34,168,118,0.15), transparent 40%, rgba(201,168,76,0.08) 100%);
          pointer-events: none;
          z-index: -1;
        }
        .hp-item-img {
          background: var(--bg-raised);
          border: 1px solid var(--border-sub);
          border-radius: 16px; height: 170px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          position: relative; overflow: hidden;
        }
        .hp-item-img::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,61,42,0.2), transparent);
          pointer-events: none;
        }
        .hp-notif-pop {
          position: absolute; bottom: -18px; right: -18px;
          background: var(--bg-overlay);
          border: 1px solid var(--border-mid);
          border-radius: 14px; padding: 11px 15px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(201,168,76,0.08);
          z-index: 10;
        }
        .hp-section { padding: 100px 28px; max-width: 1280px; margin: 0 auto; }
        .hp-eyebrow { font-size: 11px; font-weight: 800; color: var(--g-bright); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .hp-eyebrow::before { content: ''; width: 20px; height: 2px; background: var(--g-bright); border-radius: 1px; }
        .hp-section-title { font-size: clamp(30px,4.5vw,50px); font-weight: 900; color: var(--tx-bright); letter-spacing: -0.04em; line-height: 1.08; margin-bottom: 16px; }
        .hp-section-sub { font-size: 16px; color: var(--tx-muted); max-width: 460px; line-height: 1.75; }
        .hp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .hp-feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border-sub);
          border-radius: 18px; padding: 26px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative; overflow: hidden;
        }
        .hp-feature-card.gold:hover {
          border-color: rgba(201,168,76,0.2);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.08);
          transform: translateY(-3px);
        }
        .hp-feature-card.green:hover {
          border-color: rgba(34,168,118,0.2);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,168,118,0.08);
          transform: translateY(-3px);
        }
        .hp-feature-card::after {
          content: ''; position: absolute;
          inset: 0; border-radius: 18px; opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .hp-feature-card.gold::after { background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.05), transparent); }
        .hp-feature-card.green::after { background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,168,118,0.05), transparent); }
        .hp-feature-card:hover::after { opacity: 1; }
        .hp-icon-box-gold {
          width: 46px; height: 46px; border-radius: 13px;
          background: linear-gradient(135deg, var(--au-deep), rgba(90,63,20,0.6));
          border: 1px solid rgba(201,168,76,0.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; color: var(--au-mid);
          box-shadow: 0 4px 12px rgba(201,168,76,0.08);
        }
        .hp-icon-box-green {
          width: 46px; height: 46px; border-radius: 13px;
          background: linear-gradient(135deg, var(--g-deep), rgba(13,43,26,0.8));
          border: 1px solid rgba(34,168,118,0.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; color: var(--g-bright);
          box-shadow: 0 4px 12px rgba(34,168,118,0.08);
        }
        .hp-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .hp-step {
          padding: 40px 36px;
          border-right: 1px solid var(--border-sub);
          position: relative; transition: background 0.2s;
        }
        .hp-step:last-child { border-right: none; }
        .hp-step:hover { background: var(--bg-raised); }
        .hp-step-num { font-size: 72px; font-weight: 900; letter-spacing: -0.06em; line-height: 1; margin-bottom: 16px; }
        .hp-trust-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hp-trust-card {
          background: var(--bg-card);
          border: 1px solid var(--border-mid);
          border-radius: 24px; padding: 32px;
          box-shadow: var(--shadow-xl);
          position: relative; overflow: hidden;
        }
        .hp-trust-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
        }
        .hp-cta-section {
          position: relative; overflow: hidden;
          margin: 0 28px 80px;
          border-radius: 28px;
          padding: 80px 48px;
          background: linear-gradient(135deg, #080E0A 0%, #0D2B1A 40%, #0A1A10 70%, #080808 100%);
          border: 1px solid rgba(34,168,118,0.12);
          text-align: center;
        }
        .hp-cta-section::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,168,118,0.4), rgba(201,168,76,0.3), transparent);
        }
        .hp-cta-section::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
        }
        .hp-cta-glow {
          position: absolute; top: -120px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(34,168,118,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .hp-footer { border-top: 1px solid var(--border-sub); padding: 32px 28px; }
        .hp-footer-inner { max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        @media (max-width: 1024px) {
          .hp-hero-grid { grid-template-columns: 1fr; gap: 60px; }
          .hp-trust-grid { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 900px) { .hp-features-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) {
          .hp-steps-grid { grid-template-columns: 1fr; }
          .hp-step { border-right: none; border-bottom: 1px solid var(--border-sub); }
          .hp-step:last-child { border-bottom: none; }
          .hp-hero { padding: 80px 20px 80px; }
          .hp-section { padding: 72px 20px; }
          .hp-cta-section { margin: 0 20px 60px; padding: 56px 28px; }
        }
        @media (max-width: 480px) {
          .hp-features-grid { grid-template-columns: 1fr; }
          .hp-stats-row { flex-direction: column; }
          .hp-stat { border-right: none; border-bottom: 1px solid var(--border-sub); }
        }
      `}</style>

      <div className="hp">

        {/* ── HERO ── */}
        <section className="hp-hero">
          <div className="hp-hero-bg" />
          <div className="hp-hero-grid">
            <div className="animate-fade-up">
              <div className="hp-overline">
                <div className="hp-overline-dot" />
                Campus Rental Platform
              </div>
              <h1 className="hp-h1">
                Rent smarter.
                <span className="hp-h1-line2">Save more.</span>
              </h1>
              <p className="hp-sub">
                Rentora connects college students to rent, lend, and manage academic items within a trusted, verified campus network.
              </p>
              <div className="hp-cta-row">
                {user ? (
                  <Link href="/dashboard" className="btn-gold">
                    Go to Dashboard <ArrowRight size={16} strokeWidth={2.5} />
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" className="btn-gold">
                      Get started free <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>
                    <Link href="/auth/login" className="btn-ghost">
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              <div className="hp-stats-row">
                {[
                  { icon: <Package size={14} color="#22A876" />, value: itemCount ?? 0, label: 'Items available' },
                  { icon: <Users size={14} color="#22A876" />, value: userCount ?? 0, label: 'Students enrolled' },
                  { icon: <TrendingUp size={14} color="#C9A84C" />, value: rentalCount ?? 0, label: 'Rentals completed' },
                ].map((stat, i) => (
                  <div key={i} className="hp-stat">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{stat.icon}</div>
                    <div className="hp-stat-val">{stat.value}</div>
                    <div className="hp-stat-lbl">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Card */}
            <div className="animate-fade-up-delay" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                <div className="hp-hero-card">
                  <div className="hp-hero-card-glow" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Featured Item</span>
                    <span className="status-available">Available</span>
                  </div>

                  {/* Calculator icon replacing 🔬 emoji */}
                  <div className="hp-item-img">
                    <div style={{ width: '80px', height: '80px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.2)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <Calculator size={44} color="#22A876" strokeWidth={1.4} />
                    </div>
                  </div>

                  <h3 style={{ fontWeight: '800', fontSize: '16px', color: 'var(--tx-bright)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Scientific Calculator</h3>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '0 0 20px' }}>Casio fx-991EX · Like New</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid var(--border-sub)' }}>
                    <div>
                      <span style={{ fontSize: '26px', fontWeight: '900', color: '#2ECC8F', letterSpacing: '-0.03em' }}>₱50</span>
                      <span style={{ fontSize: '12px', color: 'var(--tx-muted)' }}>/day</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '999px' }}>
                      <Star size={12} fill="#C9A84C" color="#C9A84C" />
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#E2C07A' }}>4.9</span>
                    </div>
                  </div>
                </div>

                {/* Notification popup — CheckCircle2 replacing ✅ emoji */}
                <div className="hp-notif-pop">
                  <div style={{ width: '30px', height: '30px', background: 'var(--g-glow)', border: '1px solid rgba(34,168,118,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={16} color="#22A876" strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx-bright)', margin: 0 }}>Rental Approved!</p>
                    <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: 0 }}>Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── FEATURES ── */}
        <section style={{ padding: '100px 28px', position: 'relative' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '80px', alignItems: 'flex-start' }}>
              <div style={{ position: 'sticky', top: '100px' }}>
                <div className="hp-eyebrow">Why Rentora</div>
                <h2 className="hp-section-title">Built for students.<br /><span style={{ color: 'var(--tx-muted)', fontWeight: '400' }}>Not just anyone.</span></h2>
                <p className="hp-section-sub" style={{ marginBottom: '28px' }}>
                  Safety, trust, and simplicity — the three things students actually need in a rental platform.
                </p>
                <Link href={user ? '/items' : '/auth/register'} className="btn-green" style={{ display: 'inline-flex' }}>
                  {user ? 'Browse items' : 'Join for free'} <ChevronRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
              <div className="hp-features-grid">
                {features.map((f, i) => (
                  <div key={i} className={`hp-feature-card ${f.label}`}>
                    <div className={f.label === 'gold' ? 'hp-icon-box-gold' : 'hp-icon-box-green'} style={{ color: f.color }}>
                      {f.icon}
                    </div>
                    <h3 style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-bright)', marginBottom: '8px', letterSpacing: '-0.01em' }}>{f.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--tx-muted)', lineHeight: '1.7', margin: 0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '100px 28px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="hp-eyebrow" style={{ justifyContent: 'center' }}>How it works</div>
              <h2 className="hp-section-title">Up and running<br /><span style={{ color: 'var(--g-neon)' }}>in minutes.</span></h2>
            </div>
            <div className="hp-steps-grid" style={{ border: '1px solid var(--border-sub)', borderRadius: '24px', overflow: 'hidden', background: 'var(--bg-card)' }}>
              {[
                { n: '01', color: 'var(--g-neon)', title: 'Create your account', desc: 'Sign up with your .edu.ph email. Verification is instant and automatic.' },
                { n: '02', color: 'var(--au-mid)', title: 'Browse or list items', desc: 'Find what you need or list your own items to earn from them while they sit unused.' },
                { n: '03', color: 'var(--g-neon)', title: 'Rent with confidence', desc: 'Request, agree on dates, and transact safely within a community built on trust.' },
              ].map((step, i) => (
                <div key={i} className="hp-step">
                  <div className="hp-step-num" style={{ color: step.color === 'var(--g-neon)' ? 'rgba(46,204,143,0.12)' : 'rgba(201,168,76,0.1)' }}>{step.n}</div>
                  <div style={{ width: '28px', height: '3px', background: step.color, borderRadius: '999px', marginBottom: '18px', boxShadow: `0 0 12px ${step.color === 'var(--g-neon)' ? 'rgba(46,204,143,0.4)' : 'rgba(201,168,76,0.4)'}` }} />
                  <h3 style={{ fontWeight: '800', fontSize: '16px', color: 'var(--tx-bright)', marginBottom: '10px', letterSpacing: '-0.02em' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--tx-muted)', lineHeight: '1.75', maxWidth: '260px' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── TRUST ── */}
        <section style={{ padding: '100px 28px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="hp-trust-grid">
              <div>
                <div className="hp-eyebrow">Trust & Safety</div>
                <h2 className="hp-section-title">Your reputation<br /><span className="gold-shimmer">is currency.</span></h2>
                <p className="hp-section-sub" style={{ marginBottom: '32px' }}>
                  Every rental you complete builds your Trust Score — a transparent rating visible to the entire community.
                </p>
                {[
                  { title: 'Identity verified', desc: 'Institutional email required for all accounts' },
                  { title: 'Ratings after every rental', desc: 'Both parties rate each other after completion' },
                  { title: 'Transparent trust scores', desc: 'Visible on every user profile, always' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--au-mid)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 3px' }}>{item.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hp-trust-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-sub)' }}>
                  <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, var(--g-dark), var(--g-vivid))', border: '1px solid rgba(34,168,118,0.3)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22A876', fontWeight: '900', fontSize: '20px', boxShadow: '0 0 20px rgba(34,168,118,0.15)' }}>L</div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--tx-bright)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>Lester Jade Lobos</p>
                    <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>College Student · 2024</p>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className="gold-badge"><Star size={10} fill="#C9A84C" color="#C9A84C" /> 4.8</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-raised)', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1px solid var(--border-sub)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: '700' }}>Trust Score</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }} className="gold-shimmer">4.8</span>
                    <span style={{ fontSize: '16px', color: 'var(--tx-muted)', marginBottom: '4px' }}>/ 5.0</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <div key={s} style={{ height: '5px', flex: 1, borderRadius: '999px', background: s <= 4 ? 'linear-gradient(90deg, var(--au-dark), var(--au-mid))' : 'var(--bg-hover)', boxShadow: s <= 4 ? '0 0 6px rgba(201,168,76,0.3)' : 'none' }} />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[{ l: 'Rentals', v: '12' }, { l: 'Reviews', v: '10' }, { l: 'Items', v: '3' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px 8px', background: 'var(--bg-raised)', borderRadius: '12px', border: '1px solid var(--border-sub)', transition: 'border-color 0.2s' }}>
                      <p style={{ fontSize: '22px', fontWeight: '900', color: 'var(--tx-bright)', margin: 0, letterSpacing: '-0.04em' }}>{s.v}</p>
                      <p style={{ fontSize: '11px', color: 'var(--tx-muted)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="divider" />

        {/* ── QR CODE ── */}
        <section style={{ padding: '100px 28px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

              {/* Left — text */}
              <div>
                <div className="hp-eyebrow">Access Rentora</div>
                <h2 className="hp-section-title">
                  Scan to get<br />
                  <span className="gold-shimmer">started instantly.</span>
                </h2>
                <p className="hp-section-sub" style={{ marginBottom: '32px' }}>
                  Open your phone camera and point it at the QR code to access Rentora directly — no typing needed. Works on any device with a browser.
                </p>
                {[
                  { step: '01', text: 'Open your phone camera or QR scanner app' },
                  { step: '02', text: 'Point it at the QR code on the right' },
                  { step: '03', text: 'Tap the link and you\'re in' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: i % 2 === 0 ? 'var(--g-glow)' : 'var(--au-glow)', border: `1px solid ${i % 2 === 0 ? 'rgba(34,168,118,0.2)' : 'rgba(201,168,76,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: i % 2 === 0 ? '#22A876' : '#C9A84C', letterSpacing: '-0.02em' }}>{item.step}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--tx-body)', margin: 0, fontWeight: '500' }}>{item.text}</p>
                  </div>
                ))}
                <div style={{ marginTop: '28px', padding: '14px 18px', background: 'var(--bg-raised)', border: '1px solid var(--border-sub)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22A876', boxShadow: '0 0 8px rgba(34,168,118,0.6)', animation: 'breathe 2s ease infinite', flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', color: 'var(--tx-muted)', margin: 0, fontWeight: '500' }}>
                    Direct link:{' '}
                    <a href="https://rentora-tau-flame.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: '#22A876', fontWeight: '700', textDecoration: 'none', letterSpacing: '-0.01em' }}>
                      rentora-tau-flame.vercel.app
                    </a>
                  </p>
                </div>
              </div>

              {/* Right — QR Code card */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '28px', padding: '40px', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden', textAlign: 'center' as const }}>

                  {/* Top shimmer line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)' }} />

                  <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '24px' }}>
                    Scan to Open Rentora
                  </p>

                  {/* QR Code image via free API */}
                  <div style={{ background: '#ffffff', borderRadius: '20px', padding: '16px', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://rentora-tau-flame.vercel.app/&color=0D2B1A&bgcolor=ffffff&qzone=1&format=png"
                      alt="Scan to access Rentora"
                      width={200}
                      height={200}
                      style={{ display: 'block', borderRadius: '8px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Rentora</p>
                    <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>Student Item Rental Hub</p>
                  </div>

                  {/* Gold pulse rings decoration */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 1 ? '#C9A84C' : 'var(--border-mid)', boxShadow: i === 1 ? '0 0 8px rgba(201,168,76,0.5)' : 'none' }} />
                    ))}
                  </div>

                  {/* Bottom glow */}
                  <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'radial-gradient(ellipse, rgba(201,168,76,0.08), transparent)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ── CTA ── */}
        <div className="hp-cta-section">
          <div className="hp-cta-glow" />
          <div style={{ position: 'relative' }}>
            <span className="green-badge" style={{ marginBottom: '24px', display: 'inline-flex' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--g-neon)', animation: 'breathe 2s ease infinite' }} />
              Open to all students
            </span>
            <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: '900', color: 'var(--tx-bright)', letterSpacing: '-0.05em', marginBottom: '16px', lineHeight: '1.05' }}>
              Your campus marketplace<br /><span className="gold-shimmer">is waiting.</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--tx-muted)', marginBottom: '40px', maxWidth: '420px', margin: '0 auto 40px', lineHeight: '1.8' }}>
              Join students already using Rentora to save money and share resources.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <Link href="/items" className="btn-gold">Browse items now <ArrowRight size={16} strokeWidth={2.5} /></Link>
              ) : (
                <>
                  <Link href="/auth/register" className="btn-gold">Create free account <ArrowRight size={16} strokeWidth={2.5} /></Link>
                  <Link href="/auth/login" className="btn-ghost">Sign in</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="hp-footer">
          <div className="hp-footer-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, var(--g-dark), var(--g-vivid))', border: '1px solid rgba(34,168,118,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: '#22A876' }}>R</div>
              <span style={{ fontWeight: '800', color: 'var(--tx-muted)', fontSize: '14px', letterSpacing: '-0.01em' }}>Rentora</span>
              <span style={{ color: 'var(--border-mid)', fontSize: '16px' }}>·</span>
              <span style={{ fontSize: '13px', color: 'var(--tx-dim)' }}>Student Item Rental Hub</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--tx-dim)', margin: 0 }}>© 2026 Rentora · Built for College Students · By Lester Jade Lobos</p>
          </div>
        </footer>

      </div>
    </>
  )
}