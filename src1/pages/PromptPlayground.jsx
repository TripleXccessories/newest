import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Sparkles, RefreshCw, CheckCheck, ChevronDown, Wand2, Download } from 'lucide-react';

// ── Camera styles ─────────────────────────────────────────────────────────────
const CAMERA_STYLES = [
  { id: 'cinematic_wide', label: 'Cinematic Wide', desc: 'Ultra-wide establishing shot, anamorphic lens bokeh' },
  { id: 'dutch_angle',    label: 'Dutch Angle',    desc: 'Tilted frame, psychological tension, 25° cant' },
  { id: 'low_angle',      label: 'Low Angle',      desc: 'Heroic upshot, subject towers, wide-angle distortion' },
  { id: 'over_shoulder',  label: 'Over Shoulder',  desc: 'POV engagement, subject addressing camera directly' },
  { id: 'birds_eye',      label: "Bird's Eye",     desc: 'Top-down overhead, god perspective, full environment' },
  { id: 'macro_close',    label: 'Macro Close-Up', desc: 'Extreme close, texture detail, shallow DOF' },
  { id: 'tracking_shot',  label: 'Dynamic Track',  desc: 'Motion blur, subject mid-action, energy trail' },
  { id: 'portrait',       label: 'Dramatic Portrait', desc: 'Half-body reveal, Rembrandt lighting, neutral BG' },
];

// ── Lighting presets ──────────────────────────────────────────────────────────
const LIGHTING = [
  { id: 'volumetric',   label: 'Volumetric',   desc: 'God rays, atmospheric fog, diffused light shafts' },
  { id: 'neon_noir',    label: 'Neon Noir',    desc: 'Hard shadows, colored neon accents, urban grit' },
  { id: 'golden_hour',  label: 'Golden Hour',  desc: 'Warm amber backlighting, lens flare, sunset rim' },
  { id: 'bioluminescent', label: 'Bioluminescent', desc: 'Self-emitting glow, dark environment, ethereal' },
  { id: 'studio_key',   label: 'Studio Key',   desc: 'Three-point lighting, clean white cyc, neutral' },
  { id: 'subsurface',   label: 'Subsurface',   desc: 'Translucent skin/material glow, deep saturation' },
  { id: 'starfield',    label: 'Starfield BG', desc: 'Cosmic backdrop, nebula colors, zero-gravity mood' },
];

// ── Render styles ─────────────────────────────────────────────────────────────
const RENDER_STYLES = [
  { id: '8k_hyperreal',  label: '8K Hyperreal',    desc: 'Photorealistic, 8K render, ray-tracing, Unreal Engine 5' },
  { id: 'concept_art',   label: 'Concept Art',     desc: 'Cinematic concept painting, dramatic brushwork, ArtStation' },
  { id: 'anime_cinematic', label: 'Anime Cinematic', desc: 'Studio Ghibli meets cyberpunk, cel-shaded, saturated' },
  { id: 'stylized_3d',   label: 'Stylized 3D',     desc: 'Semi-stylized render, expressive forms, Pixar-adjacent' },
  { id: 'digital_oil',   label: 'Digital Oil',     desc: 'Painted textures, visible brushstrokes, classical + digital' },
  { id: 'holographic',   label: 'Holographic',     desc: 'Glitched edges, scan lines, RGB chromatic offset, digital ghost' },
];

// ── Trait modifiers ───────────────────────────────────────────────────────────
const TRAIT_MODS = [
  'battle-worn', 'radiant', 'ethereal', 'stoic', 'fierce', 'serene', 
  'ancient', 'quantum', 'mechanical', 'organic', 'primordial', 'transcendent',
  'commanding', 'mysterious', 'luminous', 'scarred', 'pristine',
];

