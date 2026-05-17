import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIMentorSidebar({ trade, emotion, note, lessonTag, journalHistory }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const analyze = async () => {
    setLoading(true);
    setFeedback(null);

    const historyStr = (journalHistory || []).slice(0, 8).map(j =>
      `${j.ticker} ${j.trade_type?.toUpperCase()} | P&L: ${j.pnl >= 0 ? '+' : ''}$${j.pnl?.toFixed(2)} | Emotion: ${j.emotion} | Tag: ${j.lesson_tag}`
    ).join('\n') || 'No prior history.';

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an elite AI trading mentor and behavioral finance coach. Analyze this trader's journal entry:

CURRENT TRADE:
- Ticker: ${trade?.ticker}, Direction: ${trade?.trade_type?.toUpperCase()}
- Entry: $${trade?.entry_price}, P&L: ${trade?.pnl >= 0 ? '+' : ''}$${trade?.pnl?.toFixed(2)} (${trade?.pnl_percent?.toFixed(2)}%)
- Emotional state: ${emotion || 'not specified'}
- What they said: "${note || 'no note'}"
- Lesson tag: ${lessonTag}

HISTORICAL JOURNAL (last 8 trades):
${historyStr}

Provide sharp, personalized post-game coaching. Identify psychological biases (FOMO, revenge trading, overconfidence, fear, etc.), technical errors, and patterns across their history. Be direct and specific — reference actual data.

Return JSON with:
- bias_detected: main psychological bias name or "None"
- bias_explanation: 1 concise sentence explaining the bias
- technical_feedback: 1 sentence on entry/exit/sizing quality
- pattern_warning: 1 sentence on a concerning pattern from history (or "No pattern detected")
- encouragement: 1 sentence of genuine positive reinforcement
- action_item: one specific actionable improvement for next trade`,
      response_json_schema: {
        type: 'object',
        properties: {
          bias_detected: { type: 'string' },
          bias_explanation: { type: 'string' },
          technical_feedback: { type: 'string' },
          pattern_warning: { type: 'string' },
          encouragement: { type: 'string' },
          action_item: { type: 'string' },
        }
      }
    });
    setFeedback(res);
    setLoading(false);
  };

  const hasBias = feedback?.bias_detected && feedback.bias_detected !== 'None';

  return (
    <div className="border border-[#a78bfa]/20 rounded-xl overflow-hidden bg-[#0a0f1a]">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#a78bfa]/5 transition-colors"
      >
        <span className="text-xs font-bold text-[#a78bfa] flex items-center gap-1.5">
          <Brain size={13} /> AI Mentor · Post-Game Analysis
        </span>
        {expanded ? <ChevronUp size={13} className="text-[#475569]" /> : <ChevronDown size={13} className="text-[#475569]" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {!feedback && !loading && (
                <div className="text-center py-3">
                  <p className="text-[11px] text-[#475569] mb-3">Get personalized coaching based on this trade and your full trade history.</p>
                  <button
                    onClick={analyze}
                    disabled={!emotion}
                    className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-lg text-xs font-bold bg-[#a78bfa] text-[#070b14] hover:bg-[#a78bfa]/90 transition-colors disabled:opacity-40"
                  >
                    <Sparkles size={11} /> Analyze My Trade
                  </button>
                  {!emotion && <p className="text-[10px] text-[#475569] mt-1.5">Select your emotion above first</p>}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="w-4 h-4 border-2 border-[#a78bfa]/20 border-t-[#a78bfa] rounded-full animate-spin" />
                  <span className="text-xs text-[#a78bfa]">Analyzing your psychology...</span>
                </div>
              )}

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2.5"
                >
                  {/* Bias */}
                  <div className={`p-2.5 rounded-lg border ${hasBias ? 'border-[#f59e0b]/30 bg-[#f59e0b]/5' : 'border-[#00d4aa]/20 bg-[#00d4aa]/5'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: hasBias ? '#f59e0b' : '#00d4aa' }}>
                      {hasBias ? `⚠ Bias: ${feedback.bias_detected}` : '✓ No Bias Detected'}
                    </p>
                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">{feedback.bias_explanation}</p>
                  </div>

                  {/* Technical */}
                  <div className="p-2.5 rounded-lg border border-[#1e293b] bg-[#111827]">
                    <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Technical</p>
                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">{feedback.technical_feedback}</p>
                  </div>

                  {/* Pattern */}
                  {feedback.pattern_warning && feedback.pattern_warning !== 'No pattern detected' && (
                    <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Pattern Alert</p>
                      <p className="text-[11px] text-[#94a3b8] leading-relaxed">{feedback.pattern_warning}</p>
                    </div>
                  )}

                  {/* Action + encouragement */}
                  <div className="p-2.5 rounded-lg border border-[#a78bfa]/20 bg-[#a78bfa]/5">
                    <p className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider mb-1">Next Trade Action</p>
                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">{feedback.action_item}</p>
                  </div>

                  <p className="text-[11px] text-[#64748b] italic border-l-2 border-[#00d4aa]/30 pl-2">{feedback.encouragement}</p>

                  <button onClick={analyze} className="flex items-center gap-1 text-[10px] text-[#475569] hover:text-[#a78bfa] transition-colors">
                    <RefreshCw size={10} /> Re-analyze
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}