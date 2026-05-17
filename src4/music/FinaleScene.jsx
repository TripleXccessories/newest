import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FinaleScene — The whole cast claps, cheers, then realizes they need to
 * get back to "the secret project" and starts making excuses to leave.
 */

const CHEER_LINES = [
  { id: 'lightbulb',  text: '✨ That was INCREDIBLE!',             delay: 0 },
  { id: 'weaver',     text: '🎉 THE BEST REMIX I\'VE EVER HEARD!', delay: 1200 },
  { id: 'conductor',  text: '⚡ The rhythm was *chef\'s kiss*',      delay: 2400 },
  { id: 'ember',      text: '🔥 I am REBORN by that beat!',         delay: 3600 },
  { id: 'analyst',    text: '🔮 Peak BPM data. Peak.',              delay: 4800 },
  { id: 'pathfinder', text: '🗺️ Destination: vibe achieved.',       delay: 6000 },
  { id: 'serpent',    text: '🐍 In millennia, this is a top 5.',    delay: 7200 },
  { id: 'dialectic',  text: '⚔️ I cannot argue with that drop.',    delay: 8000 },
  { id: 'storm',      text: '🌩️ THE WHOLE GRID FELT THAT.',         delay: 8800 },
];

const EXCUSE_LINES = [
  { id: 'lightbulb',  text: '💡 Anyway... the secret project won\'t build itself!', delay: 0 },
  { id: 'weaver',     text: '🧵 I was never here. The loom calls.',                 delay: 800 },
  { id: 'conductor',  text: '⚡ Back to the momentum engine. Bye.',                  delay: 1400 },
  { id: 'ember',      text: '🔥 ...This didn\'t happen.',                           delay: 1900 },
  { id: 'analyst',    text: '🔮 Data classified. Returning to post.',               delay: 2300 },
  { id: 'pathfinder', text: '🗺️ New path: away from here. Fast.',                   delay: 2700 },
  { id: 'serpent',    text: '🐍 Ancient oath of silence invoked.',                  delay: 3000 },
  { id: 'dialectic',  text: '⚔️ You saw nothing.',                                  delay: 3300 },
  { id: 'storm',      text: '🌩️ SYSTEM NEVER ACTIVATED. BYE.',                     delay: 3600 },
];

export default function FinaleScene({ cast }) {
  const [phase, setPhase] = useState('cheering'); // cheering → excuses
  const [visibleCheers, setVisibleCheers] = useState([]);
  const [visibleExcuses, setVisibleExcuses] = useState([]);

  useEffect(() => {
    // Show cheers sequentially
    CHEER_LINES.forEach(line => {
      setTimeout(() => {
        setVisibleCheers(v => [...v, line.id]);
      }, line.delay);
    });

    // Switch to excuses phase after cheers
    const switchTimer = setTimeout(() => {
      setPhase('excuses');
      EXCUSE_LINES.forEach(line => {
        setTimeout(() => {
          setVisibleExcuses(v => [...v, line.id]);
        }, line.delay);
      });
    }, 9500);

    return () => clearTimeout(switchTimer);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-end pb-32 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti burst */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              width: 8, height: 8,
              background: ['#fbbf24','#00d4aa','#a78bfa','#f87171','#fb7185'][i % 5],
              left: `${Math.random() * 100}%`,
              top: -10,
            }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, 720], opacity: [1, 0.8, 0] }}
            transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Speech bubbles column */}
      <div className="flex flex-col gap-1 items-center max-h-64 overflow-hidden">
        <AnimatePresence>
          {phase === 'cheering' && visibleCheers.map(id => {
            const line = CHEER_LINES.find(l => l.id === id);
            return (
              <motion.div
                key={`cheer-${id}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0f172a]/90 border border-[#fbbf24]/30 text-[#f1f5f9] text-center"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {line?.text}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'excuses' && visibleExcuses.map(id => {
            const line = EXCUSE_LINES.find(l => l.id === id);
            return (
              <motion.div
                key={`excuse-${id}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0f172a]/90 border border-[#475569]/30 text-[#94a3b8] text-center italic"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {line?.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}