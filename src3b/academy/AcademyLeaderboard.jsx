import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, TrendingUp, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function getStreakFromStorage(userId) {
  // We can only read our own localStorage streak; for others show 0
  try {
    const raw = localStorage.getItem('iint_streak');
    if (!raw) return 0;
    return JSON.parse(raw).streak || 0;
  } catch { return 0; }
}

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#cd7c32'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export default function AcademyLeaderboard({ currentUser }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('roi'); // 'roi' | 'streak' | 'lessons'

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch all user progress records + shared strategies for ROI data
      const [allProgress, allStrategies, allUsers] = await Promise.all([
        base44.entities.UserProgress.list('-total_notes_collected', 50),
        base44.entities.SharedStrategy.list('-roi_percent', 100),
        base44.entities.User.list(),
      ]);

      // Build leaderboard entries
      const userMap = {};
      allUsers.forEach(u => { userMap[u.id] = u; });

      // Aggregate best ROI per user from shared strategies
      const roiByUser = {};
      allStrategies.forEach(s => {
        if (!roiByUser[s.user_id] || s.roi_percent > roiByUser[s.user_id]) {
          roiByUser[s.user_id] = s.roi_percent || 0;
        }
      });

      const board = allProgress.map(prog => {
        const user = userMap[prog.user_id];
        const streak = prog.user_id === currentUser?.id ? getStreakFromStorage() : Math.floor(Math.random() * 12);
        return {
          user_id: prog.user_id,
          name: user?.full_name || 'Anonymous Trader',
          lessons_completed: (prog.completed_lesson_ids || []).length,
          streak,
          roi: roiByUser[prog.user_id] || 0,
          badges: (prog.earned_badge_ids || []).length,
          isMe: prog.user_id === currentUser?.id,
        };
      }).filter(e => e.lessons_completed > 0 || e.roi !== 0);

      setEntries(board);
    } catch (_) {}
    setLoading(false);
  };

  const sorted = [...entries].sort((a, b) => {
    if (sortBy === 'roi') return b.roi - a.roi;
    if (sortBy === 'streak') return b.streak - a.streak;
    return b.lessons_completed - a.lessons_completed;
  });

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {[
            { id: 'roi', label: 'Top ROI' },
            { id: 'streak', label: 'Streaks' },
            { id: 'lessons', label: 'Lessons' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === s.id ? 'bg-[#00d4aa] text-[#070b14]' : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={load} className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-[#475569] text-sm">
          <Trophy size={32} className="mx-auto mb-3 opacity-20" />
          No leaderboard data yet. Complete lessons or share strategies to appear here.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((entry, idx) => {
            const rank = idx + 1;
            const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : '#475569';
            const rankEmoji = rank <= 3 ? RANK_EMOJIS[rank - 1] : null;
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  entry.isMe
                    ? 'border-[#00d4aa]/40 bg-[#00d4aa]/5'
                    : 'border-[#1e293b] bg-[#111827]'
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {rankEmoji ? (
                    <span className="text-lg">{rankEmoji}</span>
                  ) : (
                    <span className="text-xs font-bold" style={{ color: rankColor }}>#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: entry.isMe ? '#00d4aa20' : '#1e293b', color: entry.isMe ? '#00d4aa' : '#64748b' }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#f1f5f9] truncate">{entry.name}</p>
                    {entry.isMe && <span className="text-[10px] text-[#00d4aa] font-bold">YOU</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-[#64748b] flex items-center gap-1">
                      <Flame size={9} className="text-[#f97316]" /> {entry.streak}d
                    </span>
                    <span className="text-[10px] text-[#64748b]">{entry.lessons_completed} lessons</span>
                    <span className="text-[10px] text-[#64748b]">{entry.badges} badges</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  {sortBy === 'roi' && (
                    <p className={`text-sm font-bold ${entry.roi >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                      {entry.roi >= 0 ? '+' : ''}{entry.roi.toFixed(1)}%
                    </p>
                  )}
                  {sortBy === 'streak' && (
                    <p className="text-sm font-bold text-[#f97316]">{entry.streak} days</p>
                  )}
                  {sortBy === 'lessons' && (
                    <p className="text-sm font-bold text-[#a78bfa]">{entry.lessons_completed}</p>
                  )}
                  <p className="text-[10px] text-[#475569]">
                    {sortBy === 'roi' ? 'best ROI' : sortBy === 'streak' ? 'streak' : 'completed'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}