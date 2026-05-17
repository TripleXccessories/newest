import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Sparkles, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const RARITY_MAP = {
  Kindergarten: 'Common',
  'Grade School': 'Common',
  'Mid Grade': 'Uncommon',
  'Junior High': 'Rare',
  'High School': 'Epic',
  University: 'Legendary',
};

export default function CollectibleNoteReveal({ lesson, user, faculty, onCollect }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const noteContent = lesson.key_takeaway || `Key insight from ${lesson.title}: Every principle learned here is a building block for the next level. The market rewards those who master the fundamentals before chasing the complex.`;

  const handleCollect = async () => {
    setSaving(true);
    try {
      const note = await base44.entities.CollectibleNote.create({
        lesson_id: lesson.id,
        user_id: user?.id || 'unknown',
        title: `${lesson.title} — Key Takeaway`,
        content: noteContent,
        faculty_id: lesson.faculty_id,
        faculty_name: lesson.faculty_name,
        faculty_color: faculty.color,
        school_level: lesson.school_level,
        course_id: lesson.course_id,
        rarity: RARITY_MAP[lesson.school_level] || 'Common',
      });
      setSaved(true);
      setTimeout(() => onCollect(note), 1500);
    } catch (_) {
      onCollect(null);
    }
    setSaving(false);
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        {/* Note card */}
        <div
          className="rounded-2xl border overflow-hidden relative"
          style={{ borderColor: `${faculty.color}50`, background: '#07080f' }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: `inset 0 0 60px ${faculty.color}08` }}
          />

          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b relative" style={{ borderColor: `${faculty.color}20` }}>
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${faculty.color}15`, border: `1px solid ${faculty.color}40` }}
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 1.5, delay: 0.4 }}
              >
                <StickyNote size={18} style={{ color: faculty.color }} />
              </motion.div>
              <div>
                <p className="text-xs font-bold text-[#f1f5f9]">Key Takeaway Note</p>
                <p className="text-[10px]" style={{ color: faculty.color }}>{lesson.faculty_name} · {RARITY_MAP[lesson.school_level] || 'Common'}</p>
              </div>
            </div>
          </div>

          {/* Note body */}
          <div className="relative px-5 py-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-sm font-bold text-[#f1f5f9] mb-3">{lesson.title}</h3>
              <div
                className="text-sm text-[#cbd5e1] leading-relaxed p-4 rounded-xl border"
                style={{
                  borderColor: `${faculty.color}20`,
                  background: `${faculty.color}05`,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {noteContent}
              </div>
            </motion.div>

            <motion.div
              className="mt-5 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {!saved ? (
                <button
                  onClick={handleCollect}
                  disabled={saving}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ background: faculty.color, color: '#070b14' }}
                >
                  {saving ? (
                    <>Saving note...</>
                  ) : (
                    <><Sparkles size={15} /> Collect This Note</>
                  )}
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-center py-2"
                >
                  <p className="text-sm font-bold" style={{ color: faculty.color }}>✨ Note Added to Memory Board</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}