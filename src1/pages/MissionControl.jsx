import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Clapperboard, Users, Mic, Music, ChevronLeft, Monitor,
  Zap, Sparkles, Film, Layers, Lock, GraduationCap,
  BarChart2, Eye, Video, Radio, Cpu, Volume2, Wand2
} from 'lucide-react';

// ── Panel definitions ─────────────────────────────────────────────────────────
const PANELS = [
  {
    id: 'scenes',
    label: 'Scene Production',
    icon: Clapperboard,
    color: '#00d4aa',
    description: 'Build, sequence & dispatch cinematic scenes',
    tools: [
      { label: 'Scene Sandbox', sublabel: 'Drag · Dialogue · Render Preview', icon: Film, path: '/scene-sandbox', badge: 'NEW' },
      { label: 'Scene Studio', sublabel: 'Full sequencer & beat machine', icon: Clapperboard, path: '/scene-studio' },
      { label: 'Storyboard Export', sublabel: 'Grid · Flipbook · PDF', icon: Film, path: '/storyboard' },
      { label: 'Character Timeline', sublabel: 'Drag & drop 120s timeline', icon: Layers, path: '/character-timeline' },
      { label: 'Scene Validator', sublabel: 'Check before dispatch', icon: Eye, path: '/scene-studio' },
      { label: 'Directors Cut Hub', sublabel: 'All production tools', icon: Video, path: '/directors-cut' },
      { label: 'Device Mockup Viewer', sublabel: 'Phone · Tablet · Pocket Pals', icon: Monitor, path: '/device-mockup', badge: 'NEW' },
    ],
  },
  {
    id: 'characters',
    label: 'Character Control',
    icon: Users,
    color: '#a78bfa',
    description: 'Design, lock & manage all 18 faculty characters',
    tools: [
      { label: 'Character Design Lab', sublabel: 'Colors · Moods · Poses', icon: Sparkles, path: '/character-design-lab' },
      { label: 'Character Lock Studio', sublabel: 'Personality · Lock', icon: Lock, path: '/character-lock' },
      { label: 'Character Profiles', sublabel: '18 faculty dossiers', icon: Users, path: '/character-profiles' },
      { label: 'Character Timeline', sublabel: 'Scene presence blocks', icon: Film, path: '/character-timeline' },
      { label: 'Character Lab Preview', sublabel: 'Robot · LightbulbGuy', icon: Cpu, path: '/robot-demo' },
      { label: 'Asset Dashboard', sublabel: 'Production readiness', icon: BarChart2, path: '/asset-dashboard' },
      { label: 'Page Index', sublabel: 'Edit checklist · Nav guide · Notes', icon: Layers, path: '/page-index', badge: 'NEW' },
      { label: 'Theme Switcher', sublabel: 'Layouts · Colors · Help guide', icon: Sparkles, path: '/theme-switcher', badge: 'NEW' },
      { label: 'Brand Showcase', sublabel: 'Mason vs Robot Whisperer', icon: Zap, path: '/brand-showcase', badge: 'NEW' },
    ],
  },
  {
    id: 'voices',
    label: 'Character Voices',
    icon: Mic,
    color: '#f59e0b',
    description: 'Generate, clone & assign voices per character',
    tools: [
      { label: 'Voice Studio', sublabel: 'TTS · Clone · Assign', icon: Mic, path: '/voice-studio' },
      { label: 'Office Hours', sublabel: 'Live chat with faculty voices', icon: Radio, path: '/office-hours' },
      { label: 'Narrative Portal', sublabel: 'Narrated task messages', icon: Film, path: '/narrative-portal' },
      { label: 'Prompt Playground', sublabel: 'AI art prompt generator', icon: Wand2, path: '/prompt-playground' },
      { label: 'Render Pipeline', sublabel: 'DALL-E 3 batch renders', icon: Sparkles, path: '/render-pipeline' },
      { label: 'Voice Cloning Lab', sublabel: 'Upload · Clone · Adjust · Preview', icon: Mic, path: '/voice-cloning-lab', badge: 'NEW' },
    ],
  },
  {
    id: 'audio',
    label: 'Audio & FX',
    icon: Music,
    color: '#fb7185',
    description: 'Music, beats, voice changer & ambient audio',
    tools: [
      { label: 'Audio Studio', sublabel: 'Clips · Upload · Manage', icon: Music, path: '/audio-studio' },
      { label: 'Stereo Player', sublabel: 'Music · Beats · Easter Eggs', icon: Volume2, path: '/stereo' },
      { label: 'The Bard', sublabel: 'Story & audio narrative', icon: Radio, path: '/the-bard' },
      { label: 'Lesson Generator', sublabel: 'AI full lesson scripts', icon: GraduationCap, path: '/lesson-generator' },
      { label: 'Production Metrics', sublabel: 'Scenes · Compute · Pending assets', icon: BarChart2, path: '/production-metrics', badge: 'NEW' },
    ],
  },
];

