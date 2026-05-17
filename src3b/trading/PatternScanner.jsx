import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Bell, BellOff, RefreshCw, Zap, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PATTERNS = [
  { id: 'head_shoulders', name: 'Head & Shoulders', type: 'bearish', confidence_range: [55, 90] },
  { id: 'inv_head_shoulders', name: 'Inv. Head & Shoulders', type: 'bullish', confidence_range: [55, 88] },
  { id: 'ascending_triangle', name: 'Ascending Triangle', type: 'bullish', confidence_range: [60, 92] },
  { id: 'descending_triangle', name: 'Descending Triangle', type: 'bearish', confidence_range: [58, 87] },
  { id: 'symmetrical_triangle', name: 'Symmetrical Triangle', type: 'neutral', confidence_range: [50, 80] },
  { id: 'rising_wedge', name: 'Rising Wedge', type: 'bearish', confidence_range: [52, 85] },
  { id: 'falling_wedge', name: 'Falling Wedge', type: 'bullish', confidence_range: [52, 84] },
  { id: 'double_top', name: 'Double Top', type: 'bearish', confidence_range: [60, 90] },
  { id: 'double_bottom', name: 'Double Bottom', type: 'bullish', confidence_range: [62, 91] },
  { id: 'bull_flag', name: 'Bull Flag', type: 'bullish', confidence_range: [65, 93] },
];

const TICKERS = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA', 'SPY', 'NVDA', 'QQQ', 'AMZN', 'MSFT', 'SOL/USD'];

