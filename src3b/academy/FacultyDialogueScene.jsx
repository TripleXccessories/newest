import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Volume2, Loader2 } from 'lucide-react';

export default function FacultyDialogueScene({ lesson, faculty, generatedDialogue, onComplete }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [typing, setTyping] = useState(true);

  const lines = generatedDialogue?.lines || [
    { speaker: lesson.faculty_name, text: `Welcome. Today we explore: ${lesson.title}.` },
    { speaker: lesson.faculty_name, text: generatedDialogue?.intro || `Every concept has a foundation. Let me show you mine.` },
    { speaker: lesson.faculty_name, text: generatedDialogue?.core || `This is what the market reveals when you know where to look.` },
    { speaker: lesson.faculty_name, text: generatedDialogue?.close || `Remember this. It will serve you well.` },
  ];

  const currentLine = lines[lineIndex];
  const isLast = lineIndex >= lines.length - 1;

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setTyping(true);
    if (!currentLine?.text) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(currentLine.text.slice(0, i + 1));
      i++;
      if (i >= currentLine.text.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [lineIndex, currentLine?.text]);

  const handleNext = () => {
    if (typing) {
      // Fast-complete the line
      setDisplayedText(currentLine.text);
      setTyping(false);
      return;
    }
    if (isLast) {
      onComplete();
    } else {
      setLineIndex(i => i + 1);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #0a0f1e 0%, #070b14 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Ambient glow behind faculty */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${faculty.color}15 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="w-full max-w-lg space-y-6 relative">
        {/* Faculty avatar */}
        <motion.div
          className="flex items-end gap-4"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{
              background: `${faculty.color}15`,
              border: `2px solid ${faculty.color}40`,
              boxShadow: `0 0 24px ${faculty.color}20`,
            }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {faculty.emoji}
          </motion.div>

          <div>
            <p className="text-xs font-bold" style={{ color: faculty.color }}>{lesson.faculty_name}</p>
            <p className="text-[10px] text-[#475569]">{faculty.archetype} · {lesson.school_level}</p>
          </div>
        </motion.div>

        {/* Dialogue bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={lineIndex}
            className="p-5 rounded-2xl border"
            style={{ borderColor: `${faculty.color}30`, background: `${faculty.color}06` }}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className="text-sm text-[#e2e8f0] leading-relaxed"
              style={{ fontFamily: 'Georgia, serif', minHeight: '4rem' }}
            >
              {displayedText}
              {typing && <span className="animate-pulse ml-0.5" style={{ color: faculty.color }}>▍</span>}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Line progress & next */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {lines.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i <= lineIndex ? faculty.color : '#1e293b' }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: `${faculty.color}20`, color: faculty.color, border: `1px solid ${faculty.color}40` }}
          >
            {typing ? 'Read all' : isLast ? 'Understood' : 'Continue'} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}