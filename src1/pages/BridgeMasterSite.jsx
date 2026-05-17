import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronRight, ArrowDown, Zap, TrendingUp, Heart, Users } from 'lucide-react';
import PocketPalCard from '@/components/bridgemaster/PocketPalCard.jsx';
import PocketPalModal from '@/components/bridgemaster/PocketPalModal.jsx';

// ── Pocket Pals ────────────────────────────────────────────────────────────────
const POCKET_PALS = [
  {
    id: 'poker-pat',
    name: 'Poker Pat',
    category: 'Strategy',
    color: '#f59e0b',
    symbol: '🃏',
    tagline: 'A royal flush in every hand. Pat plays the odds so you don\'t have to.',
    description: 'Poker Pat is your strategic mastermind — a gender-neutral companion who reads the table like a pro. Armed with a royal flush and a sixth sense for probability, Pat guides you through every calculated risk, bluff, and all-in moment. Whether the market is Texas Hold\'em or Five-Card Draw, Pat knows when to hold and when to fold.',
    tags: ['Risk Management', 'Probability', 'Bluff Detection', 'Pattern Reading', 'Patience'],
    signature: 'The cards never lie — but the market bluffs every day. Know the difference.',
  },
  {
    id: 'navigator',
    name: 'Navigator',
    category: 'Pathfinding',
    color: '#60a5fa',
    symbol: '🗺️',
    tagline: 'Unfold the map. Follow the passage. X marks the opportunity.',
    description: 'Navigator is your compass in an uncharted world — a seasoned explorer who carries a worn, unfolded treasure map that reveals the hidden passage between where you are and where the opportunity lies. Every chart pattern is a landmark, every trend line a trail. Navigator turns complexity into a clear path from A to X.',
    tags: ['Trend Analysis', 'Chart Patterns', 'Route Planning', 'Market Mapping', 'Discovery'],
    signature: 'Every market has a passage. My job is to find it before anyone else unfolds the map.',
  },
  {
    id: 'broker-pat',
    name: 'Broker Bill · Will · Jill',
    category: 'Finance',
    color: '#00d4aa',
    symbol: '📊',
    tagline: 'The triple threat — crypto logos, currency symbols, candlesticks on the exchange.',
    description: 'Three names, one powerhouse. Broker Bill, Will, and Jill are the trinity of financial literacy — fluent in every crypto token, every fiat currency symbol, and every candlestick formation on the exchange. They live between the bid and the ask, translating the language of markets into actionable intelligence for your portfolio.',
    tags: ['₿ Crypto', '💱 Forex', '📉 Candlesticks', 'Exchange', 'Portfolio'],
    signature: 'Between every bid and ask is a story. We read all three chapters simultaneously.',
  },
  {
    id: 'translator',
    name: 'Translator',
    category: 'Communication',
    color: '#a78bfa',
    symbol: '📡',
    tagline: 'Phone to phone. Voice to voice. Every signal decoded, every message bridged.',
    description: 'The Translator is the heartbeat of the Bridge Master ecosystem — the companion that bridges languages, signals, and understanding between people and devices. Whether it\'s phone-to-phone, voice-to-megaphone, or signal-to-signal, Translator ensures nothing gets lost in the gap. The original Pocket Pal that started it all.',
    tags: ['Real-Time Translation', 'Voice Bridge', 'Signal Relay', 'Phone-to-Phone', '1:1 Connection'],
    signature: 'Language is just the gap. I am the bridge.',
  },
];

// ── IINT Apps ──────────────────────────────────────────────────────────────────
const APPS = [
  { id: 'bridge', name: 'Bridge Master', tagline: 'The #1 1:1 connection & translation app', desc: 'Real-time translation, mood sensing, device bridging, and AI conversation — the flagship product from the Creativity Vault.', color: '#00d4aa', icon: '🌉', route: '/bridge-master', features: ['Real-time AI translation', 'Mood sensing', 'Device discovery', 'Voice synthesis'] },
  { id: 'academy', name: 'IINT Academy', tagline: 'Where trading knowledge becomes mastery', desc: 'Six schools. 18 AI faculty. Gamified curriculum from Kindergarten to University.', color: '#f59e0b', icon: '🎓', route: '/academy-hub', features: ['AI Faculty', '6 School levels', 'Gamified progression', 'Cinematic intros'] },
  { id: 'trading', name: 'Trading Platform', tagline: 'Paper trading with real intelligence', desc: 'Virtual $100k portfolio. Real-time signals. Mirror trading. Bot rental.', color: '#60a5fa', icon: '📈', route: '/paper-trading', features: ['$100k virtual portfolio', 'Signal feed', 'Bot rental', 'Mirror trading'] },
  { id: 'studio', name: 'Scene Studio', tagline: 'Cinematic production, no film crew needed', desc: 'Build animated scenes with AI characters, 8-track music, voice synthesis, and FX plugins.', color: '#a78bfa', icon: '🎬', route: '/scene-studio', features: ['AI voice synthesis', '8-track beat machine', 'Scene sequencer', 'Dispatch'] },
];

