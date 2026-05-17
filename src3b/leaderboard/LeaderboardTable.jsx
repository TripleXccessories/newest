import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Copy, Users, TrendingUp, Shield, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIER_CONFIG = {
  Mythic:   { color: '#f0abfc', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', emoji: '👑' },
  Diamond:  { color: '#67e8f9', bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    emoji: '💎' },
  Platinum: { color: '#e2e8f0', bg: 'bg-slate-400/10',   border: 'border-slate-400/30',   emoji: '🏆' },
  Gold:     { color: '#fbbf24', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  emoji: '🥇' },
  Silver:   { color: '#94a3b8', bg: 'bg-slate-500/10',   border: 'border-slate-500/30',   emoji: '🥈' },
  Bronze:   { color: '#d97706', bg: 'bg-amber-700/10',   border: 'border-amber-700/30',   emoji: '🥉' },
};

function MirrorModal({ leader, currentUser, onClose }) {
  const [alloc, setAlloc] = useState(10);
  const [loading, setLoading] = useState(false);
  const [botSuggestion, setBotSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const getBotSuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a risk-aware AI trading bot. A user wants to mirror trades from ${leader.display_name} who has:
- Return: +${leader.return_pct}%
- Win Rate: ${leader.win_rate}%
- Max Drawdown: -${leader.max_drawdown_pct}%
- Sharpe Ratio: ${leader.sharpe_ratio}
- Total Trades: ${leader.total_trades}
- Rank Tier: ${leader.rank_tier}

The user plans to allocate ${alloc}% of their virtual balance to mirror this trader.

In 2 sentences, give a direct risk assessment: is this allocation achievable and wise? Mention the specific metrics.`,
      });
      setBotSuggestion(typeof res === 'string' ? res : res.response || '');
    } catch (_) {}
    setLoadingSuggestion(false);
  };

  const handleMirror = async () => {
    setLoading(true);
    try {
      await base44.entities.MirrorTrade.create({
        follower_user_id: currentUser?.id || 'demo',
        leader_user_id: leader.user_id,
        leader_display_name: leader.display_name,
        ticker: 'AUTO',
        trade_type: 'mirror',
        risk_allocation_pct: alloc,
        status: 'active',
        bot_suggestion: botSuggestion,
      });
      if (leader.id) {
        await base44.entities.TraderRanking.update(leader.id, {
          mirror_count: (leader.mirror_count || 0) + 1,
        });
      }
      onClose(true);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.85)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => onClose(false)}
    >
      <motion.div
        className="w-full max-w-sm bg-[#111827] border border-[#00d4aa]/30 rounded-2xl p-6 space-y-4"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <Copy size={16} className="text-[#00d4aa]" />
          <h3 className="text-sm font-bold text-[#f1f5f9]">Mirror {leader.display_name}</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Return', val: `+${leader.return_pct}%`, good: true },
            { label: 'Win Rate', val: `${leader.win_rate}%`, good: leader.win_rate > 60 },
            { label: 'Max DD', val: `-${leader.max_drawdown_pct}%`, good: leader.max_drawdown_pct < 15 },
          ].map(({ label, val, good }) => (
            <div key={label} className="bg-[#0f172a] rounded-xl p-2">
              <p className={`text-sm font-bold ${good ? 'text-[#00d4aa]' : 'text-red-400'}`}>{val}</p>
              <p className="text-[10px] text-[#475569]">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs text-[#64748b] mb-2 block">Risk Allocation: <span className="text-[#00d4aa] font-bold">{alloc}% of balance</span></label>
          <input type="range" min={1} max={50} value={alloc} onChange={e => setAlloc(Number(e.target.value))}
            className="w-full accent-[#00d4aa]" />
          <div className="flex justify-between text-[10px] text-[#475569] mt-1"><span>1%</span><span>25%</span><span>50%</span></div>
        </div>

        <button onClick={getBotSuggestion} disabled={loadingSuggestion}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-colors disabled:opacity-50">
          <Bot size={12} /> {loadingSuggestion ? 'Bot is thinking...' : 'Get Bot Risk Assessment'}
        </button>

        {botSuggestion && (
          <div className="p-3 bg-[#a78bfa]/08 border border-[#a78bfa]/20 rounded-xl">
            <p className="text-[11px] text-[#c4b5fd] leading-relaxed">{botSuggestion}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => onClose(false)} className="flex-1 py-2.5 rounded-xl text-xs text-[#64748b] border border-[#1e293b] hover:text-[#f1f5f9] transition-colors">Cancel</button>
          <button onClick={handleMirror} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#00d4aa] text-[#070b14] hover:bg-[#00d4aa]/90 disabled:opacity-50 transition-colors">
            {loading ? 'Activating...' : 'Mirror Trades'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LeaderboardTable({ traders, currentUser }) {
  const [expanded, setExpanded] = useState(null);
  const [mirrorTarget, setMirrorTarget] = useState(null);
  const [mirrored, setMirrored] = useState([]);

  return (
    <>
      <div className="space-y-2">
        {traders.map((t, i) => {
          const tier = TIER_CONFIG[t.rank_tier] || TIER_CONFIG.Bronze;
          const isExpanded = expanded === t.user_id;
          const isMirrored = mirrored.includes(t.user_id);

          return (
            <motion.div
              key={t.user_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-[#111827] border rounded-xl overflow-hidden transition-colors ${tier.border} hover:border-opacity-60`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Rank */}
                <div className="w-8 text-center">
                  <span className="text-sm font-bold" style={{ color: tier.color }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}30`, color: tier.color }}>
                  {t.avatar_initials || t.display_name?.slice(0, 2).toUpperCase()}
                </div>

                {/* Name + tier */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[#f1f5f9] truncate">{t.display_name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${tier.color}15`, color: tier.color }}>
                      {tier.emoji} {t.rank_tier}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-0.5">
                    {(t.badge_ids || []).slice(0, 3).map((b, bi) => (
                      <span key={bi} className="text-[10px] text-[#475569]">{b}</span>
                    ))}
                  </div>
                </div>

                {/* Key stats */}
                <div className="hidden sm:flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-bold text-[#00d4aa]">+{t.return_pct}%</p>
                    <p className="text-[10px] text-[#475569]">return</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#f1f5f9]">{t.win_rate}%</p>
                    <p className="text-[10px] text-[#475569]">win rate</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {t.mirror_enabled && (
                    <button
                      onClick={() => setMirrorTarget(t)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                        isMirrored
                          ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30'
                          : 'bg-[#00d4aa] text-[#070b14]'
                      }`}
                    >
                      <Copy size={10} /> {isMirrored ? 'Mirroring' : 'Mirror'}
                    </button>
                  )}
                  {t.mirror_count > 0 && (
                    <span className="text-[10px] text-[#475569] flex items-center gap-0.5">
                      <Users size={9} /> {t.mirror_count}
                    </span>
                  )}
                  <button onClick={() => setExpanded(isExpanded ? null : t.user_id)} className="text-[#475569] hover:text-[#94a3b8] p-1">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-[#1e293b] grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Total P&L', val: `+$${(t.total_pnl || 0).toLocaleString()}`, color: '#00d4aa' },
                        { label: 'Max Drawdown', val: `-${t.max_drawdown_pct || 0}%`, color: '#ef4444' },
                        { label: 'Sharpe Ratio', val: (t.sharpe_ratio || 0).toFixed(2), color: '#a78bfa' },
                        { label: 'Total Trades', val: t.total_trades || 0, color: '#94a3b8' },
                        { label: '🔥 Profit Streak', val: `${t.consecutive_profitable_days || 0} days`, color: '#f97316' },
                        { label: '🛡️ DD Streak', val: `${t.lowest_drawdown_streak || 0} days`, color: '#3b82f6' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="bg-[#0f172a] rounded-xl p-3 text-center">
                          <p className="text-sm font-bold" style={{ color }}>{val}</p>
                          <p className="text-[10px] text-[#475569] mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {mirrorTarget && (
          <MirrorModal
            leader={mirrorTarget}
            currentUser={currentUser}
            onClose={(success) => {
              if (success) setMirrored(m => [...m, mirrorTarget.user_id]);
              setMirrorTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}