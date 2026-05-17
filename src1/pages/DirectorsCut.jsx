import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Music, Sliders, Cpu, Clapperboard, Sparkles, ArrowRight, Layers, Zap, Video, Shield, Mic, GraduationCap, Lock, Target, BarChart2, Eye } from 'lucide-react';

const TOOLS = [
  {
    id: 'scene-studio',
    label: 'Scene Studio',
    sublabel: 'Script · Sequence · Dispatch',
    icon: Clapperboard,
    color: '#00d4aa',
    path: '/scene-studio',
    desc: 'Build cinematic scenes with the full sequencer, 8-track beat machine, FX rack, AI script assistant, and dispatch pipeline.',
    badge: 'CORE',
  },
  {
    id: 'voice-studio',
    label: 'Voice Studio',
    sublabel: 'ElevenLabs · Clone · Approve · Lock · Language',
    icon: Mic,
    color: '#a78bfa',
    path: '/voice-studio',
    desc: 'Upload voice samples, run the approval workflow, assign locked voice IDs per character, enable dynamic language switching, and apply voice changer effects.',
    badge: 'VOICE',
  },
  {
    id: 'graduation',
    label: 'Graduation Ceremony',
    sublabel: 'Cinematic · Trophies · University Unlock',
    icon: GraduationCap,
    color: '#f59e0b',
    path: '/graduation',
    desc: 'Trigger the full cinematic graduation sequence — badge reveals, trophy room unveil, narrative tone shift from High School to University curriculum.',
    badge: 'CINEMATIC',
  },
  {
    id: 'character-lock',
    label: 'Character Lock Studio',
    sublabel: 'Personality · Azure Voice · Lock',
    icon: Lock,
    color: '#f43f5e',
    path: '/character-lock',
    desc: 'Lock personality traits per character and assign Azure Neural TTS voices. Preview voices before locking. Admin-only.',
    badge: 'LOCK',
  },
  {
    id: 'lesson-generator',
    label: 'AI Lesson Generator',
    sublabel: 'Script · Quiz · Animated Moments · Memory',
    icon: Sparkles,
    color: '#fbbf24',
    path: '/lesson-generator',
    desc: 'Generate full lesson scripts by title. Character voice, school-level tone, storyline threads, quiz questions, concept art prompts — all in one.',
    badge: 'NEW',
  },
  {
    id: 'storyboard',
    label: 'Storyboard Export',
    sublabel: 'Grid · Flipbook · Print / PDF · CSV',
    icon: Film,
    color: '#60a5fa',
    path: '/storyboard',
    desc: 'Convert sequenced scenes into a multi-page storyboard. Grid and flipbook views with character snapshot, environment, dialogue and transition per frame. Print to PDF or export CSV/JSON.',
    badge: 'EXPORT',
  },
  {
    id: 'render-pipeline',
    label: 'Render Pipeline',
    sublabel: 'DALL-E 3 · Auto-generate · Store assets',
    icon: Sparkles,
    color: '#fbbf24',
    path: '/render-pipeline',
    desc: 'Select any characters and fire DALL-E 3 renders automatically. Generated images are stored back to the app. Batch up to 5 at a time. Requires OPENAI_API_KEY.',
    badge: 'AI RENDER',
  },
  {
    id: 'office-hours',
    label: 'Office Hours',
    sublabel: 'Chat · Voice · ElevenLabs TTS',
    icon: Mic,
    color: '#00d4aa',
    path: '/office-hours',
    desc: 'Simulated "Office Hours" chat with any of the 18 faculty. Each character responds in-persona using their knowledge domain. ElevenLabs locked voice plays the reply aloud.',
    badge: 'CHAT',
  },
  {
    id: 'character-timeline',
    label: 'Character Timeline',
    sublabel: 'Presence · Audio · Environment · Transitions',
    icon: Film,
    color: '#00d4aa',
    path: '/character-timeline',
    desc: 'Drag-and-drop timeline sequencer — arrange character presence blocks, audio clips from Voice Studio, and environment transitions across a 120-second scene.',
    badge: 'NEW',
  },
  {
    id: 'asset-dashboard',
    label: 'Asset Dashboard',
    sublabel: '3D Render · Voice · BG Image · Environment · Personality',
    icon: BarChart2,
    color: '#fb7185',
    path: '/asset-dashboard',
    desc: 'Production-readiness tracker for all 18 faculty. Click flags to cycle: Pending → WIP → Done. At-a-glance readiness percentage per character.',
    badge: 'TRACKING',
  },
  {
    id: 'prompt-playground',
    label: 'Prompt Playground',
    sublabel: 'Camera · Lighting · Render Style · Bulk Export',
    icon: Sparkles,
    color: '#a78bfa',
    path: '/prompt-playground',
    desc: 'Dynamically combine character traits, environment descriptors, camera styles, and render quality to auto-generate AI art prompts. Generate all 18 at once and download as .txt.',
    badge: 'AI PROMPTS',
  },
  {
    id: 'character-profiles',
    label: 'Character Profiles',
    sublabel: '18 Faculty · 3D Render Briefs · Voice Direction · BG Prompts',
    icon: Sparkles,
    color: '#ffd700',
    path: '/character-profiles',
    desc: 'Full dossier for all 18 faculty — anchor trio highlighted, 3D render brief, rental room background image prompt, and voice direction notes per character.',
    badge: 'PROFILES',
  },
  {
    id: 'robot-demo',
    label: 'Character Lab',
    sublabel: 'Robot · LightbulbGuy · Previews',
    icon: Cpu,
    color: '#60a5fa',
    path: '/robot-demo',
    desc: 'Preview and test all character animations, expressions, glove poses, and creation sequences before locking into a scene.',
    badge: 'PREVIEW',
  },
  {
    id: 'stereo',
    label: 'Stereo / Audio Suite',
    sublabel: 'Music · Beats · Easter Eggs',
    icon: Music,
    color: '#a78bfa',
    path: '/stereo',
    desc: 'Manage the audio environment: background music, beat loops, the Easter Egg Theatre, and character sound triggers.',
    badge: 'AUDIO',
  },
  {
    id: 'academy-command',
    label: 'Academy Command',
    sublabel: 'Faculty · Quests · Lectures · Analytics',
    icon: GraduationCap,
    color: '#00d4aa',
    path: '/academy-command',
    desc: 'Centralized academy operations dashboard — all 18 faculty status cards, active quest tracker, lecture topic feed, archetype/school charts.',
    badge: 'ACADEMY',
  },
  {
    id: 'character-design-lab',
    label: 'Character Design Lab',
    sublabel: 'LightbulbGuy · Robot · Colors · Moods · Poses · Export',
    icon: Sparkles,
    color: '#fbbf24',
    path: '/character-design-lab',
    desc: 'Live preview panel for both characters. Customize bulb color, mood, glove poses, hat types, and robot glow/chest states. Copy React code or download JSON config.',
    badge: 'DESIGN',
  },
  {
    id: 'imaginarium',
    label: 'Imaginarium',
    sublabel: 'Holographic Summon · Academic Guard · Strike System',
    icon: Sparkles,
    color: '#00d4aa',
    path: '/imaginarium',
    desc: 'The sacred academic conversation space. Door cinematic entry, holographic faculty summon, 3-strike off-topic enforcement, voice recognition, and cosmic ambient environment.',
    badge: 'NEW',
  },
  {
    id: 'admin-preview',
    label: 'Admin Preview Control',
    sublabel: 'View Mode · Skip Intro · Section PIN',
    icon: Shield,
    color: '#ef4444',
    path: '/admin-preview',
    desc: 'Switch between Admin, New User, Existing User, Beta, and Graduated preview modes. Toggle intro video bypass. PIN-protect sections for hired admins.',
    badge: 'ADMIN',
  },
  {
    id: 'scope-testing',
    label: 'Scope Testing',
    sublabel: 'Tester Findings · Device Coverage · Admin Review',
    icon: Target,
    color: '#00d4aa',
    path: '/scope-testing',
    desc: 'Manage active test scopes, review tester findings across all devices/browsers, mark fixes complete, and auto-seed new scopes from reported issues.',
    badge: 'QA',
  },
];

