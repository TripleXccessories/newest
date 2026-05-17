import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, TrendingUp, TrendingDown, Zap, Filter, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PatternScanner from '@/components/trading/PatternScanner';

const ALL_ASSETS = [
  { ticker: 'BTC/USD', class: 'crypto', basePrice: 63400 },
  { ticker: 'ETH/USD', class: 'crypto', basePrice: 3180 },
  { ticker: 'SOL/USD', class: 'crypto', basePrice: 148 },
  { ticker: 'AAPL', class: 'equity', basePrice: 187.5 },
  { ticker: 'TSLA', class: 'equity', basePrice: 172.3 },
  { ticker: 'NVDA', class: 'equity', basePrice: 875.6 },
  { ticker: 'SPY', class: 'equity', basePrice: 524.8 },
  { ticker: 'QQQ', class: 'equity', basePrice: 444.2 },
  { ticker: 'AMZN', class: 'equity', basePrice: 183.9 },
  { ticker: 'MSFT', class: 'equity', basePrice: 412.3 },
  { ticker: 'EUR/USD', class: 'forex', basePrice: 1.0842 },
  { ticker: 'GBP/USD', class: 'forex', basePrice: 1.2734 },
  { ticker: 'GLD', class: 'commodity', basePrice: 234.5 },
  { ticker: 'OIL/USD', class: 'commodity', basePrice: 82.4 },
];

function randomSign() { return Math.random() > 0.5 ? 1 : -1; }
function randBetween(a, b) { return a + Math.random() * (b - a); }

function generateAssetData(asset) {
  const changePct = randomSign() * randBetween(0.1, 4.5);
  const rsi = randBetween(20, 80);
  const macd = randomSign() * randBetween(0.1, 3.0);
  const bbPos = randBetween(0, 100); // 0=lower band, 100=upper band
  const volume = randBetween(0.5, 3.0); // relative volume vs avg
  return {
    ...asset,
    price: +(asset.basePrice * (1 + changePct / 100)).toFixed(asset.basePrice > 100 ? 2 : 4),
    changePct: +changePct.toFixed(2),
    rsi: +rsi.toFixed(1),
    macd: +macd.toFixed(3),
    bbPos: +bbPos.toFixed(0),
    volume: +volume.toFixed(2),
  };
}

function checkIndicator(asset, ind) {
  switch (ind.type) {
    case 'rsi': {
      const period = ind.params?.period || 14;
      const ob = ind.params?.overbought || 70;
      const os = ind.params?.oversold || 30;
      return asset.rsi < os ? 'buy' : asset.rsi > ob ? 'sell' : null;
    }
    case 'macd':
      return asset.macd > 0 ? 'buy' : 'sell';
    case 'bb':
      return asset.bbPos < 15 ? 'buy' : asset.bbPos > 85 ? 'sell' : null;
    case 'volume':
      return asset.volume > 1.5 ? 'buy' : null;
    default:
      return null;
  }
}

function evaluateStrategy(asset, indicators, logic) {
  if (!indicators || indicators.length === 0) return null;
  const signals = indicators.map(ind => checkIndicator(asset, ind)).filter(Boolean);
  if (logic === 'AND') {
    if (signals.length !== indicators.length) return null;
    const buys = signals.filter(s => s === 'buy').length;
    const sells = signals.filter(s => s === 'sell').length;
    return buys === signals.length ? 'buy' : sells === signals.length ? 'sell' : null;
  } else {
    const buys = signals.filter(s => s === 'buy').length;
    const sells = signals.filter(s => s === 'sell').length;
    return buys > sells ? 'buy' : sells > buys ? 'sell' : null;
  }
}

