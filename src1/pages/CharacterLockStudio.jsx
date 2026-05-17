import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Unlock, Mic, Brain, Volume2, CheckCircle, AlertCircle, Loader2, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const AZURE_VOICES = [
  { id: 'en-US-AriaNeural',    label: 'Aria — Warm Female',       gender: 'F', style: 'warm' },
  { id: 'en-US-JennyNeural',   label: 'Jenny — Friendly Female',  gender: 'F', style: 'friendly' },
  { id: 'en-US-SaraNeural',    label: 'Sara — Calm Female',       gender: 'F', style: 'calm' },
  { id: 'en-US-NancyNeural',   label: 'Nancy — Professional F',   gender: 'F', style: 'professional' },
  { id: 'en-US-DavisNeural',   label: 'Davis — Deep Male',        gender: 'M', style: 'deep' },
  { id: 'en-US-GuyNeural',     label: 'Guy — Confident Male',     gender: 'M', style: 'confident' },
  { id: 'en-US-TonyNeural',    label: 'Tony — Authoritative M',   gender: 'M', style: 'authoritative' },
  { id: 'en-US-JasonNeural',   label: 'Jason — Dynamic Male',     gender: 'M', style: 'dynamic' },
  { id: 'en-US-BrandonNeural', label: 'Brandon — Youthful Male',  gender: 'M', style: 'youthful' },
  { id: 'en-US-EricNeural',    label: 'Eric — Steady Male',       gender: 'M', style: 'steady' },
  { id: 'en-GB-RyanNeural',    label: 'Ryan — British Male',      gender: 'M', style: 'british' },
  { id: 'en-GB-SoniaNeural',   label: 'Sonia — British Female',   gender: 'F', style: 'british' },
];

const ARCHETYPE_COLOR = {
  Guide: '#00d4aa', Guardian: '#3b82f6', Oracle: '#a78bfa',
  Creator: '#f59e0b', Challenger: '#ef4444', Catalyst: '#f97316',
};