function randomPattern(ticker) {
  const pat = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  const [lo, hi] = pat.confidence_range;
  const confidence = Math.floor(lo + Math.random() * (hi - lo));
  const stage = confidence > 78 ? 'confirmed' : confidence > 62 ? 'forming' : 'early';
  return {
    id: `${ticker}_${pat.id}_${Date.now()}`,
    ticker,
    patternId: pat.id,
    name: pat.name,
    type: pat.type,
    confidence,
    stage,
    timeframe: ['1H', '4H', '1D'][Math.floor(Math.random() * 3)],
    detectedAt: new Date().toISOString(),
  };
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const TYPE_CONFIG = {
  bullish: { color: '#00d4aa', icon: TrendingUp, bg: 'bg-[#00d4aa]/10 border-[#00d4aa]/20' },
  bearish: { color: '#ef4444', icon: TrendingDown, bg: 'bg-red-500/10 border-red-500/20' },
  neutral: { color: '#f59e0b', icon: Zap, bg: 'bg-[#f59e0b]/10 border-[#f59e0b]/20' },
};

const STAGE_COLOR = { confirmed: '#00d4aa', forming: '#f59e0b', early: '#64748b' };

export default function PatternScanner({ watchedTickers = [] }) {
  const [patterns, setPatterns] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifyOn, setNotifyOn] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('all');
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const prevPatternIds = useRef(new Set());

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      const tickers = watchedTickers.length > 0 ? watchedTickers : TICKERS.slice(0, 6);
      // Each ticker randomly gets 0-2 patterns
      const found = [];
      tickers.forEach(t => {
        const n = Math.random() > 0.4 ? (Math.random() > 0.6 ? 2 : 1) : 0;
        for (let i = 0; i < n; i++) found.push(randomPattern(t));
      });

      // Notify on new high-confidence patterns
      if (notifyOn) {
        found.forEach(p => {
          if (!prevPatternIds.current.has(p.ticker + p.patternId) && p.confidence >= 72) {
            setNotifications(prev => [
              { id: p.id, text: `${p.ticker}: ${p.name} (${p.confidence}% conf · ${p.stage})`, type: p.type, time: new Date().toISOString() },
              ...prev.slice(0, 4),
            ]);
          }
        });
      }
      found.forEach(p => prevPatternIds.current.add(p.ticker + p.patternId));

      setPatterns(found.sort((a, b) => b.confidence - a.confidence));
      setScanning(false);
    }, 900);
  };

  useEffect(() => { scan(); }, []);

  const getAIAnalysis = async (pattern) => {
    if (aiAnalysis[pattern.id]) return;
    setAnalyzingId(pattern.id);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `A ${pattern.name} pattern has been detected on ${pattern.ticker} (${pattern.timeframe} timeframe) with ${pattern.confidence}% confidence. Stage: ${pattern.stage}. Type: ${pattern.type}.
      
Provide a concise trading insight (2 sentences max): what this pattern implies for price action, and one specific actionable note for a paper trader. Be direct.`,
    });
    setAiAnalysis(prev => ({ ...prev, [pattern.id]: res }));
    setAnalyzingId(null);
  };

  const displayed = filter === 'all' ? patterns : patterns.filter(p => p.type === filter);

  return (
    <div className="space-y-4">
      {/* Notification bar */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.neutral;
              return (
                <div key={n.id} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${cfg.bg}`}>
                  <Bell size={11} style={{ color: cfg.color }} />
                  <span className="flex-1 font-medium" style={{ color: cfg.color }}>{n.text}</span>
                  <span className="text-[#475569]">{timeAgo(n.time)}</span>
                  <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-[#475569] hover:text-[#94a3b8]">×</button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1">
          {['all', 'bullish', 'bearish', 'neutral'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f
                ? f === 'bullish' ? 'bg-[#00d4aa] text-[#070b14]'
                : f === 'bearish' ? 'bg-red-500 text-white'
                : f === 'neutral' ? 'bg-[#f59e0b] text-[#070b14]'
                : 'bg-[#a78bfa] text-[#070b14]'
                : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'
            }`}>
              {f === 'all' ? `All (${patterns.length})` : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifyOn(v => !v)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${notifyOn ? 'text-[#00d4aa]' : 'text-[#475569]'}`}
          >
            {notifyOn ? <Bell size={12} /> : <BellOff size={12} />}
            <span className="hidden sm:inline">{notifyOn ? 'Alerts On' : 'Alerts Off'}</span>
          </button>
          <button onClick={scan} disabled={scanning} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
            <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Pattern list */}
      {displayed.length === 0 ? (
        <div className="text-center py-8 text-[#475569] text-xs">
          <Eye size={24} className="mx-auto mb-2 opacity-30" />
          No patterns detected on current scan.
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {displayed.map((p, i) => {
            const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.neutral;
            const IconComp = cfg.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`p-3.5 rounded-xl border ${cfg.bg} space-y-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <IconComp size={14} style={{ color: cfg.color }} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#f1f5f9]">{p.ticker}</span>
                        <span className="text-[10px] text-[#475569]">· {p.timeframe}</span>
                      </div>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: cfg.color }}>{p.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${STAGE_COLOR[p.stage]}20`, color: STAGE_COLOR[p.stage] }}>
                        {p.stage}
                      </span>
                      <span className="text-xs font-black" style={{ color: cfg.color }}>{p.confidence}%</span>
                    </div>
                    <p className="text-[9px] text-[#334155] mt-0.5">{timeAgo(p.detectedAt)}</p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: cfg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.confidence}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                  />
                </div>

                {/* AI analysis */}
                {aiAnalysis[p.id] ? (
                  <p className="text-[11px] text-[#94a3b8] leading-relaxed border-l-2 pl-2" style={{ borderColor: cfg.color }}>
                    {aiAnalysis[p.id]}
                  </p>
                ) : (
                  <button
                    onClick={() => getAIAnalysis(p)}
                    disabled={analyzingId === p.id}
                    className="text-[10px] text-[#475569] hover:text-[#a78bfa] transition-colors flex items-center gap-1"
                  >
                    {analyzingId === p.id
                      ? <><RefreshCw size={9} className="animate-spin" /> Analyzing...</>
                      : <><Zap size={9} /> Get AI insight</>
                    }
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}