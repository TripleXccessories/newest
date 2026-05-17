import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LIVE_TICKERS = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA', 'SPY', 'QQQ', 'NVDA', 'AMZN'];

function simulateLiveTick(base, volatility = 0.002) {
  const change = (Math.random() - 0.5) * 2 * volatility;
  return +(base * (1 + change)).toFixed(2);
}

const BASE_PRICES = {
  'BTC/USD': 63400, 'ETH/USD': 3180, 'AAPL': 187.5,
  'TSLA': 172.3, 'SPY': 524.8, 'QQQ': 444.2,
  'NVDA': 875.6, 'AMZN': 183.9,
};

export default function LiveModeToggle({ isLive, onToggle, ticker, onTickerChange, indicators }) {
  const [price, setPrice] = useState(BASE_PRICES[ticker] || 100);
  const [priceHistory, setPriceHistory] = useState([]);
  const [signal, setSignal] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const intervalRef = useRef(null);
  const priceRef = useRef(BASE_PRICES[ticker] || 100);

  useEffect(() => {
    priceRef.current = BASE_PRICES[ticker] || 100;
    setPrice(priceRef.current);
    setPriceHistory([]);
    setSignal(null);
  }, [ticker]);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        const next = simulateLiveTick(priceRef.current);
        priceRef.current = next;
        setPrice(next);
        setPriceHistory(h => [...h.slice(-29), next]);
      }, 1200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isLive]);

  const analyzeSignal = async () => {
    if (indicators.length === 0) return;
    setAnalyzing(true);
    const indStr = indicators.map(i => `${i.type.toUpperCase()}(${Object.entries(i.params || {}).map(([k,v])=>`${k}=${v}`).join(',')})`).join(', ');
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a real-time trading signal engine. Current live price of ${ticker}: $${price.toFixed(2)}.
Active strategy indicators: ${indStr}.
Based on current price action and indicator logic, generate an immediate trading signal.
Return JSON: { signal: "BUY"|"SELL"|"HOLD", confidence: 0-100, rationale: "one sentence" }`,
        response_json_schema: {
          type: 'object',
          properties: {
            signal: { type: 'string' },
            confidence: { type: 'number' },
            rationale: { type: 'string' },
          }
        }
      });
      setSignal(res);
    } catch (_) {}
    setAnalyzing(false);
  };

  const miniH = 40;
  const miniW = 160;
  const minP = Math.min(...priceHistory, price);
  const maxP = Math.max(...priceHistory, price);
  const range = maxP - minP || 1;
  const points = [...priceHistory, price].map((p, i, arr) =>
    `${(i / (arr.length - 1 || 1)) * miniW},${miniH - ((p - minP) / range) * miniH}`
  ).join(' ');

  const signalColor = signal?.signal === 'BUY' ? '#00d4aa' : signal?.signal === 'SELL' ? '#ef4444' : '#f59e0b';

  return (
    <div className="space-y-4">
      {/* Mode toggle header */}
      <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-[#334155]'}`} />
          <div>
            <p className="text-sm font-semibold text-[#f1f5f9]">{isLive ? 'LIVE Market Feed' : 'Historical Simulation Mode'}</p>
            <p className="text-xs text-[#475569]">{isLive ? 'Real-time simulated price feed active' : 'Run backtests against historical AI-modeled data'}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isLive
              ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
              : 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30 hover:bg-[#00d4aa]/20'
          }`}
        >
          <Radio size={12} /> {isLive ? 'Stop Live' : 'Go Live'}
        </button>
      </div>

      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Ticker selector */}
            <div className="flex gap-1.5 flex-wrap">
              {LIVE_TICKERS.map(t => (
                <button
                  key={t}
                  onClick={() => onTickerChange(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    ticker === t ? 'bg-[#a78bfa] text-[#070b14]' : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Live price card */}
            <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748b] mb-1">{ticker} · LIVE</p>
                <motion.p
                  key={price}
                  className="text-2xl font-bold text-[#f1f5f9]"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                >
                  ${price.toLocaleString()}
                </motion.p>
              </div>
              {priceHistory.length > 2 && (
                <svg width={miniW} height={miniH} className="opacity-60">
                  <polyline
                    points={points}
                    fill="none"
                    stroke={price >= priceHistory[0] ? '#00d4aa' : '#ef4444'}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            {/* Signal analysis */}
            <div className="flex items-center gap-3">
              <button
                onClick={analyzeSignal}
                disabled={analyzing || indicators.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#a78bfa] hover:bg-[#a78bfa]/90 text-[#070b14] transition-colors disabled:opacity-40"
              >
                {analyzing
                  ? <><RefreshCw size={12} className="animate-spin" /> Analyzing...</>
                  : <><Activity size={12} /> Get Live Signal</>
                }
              </button>
              {indicators.length === 0 && (
                <p className="text-[11px] text-[#475569] flex items-center gap-1">
                  <AlertTriangle size={11} /> Add indicators first
                </p>
              )}
            </div>

            {signal && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border"
                style={{ borderColor: `${signalColor}40`, background: `${signalColor}08` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-black" style={{ color: signalColor }}>{signal.signal}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: `${signalColor}20`, color: signalColor }}>
                    {signal.confidence}% confidence
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8]">{signal.rationale}</p>
                <p className="text-[10px] text-[#334155] mt-2">@ ${price.toLocaleString()} · {new Date().toLocaleTimeString()}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}