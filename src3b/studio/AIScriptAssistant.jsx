import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, ChevronDown, ChevronRight, Plus, Lock, Bot, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Characters are LOCKED — voice, style, and appearance cannot be changed
const LOCKED_CHARACTERS = {
  robot: {
    label: 'Robot',
    icon: <Bot size={11} />,
    color: '#60a5fa',
    voice: 'Technical, precise, data-driven. Uses system metaphors. Speaks in short declarative statements.',
    actions: ['speak', 'gesture', 'chestPanel', 'eyeGlow', 'scan', 'process'],
    locked: true,
  },
  lightbulb: {
    label: 'LightbulbGuy',
    icon: <Lightbulb size={11} />,
    color: '#fbbf24',
    voice: 'Warm, enthusiastic, idea-focused. Uses light/energy metaphors. Encouraging and upbeat.',
    actions: ['speak', 'mood', 'glove', 'bulbColor', 'flash', 'wink'],
    locked: true,
  },
};

const PROMPT_TEMPLATES = [
  { label: 'Cinematic intro', prompt: 'Generate a dramatic cinematic intro scene where the robot and lightbulb introduce the IINT Academy trading platform.' },
  { label: 'Reward delivery', prompt: 'Create a reward delivery scene where the characters celebrate the user completing a milestone and receiving a badge.' },
  { label: 'Academy lesson', prompt: 'Write a tutorial scene for a trading basics lesson where the lightbulb explains candlestick patterns and the robot shows data.' },
  { label: 'Promo ad', prompt: 'Write an energetic promotional scene for a new membership tier launch, keeping it punchy and under 30 seconds.' },
];

function EventCard({ event, index }) {
  const charMeta = LOCKED_CHARACTERS[event.character];
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg border border-[#1e293b] bg-[#060a12]">
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black"
        style={{ background: `${charMeta?.color || '#64748b'}20`, color: charMeta?.color || '#64748b' }}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: `${charMeta?.color || '#64748b'}15`, color: charMeta?.color || '#64748b' }}>
            {charMeta?.icon} {event.character}
          </span>
          {charMeta?.locked && (
            <span className="flex items-center gap-0.5 text-[9px] text-[#334155]">
              <Lock size={8} /> locked
            </span>
          )}
          <span className="text-[10px] text-[#475569]">@{event.time?.toFixed?.(1) ?? event.time}s</span>
          <span className="text-[10px] font-mono text-[#64748b] bg-[#1e293b] px-1.5 py-0.5 rounded">{event.action}</span>
          {event.duration && (
            <span className="text-[9px] text-[#334155]">{event.duration}s</span>
          )}
        </div>
        {event.value !== undefined && event.value !== null && event.value !== '' && (
          <p className="text-[11px] text-[#94a3b8] leading-snug pl-0.5">"{String(event.value)}"</p>
        )}
      </div>
    </div>
  );
}

