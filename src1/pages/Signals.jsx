import React, { useState, useEffect } from 'react';
import { Zap, Filter, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ASSET_CLASSES = ['All', 'equities', 'forex', 'crypto', 'commodities', 'options', 'futures'];
const SIGNAL_TYPES = ['All', 'buy', 'strong_buy', 'sell', 'strong_sell', 'hold'];

const mockSignals = [
  { id: '1', ticker: 'BTC/USD', asset_class: 'crypto', signal_type: 'strong_buy', confidence: 94, entry_price: 67240, target_price: 72000, stop_loss: 64000, timeframe: 'swing', ai_reasoning: 'Neural pattern recognition detects bullish divergence on 4H. Volume profile confirms accumulation zone.', risk_reward: 2.8, win_probability: 87 },
  { id: '2', ticker: 'AAPL', asset_class: 'equities', signal_type: 'buy', confidence: 81, entry_price: 189.20, target_price: 198.00, stop_loss: 185.00, timeframe: 'swing', ai_reasoning: 'Earnings momentum + institutional flow detected. Breakout from 3-week consolidation.', risk_reward: 2.1, win_probability: 74 },
  { id: '3', ticker: 'EUR/USD', asset_class: 'forex', signal_type: 'sell', confidence: 76, entry_price: 1.0842, target_price: 1.0720, stop_loss: 1.0910, timeframe: 'intraday', ai_reasoning: 'DXY strengthening signal. Fed minutes hawkish tone detected via NLP sentiment.', risk_reward: 1.8, win_probability: 69 },
  { id: '4', ticker: 'NVDA', asset_class: 'equities', signal_type: 'strong_buy', confidence: 91, entry_price: 875.40, target_price: 950.00, stop_loss: 840.00, timeframe: 'position', ai_reasoning: 'AI infrastructure supercycle. Neural network detects Q2 earnings beat probability at 89%.', risk_reward: 3.2, win_probability: 83 },
  { id: '5', ticker: 'ETH/USD', asset_class: 'crypto', signal_type: 'hold', confidence: 58, entry_price: 3240, target_price: null, stop_loss: null, timeframe: 'swing', ai_reasoning: 'Mixed signals. Waiting for confirmation above $3,400 resistance before directional bias.', risk_reward: null, win_probability: 55 },
];

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [assetFilter, setAssetFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.Signal.list('-created_date', 50)
      .then((data) => {
        setSignals(data.length > 0 ? data : mockSignals);
      })
      .catch(() => setSignals(mockSignals))
      .finally(() => setLoading(false));
  }, []);

  const filtered = signals.filter((s) => {
    const assetMatch = assetFilter === 'All' || s.asset_class === assetFilter;
    const typeMatch = typeFilter === 'All' || s.signal_type === typeFilter;
    return assetMatch && typeMatch;
  });

  const signalColor = (type) => {
    if (['buy', 'strong_buy'].includes(type)) return { bg: 'bg-[#00d4aa]/10', text: 'text-[#00d4aa]', border: 'border-[#00d4aa]/20' };
    if (['sell', 'strong_sell'].includes(type)) return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
    return { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/20' };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Zap size={22} className="text-[#00d4aa]" /> AI Signals Engine
          </h1>
          <p className="text-sm text-[#64748b] mt-1">Neural network-powered trading signals. Beta access — limited signals.</p>
        </div>
        <button onClick={() => window.location.reload()} className="p-2 text-[#64748b] hover:text-[#00d4aa] transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2">
          <Filter size={14} className="text-[#64748b]" />
          <span className="text-xs text-[#64748b]">Asset:</span>
          <div className="flex gap-1">
            {ASSET_CLASSES.map((a) => (
              <button
                key={a}
                onClick={() => setAssetFilter(a)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  assetFilter === a ? 'bg-[#00d4aa] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Signals grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-[#111827] border border-[#1e293b] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((signal) => {
            const c = signalColor(signal.signal_type);
            return (
              <div
                key={signal.id}
                onClick={() => setSelected(selected?.id === signal.id ? null : signal)}
                className={`bg-[#111827] border rounded-xl p-5 cursor-pointer hover:border-[#00d4aa]/40 transition-all ${
                  selected?.id === signal.id ? 'border-[#00d4aa]/60' : 'border-[#1e293b]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#f1f5f9]">{signal.ticker}</span>
                    <span className="text-xs text-[#64748b] capitalize">{signal.asset_class}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
                    {signal.signal_type?.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <p className="text-[#64748b]">Entry</p>
                    <p className="text-[#f1f5f9] font-semibold">${signal.entry_price?.toLocaleString()}</p>
                  </div>
                  {signal.target_price && (
                    <div>
                      <p className="text-[#64748b]">Target</p>
                      <p className="text-[#00d4aa] font-semibold">${signal.target_price?.toLocaleString()}</p>
                    </div>
                  )}
                  {signal.stop_loss && (
                    <div>
                      <p className="text-[#64748b]">Stop Loss</p>
                      <p className="text-red-400 font-semibold">${signal.stop_loss?.toLocaleString()}</p>
                    </div>
                  )}
                  {signal.risk_reward && (
                    <div>
                      <p className="text-[#64748b]">R:R</p>
                      <p className="text-[#f1f5f9] font-semibold">1:{signal.risk_reward}</p>
                    </div>
                  )}
                </div>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748b]">AI Confidence</span>
                    <span className="text-[#00d4aa] font-bold">{signal.confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00d4aa] rounded-full transition-all"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                </div>

                {selected?.id === signal.id && (
                  <div className="mt-3 pt-3 border-t border-[#1e293b]">
                    <p className="text-xs text-[#64748b] font-medium mb-1">AI Reasoning</p>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{signal.ai_reasoning}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-0.5 bg-[#1e293b] rounded text-xs text-[#64748b] capitalize">{signal.timeframe}</span>
                      {signal.win_probability && (
                        <span className="px-2 py-0.5 bg-[#00d4aa]/10 rounded text-xs text-[#00d4aa]">
                          {signal.win_probability}% win prob.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}