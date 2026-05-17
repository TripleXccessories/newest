import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, LayoutGrid, Layers, Star, Mic } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

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

const ANCHOR_IDS = ['G-F-001', 'O-M-008', 'CT-H-018'];

// ── Single faculty spotlight card (used in both views) ──────────────────────
function FacultySpotlight({ persona, onSelect }) {
  const color = ARCHETYPE_COLORS[persona.archetype] || persona.primary_color || '#00d4aa';
  return (
    <motion.div
      onClick={() => onSelect(persona)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer rounded-2xl border overflow-hidden relative group"
      style={{
        borderColor: `${color}40`,
        background: `linear-gradient(155deg, ${color}14 0%, #070b14 60%)`,
        boxShadow: `0 0 30px ${color}10`,
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${color}, transparent)`, transform: 'translate(40%, -40%)' }} />

      <div className="p-5 space-y-3 relative z-10">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
            style={{ background: `${color}20`, color, border: `2px solid ${color}50` }}>
            {persona.name?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              {ANCHOR_IDS.includes(persona.code_id) && (
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,215,0,0.15)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}>
                  ★ ANCHOR
                </span>
              )}
            </div>
            <p className="text-sm font-black text-[#f1f5f9] leading-tight">{persona.name}</p>
            <p className="text-[10px] text-[#64748b]">{persona.role_title}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${color}15`, color }}>
            {persona.archetype}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#1e293b] text-[#94a3b8]">
            {persona.school}
          </span>
        </div>

        {/* Signature line */}
        {persona.signature_line && (
          <p className="text-[10px] italic text-[#64748b] line-clamp-2 border-l-2 pl-2 leading-relaxed"
            style={{ borderColor: `${color}50` }}>
            "{persona.signature_line}"
          </p>
        )}

        {/* CTA */}
        <div className="flex justify-end">
          <span className="text-[9px] font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `${color}20`, color }}>
            View Profile →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Detail modal overlay for a single faculty ────────────────────────────────
function FacultyDetail({ persona, onClose }) {
  const color = ARCHETYPE_COLORS[persona.archetype] || persona.primary_color || '#00d4aa';
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(3,5,8,0.95)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border p-6 space-y-5"
        style={{ background: '#080d16', borderColor: `${color}60`, boxShadow: `0 0 60px ${color}25` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ background: `${color}20`, color, border: `2px solid ${color}50` }}>
              {persona.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-[#f1f5f9]">{persona.name}</h2>
              <p className="text-xs text-[#64748b]">{persona.role_title}</p>
              <div className="flex gap-1.5 mt-1.5">
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${color}15`, color }}>{persona.archetype}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#1e293b] text-[#94a3b8]">{persona.school}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#1e293b] flex items-center justify-center hover:bg-[#334155] shrink-0">
            <X size={14} className="text-[#94a3b8]" />
          </button>
        </div>

        {persona.signature_line && (
          <div className="rounded-xl p-3 border-l-4" style={{ borderColor: color, background: `${color}08` }}>
            <p className="text-xs italic text-[#e2e8f0]">"{persona.signature_line}"</p>
          </div>
        )}

        {persona.environment_desc && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#475569] mb-1">Classroom — {persona.environment_name}</p>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{persona.environment_desc}</p>
          </div>
        )}

        {persona.demonstration_beat && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#475569] mb-1">Signature Move</p>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{persona.demonstration_beat}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Link to="/bot-rental"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, color: '#030508' }}
            onClick={onClose}>
            🤝 Rent This Bot
          </Link>
          <Link to="/voice-studio"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors"
            style={{ borderColor: `${color}30`, color, background: `${color}10` }}
            onClick={onClose}>
            <Mic size={11} /> Voice
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main FacultyModal ────────────────────────────────────────────────────────
export default function FacultyModal({ onClose }) {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('carousel'); // 'carousel' | 'grid'
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.BotPersona.list('name', 50)
      .then(p => setPersonas(p.filter(x => x.status !== 'retired')))
      .finally(() => setLoading(false));
  }, []);

  const prev = () => setCarouselIndex(i => (i - 1 + personas.length) % personas.length);
  const next = () => setCarouselIndex(i => (i + 1) % personas.length);

  // Show 3 cards at a time in carousel
  const visible = personas.length > 0
    ? [0, 1, 2].map(offset => personas[(carouselIndex + offset) % personas.length])
    : [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(3,5,8,0.92)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
          className="w-full max-w-3xl rounded-3xl border overflow-hidden"
          style={{ background: '#080d16', borderColor: '#1e293b', boxShadow: '0 0 80px rgba(0,212,170,0.08)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <div>
              <h2 className="text-lg font-black text-[#f1f5f9] flex items-center gap-2">
                <Star size={16} className="text-[#ffd700]" fill="#ffd700" /> Meet the Faculty
              </h2>
              <p className="text-[10px] text-[#475569] mt-0.5">{personas.length} characters · IINT Academy</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex gap-1 p-1 rounded-xl bg-[#111827] border border-[#1e293b]">
                <button onClick={() => setView('carousel')}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: view === 'carousel' ? '#00d4aa20' : 'transparent', color: view === 'carousel' ? '#00d4aa' : '#475569' }}>
                  <Layers size={13} />
                </button>
                <button onClick={() => setView('grid')}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: view === 'grid' ? '#00d4aa20' : 'transparent', color: view === 'grid' ? '#00d4aa' : '#475569' }}>
                  <LayoutGrid size={13} />
                </button>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]">
                <X size={14} className="text-[#94a3b8]" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5" style={{ minHeight: 340 }}>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {view === 'carousel' ? (
                  <motion.div key="carousel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Carousel */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {visible.map((persona, i) => (
                        <motion.div key={`${persona.id}-${i}`}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}>
                          <FacultySpotlight persona={persona} onSelect={setSelected} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Nav */}
                    <div className="flex items-center justify-center gap-4 mt-5">
                      <button onClick={prev}
                        className="w-9 h-9 rounded-xl bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center transition-colors">
                        <ChevronLeft size={16} className="text-[#94a3b8]" />
                      </button>
                      <div className="flex gap-1.5">
                        {personas.map((_, i) => (
                          <button key={i} onClick={() => setCarouselIndex(i)}
                            className="rounded-full transition-all"
                            style={{
                              width: i === carouselIndex ? 16 : 6,
                              height: 6,
                              background: i === carouselIndex ? '#00d4aa' : '#1e293b',
                            }} />
                        ))}
                      </div>
                      <button onClick={next}
                        className="w-9 h-9 rounded-xl bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center transition-colors">
                        <ChevronRight size={16} className="text-[#94a3b8]" />
                      </button>
                    </div>
                    <p className="text-center text-[9px] text-[#334155] mt-2">{carouselIndex + 1} – {Math.min(carouselIndex + 3, personas.length)} of {personas.length}</p>
                  </motion.div>
                ) : (
                  <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                    {personas.map((persona, i) => (
                      <motion.div key={persona.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}>
                        <FacultySpotlight persona={persona} onSelect={setSelected} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Detail overlay */}
      <AnimatePresence>
        {selected && <FacultyDetail persona={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}