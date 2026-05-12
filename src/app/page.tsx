import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ShieldCheck, Star, Bell, Sparkles, Camera,
  CalendarCheck, ArrowRight, Users, Package,
  TrendingUp, ChevronRight, Calculator, CheckCircle2
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { count: itemCount } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'available')
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: rentalCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true })

  const features = [
    { icon: <ShieldCheck size={20} strokeWidth={1.8} />, gold: false, title: 'Gordon College Students Only', desc: 'Only @gordoncollege.edu.ph emails accepted. Every user is a verified enrolled GC student.' },
    { icon: <Star size={20} strokeWidth={1.8} />,        gold: true,  title: 'Trust Score System',          desc: "Every completed rental builds a public reputation. Know who you're dealing with before you commit." },
    { icon: <Sparkles size={20} strokeWidth={1.8} />,    gold: false, title: 'Smart Recommendations',       desc: 'The For You page learns from your rental history and surfaces items most relevant to you.' },
    { icon: <Bell size={20} strokeWidth={1.8} />,        gold: true,  title: 'Real-Time Notifications',     desc: 'Instant alerts the moment your rental is approved, declined, or completed.' },
    { icon: <Camera size={20} strokeWidth={1.8} />,      gold: false, title: 'Photo Listings',              desc: "Upload clear photos so renters know exactly what they're getting before requesting." },
    { icon: <CalendarCheck size={20} strokeWidth={1.8} />, gold: true, title: 'Conflict-Free Booking',     desc: 'Automatic date validation prevents double bookings on every single request.' },
  ]

  return (
    <>
      <style>{`
        .hp { background: var(--bg-void); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; overflow-x: hidden; }

        .hp-hero { position: relative; padding: 120px 28px 110px; overflow: hidden; }
        .hp-hero-inner { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; position: relative; }

        .hp-overline-pill {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 7px 16px 7px 8px;
          background: rgba(4,149,22,0.07);
          border: 1px solid rgba(4,149,22,0.18);
          border-radius: 999px; margin-bottom: 28px;
        }
        .hp-overline-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--g-bright); box-shadow: 0 0 6px rgba(5,184,28,0.6); animation: breathe 2s ease infinite; }
        .hp-overline-text { font-size: 11px; font-weight: 800; color: var(--g-rich); letter-spacing: 0.1em; text-transform: uppercase; }

        .hp-h1 { font-size: clamp(42px,6vw,70px); font-weight: 900; line-height: 1.02; letter-spacing: -0.05em; color: var(--tx-bright); margin-bottom: 22px; }
        .hp-h1-accent { display: block; background: linear-gradient(135deg, var(--g-mid) 0%, var(--g-rich) 40%, var(--au-mid) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hp-sub { font-size: clamp(14px,1.8vw,16px); color: var(--tx-muted); line-height: 1.85; max-width: 460px; margin-bottom: 40px; }
        .hp-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 52px; }

        .hp-stats { display: flex; background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.12); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); }
        .hp-stat { flex: 1; padding: 18px 20px; border-right: 1px solid rgba(4,149,22,0.08); transition: background 0.2s; }
        .hp-stat:last-child { border-right: none; }
        .hp-stat:hover { background: var(--bg-raised); }
        .hp-stat-num { font-size: 26px; font-weight: 900; color: var(--tx-bright); letter-spacing: -0.04em; margin-bottom: 3px; }
        .hp-stat-lbl { font-size: 10px; color: var(--tx-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }

        .hp-card-wrap { position: relative; width: 100%; max-width: 360px; margin: 0 auto; }

        /* Green watercolor paint drip effect */
        .hp-paint-drip {
          position: absolute;
          inset: -60px -80px -80px -80px;
          pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 60% 18% at 50% 0%,   rgba(4,149,22,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 18% 55% at 28% 8%,   rgba(4,149,22,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 12% 45% at 72% 6%,   rgba(4,149,22,0.10) 0%, transparent 65%),
            radial-gradient(ellipse 22% 38% at 45% 18%,  rgba(4,149,22,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 10% 30% at 60% 25%,  rgba(4,149,22,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 55% 20% at 50% 100%, rgba(4,149,22,0.0)  0%, transparent 100%);
          filter: blur(8px);
        }

        .hp-card {
          background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.18);
          border-radius: 24px; padding: 26px;
          box-shadow: 0 20px 60px rgba(1,30,5,0.13), 0 4px 16px rgba(1,30,5,0.07);
          position: relative; overflow: hidden; z-index: 1;
        }
        .hp-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--g-dark), var(--g-mid), var(--au-mid)); }
        .hp-card-img { background: var(--bg-raised); border: 1px solid rgba(4,149,22,0.08); border-radius: 16px; height: 165px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; position: relative; overflow: hidden; }
        .hp-notif { position: absolute; bottom: -16px; right: -16px; background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.15); border-radius: 14px; padding: 11px 14px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-lg); z-index: 10; }
        .hp-notif-icon { width: 30px; height: 30px; background: rgba(4,149,22,0.08); border: 1px solid rgba(4,149,22,0.18); border-radius: 8px; display: flex; align-items: center; justify-content: center; }

        .hp-section { padding: 100px 28px; }
        .hp-inner { max-width: 1280px; margin: 0 auto; }
        .hp-eyebrow { font-size: 11px; font-weight: 800; color: var(--g-rich); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .hp-eyebrow::before { content: ''; width: 20px; height: 3px; background: linear-gradient(90deg, var(--g-mid), var(--g-rich)); border-radius: 2px; }
        .hp-h2 { font-size: clamp(28px,4vw,44px); font-weight: 900; color: var(--tx-bright); letter-spacing: -0.04em; line-height: 1.08; margin-bottom: 16px; }
        .hp-p  { font-size: 15px; color: var(--tx-muted); line-height: 1.75; margin-bottom: 28px; }

        .hp-features-grid-wrap { display: grid; grid-template-columns: 1fr 2fr; gap: 80px; align-items: flex-start; }
        .hp-features-sticky { position: sticky; top: 90px; }
        .hp-feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .hp-feat { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.1); border-radius: 18px; padding: 24px; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .hp-feat:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
        .hp-feat.green:hover { border-color: rgba(4,149,22,0.28); }
        .hp-feat.gold:hover  { border-color: rgba(201,168,76,0.32); }
        .hp-feat-icon-g { width: 46px; height: 46px; background: rgba(4,149,22,0.07); border: 1px solid rgba(4,149,22,0.2); border-radius: 13px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: var(--g-rich); }
        .hp-feat-icon-au { width: 46px; height: 46px; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); border-radius: 13px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: var(--au-dark); }
        .hp-feat h3 { font-size: 14px; font-weight: 700; color: var(--tx-bright); margin-bottom: 8px; letter-spacing: -0.01em; }
        .hp-feat p  { font-size: 12px; color: var(--tx-muted); line-height: 1.7; margin: 0; }

        .hp-steps-box { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.12); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-md); display: grid; grid-template-columns: repeat(3,1fr); }
        .hp-step { padding: 44px 36px; border-right: 1px solid rgba(4,149,22,0.08); transition: background 0.2s; }
        .hp-step:last-child { border-right: none; }
        .hp-step:hover { background: rgba(4,149,22,0.02); }
        .hp-step-n { font-size: 68px; font-weight: 900; letter-spacing: -0.06em; line-height: 1; margin-bottom: 14px; color: rgba(4,149,22,0.1); }
        .hp-step-bar { width: 28px; height: 3px; border-radius: 999px; margin-bottom: 18px; }
        .hp-step h3 { font-size: 16px; font-weight: 800; color: var(--tx-bright); margin-bottom: 10px; letter-spacing: -0.02em; }
        .hp-step p  { font-size: 13px; color: var(--tx-muted); line-height: 1.75; max-width: 240px; }

        .hp-trust-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hp-trust-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.15); border-radius: 24px; padding: 32px; box-shadow: var(--shadow-xl); position: relative; overflow: hidden; }
        .hp-trust-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--g-dark), var(--g-mid), var(--au-mid)); }
        .hp-trust-raised { background: var(--bg-raised); border-radius: 14px; padding: 20px; margin-bottom: 16px; border: 1px solid rgba(4,149,22,0.08); }

        .hp-qr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hp-qr-card { background: #FFFFFF; border: 1.5px solid rgba(4,149,22,0.15); border-radius: 28px; padding: 40px; box-shadow: var(--shadow-xl); text-align: center; position: relative; overflow: hidden; }
        .hp-qr-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--g-dark), var(--g-mid), var(--au-mid)); }

        .hp-footer { border-top: 1px solid rgba(4,149,22,0.1); padding: 32px 28px; }
        .hp-footer-inner { max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }

        @media (max-width: 1024px) { .hp-hero-inner { grid-template-columns: 1fr; gap: 56px; } .hp-trust-grid { grid-template-columns: 1fr; gap: 48px; } .hp-qr-grid { grid-template-columns: 1fr; gap: 48px; } .hp-features-grid-wrap { grid-template-columns: 1fr; } .hp-features-sticky { position: static; } }
        @media (max-width: 900px)  { .hp-feats { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px)  { .hp-steps-box { grid-template-columns: 1fr; } .hp-step { border-right: none; border-bottom: 1px solid rgba(4,149,22,0.08); } .hp-step:last-child { border-bottom: none; } .hp-hero { padding: 80px 20px; } .hp-section { padding: 72px 20px; } }
        @media (max-width: 480px)  { .hp-feats { grid-template-columns: 1fr; } .hp-stats { flex-direction: column; } .hp-stat { border-right: none; border-bottom: 1px solid rgba(4,149,22,0.08); } }
      `}</style>

      <div className="hp">

        {/* HERO */}
        <section className="hp-hero">
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 60% at 65% -5%, rgba(4,149,22,0.09) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 5% 80%, rgba(2,61,9,0.06) 0%, transparent 50%), radial-gradient(ellipse 40% 35% at 95% 55%, rgba(201,168,76,0.04) 0%, transparent 40%)' }} />
          <div className="hp-hero-inner">
            <div className="animate-fade-up">
              <div className="hp-overline-pill">
                <img src="/gcoc.png" alt="GC" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <div className="hp-overline-dot" />
                <span className="hp-overline-text">Gordon College · Official Rental Hub</span>
              </div>
              <h1 className="hp-h1">
                Rent smarter.
                <span className="hp-h1-accent">Save more.</span>
              </h1>
              <p className="hp-sub">Rentora is the official item rental platform of Gordon College — built exclusively for GC students to borrow, lend, and share academic resources within campus.</p>
              <div className="hp-ctas">
                {user ? (
                  <Link href="/dashboard" className="btn-gold">Go to Dashboard <ArrowRight size={16} strokeWidth={2.5} /></Link>
                ) : (
                  <>
                    <Link href="/auth/register" className="btn-gold">Get started free <ArrowRight size={16} strokeWidth={2.5} /></Link>
                    <Link href="/auth/login" className="btn-ghost">Sign in</Link>
                  </>
                )}
              </div>
              <div className="hp-stats">
                {[
                  { icon: <Package size={13} color="var(--g-rich)" />,     val: itemCount ?? 0,  lbl: 'Items available' },
                  { icon: <Users size={13} color="var(--g-rich)" />,       val: userCount ?? 0,  lbl: 'GC students' },
                  { icon: <TrendingUp size={13} color="var(--au-dark)" />, val: rentalCount ?? 0, lbl: 'Rentals done' },
                ].map((s, i) => (
                  <div key={i} className="hp-stat">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>{s.icon}</div>
                    <div className="hp-stat-num">{s.val}</div>
                    <div className="hp-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up-delay" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="hp-card-wrap">
                {/* Green watercolor paint drip */}
                <div className="hp-paint-drip" />

                <div className="hp-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Featured Item</span>
                    <span className="status-available">Available</span>
                  </div>
                  <div className="hp-card-img">
                    <div style={{ width: '76px', height: '76px', background: 'rgba(4,149,22,0.07)', border: '1px solid rgba(4,149,22,0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calculator size={42} color="var(--g-mid)" strokeWidth={1.4} />
                    </div>
                  </div>
                  <h3 style={{ fontWeight: '800', fontSize: '16px', color: 'var(--tx-bright)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Scientific Calculator</h3>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '0 0 18px' }}>Casio fx-991EX · Like New</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(4,149,22,0.08)' }}>
                    <div>
                      <span style={{ fontSize: '26px', fontWeight: '900', color: 'var(--g-mid)', letterSpacing: '-0.03em' }}>₱50</span>
                      <span style={{ fontSize: '12px', color: 'var(--tx-muted)' }}>/day</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '999px' }}>
                      <Star size={11} fill="#C9A84C" color="#C9A84C" />
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--au-dark)' }}>4.9</span>
                    </div>
                  </div>
                </div>
                <div className="hp-notif">
                  <div className="hp-notif-icon"><CheckCircle2 size={15} color="var(--g-rich)" strokeWidth={2} /></div>
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

        {/* FEATURES */}
        <section className="hp-section">
          <div className="hp-inner">
            <div className="hp-features-grid-wrap">
              <div className="hp-features-sticky">
                <div className="hp-eyebrow">Why Rentora</div>
                <h2 className="hp-h2">Built for GC.<br /><span style={{ color: 'var(--tx-muted)', fontWeight: '400' }}>By a GC student.</span></h2>
                <p className="hp-p">Safety, trust, and simplicity — designed with the Gordon College campus experience in mind.</p>
                <Link href={user ? '/items' : '/auth/register'} className="btn-green" style={{ display: 'inline-flex' }}>
                  {user ? 'Browse items' : 'Join for free'} <ChevronRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
              <div className="hp-feats">
                {features.map((f, i) => (
                  <div key={i} className={`hp-feat ${f.gold ? 'gold' : 'green'}`}>
                    <div className={f.gold ? 'hp-feat-icon-au' : 'hp-feat-icon-g'}>{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* HOW IT WORKS */}
        <section className="hp-section">
          <div className="hp-inner">
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div className="hp-eyebrow" style={{ justifyContent: 'center' }}>How it works</div>
              <h2 className="hp-h2" style={{ textAlign: 'center' }}>Up and running<br /><span style={{ color: 'var(--g-mid)' }}>in minutes.</span></h2>
            </div>
            <div className="hp-steps-box">
              {[
                { n: '01', color: 'var(--g-mid)', shadow: 'rgba(4,149,22,0.35)', title: 'Create your account', desc: 'Sign up with your @gordoncollege.edu.ph email. Verification is instant and automatic.' },
                { n: '02', color: 'var(--au-mid)', shadow: 'rgba(201,168,76,0.35)', title: 'Browse or list items', desc: 'Find what you need or list your own items to earn from them while they sit unused.' },
                { n: '03', color: 'var(--g-mid)', shadow: 'rgba(4,149,22,0.35)', title: 'Rent with confidence', desc: 'Request, agree on dates, and transact safely within the Gordon College community.' },
              ].map((step, i) => (
                <div key={i} className="hp-step">
                  <div className="hp-step-n">{step.n}</div>
                  <div className="hp-step-bar" style={{ background: step.color, boxShadow: `0 0 10px ${step.shadow}` }} />
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* TRUST */}
        <section className="hp-section">
          <div className="hp-inner">
            <div className="hp-trust-grid">
              <div>
                <div className="hp-eyebrow">Trust & Safety</div>
                <h2 className="hp-h2">Your reputation<br /><span className="gold-shimmer">is currency.</span></h2>
                <p className="hp-p">Every rental you complete builds your Trust Score — a transparent rating visible to the entire GC community.</p>
                {[
                  { t: 'GC identity verified',      d: '@gordoncollege.edu.ph email required for all accounts' },
                  { t: 'Ratings after every rental', d: 'Both parties rate each other after completion' },
                  { t: 'Transparent trust scores',   d: 'Visible on every user profile, always' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--au-glow)', border: '1px solid rgba(201,168,76,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--au-mid)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--tx-bright)', margin: '0 0 3px' }}>{item.t}</p>
                      <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hp-trust-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '22px', borderBottom: '1px solid rgba(4,149,22,0.1)' }}>
                  <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))', border: '1.5px solid rgba(4,149,22,0.25)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: '900', fontSize: '20px', boxShadow: '0 4px 16px rgba(1,30,5,0.18)' }}>L</div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--tx-bright)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>Lester Jade Lobos</p>
                    <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: 0 }}>Gordon College · BSCS2B</p>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className="gold-badge"><Star size={10} fill="#C9A84C" color="#C9A84C" /> 4.8</span>
                  </div>
                </div>
                <div className="hp-trust-raised">
                  <p style={{ fontSize: '11px', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: '700' }}>Trust Score</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '14px' }}>
                    <span className="gold-shimmer" style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>4.8</span>
                    <span style={{ fontSize: '16px', color: 'var(--tx-muted)', marginBottom: '4px' }}>/ 5.0</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <div key={s} style={{ height: '5px', flex: 1, borderRadius: '999px', background: s <= 4 ? 'linear-gradient(90deg, var(--au-dark), var(--au-mid))' : 'var(--bg-hover)' }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[{ l: 'Rentals', v: '12' }, { l: 'Reviews', v: '10' }, { l: 'Items', v: '3' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px 8px', background: 'var(--bg-raised)', borderRadius: '12px', border: '1px solid rgba(4,149,22,0.08)' }}>
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

        {/* QR CODE */}
        <section className="hp-section">
          <div className="hp-inner">
            <div className="hp-qr-grid">
              <div>
                <div className="hp-eyebrow">Access Rentora</div>
                <h2 className="hp-h2">Scan to get<br /><span className="gold-shimmer">started instantly.</span></h2>
                <p className="hp-p">Open your phone camera and point it at the QR code — no typing needed. Works on any device.</p>
                {[
                  { n: '01', t: 'Open your camera or QR scanner app',   c: 'var(--g-mid)',  bg: 'rgba(4,149,22,0.07)', b: 'rgba(4,149,22,0.18)' },
                  { n: '02', t: 'Point it at the QR code on the right', c: 'var(--au-dark)', bg: 'var(--au-glow)',       b: 'rgba(201,168,76,0.2)' },
                  { n: '03', t: "Tap the link and you're in",             c: 'var(--g-mid)',  bg: 'rgba(4,149,22,0.07)', b: 'rgba(4,149,22,0.18)' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.bg, border: `1px solid ${s.b}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: s.c }}>{s.n}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--tx-body)', margin: 0, fontWeight: '500' }}>{s.t}</p>
                  </div>
                ))}
                <div style={{ marginTop: '24px', padding: '14px 18px', background: '#FFFFFF', border: '1.5px solid rgba(4,149,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--g-bright)', boxShadow: 'var(--shadow-green)', animation: 'breathe 2s ease infinite', flexShrink: 0 }} />
                  <a href="https://rentora-tau-flame.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--g-mid)', fontWeight: '700', textDecoration: 'none' }}>rentora-tau-flame.vercel.app</a>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="hp-qr-card">
                  <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Scan to Open Rentora</p>
                  <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px', display: 'inline-block', boxShadow: 'var(--shadow-lg)', marginBottom: '24px', border: '1.5px solid rgba(4,149,22,0.12)' }}>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://rentora-tau-flame.vercel.app/&color=02560E&bgcolor=ffffff&qzone=1&format=png" alt="Scan QR" width={200} height={200} style={{ display: 'block', borderRadius: '8px' }} />
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx-bright)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Rentora</p>
                  <p style={{ fontSize: '12px', color: 'var(--tx-muted)', margin: '0 0 20px' }}>Gordon College · Student Rental Hub</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 1 ? 'var(--au-mid)' : 'var(--border-mid)' }} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div style={{ padding: '0 28px 80px' }}>
          <div className="hp-cta-section" style={{ borderRadius: '28px', padding: '80px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(110,255,128,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px', padding: '7px 16px 7px 8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px' }}>
                <img src="/gcoc.png" alt="GC" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(240,255,242,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gordon College Students Only</span>
              </div>
              <h2 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: '900', color: '#F0FFF2', letterSpacing: '-0.05em', marginBottom: '16px', lineHeight: '1.05' }}>
                Your campus marketplace<br /><span className="gold-shimmer">is waiting.</span>
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(240,255,242,0.55)', marginBottom: '40px', maxWidth: '420px', margin: '0 auto 40px', lineHeight: '1.8' }}>
                Join your fellow GC students already using Rentora to save money and share campus resources.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {user ? (
                  <Link href="/items" className="btn-gold">Browse items now <ArrowRight size={16} strokeWidth={2.5} /></Link>
                ) : (
                  <>
                    <Link href="/auth/register" className="btn-gold">Create free account <ArrowRight size={16} strokeWidth={2.5} /></Link>
                    <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(240,255,242,0.8)', fontWeight: '600', fontSize: '14px', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s' }}>Sign in</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="hp-footer">
          <div className="hp-footer-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, var(--g-deep), var(--g-dark), var(--g-mid))', border: '1px solid rgba(4,149,22,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/gcoc.png" alt="GC" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              </div>
              <span style={{ fontWeight: '800', color: 'var(--g-dark)', fontSize: '14px', letterSpacing: '-0.01em' }}>Rentora</span>
              <span style={{ color: 'var(--border-mid)', fontSize: '16px' }}>·</span>
              <span style={{ fontSize: '13px', color: 'var(--tx-muted)' }}>Gordon College Student Rental Hub</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--tx-dim)', margin: 0 }}>© 2026 Rentora · Built for Gordon College · By Lester Jade Lobos · BSCS2B</p>
          </div>
        </footer>

      </div>
    </>
  )
}
