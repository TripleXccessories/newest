import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Smartphone, Tablet, Monitor, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

// ── Pocket Pals data ──────────────────────────────────────────────────────────
const POCKET_PALS = [
  {
    id: 'translator',
    name: 'Translator',
    symbol: '📡',
    color: '#00d4aa',
    tagline: 'Phone to phone. Voice to voice.',
    shortDesc: 'Bridges languages and signals between any two people or devices in real time.',
    fullDesc: `The Translator is the original Pocket Pal and the heart of Bridge Master. It bridges language, signals, and understanding — phone-to-phone, voice-to-megaphone, screen-to-screen. Whether you're connecting across a room or across the world, Translator makes sure nothing gets lost in the gap.\n\nFun example: You're at a café in Tokyo. Your new friend speaks only Japanese. Translator listens, converts, and speaks back — live. No app switching. No copy-paste. Just connection.`,
    tags: ['Real-time translation', 'Voice bridge', 'Phone-to-Phone', 'Signal relay'],
    userCan: ['Start a live voice translation session', 'Share a device link to connect 1:1', 'Set preferred language pair', 'Save conversation transcripts'],
    route: '/bridge-master',
  },
  {
    id: 'poker-pat',
    name: 'Poker Pat',
    symbol: '🃏',
    color: '#f59e0b',
    tagline: 'A royal flush in every hand.',
    shortDesc: 'Your strategic mastermind — reads risk like a pro poker player reads a table.',
    fullDesc: `Poker Pat is gender-neutral, cool-headed, and always calculating. Armed with probability models and a sixth sense for risk, Pat guides you through every market decision like it's a high-stakes card game — because it is.\n\nFun example: You're about to enter a volatile trade. Pat deals you the odds — "30% chance of a breakout, 70% it reverses. I'd fold." You hold. Pat was right. Again.`,
    tags: ['Risk Management', 'Probability', 'Pattern Reading', 'Market Strategy'],
    userCan: ['Ask Pat to analyze a trade setup', 'Get a probability breakdown of any scenario', 'Set risk tolerance thresholds', 'Receive bluff detection alerts on market signals'],
    route: '/office-hours',
  },
  {
    id: 'navigator',
    name: 'Navigator',
    symbol: '🗺️',
    color: '#60a5fa',
    tagline: 'Unfold the map. Follow the passage.',
    shortDesc: 'Finds the path from where you are to where the opportunity is — every time.',
    fullDesc: `Navigator carries a worn treasure map and a compass that always points toward opportunity. Every chart pattern is a landmark, every trend line a trail. Navigator turns overwhelming market data into a clear, readable path — from confusion to clarity, from entry to exit.\n\nFun example: The market opens and it looks like chaos. Navigator zooms out, spots a flag pattern, marks the route: "Entry here. Target here. X marks the profit zone." Simple.`,
    tags: ['Trend Analysis', 'Chart Patterns', 'Route Planning', 'Market Mapping'],
    userCan: ['Ask Navigator to map a chart pattern', 'Get a step-by-step trade route', 'Set waypoint alerts for price targets', 'Request a daily market overview'],
    route: '/office-hours',
  },
  {
    id: 'broker',
    name: 'Broker Bill · Will · Jill',
    symbol: '📊',
    color: '#a78bfa',
    tagline: 'The triple threat of financial literacy.',
    shortDesc: 'Three specialists in one — crypto, forex, and candlesticks all at once.',
    fullDesc: `Bill handles the crypto logos. Will decodes the currency symbols. Jill reads the candlesticks. Together, the Broker trio is fluent in every corner of the financial market — translating the language of money into decisions you can act on.\n\nFun example: BTC just moved. Bill spots the token, Will flags the dollar pair, Jill reads the doji. You get a unified read: "Possible reversal — watch the next candle." Three brains, one smart call.`,
    tags: ['₿ Crypto', '💱 Forex', '📉 Candlesticks', 'Exchange', 'Portfolio'],
    userCan: ['Get crypto/forex/equity analysis in one view', 'Ask about specific pairs or tokens', 'See candlestick pattern explanations', 'Set price alerts across all asset classes'],
    route: '/office-hours',
  },
];

// ── Device frames ─────────────────────────────────────────────────────────────
const DEVICES = [
  { id: 'phone', label: 'Phone', icon: Smartphone, w: 375, h: 812, frameW: 200, frameH: 410, radius: 36, bezel: 12 },
  { id: 'tablet', label: 'Tablet', icon: Tablet, w: 768, h: 1024, frameW: 300, frameH: 400, radius: 24, bezel: 10 },
];