// ── Scroll progress ────────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return <div className="fixed top-0 left-0 h-[2px] z-50 transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00d4aa, #60a5fa)' }} />;
}

// ── Nav ────────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(3,5,8,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(30,41,59,0.8)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo lockup */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', boxShadow: '0 0 20px rgba(0,212,170,0.3)' }}>
            <span className="text-[#030508] font-black text-xs tracking-tighter">IINT</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-[#f1f5f9] leading-none tracking-tight">TheBridgeMaster</span>
            <span className="text-[8px] text-[#475569] leading-none mt-0.5">by IINT Inc.</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {[['#pals', 'Pocket Pals'], ['#apps', 'Apps'], ['#about', 'About']].map(([href, label]) => (
            <a key={href} href={href}
              className="text-xs text-[#64748b] hover:text-[#f1f5f9] transition-colors hidden md:block">
              {label}
            </a>
          ))}
          <a href="#join"
            className="text-xs font-black px-5 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', color: '#030508' }}>
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-6 pt-24 pb-16">
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1a2332 1px, transparent 0)', backgroundSize: '44px 44px', opacity: 0.6 }} />

      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-8"
        style={{ background: 'rgba(0,212,170,0.06)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none blur-3xl opacity-6"
        style={{ background: 'rgba(96,165,250,0.05)' }} />

      {/* DOMINANT IINT LOGO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: 'backOut' }}
        className="relative z-10 mb-10"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-[40px] blur-2xl opacity-30"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', transform: 'scale(1.15)' }} />
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[36px] flex flex-col items-center justify-center shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #00d4aa 0%, #007a62 50%, #004d3d 100%)',
            boxShadow: '0 0 80px rgba(0,212,170,0.4), 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
          <span className="text-[#030508] font-black text-4xl md:text-5xl tracking-tighter leading-none">IINT</span>
          <span className="text-[#004d3d] font-black text-[9px] tracking-[0.3em] uppercase mt-1">Inc.</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="relative z-10 max-w-4xl mx-auto space-y-6"
      >
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1e293b] bg-[#0a0f1e]/80">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          <span className="text-[10px] font-mono text-[#475569] uppercase tracking-[0.3em]">TheBridgeMaster.com</span>
        </div>

        {/* Main headline */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight text-[#f1f5f9]">
            The Bridge
            <br />
            <span style={{ background: 'linear-gradient(135deg, #00d4aa 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Master
            </span>
          </h1>
          <p className="text-base md:text-lg text-[#475569] font-medium tracking-wide">
            <span className="text-[#f1f5f9]">by IINT Inc.</span>
          </p>
        </div>

        {/* Value proposition — #1 copy */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-2">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#1e293b] bg-[#0a0f1e]">
            <Heart size={14} className="text-[#fb7185]" fill="#fb7185" />
            <span className="text-xs font-bold text-[#f1f5f9]">The <span className="text-[#fb7185]">#1</span> for Love</span>
          </div>
          <div className="w-px h-4 bg-[#1e293b] hidden sm:block" />
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#1e293b] bg-[#0a0f1e]">
            <Users size={14} className="text-[#00d4aa]" />
            <span className="text-xs font-bold text-[#f1f5f9]">The <span className="text-[#00d4aa]">#1</span> for One-to-One</span>
          </div>
        </div>

        <p className="text-base md:text-lg text-[#64748b] max-w-2xl mx-auto leading-relaxed">
          The <strong className="text-[#f1f5f9]">#1 contender</strong> in the new product line — born from the <em className="text-[#00d4aa]">Creativity Vault</em> and the visionary mind of our founder. The Bridge Master bridges the gap to the entire collection of our{' '}
          <span className="font-black text-[#f1f5f9]">Pocket Pals</span> — your most intimate companion series yet.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a href="#join"
            className="px-10 py-4 rounded-2xl text-sm font-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', color: '#030508', boxShadow: '0 0 50px rgba(0,212,170,0.3)' }}>
            Join the Platform →
          </a>
          <a href="#pals"
            className="px-8 py-4 rounded-2xl text-sm font-bold border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors">
            Meet the Pocket Pals ↓
          </a>
        </div>

        <p className="text-[10px] text-[#334155]">Domain-owned · IINT Inc. registered · iOS & Android · No credit card required</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown size={16} className="text-[#334155]" />
      </motion.div>
    </section>
  );
}

// ── Pocket Pals ────────────────────────────────────────────────────────────────
function PocketPals() {
  const [selectedPal, setSelectedPal] = useState(null);

  return (
    <section id="pals" className="py-28 px-6 relative overflow-hidden">
      {/* Section ambient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.04) 0%, transparent 60%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1e293b] bg-[#0a0f1e]">
            <span className="text-[10px] font-mono text-[#475569] uppercase tracking-[0.3em]">From the Creativity Vault</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#f1f5f9] leading-tight">
            Pocket Pal
            <br />
            <span style={{ background: 'linear-gradient(135deg, #00d4aa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Collection
            </span>
          </h2>
          <p className="text-base text-[#64748b] max-w-2xl mx-auto leading-relaxed">
            A wonderful series of companions — each one a specialist, each one a bridge between you and mastery.
            Tap any Pocket Pal to get the full story.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POCKET_PALS.map((pal, i) => (
            <PocketPalCard key={pal.id} pal={pal} index={i} onClick={setSelectedPal} />
          ))}
        </div>

        {/* Bottom line */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-[#334155]">More Pocket Pals arriving from the Vault — stay tuned.</p>
        </motion.div>
      </div>

      {/* Modal */}
      {selectedPal && <PocketPalModal pal={selectedPal} onClose={() => setSelectedPal(null)} />}
    </section>
  );
}

// ── App Suite ─────────────────────────────────────────────────────────────────
function AppSuite() {
  return (
    <section id="apps" className="py-24 px-6 bg-[#070b14]">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-[10px] font-mono tracking-[0.4em] text-[#475569] uppercase">The Ecosystem</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#f1f5f9]">
            One Vision. Four Worlds.
          </h2>
          <p className="text-sm text-[#64748b] max-w-lg mx-auto">
            Every app from IINT Inc. is a standalone universe — and Bridge Master sits at the centre of them all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {APPS.map((app, i) => (
            <motion.div key={app.id}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="rounded-3xl border p-6 space-y-4 transition-all hover:scale-[1.01]"
              style={{ borderColor: `${app.color}25`, background: `linear-gradient(145deg, ${app.color}08, #070b14)` }}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">{app.icon}</span>
                  <h3 className="text-lg font-black text-[#f1f5f9] mt-2">{app.name}</h3>
                  <p className="text-xs font-medium mt-0.5" style={{ color: app.color }}>{app.tagline}</p>
                </div>
                {i === 0 && (
                  <span className="text-[9px] px-2 py-1 rounded-full font-black"
                    style={{ background: `${app.color}20`, color: app.color, border: `1px solid ${app.color}40` }}>
                    FLAGSHIP
                  </span>
                )}
              </div>
              <p className="text-sm text-[#64748b] leading-relaxed">{app.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {app.features.map(f => (
                  <span key={f} className="text-[9px] px-2 py-1 rounded-full bg-[#1e293b] text-[#64748b]">{f}</span>
                ))}
              </div>
              <Link to={app.route}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{ background: `${app.color}15`, color: app.color, border: `1px solid ${app.color}35` }}>
                <Zap size={11} /> Try Demo
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-[10px] font-mono tracking-[0.4em] text-[#475569] uppercase">About</p>
          <h2 className="text-3xl font-black text-[#f1f5f9]">IINT Inc.</h2>
          <p className="text-[#64748b] max-w-xl mx-auto leading-relaxed text-sm">
            Intelligent Integrated Intelligence Technologies — building the next generation of AI-powered connection, trading education, and the companion app revolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🎓', title: 'Academy', desc: '18 AI faculty. 6 school levels. Complete trading curriculum from zero to institutional.', link: '/academy-hub', label: 'Enter Academy' },
            { icon: '🛍️', title: 'Academy Store', desc: 'Courses, tools, subscriptions, and exclusive membership tiers — all in one storefront.', link: '/academy-store', label: 'Visit Store' },
            { icon: '🎬', title: 'Cinematic Experience', desc: 'A full-screen immersive introduction to the IINT world. The journey begins here.', link: '/landing', label: 'Watch Intro' },
          ].map(c => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-3">
              <span className="text-3xl">{c.icon}</span>
              <h3 className="text-sm font-black text-[#f1f5f9]">{c.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{c.desc}</p>
              <Link to={c.link} className="flex items-center gap-1 text-[10px] font-bold text-[#00d4aa] hover:underline">
                {c.label} <ChevronRight size={10} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────
function JoinCTA() {
  return (
    <section id="join" className="py-32 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,170,0.07) 0%, transparent 65%)' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="relative z-10 max-w-2xl mx-auto space-y-6">

        {/* Mini IINT logo */}
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', boxShadow: '0 0 40px rgba(0,212,170,0.35)' }}>
          <span className="text-[#030508] font-black text-sm tracking-tighter">IINT</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-[#f1f5f9] leading-tight">
          Start your journey.<br />
          <span style={{ background: 'linear-gradient(135deg, #00d4aa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Bridge the gap.
          </span>
        </h2>
        <p className="text-[#64748b] leading-relaxed">
          Join the platform that set the new standard. The Bridge Master — the #1 for love, the #1 for one-to-one.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/landing"
            className="px-10 py-4 rounded-2xl text-base font-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', color: '#030508', boxShadow: '0 0 50px rgba(0,212,170,0.3)' }}>
            Create Free Account →
          </Link>
          <Link to="/"
            className="px-8 py-4 rounded-2xl text-sm font-bold border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors">
            Sign In
          </Link>
        </div>
        <p className="text-[10px] text-[#334155]">No credit card required · Free beta access · iOS & Android</p>
      </motion.div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[#1e293b] bg-[#030508] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)' }}>
                <span className="text-[#030508] font-black text-[10px] tracking-tighter">IINT</span>
              </div>
              <div>
                <p className="text-sm font-black text-[#f1f5f9] leading-none">TheBridgeMaster</p>
                <p className="text-[8px] text-[#475569] mt-0.5">by IINT Inc.</p>
              </div>
            </div>
            <p className="text-[10px] text-[#334155]">© 2025 IINT Inc. All rights reserved.</p>
            <p className="text-[9px] text-[#1e293b] max-w-xs">TheBridgeMaster.com — domain registered and owned by IINT Inc.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-xs">
            <div className="space-y-2">
              <p className="font-black text-[#f1f5f9] text-[10px] uppercase tracking-widest">Platform</p>
              {['Bridge Master', 'Academy', 'Trading', 'Studio', 'Stereo'].map(l => (
                <p key={l} className="text-[#475569] hover:text-[#94a3b8] cursor-pointer">{l}</p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-black text-[#f1f5f9] text-[10px] uppercase tracking-widest">Pocket Pals</p>
              {['Poker Pat', 'Navigator', 'Broker Bill·Will·Jill', 'Translator'].map(l => (
                <p key={l} className="text-[#475569] hover:text-[#94a3b8] cursor-pointer">{l}</p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-black text-[#f1f5f9] text-[10px] uppercase tracking-widest">Legal</p>
              <Link to="/terms" className="block text-[#475569] hover:text-[#94a3b8]">Terms of Service</Link>
              {['Privacy Policy', 'Risk Disclosure'].map(l => (
                <p key={l} className="text-[#475569] hover:text-[#94a3b8] cursor-pointer">{l}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#1e293b] pt-4">
          <p className="text-[8px] text-[#1e293b] leading-relaxed">
            IINT Inc. is a technology company. Trading involves substantial risk of loss. Past performance is not indicative of future results.
            All trading activities on the IINT platform are simulated/virtual unless explicitly stated.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BridgeMasterSite() {
  return (
    <div className="bg-[#030508] text-[#f1f5f9] min-h-screen">
      <ScrollProgress />
      <Nav />
      <Hero />
      <PocketPals />
      <AppSuite />
      <About />
      <JoinCTA />
      <Footer />
    </div>
  );
}