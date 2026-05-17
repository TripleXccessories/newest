import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function TransitionScreen({ lesson, course, faculty, type, earnedBadge, onComplete }) {
  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setAutoAdvanceProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        clearInterval(timer);
        onComplete();
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const isIntro = type === 'intro';

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #0a0f1e 0%, #070b14 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      {/* Particle ambient */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{ background: faculty.color + '40', left: `${10 + i * 7}%`, top: `${20 + (i % 4) * 18}%` }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}

      <div className="text-center space-y-5 px-6 max-w-md">
        {/* Faculty avatar glow */}
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center text-5xl mx-auto"
          style={{
            background: `${faculty.color}15`,
            border: `2px solid ${faculty.color}50`,
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
        >
          <motion.span
            animate={isIntro ? { rotate: [0, -10, 10, 0] } : { scale: [1, 1.1, 1] }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            {faculty.emoji}
          </motion.span>
        </motion.div>

        {/* School level label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[10px] uppercase tracking-widest text-[#475569] mb-1">{lesson.school_level}</p>
          <h2 className="text-xl font-bold text-[#f1f5f9]">{lesson.title}</h2>
          <p className="text-sm mt-1" style={{ color: faculty.color }}>
            {isIntro ? `with ${lesson.faculty_name}` : earnedBadge ? `✨ ${earnedBadge.name} Earned!` : 'Lesson Complete'}
          </p>
        </motion.div>

        {/* Concept description */}
        <motion.p
          className="text-xs text-[#64748b] leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {isIntro
            ? `Prepare yourself. ${lesson.faculty_name} is about to reveal something that will change how you see the market.`
            : `Knowledge captured. The market will test this. You will be ready.`
          }
        </motion.p>

        {/* Auto-advance progress bar */}
        <motion.div
          className="w-full h-0.5 bg-[#1e293b] rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: faculty.color, width: `${autoAdvanceProgress}%` }}
          />
        </motion.div>

        <motion.button
          onClick={onComplete}
          className="text-xs text-[#475569] hover:text-[#f1f5f9] transition-colors flex items-center gap-1 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Skip <ChevronRight size={12} />
        </motion.button>
      </div>
    </motion.div>
  );
}