function DeviceFrame({ device, children }) {
  return (
    <div className="relative mx-auto shrink-0"
      style={{ width: device.frameW + device.bezel * 2, height: device.frameH + device.bezel * 2 + 40 }}>
      {/* Outer shell */}
      <div className="absolute inset-0 rounded-[28px] bg-[#1a1f2e] border-2 border-[#334155]"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 8px rgba(0,0,0,0.5)' }} />
      {/* Top notch */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0a0f1e] rounded-full z-10" />
      {/* Screen area */}
      <div className="absolute rounded-[20px] overflow-hidden bg-[#030508]"
        style={{ top: device.bezel + 16, left: device.bezel, right: device.bezel, bottom: device.bezel + 24 }}>
        {children}
      </div>
      {/* Home bar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#334155] rounded-full" />
    </div>
  );
}

// ── Pal timeline strip ────────────────────────────────────────────────────────
function PalTimelineStrip({ pals, selected, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {pals.map((pal, i) => (
        <React.Fragment key={pal.id}>
          <button
            onClick={() => onSelect(pal.id)}
            className="shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all"
            style={{
              borderColor: selected === pal.id ? `${pal.color}60` : '#1e293b',
              background: selected === pal.id ? `${pal.color}12` : '#070b14',
            }}>
            <span className="text-2xl">{pal.symbol}</span>
            <span className="text-[9px] font-bold whitespace-nowrap" style={{ color: selected === pal.id ? pal.color : '#64748b' }}>
              {pal.name.split(' ')[0]}
            </span>
            {selected === pal.id && <div className="w-4 h-0.5 rounded-full" style={{ background: pal.color }} />}
          </button>
          {i < pals.length - 1 && (
            <div className="shrink-0 w-6 h-px bg-[#1e293b]" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Pal detail card ────────────────────────────────────────────────────────────
function PalDetailCard({ pal }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div key={pal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${pal.color}30`, background: `linear-gradient(145deg, ${pal.color}08, #070b14)` }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-start gap-3">
        <span className="text-3xl shrink-0">{pal.symbol}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-[#f1f5f9]">{pal.name}</h3>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: pal.color }}>{pal.tagline}</p>
          <p className="text-[11px] text-[#64748b] mt-1.5 leading-relaxed">{pal.shortDesc}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {pal.tags.map(t => (
              <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#1e293b] text-[#475569]">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* User can do */}
      <div className="px-5 pb-3 space-y-1">
        <p className="text-[9px] font-mono uppercase tracking-widest text-[#334155] mb-1.5">What YOU can do with {pal.name.split(' ')[0]}</p>
        {pal.userCan.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: pal.color }} />
            <span className="text-[11px] text-[#94a3b8]">{item}</span>
          </div>
        ))}
      </div>

      {/* Expand for full desc */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 border-t text-[10px] font-mono transition-colors hover:bg-white/5"
        style={{ borderColor: `${pal.color}20`, color: pal.color }}>
        {expanded ? 'COLLAPSE FULL STORY' : 'READ FULL STORY + EXAMPLES'}
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-5 pb-4 space-y-2">
              {pal.fullDesc.split('\n\n').map((para, i) => (
                <p key={i} className="text-[11px] text-[#64748b] leading-relaxed">{para}</p>
              ))}
              <Link to={pal.route}
                className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                style={{ background: `${pal.color}15`, color: pal.color, border: `1px solid ${pal.color}30` }}>
                Try {pal.name.split(' ')[0]} now <ChevronRight size={10} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Mini screen content rendered inside device ────────────────────────────────
function PalScreenPreview({ pal, device }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden text-[#f1f5f9]" style={{ fontSize: device.id === 'phone' ? 9 : 11 }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#030508]" style={{ fontSize: 8 }}>
        <span style={{ color: pal.color }}>Bridge Master</span>
        <span className="text-[#334155]">9:41</span>
      </div>
      {/* Hero */}
      <div className="flex flex-col items-center justify-center py-4 px-3 gap-2"
        style={{ background: `linear-gradient(180deg, ${pal.color}15, transparent)` }}>
        <span style={{ fontSize: device.id === 'phone' ? 28 : 36 }}>{pal.symbol}</span>
        <p className="font-black text-center leading-tight" style={{ color: pal.color, fontSize: device.id === 'phone' ? 10 : 13 }}>{pal.name}</p>
        <p className="text-center text-[#64748b]" style={{ fontSize: device.id === 'phone' ? 7 : 9 }}>{pal.tagline}</p>
      </div>
      {/* Features */}
      <div className="flex-1 px-2 space-y-1.5 overflow-hidden">
        {pal.userCan.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-[#111827] border border-[#1e293b]">
            <div className="w-1 h-1 rounded-full mt-1 shrink-0" style={{ background: pal.color }} />
            <span className="text-[#94a3b8] leading-tight" style={{ fontSize: device.id === 'phone' ? 7 : 9 }}>{item}</span>
          </div>
        ))}
      </div>
      {/* CTA */}
      <div className="px-3 pb-2 pt-2">
        <div className="w-full py-1.5 rounded-lg text-center font-black"
          style={{ background: pal.color, color: '#030508', fontSize: device.id === 'phone' ? 8 : 10 }}>
          Get Started →
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DeviceMockup() {
  const [selectedPal, setSelectedPal] = useState('translator');
  const [activeDevice, setActiveDevice] = useState('phone');

  const pal = POCKET_PALS.find(p => p.id === selectedPal) || POCKET_PALS[0];
  const device = DEVICES.find(d => d.id === activeDevice) || DEVICES[0];

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#00d4aa]/20 px-6 py-3 flex items-center gap-3 bg-[#030508]/95 backdrop-blur-sm sticky top-0 z-20">
        <Link to="/mission-control" className="w-7 h-7 rounded-lg bg-[#0d1f1a] border border-[#00d4aa]/30 flex items-center justify-center">
          <ChevronLeft size={13} className="text-[#00d4aa]" />
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[#00d4aa] uppercase tracking-[0.3em]">IINT // DEVICE MOCKUP VIEWER</p>
          <p className="text-[8px] text-[#475569] font-mono">Phone & Tablet preview · Pocket Pal showcase · Quick + Full descriptions</p>
        </div>
        {/* Device toggle */}
        <div className="ml-auto flex gap-1">
          {DEVICES.map(d => {
            const Icon = d.icon;
            return (
              <button key={d.id} onClick={() => setActiveDevice(d.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                style={{
                  borderColor: activeDevice === d.id ? '#00d4aa60' : '#1e293b',
                  background: activeDevice === d.id ? '#00d4aa15' : '#070b14',
                  color: activeDevice === d.id ? '#00d4aa' : '#475569',
                }}>
                <Icon size={11} /> {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* LEFT — Detail cards */}
        <div className="space-y-5">
          {/* Timeline selector */}
          <div className="space-y-2">
            <p className="text-[9px] font-mono text-[#334155] uppercase tracking-widest">── Pocket Pal Timeline ──</p>
            <PalTimelineStrip pals={POCKET_PALS} selected={selectedPal} onSelect={setSelectedPal} />
          </div>

          {/* Detail cards — show selected on top, rest collapsed */}
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              <PalDetailCard key={pal.id} pal={pal} />
            </AnimatePresence>

            {/* Other pals — compact */}
            <p className="text-[9px] font-mono text-[#1e293b] uppercase tracking-widest pt-1">── Other Pocket Pals ──</p>
            {POCKET_PALS.filter(p => p.id !== selectedPal).map(p => (
              <button key={p.id} onClick={() => setSelectedPal(p.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1e293b] bg-[#070b14] hover:border-[#334155] transition-all text-left">
                <span className="text-xl shrink-0">{p.symbol}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#f1f5f9]">{p.name}</p>
                  <p className="text-[10px] text-[#475569] truncate">{p.shortDesc}</p>
                </div>
                <ChevronRight size={12} className="text-[#334155] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Device mockup */}
        <div className="space-y-4 flex flex-col items-center">
          <p className="text-[9px] font-mono text-[#334155] uppercase tracking-widest self-start">── Device Preview ──</p>

          <AnimatePresence mode="wait">
            <motion.div key={activeDevice + selectedPal}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <DeviceFrame device={device}>
                <PalScreenPreview pal={pal} device={device} />
              </DeviceFrame>
            </motion.div>
          </AnimatePresence>

          <p className="text-[9px] font-mono text-[#334155] text-center max-w-[200px] leading-relaxed">
            Visual preview of how <span style={{ color: pal.color }}>{pal.name.split(' ')[0]}</span> appears on a {device.label.toLowerCase()}
          </p>

          {/* Disclaimer */}
          <div className="w-full max-w-[260px] p-3 rounded-xl border border-[#1e293b] bg-[#070b14] space-y-1">
            <p className="text-[9px] font-mono text-[#475569] uppercase tracking-widest">App Store Readiness</p>
            <p className="text-[10px] text-[#64748b] leading-relaxed">To test on a real device before App Store submission, share the app preview link (found in Dashboard → Publish) with testers via the Base44 test link.</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span className="text-[9px] text-[#f59e0b] font-mono">QA testing available via preview URL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}