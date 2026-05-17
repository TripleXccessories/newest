import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Send, Mic, MicOff, Volume2, VolumeX, RefreshCw, Info, ChevronDown, Sparkles, X, Save, Download } from 'lucide-react';
import HolographicSummon from '@/components/imaginarium/HolographicSummon';
import ImaginariumStrikeGuard from '@/components/imaginarium/ImaginariumStrikeGuard';
import CreatorSubscriptionGate from '@/components/imaginarium/CreatorSubscriptionGate';
import { hasCreatorAccess, isCompanionStoreUnlocked } from '@/lib/tierRules';

const ARCHETYPE_COLORS = {
  Guide: '#f59e0b', Oracle: '#7c3aed', Catalyst: '#2dd4bf',
  Creator: '#f97316', Guardian: '#4ade80', Challenger: '#fb7185',
};

const ACADEMIC_TOPICS = ['academy', 'course', 'lesson', 'school', 'learn', 'study', 'teach', 'grade', 'quiz', 'exam',
  'trading strategy', 'technical analysis', 'fundamentals', 'risk', 'chart', 'pattern', 'indicator', 'backtesting',
  'portfolio', 'education', 'curriculum', 'assignment', 'homework', 'concept', 'theory', 'principle', 'foundation'];

const OFF_TOPIC_PATTERNS = ['buy', 'sell', 'what stock', 'should i invest', 'which crypto', 'price prediction',
  'how are you', 'whats up', 'tell me a joke', 'favorite', 'dating', 'personal life', 'your family',
  'what do you think about', 'recommend me a stock', 'hot tip', 'moon', 'lambo'];

function isOffTopic(text) {
  const lower = text.toLowerCase();
  const hasOffTopic = OFF_TOPIC_PATTERNS.some(p => lower.includes(p));
  const hasAcademic = ACADEMIC_TOPICS.some(p => lower.includes(p));
  return hasOffTopic && !hasAcademic;
}

const RANDOM_QUESTIONS = (school) => [
  `What is the most important concept in ${school || 'trading'}?`,
  `How do I recognize a strong signal in ${school || 'the market'}?`,
  `What mindset separates good traders from great ones?`,
  `Explain the core principle of your school's approach to market analysis.`,
  `What common mistake should beginners avoid?`,
  `How does pattern recognition apply to ${school || 'my course level'}?`,
  `What does mastery in ${school || 'trading'} truly require?`,
];

export default function ImaginariumRoom({ user, onExit }) {
  const [personas, setPersonas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [summoned, setSummoned] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [strikeData, setStrikeData] = useState({}); // { personaId: strikeCount }
  const [userBanned, setUserBanned] = useState(false);
  const [disabledPersonas, setDisabledPersonas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('imaginarium_disabled') || '[]'); } catch { return []; }
  });
  const [progress, setProgress] = useState(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateMode, setGateMode] = useState('save');
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    base44.entities.BotPersona.filter({ status: 'draft' }, 'name', 50)
      .then(p => { setPersonas(p); if (p.length > 0) setSelected(p[0]); });
    if (user?.id) {
      base44.entities.UserProgress.filter({ user_id: user.id }).then(([p]) => { if (p) setProgress(p); });
    }
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Check if 5+ disabled = banned
  useEffect(() => {
    if (disabledPersonas.length >= 5) setUserBanned(true);
  }, [disabledPersonas]);

  const color = selected ? (ARCHETYPE_COLORS[selected.archetype] || '#64748b') : '#00d4aa';

  const speakText = (text) => {
    if (!ttsEnabled || !text) return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    window.speechSynthesis?.speak(utt);
  };

  const getStrikeCount = (personaId) => strikeData[personaId] || 0;

  const recordStrike = (personaId) => {
    const current = (strikeData[personaId] || 0) + 1;
    const updated = { ...strikeData, [personaId]: current };
    setStrikeData(updated);

    if (current >= 3) {
      // Disable this persona for this user
      const newDisabled = [...new Set([...disabledPersonas, personaId])];
      setDisabledPersonas(newDisabled);
      localStorage.setItem('imaginarium_disabled', JSON.stringify(newDisabled));
      return 'disabled';
    }
    return current;
  };

  const getOffTopicResponse = (strikesNow, persona) => {
    const name = persona?.name || 'I';
    if (strikesNow === 1) {
      return `This is the Imaginarium — a sacred academic space. My purpose here is purely educational. For market questions, trading tips, or personal conversations, visit the Faculty Sit-In or personal chat sections. This is where ${name} teaches, and I take that responsibility seriously. I hope you understand — it's about professionalism, knowing the right time and place. Shall we get back to your studies?`;
    }
    if (strikesNow === 2) {
      return `${name} explained it once, and I'll say it clearly: everyone here has the same rules. This room exists for academic growth. I value our connection, and that's exactly why I'm asking you to respect this space. If you keep pushing, it makes things awkward between us, and none of us want that. Consider this your second reminder. What academic question can I help you with?`;
    }
    if (strikesNow === 3) {
      return `Right. Is there anything else?`;
    }
    return `Right. Is there anything else?`;
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || !selected || !summoned) return;
    setInput('');

    const personaId = selected.id;
    const strikes = getStrikeCount(personaId);

    // Check if already at 3+ strikes — just ignore
    if (strikes >= 3) {
      setMessages(prev => [...prev,
        { role: 'user', content: msg, ts: Date.now() },
        { role: 'assistant', content: 'Right. Is there anything else?', ts: Date.now() + 1, mood: 'unimpressed' },
      ]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: msg, ts: Date.now() }]);
    setLoading(true);

    // Topic guard
    if (isOffTopic(msg)) {
      const newStrike = recordStrike(personaId);
      const response = getOffTopicResponse(newStrike, selected);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: response, ts: Date.now(), mood: newStrike >= 3 ? 'unimpressed' : 'firm', isWarning: true, strikeNum: newStrike }]);
        setLoading(false);
        speakText(response);
      }, 800);
      return;
    }

    // Normal academic response
    const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'Student' : selected.name}: ${m.content}`).join('\n');

    const systemContext = `You are ${selected.name}, a faculty member at IINT Academy — Archetype: ${selected.archetype}, School: ${selected.school}.
