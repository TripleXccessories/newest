import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Sparkles, X, Eye, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RiddleChallenge({ riddle, onClose, onSolve }) {
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const AURA = '#a78bfa'; // Headmaster purple

  const handleSubmit = async () => {
    const guess = input.trim().toLowerCase();
    const correct = riddle.answer.trim().toLowerCase();

    if (guess === correct || correct.split('|').map(a => a.trim()).includes(guess)) {
      setSolved(true);
      // Increment global solve counter
      try {
        await base44.entities.RhymeScript.update(riddle.id, {
          times_solved: (riddle.times_solved || 0) + 1,
        });
      } catch (_) {}
      setTimeout(() => onSolve(riddle), 2200);
    } else {
      setWrong(true);
      setAttempts((a) => a + 1);
      setInput('');
      setTimeout(() => setWrong(false), 800);
      if (attempts >= 0) setShowHint(true); // show hint after first wrong
    }
  };

  const difficultyColor = { easy: '#00d4aa', medium: '#f59e0b', hard: '#ef4444' };
  const dc = difficultyColor[riddle.difficulty] || '#a78bfa';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.92)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border overflow-hidden relative"
        style={{ borderColor: `${AURA}50`, background: '#07080f' }}
        initial={{ scale: 0.88, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 60px ${AURA}10` }} />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: `${AURA}20` }}>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: `${AURA}15`, border: `1px solid ${AURA}40` }}
              animate={{ boxShadow: [`0 0 0px ${AURA}40`, `0 0 18px ${AURA}50`, `0 0 0px ${AURA}40`] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Scroll size={16} style={{ color: AURA }} />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-[#f1f5f9]">{riddle.bot_name || 'Da PrEAChEr'} speaks</p>
              <p className="text-[10px] text-[#64748b]">Headmaster's Riddle Challenge</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
              style={{ background: `${dc}20`, color: dc }}
            >
              {riddle.difficulty}
            </span>
            <button onClick={onClose} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Riddle body */}
        <div className="relative px-5 py-6 space-y-5">
          {/* Riddle text */}
          <div className="p-4 rounded-xl border" style={{ borderColor: `${AURA}20`, background: `${AURA}05` }}>
            <p className="text-sm leading-relaxed italic text-[#e2e8f0] text-center" style={{ fontFamily: 'Georgia, serif' }}>
              "{riddle.riddle}"
            </p>
          </div>

          {/* Unlock reward preview */}
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <Eye size={12} style={{ color: AURA }} />
            <span>Solve to unlock: </span>
            <span className="font-bold" style={{ color: AURA }}>{riddle.unlock_label}</span>
          </div>

          {/* Hint */}
          <AnimatePresence>
            {showHint && riddle.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}
              >
                <Lightbulb size={13} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#fbbf24]">{riddle.hint}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <AnimatePresence mode="wait">
            {!solved ? (
              <motion.div key="input" className="space-y-3">
                <motion.input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Your answer..."
                  className="w-full bg-[#0f172a] border rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none transition-all"
                  style={{ borderColor: wrong ? '#ef4444' : `${AURA}30` }}
                  animate={wrong ? { x: [-8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                />
                {wrong && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-[#ef4444]"
                  >
                    <AlertCircle size={12} /> Not quite. Think deeper, Scholar.
                  </motion.div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                  style={{ background: AURA, color: '#070b14' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={14} /> Submit Answer
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="solved"
                className="text-center space-y-3 py-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: '#00d4aa20', border: '2px solid #00d4aa' }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  <CheckCircle size={22} className="text-[#00d4aa]" />
                </motion.div>
                <p className="text-sm font-bold text-[#00d4aa]">The seal is broken. Knowledge unlocked.</p>
                <p className="text-xs text-[#64748b]">Revealing: {riddle.unlock_label}...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}