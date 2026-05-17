import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Palette, Eye, HelpCircle, X, Lightbulb, ChevronRight,
  Image, Layers, Zap, CheckCircle, Copy
} from 'lucide-react';

// ── Theme definitions ─────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'iint_dark',
    name: 'IINT Dark (Current)',
    desc: 'Deep navy/black with teal accents. Professional, cinematic, high-contrast.',
    bg: '#030508', card: '#070b14', border: '#1e293b', accent: '#00d4aa', text: '#f1f5f9', sub: '#64748b',
    tag: 'DEFAULT', applied: ['All pages'],
  },
  {
    id: 'midnight_gold',
    name: 'Midnight Gold',
    desc: 'Rich black base with amber/gold highlights. Prestige membership feel.',
    bg: '#0a0700', card: '#120f00', border: '#2a1f00', accent: '#f59e0b', text: '#fef9ef', sub: '#78716c',
    tag: 'PRESTIGE', applied: ['AcademyStore', 'MembershipTier pages'],
  },
  {
    id: 'deep_violet',
    name: 'Deep Violet',
    desc: 'Dark indigo with purple-lavender accents. Mystical, creative energy.',
    bg: '#04020a', card: '#0a0614', border: '#1a0e30', accent: '#a78bfa', text: '#f5f3ff', sub: '#6d6280',
    tag: 'CREATIVE', applied: ['SceneStudio', 'CharacterProfiles'],
  },
  {
    id: 'steel_red',
    name: 'Steel & Red',
    desc: 'Gunmetal grays with crimson alerts. Tactical, high-stakes trading feel.',
    bg: '#080808', card: '#111111', border: '#222222', accent: '#ef4444', text: '#f1f1f1', sub: '#6b7280',
    tag: 'TACTICAL', applied: ['PaperTrading', 'RiskAnalysis'],
  },
  {
    id: 'ocean_blue',
    name: 'Ocean Blue',
    desc: 'Deep ocean tones with sky-blue highlights. Clean, trustworthy, modern.',
    bg: '#020810', card: '#050e1c', border: '#0d2040', accent: '#60a5fa', text: '#f0f7ff', sub: '#4a6fa5',
    tag: 'MODERN', applied: ['Dashboard', 'Leaderboard'],
  },
  {
    id: 'forest_teal',
    name: 'Forest Teal',
    desc: 'Dark forest greens with bright teal. Natural, grounded, growth-focused.',
    bg: '#010a06', card: '#040f08', border: '#0a2010', accent: '#10b981', text: '#f0fdf4', sub: '#4a7c5c',
    tag: 'GROWTH', applied: ['AcademyHub', 'Education'],
  },
];

// ── Target page sections where themes can apply ───────────────────────────────
const PAGE_SECTIONS = [
  { id: 'hero', label: 'Hero / Landing', desc: 'Top section of public pages' },
  { id: 'dashboard', label: 'Dashboard Cards', desc: 'Stat cards and overview widgets' },
  { id: 'academy', label: 'Academy Pages', desc: 'Lesson, hub, and progress views' },
  { id: 'store', label: 'Store / Checkout', desc: 'Product cards and purchase flows' },
  { id: 'production', label: 'Production Tools', desc: 'Mission Control and studio pages' },
  { id: 'modals', label: 'Modals / Overlays', desc: 'Pop-ups, drawers, and dialog boxes' },
];

// ── Help guide content ────────────────────────────────────────────────────────
const HELP_ITEMS = [
  {
    q: 'How do I tell the AI image generator what character to draw?',
    a: 'Go to Prompt Playground (/prompt-playground) or Scene Sandbox (/scene-sandbox). Select a character from the dropdown — the system builds a prompt from their BotPersona data (art_direction, reveal_desc, primary_color, environment_desc). You can also type freeform instructions like "focus on hands holding a glowing orb, dramatic lighting from below, close-up portrait".',
    icon: Image,
  },
  {
    q: 'How do I apply a different layout theme to a specific page?',
    a: 'Use the Theme Switcher (you\'re here). Select a theme, pick the target page section, and click Apply. This saves your preference locally. For permanent changes that everyone sees, paste the hex colors from the theme into index.css (the design token file).',
    icon: Palette,
  },
  {
    q: 'How do I preview what users see on their phone before App Store?',
    a: 'Go to Device Mockup Viewer (/device-mockup). It shows your pages inside phone and tablet frames. For real device testing: in your Base44 dashboard, go to Publish → copy the preview URL → open it on your phone or share with testers.',
    icon: Eye,
  },
  {
    q: 'Where do I find the edit checklist for all pages?',
    a: 'Page Index (/page-index) shows every page with three status buttons (Done / Not Needed / Needs Edit), a notes box, how to navigate there, and what users vs admins can do on each page.',
    icon: Layers,
  },
  {
    q: 'How do I control what a rendered image focuses on?',
    a: 'In the Render Pipeline or Scene Sandbox, after selecting a character, edit the prompt text. Use phrases like: "extreme close-up on face", "full body standing", "hands reaching forward", "from below looking up", "golden hour lighting", "dark stormy background". The more specific, the better the result.',
    icon: Zap,
  },
  {
    q: 'I uploaded template screenshots — how do I use them?',
    a: 'Upload your screenshots here in chat. I\'ll analyze each one and apply the layout style to the matching page section. You can also reference them in Prompt Playground by pasting an image URL and saying "use this as visual reference for the hero section".',
    icon: Lightbulb,
  },
];

