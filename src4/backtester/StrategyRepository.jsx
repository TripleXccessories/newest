import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Star, Users, TrendingUp, Download, ChevronDown, ChevronUp, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function StarRating({ avg, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={11}
          className={i <= Math.round(avg) ? 'text-[#f59e0b]' : 'text-[#1e293b]'}
          fill={i <= Math.round(avg) ? '#f59e0b' : 'none'}
        />
      ))}
      <span className="text-[10px] text-[#64748b] ml-0.5">({count})</span>
    </div>
  );
}

function StrategyCard({ strategy, currentUser, onRate, onSubscribe, onLoad }) {
  const [expanded, setExpanded] = useState(false);
  const isSubscribed = (strategy.subscribers || []).includes(currentUser?.id);
  const myRating = (strategy.ratings || []).find(r => r.user_id === currentUser?.id);
  const [hoverRating, setHoverRating] = useState(0);
  const roiColor = (strategy.roi_percent || 0) >= 0 ? '#00d4aa' : '#ef4444';

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden hover:border-[#a78bfa]/30 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#f1f5f9] truncate">{strategy.title}</p>
            <p className="text-xs text-[#475569] mt-0.5">by {strategy.author_name || 'Anonymous'} · {strategy.ticker}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-base font-black" style={{ color: roiColor }}>
              {(strategy.roi_percent || 0) >= 0 ? '+' : ''}{(strategy.roi_percent || 0).toFixed(1)}%
            </p>
            <p className="text-[10px] text-[#475569]">ROI</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <StarRating avg={strategy.avg_rating || 0} count={(strategy.ratings || []).length} />
          <span className="text-[10px] text-[#64748b] flex items-center gap-1">
            <Users size={9} /> {(strategy.subscribers || []).length}
          </span>
          <span className="text-[10px] text-[#64748b]">W:{(strategy.win_rate || 0).toFixed(0)}%</span>
          <span className="text-[10px] text-[#64748b]">SR:{(strategy.sharpe_ratio || 0).toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {/* Rate */}
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => onRate(strategy, s)}
                className="p-0.5"
              >
                <Star
                  size={12}
                  className={(hoverRating || myRating?.score || 0) >= s ? 'text-[#f59e0b]' : 'text-[#334155]'}
                  fill={(hoverRating || myRating?.score || 0) >= s ? '#f59e0b' : 'none'}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto">
            <button
              onClick={() => onLoad(strategy)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#1e293b] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
            >
              <Download size={10} /> Load
            </button>
            <button
              onClick={() => onSubscribe(strategy)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                isSubscribed
                  ? 'bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/30'
                  : 'bg-[#a78bfa] text-[#070b14]'
              }`}
            >
              {isSubscribed ? '✓ Subscribed' : '+ Subscribe'}
            </button>
            <button onClick={() => setExpanded(!expanded)} className="text-[#475569] hover:text-[#94a3b8]">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[#1e293b] pt-3 space-y-2">
              {strategy.description && (
                <p className="text-xs text-[#64748b]">{strategy.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {(strategy.indicators || []).map((ind, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-[#1e293b] text-[#94a3b8]">
                    {ind.type?.toUpperCase()}
                    {Object.keys(ind.params || {}).length > 0 && ` (${Object.entries(ind.params).map(([k,v])=>`${k}=${v}`).join(', ')})`}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: 'Max DD', val: `-${(strategy.max_drawdown_percent||0).toFixed(1)}%`, bad: true },
                  { label: 'Trades', val: strategy.total_trades || '—' },
                  { label: 'Period', val: strategy.period || '—' },
                ].map(({ label, val, bad }) => (
                  <div key={label} className="text-center bg-[#0f172a] rounded-lg py-2">
                    <p className={`text-xs font-bold ${bad ? 'text-red-400' : 'text-[#94a3b8]'}`}>{val}</p>
                    <p className="text-[10px] text-[#475569]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StrategyRepository({ currentUser, currentResult, currentIndicators, currentTicker, currentPeriod, currentLogic, onLoadStrategy }) {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);
  const [publishForm, setPublishForm] = useState({ title: '', description: '' });
  const [publishing, setPublishing] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SharedStrategy.filter({ is_public: true }, '-avg_rating', 50);
      setStrategies(data);
    } catch (_) {}
    setLoading(false);
  };

  const handlePublish = async () => {
    if (!publishForm.title || currentIndicators.length === 0) return;
    setPublishing(true);
    await base44.entities.SharedStrategy.create({
      user_id: currentUser?.id || 'anon',
      author_name: currentUser?.full_name || 'Anonymous',
      title: publishForm.title,
      description: publishForm.description,
      indicators: currentIndicators,
      logic: currentLogic || 'AND',
      ticker: currentTicker,
      period: currentPeriod,
      roi_percent: currentResult?.roi_percent || 0,
      win_rate: currentResult?.win_rate || 0,
      sharpe_ratio: currentResult?.sharpe_ratio || 0,
      max_drawdown_percent: currentResult?.max_drawdown_percent || 0,
      total_trades: currentResult?.total_trades || 0,
      ratings: [],
      avg_rating: 0,
      subscribers: [],
      is_public: true,
    });
    setPublishForm({ title: '', description: '' });
    setShowPublish(false);
    setPublishing(false);
    load();
  };

  const handleRate = async (strategy, score) => {
    if (!currentUser) return;
    const existing = (strategy.ratings || []).filter(r => r.user_id !== currentUser.id);
    const newRatings = [...existing, { user_id: currentUser.id, score }];
    const avgRating = newRatings.reduce((s, r) => s + r.score, 0) / newRatings.length;
    await base44.entities.SharedStrategy.update(strategy.id, { ratings: newRatings, avg_rating: +avgRating.toFixed(2) });
    load();
  };

  const handleSubscribe = async (strategy) => {
    if (!currentUser) return;
    const subs = strategy.subscribers || [];
    const isSubbed = subs.includes(currentUser.id);
    const newSubs = isSubbed ? subs.filter(s => s !== currentUser.id) : [...subs, currentUser.id];
    await base44.entities.SharedStrategy.update(strategy.id, { subscribers: newSubs });
    load();
  };

  const sorted = [...strategies].sort((a, b) => {
    if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
    if (sortBy === 'roi') return (b.roi_percent || 0) - (a.roi_percent || 0);
    return (b.subscribers?.length || 0) - (a.subscribers?.length || 0);
  });

  const canPublish = currentIndicators.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {[
            { id: 'rating', label: 'Top Rated' },
            { id: 'roi', label: 'Best ROI' },
            { id: 'subs', label: 'Popular' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === s.id ? 'bg-[#a78bfa] text-[#070b14]' : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowPublish(true)}
          disabled={!canPublish}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00d4aa] text-[#070b14] hover:bg-[#00d4aa]/90 transition-colors disabled:opacity-40"
          title={!canPublish ? 'Build a strategy first' : 'Publish your strategy'}
        >
          <Share2 size={11} /> Publish Mine
        </button>
      </div>

      {/* Publish modal */}
      <AnimatePresence>
        {showPublish && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[#0f172a] border border-[#00d4aa]/30 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#f1f5f9]">Publish Strategy</p>
              <button onClick={() => setShowPublish(false)} className="text-[#64748b] hover:text-[#f1f5f9]"><X size={14} /></button>
            </div>
            <div className="text-xs text-[#475569] flex flex-wrap gap-1.5">
              {currentIndicators.map((ind, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-[#1e293b] text-[#94a3b8]">{ind.type?.toUpperCase()}</span>
              ))}
            </div>
            <input
              value={publishForm.title}
              onChange={e => setPublishForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Strategy name..."
              className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
            />
            <textarea
              value={publishForm.description}
              onChange={e => setPublishForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe your strategy logic..."
              rows={2}
              className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa] resize-none"
            />
            {currentResult && (
              <p className="text-[11px] text-[#475569]">
                Will publish with: ROI {currentResult.roi_percent?.toFixed(1)}% · Win Rate {currentResult.win_rate?.toFixed(0)}% · Sharpe {currentResult.sharpe_ratio?.toFixed(2)}
              </p>
            )}
            <button
              onClick={handlePublish}
              disabled={!publishForm.title || publishing}
              className="w-full py-2 rounded-xl text-sm font-bold bg-[#00d4aa] text-[#070b14] hover:bg-[#00d4aa]/90 transition-colors disabled:opacity-40"
            >
              {publishing ? 'Publishing...' : 'Publish to Community'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#a78bfa] rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-10 text-[#475569] text-sm">
          <Share2 size={28} className="mx-auto mb-3 opacity-20" />
          No strategies published yet. Be the first!
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(s => (
            <StrategyCard
              key={s.id}
              strategy={s}
              currentUser={currentUser}
              onRate={handleRate}
              onSubscribe={handleSubscribe}
              onLoad={strat => onLoadStrategy(strat)}
            />
          ))}
        </div>
      )}
    </div>
  );
}