export default function CharacterLockStudio() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [previewing, setPreviewing] = useState({});
  const [selections, setSelections] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    base44.entities.BotPersona.list().then(data => {
      setBots(data);
      // Pre-fill selections from existing data
      const sel = {};
      data.forEach(b => {
        sel[b.id] = {
          voice_id: b.locked_voice_id || '',
          personality_locked: b.personality_locked || false,
          voice_locked: b.voice_locked || false,
        };
      });
      setSelections(sel);
      setLoading(false);
    });
  }, []);

  const handleSave = async (bot) => {
    setSaving(s => ({ ...s, [bot.id]: true }));
    const sel = selections[bot.id] || {};
    const res = await base44.functions.invoke('lockPersonality', {
      bot_id: bot.id,
      personality_lock: sel.personality_locked,
      voice_lock: sel.voice_locked,
      locked_voice_id: sel.voice_id,
    });
    setSaving(s => ({ ...s, [bot.id]: false }));
    if (res.data?.success) {
      setFeedback(f => ({ ...f, [bot.id]: 'saved' }));
      setTimeout(() => setFeedback(f => ({ ...f, [bot.id]: null })), 3000);
    } else {
      setFeedback(f => ({ ...f, [bot.id]: 'error' }));
    }
  };

  const handlePreview = async (bot) => {
    const sel = selections[bot.id] || {};
    const voiceId = sel.voice_id;
    if (!voiceId) return;
    setPreviewing(p => ({ ...p, [bot.id]: true }));
    const previewText = bot.signature_line || bot.default_greeting?.slice(0, 120) || `I am ${bot.name}. Welcome to my domain.`;
    const res = await base44.functions.invoke('azureSpeech', {
      text: previewText,
      voice_id: voiceId,
    });
    setPreviewing(p => ({ ...p, [bot.id]: false }));
    if (res.data?.audio_base64) {
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio_base64}`);
      audio.play();
    }
  };

  const update = (botId, key, value) => {
    setSelections(s => ({ ...s, [botId]: { ...s[botId], [key]: value } }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#070b14]">
      <Loader2 className="w-6 h-6 text-[#00d4aa] animate-spin" />
    </div>
  );

  // Group by archetype
  const archetypes = [...new Set(bots.map(b => b.archetype))].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#070b14] text-[#f1f5f9] p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-[10px] font-mono tracking-[0.3em] text-[#00d4aa] uppercase mb-1">Director's Cut · Admin Only</p>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Lock size={26} className="text-[#00d4aa]" /> Character Lock Studio
          </h1>
          <p className="text-sm text-[#64748b] mt-1">Lock personality traits and assign Azure Neural voices per character. Locked characters cannot be modified by standard editors.</p>
        </div>

        {archetypes.map(archetype => {
          const color = ARCHETYPE_COLOR[archetype] || '#64748b';
          const archetypeBots = bots.filter(b => b.archetype === archetype);
          return (
            <div key={archetype} className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
                {archetype} Archetype
              </p>
              <div className="space-y-3">
                {archetypeBots.map((bot, i) => {
                  const sel = selections[bot.id] || {};
                  const fb = feedback[bot.id];
                  return (
                    <motion.div
                      key={bot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border p-5 space-y-4"
                      style={{ borderColor: `${color}25`, background: `${color}05` }}
                    >
                      {/* Bot header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#f1f5f9]">{bot.name}</p>
                          <p className="text-xs text-[#475569]">{bot.role_title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {fb === 'saved' && <span className="flex items-center gap-1 text-xs text-[#00d4aa]"><CheckCircle size={12} /> Saved</span>}
                          {fb === 'error' && <span className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12} /> Error</span>}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Personality Lock */}
                        <div className="bg-[#0d1623] rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Brain size={14} className="text-[#a78bfa]" />
                            <span className="text-xs font-bold text-[#a78bfa]">Personality</span>
                          </div>
                          <p className="text-[10px] text-[#475569] leading-relaxed">
                            {bot.signature_line || 'No signature line set.'}
                          </p>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() => update(bot.id, 'personality_locked', !sel.personality_locked)}
                              className={`w-10 h-5 rounded-full transition-colors relative ${sel.personality_locked ? 'bg-[#a78bfa]' : 'bg-[#1e293b]'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sel.personality_locked ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                            <span className="text-xs text-[#64748b]">
                              {sel.personality_locked ? <span className="flex items-center gap-1"><Lock size={10} /> Locked</span> : <span className="flex items-center gap-1"><Unlock size={10} /> Unlocked</span>}
                            </span>
                          </label>
                        </div>

                        {/* Voice Lock */}
                        <div className="bg-[#0d1623] rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Mic size={14} className="text-[#00d4aa]" />
                            <span className="text-xs font-bold text-[#00d4aa]">Azure Voice</span>
                          </div>
                          <select
                            value={sel.voice_id || ''}
                            onChange={e => update(bot.id, 'voice_id', e.target.value)}
                            className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]"
                          >
                            <option value="">— Select Voice —</option>
                            {AZURE_VOICES.map(v => (
                              <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreview(bot)}
                              disabled={!sel.voice_id || previewing[bot.id]}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00d4aa]/15 text-[#00d4aa] hover:bg-[#00d4aa]/25 transition-colors disabled:opacity-40"
                            >
                              {previewing[bot.id] ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                              Preview
                            </button>
                            <label className="flex items-center gap-2 cursor-pointer ml-auto">
                              <div
                                onClick={() => update(bot.id, 'voice_locked', !sel.voice_locked)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${sel.voice_locked ? 'bg-[#00d4aa]' : 'bg-[#1e293b]'}`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sel.voice_locked ? 'translate-x-5' : 'translate-x-0.5'}`} />
                              </div>
                              <span className="text-xs text-[#64748b]">
                                {sel.voice_locked ? <span className="flex items-center gap-1"><Lock size={10} /> Locked</span> : <span className="flex items-center gap-1"><Unlock size={10} /> Unlocked</span>}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Save */}
                      <button
                        onClick={() => handleSave(bot)}
                        disabled={saving[bot.id]}
                        className="w-full py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                      >
                        {saving[bot.id] ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
                        Save & Lock {bot.name}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}