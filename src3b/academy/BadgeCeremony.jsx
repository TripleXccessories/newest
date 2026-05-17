import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function BadgeCeremony({ badge, onContinue }) {
  const color = badge?.color || '#f59e0b';

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: 'rgba(2, 4, 8, 0.97)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti-like particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            background: i % 3 === 0 ? color : i % 3 === 1 ? '#f1f5f9' : color + '80',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -60, 80],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 1.5, repeat: 2 }}
        />
      ))}

      <motion.div
        className="text-center space-y-6 max-w-sm"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mx-auto"
          style={{ background: `${color}15`, border: `3px solid ${color}` }}
          animate={{
            boxShadow: [`0 0 0px ${color}`, `0 0 50px ${color}70`, `0 0 0px ${color}`],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 2, repeat: 2 }}
        >
          {badge?.emoji || '🏆'}
        </motion.div>

        <div>
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color }}>Badge Unlocked</p>
          <h2 className="text-2xl font-bold text-[#f1f5f9]">{badge?.name}</h2>
          <p className="text-sm text-[#94a3b8] mt-2 leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
            "{badge?.ceremony_line}"
          </p>
        </div>

        <span
          className="px-3 py-1 rounded-full text-xs font-bold inline-block"
          style={{ background: `${color}20`, color }}
        >
          {badge?.rarity}
        </span>

        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold mx-auto transition-all"
          style={{ background: color, color: '#070b14' }}
        >
          Continue Your Journey <ChevronRight size={14} />
        </button>
      </motion.div>
    </motion.div>
  );
}