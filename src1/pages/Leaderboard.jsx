import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Newspaper, Users, RefreshCw, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import SentimentNewsFeed from '@/components/leaderboard/SentimentNewsFeed';
import BadgeShowcase from '@/components/leaderboard/BadgeShowcase';

const MOCK_TRADERS = [
  { user_id: 'mock1', display_name: 'AlphaWolf', avatar_initials: 'AW', return_pct: 87.4, win_rate: 74, total_trades: 143, total_pnl: 87400, max_drawdown_pct: 8.2, sharpe_ratio: 2.4, consecutive_profitable_days: 22, lowest_drawdown_streak: 18, rank: 1, rank_tier: 'Mythic', mirror_enabled: true, mirror_count: 34, badge_ids: ['return_100', 'profit_streak_30', 'win_rate_80'] },
  { user_id: 'mock2', display_name: 'SilentEdge', avatar_initials: 'SE', return_pct: 61.2, win_rate: 81, total_trades: 89, total_pnl: 61200, max_drawdown_pct: 4.1, sharpe_ratio: 3.1, consecutive_profitable_days: 31, lowest_drawdown_streak: 28, rank: 2, rank_tier: 'Diamond', mirror_enabled: true, mirror_count: 21, badge_ids: ['low_dd_streak', 'win_rate_80', 'sharpe_2'] },
  { user_id: 'mock3', display_name: 'NightOwl99', avatar_initials: 'NO', return_pct: 44.8, win_rate: 68, total_trades: 201, total_pnl: 44800, max_drawdown_pct: 11.3, sharpe_ratio: 1.7, consecutive_profitable_days: 12, lowest_drawdown_streak: 9, rank: 3, rank_tier: 'Platinum', mirror_enabled: true, mirror_count: 11, badge_ids: ['trades_100', 'profit_streak_10'] },
  { user_id: 'mock4', display_name: 'QuantKing', avatar_initials: 'QK', return_pct: 31.5, win_rate: 62, total_trades: 55, total_pnl: 31500, max_drawdown_pct: 13.7, sharpe_ratio: 1.3, consecutive_profitable_days: 8, lowest_drawdown_streak: 6, rank: 4, rank_tier: 'Gold', mirror_enabled: false, mirror_count: 0, badge_ids: ['return_50'] },
  { user_id: 'mock5', display_name: 'IronHands', avatar_initials: 'IH', return_pct: 18.9, win_rate: 58, total_trades: 34, total_pnl: 18900, max_drawdown_pct: 6.8, sharpe_ratio: 1.1, consecutive_profitable_days: 5, lowest_drawdown_streak: 14, rank: 5, rank_tier: 'Silver', mirror_enabled: true, mirror_count: 3, badge_ids: ['low_dd_streak', 'first_trade'] },
];

const TABS = [
  { id: 'leaderboard', label: 'Rankings', icon: Trophy },
  { id: 'sentiment', label: 'Market Pulse', icon: Newspaper },
  { id: 'badges', label: 'Badge Library', icon: Users },
];

export default function Leaderboard() {
  const [tab, setTab] = useState('leaderboard');
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [volatilityAlert, setVolatilityAlert] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (_) {}
      try {
        const data = await base44.entities.TraderRanking.list('-return_pct', 50);
        setTraders(data.length > 0 ? data : MOCK_TRADERS);
      } catch (_) {
        setTraders(MOCK_TRADERS);
      }
      setLoading(false);
    };
    load();
  }, []);

  const alertConfig = {
    pause_trading:    { color: '#ef4444', label: 'BOT ADVISORY: PAUSE TRADING' },
    reduce_size:      { color: '#f97316', label: 'BOT ADVISORY: REDUCE POSITION SIZE' },
    increase_caution: { color: '#f59e0b', label: 'BOT ADVISORY: INCREASE CAUTION' },
  };
  const alertCfg = volatilityAlert ? alertConfig[volatilityAlert.type] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <Trophy size={22} className="text-[#f59e0b]" /> Global Leaderboard
        </h1>
        <p className="text-sm text-[#64748b] mt-1">Top traders, live sentiment, and badge achievements.</p>
      </div>

      {/* Volatility alert banner */}
      <AnimatePresence>
        {alertCfg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ borderColor: `${alertCfg.color}40`, background: `${alertCfg.color}10` }}
          >
            <AlertTriangle size={16} style={{ color: alertCfg.color, flexShrink: 0 }} />
            <div>
              <p className="text-xs font-bold" style={{ color: alertCfg.color }}>{alertCfg.label}</p>
              {volatilityAlert.reason && (
                <p className="text-[11px] text-[#64748b] mt-0.5">{volatilityAlert.reason}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab nav */}
      <div className="flex gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === id ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Rankings tab */}
      {tab === 'leaderboard' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#f59e0b] rounded-full animate-spin" />
            </div>
          ) : (
            <LeaderboardTable traders={traders} currentUser={user} />
          )}
        </div>
      )}

      {/* Market Pulse tab */}
      {tab === 'sentiment' && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
          <SentimentNewsFeed onVolatilityAlert={setVolatilityAlert} />
        </div>
      )}

      {/* Badge Library tab */}
      {tab === 'badges' && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#f1f5f9]">All Achievement Badges</h3>
          <p className="text-xs text-[#64748b]">Earn these by hitting milestones in your paper trading journey. Badges appear on your public profile.</p>
          <BadgeShowcase earnedBadgeIds={[]} showAll={true} />
        </div>
      )}
    </div>
  );
}