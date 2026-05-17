import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ARCHETYPE_COLORS = {
  Guide: '#f59e0b', Oracle: '#7c3aed', Catalyst: '#2dd4bf',
  Creator: '#f97316', Guardian: '#4ade80', Challenger: '#fb7185',
};

export default function HolographicSummon({ persona, summoned, color }) {
  if (!persona) return (
    <div className="flex items-center justify-center w-full h-full">
      <p className="text-[10px] text-[#334155] font-mono">← Select a faculty member to summon</p>
    </div>
  );

  const c = color || ARCHETYPE_COLORS[persona.archetype] || '#00d4aa';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Holographic rings */}
      <AnimatePresence>
        {summoned && [1, 2, 3].map(i => (
          <motion.div key={i}
            className="absolute rounded-full border pointer-events-none"
            style={{ borderColor: `${c}${30 - i * 8}`, width: 80 + i * 40, height: 80 + i * 40 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </AnimatePresence>

      {/* Summon particles */}
      <AnimatePresence>
        {summoned && Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          return (
            <motion.div key={`p${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{ width: 3, height: 3, background: c, filter: `blur(1px)` }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: Math.cos(angle) * (60 + Math.random() * 20),
                y: Math.sin(angle) * (40 + Math.random() * 15),
                opacity: [0, 0.8, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
          );
        })}
      </AnimatePresence>

      {/* Character hologram */}
      <AnimatePresence>
        {summoned && (
          <motion.div
            className="relative z-10 flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.3, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: 30 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            {/* Holographic figure */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: `drop-shadow(0 0 16px ${c}80)` }}
            >
              {/* SVG holographic silhouette */}
              <svg width="80" height="110" viewBox="0 0 80 110">
                <defs>
                  <radialGradient id={`holoGrad_${persona.id}`} cx="50%" cy="30%">
                    <stop offset="0%" stopColor={c} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={c} stopOpacity="0.3" />
                  </radialGradient>
                  <filter id="holoBlur">
                    <feGaussianBlur stdDeviation="0.8" />
                  </filter>
                </defs>
                {/* Translucent holographic body */}
                {/* Head */}
                <ellipse cx="40" cy="18" rx="14" ry="16"
                  fill={`url(#holoGrad_${persona.id})`} opacity="0.6" />
                {/* Eyes */}
                <ellipse cx="34" cy="16" rx="3" ry="2.5" fill={c} opacity="0.9" />
                <ellipse cx="46" cy="16" rx="3" ry="2.5" fill={c} opacity="0.9" />
                {/* Scan lines across face */}
                {[12, 16, 20].map(y => (
                  <line key={y} x1="27" y1={y} x2="53" y2={y} stroke={c} strokeWidth="0.4" opacity="0.3" />
                ))}
                {/* Body */}
                <rect x="28" y="35" width="24" height="38" rx="6"
                  fill={`url(#holoGrad_${persona.id})`} opacity="0.5" />
                {/* Chest detail */}
                <rect x="33" y="42" width="14" height="10" rx="3" fill={c} opacity="0.4" />
                {/* Neck */}
                <rect x="36" y="33" width="8" height="5" rx="2" fill={c} opacity="0.5" />
                {/* Arms */}
                <rect x="18" y="37" width="9" height="28" rx="4" fill={c} opacity="0.4" />
                <rect x="53" y="37" width="9" height="28" rx="4" fill={c} opacity="0.4" />
                {/* Legs */}
                <rect x="28" y="72" width="10" height="28" rx="4" fill={c} opacity="0.4" />
                <rect x="42" y="72" width="10" height="28" rx="4" fill={c} opacity="0.4" />
                {/* Horizontal scan lines */}
                {[38, 48, 58, 68, 78, 88, 98].map(y => (
                  <line key={y} x1="15" y1={y} x2="65" y2={y} stroke={c} strokeWidth="0.5" opacity="0.15" />
                ))}
                {/* Holographic flicker dots */}
                <circle cx="40" cy="52" r="3" fill={c} opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </motion.div>

            {/* Name badge */}
            <motion.div
              className="px-3 py-1 rounded-full border text-center"
              style={{ borderColor: `${c}40`, background: `${c}10` }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-[9px] font-black" style={{ color: c }}>{persona.name}</p>
              <p className="text-[7px] text-[#475569]">{persona.archetype} · {persona.school}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not yet summoned placeholder */}
      {!summoned && persona && (
        <motion.div
          className="flex flex-col items-center gap-2 opacity-30"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: c }}>
            <span className="text-lg font-black" style={{ color: c }}>{persona.name?.charAt(0)}</span>
          </div>
          <p className="text-[9px] font-mono" style={{ color: c }}>Ready to summon {persona.name}...</p>
        </motion.div>
      )}
    </div>
  );
}