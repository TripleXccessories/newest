import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, Pause, GripVertical, Music, User, Layers, ChevronDown, ChevronUp, X, Volume2 } from 'lucide-react';

const TRACK_TYPES = [
  { id: 'character', label: 'Character Presence', color: '#00d4aa', icon: User },
  { id: 'audio', label: 'Audio Clip', color: '#a78bfa', icon: Music },
  { id: 'environment', label: 'Environment', color: '#f59e0b', icon: Layers },
];

const TRANSITIONS = ['cut', 'dissolve', 'fade', 'blue_dissolve', 'gold_brushstroke', 'purple_crystal_shatter', 'red_slash', 'green_vine_grow', 'flame_sweep'];

const TOTAL_SECONDS = 120;
const PX_PER_SEC = 8;

function timeToX(sec) { return sec * PX_PER_SEC; }
function xToTime(px) { return Math.round(px / PX_PER_SEC); }

function formatTime(sec) {
  return `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`;
}

let _nextId = 1;
function uid() { return `blk_${_nextId++}_${Date.now()}`; }

function TrackBlock({ block, color, selected, onSelect, onDelete, onResize, onDrag, personas, clips }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const label = block.type === 'character'
    ? (personas.find(p => p.id === block.persona_id)?.name || 'Character')
    : block.type === 'audio'
    ? (clips.find(c => c.id === block.clip_id)?.title || 'Audio Clip')
    : (block.env_name || 'Environment');

  const handleMouseDown = (e) => {
    if (e.target === resizeRef.current) return;
    e.preventDefault();
    const startX = e.clientX;
    const startSec = block.start_sec;
    const move = (me) => {
      const delta = xToTime(me.clientX - startX);
      const newStart = Math.max(0, Math.min(TOTAL_SECONDS - block.duration_sec, startSec + delta));
      onDrag(block.id, newStart);
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const handleResizeDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startDur = block.duration_sec;
    const move = (me) => {
      const delta = xToTime(me.clientX - startX);
      const newDur = Math.max(2, Math.min(TOTAL_SECONDS - block.start_sec, startDur + delta));
      onResize(block.id, newDur);
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      className="absolute top-1 bottom-1 rounded-lg cursor-grab active:cursor-grabbing flex items-center px-2 gap-1 overflow-hidden select-none border"
      style={{
        left: timeToX(block.start_sec),
        width: Math.max(timeToX(block.duration_sec), 24),
        background: selected ? `${color}30` : `${color}18`,
        borderColor: selected ? color : `${color}50`,
        boxShadow: selected ? `0 0 12px ${color}40` : 'none',
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
    >
      <GripVertical size={10} style={{ color, opacity: 0.6, flexShrink: 0 }} />
      <span className="text-[9px] font-bold truncate" style={{ color }}>{label}</span>
      {selected && (
        <button className="ml-auto p-0.5 rounded hover:bg-red-500/20 shrink-0" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}>
          <X size={8} className="text-red-400" />
        </button>
      )}
      {/* Resize handle */}
      <div
        ref={resizeRef}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r-lg"
        style={{ background: `${color}40` }}
        onMouseDown={handleResizeDown}
      />
    </div>
  );
}

export default function CharacterTimeline() {
  const [personas, setPersonas] = useState([]);
  const [clips, setClips] = useState([]);
  const [tracks, setTracks] = useState([
    { id: 't1', type: 'character', label: 'Character 1' },
    { id: 't2', type: 'audio', label: 'Audio 1' },
    { id: 't3', type: 'environment', label: 'Environment 1' },
  ]);
  const [blocks, setBlocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [addingBlock, setAddingBlock] = useState(null); // { trackId, type }
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({});
  const playRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.entities.BotPersona.list('name', 50),
      base44.entities.AudioClip.list('-created_date', 50),
    ]).then(([p, c]) => { setPersonas(p); setClips(c); });
  }, []);

  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setPlayhead(t => {
          if (t >= TOTAL_SECONDS) { setPlaying(false); return 0; }
          return t + 0.1;
        });
      }, 100);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing]);

  const selectedBlock = blocks.find(b => b.id === selected);
  const selectedTrack = selectedBlock ? tracks.find(t => t.id === selectedBlock.track_id) : null;

  const openAddBlock = (trackId, type) => {
    setAddingBlock({ trackId, type });
    setBlockForm({ start_sec: 0, duration_sec: 10, transition: 'cut' });
    setShowBlockForm(true);
  };

  const confirmAddBlock = () => {
    const t = tracks.find(tr => tr.id === addingBlock.trackId);
    const newBlock = {
      id: uid(),
      track_id: addingBlock.trackId,
      type: t.type,
      start_sec: Number(blockForm.start_sec) || 0,
      duration_sec: Number(blockForm.duration_sec) || 10,
      transition: blockForm.transition || 'cut',
      persona_id: blockForm.persona_id || null,
      clip_id: blockForm.clip_id || null,
      env_name: blockForm.env_name || null,
      env_transition: blockForm.env_transition || 'cut',
      notes: blockForm.notes || '',
    };
    setBlocks(prev => [...prev, newBlock]);
    setShowBlockForm(false);
    setAddingBlock(null);
    setSelected(newBlock.id);
  };

  const addTrack = (type) => {
    const count = tracks.filter(t => t.type === type).length + 1;
    const cfg = TRACK_TYPES.find(t => t.id === type);
    setTracks(prev => [...prev, { id: uid(), type, label: `${cfg.label} ${count}` }]);
  };

  const deleteTrack = (id) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    setBlocks(prev => prev.filter(b => b.track_id !== id));
  };

  const updateBlock = (id, changes) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b));
  const deleteBlock = (id) => { setBlocks(prev => prev.filter(b => b.id !== id)); setSelected(null); };

  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPlayhead(Math.min(TOTAL_SECONDS, Math.max(0, xToTime(x))));
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-[#050911] text-[#f1f5f9] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14] px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-black tracking-tight">Character Timeline Sequencer</h1>
          <p className="text-[10px] text-[#475569]">Arrange character presence, audio clips & environment transitions</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-[#00d4aa]">{formatTime(Math.floor(playhead))}</span>
          <button
            onClick={() => { setPlaying(p => !p); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: playing ? '#fb718520' : '#00d4aa20', color: playing ? '#fb7185' : '#00d4aa', border: `1px solid ${playing ? '#fb718540' : '#00d4aa40'}` }}
          >
            {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
          </button>
          <button onClick={() => setPlayhead(0)} className="text-xs text-[#475569] hover:text-[#94a3b8] px-2">↩ Reset</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Track labels */}
        <div className="w-44 shrink-0 border-r border-[#1e293b] bg-[#070b14] overflow-y-auto">
          {/* Header row spacer */}
          <div className="h-8 border-b border-[#1e293b] px-3 flex items-center">
            <span className="text-[9px] text-[#334155] uppercase tracking-widest font-bold">Tracks</span>
          </div>
          {tracks.map(track => {
            const cfg = TRACK_TYPES.find(t => t.id === track.type);
            const Icon = cfg?.icon || Layers;
            return (
              <div key={track.id} className="h-14 border-b border-[#1e293b] px-3 flex items-center gap-2 group">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: `${cfg?.color}20` }}>
                  <Icon size={10} style={{ color: cfg?.color }} />
                </div>
                <span className="text-[10px] font-semibold text-[#94a3b8] flex-1 truncate">{track.label}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openAddBlock(track.id, track.type)}
                    className="p-0.5 rounded hover:bg-[#1e293b]" title="Add block">
                    <Plus size={9} className="text-[#64748b]" />
                  </button>
                  <button onClick={() => deleteTrack(track.id)}
                    className="p-0.5 rounded hover:bg-red-500/10" title="Delete track">
                    <Trash2 size={9} className="text-[#64748b] hover:text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add track buttons */}
          <div className="p-3 space-y-1.5 border-b border-[#1e293b]">
            {TRACK_TYPES.map(cfg => {
              const Icon = cfg.icon;
              return (
                <button key={cfg.id} onClick={() => addTrack(cfg.id)}
                  className="w-full flex items-center gap-2 text-[9px] px-2 py-1.5 rounded-lg border border-dashed transition-colors hover:opacity-80"
                  style={{ borderColor: `${cfg.color}30`, color: cfg.color, background: `${cfg.color}08` }}>
                  <Icon size={9} /> + {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline canvas */}
        <div className="flex-1 overflow-auto bg-[#030508]">
          {/* Time ruler */}
          <div ref={timelineRef} onClick={handleTimelineClick}
            className="h-8 border-b border-[#1e293b] relative cursor-crosshair shrink-0 select-none"
            style={{ width: timeToX(TOTAL_SECONDS), minWidth: '100%' }}>
            {Array.from({ length: TOTAL_SECONDS / 5 + 1 }, (_, i) => i * 5).map(sec => (
              <div key={sec} className="absolute top-0 bottom-0 flex flex-col items-center"
                style={{ left: timeToX(sec) }}>
                <div className="w-px h-3 bg-[#1e293b]" />
                <span className="text-[8px] text-[#334155] font-mono mt-0.5">{formatTime(sec)}</span>
              </div>
            ))}
            {/* Playhead */}
            <div className="absolute top-0 bottom-0 w-px bg-[#00d4aa] pointer-events-none z-10"
              style={{ left: timeToX(playhead) }}>
              <div className="w-2 h-2 rounded-full bg-[#00d4aa] -translate-x-1/2" />
            </div>
          </div>

          {/* Track rows */}
          <div style={{ width: timeToX(TOTAL_SECONDS), minWidth: '100%' }}>
            {tracks.map(track => {
              const cfg = TRACK_TYPES.find(t => t.id === track.type);
              const trackBlocks = blocks.filter(b => b.track_id === track.id);
              return (
                <div key={track.id} className="h-14 border-b border-[#1e293b] relative"
                  style={{ background: `${cfg?.color}03` }}
                  onClick={() => setSelected(null)}>
                  {/* Grid lines */}
                  {Array.from({ length: TOTAL_SECONDS / 5 }, (_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 w-px bg-[#1e293b]"
                      style={{ left: timeToX((i + 1) * 5), opacity: 0.4 }} />
                  ))}
                  {/* Playhead shadow on each row */}
                  <div className="absolute top-0 bottom-0 w-px bg-[#00d4aa]/30 pointer-events-none z-10"
                    style={{ left: timeToX(playhead) }} />

                  {trackBlocks.map(block => (
                    <TrackBlock
                      key={block.id}
                      block={block}
                      color={cfg?.color || '#64748b'}
                      selected={selected === block.id}
                      onSelect={setSelected}
                      onDelete={deleteBlock}
                      onDrag={(id, newStart) => updateBlock(id, { start_sec: newStart })}
                      onResize={(id, newDur) => updateBlock(id, { duration_sec: newDur })}
                      personas={personas}
                      clips={clips}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inspector panel (bottom) */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="shrink-0 border-t border-[#1e293b] bg-[#070b14] px-6 py-4"
          >
            <div className="flex items-start gap-6 max-w-4xl">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Type</p>
                  <p className="text-xs font-bold" style={{ color: TRACK_TYPES.find(t=>t.id===selectedBlock.type)?.color }}>
                    {TRACK_TYPES.find(t=>t.id===selectedBlock.type)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Start</p>
                  <input type="number" value={selectedBlock.start_sec} min={0} max={TOTAL_SECONDS}
                    className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1 outline-none"
                    onChange={e => updateBlock(selectedBlock.id, { start_sec: Number(e.target.value) })} />
                </div>
                <div>
                  <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Duration (sec)</p>
                  <input type="number" value={selectedBlock.duration_sec} min={1}
                    className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1 outline-none"
                    onChange={e => updateBlock(selectedBlock.id, { duration_sec: Number(e.target.value) })} />
                </div>
                <div>
                  <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Transition In</p>
                  <select value={selectedBlock.transition || 'cut'}
                    className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1 outline-none"
                    onChange={e => updateBlock(selectedBlock.id, { transition: e.target.value })}>
                    {TRANSITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {selectedBlock.type === 'character' && (
                  <div className="col-span-2">
                    <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Character</p>
                    <select value={selectedBlock.persona_id || ''}
                      className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1 outline-none"
                      onChange={e => updateBlock(selectedBlock.id, { persona_id: e.target.value })}>
                      <option value="">— Select Character —</option>
                      {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}

                {selectedBlock.type === 'audio' && (
                  <div className="col-span-2">
                    <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Audio Clip</p>
                    <select value={selectedBlock.clip_id || ''}
                      className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1 outline-none"
                      onChange={e => updateBlock(selectedBlock.id, { clip_id: e.target.value })}>
                      <option value="">— Select Clip —</option>
                      {clips.map(c => <option key={c.id} value={c.id}>{c.title} ({c.persona_name})</option>)}
                    </select>
                  </div>
                )}

                {selectedBlock.type === 'environment' && (
                  <>
                    <div>
                      <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Environment Name</p>
                      <input value={selectedBlock.env_name || ''}
                        className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1 outline-none"
                        onChange={e => updateBlock(selectedBlock.id, { env_name: e.target.value })} />
                    </div>
                    <div>
                      <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Character</p>
                      <select value={selectedBlock.persona_id || ''}
                        className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1 outline-none"
                        onChange={e => updateBlock(selectedBlock.id, { persona_id: e.target.value })}>
                        <option value="">— Link Character —</option>
                        {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Notes</p>
                  <input value={selectedBlock.notes || ''} placeholder="Director's note..."
                    className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1 outline-none"
                    onChange={e => updateBlock(selectedBlock.id, { notes: e.target.value })} />
                </div>
              </div>

              <button onClick={() => deleteBlock(selectedBlock.id)}
                className="shrink-0 flex items-center gap-1 text-[10px] px-3 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add block modal */}
      <AnimatePresence>
        {showBlockForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(3,5,8,0.85)' }}
            onClick={e => e.target === e.currentTarget && setShowBlockForm(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="w-80 rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-4">
              <p className="text-sm font-black text-[#f1f5f9]">Add Block</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] text-[#475569] mb-1">Start (sec)</p>
                  <input type="number" value={blockForm.start_sec || 0}
                    className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1.5 outline-none"
                    onChange={e => setBlockForm(f => ({ ...f, start_sec: e.target.value }))} />
                </div>
                <div>
                  <p className="text-[9px] text-[#475569] mb-1">Duration (sec)</p>
                  <input type="number" value={blockForm.duration_sec || 10}
                    className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1.5 outline-none"
                    onChange={e => setBlockForm(f => ({ ...f, duration_sec: e.target.value }))} />
                </div>
              </div>

              {addingBlock?.type === 'character' && (
                <div>
                  <p className="text-[9px] text-[#475569] mb-1">Character</p>
                  <select className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1.5 outline-none"
                    onChange={e => setBlockForm(f => ({ ...f, persona_id: e.target.value }))}>
                    <option value="">— Select —</option>
                    {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {addingBlock?.type === 'audio' && (
                <div>
                  <p className="text-[9px] text-[#475569] mb-1">Audio Clip</p>
                  <select className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1.5 outline-none"
                    onChange={e => setBlockForm(f => ({ ...f, clip_id: e.target.value }))}>
                    <option value="">— Select —</option>
                    {clips.map(c => <option key={c.id} value={c.id}>{c.title} ({c.persona_name})</option>)}
                  </select>
                </div>
              )}
              {addingBlock?.type === 'environment' && (
                <div>
                  <p className="text-[9px] text-[#475569] mb-1">Environment Name</p>
                  <input className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1.5 outline-none"
                    placeholder="e.g. Da Wisdom Hollow"
                    onChange={e => setBlockForm(f => ({ ...f, env_name: e.target.value }))} />
                </div>
              )}

              <div>
                <p className="text-[9px] text-[#475569] mb-1">Transition</p>
                <select className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-1.5 outline-none"
                  onChange={e => setBlockForm(f => ({ ...f, transition: e.target.value }))}>
                  {TRANSITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowBlockForm(false)}
                  className="flex-1 py-2 rounded-xl text-xs border border-[#1e293b] text-[#64748b] hover:bg-[#1e293b]">
                  Cancel
                </button>
                <button onClick={confirmAddBlock}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#00d4aa] text-[#070b14] hover:bg-[#00d4aa]/90">
                  Add Block
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}