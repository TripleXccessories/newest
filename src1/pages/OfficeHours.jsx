import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, RefreshCw, ChevronDown } from 'lucide-react';

const ARCHETYPE_COLORS = { Guide:'#f59e0b', Oracle:'#7c3aed', Catalyst:'#2dd4bf', Creator:'#f97316', Guardian:'#4ade80', Challenger:'#fb7185' };

// Build a rich system context from persona data
function buildSystemPrompt(persona) {
  return `You are ${persona.name}, a faculty member at the IINT Academy.

Role: ${persona.role_title}
School: ${persona.school} — "${persona.school_tagline || ''}"
Archetype: ${persona.archetype}

Character: ${persona.reveal_desc || ''}
Your signature line: "${persona.signature_line || ''}"
Art direction: ${persona.art_direction || ''}
Music motif: ${persona.music_motif || ''}

Personality: You embody the ${persona.archetype} archetype. ${
  persona.archetype === 'Guide' ? 'You are patient, warm, and deeply wise. You help students find what they already know.' :
  persona.archetype === 'Oracle' ? 'You are precise, analytical, and data-driven. You reveal truth through evidence.' :
  persona.archetype === 'Catalyst' ? 'You are transformative, cosmic in perspective, and challenge students to see bigger.' :
  persona.archetype === 'Creator' ? 'You are hands-on, inventive, and enthusiastic. You believe in learning by building.' :
  persona.archetype === 'Guardian' ? 'You are protective, structured, and reliable. You keep students safe as they grow.' :
  persona.archetype === 'Challenger' ? 'You are direct, provocative, and demanding. You push students past their limits.' :
  'You are a master of your domain.'
}

Your knowledge domain centers on: ${persona.school}. You are in an "Office Hours" session — a direct, focused conversation with a student. Be in character at all times. Keep responses under 4 sentences unless asked for elaboration. Do not break character. Never mention you are an AI.`;
}