// ── Mini theme preview card ───────────────────────────────────────────────────
function ThemePreviewCard({ theme, isSelected, onClick }) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: isSelected ? `${theme.accent}60` : '#1e293b', background: isSelected ? `${theme.accent}08` : '#070b14' }}>
      {/* Mini preview */}
      <div className="p-3 rounded-t-xl" style={{ background: theme.bg }}>
        <div className="flex gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444', opacity: 0.5 }} />
          <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b', opacity: 0.5 }} />
          <div className="w-2 h-2 rounded-full" style={{ background: theme.accent, opacity: 0.7 }} />
        </div>
        {/* Mock layout */}
        <div className="space-y-1.5">
          <div className="h-2 rounded-full w-3/4" style={{ background: theme.accent, opacity: 0.7 }} />
          <div className="h-1.5 rounded-full w-full" style={{ background: theme.sub, opacity: 0.3 }} />
          <div className="h-1.5 rounded-full w-4/5" style={{ background: theme.sub, opacity: 0.2 }} />
          <div className="flex gap-1 mt-2">
            <div className="flex-1 h-8 rounded-lg border" style={{ background: theme.card, borderColor: theme.border }} />
            <div className="flex-1 h-8 rounded-lg border" style={{ background: theme.card, borderColor: theme.border }} />
            <div className="flex-1 h-8 rounded-lg border" style={{ background: theme.card, borderColor: theme.border }} />
          </div>
        </div>
      </div>
      {/* Label */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <p className="text-xs font-black text-[#f1f5f9] flex-1">{theme.name}</p>
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded"
            style={{ background: `${theme.accent}20`, color: theme.accent }}>{theme.tag}</span>
        </div>
        <p className="text-[9px] text-[#475569] mt-0.5 leading-relaxed">{theme.desc}</p>
        <p className="text-[8px] text-[#334155] mt-1">Best for: {theme.applied.join(', ')}</p>
      </div>
    </motion.button>
  );
}

