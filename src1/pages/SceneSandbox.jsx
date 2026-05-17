import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, Trash2, Play, Loader2, GripVertical, Image, Mic, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK_CHARS = [
  'Da Feathered Sage', 'Da PrEAChEr', 'The Architect', 'The Oracle',
  'The Challenger', 'The Guardian', 'The Catalyst', 'The Strategist',
];

const EMPTY_SHOT = () => ({ id: Date.now() + Math.random(), character: '', dialogue: '', imageUrl: null, audioB64: null, status: 'idle' });

function ShotCard({ shot, index, personas, onUpdate, onRemove, onRender }) {
  const color = '#00d4aa';
  return (
    <motion.div layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: shot.status === 'done' ? '#00d4aa40' : '#1e293b', background: '#070b14' }}
    >
      {/* Shot header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e293b] bg-[#030508]">
        <GripVertical size={13} className="text-[#334155] cursor-grab" />
        <span className="text-[10px] font-mono text-[#475569]">SHOT {index + 1}</span>
        {shot.status === 'done' && <CheckCircle size={11} className="text-[#00d4aa] ml-1" />}
        {shot.status === 'rendering' && <Loader2 size={11} className="text-[#f59e0b] animate-spin ml-1" />}
        <button onClick={onRemove} className="ml-auto"><X size={12} className="text-[#334155] hover:text-[#ef4444]" /></button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_160px] gap-3">
        {/* Character select */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-mono text-[#475569] uppercase tracking-widest">Character</p>
          <select
            value={shot.character}
            onChange={e => onUpdate({ character: e.target.value })}
            className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-2 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]/50"
          >
            <option value="">— select —</option>
            {(personas.length ? personas.map(p => p.name) : FALLBACK_CHARS).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Dialogue */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-mono text-[#475569] uppercase tracking-widest">Dialogue</p>
          <textarea
            value={shot.dialogue}
            onChange={e => onUpdate({ dialogue: e.target.value })}
            rows={3}
            placeholder="What does this character say?"
            className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-2 py-1.5 text-xs text-[#f1f5f9] resize-none focus:outline-none focus:border-[#00d4aa]/50"
          />
        </div>

        {/* Preview panel */}
        <div className="space-y-2">
          {/* Visual frame */}
          <div className="rounded-lg overflow-hidden border border-[#1e293b] bg-[#030508] aspect-video flex items-center justify-center">
            {shot.imageUrl
              ? <img src={shot.imageUrl} alt="frame" className="w-full h-full object-cover" />
              : <Image size={18} className="text-[#334155]" />
            }
          </div>
          {/* Audio indicator */}
          {shot.audioB64 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/20">
              <Mic size={10} className="text-[#00d4aa]" />
              <span className="text-[9px] text-[#00d4aa] font-mono">Audio ready</span>
            </div>
          )}
          <button
            onClick={onRender}
            disabled={!shot.character || !shot.dialogue || shot.status === 'rendering'}
            className="w-full py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1"
            style={{ background: '#00d4aa15', border: '1px solid #00d4aa30', color: '#00d4aa' }}
          >
            {shot.status === 'rendering' ? <><Loader2 size={10} className="animate-spin" /> Rendering</> : <><Play size={10} /> Render Shot</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SceneSandbox() {
  const [shots, setShots] = useState([EMPTY_SHOT()]);
  const [personas, setPersonas] = useState([]);
  const [rendering, setRendering] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    base44.entities.BotPersona.list().then(setPersonas).catch(() => {});
  }, []);

  const updateShot = (id, patch) => setShots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  const removeShot = (id) => setShots(prev => prev.filter(s => s.id !== id));
  const addShot = () => setShots(prev => [...prev, EMPTY_SHOT()]);

  const renderShot = async (shot) => {
    updateShot(shot.id, { status: 'rendering' });
    try {
      const persona = personas.find(p => p.name === shot.character);

      // Generate visual frame
      const vizPrompt = persona
        ? `${persona.name} — ${persona.role_title || 'Faculty Member'}. ${persona.reveal_desc || ''} ${persona.art_direction || ''} Cinematic still, dramatic lighting, 16:9 composition.`
        : `${shot.character} — IINT Academy faculty character. Cinematic still, dramatic lighting, 16:9 composition.`;

      const [vizRes, audioRes] = await Promise.all([
        base44.functions.invoke('renderPipeline', {
          action: 'render_frame',
          prompt: vizPrompt,
          persona_name: shot.character,
          frame_id: shot.id,
        }),
        base44.functions.invoke('azureSpeech', {
          action: 'tts',
          text: shot.dialogue,
          voice: 'en-US-AriaNeural',
        }).catch(() => ({ data: null })),
      ]);

      updateShot(shot.id, {
        imageUrl: vizRes.data?.image_url || null,
        audioB64: audioRes.data?.audio_base64 || null,
        status: 'done',
      });
    } catch (err) {
      updateShot(shot.id, { status: 'error' });
    }
  };

  const renderAll = async () => {
    setRendering(true);
    const pending = shots.filter(s => s.character && s.dialogue && s.status !== 'done');
    for (const shot of pending) await renderShot(shot);
    setRendering(false);
    setPreviewMode(true);
  };

  const doneShots = shots.filter(s => s.status === 'done');

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#00d4aa]/20 px-6 py-3 flex items-center gap-3 bg-[#030508]/95 backdrop-blur-sm sticky top-0 z-20">
        <Link to="/mission-control" className="w-7 h-7 rounded-lg bg-[#0d1f1a] border border-[#00d4aa]/30 flex items-center justify-center">
          <ChevronLeft size={13} className="text-[#00d4aa]" />
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[#00d4aa] uppercase tracking-[0.3em]">IINT // SCENE SANDBOX</p>
          <p className="text-[8px] text-[#475569] font-mono">Drag characters · Set dialogue · Render low-res preview</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#475569]">{shots.length} shots · {doneShots.length} rendered</span>
          <button
            onClick={renderAll}
            disabled={rendering || shots.every(s => !s.character)}
            className="px-4 py-1.5 rounded-lg text-[10px] font-black disabled:opacity-40 flex items-center gap-1.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', color: '#030508' }}
          >
            {rendering ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
            Render All
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-5">

        {/* Preview strip — shows rendered shots in sequence */}
        <AnimatePresence>
          {previewMode && doneShots.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-[#00d4aa]/30 bg-[#00d4aa]/05 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-[#00d4aa] uppercase tracking-widest">── SEQUENCE PREVIEW ──</p>
                <button onClick={() => setPreviewMode(false)} className="text-[9px] text-[#475569] hover:text-[#f1f5f9]">close</button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {doneShots.map((shot, i) => (
                  <div key={shot.id} className="shrink-0 w-40 space-y-1.5">
                    <div className="rounded-lg overflow-hidden border border-[#1e293b] aspect-video bg-[#030508]">
                      {shot.imageUrl
                        ? <img src={shot.imageUrl} alt={`shot ${i + 1}`} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Image size={14} className="text-[#334155]" /></div>
                      }
                    </div>
                    <p className="text-[8px] font-mono text-[#475569] truncate">{shot.character}</p>
                    <p className="text-[8px] text-[#334155] leading-tight line-clamp-2">"{shot.dialogue}"</p>
                    {shot.audioB64 && (
                      <audio controls className="w-full h-6" style={{ filter: 'invert(0.8)' }}>
                        <source src={`data:audio/mp3;base64,${shot.audioB64}`} type="audio/mp3" />
                      </audio>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shot cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {shots.map((shot, i) => (
              <ShotCard
                key={shot.id}
                shot={shot}
                index={i}
                personas={personas}
                onUpdate={patch => updateShot(shot.id, patch)}
                onRemove={() => removeShot(shot.id)}
                onRender={() => renderShot(shot)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Add shot */}
        <button onClick={addShot}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-[#1e293b] hover:border-[#00d4aa]/30 text-[#334155] hover:text-[#00d4aa] transition-colors flex items-center justify-center gap-2 text-xs font-bold">
          <Plus size={14} /> Add Shot
        </button>
      </div>
    </div>
  );
}