import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const MOOD_MAP = {
  happy: { emoji: '😊', color: '#00d4aa', label: 'Positive' },
  neutral: { emoji: '😐', color: '#64748b', label: 'Neutral' },
  frustrated: { emoji: '😤', color: '#f59e0b', label: 'Frustrated' },
  angry: { emoji: '😠', color: '#ef4444', label: 'Agitated' },
  sad: { emoji: '😔', color: '#60a5fa', label: 'Low' },
};

function detectMood(text) {
  const t = text.toLowerCase();
  if (/!{2,}|what the|why (won't|doesn't|can't)|ugh|seriously|come on/.test(t)) return 'frustrated';
  if (/angry|mad|hate|stupid|useless|terrible|awful/.test(t)) return 'angry';
  if (/sad|depressed|lonely|miss|hurt|cry/.test(t)) return 'sad';
  if (/great|awesome|love|perfect|amazing|thank|yes!/.test(t)) return 'happy';
  return 'neutral';
}

function MoodBadge({ mood }) {
  const m = MOOD_MAP[mood] || MOOD_MAP.neutral;
  return (
    <span className="flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: `${m.color}20`, color: m.color }}>
      {m.emoji} {m.label}
    </span>
  );
}

export default function BridgeChatPanel({ connection, settings, adActive, onAdClear }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: connection
        ? `Bridge established via ${connection.name}. Mode: ${connection.bridgeMode}. How can I help you today?`
        : 'Connect to a bridge node first, then I\'ll be ready.',
      ts: Date.now(), mood: 'neutral' }
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ttsOn, setTtsOn] = useState(settings?.voiceNarration ?? true);
  const [pendingResponse, setPendingResponse] = useState(null); // held during ad
  const [detectedMood, setDetectedMood] = useState('neutral');
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // When ad clears, deliver held response
  useEffect(() => {
    if (!adActive && pendingResponse) {
      setMessages(prev => [...prev, pendingResponse]);
      setPendingResponse(null);
      if (ttsOn) speak(pendingResponse.content);
    }
  }, [adActive]);

  const speak = (text) => {
    if (!ttsOn || settings?.dataSaver) return;
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1;
    window.speechSynthesis?.speak(u);
  };

  const buildSystemPrompt = (mood) => {
    const moodSensing = settings?.moodSensing;
    const attitudeMirror = settings?.attitudeMirror;
    const memory = settings?.memoryBank;

    let persona = `You are the Bridge Master AI — a calm, intelligent, multilingual communication bridge assistant. You help with translation, transcription, and conversation across languages and modes. Keep responses concise and helpful.`;

    if (moodSensing && mood === 'frustrated') {
      persona += ` The user seems frustrated. Acknowledge this gently and be extra patient and clear.`;
    }
    if (moodSensing && mood === 'angry') {
      persona += attitudeMirror
        ? ` The user is being aggressive. Calmly reflect this back to them once, then ask if they'd like to continue more constructively.`
        : ` The user sounds upset. Stay calm and de-escalate gently.`;
    }
    if (moodSensing && mood === 'sad') {
      persona += ` The user seems down. Offer brief emotional acknowledgment before getting to the task.`;
    }
    if (memory) {
      persona += ` You have memory of this conversation and can reference earlier context.`;
    }
    return persona;
  };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || !connection) return;
    setInput('');

    const mood = detectMood(msg);
    setDetectedMood(mood);

    const userMsg = { role: 'user', content: msg, ts: Date.now(), mood };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'Bridge'}: ${m.content}`).join('\n');
    const systemPrompt = buildSystemPrompt(mood);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nConversation so far:\n${history}\n\nUser: ${msg}\n\nBridge:`,
    }).catch(() => null);

    const reply = res?.response || res || 'Bridge is processing. Stand by.';
    const replyText = typeof reply === 'string' ? reply : JSON.stringify(reply);

    const assistantMsg = { role: 'assistant', content: replyText, ts: Date.now(), mood: 'neutral' };
    setLoading(false);

    // If ad is showing, hold the reply until it clears
    if (adActive) {
      setPendingResponse(assistantMsg);
      setMessages(prev => [...prev, {
        role: 'system',
        content: '⏸ Response ready — waiting for ad to complete...',
        ts: Date.now(),
      }]);
    } else {
      setMessages(prev => [...prev, assistantMsg]);
      speak(replyText);
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.onstart = () => setListening(true);
    r.onresult = e => { setInput(e.results[0][0].transcript); };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  };

  const saveTranscript = () => {
    const text = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bridge-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: connection ? '#00d4aa' : '#334155' }} />
          <p className="text-[10px] font-black text-[#94a3b8]">
            {connection ? `${connection.bridgeMode} · ${connection.name}` : 'Not connected'}
          </p>
          {settings?.moodSensing && <MoodBadge mood={detectedMood} />}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setTtsOn(v => !v)}
            className="w-7 h-7 rounded-lg bg-[#111827] flex items-center justify-center hover:bg-[#1e293b]">
            {ttsOn ? <Volume2 size={11} className="text-[#00d4aa]" /> : <VolumeX size={11} className="text-[#475569]" />}
          </button>
          <button onClick={saveTranscript}
            className="w-7 h-7 rounded-lg bg-[#111827] flex items-center justify-center hover:bg-[#1e293b]"
            title="Save transcript">
            <Download size={11} className="text-[#475569]" />
          </button>
        </div>
      </div>

      {/* Ad waiting notice */}
      <AnimatePresence>
        {adActive && pendingResponse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 py-2 text-[9px] text-[#f59e0b] border-b border-[#f59e0b]/20 bg-[#f59e0b]/05 flex items-center gap-2">
            <span className="animate-pulse">⏸</span>
            Bridge AI is waiting for ad to finish before responding...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';
            if (isSystem) return (
              <div key={i} className="text-center">
                <span className="text-[8px] text-[#334155] italic">{msg.content}</span>
              </div>
            );
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-[#00d4aa15] border border-[#00d4aa30] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[8px]">🌉</span>
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  isUser ? 'rounded-br-sm bg-[#1e293b] text-[#f1f5f9]' : 'rounded-bl-sm bg-[#00d4aa10] border border-[#00d4aa20] text-[#e2e8f0]'
                }`}>
                  {msg.content}
                  {isUser && msg.mood && settings?.moodSensing && (
                    <span className="block mt-1"><MoodBadge mood={msg.mood} /></span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00d4aa15] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
            </div>
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]"
                  animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#1e293b] px-4 py-3 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={connection ? 'Type or speak...' : 'Connect to a bridge node first...'}
          disabled={!connection}
          rows={1}
          className="flex-1 bg-[#111827] border border-[#1e293b] rounded-2xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#334155] resize-none outline-none focus:border-[#334155] disabled:opacity-40 transition-colors"
          style={{ maxHeight: 80, minHeight: 40 }}
          onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }}
        />
        <button onClick={startListening} disabled={listening || !connection}
          className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shrink-0 disabled:opacity-40"
          style={{ borderColor: listening ? '#00d4aa80' : '#1e293b', background: listening ? '#00d4aa20' : '#111827' }}>
          {listening ? <MicOff size={14} className="text-[#00d4aa]" /> : <Mic size={14} className="text-[#64748b]" />}
        </button>
        <button onClick={() => send()} disabled={!input.trim() || loading || !connection}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
          style={{ background: input.trim() && connection ? '#00d4aa' : '#1e293b', color: input.trim() && connection ? '#070b14' : '#475569' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}