export default function AIScriptAssistant({ scene, onApplyScript }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState(null);
  const [showChars, setShowChars] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const sceneContext = scene
    ? `Scene title: "${scene.title}". Type: ${scene.scene_type}. Characters: ${(scene.characters || []).join(', ') || 'none assigned'}.${scene.academy_school_level ? ` Academy level: ${scene.academy_school_level}.` : ''}${scene.description ? ` Description: ${scene.description}` : ''}`
    : 'No scene selected.';

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setGenerated(null);

    try {
      // Build the system prompt enforcing locked character identities
      const systemPrompt = `You are a cinematic scene script generator for IINT Scene Studio.

LOCKED CHARACTER IDENTITIES (NEVER change these):
- robot: Technical, precise, data-driven AI. Uses system/data metaphors. Short declarative statements. Actions: speak, gesture, chestPanel, eyeGlow, scan, process.
- lightbulb: Warm, enthusiastic idea-generator. Uses light/energy metaphors. Upbeat and encouraging. Actions: speak, mood, glove, bulbColor, flash, wink.

Scene context: ${sceneContext}

Generate a JSON script_events array. Each event must have:
- id: unique string (e.g. "ev1", "ev2")
- time: number (seconds from scene start, 0.0+)
- character: ONLY "robot" or "lightbulb" — no others
- action: must be one of that character's locked actions
- value: string dialogue or parameter value (e.g. a mood name, color hex, or spoken line)
- duration: number in seconds

IMPORTANT: Only use robot and lightbulb. Never invent new characters. Keep each character's voice and style locked as described.

User request: ${prompt.trim()}

Respond with ONLY valid JSON: { "script_events": [...], "summary": "brief description" }`;

      const res = await base44.functions.invoke('generateFacultyDialogue', {
        prompt: systemPrompt,
        context: sceneContext,
      });

      const data = res?.data;
      let parsed;

      // Try to parse JSON from response
      if (typeof data === 'string') {
        const match = data.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } else if (data?.script_events) {
        parsed = data;
      } else if (data?.result) {
        const match = String(data.result).match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } else if (data?.dialogue) {
        // generateFacultyDialogue may return { dialogue: "..." }
        const match = String(data.dialogue).match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (!parsed?.script_events) throw new Error('Could not parse script events from AI response.');

      // Enforce locked characters — filter out any that aren't robot or lightbulb
      parsed.script_events = parsed.script_events
        .filter(e => ['robot', 'lightbulb'].includes(e.character))
        .map((e, i) => ({
          ...e,
          id: e.id || `ai_ev${i + 1}`,
          time: typeof e.time === 'number' ? e.time : i * 2,
          duration: typeof e.duration === 'number' ? e.duration : 2,
        }));

      setGenerated(parsed);
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.');
    }
    setLoading(false);
  };

  const handleApply = () => {
    if (!generated?.script_events) return;
    onApplyScript(generated.script_events);
    setGenerated(null);
    setPrompt('');
  };

  return (
    <div className="bg-[#0a0f1e] border border-[#a78bfa]/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0a0f1e]">
        <Sparkles size={13} className="text-[#a78bfa]" />
        <h4 className="text-xs font-black text-[#f1f5f9]">AI Script Assistant</h4>
        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa] font-bold">Powered by generateFacultyDialogue</span>
      </div>

      <div className="p-4 space-y-3">

        {/* Locked character badges */}
        <button onClick={() => setShowChars(s => !s)}
          className="w-full flex items-center gap-2 text-left">
          <Lock size={10} className="text-[#334155]" />
          <span className="text-[10px] text-[#334155] flex-1">Character identities are locked</span>
          {showChars ? <ChevronDown size={10} className="text-[#334155]" /> : <ChevronRight size={10} className="text-[#334155]" />}
        </button>

        <AnimatePresence>
          {showChars && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2">
              {Object.entries(LOCKED_CHARACTERS).map(([key, char]) => (
                <div key={key} className="p-2.5 rounded-xl border"
                  style={{ borderColor: `${char.color}30`, background: `${char.color}06` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span style={{ color: char.color }}>{char.icon}</span>
                    <span className="text-[11px] font-bold" style={{ color: char.color }}>{char.label}</span>
                    <Lock size={9} style={{ color: char.color }} className="ml-auto opacity-50" />
                  </div>
                  <p className="text-[10px] text-[#475569] leading-snug">{char.voice}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {char.actions.map(a => (
                      <span key={a} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#475569] font-mono">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template prompts */}
        <div>
          <button onClick={() => setShowTemplates(s => !s)}
            className="flex items-center gap-1.5 text-[10px] text-[#475569] hover:text-[#a78bfa] transition-colors mb-1.5">
            {showTemplates ? <ChevronDown size={10} /> : <ChevronRight size={10} />} Quick templates
          </button>
          <AnimatePresence>
            {showTemplates && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden grid grid-cols-2 gap-1.5 mb-2">
                {PROMPT_TEMPLATES.map(t => (
                  <button key={t.label} onClick={() => { setPrompt(t.prompt); setShowTemplates(false); }}
                    className="text-left p-2 rounded-lg border border-[#1e293b] text-[10px] text-[#64748b] hover:border-[#a78bfa]/40 hover:text-[#a78bfa] transition-all leading-snug">
                    {t.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scene context pill */}
        {scene && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1e293b] text-[10px] text-[#475569]">
            <span className="shrink-0">🎬</span>
            <span className="truncate">{sceneContext}</span>
          </div>
        )}

        {/* Prompt input */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
            placeholder="Describe the scene you want to generate... e.g. 'An intro where the robot analyzes data and the lightbulb reacts with excitement when a signal fires'"
            rows={3}
            className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2.5 outline-none border border-transparent focus:border-[#a78bfa]/40 resize-none placeholder:text-[#334155]"
          />
          <span className="absolute bottom-2 right-2 text-[9px] text-[#334155]">⌘↵ to send</span>
        </div>

        <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
          style={{ background: '#a78bfa', color: '#070b14' }}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          {loading ? 'Generating script...' : 'Generate Script'}
        </button>

        {/* Error */}
        {error && (
          <div className="p-2.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[11px] text-[#ef4444]">
            {error}
          </div>
        )}

        {/* Generated result */}
        <AnimatePresence>
          {generated && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#a78bfa]">
                  Generated — {generated.script_events?.length} events
                </span>
                <span className="text-[9px] text-[#334155]">Review before applying</span>
              </div>

              {generated.summary && (
                <p className="text-[11px] text-[#475569] italic px-2">{generated.summary}</p>
              )}

              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {generated.script_events?.map((ev, i) => (
                  <EventCard key={ev.id || i} event={ev} index={i} />
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold"
                  style={{ background: '#00d4aa', color: '#070b14' }}>
                  <Plus size={12} /> Apply to Sequencer
                </button>
                <button onClick={() => setGenerated(null)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                  Discard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}