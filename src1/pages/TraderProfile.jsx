import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Copy, Users, Shield, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BadgeShowcase, { ACHIEVEMENT_BADGES } from '@/components/leaderboard/BadgeShowcase';

export default function TraderProfile() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('uid');
  const [trader, setTrader] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) { setLoading(false); return; }
      const [rankings, achs] = await Promise.all([
        base44.entities.TraderRanking.filter({ user_id: userId }).catch(() => []),
        base44.entities.UserAchievement.filter({ user_id: userId, is_public: true }).catch(() => []),
      ]);
      setTrader(rankings[0] || null);
      setAchievements(achs);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
    </div>
  );

  if (!trader) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-[#64748b]">Trader profile not found.</p>
    </div>
  );

  const earnedIds = achievements.map(a => a.badge_id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#00d4aa]/20 border-2 border-[#00d4aa]/40 flex items-center justify-center text-2xl font-black text-[#00d4aa]">
            {trader.avatar_initials || trader.display_name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#f1f5f9]">{trader.display_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-bold">
                Rank #{trader.rank} · {trader.rank_tier}
              </span>
              {trader.mirror_enabled && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] flex items-center gap-1">
                  <Copy size={9} /> {trader.mirror_count || 0} mirroring
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Total Return', val: `+${trader.return_pct}%`, color: '#00d4aa' },
            { label: 'Win Rate', val: `${trader.win_rate}%`, color: '#00d4aa' },
            { label: 'Total Trades', val: trader.total_trades, color: '#94a3b8' },
            { label: 'Sharpe Ratio', val: (trader.sharpe_ratio || 0).toFixed(2), color: '#a78bfa' },
            { label: 'Max Drawdown', val: `-${trader.max_drawdown_pct}%`, color: '#ef4444' },
            { label: 'Profit Streak', val: `${trader.consecutive_profitable_days}d 🔥`, color: '#f97316' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-[#0f172a] rounded-xl p-3 text-center">
              <p className="text-base font-bold" style={{ color }}>{val}</p>
              <p className="text-[10px] text-[#475569] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Badge wall */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
        <h2 className="text-sm font-bold text-[#f1f5f9] flex items-center gap-2 mb-4">
          <Trophy size={14} className="text-[#f59e0b]" /> Achievement Badges
        </h2>
        <BadgeShowcase earnedBadgeIds={earnedIds} showAll={true} />
      </motion.div>
    </div>
  );
}