function buildPrompt({ persona, camera, lighting, renderStyle, extraTraits, includeEnv, customSuffix }) {
  if (!persona) return '';
  const cam = CAMERA_STYLES.find(c => c.id === camera);
  const lit = LIGHTING.find(l => l.id === lighting);
  const rdr = RENDER_STYLES.find(r => r.id === renderStyle);

  const parts = [];

  // Subject
  parts.push(`${persona.name}, ${persona.role_title}`);

  // Physical description
  if (persona.reveal_desc) parts.push(persona.reveal_desc.slice(0, 200));

  // Extra trait mods
  if (extraTraits.length) parts.push(`character mood: ${extraTraits.join(', ')}`);

  // Environment
  if (includeEnv && persona.environment_desc) {
    parts.push(`Environment: ${persona.environment_name} — ${persona.environment_desc.slice(0, 180)}`);
  }

  // Art direction
  if (persona.art_direction) parts.push(`Art direction: ${persona.art_direction.slice(0, 120)}`);

  // Color palette
  parts.push(`Color palette: primary ${persona.primary_color}, secondary ${persona.secondary_color || '#1e293b'}`);

  // Camera
  if (cam) parts.push(`Camera: ${cam.label} — ${cam.desc}`);

  // Lighting
  if (lit) parts.push(`Lighting: ${lit.label} — ${lit.desc}`);

  // Render style
  if (rdr) parts.push(`Style: ${rdr.label} — ${rdr.desc}`);

  // Quality suffix
  parts.push('highly detailed, professional production quality, sharp focus, masterpiece');

  if (customSuffix) parts.push(customSuffix);

  return parts.join('. ');
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold"
      style={{ background: copied ? '#00d4aa20' : '#1e293b', color: copied ? '#00d4aa' : '#64748b' }}>
      {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function MultiSelectChip({ value, options, onChange, color }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => {
        const active = value.includes(o);
        return (
          <button key={o} onClick={() => onChange(active ? value.filter(v => v !== o) : [...value, o])}
            className="text-[9px] px-2 py-1 rounded-full font-semibold transition-all"
            style={{
              background: active ? `${color}20` : '#1e293b',
              color: active ? color : '#475569',
              border: `1px solid ${active ? `${color}50` : 'transparent'}`,
            }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <div>
      <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className="flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl border text-left transition-all"
            style={{
              background: value === o.id ? '#00d4aa12' : '#0a0f1e',
              borderColor: value === o.id ? '#00d4aa50' : '#1e293b',
              minWidth: 120, maxWidth: 180,
            }}>
            <span className="text-[10px] font-bold" style={{ color: value === o.id ? '#00d4aa' : '#94a3b8' }}>{o.label}</span>
            <span className="text-[8px] text-[#475569] leading-tight">{o.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PromptPlayground() {
  const [personas, setPersonas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [camera, setCamera] = useState('cinematic_wide');
  const [lighting, setLighting] = useState('volumetric');
  const [renderStyle, setRenderStyle] = useState('8k_hyperreal');
  const [extraTraits, setExtraTraits] = useState([]);
  const [includeEnv, setIncludeEnv] = useState(true);
  const [customSuffix, setCustomSuffix] = useState('');
  const [bulkResults, setBulkResults] = useState([]);
  const [showBulk, setShowBulk] = useState(false);
  const [generatingBulk, setGeneratingBulk] = useState(false);

  useEffect(() => {
    base44.entities.BotPersona.list('name', 50).then(setPersonas);
  }, []);

  const currentPersona = personas.find(p => p.id === selected);
  const prompt = buildPrompt({ persona: currentPersona, camera, lighting, renderStyle, extraTraits, includeEnv, customSuffix });

  const archetypeColor = { Guide:'#f59e0b', Oracle:'#7c3aed', Catalyst:'#2dd4bf', Creator:'#f97316', Guardian:'#4ade80', Challenger:'#fb7185' };
  const pColor = archetypeColor[currentPersona?.archetype] || '#64748b';

  const generateBulk = () => {
    setGeneratingBulk(true);
    const results = personas.map(p => ({
      persona: p,
      prompt: buildPrompt({ persona: p, camera, lighting, renderStyle, extraTraits, includeEnv, customSuffix }),
    }));
    setBulkResults(results);
    setShowBulk(true);
    setGeneratingBulk(false);
  };

  const downloadBulk = () => {
    const text = bulkResults.map(r => `=== ${r.persona.name} (${r.persona.archetype}) ===\n${r.prompt}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'iint_prompts.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#f1f5f9] flex items-center gap-2">
            <Wand2 size={22} className="text-[#a78bfa]" /> Prompt Playground
          </h1>
          <p className="text-xs text-[#475569]">Combine character traits, environments & cinematic styles → generate AI art prompts for all 18 characters</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateBulk} disabled={generatingBulk}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa40' }}>
            {generatingBulk ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Generate All 18
          </button>
          {bulkResults.length > 0 && (
            <button onClick={downloadBulk}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#00d4aa20', color: '#00d4aa', border: '1px solid #00d4aa40' }}>
              <Download size={12} /> Download .txt
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Left — Character selector */}
        <div className="space-y-3">
          <p className="text-[9px] text-[#475569] uppercase tracking-widest font-bold">Select Character</p>
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {personas.map(p => {
              const c = archetypeColor[p.archetype] || '#64748b';
              return (
                <button key={p.id} onClick={() => setSelected(p.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                  style={{
                    background: selected === p.id ? `${c}15` : '#0a0f1e',
                    borderColor: selected === p.id ? `${c}50` : '#1e293b',
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0"
                    style={{ background: `${c}20`, color: c }}>
                    {p.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#f1f5f9] truncate">{p.name}</p>
                    <p className="text-[9px] truncate" style={{ color: c }}>{p.archetype} · {p.school}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Controls + Output */}
        <div className="space-y-5">
          {/* Camera */}
          <SelectRow label="Camera Style" value={camera} options={CAMERA_STYLES} onChange={setCamera} />

          {/* Lighting */}
          <SelectRow label="Lighting" value={lighting} options={LIGHTING} onChange={setLighting} />

          {/* Render style */}
          <SelectRow label="Render Style" value={renderStyle} options={RENDER_STYLES} onChange={setRenderStyle} />

          {/* Trait modifiers */}
          <div>
            <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1.5">Character Mood Modifiers</p>
            <MultiSelectChip value={extraTraits} options={TRAIT_MODS} onChange={setExtraTraits} color="#fb7185" />
          </div>

          {/* Include environment toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => setIncludeEnv(v => !v)}
              className="w-8 h-4 rounded-full transition-all relative"
              style={{ background: includeEnv ? '#00d4aa' : '#1e293b' }}>
              <div className="absolute top-0.5 rounded-full w-3 h-3 bg-white transition-all"
                style={{ left: includeEnv ? '50%' : 2 }} />
            </button>
            <span className="text-xs text-[#94a3b8]">Include environment description</span>
          </div>

          {/* Custom suffix */}
          <div>
            <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1.5">Custom Suffix</p>
            <input value={customSuffix} onChange={e => setCustomSuffix(e.target.value)}
              placeholder="e.g. --ar 16:9 --v 6 --style raw"
              className="w-full bg-[#0a0f1e] border border-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#334155]" />
          </div>

          {/* OUTPUT */}
          <div className="rounded-2xl border p-4 space-y-3"
            style={{ borderColor: currentPersona ? `${pColor}40` : '#1e293b', background: currentPersona ? `${pColor}06` : '#0a0f1e' }}>
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: currentPersona ? pColor : '#334155' }}>
                {currentPersona ? `✦ ${currentPersona.name} Prompt` : '← Select a character'}
              </p>
              <div className="flex gap-2">
                {prompt && <CopyButton text={prompt} />}
                {prompt && (
                  <span className="text-[8px] text-[#334155] self-center">{prompt.split(' ').length} words</span>
                )}
              </div>
            </div>
            {prompt ? (
              <p className="text-[10px] text-[#94a3b8] leading-relaxed font-mono whitespace-pre-wrap">{prompt}</p>
            ) : (
              <p className="text-[10px] text-[#334155] italic">Select a character to generate a prompt.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bulk results */}
      <AnimatePresence>
        {showBulk && bulkResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-[#f1f5f9] flex items-center gap-2">
                <Sparkles size={14} className="text-[#a78bfa]" /> All 18 Prompts Generated
              </p>
              <button onClick={() => setShowBulk(false)} className="text-[10px] text-[#475569] hover:text-[#94a3b8]">Hide</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {bulkResults.map(({ persona, prompt: p }) => {
                const c = archetypeColor[persona.archetype] || '#64748b';
                return (
                  <div key={persona.id} className="rounded-2xl border p-4 space-y-2"
                    style={{ borderColor: `${c}30`, background: `${c}06` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black" style={{ color: c }}>{persona.name}</p>
                        <p className="text-[9px] text-[#475569]">{persona.archetype} · {persona.school}</p>
                      </div>
                      <CopyButton text={p} />
                    </div>
                    <p className="text-[9px] text-[#64748b] leading-relaxed font-mono line-clamp-4">{p}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}