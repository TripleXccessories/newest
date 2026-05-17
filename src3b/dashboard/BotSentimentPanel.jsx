import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, RefreshCw, Zap } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ARCHETYPE_BIAS = {
  Guide:      { assets: ['BTC', 'ETH', 'SPY'], tone: 'balanced', label: 'Balanced Navigator' },
  Oracle:     { assets: ['BTC', 'ETH', 'LINK'], tone: 'analytical', label: 'Data-Driven Oracle' },
  Guardian:   { assets: ['SPY', 'GLD', 'BND'], tone: 'defensive', label: 'Capital Defender' },
  Creator:    { assets: ['ETH', 'SOL', 'AAPL'], tone: 'innovative', label: 'System Builder' },
  Challenger: { assets: ['BTC', 'NVDA', 'TSLA'], tone: 'aggressive', label: 'Thesis Tester' },
  Catalyst:   { assets: ['SOL', 'AVAX', 'TSLA'], tone: 'momentum', label: 'Momentum Rider' },
};

function generateSimulatedHistory(base, volatility, length = 20) {
  const pts = [];
  let val = base;
  for (let i = 0; i < length; i++) {
    val = Math.max(0, Math.min(100, val + (Math.random() - 0.48) * volatility));
    pts.push({ t: i, v: Math.round(val * 10) / 10 });
  }
  return pts;
}

export default function BotSentimentPanel({ activeBot, archetypeColor }) {
  const [sentimentData, setSentimentData] = useState(null);
  const [trendHistory, setTrendHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const bias = ARCHETYPE_BIAS[activeBot?.archetype] || ARCHETYPE_BIAS.Guide;
  const color = archetypeColor || '#00d4aa';

  const fetchSentiment = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('cryptoSentiment', {}).catch(() => null);
    const raw = res?.data;
    const score = raw?.overall_score ?? raw?.score ?? (50 + Math.round((Math.random() - 0.5) * 30));
    const trend = raw?.trend ?? (score > 55 ? 'bullish' : score < 45 ? 'bearish' : 'neutral');
    setSentimentData({ score, trend, raw });
    setTrendHistory(prev => {
      const next = [...prev, { t: prev.length, v: score }];
      return next.slice(-20);
    });
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (!activeBot) return;
    // Seed with simulated history then fetch live
    const volatility = activeBot.archetype === 'Challenger' ? 18 : activeBot.archetype === 'Guardian' ? 6 : 12;
    setTrendHistory(generateSimulatedHistory(55, volatility));
    fetchSentiment();
    intervalRef.current = setInterval(fetchSentiment, 30000);
    return () => clearInterval(intervalRef.current);
  }, [activeBot?.id]);

  if (!activeBot) return null;

  const score = sentimentData?.score ?? 55;
  const trend = sentimentData?.trend ?? 'neutral';
  const isBullish = trend === 'bullish' || score > 55;

  const opportunities = bias.assets.map(ticker => ({
    ticker,
    signal: isBullish ? 'WATCH' : 'CAUTION',
    confidence: Math.round(50 + Math.random() * 40),
    change: ((Math.random() - 0.45) * 8).toFixed(2),
  }));

  return (
    <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-5 space-y-4"
      style={{ borderColor: `${color}20` }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
            <Zap size={13} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#f1f5f9]">Market Sentiment</p>
            <p className="text-[10px]" style={{ color }}>{bias.label} · {activeBot.name}</p>
          </div>
        </div>
        <button onClick={fetchSentiment} disabled={loading}
          className="p-1.5 rounded-lg border border-[#1e293b] text-[#475569] hover:text-[#f1f5f9] transition-colors">
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Score + Trend */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 shrink-0"
          style={{ borderColor: color, background: `${color}10` }}>
          <p className="text-xl font-black" style={{ color }}>{score}</p>
          <p className="text-[8px] text-[#475569] uppercase tracking-widest">score</p>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            {isBullish ? <TrendingUp size={13} className="text-[#00d4aa]" /> : <TrendingDown size={13} className="text-red-400" />}
            <span className="text-xs font-bold capitalize" style={{ color: isBullish ? '#00d4aa' : '#f87171' }}>{trend}</span>
          </div>
          <div className="h-1 rounded-full bg-[#1e293b] overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8 }} />
          </div>
          {lastUpdated && (
            <p className="text-[9px] text-[#334155] mt-1">Updated {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
      </div>

      {/* Trend line */}
      {trendHistory.length > 2 && (
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendHistory}>
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: `1px solid ${color}30`, borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [`${v}`, 'Sentiment']}
                labelFormatter={() => ''}
              />
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Opportunities */}
      <div>
        <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">Archetype Watchlist</p>
        <div className="space-y-1.5">
          {opportunities.map(op => (
            <div key={op.ticker} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b]">
              <span className="text-xs font-bold text-[#f1f5f9]">{op.ticker}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold ${parseFloat(op.change) >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                  {parseFloat(op.change) >= 0 ? '+' : ''}{op.change}%
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                  style={{ background: `${color}15`, color }}>
                  {op.signal} {op.confidence}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}