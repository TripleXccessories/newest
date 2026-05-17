import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STREAK_BADGES = [
  { days: 3,  emoji: '🔥', label: 'Spark',    color: '#f97316', rarity: 'Bronze',   line: 'Three days in. The habit is forming.' },
  { days: 7,  emoji: '🌟', label: 'Consistent', color: '#f59e0b', rarity: 'Silver', line: 'Seven consecutive days of growth. Consistency is a superpower.' },
  { days: 14, emoji: '💎', label: 'Relentless', color: '#60a5fa', rarity: 'Gold',   line: 'Two weeks without stopping. Relentlessness is your edge.' },
  { days: 30, emoji: '🏆', label: 'Iron Will', color: '#c084fc', rarity: 'Diamond',  line: 'Thirty days. You have forged iron will.' },
];

function getStreakData() {
  try {
    const raw = localStorage.getItem('iint_streak');
    if (!raw) return { streak: 0, lastDate: null, earnedDays: [] };
    return JSON.parse(raw);
  } catch { return { streak: 0, lastDate: null, earnedDays: [] }; }
}

function saveStreakData(data) {
  localStorage.setItem('iint_streak', JSON.stringify(data));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function recordStreakActivity() {
  const today = todayStr();
  const data = getStreakData();
  if (data.lastDate === today) return data; // already recorded today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const newStreak = data.lastDate === yStr ? data.streak + 1 : 1;
  const updated = { streak: newStreak, lastDate: today, earnedDays: [...(data.earnedDays || []), today] };
  saveStreakData(updated);
  return updated;
}

export default function StreakCounter({ userId }) {
  const [streakData, setStreakData] = useState(getStreakData());
  const [newBadge, setNewBadge] = useState(null);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const data = getStreakData();
    setStreakData(data);

    // Check if a new streak badge was just earned
    const earned = STREAK_BADGES.find(b => b.days === data.streak);
    if (earned) {
      const badgeKey = `iint_streak_badge_${earned.days}`;
      if (!localStorage.getItem(badgeKey)) {
        localStorage.setItem(badgeKey, '1');
        setNewBadge(earned);
        setShowBadge(true);
        // Persist to UserProgress if possible
        if (userId) {
          base44.entities.UserProgress.filter({ user_id: userId }).then(([prog]) => {
            if (prog) {
              const alreadyHas = (prog.earned_badge_ids || []).includes(`streak_${earned.days}`);
              if (!alreadyHas) {
                base44.entities.UserProgress.update(prog.id, {
                  earned_badge_ids: [...(prog.earned_badge_ids || []), `streak_${earned.days}`],
                });
              }
            }
          }).catch(() => {});
        }
      }
    }
  }, [userId]);

  const streak = streakData.streak || 0;
  const isActiveToday = streakData.lastDate === todayStr();

  // Determine next milestone
  const nextMilestone = STREAK_BADGES.find(b => b.days > streak);

  const dotCount = 7;
  const dots = Array.from({ length: dotCount }, (_, i) => ({
    active: i < Math.min(streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0), dotCount),
    today: i === Math.min(streak % 7 === 0 && streak > 0 ? 6 : (streak % 7) - 1, dotCount - 1),
  }));

  return (
    <>
      {/* Badge celebration modal */}
      <AnimatePresence>
        {showBadge && newBadge && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,4,8,0.88)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm bg-[#111827] border rounded-3xl p-8 text-center"
              style={{ borderColor: `${newBadge.color}60` }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="text-7xl mb-4"
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8 }}
              >
                {newBadge.emoji}
              </motion.div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: newBadge.color }}>
                Streak Badge Unlocked · {newBadge.rarity}
              </p>
              <h2 className="text-2xl font-bold text-[#f1f5f9] mb-3">{newBadge.label}</h2>
              <p className="text-sm text-[#64748b] leading-relaxed mb-1">{newBadge.days}-day streak achieved.</p>
              <p className="text-sm italic text-[#94a3b8] mb-6">"{newBadge.line}"</p>
              <button
                onClick={() => setShowBadge(false)}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: newBadge.color, color: '#070b14' }}
              >
                Claim Badge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak widget */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={16} className={streak > 0 ? 'text-[#f97316]' : 'text-[#334155]'} />
            <span className="text-sm font-semibold text-[#f1f5f9]">Daily Streak</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold" style={{ color: streak > 0 ? '#f97316' : '#334155' }}>
              {streak}
            </span>
            <span className="text-xs text-[#64748b]">days</span>
          </div>
        </div>

        {/* 7-day dot track */}
        <div className="flex gap-1.5 mb-4">
          {Array.from({ length: 7 }, (_, i) => {
            const dayActive = i < (streak >= 7 ? 7 : streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0));
            const isToday = isActiveToday && i === Math.min((streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0)) - 1, 6);
            return (
              <motion.div
                key={i}
                className="flex-1 h-2 rounded-full"
                style={{ background: dayActive ? '#f97316' : '#1e293b' }}
                animate={isToday ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.6, repeat: isToday ? Infinity : 0, repeatDelay: 2 }}
              />
            );
          })}
        </div>

        {/* Status line */}
        <p className="text-xs text-[#64748b] mb-3">
          {isActiveToday
            ? '✓ Activity logged today. Keep it up!'
            : 'Complete a lesson or journal a trade to extend your streak.'}
        </p>

        {/* Next milestone */}
        {nextMilestone && (
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#1e293b] bg-[#0f172a]">
            <div className="flex items-center gap-2">
              <span className="text-lg">{nextMilestone.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-[#f1f5f9]">{nextMilestone.label} Badge</p>
                <p className="text-[10px] text-[#475569]">{nextMilestone.days - streak} more days</p>
              </div>
            </div>
            <div className="w-14 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: nextMilestone.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((streak / nextMilestone.days) * 100, 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}

        {/* Earned badges row */}
        {STREAK_BADGES.filter(b => streak >= b.days).length > 0 && (
          <div className="flex gap-2 mt-3">
            {STREAK_BADGES.filter(b => streak >= b.days).map(b => (
              <div key={b.days} className="text-lg" title={`${b.label} — ${b.days}-day streak`}>
                {b.emoji}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}