// ── Scanline overlay ──────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #00d4aa 0px, #00d4aa 1px, transparent 1px, transparent 4px)',
      }}
    />
  );
}

// ── Screen header with blinking status ───────────────────────────────────────
function ScreenHeader() {
  return (
    <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-[#00d4aa]/20 bg-[#030508]/90 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link to="/" className="w-7 h-7 rounded-lg bg-[#0d1f1a] border border-[#00d4aa]/30 flex items-center justify-center hover:border-[#00d4aa]/60 transition-colors">
          <ChevronLeft size={13} className="text-[#00d4aa]" />
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[#00d4aa] uppercase tracking-[0.3em]">IINT // MISSION CONTROL</p>
          <p className="text-[8px] text-[#475569] font-mono">Director's Console v2.0 — Production Mode</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          <span className="text-[9px] font-mono text-[#00d4aa]">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          <span className="text-[9px] font-mono text-[#475569]">SYS OK</span>
        </div>
        <Link to="/directors-cut"
          className="text-[9px] font-mono px-3 py-1 rounded border border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/10 transition-colors">
          ALL TOOLS ↗
        </Link>
      </div>
    </div>
  );
}

// ── Individual panel ──────────────────────────────────────────────────────────
function ControlPanel({ panel, isActive, onClick }) {
  const Icon = panel.icon;
  return (
    <motion.div
      layout
      onClick={onClick}
      className="cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isActive ? `${panel.color}60` : `${panel.color}18`,
        background: isActive
          ? `linear-gradient(145deg, ${panel.color}12, #070b14)`
          : `linear-gradient(145deg, ${panel.color}05, #030508)`,
        boxShadow: isActive ? `0 0 40px ${panel.color}15, inset 0 0 30px ${panel.color}05` : 'none',
      }}
    >
      {/* Panel header — always visible */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${panel.color}18`, border: `1px solid ${panel.color}35` }}>
          <Icon size={16} style={{ color: panel.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-[#f1f5f9] leading-none">{panel.label}</p>
          <p className="text-[9px] text-[#475569] mt-0.5 font-mono truncate">{panel.description}</p>
        </div>
        {/* LED indicator */}
        <div className="w-2 h-2 rounded-full shrink-0 transition-all"
          style={{ background: isActive ? panel.color : '#1e293b', boxShadow: isActive ? `0 0 8px ${panel.color}` : 'none' }} />
      </div>

      {/* Expanded tools grid */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-1 gap-1.5 border-t"
              style={{ borderColor: `${panel.color}20` }}>
              <p className="text-[8px] font-mono text-[#334155] uppercase tracking-widest pt-3 pb-1">
                ── STATION TOOLS ──
              </p>
              {panel.tools.map(tool => {
                const TIcon = tool.icon;
                return (
                  <Link
                    key={tool.path + tool.label}
                    to={tool.path}
                    onClick={e => e.stopPropagation()}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ background: `${panel.color}08`, border: `1px solid ${panel.color}15` }}
                  >
                    <TIcon size={13} style={{ color: panel.color }} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#f1f5f9] leading-none">{tool.label}</p>
                      <p className="text-[9px] text-[#475569] mt-0.5 truncate">{tool.sublabel}</p>
                    </div>
                    <Zap size={10} style={{ color: panel.color }} className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Central main screen ───────────────────────────────────────────────────────
function MainScreen({ activePanel }) {
  const panel = PANELS.find(p => p.id === activePanel);

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#030508] overflow-hidden flex flex-col"
      style={{
        boxShadow: panel ? `0 0 60px ${panel.color}10, inset 0 0 40px rgba(0,0,0,0.5)` : 'inset 0 0 40px rgba(0,0,0,0.5)',
        minHeight: 380,
      }}>
      {/* Screen bezel top */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#0d1f1a] bg-[#030508]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#00d4aa]/40" />
        </div>
        <p className="flex-1 text-center text-[9px] font-mono text-[#334155] uppercase tracking-widest">
          {panel ? `// ${panel.label.toUpperCase()} STATION ACTIVE` : '// SELECT A STATION'}
        </p>
        <div className="text-[8px] font-mono text-[#1e293b]">IINT-MC</div>
      </div>

      {/* Screen content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {panel ? (
            <motion.div key={panel.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-5 max-w-xs"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: `${panel.color}15`, border: `1px solid ${panel.color}35`, boxShadow: `0 0 30px ${panel.color}20` }}>
                {React.createElement(panel.icon, { size: 28, style: { color: panel.color } })}
              </div>
              <div>
                <h2 className="text-xl font-black" style={{ color: panel.color }}>{panel.label}</h2>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{panel.description}</p>
              </div>
              <p className="text-[10px] font-mono text-[#334155]">
                {panel.tools.length} tools loaded · Click any tool to launch
              </p>
              {/* Tool count indicators */}
              <div className="flex justify-center gap-1.5">
                {panel.tools.map((_, i) => (
                  <div key={i} className="w-6 h-1 rounded-full" style={{ background: `${panel.color}50` }} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <div className="relative">
                <Monitor size={48} className="text-[#1e293b] mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-mono text-[#334155]">AWAITING STATION SELECTION</p>
              <p className="text-[10px] text-[#1e293b] font-mono">Select a control panel →</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screen bottom bar */}
      <div className="px-4 py-2 border-t border-[#0d1f1a] flex items-center justify-between">
        <p className="text-[8px] font-mono text-[#1e293b]">RESOLUTION: 4K · MODE: DIRECTOR</p>
        <p className="text-[8px] font-mono text-[#1e293b]">IINT MISSION CONTROL © 2025</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MissionControl() {
  const [activePanel, setActivePanel] = useState(null);

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9] relative overflow-hidden">
      <Scanlines />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(0,212,170,0.04) 0%, transparent 60%)' }} />

      {/* Grid lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col h-screen">
        <ScreenHeader />

        <div className="flex-1 overflow-hidden p-5 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-5">

          {/* Left panels — Scene & Characters */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            <p className="text-[8px] font-mono text-[#334155] uppercase tracking-[0.3em] px-1">◄ LEFT BANK</p>
            {PANELS.slice(0, 2).map(panel => (
              <ControlPanel
                key={panel.id}
                panel={panel}
                isActive={activePanel === panel.id}
                onClick={() => setActivePanel(prev => prev === panel.id ? null : panel.id)}
              />
            ))}
          </div>

          {/* Center — Main screen */}
          <div className="flex flex-col gap-4">
            <p className="text-[8px] font-mono text-[#334155] uppercase tracking-[0.3em] px-1 text-center">◄ MAIN DISPLAY ►</p>
            <MainScreen activePanel={activePanel} />

            {/* Bottom quick-nav strip */}
            <div className="grid grid-cols-4 gap-2">
              {PANELS.map(p => {
                const PIcon = p.icon;
                return (
                  <button key={p.id} onClick={() => setActivePanel(prev => prev === p.id ? null : p.id)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all"
                    style={{
                      borderColor: activePanel === p.id ? `${p.color}60` : '#1e293b',
                      background: activePanel === p.id ? `${p.color}10` : '#070b14',
                    }}>
                    <PIcon size={14} style={{ color: activePanel === p.id ? p.color : '#475569' }} />
                    <span className="text-[8px] font-mono text-center leading-tight"
                      style={{ color: activePanel === p.id ? p.color : '#334155' }}>
                      {p.label.split(' ')[0].toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panels — Voices & Audio */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            <p className="text-[8px] font-mono text-[#334155] uppercase tracking-[0.3em] px-1 text-right">RIGHT BANK ►</p>
            {PANELS.slice(2, 4).map(panel => (
              <ControlPanel
                key={panel.id}
                panel={panel}
                isActive={activePanel === panel.id}
                onClick={() => setActivePanel(prev => prev === panel.id ? null : panel.id)}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}