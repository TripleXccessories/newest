import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic2, Loader2, Sparkles, RefreshCw, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import AudioClipRow from '@/components/audiostudio/AudioClipRow';

const ARCHETYPE_COLORS = {
  Guide: '#00d4aa', Creator: '#a78bfa', Oracle: '#60a5fa',
  Challenger: '#fb7185', Guardian: '#f59e0b', Catalyst: '#f97316',
};

export default function AudioStudio() {
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [engine, setEngine] = useState('elevenlabs');
  const [loading, setLoading] = useState(false);
  const [clips, setClips] = useState([]);
  const [clipsLoading, setClipsLoading] = useState(true);

  useEffect(() => {
    base44.entities.BotPersona.filter({ status: 'active' }, 'name', 50).then(p => {
      setPersonas(p);
      if (p.length) setSelectedPersona(p[0]);
    });
    loadClips();
  }, []);

  const loadClips = async () => {
    setClipsLoading(true);
    const c = await base44.entities.AudioClip.list('-created_date', 30);
    setClips(c);
    setClipsLoading(false);
  };

  const pickRandom = () => {
    if (!personas.length) return;
    setSelectedPersona(personas[Math.floor(Math.random() * personas.length)]);
  };

  const generate = async () => {
    if (!text.trim() || !selectedPersona) return;
    setLoading(true);

    let audioB64 = null;
    if (engine === 'elevenlabs') {
      const voiceId = selectedPersona.locked_voice_id || 'EXAVITQu4vr4xnSDxMaL';
      const res = await base44.functions.invoke('elevenLabs', {
        action: 'tts', voice_id: voiceId, text, stability: 0.6, similarity_boost: 0.8,
      });
      audioB64 = res.data?.audio_base64 || null;
    } else {
      const res = await base44.functions.invoke('azureSpeech', {
        text, archetype: selectedPersona.archetype, voice_id: selectedPersona.locked_voice_id || null,
      });
      audioB64 = res.data?.audio_base64 || null;
    }

    const clip = await base44.entities.AudioClip.create({
      title: title.trim() || `${selectedPersona.name} — ${new Date().toLocaleTimeString()}`,
      text_content: text,
      audio_base64: audioB64,
      persona_id: selectedPersona.id,
      persona_name: selectedPersona.name,
      persona_color: selectedPersona.primary_color || ARCHETYPE_COLORS[selectedPersona.archetype] || '#00d4aa',
      engine,
      voice_id: selectedPersona.locked_voice_id || '',
    });

    setClips(prev => [clip, ...prev]);
    setText('');
    setTitle('');
    setLoading(false);
  };

  const color = selectedPersona
    ? (selectedPersona.primary_color || ARCHETYPE_COLORS[selectedPersona.archetype] || '#00d4aa')
    : '#00d4aa';

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Mic2 size={20} style={{ color }} />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#f1f5f9]">Audio Studio</h1>
          <p className="text-xs text-[#475569]">Generate voice clips using Faculty persona voices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generator panel */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-4">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Create Clip</p>

          {/* Persona selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#94a3b8] font-semibold">Narrator</p>
              <button onClick={pickRandom} className="flex items-center gap-1 text-[10px] text-[#00d4aa] hover:underline">
                <Shuffle size={9} /> Random
              </button>
            </div>
            <select
              value={selectedPersona?.id || ''}
              onChange={e => setSelectedPersona(personas.find(p => p.id === e.target.value))}
              className="w-full bg-[#070b14] border border-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#00d4aa]"
            >
              {personas.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.archetype}){p.voice_locked ? ' 🔒' : ''}</option>
              ))}
            </select>

            {selectedPersona && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b]">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${color}20`, color }}>
                  {selectedPersona.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#f1f5f9]">{selectedPersona.name}</p>
                  <p className="text-[10px] text-[#475569]">
                    {selectedPersona.archetype} · Voice: {selectedPersona.locked_voice_id || 'Default'}
                    {selectedPersona.voice_locked ? ' 🔒' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Engine */}
          <div className="flex gap-2">
            {['elevenlabs', 'azure'].map(e => (
              <button key={e} onClick={() => setEngine(e)}
                className="text-[10px] px-3 py-1.5 rounded-lg border font-bold transition-all"
                style={{
                  borderColor: engine === e ? color : '#1e293b',
                  background: engine === e ? `${color}15` : 'transparent',
                  color: engine === e ? color : '#475569',
                }}>
                {e === 'elevenlabs' ? '⚡ ElevenLabs' : '☁️ Azure'}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Clip title (optional)"
            className="w-full bg-[#070b14] border border-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#00d4aa]"
          />

          {/* Text */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            placeholder={`Enter the text for ${selectedPersona?.name || 'your character'} to speak...`}
            className="w-full bg-[#070b14] border border-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-[#00d4aa]"
          />

          <Button onClick={generate} disabled={loading || !text.trim() || !selectedPersona}
            className="w-full text-xs font-bold h-10 gap-2"
            style={{ background: color, color: '#070b14' }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Generating...' : 'Generate Voice Clip'}
          </Button>
        </div>

        {/* Clips list */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">
              Recent Clips ({clips.length})
            </p>
            <button onClick={loadClips} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
              <RefreshCw size={11} />
            </button>
          </div>

          {clipsLoading && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
            </div>
          )}

          {!clipsLoading && clips.length === 0 && (
            <div className="text-center py-8">
              <Mic2 size={28} className="mx-auto mb-2 text-[#334155]" />
              <p className="text-xs text-[#334155]">No clips yet — generate your first one!</p>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            <AnimatePresence>
              {clips.map(clip => (
                <motion.div key={clip.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <AudioClipRow clip={clip} onDelete={id => setClips(prev => prev.filter(c => c.id !== id))} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}