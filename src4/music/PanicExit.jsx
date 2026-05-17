import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PanicExit — Emergency scatter when the user interrupts.
 * Every character has a unique "oh no we got caught" line
 * then scrambles off screen in their own panicked way.
 * The Robot puts a lampshade on its head and side-shuffles off.
 */

const PANIC_LINES = [
  { id: 'lightbulb',   text: '💡 Oh no. OH NO. I was just... testing the lights. Yes.',    dir: 'up',   delay: 0   },
  { id: 'robot',       text: '🤖 *Places lampshade on head* I am a lamp. Just a lamp.',   dir: 'right',delay: 200 },
  { id: 'pathfinder',  text: '🗺️ THIS PATH LEADS OUT. IMMEDIATELY.',                       dir: 'left', delay: 400 },
  { id: 'weaver',      text: '🧵 I WAS NEVER HERE! THE LOOM! THE LOOOOOM!',               dir: 'up',   delay: 600 },
  { id: 'ember',       text: '🔥 Quick — nobody saw the phoenix. Nobody.',                 dir: 'right',delay: 800 },
  { id: 'analyst',     text: '🔮 Deleting all logs. This. Never. Happened.',               dir: 'left', delay: 1000},
  { id: 'conductor',   text: '⚡ The momentum... has shifted. To leaving.',                 dir: 'up',   delay: 1200},
  { id: 'dialectic',   text: '⚔️ I... retreat. Strategically.',                            dir: 'left', delay: 1400},
  { id: 'serpent',     text: '🐍 *Slithers away with 5000 years of dignity intact*',      dir: 'right',delay: 1600},
  { id: 'storm',       text: '🌩️ EMERGENCY STATIC DISCHARGE. REBOOTING. BYE.',            dir: 'up',   delay: 1800},
];

// Exit animation per direction
function getExitAnim(dir) {
  const map = {
    up:    { y: -300, rotate: -15 },
    left:  { x: -400 },
    right: { x: 400  },
  };
  return map[dir] || map.up;
}

function PanicBubble({ line, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="text-[10px] font-bold px-2 py-1 rounded-xl bg-[#0f172a]/95 border border-red-500/30 text-red-300 max-w-[140px] text-center"
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {line}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Lampshade Robot — special case
function LampshadeRobot() {
  return (
    <svg width="72" height="110" viewBox="0 0 72 110">
      {/* Lampshade on head */}
      <polygon points="36,2 12,32 60,32" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <ellipse cx="36" cy="32" rx="24" ry="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      {/* Eyes barely visible under shade */}
      <rect x="22" y="22" width="8" height="7" rx="2" fill="#00d4aa" opacity="0.5" />
      <rect x="42" y="22" width="8" height="7" rx="2" fill="#00d4aa" opacity="0.5" />
      {/* Body */}
      <rect x="12" y="38" width="48" height="40" rx="6" fill="#111827" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="22" y="46" width="28" height="18" rx="3" fill="#0f172a" stroke="#00d4aa" strokeWidth="1" opacity="0.7" />
      {/* Arms — stiff at sides, innocent-looking */}
      <rect x="2" y="40" width="10" height="30" rx="3" fill="#1e293b" />
      <rect x="60" y="40" width="10" height="30" rx="3" fill="#1e293b" />
      {/* Legs */}
      <rect x="18" y="78" width="14" height="22" rx="3" fill="#1e293b" />
      <rect x="40" y="78" width="14" height="22" rx="3" fill="#1e293b" />
      {/* Feet */}
      <rect x="14" y="96" width="22" height="8" rx="3" fill="#374151" />
      <rect x="36" y="96" width="22" height="8" rx="3" fill="#374151" />
    </svg>
  );
}

export default function PanicExit({ cast, robotPresent }) {
  const [shownLines, setShownLines] = useState([]);

  useEffect(() => {
    PANIC_LINES.forEach(pl => {
      if (pl.id === 'robot' && !robotPresent) return;
      const inCast = cast.some(c => c.id === pl.id) || pl.id === 'robot';
      if (!inCast && pl.id !== 'lightbulb') return;
      setTimeout(() => {
        setShownLines(v => [...v, pl.id]);
      }, pl.delay);
    });
  }, []);

  const castIds = cast.map(c => c.id);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PANIC_LINES.map((pl, idx) => {
        const isRobot = pl.id === 'robot';
        if (isRobot && !robotPresent) return null;
        if (!isRobot && !castIds.includes(pl.id) && pl.id !== 'lightbulb') return null;

        const xPct = 10 + (idx / PANIC_LINES.length) * 80;
        const isShown = shownLines.includes(pl.id);

        return (
          <motion.div
            key={pl.id}
            className="absolute bottom-20 flex flex-col items-center gap-1"
            style={{ left: `${xPct}%`, transform: 'translateX(-50%)' }}
            animate={isShown ? { ...getExitAnim(pl.dir), opacity: 0 } : { opacity: 1 }}
            transition={{
              duration: isRobot ? 2.0 : 1.0,
              delay: isShown ? 0.3 : 0,
              ease: isRobot ? 'linear' : [0.4, 0, 0.6, 1],
            }}
          >
            <PanicBubble line={pl.text} show={isShown} />
            {isRobot ? (
              <motion.div
                animate={isShown ? { x: [0, 20, -20, 20, -20, 300] } : {}}
                transition={{ duration: 2.0, ease: 'linear' }}
              >
                <LampshadeRobot />
              </motion.div>
            ) : (
              <div className="text-3xl">
                {getCharEmoji(pl.id)}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Big red "ABORT" flash */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black tracking-[0.4em] text-red-500/60 pointer-events-none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8] }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        ABORT ABORT ABORT
      </motion.div>
    </div>
  );
}

function getCharEmoji(id) {
  const map = {
    lightbulb: '💡', pathfinder: '🗺️', weaver: '🧵', ember: '🔥',
    analyst: '🔮', conductor: '⚡', dialectic: '⚔️', serpent: '🐍', storm: '🌩️',
  };
  return map[id] || '✨';
}