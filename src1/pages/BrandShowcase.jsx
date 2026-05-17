import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Compass, Wrench, Zap, Radio, Heart, Users, Star, ArrowRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  MASON BRIDGE MASTER  —  trades / engineering / architecture
// ─────────────────────────────────────────────────────────────────────────────
function MasonCard() {
  const [tab, setTab] = useState('overview');
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
      className="flex-1 min-w-0 rounded-3xl overflow-hidden border-2 border-[#1a2540] flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #040810 60%, #0d0507 100%)' }}
    >
      {/* Blueprint header band */}
      <div className="relative overflow-hidden px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #0d1a3a 0%, #1a0508 100%)' }}>
        {/* Blueprint grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(#4a9eff 1px, transparent 1px), linear-gradient(90deg, #4a9eff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        {/* Red diagonal accent stripe */}
        <div className="absolute top-0 right-0 w-32 h-full opacity-10"
          style={{ background: 'linear-gradient(135deg, transparent 40%, #dc2626 40%)' }} />

        <div className="relative z-10 flex items-start gap-4">
          {/* Logo mark — compass & square */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 border-[#3b6fef]/40"
            style={{ background: 'linear-gradient(135deg, #1a2e6e, #0d1535)', boxShadow: '0 0 30px rgba(59,111,239,0.25)' }}>
            <Compass size={28} className="text-[#4a9eff]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#dc2626]">IINT Inc.</span>
              <div className="h-px flex-1 bg-[#dc2626]/30 min-w-[20px]" />
            </div>
            <h2 className="text-2xl font-black leading-none tracking-tight"
              style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Bridge Master
            </h2>
            <p className="text-[11px] mt-1 font-bold tracking-widest uppercase"
              style={{ color: '#3b6fef' }}>Mason Edition</p>
          </div>
        </div>

        {/* Compass rose watermark */}
        <div className="absolute bottom-2 right-4 opacity-10 text-[#4a9eff]">
          <Compass size={60} strokeWidth={0.8} />
        </div>
      </div>

      {/* Red/Blue accent rule */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#dc2626]" />
        <div className="flex-1 bg-[#1d4ed8]" />
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-[#1a2540] bg-[#040810]">
        {['overview', 'features', 'audience'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2"
            style={{
              borderColor: tab === t ? '#3b6fef' : 'transparent',
              color: tab === t ? '#4a9eff' : '#334155',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {tab === 'overview' && (
          <>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              The <span className="text-[#f1f5f9] font-bold">professional-grade</span> communication and intelligence bridge. Built for engineers, architects, project managers, and construction trades who need precision communication tools that match the seriousness of their work.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Real-Time Translation', color: '#3b6fef', icon: Radio },
                { label: 'Site Crew Connect', color: '#dc2626', icon: Users },
                { label: 'Blueprint Mode UI', color: '#3b6fef', icon: Compass },
                { label: 'Field-Grade Voice', color: '#dc2626', icon: Wrench },
              ].map(({ label, color, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                  style={{ borderColor: `${color}30`, background: `${color}08` }}>
                  <Icon size={12} style={{ color }} />
                  <span className="text-[10px] font-bold text-[#94a3b8]">{label}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 rounded-xl border border-[#1a2540] bg-[#070b14]">
              <p className="text-[9px] font-mono text-[#334155] uppercase tracking-widest mb-1">Tagline</p>
              <p className="text-sm font-black text-[#f1f5f9] leading-snug italic">
                "Built on precision. Connected by intelligence."
              </p>
            </div>
          </>
        )}
        {tab === 'features' && (
          <div className="space-y-2.5">
            {[
              { f: 'Blueprint-style dark UI — grid lines, precision corners', c: '#3b6fef' },
              { f: 'Red/Blue dual-tone branding — safety + authority', c: '#dc2626' },
              { f: 'Offline-capable voice relay for field use', c: '#3b6fef' },
              { f: 'Multi-crew channel bridging (up to 12 devices)', c: '#dc2626' },
              { f: 'Compass & square icon system throughout', c: '#3b6fef' },
              { f: 'Structured command vocabulary mode', c: '#dc2626' },
            ].map(({ f, c }) => (
              <div key={f} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-sm mt-1.5 shrink-0" style={{ background: c }} />
                <p className="text-[11px] text-[#64748b] leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'audience' && (
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-[#334155] uppercase tracking-widest">Primary markets</p>
            {[
              { seg: 'Construction & Trades', sub: 'Foremen, site supervisors, crews', c: '#dc2626' },
              { seg: 'Architecture & Engineering', sub: 'Project leads, design teams', c: '#3b6fef' },
              { seg: 'Heavy Industry', sub: 'Plant managers, logistics directors', c: '#dc2626' },
              { seg: 'Emergency Services', sub: 'Multilingual field coordination', c: '#3b6fef' },
            ].map(({ seg, sub, c }) => (
              <div key={seg} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#1a2540] bg-[#070b14]">
                <div className="w-2 h-full rounded-full shrink-0 self-stretch min-h-[2rem]" style={{ background: c, width: 3 }} />
                <div>
                  <p className="text-xs font-bold text-[#f1f5f9]">{seg}</p>
                  <p className="text-[9px] text-[#475569]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-5 border-t border-[#1a2540] flex gap-2">
        <div className="flex-1 flex items-center gap-1.5 h-0.5">
          <div className="flex-1 bg-[#dc2626]/30 h-px" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626]/50" />
          <div className="flex-1 bg-[#1d4ed8]/30 h-px" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <Link to="/bridge-master"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #dc2626)', color: '#f1f5f9', boxShadow: '0 4px 20px rgba(29,78,216,0.3)' }}>
          <Compass size={14} /> Launch Mason Edition <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROBOT WHISPERER  —  playful, AI translator, deaf/mute, Pocket Pal branch
// ─────────────────────────────────────────────────────────────────────────────
function WhispererCard() {
  const [tab, setTab] = useState('overview');
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
      className="flex-1 min-w-0 rounded-3xl overflow-hidden border-2 border-[#1e1040] flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0a0414 0%, #040810 60%, #091a0a 100%)' }}
    >
      {/* Playful gradient header */}
      <div className="relative overflow-hidden px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #1a0533 0%, #0a1a04 50%, #001a0d 100%)' }}>
        {/* Bubbly dots */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: 4 + (i % 3) * 4,
              height: 4 + (i % 3) * 4,
              top: `${15 + (i * 17) % 70}%`,
              left: `${5 + (i * 23) % 90}%`,
              background: ['#a78bfa', '#00d4aa', '#f59e0b', '#fb7185'][i % 4],
              animationDelay: `${i * 0.3}s`,
            }} />
        ))}

        <div className="relative z-10 flex items-start gap-4">
          {/* Logo — cute robot face */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 border-[#a78bfa]/40"
            style={{ background: 'linear-gradient(135deg, #2d1458, #0f2d0f)', boxShadow: '0 0 30px rgba(167,139,250,0.3)' }}>
            <span className="text-3xl">🤖</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase"
                style={{ color: '#a78bfa' }}>Pocket Pal Series</span>
            </div>
            <h2 className="text-2xl font-black leading-none"
              style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #00d4aa 50%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Robot Whisperer
            </h2>
            <p className="text-[11px] mt-1 font-bold" style={{ color: '#00d4aa' }}>AI Translator · Voice Bridge · For Everyone</p>
          </div>
        </div>
      </div>

      {/* Rainbow accent rule */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#a78bfa]" />
        <div className="flex-1 bg-[#00d4aa]" />
        <div className="flex-1 bg-[#f59e0b]" />
        <div className="flex-1 bg-[#fb7185]" />
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-[#1e1040] bg-[#040810]">
        {['overview', 'features', 'audience'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2"
            style={{
              borderColor: tab === t ? '#a78bfa' : 'transparent',
              color: tab === t ? '#a78bfa' : '#334155',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {tab === 'overview' && (
          <>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              The <span className="text-[#f1f5f9] font-bold">friendliest AI translator on Earth.</span> Looks like a kids toy. Works like a supercomputer. Helps the deaf, the mute, the shy, and everyone in between communicate effortlessly — across any language, any device, any vibe.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Sign Language Mode', color: '#a78bfa' },
                { label: 'Deaf / Mute Support', color: '#00d4aa' },
                { label: 'Kid-Friendly UI', color: '#f59e0b' },
                { label: 'Robot Voice TTS', color: '#fb7185' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                  style={{ borderColor: `${color}40`, background: `${color}10` }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[10px] font-bold text-[#94a3b8]">{label}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 rounded-xl border border-[#1e1040] bg-[#070b14]">
              <p className="text-[9px] font-mono text-[#334155] uppercase tracking-widest mb-1">Tagline</p>
              <p className="text-sm font-black leading-snug"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                "Every voice matters. Even the ones you can't hear."
              </p>
            </div>
          </>
        )}
        {tab === 'features' && (
          <div className="space-y-2.5">
            {[
              { f: 'Colorful bubbly UI — joyful, non-intimidating design', c: '#a78bfa' },
              { f: 'AI text-to-speech with child-friendly robot voice', c: '#00d4aa' },
              { f: 'Real-time lip reading assistance (camera mode)', c: '#f59e0b' },
              { f: 'Vibration alerts for deaf users', c: '#fb7185' },
              { f: 'Parent-controlled safe mode for kids under 12', c: '#a78bfa' },
              { f: 'Whisper mode — silent text-only sessions', c: '#00d4aa' },
            ].map(({ f, c }) => (
              <div key={f} className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: c }} />
                <p className="text-[11px] text-[#64748b] leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'audience' && (
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-[#334155] uppercase tracking-widest">Who it helps</p>
            {[
              { seg: 'Deaf & Hard of Hearing', sub: 'Full accessibility — vibration, visual, text', c: '#a78bfa' },
              { seg: 'Non-Verbal & Mute', sub: 'AI voice generation for those who can\'t speak', c: '#00d4aa' },
              { seg: 'Kids & Families', sub: 'Safe, fun, educational translation for all ages', c: '#f59e0b' },
              { seg: 'Robot Enthusiast Community', sub: 'Techy AI crowd, early adopters, tinkerers', c: '#fb7185' },
            ].map(({ seg, sub, c }) => (
              <div key={seg} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#1e1040] bg-[#070b14]">
                <div className="w-2 h-full rounded-full shrink-0 self-stretch min-h-[2rem]" style={{ background: c, width: 3 }} />
                <div>
                  <p className="text-xs font-bold text-[#f1f5f9]">{seg}</p>
                  <p className="text-[9px] text-[#475569]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fun emoji row */}
      <div className="px-5 pb-2 flex justify-center gap-3 text-lg">
        {['🤖', '👋', '💬', '🌍', '❤️', '✨'].map((e, i) => (
          <span key={i} className="opacity-60 hover:opacity-100 transition-opacity cursor-default">{e}</span>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link to="/bridge-master"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #00d4aa, #f59e0b)', color: '#030508', boxShadow: '0 4px 20px rgba(167,139,250,0.3)' }}>
          🤖 Meet the Robot Whisperer <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function BrandShowcase() {
  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#1e293b] px-6 py-3 flex items-center gap-3 bg-[#030508]/95 backdrop-blur-sm sticky top-0 z-20">
        <Link to="/mission-control" className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center">
          <ChevronLeft size={13} className="text-[#475569]" />
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[#00d4aa] uppercase tracking-[0.3em]">IINT // BRAND SHOWCASE</p>
          <p className="text-[8px] text-[#475569] font-mono">Mason Bridge Master (Professional) vs Robot Whisperer (Pocket Pal) — side by side</p>
        </div>
      </div>

      {/* Split label */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#dc2626]/40 to-transparent" />
          <p className="text-[9px] font-mono text-[#334155] uppercase tracking-[0.4em] whitespace-nowrap">Two Brands. One Vision.</p>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-center mb-6">
          <div>
            <p className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">Professional</p>
            <p className="text-[9px] text-[#334155]">Trades · Engineering · Authority</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-[#a78bfa] uppercase tracking-widest">Pocket Pal Branch</p>
            <p className="text-[9px] text-[#334155]">Accessible · Fun · Everyone</p>
          </div>
        </div>

        {/* Side-by-side cards */}
        <div className="flex flex-col md:flex-row gap-5">
          <MasonCard />
          <WhispererCard />
        </div>

        {/* Relationship note */}
        <div className="mt-6 p-5 rounded-2xl border border-[#1e293b] bg-[#070b14] space-y-2">
          <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">── IINT Brand Architecture Note ──</p>
          <p className="text-xs text-[#64748b] leading-relaxed">
            <span className="text-[#f1f5f9] font-bold">Bridge Master Mason</span> is the flagship — a premium, professional tool priced for enterprise and trades.
            The <span className="text-[#a78bfa] font-bold">Robot Whisperer</span> is its Pocket Pal branch — same core AI engine, wrapped in a colorful, accessible, lower-cost format for families, accessibility communities, and the robot enthusiast crowd.
            Think of it as the <span className="text-[#f59e0b] italic">headquarters</span> and the <span className="text-[#00d4aa] italic">daycare attached to it</span> — same address, completely different energy.
          </p>
        </div>
      </div>
    </div>
  );
}