export default function MarketScreener({ indicators = [], logic = 'AND' }) {
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState('');
  const [screenerTab, setScreenerTab] = useState('signals'); // 'signals' | 'patterns'

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setAssets(ALL_ASSETS.map(generateAssetData));
      setLastUpdated(new Date());
      setLoading(false);
    }, 600);
  };

  useEffect(() => { refresh(); }, []);

  const filtered = assets.filter(a => {
    const signal = evaluateStrategy(a, indicators, logic);
    const signalMatch = filter === 'all' || signal === filter;
    const classMatch = classFilter === 'all' || a.class === classFilter;
    const searchMatch = !search || a.ticker.toLowerCase().includes(search.toLowerCase());
    return signalMatch && classMatch && searchMatch;
  }).map(a => ({ ...a, signal: evaluateStrategy(a, indicators, logic) }));

  const buyCount = assets.filter(a => evaluateStrategy(a, indicators, logic) === 'buy').length;
  const sellCount = assets.filter(a => evaluateStrategy(a, indicators, logic) === 'sell').length;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-[#0f172a] border border-[#1e293b] rounded-xl p-1">
        {[
          { id: 'signals', label: 'Signal Screener', icon: Zap },
          { id: 'patterns', label: 'Pattern Scanner', icon: Eye },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setScreenerTab(id)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            screenerTab === id ? 'bg-[#a78bfa] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
          }`}>
            <Icon size={11} /> {label}
          </button>
        ))}
      </div>

      {screenerTab === 'patterns' && <PatternScanner />}
      {screenerTab === 'signals' && <>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Assets Screened', value: assets.length, color: '#64748b' },
          { label: 'BUY Signals', value: buyCount, color: '#00d4aa' },
          { label: 'SELL Signals', value: sellCount, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-center">
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-[#475569]">{label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-32">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ticker..."
            className="w-full pl-7 pr-3 py-1.5 bg-[#0f172a] border border-[#1e293b] rounded-lg text-xs text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#a78bfa]"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'buy', 'sell'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? f === 'buy' ? 'bg-[#00d4aa] text-[#070b14]' : f === 'sell' ? 'bg-red-500 text-white' : 'bg-[#a78bfa] text-[#070b14]'
                : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'
            }`}>
              {f === 'all' ? 'All' : f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', 'crypto', 'equity', 'forex', 'commodity'].map(c => (
            <button key={c} onClick={() => setClassFilter(c)} className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors capitalize ${
              classFilter === c ? 'bg-[#1e293b] text-[#f1f5f9] border border-[#334155]' : 'text-[#475569] hover:text-[#64748b]'
            }`}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
        <button onClick={refresh} disabled={loading} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {indicators.length === 0 && (
        <div className="p-3 bg-[#0f172a] border border-[#f59e0b]/20 rounded-xl text-xs text-[#f59e0b] flex items-center gap-2">
          <Filter size={12} /> No strategy indicators loaded. Go to Backtester → Builder to create one, then load it here.
        </div>
      )}

      {/* Asset list */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-[#475569] text-xs">No assets match your current filters.</div>
          ) : filtered.map((a, i) => (
            <motion.div
              key={a.ticker}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 p-3 bg-[#111827] border border-[#1e293b] rounded-xl hover:border-[#334155] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#f1f5f9]">{a.ticker}</p>
                  <span className="text-[9px] text-[#475569] capitalize">{a.class}</span>
                </div>
                <div className="flex gap-2 mt-0.5 text-[10px] text-[#475569]">
                  <span>RSI:{a.rsi}</span>
                  <span>MACD:{a.macd > 0 ? '+' : ''}{a.macd}</span>
                  <span>BB:{a.bbPos}%</span>
                  <span>Vol:{a.volume}x</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#f1f5f9]">${a.price?.toLocaleString()}</p>
                <p className={`text-[10px] font-semibold ${a.changePct >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                  {a.changePct >= 0 ? '+' : ''}{a.changePct}%
                </p>
              </div>
              {a.signal ? (
                <div className={`px-2 py-1 rounded-lg text-xs font-black flex-shrink-0 ${a.signal === 'buy' ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-red-500/15 text-red-400'}`}>
                  {a.signal.toUpperCase()}
                </div>
              ) : (
                <div className="px-2 py-1 rounded-lg text-xs text-[#334155] flex-shrink-0 bg-[#0f172a]">—</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {lastUpdated && (
        <p className="text-[10px] text-[#334155]">Last updated: {lastUpdated.toLocaleTimeString()}</p>
      )}
      </>}
    </div>
  );
}