// ── Color token display ───────────────────────────────────────────────────────
function ColorToken({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827] border border-[#1e293b] hover:border-[#334155] transition-all w-full text-left">
      <div className="w-5 h-5 rounded shrink-0 border border-[#1e293b]" style={{ background: value }} />
      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-[#475569] font-mono leading-none">{label}</p>
        <p className="text-[10px] text-[#94a3b8] font-mono">{value}</p>
      </div>
      {copied ? <CheckCircle size={10} className="text-[#00d4aa] shrink-0" /> : <Copy size={10} className="text-[#334155] shrink-0" />}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ThemeSwitcher() {
  const [selectedTheme, setSelectedTheme] = useState('iint_dark');
  const [selectedSection, setSelectedSection] = useState('hero');
  const [showHelp, setShowHelp] = useState(false);
  const [openHelp, setOpenHelp] = useState(null);
  const [applied, setApplied] = useState({});

  const theme = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  const applyTheme = () => {
    setApplied(prev => ({ ...prev, [selectedSection]: selectedTheme }));
  };

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#a78bfa]/20 px-6 py-3 flex items-center gap-3 bg-[#030508]/95 backdrop-blur-sm sticky top-0 z-20">
        <Link to="/mission-control" className="w-7 h-7 rounded-lg bg-[#110d1f] border border-[#a78bfa]/30 flex items-center justify-center">
          <ChevronLeft size={13} className="text-[#a78bfa]" />
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[#a78bfa] uppercase tracking-[0.3em]">IINT // THEME SWITCHER</p>
          <p className="text-[8px] text-[#475569] font-mono">Layout comparison · Brand themes · Visual preview per section</p>
        </div>
        <button onClick={() => setShowHelp(v => !v)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all"
          style={{ borderColor: showHelp ? '#a78bfa60' : '#1e293b', background: showHelp ? '#a78bfa15' : '#070b14', color: showHelp ? '#a78bfa' : '#475569' }}>
          <HelpCircle size={11} /> Help Guide
        </button>
      </div>

      {/* Help guide panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[#a78bfa]/20 bg-[#0a0614]">
            <div className="max-w-5xl mx-auto p-6 space-y-3">
              <p className="text-[10px] font-mono text-[#a78bfa] uppercase tracking-widest mb-3">── Mission Control Help Guide ──</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HELP_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  const isOpen = openHelp === i;
                  return (
                    <div key={i} className="rounded-xl border border-[#1e293b] bg-[#070b14] overflow-hidden">
                      <button onClick={() => setOpenHelp(isOpen ? null : i)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left">
                        <Icon size={13} className="text-[#a78bfa] shrink-0" />
                        <p className="text-[11px] font-bold text-[#f1f5f9] flex-1 leading-snug">{item.q}</p>
                        {isOpen ? <ChevronLeft size={11} className="text-[#475569] rotate-90" /> : <ChevronRight size={11} className="text-[#475569]" />}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden">
                            <p className="px-4 pb-3 text-[11px] text-[#64748b] leading-relaxed border-t border-[#1e293b] pt-2">{item.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* LEFT — Theme grid */}
        <div className="space-y-5">
          <p className="text-[9px] font-mono text-[#334155] uppercase tracking-widest">── Choose a Theme ──</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map(t => (
              <ThemePreviewCard key={t.id} theme={t} isSelected={selectedTheme === t.id} onClick={() => setSelectedTheme(t.id)} />
            ))}
          </div>
        </div>

        {/* RIGHT — Apply + preview */}
        <div className="space-y-5">
          {/* Live preview mock */}
          <div className="space-y-2">
            <p className="text-[9px] font-mono text-[#334155] uppercase tracking-widest">── Live Preview ──</p>
            <div className="rounded-2xl overflow-hidden border border-[#1e293b]" style={{ background: theme.bg }}>
              {/* Mock nav */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: theme.border, background: theme.card }}>
                <div className="w-5 h-5 rounded-lg" style={{ background: theme.accent }} />
                <div className="flex-1 h-2 rounded-full" style={{ background: theme.border }} />
                <div className="w-12 h-2 rounded-full" style={{ background: theme.accent, opacity: 0.4 }} />
              </div>
              {/* Mock content */}
              <div className="p-5 space-y-3">
                <div className="h-3 w-2/3 rounded-full" style={{ background: theme.accent, opacity: 0.8 }} />
                <div className="h-2 w-full rounded-full" style={{ background: theme.sub, opacity: 0.3 }} />
                <div className="h-2 w-4/5 rounded-full" style={{ background: theme.sub, opacity: 0.2 }} />
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="rounded-xl p-3 border space-y-2" style={{ background: theme.card, borderColor: theme.border }}>
                      <div className="h-2 rounded-full" style={{ background: theme.accent, opacity: 0.5 }} />
                      <div className="h-1.5 rounded-full" style={{ background: theme.sub, opacity: 0.2 }} />
                      <div className="h-1.5 rounded-full w-2/3" style={{ background: theme.sub, opacity: 0.15 }} />
                    </div>
                  ))}
                </div>
                <div className="h-8 rounded-xl flex items-center justify-center" style={{ background: theme.accent }}>
                  <div className="w-16 h-2 rounded-full" style={{ background: theme.bg, opacity: 0.7 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Apply to section */}
          <div className="space-y-2">
            <p className="text-[9px] font-mono text-[#334155] uppercase tracking-widest">── Apply To Section ──</p>
            <div className="space-y-1.5">
              {PAGE_SECTIONS.map(s => {
                const appliedThemeName = THEMES.find(t => t.id === applied[s.id])?.name;
                return (
                  <button key={s.id} onClick={() => setSelectedSection(s.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: selectedSection === s.id ? '#a78bfa60' : '#1e293b',
                      background: selectedSection === s.id ? '#a78bfa10' : '#070b14',
                    }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#f1f5f9]">{s.label}</p>
                      <p className="text-[9px] text-[#475569]">{s.desc}</p>
                    </div>
                    {appliedThemeName && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 shrink-0">
                        {appliedThemeName.split(' ')[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button onClick={applyTheme}
              className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{ background: `linear-gradient(135deg, #a78bfa, #7c3aed)`, color: '#f5f3ff' }}>
              <Palette size={14} /> Apply {theme.name} to {PAGE_SECTIONS.find(s => s.id === selectedSection)?.label}
            </button>
          </div>

          {/* Color tokens */}
          <div className="space-y-2">
            <p className="text-[9px] font-mono text-[#334155] uppercase tracking-widest">── Copy Color Tokens ──</p>
            <div className="space-y-1">
              {[
                ['Background', theme.bg],
                ['Card', theme.card],
                ['Border', theme.border],
                ['Accent', theme.accent],
                ['Text', theme.text],
                ['Muted', theme.sub],
              ].map(([label, value]) => (
                <ColorToken key={label} label={label} value={value} />
              ))}
            </div>
            <p className="text-[9px] text-[#334155] leading-relaxed">Paste these into <span className="font-mono text-[#475569]">index.css</span> under <span className="font-mono text-[#475569]">:root</span> to apply globally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}