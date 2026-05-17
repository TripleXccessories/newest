import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle } from 'lucide-react';

// ACT 3: The Call — user chooses their path
const PATHS = [
  {
    id: 'oracle_path',
    label: 'Seek Knowledge',
    desc: 'I want to understand the markets deeply before I act.',
    color: '#00d4aa',
    visual: 'blue_light_trail',
    bot: 'DeepNeural Alpha V2',
    botTitle: 'The Guide',
  },
  {
    id: 'challenger_path',
    label: 'Forge Ahead',
    desc: 'I am ready. Point me at the opportunity and step aside.',
    color: '#f59e0b',
    visual: 'gold_energy_burst',
    bot: 'NeuralScalper X1',
    botTitle: 'The Accelerator',
  },
  {
    id: 'guide_path',
    label: 'Observe First',
    desc: 'Show me what this platform can do. I will decide my pace.',
    color: '#94a3b8',
    visual: 'silver_mist_reveal',
    bot: 'SwingMind Pro',
    botTitle: 'The Oracle',
  },
];

const RANDOM_NAMES = ['Apex', 'Vortex', 'Echo', 'Cipher', 'Nova', 'Raven', 'Atlas', 'Flux', 'Zenith', 'Sage'];

export default function IntroAct3({ userName, onComplete }) {
  const [chosen, setChosen] = useState(null);
  const [hovered, setHovered] = useState(null);

  const handleChoose = (path) => {
    setChosen(path);
    setTimeout(() => onComplete(path.id), 2500);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full w-full px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <AnimatePresence mode="wait">
        {!chosen ? (
          <motion.div
            key="choice"
            className="flex flex-col items-center gap-10 max-w-2xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <motion.p
                className="text-xs text-[#64748b] uppercase tracking-widest mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {userName}, the platform is ready.
              </motion.p>
              <motion.h2
                className="text-2xl font-bold text-[#f1f5f9]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Which path calls to you?
              </motion.h2>
            </div>

            <div className="grid gap-4 w-full">
              {PATHS.map((path, i) => (
                <motion.button
                  key={path.id}
                  onClick={() => handleChoose(path)}
                  onMouseEnter={() => setHovered(path.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-full p-5 rounded-xl border text-left transition-all relative overflow-hidden"
                  style={{
                    borderColor: hovered === path.id ? path.color : '#1e293b',
                    background: hovered === path.id ? `${path.color}08` : '#111827',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-[#f1f5f9] mb-1">{path.label}</p>
                      <p className="text-sm text-[#64748b]">{path.desc}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs font-medium" style={{ color: path.color }}>{path.botTitle}</p>
                      <p className="text-xs text-[#475569]">{path.bot}</p>
                    </div>
                  </div>
                  {/* Hover glow line */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5"
                    style={{ background: path.color }}
                    animate={{ width: hovered === path.id ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}
            </div>

            <motion.p
              className="text-xs text-[#334155]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Your choice shapes your starting experience. You can explore all paths later.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="confirmed"
            className="flex flex-col items-center gap-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl"
              style={{ borderColor: chosen.color, background: `${chosen.color}15` }}
              animate={{ boxShadow: [`0 0 0px ${chosen.color}40`, `0 0 40px ${chosen.color}40`, `0 0 0px ${chosen.color}40`] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✦
            </motion.div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: chosen.color }}>
                Path Chosen
              </p>
              <h2 className="text-2xl font-bold text-[#f1f5f9]">{chosen.label}</h2>
              <p className="text-sm text-[#64748b] mt-2">{chosen.botTitle} will guide your journey.</p>
            </div>
            <motion.p
              className="text-[#00d4aa] text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Entering the platform...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}