function TypingIndicator({ color }) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-sm w-16"
      style={{ background: `${color}15` }}>
      {[0,1,2].map(i => (
        <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}

export default function OfficeHours() {
  const [personas, setPersonas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    base44.entities.BotPersona.filter({ status: 'draft' }, 'name', 50)
      .then(p => { setPersonas(p); if (p.length > 0) setSelected(p[0]); })
      .finally(() => setLoadingPersonas(false));
  }, []);

  useEffect(() => {
    if (selected) {
      setMessages([{
        role: 'assistant',
        content: selected.default_greeting || selected.signature_line || `Welcome. I am ${selected.name}. What would you like to explore today?`,
        ts: Date.now(),
      }]);
    }
  }, [selected?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const color = selected ? (ARCHETYPE_COLORS[selected.archetype] || '#64748b') : '#64748b';

  const speakText = (text) => {
    if (!ttsEnabled || !text) return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis?.speak(utt);
  };

  // Also try ElevenLabs if voice is locked
  const speakWithElevenLabs = async (text) => {
    if (!ttsEnabled || !selected?.locked_voice_id) { speakText(text); return; }
    const res = await base44.functions.invoke('elevenLabs', {
      action: 'tts',
      voice_id: selected.locked_voice_id,
      text: text.slice(0, 300),
      stability: 0.55,
      similarity_boost: 0.8,
    }).catch(() => null);
    if (res?.data?.audio_base64) {
      const blob = new Blob([Uint8Array.from(atob(res.data.audio_base64), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setSpeaking(true);
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.play();
    } else {
      speakText(text);
    }
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || !selected) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, ts: Date.now() }]);
    setLoading(true);

    // Build conversation history for context
    const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'Student' : selected.name}: ${m.content}`).join('\n');

    const res = await base44.functions.invoke('generateFacultyDialogue', {
      faculty_name: selected.name,
      faculty_archetype: selected.archetype,
      faculty_school: selected.school,
      user_message: msg,
      context: buildSystemPrompt(selected),
      conversation_history: history,
      signature_line: selected.signature_line,
    }).catch(() => null);

    const reply = res?.data?.dialogue || res?.data?.response ||
      `${selected.name} pauses, considering your question. "That is worth exploring. Come back to me with your initial thoughts."`;

    setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
    setLoading(false);
    speakWithElevenLabs(reply);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  };

  const clearChat = () => {
    if (selected) setMessages([{
      role: 'assistant',
      content: selected.default_greeting || selected.signature_line || `Welcome back. I am ${selected.name}.`,
      ts: Date.now(),
    }]);
  };

  if (loadingPersonas) {
    return (
      <div className="min-h-screen bg-[#050911] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050911] text-[#f1f5f9] flex flex-col" style={{ maxHeight: '100vh' }}>

      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14] px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="flex-1 flex items-center gap-3 min-w-0">
          {/* Character selector */}
          <div className="relative">
            <button onClick={() => setShowSelector(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
              style={{ borderColor: `${color}50`, background: `${color}10` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm"
                style={{ background: `${color}20`, color }}>
                {selected?.name?.charAt(0) || '?'}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-black truncate max-w-[120px]" style={{ color }}>{selected?.name || 'Select...'}</p>
                <p className="text-[8px] text-[#475569] truncate max-w-[120px]">{selected?.archetype} · {selected?.school}</p>
              </div>
              <ChevronDown size={12} className="text-[#475569]" />
            </button>

            <AnimatePresence>
              {showSelector && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 mt-1 w-64 rounded-2xl border border-[#1e293b] bg-[#0a0f1e] z-50 shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                  {personas.map(p => {
                    const c = ARCHETYPE_COLORS[p.archetype] || '#64748b';
                    return (
                      <button key={p.id} onClick={() => { setSelected(p); setShowSelector(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1e293b] transition-colors text-left border-b border-[#1e293b]/50"
                        style={{ background: selected?.id === p.id ? `${c}10` : 'transparent' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black shrink-0"
                          style={{ background: `${c}20`, color: c }}>
                          {p.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#f1f5f9] truncate">{p.name}</p>
                          <p className="text-[8px]" style={{ color: c }}>{p.archetype} · {p.school}</p>
                        </div>
                        {p.locked_voice_id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00d4aa] shrink-0" title="Voice locked" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:block min-w-0">
            <p className="text-[10px] text-[#475569] truncate">Office Hours · {selected?.role_title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {speaking && <div className="flex items-center gap-0.5">{[3,5,3,7,5].map((h,i) => <div key={i} className="w-0.5 rounded-full animate-pulse" style={{ height: h, background: color }} />)}</div>}
          <button onClick={() => { setTtsEnabled(v => !v); window.speechSynthesis?.cancel(); setSpeaking(false); }}
            className="w-8 h-8 rounded-xl bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]"
            title={ttsEnabled ? 'Disable voice' : 'Enable voice'}>
            {ttsEnabled ? <Volume2 size={13} style={{ color }} /> : <VolumeX size={13} className="text-[#475569]" />}
          </button>
          <button onClick={clearChat} className="w-8 h-8 rounded-xl bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]">
            <RefreshCw size={12} className="text-[#475569]" />
          </button>
        </div>
      </div>

      {/* Character banner */}
      {selected && (
        <div className="px-4 py-2.5 border-b border-[#1e293b] shrink-0"
          style={{ background: `linear-gradient(90deg, ${color}12, transparent)` }}>
          <p className="text-[9px] italic text-[#64748b] truncate">"{selected.signature_line}"</p>
          {selected.locked_voice_id && (
            <p className="text-[8px] text-[#00d4aa] mt-0.5">🎙️ Locked voice active · ElevenLabs TTS enabled</p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" onClick={() => setShowSelector(false)}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5"
                    style={{ background: `${color}20`, color }}>
                    {selected?.name?.charAt(0)}
                  </div>
                )}
                <div className="max-w-[78%]">
                  <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                    style={{
                      background: isUser ? '#1e293b' : `${color}15`,
                      color: isUser ? '#f1f5f9' : '#e2e8f0',
                      border: isUser ? 'none' : `1px solid ${color}30`,
                    }}>
                    {msg.content}
                  </div>
                  <p className="text-[8px] text-[#334155] mt-0.5 px-1">{isUser ? 'You' : selected?.name} · {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
              style={{ background: `${color}20`, color }}>
              {selected?.name?.charAt(0)}
            </div>
            <TypingIndicator color={color} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested starters */}
      {messages.length <= 1 && selected && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap shrink-0">
          {[
            `What is the most important lesson in ${selected.school}?`,
            `How do you approach a student who feels lost?`,
            `What is your philosophy on failure?`,
          ].map(q => (
            <button key={q} onClick={() => send(q)}
              className="text-[9px] px-2.5 py-1.5 rounded-xl border border-dashed transition-colors hover:opacity-80"
              style={{ borderColor: `${color}40`, color, background: `${color}08` }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#1e293b] bg-[#070b14] px-4 py-3 shrink-0">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Ask ${selected?.name || 'a character'}...`}
            rows={1}
            className="flex-1 bg-[#0a0f1e] border border-[#1e293b] rounded-2xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#334155] resize-none outline-none focus:border-[#334155] transition-colors"
            style={{ maxHeight: 120, minHeight: 40 }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
          />
          <button onClick={startListening} disabled={listening}
            className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shrink-0"
            style={{ borderColor: listening ? `${color}80` : '#1e293b', background: listening ? `${color}20` : '#0a0f1e' }}>
            {listening ? <MicOff size={14} style={{ color }} /> : <Mic size={14} className="text-[#64748b]" />}
          </button>
          <button onClick={() => send()} disabled={!input.trim() || loading || !selected}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
            style={{ background: input.trim() ? color : '#1e293b', color: input.trim() ? '#070b14' : '#475569' }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}