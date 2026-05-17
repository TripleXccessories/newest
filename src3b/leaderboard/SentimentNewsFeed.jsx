import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const HIGH_VOLATILITY_KEYWORDS = ['FOMC', 'Fed', 'CPI', 'NFP', 'earnings', 'GDP', 'rate decision', 'Powell', 'inflation report'];

export default function SentimentNewsFeed({ onVolatilityAlert }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchSentiment = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a financial market sentiment analyst. Today is ${new Date().toDateString()}.

Analyze current market sentiment and upcoming high-volatility events. Return a JSON object with:
- overall_sentiment: "bullish" | "bearish" | "neutral"
- sentiment_score: number -100 to +100
- top_events: array of 4 objects with { headline: string, impact: "high"|"medium"|"low", type: "macro"|"earnings"|"crypto"|"forex", direction: "bullish"|"bearish"|"neutral", is_fomc_type: boolean }
- bot_recommendation: "pause_trading" | "reduce_size" | "normal" | "increase_caution"
- recommendation_reason: string (1 sentence)
- fear_greed_index: number 0-100`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_sentiment: { type: 'string' },
            sentiment_score: { type: 'number' },
            top_events: { type: 'array', items: { type: 'object' } },
            bot_recommendation: { type: 'string' },
            recommendation_reason: { type: 'string' },
            fear_greed_index: { type: 'number' },
          }
        }
      });
      setSentiment(res);
      setNews(res.top_events || []);

      // Check for high-volatility alert
      const hasHighImpact = (res.top_events || []).some(e => e.impact === 'high' || e.is_fomc_type);
      if (hasHighImpact || res.bot_recommendation !== 'normal') {
        const alertMsg = {
          type: res.bot_recommendation,
          reason: res.recommendation_reason,
          high_impact_event: (res.top_events || []).find(e => e.impact === 'high'),
        };
        setAlert(alertMsg);
        onVolatilityAlert?.(alertMsg);
      } else {
        setAlert(null);
        onVolatilityAlert?.(null);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchSentiment(); }, []);

  const sentimentColor = sentiment?.overall_sentiment === 'bullish' ? '#00d4aa'
    : sentiment?.overall_sentiment === 'bearish' ? '#ef4444' : '#f59e0b';

  const recommendationConfig = {
    pause_trading:    { color: '#ef4444', label: 'PAUSE TRADING', icon: Shield },
    reduce_size:      { color: '#f97316', label: 'REDUCE POSITION SIZE', icon: AlertTriangle },
    increase_caution: { color: '#f59e0b', label: 'INCREASE CAUTION', icon: AlertTriangle },
    normal:           { color: '#00d4aa', label: 'NORMAL CONDITIONS', icon: TrendingUp },
  };

  const rec = recommendationConfig[sentiment?.bot_recommendation] || recommendationConfig.normal;
  const RecIcon = rec.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#f1f5f9] flex items-center gap-2">
          <Newspaper size={14} className="text-[#a78bfa]" /> Market Sentiment & News
        </h3>
        <button onClick={fetchSentiment} disabled={loading} className="text-[#475569] hover:text-[#94a3b8] transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-[#1e293b] border-t-[#a78bfa] rounded-full animate-spin" />
        </div>
      )}

      {sentiment && !loading && (
        <>
          {/* Sentiment overview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-center">
              <p className="text-lg font-black" style={{ color: sentimentColor }}>
                {sentiment.overall_sentiment?.toUpperCase()}
              </p>
              <p className="text-[10px] text-[#475569]">Market Mood</p>
            </div>
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-center">
              <p className="text-lg font-black" style={{ color: sentimentColor }}>
                {sentiment.sentiment_score > 0 ? '+' : ''}{sentiment.sentiment_score}
              </p>
              <p className="text-[10px] text-[#475569]">Sentiment Score</p>
            </div>
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-center">
              <p className="text-lg font-black" style={{
                color: sentiment.fear_greed_index > 60 ? '#ef4444' : sentiment.fear_greed_index < 40 ? '#00d4aa' : '#f59e0b'
              }}>
                {sentiment.fear_greed_index}
              </p>
              <p className="text-[10px] text-[#475569]">Fear & Greed</p>
            </div>
          </div>

          {/* Bot recommendation banner */}
          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: `${rec.color}30`, background: `${rec.color}08` }}>
            <RecIcon size={16} style={{ color: rec.color, flexShrink: 0 }} />
            <div>
              <p className="text-xs font-bold" style={{ color: rec.color }}>Bot Advisory: {rec.label}</p>
              <p className="text-[11px] text-[#64748b] mt-0.5">{sentiment.recommendation_reason}</p>
            </div>
          </div>

          {/* News events */}
          <div className="space-y-2">
            {news.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  item.impact === 'high'
                    ? 'border-red-500/30 bg-red-500/05'
                    : item.impact === 'medium'
                    ? 'border-[#f59e0b]/20 bg-[#f59e0b]/04'
                    : 'border-[#1e293b] bg-[#0f172a]'
                }`}
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  item.impact === 'high' ? 'bg-red-500' : item.impact === 'medium' ? 'bg-[#f59e0b]' : 'bg-[#475569]'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#f1f5f9] leading-relaxed">{item.headline}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#475569] capitalize">{item.type}</span>
                    <span className={`text-[10px] font-bold ${
                      item.direction === 'bullish' ? 'text-[#00d4aa]'
                        : item.direction === 'bearish' ? 'text-red-400'
                        : 'text-[#475569]'
                    }`}>
                      {item.direction === 'bullish' ? '▲' : item.direction === 'bearish' ? '▼' : '—'} {item.direction}
                    </span>
                    {item.is_fomc_type && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold">HIGH VOLATILITY</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}