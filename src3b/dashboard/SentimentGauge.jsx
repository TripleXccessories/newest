import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SCORE_COLORS = [
  { max: 25,  color: '#ef4444', bg: '#ef444415' },
  { max: 45,  color: '#f97316', bg: '#f9731615' },
  { max: 55,  color: '#94a3b8', bg: '#94a3b815' },
  { max: 75,  color: '#00d4aa', bg: '#00d4aa15' },
  { max: 100, color: '#22c55e', bg: '#22c55e15' },
];

function getStyle(score) {
  return SCORE_COLORS.find(s => score <= s.max) || SCORE_COLORS[4];
}

export default function SentimentGauge() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSentiment = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('cryptoSentiment', {});
      setData(res.data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchSentiment(); }, []);

  const style = data ? getStyle(data.overall_score) : { color: '#64748b', bg: '#1e293b' };
  const rotation = data ? (data.overall_score / 100) * 180 - 90 : -90;

  const TrendIcon = data?.trend === 'rising' ? TrendingUp : data?.trend === 'falling' ? TrendingDown : Minus;

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#f1f5f9] flex items-center gap-2">
          <Activity size={16} className="text-[#c084fc]" /> Crypto Sentiment
        </h2>
        <button
          onClick={fetchSentiment}
          disabled={loading}
          className="text-[#64748b] hover:text-[#f1f5f9] transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#c084fc] rounded-full animate-spin" />
          <p className="text-xs text-[#475569]">Scanning feeds...</p>
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 120 65" className="w-36">
              {/* Background arc */}
              <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
              {/* Colored arc */}
              <path
                d="M10,60 A50,50 0 0,1 110,60"
                fill="none"
                stroke={style.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(data.overall_score / 100) * 157} 157`}
                opacity="0.8"
              />
              {/* Needle */}
              <motion.line
                x1="60" y1="60"
                x2="60" y2="18"
                stroke={style.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ rotate: -90 }}
                animate={{ rotate: rotation }}
                style={{ transformOrigin: '60px 60px' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <circle cx="60" cy="60" r="4" fill={style.color} />
            </svg>

            <div className="text-center -mt-1">
              <p className="text-2xl font-bold" style={{ color: style.color }}>{data.overall_score}</p>
              <p className="text-xs font-semibold" style={{ color: style.color }}>{data.overall_label}</p>
            </div>
          </div>

          {/* BTC / ETH mini bars */}
          <div className="space-y-2">
            {[{ label: 'BTC', score: data.btc_score }, { label: 'ETH', score: data.eth_score }].map(({ label, score }) => {
              const s = getStyle(score);
              return (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-[#64748b] w-8">{label}</span>
                  <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-xs font-bold w-6 text-right" style={{ color: s.color }}>{score}</span>
                </div>
              );
            })}
          </div>

          {/* Trend + signals */}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: style.color }}>
            <TrendIcon size={12} />
            <span className="font-medium capitalize">{data.trend}</span>
          </div>

          <div className="space-y-1.5">
            {(data.key_signals || []).map((sig, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: style.color }} />
                <p className="text-[11px] text-[#64748b] leading-relaxed">{sig}</p>
              </div>
            ))}
          </div>

          {data.last_updated && (
            <p className="text-[10px] text-[#334155]">
              Updated {new Date(data.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-[#475569] text-center py-4">Could not load sentiment data.</p>
      )}
    </div>
  );
}