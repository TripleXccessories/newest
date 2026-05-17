import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import IINTLogo from '@/components/layout/IINTLogo';

// ACT 1: The Awakening — world reveal and hook (~15s auto-advance)
export default function IntroAct1({ userName, onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 15000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full w-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Particle-like background dots */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-[#00d4aa]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              delay: Math.random() * 8,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6 max-w-2xl">
        {/* Logo reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
        >
          <IINTLogo size="xl" />
        </motion.div>

        {/* Opening narration */}
        <motion.p
          className="text-lg text-[#94a3b8] font-light italic leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1.2 }}
        >
          "The infinite does not begin. It remembers."
        </motion.p>

        {/* Welcome */}
        {userName && (
          <motion.p
            className="text-2xl font-bold text-[#f1f5f9]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5, duration: 1 }}
          >
            Welcome, <span className="text-[#00d4aa]">{userName}</span>.
          </motion.p>
        )}

        <motion.p
          className="text-sm text-[#64748b] max-w-md leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 7, duration: 1.2 }}
        >
          What you are about to enter is not just a platform.<br />
          It is an intelligence. Built to move with you.
        </motion.p>

        {/* Progress line */}
        <motion.div
          className="w-48 h-px bg-[#1e293b] relative overflow-hidden mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 9 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-[#00d4aa]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 9, duration: 5.5, ease: 'linear' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}