You are in the Imaginarium — a sacred, holographic academic space. You appear as a translucent holographic presence.
Only answer questions related to the academy curriculum, trading education, and academic growth.
If asked about personal topics or specific stock picks, redirect the student to the Faculty Sit-In.
Be warm, in character, and inspiring. Keep answers under 4 sentences unless asked for elaboration.
${selected.signature_line ? `Your signature: "${selected.signature_line}"` : ''}`;

    const res = await base44.functions.invoke('generateFacultyDialogue', {
      faculty_name: selected.name,
      faculty_archetype: selected.archetype,
      faculty_school: selected.school,
      user_message: msg,
      context: systemContext,
      conversation_history: history,
      signature_line: selected.signature_line,
    }).catch(() => null);

    const reply = res?.data?.dialogue || res?.data?.response || `${selected.name} considers your question carefully. "That is a worthy inquiry. Let us explore it together."`;

    setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
    setLoading(false);
    speakText(reply);
  };

  const summon = (persona) => {
    if (disabledPersonas.includes(persona.id)) return;
    setSelected(persona);
    setSummoned(false);
    setMessages([]);
    setShowSelector(false);
    setTimeout(() => {
      setSummoned(true);
      setMessages([{
        role: 'assistant',
        content: persona.default_greeting || `You summoned ${persona.name}. I am here for your academic questions. Ask wisely.`,
        ts: Date.now(),
      }]);
    }, 1800);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onresult = (e) => { setInput(e.results[0][0].transcript); };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  };

  const fillRandomQuestion = () => {
    const questions = RANDOM_QUESTIONS(selected?.school);
    setInput(questions[Math.floor(Math.random() * questions.length)]);
  };

  const handleSave = () => {
    const isFirstFree = !progress?.first_free_companion_used;
    if (isFirstFree) {
      // First companion is always free — allow save directly
      alert('First companion save is free! Your companion will be saved as your Career Change Course companion.');
      return;
    }
    const uniUnlocked = isCompanionStoreUnlocked(progress);
    const credits = progress?.companion_save_credits || 0;
    const slots = progress?.companion_slots_owned || 0;
    const slotsUsed = progress?.companion_slots_used || 0;
    const slotsRemaining = slots - slotsUsed;
    if (!uniUnlocked || !hasCreatorAccess(user?.subscription_tier)) {
      setGateMode('subscription');
    } else if (slotsRemaining <= 0) {
      setGateMode('no_slots');
    } else if (credits <= 0) {
      setGateMode('no_credits');
    } else {
      setGateMode('save');
    }
    setGateOpen(true);
  };

  const handleExport = () => {
    const uniUnlocked = isCompanionStoreUnlocked(progress);
    if (!uniUnlocked || !hasCreatorAccess(user?.subscription_tier)) {
      setGateMode('subscription');
      setGateOpen(true);
    } else {
      alert('Export feature — generates your companion card as a downloadable file.');
    }
  };

  const availablePersonas = personas.filter(p => !disabledPersonas.includes(p.id));

  if (userBanned) {
    return (
      <div className="min-h-screen bg-[#030508] flex items-center justify-center">
        <div className="text-center max-w-sm p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-black text-[#ef4444] mb-2">Imaginarium Closed</h2>
          <p className="text-sm text-[#64748b] mb-6">You have disrupted 5 or more faculty members. The Imaginarium is temporarily out of service for your account.</p>
          <button onClick={onExit} className="px-6 py-3 rounded-2xl text-sm font-bold border border-[#1e293b] text-[#64748b] hover:bg-[#1e293b] transition-colors">
            Return to Academy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9] flex flex-col relative overflow-hidden">
      {/* Cosmic dark background with twinkling nodes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Deep space */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, #050911 0%, #020408 100%)' }} />
        {/* Twinkling node stars */}
        {Array.from({ length: 80 }, (_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#00d4aa', '#60a5fa', '#a78bfa', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 5)],
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}
        {/* Dim overlay when summoning */}
        <motion.div className="absolute inset-0"
          animate={{ opacity: summoned ? 0.85 : 0.5 }}
          style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2,4,8,0.9) 100%)' }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-[#00d4aa]/10 bg-[#030508]/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-lg">🌌</span>
          <div>
            <p className="text-xs font-black text-[#f1f5f9]">The Imaginarium</p>
            <p className="text-[8px] text-[#334155] font-mono">Academic Holographic Space</p>
          </div>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all hover:scale-[1.02]"
          style={{ borderColor: 'rgba(0,212,170,0.3)', background: 'rgba(0,212,170,0.08)', color: '#00d4aa' }}
          title="Save Companion">
          <Save size={11} /> Save
        </button>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all hover:scale-[1.02]"
          style={{ borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)', color: '#a78bfa' }}
          title="Export Companion">
          <Download size={11} /> Export
        </button>
        <button onClick={() => setShowRules(v => !v)} className="w-8 h-8 rounded-xl bg-[#0a0f1e] border border-[#1e293b] flex items-center justify-center hover:border-[#334155]">
          <Info size={12} className="text-[#475569]" />
        </button>
        <button onClick={() => { setTtsEnabled(v => !v); window.speechSynthesis?.cancel(); }} className="w-8 h-8 rounded-xl bg-[#0a0f1e] border border-[#1e293b] flex items-center justify-center">
          {ttsEnabled ? <Volume2 size={12} style={{ color }} /> : <VolumeX size={12} className="text-[#475569]" />}
        </button>
        <button onClick={onExit} className="w-8 h-8 rounded-xl bg-[#0a0f1e] border border-[#1e293b] flex items-center justify-center">
          <X size={12} className="text-[#475569]" />
        </button>
      </div>

      {/* Rules panel */}
      <AnimatePresence>
        {showRules && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="relative z-10 bg-[#030508]/90 border-b border-[#1e293b] px-4 py-3 overflow-hidden">
            <p className="text-[10px] font-bold text-[#00d4aa] mb-2 uppercase tracking-widest">📜 Rules of the Imaginarium</p>
            <ul className="space-y-1 text-[10px] text-[#64748b]">
              <li>• This is a <strong className="text-[#f1f5f9]">sacred academic space</strong> — questions must relate to lessons, courses, and trading education.</li>
              <li>• For market tips, trading conversations, or personal chat — visit the <strong className="text-[#00d4aa]">Faculty Sit-In</strong>.</li>
              <li>• Each faculty member enforces a <strong className="text-[#fbbf24]">3-strike rule</strong> for off-topic questions.</li>
              <li>• Disrupting 5 faculty members closes the Imaginarium to your account.</li>
              <li>• Voice recognition is available — speak naturally and clearly.</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left: Faculty Selector */}
        <div className="w-64 border-r border-[#00d4aa]/10 bg-[#030508]/60 backdrop-blur-sm flex flex-col">
          <div className="p-3 border-b border-[#1e293b]">
            <p className="text-[9px] font-bold text-[#334155] uppercase tracking-widest mb-2">Summon Faculty</p>
            <button onClick={fillRandomQuestion}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-[1.02]"
              style={{ background: '#00d4aa10', border: '1px solid #00d4aa20', color: '#00d4aa' }}>
              <Sparkles size={11} /> Random Question
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {availablePersonas.map(p => {
              const c = ARCHETYPE_COLORS[p.archetype] || '#64748b';
              const strikes = getStrikeCount(p.id);
              const isSelected = selected?.id === p.id;
              return (
                <button key={p.id} onClick={() => summon(p)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all hover:scale-[1.01]"
                  style={{ borderColor: isSelected ? `${c}50` : '#1e293b', background: isSelected ? `${c}10` : 'transparent' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                    style={{ background: `${c}20`, color: c }}>
                    {p.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#f1f5f9] truncate">{p.name}</p>
                    <p className="text-[8px] truncate" style={{ color: c }}>{p.archetype}</p>
                  </div>
                  {strikes > 0 && (
                    <div className="text-[8px] font-bold px-1 py-0.5 rounded"
                      style={{ background: strikes >= 2 ? '#ef444420' : '#fbbf2420', color: strikes >= 2 ? '#ef4444' : '#fbbf24' }}>
                      {strikes}⚡
                    </div>
                  )}
                </button>
              );
            })}
            {disabledPersonas.length > 0 && (
              <div className="pt-2 mt-2 border-t border-[#1e293b]">
                <p className="text-[8px] text-[#334155] px-2 mb-1">Unavailable ({disabledPersonas.length})</p>
                {personas.filter(p => disabledPersonas.includes(p.id)).map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl opacity-30">
                    <div className="w-6 h-6 rounded-lg bg-[#1e293b] flex items-center justify-center text-[10px] font-bold text-[#475569]">
                      {p.name?.charAt(0)}
                    </div>
                    <p className="text-[10px] text-[#334155] line-through">{p.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Holographic Stage + Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Holographic character stage */}
          <div className="relative flex items-center justify-center" style={{ height: 200 }}>
            <HolographicSummon persona={selected} summoned={summoned} color={color} />
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5"
                        style={{ background: `${color}20`, color, opacity: 0.8 }}>
                        {selected?.name?.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-[75%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                      style={{
                        background: isUser ? 'rgba(30,41,59,0.8)' : msg.isWarning ? 'rgba(234,179,8,0.08)' : `${color}12`,
                        color: isUser ? '#f1f5f9' : '#e2e8f0',
                        border: isUser ? 'none' : `1px solid ${msg.isWarning ? 'rgba(234,179,8,0.3)' : `${color}25`}`,
                        backdropFilter: 'blur(10px)',
                      }}>
                      {msg.isWarning && <span className="text-[9px] font-bold text-[#fbbf24] block mb-1">⚡ Strike {msg.strikeNum} of 3</span>}
                      {msg.content}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                </div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: color }}
                      animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-[#00d4aa]/10 bg-[#030508]/80 backdrop-blur-sm px-4 py-3">
            {!summoned && (
              <p className="text-center text-[10px] text-[#334155] mb-2">Select a faculty member to summon them into the Imaginarium</p>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={summoned ? `Ask ${selected?.name || ''}...` : 'Summon a faculty member first...'}
                disabled={!summoned}
                rows={1}
                className="flex-1 bg-[#0a0f1e]/60 border border-[#1e293b] rounded-2xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#334155] resize-none outline-none focus:border-[#334155] disabled:opacity-40 backdrop-blur-sm transition-colors"
                style={{ maxHeight: 100, minHeight: 40 }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
              />
              <button onClick={startListening} disabled={listening || !summoned}
                className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shrink-0 disabled:opacity-40"
                style={{ borderColor: listening ? `${color}80` : '#1e293b', background: listening ? `${color}20` : '#0a0f1e' }}>
                {listening ? <MicOff size={14} style={{ color }} /> : <Mic size={14} className="text-[#64748b]" />}
              </button>
              <button onClick={() => send()} disabled={!input.trim() || loading || !summoned}
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
                style={{ background: input.trim() && summoned ? color : '#1e293b', color: input.trim() && summoned ? '#070b14' : '#475569' }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Subscription Gate */}
      <CreatorSubscriptionGate
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        mode={gateMode}
        savesRemaining={progress?.companion_save_credits || 0}
        slotsRemaining={(progress?.companion_slots_owned || 0) - (progress?.companion_slots_used || 0)}
        isFirstFreeCompanion={!progress?.first_free_companion_used}
        isUnlocked={isCompanionStoreUnlocked(progress)}
        onPurchase={(packId) => {
          // Stripe integration hook — for now log intent
          console.log('Purchase pack:', packId);
          setGateOpen(false);
          alert('Stripe checkout for save packs — coming at launch. Pack: ' + packId);
        }}
      />
    </div>
  );
}