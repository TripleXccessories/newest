import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ACT 2: The Assembly — bot reveals with signature lines
const BOTS = [
  { name: 'NeuralScalper X1', title: 'The Accelerator', color: '#f59e0b', signature: 'Speed is not a strategy. It is my nature.', icon: '⚡' },
  { name: 'SwingMind Pro', title: 'The Oracle', color: '#00d4aa', signature: 'The market whispers. I translate.', icon: '🔮' },
  { name: 'TrendCore Institutional', title: 'The Architect', color: '#3b82f6', signature: 'Institutions do not chase. They build. So do I.', icon: '🏛️' },
  { name: 'SentimentBot Alpha', title: 'The Sentinel', color: '#ec4899', signature: 'Before the price moves, the story changes. I read the story.', icon: '👁️' },
  { name: 'ML Arb Engine', title: 'The Challenger', color: '#a78bfa', signature: 'Inefficiency is temporary. I am not.', icon: '⚔️' },
  { name: 'DeepNeural Alpha V2', title: 'The Guide', color: '#00d4aa', signature: 'Ten years of market memory. One decision at a time.', icon: '🧠' },
];

const BOT_DISPLAY_TIME = 3500; // ms per bot

export default function IntroAct2({ onComplete }) {
  const [currentBot, setCurrentBot] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (currentBot < BOTS.length - 1) {
      const t = setTimeout(() => setCurrentBot((c) => c + 1), BOT_DISPLAY_TIME);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setShowAll(true);
        setTimeout(onComplete, 3000);
      }, BOT_DISPLAY_TIME);
      return () => clearTimeout(t);
    }
  }, [currentBot, onComplete]);

  const bot = BOTS[currentBot];

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {!showAll ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBot}
            className="flex flex-col items-center gap-6 text-center px-6 max-w-lg"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Bot icon with glow */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: `${bot.color}30` }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div
                className="relative w-24 h-24 rounded-full border-2 flex items-center justify-center text-4xl"
                style={{ borderColor: bot.color, background: `${bot.color}10` }}
              >
                {bot.icon}
              </div>
            </div>

            {/* Title */}
            <div>
              <motion.p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: bot.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {bot.title}
              </motion.p>
              <motion.h2
                className="text-2xl font-bold text-[#f1f5f9]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {bot.name}
              </motion.h2>
            </div>

            {/* Signature line */}
            <motion.p
              className="text-base text-[#94a3b8] italic leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              "{bot.signature}"
            </motion.p>

            {/* Bot counter */}
            <div className="flex gap-2 mt-4">
              {BOTS.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{ background: i <= currentBot ? bot.color : '#1e293b' }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        // All bots assembled view
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <p className="text-sm text-[#64748b] uppercase tracking-widest">The Assembly is complete.</p>
          <div className="flex flex-wrap justify-center gap-4 max-w-xl px-6">
            {BOTS.map((b, i) => (
              <motion.div
                key={b.name}
                className="w-12 h-12 rounded-full border flex items-center justify-center text-xl"
                style={{ borderColor: b.color, background: `${b.color}15` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                {b.icon}
              </motion.div>
            ))}
          </div>
          <motion.p
            className="text-[#00d4aa] text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Your team awaits your command.
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}