import React from 'react';
import { motion } from 'framer-motion';

// Visual strike indicator component — shows strike count for current persona
export default function ImaginariumStrikeGuard({ strikeCount, maxStrikes = 3, color = '#fbbf24' }) {
  if (!strikeCount) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-xl"
      style={{ background: strikeCount >= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.12)', border: `1px solid ${strikeCount >= 3 ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.25)'}` }}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxStrikes }, (_, i) => (
          <div key={i} className="w-2 h-2 rounded-full"
            style={{ background: i < strikeCount ? (strikeCount >= 3 ? '#ef4444' : '#fbbf24') : '#1e293b' }} />
        ))}
      </div>
      <span className="text-[8px] font-bold" style={{ color: strikeCount >= 3 ? '#ef4444' : '#fbbf24' }}>
        {strikeCount >= 3 ? 'FINAL WARNING' : `Strike ${strikeCount}/${maxStrikes}`}
      </span>
    </motion.div>
  );
}