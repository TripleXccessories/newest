import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Download, RefreshCw, Zap, Image } from 'lucide-react';

const ARCHETYPE_COLORS = { Guide:'#f59e0b', Oracle:'#7c3aed', Catalyst:'#2dd4bf', Creator:'#f97316', Guardian:'#4ade80', Challenger:'#fb7185' };

function StatusBadge({ status }) {
  const cfg = {
    idle:      { label: '—',         color: '#334155', bg: '#1e293b' },
    queued:    { label: 'Queued',     color: '#fbbf24', bg: '#fbbf2415' },
    rendering: { label: 'Rendering…', color: '#60a5fa', bg: '#60a5fa15' },
    done:      { label: 'Done',       color: '#00d4aa', bg: '#00d4aa15' },
    error:     { label: 'Error',      color: '#fb7185', bg: '#fb718515' },
  }[status] || { label: status, color: '#64748b', bg: '#1e293b' };
  return (
    <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

export default function RenderPipeline() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [frameStates, setFrameStates] = useState({}); // { persona_id: { status, prompt, image_url, error } }
  const [selected, setSelected] = useState(new Set());
  const [batchRunning, setBatchRunning] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    base44.entities.BotPersona.list('name', 50)
      .then(p => { setPersonas(p); })
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(personas.map(p => p.id)));
  const clearAll = () => setSelected(new Set());

  const setState = (personaId, patch) => {
    setFrameStates(prev => ({ ...prev, [personaId]: { ...(prev[personaId] || {}), ...patch } }));
  };

  const generatePrompt = async (persona) => {
    const res = await base44.functions.invoke('renderPipeline', {
      action: 'generate_prompt',
      persona_id: persona.id,
    });
    return res?.data?.prompt || '';
  };

  const renderSingle = async (persona) => {
    setState(persona.id, { status: 'queued' });
    let prompt = frameStates[persona.id]?.prompt;
    if (!prompt) {
      prompt = await generatePrompt(persona);
      setState(persona.id, { prompt });
    }
    setState(persona.id, { status: 'rendering' });
    const res = await base44.functions.invoke('renderPipeline', {
      action: 'render_frame',
      prompt,
      persona_name: persona.name,
      frame_id: persona.id,
    }).catch(e => ({ data: { error: e.message } }));

    if (res?.data?.error) {
      if (res.data.error.includes('OPENAI_API_KEY')) setApiKeyMissing(true);
      setState(persona.id, { status: 'error', error: res.data.error });
    } else {
      setState(persona.id, { status: 'done', image_url: res?.data?.image_url, revised_prompt: res?.data?.revised_prompt });
    }
  };

  const runBatch = async () => {
    if (selected.size === 0) return;
    setBatchRunning(true);
    const toRender = personas.filter(p => selected.has(p.id));
    // Render up to 5 at a time sequentially to avoid timeouts
    for (const persona of toRender) {
      if (frameStates[persona.id]?.status === 'done') continue;
      await renderSingle(persona);
    }
    setBatchRunning(false);
  };

  const doneCount = Object.values(frameStates).filter(s => s.status === 'done').length;
  const errorCount = Object.values(frameStates).filter(s => s.status === 'error').length;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#f1f5f9] flex items-center gap-2">
            <Zap size={22} className="text-[#fbbf24]" /> Render Pipeline
          </h1>
          <p className="text-xs text-[#475569]">DALL-E 3 · auto-generate character visuals · stored back to app</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[#00d4aa]">{doneCount} rendered</span>
          {errorCount > 0 && <span className="text-[10px] text-[#fb7185]">{errorCount} errors</span>}
          <button onClick={selectAll} className="text-[10px] text-[#475569] hover:text-[#94a3b8] px-2 py-1 border border-[#1e293b] rounded-lg">Select All</button>
          <button onClick={clearAll} className="text-[10px] text-[#475569] hover:text-[#94a3b8] px-2 py-1 border border-[#1e293b] rounded-lg">Clear</button>
          <button
            onClick={runBatch}
            disabled={batchRunning || selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2440' }}>
            {batchRunning ? <><Loader2 size={14} className="animate-spin" /> Rendering...</> : <><Sparkles size={14} /> Render {selected.size} Selected</>}
          </button>
        </div>
      </div>

      {apiKeyMissing && (
        <div className="rounded-2xl border border-[#fbbf24]/40 bg-[#fbbf24]/08 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-[#fbbf24] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#fbbf24]">OpenAI API Key Required</p>
            <p className="text-xs text-[#94a3b8] mt-1">Add <code className="text-[#fbbf24]">OPENAI_API_KEY</code> in Dashboard → Settings → Secrets to enable DALL-E 3 rendering.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map(persona => {
            const state = frameStates[persona.id] || {};
            const color = ARCHETYPE_COLORS[persona.archetype] || '#64748b';
            const isSelected = selected.has(persona.id);

            return (
              <motion.div key={persona.id}
                className="rounded-2xl border overflow-hidden cursor-pointer transition-all"
                style={{
                  borderColor: isSelected ? color : state.status === 'done' ? '#00d4aa40' : '#1e293b',
                  boxShadow: isSelected ? `0 0 16px ${color}30` : 'none',
                  background: '#0a0f1e',
                }}
                onClick={() => toggleSelect(persona.id)}>

                {/* Image panel */}
                <div className="relative aspect-video bg-[#050911] flex items-center justify-center overflow-hidden">
                  {state.image_url ? (
                    <img src={state.image_url} alt={persona.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {state.status === 'rendering' ? (
                        <><Loader2 size={24} className="animate-spin" style={{ color }} /><p className="text-[9px] text-[#475569]">Generating...</p></>
                      ) : (
                        <><Image size={24} className="text-[#1e293b]" /><p className="text-[9px] text-[#334155]">No render yet</p></>
                      )}
                    </div>
                  )}
                  {/* Select checkbox */}
                  <div className="absolute top-2 left-2 w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                    style={{ borderColor: isSelected ? color : '#334155', background: isSelected ? color : 'transparent' }}>
                    {isSelected && <CheckCircle2 size={10} className="text-[#070b14]" />}
                  </div>
                  {state.status && <div className="absolute top-2 right-2"><StatusBadge status={state.status} /></div>}
                  {state.image_url && (
                    <a href={state.image_url} target="_blank" rel="noreferrer"
                      className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-black/50 flex items-center justify-center hover:bg-black/80"
                      onClick={e => e.stopPropagation()}>
                      <Download size={10} className="text-white" />
                    </a>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate" style={{ color }}>{persona.name}</p>
                    <p className="text-[9px] text-[#475569] truncate">{persona.archetype} · {persona.school}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); renderSingle(persona); }}
                    disabled={state.status === 'rendering' || batchRunning}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-bold transition-all disabled:opacity-40"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                    {state.status === 'rendering' ? <Loader2 size={9} className="animate-spin" /> : <Sparkles size={9} />}
                    {state.status === 'done' ? 'Re-render' : 'Render'}
                  </button>
                </div>

                {state.error && (
                  <div className="px-3 pb-2">
                    <p className="text-[8px] text-[#fb7185] truncate">{state.error}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}