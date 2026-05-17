import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles, Trophy } from 'lucide-react';
import { ACHIEVEMENT_BADGES } from '@/components/leaderboard/BadgeShowcase';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const QUICK_PROMPTS = [
  "What's my current total exposure?",
  "Which trade lost me the most money?",
  "What's my overall win rate?",
  "What are my top performing assets?",
  "Which badges can I realistically earn next?",
];

function buildContext(trades, journals, profile) {
  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');
  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const totalExposure = openTrades.reduce((s, t) => s + (t.entry_price || 0) * (t.quantity || 0), 0);
  const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(1) : 'N/A';

  const tradesStr = trades.slice(0, 12).map(t =>
    `${t.ticker} ${t.trade_type?.toUpperCase()} | qty:${t.quantity} @ $${t.entry_price} | PnL: ${t.pnl >= 0 ? '+' : ''}$${(t.pnl || 0).toFixed(2)} (${(t.pnl_percent || 0).toFixed(2)}%) | status: ${t.status}`
  ).join('\n');

  const journalStr = journals.slice(0, 6).map(j =>
    `${j.ticker} | emotion: ${j.emotion} | tag: ${j.lesson_tag} | note: "${j.note?.slice(0, 80)}"`
  ).join('\n');

  return `USER PORTFOLIO CONTEXT:
Virtual Balance: $${(profile?.virtual_balance || 100000).toLocaleString()}
Total P&L: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}
Open Positions: ${openTrades.length} | Total Exposure: $${totalExposure.toLocaleString()}
Win Rate (closed): ${winRate}% (${wins}/${closedTrades.length} trades)

RECENT TRADES:
${tradesStr || 'No trades yet.'}

TRADE JOURNAL ENTRIES:
${journalStr || 'No journal entries yet.'}`;
}

export default function AITradingAssistant({ user }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your AI Trading Assistant. Ask me anything about your portfolio, performance, or trades — like *'Why did I lose on NVDA?'* or *'What's my total exposure?'*" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState([]);
  const [journals, setJournals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    if (dataLoaded) return;
    const [t, j, p] = await Promise.all([
      base44.entities.Trade.list('-created_date', 50).catch(() => []),
      base44.entities.TradeJournal.list('-created_date', 20).catch(() => []),
      base44.entities.UserProfile.list('-created_date', 1).then(([p]) => p).catch(() => null),
    ]);
    setTrades(t);
    setJournals(j);
    setProfile(p);
    setDataLoaded(true);
    return { t, j, p };
  };

  const handleOpen = async () => {
    setOpen(true);
    setMinimized(false);
    await loadData();
  };

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    let ctx;
    if (!dataLoaded) {
      const data = await loadData();
      ctx = buildContext(data.t, data.j, data.p);
    } else {
      ctx = buildContext(trades, journals, profile);
    }

    // Build badge context for badge-related questions
    const badgeCtx = ACHIEVEMENT_BADGES.map(b =>
      `${b.emoji} "${b.name}" (${b.rarity}): ${b.desc} — trigger: ${b.trigger} >= ${b.threshold}`
    ).join('\n');

    const answer = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an elite AI Trading Assistant for the IINT platform. Answer the user's question about their portfolio using ONLY the data provided.

${ctx}

AVAILABLE ACHIEVEMENT BADGES (suggest these based on user's current stats):
${badgeCtx}

USER QUESTION: ${q}

Instructions:
- Be concise and direct (3-4 sentences max unless detail is needed)
- Reference specific tickers, numbers, and percentages from the data
- If asked about badges, analyze which ones the user is closest to earning based on their stats and suggest 2-3 realistic next goals
- If the data doesn't support the answer, say so honestly
- Use markdown for numbers/highlights
- Don't make up data that isn't in the context`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <motion.button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#00d4aa] text-[#070b14] shadow-2xl flex items-center justify-center hover:bg-[#00d4aa]/90 transition-colors"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          title="AI Trading Assistant"
        >
          <Bot size={24} />
        </motion.button>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 flex flex-col"
            style={{ width: 360, height: minimized ? 56 : 520 }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex flex-col h-full bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#1e293b] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#00d4aa]/20 flex items-center justify-center">
                    <Bot size={14} className="text-[#00d4aa]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#f1f5f9]">IINT Trading Assistant</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
                      <p className="text-[9px] text-[#475569]">Online · Portfolio-aware AI</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setMinimized(v => !v)} className="text-[#475569] hover:text-[#94a3b8] p-1">
                    {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                  </button>
                  <button onClick={() => setOpen(false)} className="text-[#475569] hover:text-[#94a3b8] p-1">
                    <X size={13} />
                  </button>
                </div>
              </div>

              {!minimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#00d4aa] text-[#070b14] font-medium'
                            : 'bg-[#1e293b] text-[#e2e8f0]'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <ReactMarkdown className="prose prose-xs prose-invert max-w-none [&>p]:my-0.5 [&>*:first-child]:mt-0">
                              {msg.content}
                            </ReactMarkdown>
                          ) : msg.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-[#1e293b] rounded-2xl px-3 py-2.5 flex items-center gap-1.5">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#475569]"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Quick prompts */}
                  {messages.length <= 1 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                      {QUICK_PROMPTS.map(q => (
                        <button key={q} onClick={() => send(q)} className="px-2.5 py-1 rounded-full text-[10px] bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9] transition-colors border border-[#334155]">
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-3 border-t border-[#1e293b] flex gap-2 flex-shrink-0">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask about your portfolio..."
                      className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
                    />
                    <button
                      onClick={() => send()}
                      disabled={!input.trim() || loading}
                      className="w-8 h-8 rounded-xl bg-[#00d4aa] text-[#070b14] flex items-center justify-center hover:bg-[#00d4aa]/90 disabled:opacity-40 transition-colors"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}