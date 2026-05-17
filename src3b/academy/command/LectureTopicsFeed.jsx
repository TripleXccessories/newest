import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

const LEVEL_COLORS = {
  'Kindergarten': '#00d4aa', 'Grade School': '#60a5fa', 'Mid Grade': '#a78bfa',
  'Junior High': '#f59e0b', 'High School': '#fb7185', 'University': '#f97316',
};

export default function LectureTopicsFeed({ lessons = [] }) {
  const recent = lessons.slice(0, 8);

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest flex items-center gap-1.5">
          <BookOpen size={10} /> Latest Lecture Topics
        </p>
        <span className="text-[10px] text-[#334155]">{lessons.length} total lessons</span>
      </div>

      {recent.length === 0 && (
        <div className="text-center py-6">
          <Sparkles size={24} className="mx-auto mb-2 text-[#334155]" />
          <p className="text-xs text-[#334155]">No lessons generated yet</p>
        </div>
      )}

      <div className="space-y-2">
        {recent.map((lesson, i) => {
          const color = LEVEL_COLORS[lesson.school_level] || '#475569';
          return (
            <motion.div key={lesson.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#0f172a] transition-colors">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#f1f5f9] truncate">{lesson.title}</p>
                <p className="text-[9px] text-[#475569]">{lesson.faculty_name} · {lesson.school_level}</p>
              </div>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full shrink-0 font-bold"
                style={{ background: `${color}15`, color }}>
                L{lesson.lesson_number}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}