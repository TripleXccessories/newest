import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ChevronRight } from 'lucide-react';

export default function MysteryThreadReveal({ thread, onContinue }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(2, 4, 12, 0.97)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Subtle thread lines */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: '1px',
            height: '40%',
            background: `linear-gradient(to bottom, transparent, #c084fc30, transparent)`,
            left: `${15 + i * 18}%`,
            top: '30%',
          }}
          animate={{ opacity: [0, 0.6, 0], scaleY: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      <motion.div
        className="w-full max-w-md text-center space-y-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: '#c084fc15', border: '1px solid #c084fc40' }}
          animate={{ boxShadow: ['0 0 0px #c084fc', '0 0 30px #c084fc40', '0 0 0px #c084fc'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Eye size={28} className="text-[#c084fc]" />
        </motion.div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#c084fc] mb-2">Mystery Thread Discovered</p>
          <h2 className="text-lg font-bold text-[#f1f5f9]">{thread.title}</h2>
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold border border-[#c084fc]/30 text-[#c084fc] hover:bg-[#c084fc]/10 transition-all"
          >
            Reveal the Thread
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p
              className="text-sm text-[#a78bfa] leading-relaxed italic px-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              "{thread.hint}"
            </p>
            <p className="text-[10px] text-[#475569]">This thread will weave through everything that follows.</p>
            <button
              onClick={onContinue}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold mx-auto transition-all"
              style={{ background: '#c084fc20', color: '#c084fc', border: '1px solid #c084fc40' }}
            >
              Continue <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}