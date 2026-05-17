import React from 'react';
import { motion } from 'framer-motion';

export const ACHIEVEMENT_BADGES = [
  { id: 'profit_streak_10', emoji: '🔥', name: '10-Day Profit Streak', desc: '10 consecutive profitable trading days', rarity: 'Gold', trigger: 'consecutive_profitable_days', threshold: 10 },
  { id: 'profit_streak_30', emoji: '🌋', name: '30-Day Inferno', desc: '30 consecutive profitable days', rarity: 'Platinum', trigger: 'consecutive_profitable_days', threshold: 30 },
  { id: 'low_dd_streak', emoji: '🛡️', name: 'Iron Shield', desc: 'Maintained drawdown below 5% for 14 days', rarity: 'Silver', trigger: 'lowest_drawdown_streak', threshold: 14 },
  { id: 'win_rate_80', emoji: '🎯', name: 'Sniper Precision', desc: 'Achieved 80%+ win rate over 20+ trades', rarity: 'Gold', trigger: 'win_rate', threshold: 80 },
  { id: 'sharpe_2', emoji: '📐', name: 'Risk Architect', desc: 'Maintained Sharpe Ratio above 2.0', rarity: 'Platinum', trigger: 'sharpe_ratio', threshold: 2 },
  { id: 'first_trade', emoji: '🚀', name: 'First Launch', desc: 'Opened your first paper trade', rarity: 'Bronze', trigger: 'total_trades', threshold: 1 },
  { id: 'trades_100', emoji: '💯', name: 'Century Trader', desc: 'Executed 100 paper trades', rarity: 'Silver', trigger: 'total_trades', threshold: 100 },
  { id: 'mirror_5', emoji: '🪞', name: 'Trend Setter', desc: '5 traders mirroring your strategy', rarity: 'Gold', trigger: 'mirror_count', threshold: 5 },
  { id: 'return_50', emoji: '💰', name: 'Half-Century Return', desc: 'Achieved +50% portfolio return', rarity: 'Diamond', trigger: 'return_pct', threshold: 50 },
  { id: 'return_100', emoji: '👑', name: 'Double or Nothing', desc: 'Doubled the virtual portfolio', rarity: 'Mythic', trigger: 'return_pct', threshold: 100 },
];

const RARITY_COLORS = {
  Bronze:   { color: '#d97706', bg: 'bg-amber-700/10', border: 'border-amber-700/30' },
  Silver:   { color: '#94a3b8', bg: 'bg-slate-500/10', border: 'border-slate-400/20' },
  Gold:     { color: '#fbbf24', bg: 'bg-yellow-500/10', border: 'border-yellow-400/30' },
  Platinum: { color: '#e2e8f0', bg: 'bg-slate-300/10', border: 'border-slate-300/30' },
  Diamond:  { color: '#67e8f9', bg: 'bg-cyan-400/10',  border: 'border-cyan-400/30' },
  Mythic:   { color: '#f0abfc', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/30' },
};

export default function BadgeShowcase({ earnedBadgeIds = [], showAll = false, size = 'md' }) {
  const badges = showAll ? ACHIEVEMENT_BADGES : ACHIEVEMENT_BADGES.filter(b => earnedBadgeIds.includes(b.id));

  if (badges.length === 0 && !showAll) {
    return <p className="text-xs text-[#475569] italic">No badges earned yet.</p>;
  }

  return (
    <div className={`flex flex-wrap gap-2`}>
      {badges.map((badge, i) => {
        const earned = earnedBadgeIds.includes(badge.id);
        const cfg = RARITY_COLORS[badge.rarity];
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            title={`${badge.name}: ${badge.desc}`}
            className={`group relative flex items-center gap-1.5 rounded-xl border transition-all ${cfg.border} ${cfg.bg} ${
              !earned && showAll ? 'opacity-30 grayscale' : ''
            } ${size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5'}`}
          >
            <span className={size === 'sm' ? 'text-sm' : 'text-base'}>{badge.emoji}</span>
            {size !== 'sm' && (
              <div>
                <p className="text-[11px] font-bold" style={{ color: cfg.color }}>{badge.name}</p>
                <p className="text-[9px] text-[#475569]">{badge.rarity}</p>
              </div>
            )}
            {/* Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 min-w-40">
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-2.5 text-[10px] text-[#94a3b8] leading-relaxed shadow-xl">
                <p className="font-bold text-[#f1f5f9] mb-0.5">{badge.name}</p>
                <p>{badge.desc}</p>
                {!earned && showAll && <p className="text-[#475569] mt-1 italic">Locked</p>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}