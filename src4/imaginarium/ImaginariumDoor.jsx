import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImaginariumDoor({ phase, isOutOfService, onEnter, onBack }) {
  const isOpening = phase === 'opening';

  return (
    <div className="min-h-screen bg-[#030508] flex items-center justify-center overflow-hidden relative">
      {/* Hallway background */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #030508 0%, #070b14 40%, #0a0f1e 100%)',
          backgroundImage: `
            linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

      {/* Hallway perspective walls */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0a0f1e" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#070b14" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0a0f1e" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Floor */}
        <polygon points="0,100% 40%,55% 60%,55% 100%,100%" fill="url(#wallGrad)" opacity="0.6" />
        {/* Ceiling */}
        <polygon points="0,0 40%,45% 60%,45% 100%,0" fill="url(#wallGrad)" opacity="0.6" />
        {/* Floor line */}
        <line x1="0" y1="100%" x2="40%" y2="55%" stroke="rgba(0,212,170,0.06)" strokeWidth="1" />
        <line x1="100%" y1="100%" x2="60%" y2="55%" stroke="rgba(0,212,170,0.06)" strokeWidth="1" />
      </svg>

      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isOpening ? 1 : 0.4 }}
        transition={{ duration: 1.5 }}
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,170,0.12) 0%, transparent 60%)' }}
      />

      {/* Door */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          className="relative"
          animate={isOpening ? { scale: 1.15, y: -20 } : { scale: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          {/* Door frame */}
          <div className="relative"
            style={{ width: 200, height: 300 }}>
            {/* Frame */}
            <div className="absolute inset-0 rounded-t-full border-2 border-[#00d4aa]/30"
              style={{ background: 'linear-gradient(180deg, #0a0f1e, #070b14)' }} />

            {/* Door panels */}
            <motion.div
              className="absolute inset-2 rounded-t-full overflow-hidden"
              style={{ transformOrigin: 'left center' }}
              animate={isOpening ? { rotateY: -70, opacity: 0.3 } : { rotateY: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
              <div className="w-full h-full rounded-t-full border border-[#1e293b]"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 50%, #070b14 100%)' }}>
                {isOutOfService ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-3">🚫</div>
                      <p className="text-xs font-black text-[#ef4444] uppercase tracking-widest">Out of Service</p>
                      <p className="text-[9px] text-[#475569] mt-1">Contact faculty coordinator</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                    {/* Decorative panels */}
                    <div className="w-full border border-[#00d4aa]/20 rounded-xl p-3 text-center"
                      style={{ background: 'rgba(0,212,170,0.05)' }}>
                      <p className="text-[8px] font-mono text-[#00d4aa]/60 uppercase tracking-widest">Imaginarium</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border border-[#00d4aa]/30 flex items-center justify-center"
                      style={{ background: 'rgba(0,212,170,0.08)' }}>
                      <span className="text-2xl">🌌</span>
                    </div>
                    <div className="w-full border border-[#1e293b] rounded-xl p-2 text-center">
                      <p className="text-[8px] text-[#334155]">Academic · Sacred · Focused</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Door handle */}
            {!isOpening && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-[#00d4aa]/40"
                style={{ background: 'rgba(0,212,170,0.2)' }} />
            )}

            {/* Light spill from opening */}
            <AnimatePresence>
              {isOpening && (
                <motion.div
                  className="absolute inset-0 rounded-t-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,212,170,0.3) 0%, transparent 70%)' }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Smoke particles when opening */}
          <AnimatePresence>
            {isOpening && Array.from({ length: 12 }, (_, i) => (
              <motion.div key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 8 + i * 3, height: 8 + i * 3,
                  background: `rgba(0,212,170,${0.15 - i * 0.01})`,
                  left: '50%', top: '40%',
                  filter: 'blur(4px)',
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: -100 - Math.random() * 100,
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0.5],
                }}
                transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Door label */}
        <motion.div
          className="text-center"
          animate={isOpening ? { opacity: 0 } : { opacity: 1 }}
        >
          <p className="text-[10px] font-mono tracking-[0.4em] text-[#475569] uppercase mb-1">IINT Academy</p>
          <h2 className="text-2xl font-black text-[#f1f5f9]">The Imaginarium</h2>
          <p className="text-xs text-[#475569] mt-1">A sacred space for academic conversation with faculty</p>
        </motion.div>

        {/* CTA buttons */}
        <AnimatePresence>
          {phase === 'door' && !isOutOfService && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button onClick={onEnter}
                className="px-8 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', color: '#030508', boxShadow: '0 0 30px rgba(0,212,170,0.25)' }}>
                Open Door →
              </button>
              <button onClick={onBack}
                className="px-6 py-3 rounded-2xl text-sm font-bold border border-[#1e293b] text-[#64748b] hover:bg-[#1e293b] transition-colors">
                ← Back
              </button>
            </motion.div>
          )}
          {phase === 'door' && isOutOfService && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button onClick={onBack}
                className="px-8 py-3 rounded-2xl text-sm font-bold border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors">
                ← Return to Academy
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}