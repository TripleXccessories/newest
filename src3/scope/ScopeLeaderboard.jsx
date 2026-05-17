import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Medal, Star, Target, CheckCircle2, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

function getRankBadge(rank) {
  if (rank === 1) return { icon: Crown, color: '#f59e0b', bg: '#f59e0b20', label: '#1' };
  if (rank === 2) return { icon: Medal, color: '#94a3b8', bg: '#94a3b820', label: '#2' };
  if (rank === 3) return { icon: Medal, color: '#cd7c2f', bg: '#cd7c2f20', label: '#3' };
  return { icon: Star, color: '#475569', bg: '#1e293b', label: `#${rank}` };
}

export default function ScopeLeaderboard({ currentUser }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ScopeFinding.list('-created_date', 500).then(findings => {
      // Aggregate per user
      const map = {};
      findings.forEach(f => {
        const uid = f.user_id;
        if (!uid) return;
        if (!map[uid]) {
          map[uid] = {
            user_id: uid,
            user_email: f.user_email || uid,
            score: 0,
            findings: 0,
            resolved: 0,
            accepted: 0,
            importance_sum: 0,
            importance_count: 0,
          };
        }
        map[uid].findings += 1;
        map[uid].score += f.contribution_score || 1;
        if (f.is_completed) map[uid].resolved += 1;
        if (['fixed', 'acknowledged', 'in_progress'].includes(f.status)) map[uid].accepted += 1;
        if (f.importance_rating > 0) {
          map[uid].importance_sum += f.importance_rating;
          map[uid].importance_count += 1;
        }
      });

      const ranked = Object.values(map)
        .sort((a, b) => b.score - a.score || b.resolved - a.resolved)
        .map((u, i) => ({
          ...u,
          rank: i + 1,
          avg_importance: u.importance_count > 0
            ? (u.importance_sum / u.importance_count).toFixed(1)
            : '—',
          display_name: u.user_email?.split('@')[0] || 'Anonymous',
        }));

      setBoard(ranked);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  if (board.length === 0) {
    return (
      <div className="text-center py-12 text-[#334155]">
        <Trophy size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">No tester data yet. Be the first to submit a finding!</p>
      </div>
    );
  }

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="space-y-4">
      {/* Podium */}
      <div className="flex items-end justify-center gap-3 py-4">
        {/* 2nd */}
        {top3[1] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black bg-[#94a3b820] border-2 border-[#94a3b8] mb-2">
              {top3[1].display_name[0]?.toUpperCase()}
            </div>
            <p className="text-[10px] font-bold text-[#94a3b8] text-center">{top3[1].display_name}</p>
            <p className="text-[10px] text-[#475569]">{top3[1].score} pts</p>
            <div className="w-14 h-10 rounded-t-lg mt-1 flex items-center justify-center bg-[#94a3b820] border border-[#94a3b830]">
              <span className="text-xs font-black text-[#94a3b8]">#2</span>
            </div>
          </motion.div>
        )}
        {/* 1st */}
        {top3[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
            className="flex flex-col items-center"
          >
            <Crown size={16} className="text-[#f59e0b] mb-1" />
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black bg-[#f59e0b20] border-2 border-[#f59e0b] mb-2">
              {top3[0].display_name[0]?.toUpperCase()}
            </div>
            <p className="text-[11px] font-bold text-[#f59e0b] text-center">{top3[0].display_name}</p>
            <p className="text-[10px] text-[#64748b]">{top3[0].score} pts</p>
            <div className="w-14 h-14 rounded-t-lg mt-1 flex items-center justify-center bg-[#f59e0b20] border border-[#f59e0b30]">
              <span className="text-xs font-black text-[#f59e0b]">#1</span>
            </div>
          </motion.div>
        )}
        {/* 3rd */}
        {top3[2] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black bg-[#cd7c2f20] border-2 border-[#cd7c2f] mb-2">
              {top3[2].display_name[0]?.toUpperCase()}
            </div>
            <p className="text-[10px] font-bold text-[#cd7c2f] text-center">{top3[2].display_name}</p>
            <p className="text-[10px] text-[#475569]">{top3[2].score} pts</p>
            <div className="w-14 h-8 rounded-t-lg mt-1 flex items-center justify-center bg-[#cd7c2f20] border border-[#cd7c2f30]">
              <span className="text-xs font-black text-[#cd7c2f]">#3</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Full table */}
      <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] overflow-hidden">
        <div className="grid grid-cols-5 px-3 py-2 border-b border-[#1e293b] text-[9px] font-bold text-[#334155] uppercase tracking-widest">
          <span>Rank</span>
          <span className="col-span-2">Tester</span>
          <span className="text-center">Score</span>
          <span className="text-center">Fixed</span>
        </div>
        {board.map((u, i) => {
          const badge = getRankBadge(u.rank);
          const BadgeIcon = badge.icon;
          const isMe = u.user_id === currentUser?.id;
          return (
            <motion.div
              key={u.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-5 px-3 py-2.5 border-b border-[#1e293b]/50 last:border-0 items-center"
              style={{ background: isMe ? '#00d4aa08' : 'transparent' }}
            >
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: badge.bg }}>
                  <BadgeIcon size={11} style={{ color: badge.color }} />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold truncate" style={{ color: isMe ? '#00d4aa' : '#f1f5f9' }}>
                  {u.display_name} {isMe && <span className="text-[9px] text-[#00d4aa]/60">(you)</span>}
                </p>
                <p className="text-[9px] text-[#334155]">{u.findings} findings · imp {u.avg_importance}</p>
              </div>
              <div className="text-center">
                <span className="text-sm font-black" style={{ color: badge.color }}>{u.score}</span>
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-[#00d4aa]">{u.resolved}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[9px] text-[#334155] text-center italic">
        Score = sum of contribution points per accepted finding. Importance rating (1–10) assigned by admin.
      </p>
    </div>
  );
}