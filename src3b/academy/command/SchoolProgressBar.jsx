import React from 'react';
import { motion } from 'framer-motion';

const LEVELS = [
  { label: 'Kindergarten', color: '#00d4aa', emoji: '🌱' },
  { label: 'Grade School',  color: '#60a5fa', emoji: '📚' },
  { label: 'Mid Grade',     color: '#a78bfa', emoji: '🔭' },
  { label: 'Junior High',   color: '#f59e0b', emoji: '⚡' },
  { label: 'High School',   color: '#fb7185', emoji: '🏆' },
  { label: 'University',    color: '#f97316', emoji: '🎓' },
];

export default function SchoolProgressBar({ currentLevel, completedLessons = [], totalByLevel = {} }) {
  const currentIdx = LEVELS.findIndex(l => l.label === currentLevel);

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-4">
      <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">School Level Progress</p>

      <div className="relative">
        {/* Track line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#1e293b]" />
        <motion.div
          className="absolute top-4 left-4 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #00d4aa, #f97316)' }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, (currentIdx / (LEVELS.length - 1)) * 100)}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between">
          {LEVELS.map((level, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            const count = totalByLevel[level.label] || 0;
            return (
              <div key={level.label} className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all"
                  style={{
                    background: done || active ? `${level.color}20` : '#0a0f1e',
                    borderColor: done || active ? level.color : '#1e293b',
                    boxShadow: active ? `0 0 12px ${level.color}50` : 'none',
                  }}
                >
                  {done ? '✓' : level.emoji}
                </div>
                <p className="text-[8px] text-center font-bold leading-tight max-w-[50px]"
                  style={{ color: done || active ? level.color : '#334155' }}>
                  {level.label}
                </p>
                {count > 0 && (
                  <span className="text-[8px]" style={{ color: level.color }}>{count}L</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}