import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Star, Sparkles, ChevronRight, X, Volume2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

// The three anchor characters by code_id
const ANCHOR_IDS = ['G-F-001', 'O-M-008', 'CT-H-018'];

// Presentation labels
const PRESENTATION_LABEL = {
  male: '♂ Male',
  female: '♀ Female',
  'non-binary': '⟁ Hybrid / Alien',
};

// Archetype color map
const ARCHETYPE_COLORS = {
  Guide: '#f59e0b',
  Oracle: '#7c3aed',
  Catalyst: '#2dd4bf',
  Creator: '#f97316',
  Guardian: '#4ade80',
  Challenger: '#fb7185',
  Sentinel: '#ec4899',
  Architect: '#3b82f6',
};

// Background scene description for rental room card — derived from environment + personality
function getRentalRoomBg(persona) {
  const env = persona.environment_desc || '';
  const color = persona.primary_color || '#00d4aa';
  const secondary = persona.secondary_color || '#1e293b';
  return { env, color, secondary };
}

function AnchorBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
      style={{ background: 'rgba(255,215,0,0.15)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}>
      <Star size={7} fill="#ffd700" /> Anchor Character
    </span>
  );
}

function CharacterCard({ persona, isAnchor, onClick }) {
  const color = ARCHETYPE_COLORS[persona.archetype] || persona.primary_color || '#64748b';
  const pLabel = PRESENTATION_LABEL[persona.presentation] || persona.presentation || '—';

  return (
    <motion.div
      onClick={() => onClick(persona)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="cursor-pointer rounded-2xl border p-4 space-y-3 relative overflow-hidden transition-all"
      style={{
        borderColor: isAnchor ? color : '#1e293b',
        background: isAnchor ? `linear-gradient(135deg, ${color}10, #070b14 60%)` : '#0a0f1e',
        boxShadow: isAnchor ? `0 0 28px ${color}20` : 'none',
      }}
    >
      {/* Glow orb */}
      {isAnchor && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}, transparent)`, transform: 'translate(30%, -30%)' }} />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Avatar orb */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
            {persona.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black text-[#f1f5f9]">{persona.name}</p>
            <p className="text-[10px] text-[#64748b]">{persona.role_title}</p>
          </div>
        </div>
        {isAnchor && <AnchorBadge />}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: `${color}15`, color }}>
          {persona.archetype}
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-[#1e293b] text-[#94a3b8]">
          {persona.school}
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-[#1e293b] text-[#94a3b8]">
          {pLabel}
        </span>
      </div>

      {persona.signature_line && (
        <p className="text-[10px] italic text-[#64748b] line-clamp-2 border-l-2 pl-2"
          style={{ borderColor: `${color}50` }}>
          "{persona.signature_line}"
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-[9px] text-[#475569]">{persona.code_id || '—'}</span>
        </div>
        <button className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg transition-colors hover:opacity-80"
          style={{ background: `${color}15`, color }}>
          View Profile <ChevronRight size={9} />
        </button>
      </div>
    </motion.div>
  );
}

function PersonaModal({ persona, onClose }) {
  const color = ARCHETYPE_COLORS[persona.archetype] || persona.primary_color || '#64748b';
  const { env } = getRentalRoomBg(persona);

  const renderPrompt = `3D character render — "${persona.name}". ${persona.reveal_desc || ''} Art direction: ${persona.art_direction || ''}. Color palette: primary ${persona.primary_color}, secondary ${persona.secondary_color}. Environment: ${persona.environment_name}. Style: cinematic, hyper-detailed, volumetric lighting, 8K render.`;

  const bgPrompt = `Rental room viewer card background for "${persona.name}". Setting: ${persona.environment_name}. ${env} Primary color: ${persona.primary_color}. Mood: ${persona.music_motif || 'atmospheric'}. Style: digital art, panoramic, no characters, immersive environment, cinematic lighting.`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(3,5,8,0.92)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 space-y-5"
        style={{ background: '#080d16', borderColor: color, boxShadow: `0 0 60px ${color}30` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl"
              style={{ background: `${color}20`, color, border: `1px solid ${color}50` }}>
              {persona.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {ANCHOR_IDS.includes(persona.code_id) && <AnchorBadge />}
                <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-[#1e293b] text-[#94a3b8]">
                  {PRESENTATION_LABEL[persona.presentation] || persona.presentation}
                </span>
              </div>
              <h2 className="text-xl font-black text-[#f1f5f9]">{persona.name}</h2>
              <p className="text-xs text-[#64748b]">{persona.role_title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]">
            <X size={14} className="text-[#94a3b8]" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {[persona.archetype, persona.school, persona.code_id, persona.entrance_style?.replace('_', ' ')].filter(Boolean).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${color}15`, color }}>
              {t}
            </span>
          ))}
        </div>

        {/* Signature line */}
        {persona.signature_line && (
          <div className="rounded-xl p-3 border-l-4" style={{ borderColor: color, background: `${color}08` }}>
            <p className="text-xs italic text-[#e2e8f0]">"{persona.signature_line}"</p>
          </div>
        )}

        {/* Scene beats */}
        {persona.presence_beat && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#475569] mb-1">Presence Beat</p>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{persona.presence_beat}</p>
          </div>
        )}
        {persona.reveal_desc && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#475569] mb-1">Reveal Description</p>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{persona.reveal_desc}</p>
          </div>
        )}
        {persona.demonstration_beat && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#475569] mb-1">Demonstration Beat</p>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{persona.demonstration_beat}</p>
          </div>
        )}

        {/* Environment */}
        {persona.environment_desc && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#475569] mb-1">
              <Eye size={9} className="inline mr-1" />Environment — {persona.environment_name}
            </p>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{persona.environment_desc}</p>
          </div>
        )}

        {/* Music motif */}
        {persona.music_motif && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#475569] mb-1">
              <Volume2 size={9} className="inline mr-1" />Music Motif
            </p>
            <p className="text-xs text-[#94a3b8]">{persona.music_motif}</p>
          </div>
        )}

        {/* 3D Render Brief */}
        <div className="rounded-xl border border-[#7c3aed]/30 bg-[#7c3aed]/05 p-4 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#a78bfa]">
            <Sparkles size={9} className="inline mr-1" />3D Render Brief
          </p>
          <p className="text-[10px] text-[#94a3b8] leading-relaxed font-mono">{renderPrompt}</p>
        </div>

        {/* Rental Room BG Prompt */}
        <div className="rounded-xl border border-[#00d4aa]/20 bg-[#00d4aa]/05 p-4 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#00d4aa]">
            <Eye size={9} className="inline mr-1" />Rental Room Background Prompt
          </p>
          <p className="text-[10px] text-[#94a3b8] leading-relaxed font-mono">{bgPrompt}</p>
        </div>

        {/* Voice brief */}
        <div className="rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/05 p-4 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#f59e0b]">
            <Mic size={9} className="inline mr-1" />Voice Direction
          </p>
          <p className="text-[10px] text-[#94a3b8]">
            <strong className="text-[#f1f5f9]">Presentation:</strong> {PRESENTATION_LABEL[persona.presentation] || persona.presentation}
            {' · '}
            <strong className="text-[#f1f5f9]">Archetype:</strong> {persona.archetype}
            {' · '}
            <strong className="text-[#f1f5f9]">Music motif:</strong> {persona.music_motif || '—'}
          </p>
          <p className="text-[10px] text-[#94a3b8] italic">
            Use Voice Changer tab in Voice Studio to record yourself, then transform into this character's locked voice.
          </p>
          <Link to="/voice-studio"
            className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: `${color}15`, color }}>
            <Mic size={10} /> Open Voice Studio →
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CharacterProfiles() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.entities.BotPersona.list('name', 50)
      .then(setPersonas)
      .finally(() => setLoading(false));
  }, []);

  const anchors = personas.filter(p => ANCHOR_IDS.includes(p.code_id));
  const rest = personas.filter(p => !ANCHOR_IDS.includes(p.code_id));

  const filtered = filter === 'all' ? rest
    : filter === 'male' ? rest.filter(p => p.presentation === 'male')
    : filter === 'female' ? rest.filter(p => p.presentation === 'female')
    : rest.filter(p => p.presentation === 'non-binary');

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <AnimatePresence>
        {selected && <PersonaModal persona={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-black text-[#f1f5f9]">Faculty Character Profiles</h1>
        <p className="text-sm text-[#475569]">
          {personas.length} characters · 3D render briefs · rental room background prompts · voice direction
        </p>
      </motion.div>

      {/* Anchor Trio */}
      {anchors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star size={13} className="text-[#ffd700]" fill="#ffd700" />
            <p className="text-xs font-black uppercase tracking-widest text-[#ffd700]">Anchor Trio — First Three Characters</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fallback: show first 3 non-anchor personas as anchors if code_ids don't match */}
            {anchors.length > 0
              ? anchors.map(p => <CharacterCard key={p.id} persona={p} isAnchor onClick={setSelected} />)
              : personas.slice(0, 3).map(p => <CharacterCard key={p.id} persona={p} isAnchor onClick={setSelected} />)
            }
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#1e293b]" />

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'male', 'female', 'non-binary'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
            style={{
              background: filter === f ? '#00d4aa20' : '#1e293b',
              color: filter === f ? '#00d4aa' : '#64748b',
              border: filter === f ? '1px solid #00d4aa40' : '1px solid transparent',
            }}>
            {f === 'all' ? 'All' : f === 'non-binary' ? '⟁ Hybrid / Alien' : f === 'male' ? '♂ Male' : '♀ Female'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(anchors.length === 0 ? personas.slice(3) : filtered).map(p => (
            <CharacterCard key={p.id} persona={p} isAnchor={false} onClick={setSelected} />
          ))}
        </div>
      )}
    </div>
  );
}