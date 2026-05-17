import React from 'react';
import { ChevronRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import BotCharacter3D from '@/components/bots/BotCharacter3D';

export default function FacultyCard({ faculty, hasActiveGoal, onClick }) {
  // Map faculty data to the shape BotCharacter3D expects
  const botShape = {
    archetype: faculty.archetype,
    primary_color: faculty.color,
  };

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left bg-[#111827] border rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{ borderColor: hasActiveGoal ? `${faculty.color}60` : '#1e293b' }}
      whileHover={{ borderColor: `${faculty.color}50` }}
    >
      <div className="flex items-center gap-4">
        {/* 3D animated character */}
        <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 64, height: 64 }}>
          <BotCharacter3D bot={botShape} size={64} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-[#f1f5f9]">{faculty.name}</p>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: `${faculty.color}20`, color: faculty.color }}
            >
              {faculty.archetype}
            </span>
            {hasActiveGoal && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f59e0b]/20 text-[#f59e0b] flex items-center gap-1">
                <Target size={9} /> Active Goal
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">{faculty.subject}</p>
          <p className="text-xs text-[#475569] mt-1 italic line-clamp-1">"{faculty.tagline}"</p>
        </div>

        <ChevronRight size={16} className="text-[#475569] flex-shrink-0" />
      </div>
    </motion.button>
  );
}