const COMING_SOON = [
  { label: 'Render Pipeline', icon: Video, color: '#fbbf24', desc: 'Export scenes to MP4, GIF, and PNG for social and press.' },
  { label: 'Character Designer', icon: Layers, color: '#f87171', desc: 'Visual editor for character skins, hat types, and aura colors.' },
  { label: 'Motion Capture Import', icon: Zap, color: '#34d399', desc: 'Import mocap data to drive robot and lightbulb animations.' },
];

export default function DirectorsCut() {
  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9] relative overflow-hidden">

      {/* Cinematic background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Top spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.10) 0%, transparent 70%)' }} />

      <div className="relative max-w-4xl mx-auto px-6 py-14 space-y-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-4"
        >
          {/* Clapperboard icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-[#00d4aa]/30 bg-[#00d4aa]/08 mb-2">
            <Clapperboard size={30} className="text-[#00d4aa]" />
          </div>

          <div>
            <p className="text-[11px] font-mono tracking-[0.35em] text-[#00d4aa] uppercase mb-2">
              Admin · Production Suite
            </p>
            <h1 className="text-4xl font-black tracking-tight text-[#f1f5f9]">
              The Director's Cut
            </h1>
            <p className="mt-3 text-[#64748b] text-sm max-w-lg mx-auto leading-relaxed">
              Every cinematic tool, animation pipeline, and scene creation workflow — in one place.
              Only visible to the production team.
            </p>
          </div>

          {/* Film strip decoration */}
          <div className="flex items-center justify-center gap-1 pt-2 opacity-20">
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="w-4 h-6 rounded-sm border border-[#f1f5f9] flex flex-col justify-between p-[2px]">
                <div className="w-1 h-1 rounded-full bg-[#f1f5f9]" />
                <div className="w-1 h-1 rounded-full bg-[#f1f5f9]" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Tools */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={11} className="text-[#00d4aa]" /> Live Production Tools
          </p>
          <div className="space-y-3">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link to={tool.path}
                    className="group flex items-center gap-5 p-5 rounded-2xl border transition-all hover:scale-[1.01]"
                    style={{ borderColor: `${tool.color}25`, background: `${tool.color}06` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}30` }}>
                      <Icon size={22} style={{ color: tool.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-black" style={{ color: tool.color }}>{tool.label}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest"
                          style={{ background: `${tool.color}20`, color: tool.color }}>
                          {tool.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#475569] font-mono mb-1">{tool.sublabel}</p>
                      <p className="text-xs text-[#64748b] leading-relaxed">{tool.desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-[#334155] group-hover:text-[#f1f5f9] group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[#334155] uppercase tracking-widest">
            🎬 In Post-Production
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COMING_SOON.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                  className="p-4 rounded-xl border border-[#1e293b] bg-[#070b14] space-y-2 opacity-60"
                >
                  <Icon size={18} style={{ color: item.color }} />
                  <p className="text-xs font-bold text-[#94a3b8]">{item.label}</p>
                  <p className="text-[10px] text-[#334155] leading-relaxed">{item.desc}</p>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1e293b] text-[#475569] font-bold">COMING SOON</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sovereign Log */}
        <div className="border border-[#ef4444]/20 rounded-2xl p-5 bg-[#ef4444]/04 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#ef4444]/15 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-[#ef4444]" />
            </div>
            <div>
              <p className="text-sm font-black text-[#ef4444]">Sovereign Log</p>
              <p className="text-[11px] text-[#475569]">Immutable audit trail of all destructive and privileged actions. Cannot be cleared by any admin.</p>
            </div>
          </div>
          <Link to="/sovereign-log"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors shrink-0">
            View Log <ArrowRight size={12} />
          </Link>
        </div>

        {/* Back to dashboard */}
        <div className="text-center pt-4">
          <Link to="/"
            className="text-[11px] text-[#334155] hover:text-[#00d4aa] transition-colors font-mono">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}