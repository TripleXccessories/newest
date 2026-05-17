import React from 'react';
import { motion } from 'framer-motion';
import { X, Unlock, Sparkles } from 'lucide-react';

export default function UnlockedInsight({ riddle, onClose }) {
  const AURA = '#00d4aa';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.92)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl border overflow-hidden relative"
        style={{ borderColor: `${AURA}50`, background: '#07080f' }}
        initial={{ scale: 0.88, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 80px ${AURA}08` }} />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: `${AURA}20` }}>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: `${AURA}15`, border: `1px solid ${AURA}40` }}
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <Unlock size={16} style={{ color: AURA }} />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-[#f1f5f9]">Insight Unlocked</p>
              <p className="text-[10px]" style={{ color: AURA }}>{riddle.unlock_label}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="relative px-5 py-6 space-y-4">
          {/* Solved badge */}
          <div className="flex items-center gap-2 text-xs" style={{ color: AURA }}>
            <Sparkles size={12} />
            <span>Delivered by <strong>{riddle.bot_name || 'Da PrEAChEr'}</strong> · Headmaster</span>
          </div>

          {/* Insight text */}
          <div className="p-4 rounded-xl border text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap" style={{ borderColor: `${AURA}20`, background: `${AURA}05` }}>
            {riddle.unlock_content}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{ background: `${AURA}20`, color: AURA, border: `1px solid ${AURA}40` }}
          >
            Close & Continue Learning
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}