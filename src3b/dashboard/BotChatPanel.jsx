import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Send, Bot, Loader2, RotateCcw, MessageCircle } from 'lucide-react';

const STORAGE_KEY = (botId) => `iint_bot_chat_${botId}`;

const ARCHETYPE_STARTERS = {
  Guide:      ["What should I focus on today?", "Help me map my trading path.", "What's the first principle I need?"],
  Oracle:     ["What patterns are you seeing?", "Analyze my risk profile.", "What does the data say?"],
  Guardian:   ["How should I protect my capital?", "What's my max safe position?", "Review my drawdown risk."],
  Creator:    ["Help me build a strategy.", "What system should I use?", "Design a framework for me."],
  Challenger: ["Challenge my current thesis.", "What am I getting wrong?", "Stress-test my strategy."],
  Catalyst:   ["Where's the momentum right now?", "What should I be riding?", "Find me the next breakout."],
};

export default function BotChatPanel({ activeBot, archetypeColor }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const color = archetypeColor || '#00d4aa';
  const starters = ARCHETYPE_STARTERS[activeBot?.archetype] || ARCHETYPE_STARTERS.Guide;

  // Load persisted history
  useEffect(() => {
    if (!activeBot?.id) return;
    const saved = localStorage.getItem(STORAGE_KEY(activeBot.id));
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch { setMessages([]); }
    } else {
      setMessages([{
        role: 'bot',
        content: activeBot.default_greeting || `${activeBot.signature_line || `Greetings. I am ${activeBot.name}.`}`,
        ts: Date.now(),
      }]);
    }
  }, [activeBot?.id]);

  // Persist on change
  useEffect(() => {
    if (!activeBot?.id || !messages.length) return;
    localStorage.setItem(STORAGE_KEY(activeBot.id), JSON.stringify(messages.slice(-40)));
  }, [messages, activeBot?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg, ts: Date.now() }];
    setMessages(newMessages);
    setLoading(true);

    // Build context from recent messages
    const recentContext = newMessages.slice(-6).map(m => `${m.role === 'user' ? 'Student' : activeBot.name}: ${m.content}`).join('\n');

    const res = await base44.functions.invoke('generateFacultyDialogue', {
      faculty_name: activeBot.name,
      faculty_archetype: activeBot.archetype,
      faculty_school: activeBot.school,
      user_message: userMsg,
      context: recentContext,
      signature_line: activeBot.signature_line,
      role_title: activeBot.role_title,
    }).catch(() => null);

    const reply = res?.data?.dialogue || res?.data?.response || res?.data?.content
      || `${activeBot.signature_line || 'Let me think on that.'} — consider what you've learned about ${activeBot.school || 'trading'} and apply it here.`;

    setMessages(prev => [...prev, { role: 'bot', content: reply, ts: Date.now() }]);
    setLoading(false);
  };

  const clearHistory = () => {
    if (!activeBot?.id) return;
    localStorage.removeItem(STORAGE_KEY(activeBot.id));
    setMessages([{ role: 'bot', content: activeBot.default_greeting || `${activeBot.name} is ready. Ask me anything.`, ts: Date.now() }]);
  };

  if (!activeBot) return null;

  return (
    <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl flex flex-col overflow-hidden"
      style={{ borderColor: `${color}20`, height: 420 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl overflow-hidden border" style={{ borderColor: `${color}40` }}>
            {activeBot.avatar_url
              ? <img src={activeBot.avatar_url} alt={activeBot.name} className="w-full h-full object-cover object-top" />
              : <div className="w-full h-full flex items-center justify-center text-xs font-black" style={{ background: `${color}20`, color }}>{activeBot.name?.charAt(0)}</div>
            }
          </div>
          <div>
            <p className="text-xs font-bold text-[#f1f5f9]">{activeBot.name}</p>
            <p className="text-[9px]" style={{ color }}>{activeBot.role_title || activeBot.archetype}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse ml-1" />
        </div>
        <button onClick={clearHistory} className="text-[#334155] hover:text-[#f1f5f9] transition-colors" title="Clear history">
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5"
                  style={{ background: `${color}20` }}>
                  <Bot size={10} style={{ color }} />
                </div>
              )}
              <div className="max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
                style={msg.role === 'user'
                  ? { background: `${color}20`, color: '#f1f5f9', borderRadius: '16px 4px 16px 16px' }
                  : { background: '#111827', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: '4px 16px 16px 16px' }
                }>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-2 pl-7">
            <Loader2 size={11} className="animate-spin" style={{ color }} />
            <span className="text-[10px]" style={{ color }}>{activeBot.name} is thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts (when few messages) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
          {starters.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-[10px] px-2.5 py-1 rounded-full border transition-colors"
              style={{ borderColor: `${color}30`, color: `${color}cc`, background: `${color}08` }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#1e293b]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Ask ${activeBot.name}...`}
            className="flex-1 bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-opacity-60 transition-colors"
            style={{ '--tw-border-opacity': 1 }}
            disabled={loading}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: color }}>
            <Send size={12} className="text-[#070b14]" />
          </button>
        </div>
      </div>
    </div>
  );
}