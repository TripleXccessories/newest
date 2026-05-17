import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, BookOpen, Lock, Sparkles, StickyNote } from 'lucide-react';
import { BADGES, SCHOOL_LEVELS, COURSES } from '@/lib/academyCurriculum';
import { base44 } from '@/api/base44Client';

const RARITY_COLORS = {
  Bronze: '#cd7f32',
  Silver: '#94a3b8',
  Gold: '#f59e0b',
  Platinum: '#e2e8f0',
  Diamond: '#a5f3fc',
  Mythic: '#c084fc',
};

export default function TrophyRoom({ progress, user }) {
  const [tab, setTab] = useState('badges');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    if (tab === 'notes' && user) {
      setNotesLoading(true);
      base44.entities.CollectibleNote.filter({ user_id: user.id })
        .then(setNotes)
        .catch(() => {})
        .finally(() => setNotesLoading(false));
    }
  }, [tab, user]);

  const earnedIds = progress?.earned_badge_ids || [];
  const earnedBadges = BADGES.filter(b => earnedIds.includes(b.id));
  const lockedBadges = BADGES.filter(b => !earnedIds.includes(b.id));

  return (
    <div className="space-y-4">
      {/* Sub tabs */}
      <div className="flex gap-1 bg-[#0f172a] border border-[#1e293b] rounded-xl p-1">
        {[
          { id: 'badges', label: 'Badges & Trophies' },
          { id: 'notes', label: 'Memory Board' },
          { id: 'map', label: 'Progress Map' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === id ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* BADGES TAB */}
      {tab === 'badges' && (
        <div className="space-y-4">
          {earnedBadges.length > 0 && (
            <div>
              <p className="text-xs text-[#64748b] mb-3">Earned Badges</p>
              <div className="grid grid-cols-2 gap-3">
                {earnedBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    className="relative p-4 rounded-xl border text-center overflow-hidden"
                    style={{ borderColor: `${badge.color}50`, background: `${badge.color}08` }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <motion.div
                      className="text-4xl mb-2"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {badge.emoji}
                    </motion.div>
                    <p className="text-xs font-bold" style={{ color: badge.color }}>{badge.name}</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: `${RARITY_COLORS[badge.rarity]}20`, color: RARITY_COLORS[badge.rarity] }}
                    >
                      {badge.rarity}
                    </span>
                    {/* Glow */}
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      animate={{ opacity: [0, 0.15, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      style={{ background: `radial-gradient(circle, ${badge.color} 0%, transparent 70%)` }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {earnedBadges.length === 0 && (
            <div className="text-center py-12 text-[#475569]">
              <Trophy size={40} className="mx-auto mb-3 opacity-10" />
              <p className="text-sm text-[#334155]">Nothing to see here yet.</p>
              <p className="text-xs text-[#1e293b] mt-1">Keep learning. Something waits for those who earn it.</p>
            </div>
          )}

          {lockedBadges.length > 0 && earnedBadges.length > 0 && (
            <div>
              <p className="text-xs text-[#334155] mb-3 italic">More await discovery...</p>
              <div className="grid grid-cols-4 gap-2">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-xl border border-[#1e293b] text-center opacity-25"
                  >
                    <div className="text-2xl grayscale brightness-0">?</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MEMORY BOARD / NOTES TAB */}
      {tab === 'notes' && (
        <div className="space-y-3">
          <AnimatePresence>
            {selectedNote && (
              <NoteModal note={selectedNote} onClose={() => setSelectedNote(null)} />
            )}
          </AnimatePresence>

          {notesLoading && (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#f59e0b] rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!notesLoading && notes.length === 0 && (
            <div className="text-center py-10 text-[#475569]">
              <StickyNote size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No notes collected yet.</p>
              <p className="text-xs text-[#334155] mt-1">Key takeaways from lessons will appear here.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {notes.map((note) => (
              <motion.button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="text-left p-4 rounded-xl border border-[#1e293b] bg-[#0f172a] hover:border-[#f59e0b]/30 transition-all relative overflow-hidden"
                whileHover={{ scale: 1.01 }}
              >
                {/* Watermark visual */}
                {note.generated_image_url && (
                  <div
                    className="absolute inset-0 opacity-5 bg-cover bg-center pointer-events-none rounded-xl"
                    style={{ backgroundImage: `url(${note.generated_image_url})` }}
                  />
                )}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${note.faculty_color || '#f59e0b'}20`, color: note.faculty_color || '#f59e0b' }}
                    >
                      {note.rarity}
                    </span>
                    <span className="text-[10px] text-[#475569]">{note.school_level}</span>
                  </div>
                  <p className="text-sm font-bold text-[#f1f5f9]">{note.title}</p>
                  <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{note.content}</p>
                  <p className="text-[10px] text-[#475569] mt-2">by {note.faculty_name}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* PROGRESS MAP TAB */}
      {tab === 'map' && (
        <div className="space-y-3">
          <p className="text-xs text-[#475569]">Your completed journey — lit vs. awaiting.</p>
          {SCHOOL_LEVELS.map((level) => {
            const levelCourses = COURSES.filter(c => c.school_level === level.id);
            const completedCount = levelCourses.filter(c => (progress?.completed_course_ids || []).includes(c.id)).length;
            const pct = levelCourses.length ? (completedCount / levelCourses.length) : 0;
            const isLit = pct === 1;

            return (
              <div
                key={level.id}
                className="p-4 rounded-xl border transition-all"
                style={{
                  borderColor: isLit ? `${level.color}60` : '#1e293b',
                  background: isLit ? `${level.color}08` : '#0f172a',
                  opacity: pct === 0 ? 0.4 : 1,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" style={{ filter: pct === 0 ? 'saturate(0) brightness(0.4)' : 'none' }}>{level.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: isLit ? level.color : '#94a3b8' }}>{level.label}</p>
                    <div className="w-full h-1.5 bg-[#1e293b] rounded-full mt-1.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: isLit ? level.color : level.color + '60' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct * 100}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-bold" style={{ color: isLit ? level.color : '#475569' }}>
                    {completedCount}/{levelCourses.length}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NoteModal({ note, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.92)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl border overflow-hidden relative"
        style={{ borderColor: `${note.faculty_color || '#f59e0b'}50`, background: '#07080f' }}
        initial={{ scale: 0.88, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Watermark background */}
        {note.generated_image_url && (
          <div
            className="absolute inset-0 opacity-[0.06] bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${note.generated_image_url})` }}
          />
        )}
        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${note.faculty_color || '#f59e0b'}20`, color: note.faculty_color || '#f59e0b' }}>
              {note.rarity}
            </span>
            <p className="text-xs text-[#64748b]">{note.faculty_name}</p>
          </div>
          <h3 className="text-base font-bold text-[#f1f5f9] mb-3">{note.title}</h3>
          <div
            className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap p-4 rounded-xl border"
            style={{ borderColor: `${note.faculty_color || '#f59e0b'}20`, background: `${note.faculty_color || '#f59e0b'}05`, fontFamily: 'Georgia, serif' }}
          >
            {note.content}
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 rounded-xl text-xs font-bold transition-colors"
            style={{ background: `${note.faculty_color || '#f59e0b'}20`, color: note.faculty_color || '#f59e0b' }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}