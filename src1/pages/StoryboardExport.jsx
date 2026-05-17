import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, FileText, Image, ChevronLeft, ChevronRight, Printer, Layers, User, Music } from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────────
const ARCHETYPE_COLORS = { Guide:'#f59e0b', Oracle:'#7c3aed', Catalyst:'#2dd4bf', Creator:'#f97316', Guardian:'#4ade80', Challenger:'#fb7185' };
function fmt(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

// ── StoryboardCard ─────────────────────────────────────────────────────────────
function StoryboardCard({ frame, index, personas, clips }) {
  const persona = personas.find(p => p.id === frame.persona_id);
  const clip = clips.find(c => c.id === frame.clip_id);
  const color = persona ? (ARCHETYPE_COLORS[persona.archetype] || '#64748b') : '#64748b';
  const bgColor = persona?.primary_color || '#1e293b';

  return (
    <div className="rounded-2xl border overflow-hidden bg-[#0a0f1e] flex flex-col"
      style={{ borderColor: `${color}40` }}>
      {/* Frame header */}
      <div className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: `${color}30`, background: `${color}10` }}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-[#475569]">FRAME</span>
          <span className="text-xs font-black" style={{ color }}>{String(index + 1).padStart(2, '0')}</span>
        </div>
        <span className="text-[9px] font-mono text-[#475569]">{fmt(frame.start_sec)} → {fmt(frame.start_sec + frame.duration_sec)}</span>
      </div>

      {/* Visual panel */}
      <div className="relative aspect-video flex items-center justify-center overflow-hidden"
        style={{ background: frame.render_url ? 'transparent' : `linear-gradient(135deg, ${bgColor}30, #050911)` }}>
        {frame.render_url ? (
          <img src={frame.render_url} alt={persona?.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ background: `${color}20`, color }}>
              {persona?.name?.charAt(0) || '?'}
            </div>
            <span className="text-[9px] text-[#475569]">No render</span>
          </div>
        )}
        {/* Transition badge */}
        {frame.transition && frame.transition !== 'cut' && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/60 text-[#94a3b8]">
            {frame.transition}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2 flex-1">
        {/* Character */}
        {persona && (
          <div className="flex items-center gap-2">
            <User size={9} style={{ color }} />
            <div>
              <p className="text-[10px] font-bold" style={{ color }}>{persona.name}</p>
              <p className="text-[8px] text-[#475569]">{persona.archetype} · {persona.school}</p>
            </div>
          </div>
        )}

        {/* Environment */}
        {frame.env_name && (
          <div className="flex items-center gap-2">
            <Layers size={9} className="text-[#f59e0b]" />
            <p className="text-[9px] text-[#94a3b8] truncate">{frame.env_name}</p>
          </div>
        )}

        {/* Audio */}
        {clip && (
          <div className="flex items-center gap-2">
            <Music size={9} className="text-[#a78bfa]" />
            <p className="text-[9px] text-[#94a3b8] truncate">{clip.title}</p>
          </div>
        )}

        {/* Signature / dialogue */}
        {persona?.signature_line && (
          <div className="border-l-2 pl-2 mt-1" style={{ borderColor: `${color}50` }}>
            <p className="text-[8px] italic text-[#475569] line-clamp-2">"{persona.signature_line}"</p>
          </div>
        )}

        {/* Notes */}
        {frame.notes && (
          <p className="text-[8px] text-[#334155] bg-[#1e293b] rounded px-2 py-1">{frame.notes}</p>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function StoryboardExport() {
  const [personas, setPersonas] = useState([]);
  const [clips, setClips] = useState([]);
  const [frames, setFrames] = useState([]);
  const [title, setTitle] = useState('IINT Faculty Reveal Sequence');
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid | flipbook
  const [printing, setPrinting] = useState(false);
  const framesPerPage = 6;
  const printRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.entities.BotPersona.list('name', 50),
      base44.entities.AudioClip.list('-created_date', 50),
    ]).then(([p, c]) => {
      setPersonas(p);
      setClips(c);
      // Auto-seed frames from all personas as a demo storyboard
      const seeded = p.slice(0, 18).map((persona, i) => ({
        id: `frame_${i}`,
        persona_id: persona.id,
        start_sec: i * 35,
        duration_sec: 35,
        transition: persona.transition_style || 'cut',
        env_name: persona.environment_name || '',
        notes: persona.presence_beat?.slice(0, 80) || '',
        render_url: null,
        type: 'character',
      }));
      setFrames(seeded);
    });
  }, []);

  const totalPages = Math.ceil(frames.length / framesPerPage);
  const pageFrames = frames.slice(currentPage * framesPerPage, (currentPage + 1) * framesPerPage);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 300);
  };

  const exportJSON = () => {
    const data = {
      title,
      exported_at: new Date().toISOString(),
      total_frames: frames.length,
      total_duration_sec: frames.reduce((s, f) => s + f.duration_sec, 0),
      frames: frames.map(f => {
        const persona = personas.find(p => p.id === f.persona_id);
        const clip = clips.find(c => c.id === f.clip_id);
        return {
          ...f,
          persona_name: persona?.name,
          persona_archetype: persona?.archetype,
          persona_school: persona?.school,
          signature_line: persona?.signature_line,
          reveal_desc: persona?.reveal_desc,
          environment_desc: persona?.environment_desc,
          clip_title: clip?.title,
        };
      }),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `storyboard_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const rows = [['Frame', 'Character', 'Archetype', 'School', 'Start', 'Duration', 'Environment', 'Transition', 'Signature Line', 'Notes']];
    frames.forEach((f, i) => {
      const persona = personas.find(p => p.id === f.persona_id);
      rows.push([
        i + 1, persona?.name || '', persona?.archetype || '', persona?.school || '',
        fmt(f.start_sec), f.duration_sec + 's', f.env_name || '',
        f.transition || 'cut',
        (persona?.signature_line || '').replace(/"/g, "'"),
        (f.notes || '').replace(/"/g, "'"),
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `storyboard_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050911] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14] px-6 py-4 flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="text-lg font-black">Storyboard Export</h1>
          <p className="text-[10px] text-[#475569]">{frames.length} frames · {fmt(frames.reduce((s,f)=>s+f.duration_sec,0))} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex border border-[#1e293b] rounded-xl overflow-hidden">
            {['grid', 'flipbook'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className="px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{ background: viewMode === v ? '#00d4aa20' : 'transparent', color: viewMode === v ? '#00d4aa' : '#64748b' }}>
                {v === 'grid' ? '⊞ Grid' : '▶ Flipbook'}
              </button>
            ))}
          </div>

          <button onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]">
            <FileText size={11} /> JSON
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]">
            <Download size={11} /> CSV
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00d4aa] text-[#070b14] hover:bg-[#00d4aa]/90">
            <Printer size={11} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Title bar */}
      <div className="px-6 py-3 border-b border-[#1e293b] flex items-center gap-3 print:hidden">
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-sm font-bold text-[#f1f5f9] outline-none placeholder-[#334155]"
          placeholder="Storyboard title..." />
        <span className="text-[10px] text-[#334155]">Page {currentPage + 1} / {totalPages}</span>
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div ref={printRef} className="p-6 max-w-7xl mx-auto">
          {/* Print header */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-black text-black">{title}</h1>
            <p className="text-sm text-gray-500">Page {currentPage + 1} of {totalPages} · {frames.length} frames · Generated {new Date().toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pageFrames.map((frame, i) => (
              <motion.div key={frame.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <StoryboardCard
                  frame={frame}
                  index={currentPage * framesPerPage + i}
                  personas={personas}
                  clips={clips}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-8 print:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs text-[#64748b] hover:bg-[#1e293b] disabled:opacity-40">
              <ChevronLeft size={12} /> Prev
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i)}
                  className="w-6 h-6 rounded-lg text-[9px] font-bold transition-colors"
                  style={{ background: currentPage === i ? '#00d4aa20' : '#1e293b', color: currentPage === i ? '#00d4aa' : '#475569' }}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs text-[#64748b] hover:bg-[#1e293b] disabled:opacity-40">
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ── FLIPBOOK VIEW ── */}
      {viewMode === 'flipbook' && (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-6">
          <AnimatePresence mode="wait">
            {frames[currentPage] && (
              <motion.div key={currentPage} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="w-full max-w-xl">
                <StoryboardCard
                  frame={frames[currentPage]}
                  index={currentPage}
                  personas={personas}
                  clips={clips}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full dialogue in flipbook mode */}
          {frames[currentPage] && (() => {
            const persona = personas.find(p => p.id === frames[currentPage].persona_id);
            if (!persona) return null;
            const color = ARCHETYPE_COLORS[persona.archetype] || '#64748b';
            return (
              <div className="w-full max-w-xl rounded-2xl border p-4 space-y-3" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                {persona.presence_beat && <div><p className="text-[8px] uppercase tracking-widest text-[#475569] mb-1">Presence Beat</p><p className="text-xs text-[#94a3b8]">{persona.presence_beat}</p></div>}
                {persona.reveal_desc && <div><p className="text-[8px] uppercase tracking-widest text-[#475569] mb-1">Reveal</p><p className="text-xs text-[#94a3b8]">{persona.reveal_desc}</p></div>}
                {persona.signature_line && <div className="border-l-2 pl-3" style={{ borderColor: color }}><p className="text-sm italic font-semibold" style={{ color }}>"{persona.signature_line}"</p></div>}
              </div>
            );
          })()}

          {/* Flipbook nav */}
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
              className="w-10 h-10 rounded-full border border-[#1e293b] flex items-center justify-center hover:bg-[#1e293b] disabled:opacity-30">
              <ChevronLeft size={16} className="text-[#94a3b8]" />
            </button>
            <span className="text-sm font-bold text-[#f1f5f9]">{currentPage + 1} <span className="text-[#334155]">/ {frames.length}</span></span>
            <button onClick={() => setCurrentPage(p => Math.min(frames.length - 1, p + 1))} disabled={currentPage === frames.length - 1}
              className="w-10 h-10 rounded-full border border-[#1e293b] flex items-center justify-center hover:bg-[#1e293b] disabled:opacity-30">
              <ChevronRight size={16} className="text-[#94a3b8]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}