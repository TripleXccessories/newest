import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, FastForward, Film } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Generate a realistic candlestick series around an entry price
function generateCandles(entryPrice, exitPrice, count = 40) {
  const candles = [];
  let price = entryPrice * (1 - 0.015); // Start slightly below entry
  const volatility = entryPrice * 0.008;

  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = Math.max(open + change, open * 0.98);
    const high = Math.max(open, close) + Math.random() * volatility * 0.6;
    const low = Math.min(open, close) - Math.random() * volatility * 0.6;
    candles.push({ i, open: +open.toFixed(2), close: +close.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2) });
    price = close;
    // Bias toward exit price in latter half
    if (i > count * 0.6 && exitPrice) {
      const bias = (exitPrice - price) / (count - i);
      price += bias * 0.4;
    }
  }
  return candles;
}

const ENTRY_BAR = 8;
const EXIT_BAR = 32;

function CandlestickChart({ candles, replayIdx, entryPrice, exitPrice, tradeType }) {
  const svgRef = useRef(null);
  const W = 560, H = 200, PAD = { top: 10, bottom: 20, left: 52, right: 12 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const visible = candles.slice(0, replayIdx + 1);
  if (visible.length === 0) return null;

  const allPrices = visible.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...allPrices) * 0.999;
  const maxP = Math.max(...allPrices) * 1.001;
  const priceRange = maxP - minP || 1;

  const barW = (chartW / candles.length) * 0.65;
  const xPos = (i) => PAD.left + (i / (candles.length - 1)) * chartW;
  const yPos = (p) => PAD.top + ((maxP - p) / priceRange) * chartH;

  const priceLabels = 4;
  const yTicks = Array.from({ length: priceLabels + 1 }, (_, i) => minP + (priceRange * i) / priceLabels);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: '#0a0f1a', borderRadius: 12 }}>
      {/* Grid lines */}
      {yTicks.map((p, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={yPos(p)} x2={W - PAD.right} y2={yPos(p)} stroke="#1e293b" strokeWidth="1" />
          <text x={PAD.left - 4} y={yPos(p) + 4} textAnchor="end" fontSize="9" fill="#475569">
            ${p.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Candles */}
      {visible.map((c, i) => {
        const x = xPos(i);
        const isGreen = c.close >= c.open;
        const color = isGreen ? '#00d4aa' : '#ef4444';
        const bodyTop = yPos(Math.max(c.open, c.close));
        const bodyBot = yPos(Math.min(c.open, c.close));
        const bodyH = Math.max(bodyBot - bodyTop, 1);
        return (
          <g key={i}>
            <line x1={x} y1={yPos(c.high)} x2={x} y2={yPos(c.low)} stroke={color} strokeWidth="1" />
            <rect x={x - barW / 2} y={bodyTop} width={barW} height={bodyH} fill={color} opacity={0.85} rx="1" />
          </g>
        );
      })}

      {/* Entry line */}
      {replayIdx >= ENTRY_BAR && entryPrice >= minP && entryPrice <= maxP && (
        <g>
          <line
            x1={xPos(ENTRY_BAR)} y1={yPos(entryPrice)}
            x2={xPos(Math.min(replayIdx, candles.length - 1))} y2={yPos(entryPrice)}
            stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3"
          />
          <circle cx={xPos(ENTRY_BAR)} cy={yPos(entryPrice)} r="4" fill="#f59e0b" />
          <text x={xPos(ENTRY_BAR) + 6} y={yPos(entryPrice) - 5} fontSize="9" fill="#f59e0b" fontWeight="bold">
            ENTRY ${entryPrice}
          </text>
        </g>
      )}

      {/* Exit line */}
      {replayIdx >= EXIT_BAR && exitPrice && exitPrice >= minP && exitPrice <= maxP && (
        <g>
          <circle cx={xPos(EXIT_BAR)} cy={yPos(exitPrice)} r="4" fill={exitPrice >= entryPrice ? '#00d4aa' : '#ef4444'} />
          <text x={xPos(EXIT_BAR) + 6} y={yPos(exitPrice) - 5} fontSize="9" fill={exitPrice >= entryPrice ? '#00d4aa' : '#ef4444'} fontWeight="bold">
            EXIT ${exitPrice}
          </text>
        </g>
      )}

      {/* Current price indicator */}
      {visible.length > 0 && (
        <g>
          <line
            x1={PAD.left} y1={yPos(visible[visible.length - 1].close)}
            x2={W - PAD.right} y2={yPos(visible[visible.length - 1].close)}
            stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4"
          />
        </g>
      )}
    </svg>
  );
}

export default function TradeReplay({ trade, onClose }) {
  const [candles, setCandles] = useState([]);
  const [replayIdx, setReplayIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  const [aiComment, setAiComment] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const intervalRef = useRef(null);

  const totalCandles = 40;

  useEffect(() => {
    const cs = generateCandles(trade.entry_price || 100, trade.exit_price, totalCandles);
    setCandles(cs);
    setReplayIdx(0);
    setPlaying(false);
    setAiComment('');
  }, [trade]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setReplayIdx(prev => {
          if (prev >= totalCandles - 1) {
            setPlaying(false);
            fetchAIComment();
            return totalCandles - 1;
          }
          return prev + 1;
        });
      }, 120 / speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speed]);

  const fetchAIComment = async () => {
    if (aiComment) return;
    setLoadingAI(true);
    const pnlPct = ((((trade.exit_price || trade.entry_price) - trade.entry_price) / trade.entry_price) * 100).toFixed(2);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `A trader just replayed their ${trade.ticker} ${trade.trade_type?.toUpperCase()} trade.
Entry: $${trade.entry_price}, Exit: $${trade.exit_price || 'still open'}, P&L: ${trade.pnl >= 0 ? '+' : ''}$${(trade.pnl || 0).toFixed(2)} (${pnlPct}%).
Trade notes: "${trade.notes || 'none'}".

Write 2 sentences of sharp post-replay coaching: what the price action during this trade reveals, and one specific lesson the trader should internalize. Be direct.`,
    });
    setAiComment(result);
    setLoadingAI(false);
  };

  const reset = () => { setReplayIdx(0); setPlaying(false); setAiComment(''); };
  const pnlPos = (trade.pnl || 0) >= 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.93)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <Film size={16} className="text-[#a78bfa]" />
            <div>
              <p className="text-sm font-bold text-[#f1f5f9]">{trade.ticker} · Trade Replay</p>
              <p className="text-xs text-[#475569]">
                {trade.trade_type?.toUpperCase()} @ ${trade.entry_price?.toLocaleString()}
                {trade.exit_price ? ` → $${trade.exit_price?.toLocaleString()}` : ''}
                <span className={`ml-2 font-bold ${pnlPos ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                  {pnlPos ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#f1f5f9]"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Chart */}
          <div className="relative">
            <CandlestickChart
              candles={candles}
              replayIdx={replayIdx}
              entryPrice={trade.entry_price}
              exitPrice={trade.exit_price}
              tradeType={trade.trade_type}
            />
            {/* Progress overlay */}
            <div className="absolute bottom-2 right-3 text-[10px] text-[#334155]">
              Bar {replayIdx + 1} / {totalCandles}
            </div>
          </div>

          {/* Scrubber */}
          <input
            type="range" min={0} max={totalCandles - 1} value={replayIdx}
            onChange={e => { setReplayIdx(Number(e.target.value)); setPlaying(false); }}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#a78bfa' }}
          />

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaying(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#a78bfa] text-[#070b14] hover:bg-[#a78bfa]/90 transition-colors"
              >
                {playing ? <Pause size={13} /> : <Play size={13} />}
                {playing ? 'Pause' : replayIdx === 0 ? 'Play' : 'Resume'}
              </button>
              <button onClick={reset} className="p-2 rounded-xl bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Speed control */}
            <div className="flex items-center gap-1">
              <FastForward size={11} className="text-[#475569]" />
              {[1, 2, 4].map(s => (
                <button
                  key={s} onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${speed === s ? 'bg-[#a78bfa] text-[#070b14]' : 'bg-[#1e293b] text-[#64748b]'}`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Key events */}
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" /> Entry</div>
              {trade.exit_price && <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00d4aa] inline-block" /> Exit</div>}
            </div>
          </div>

          {/* Jump to key events */}
          <div className="flex gap-2">
            <button onClick={() => { setReplayIdx(ENTRY_BAR); setPlaying(false); }} className="flex-1 py-1.5 rounded-lg text-[10px] bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 hover:bg-[#f59e0b]/20 transition-colors">
              → Entry bar
            </button>
            {trade.exit_price && (
              <button onClick={() => { setReplayIdx(EXIT_BAR); setPlaying(false); }} className={`flex-1 py-1.5 rounded-lg text-[10px] border transition-colors ${pnlPos ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20 hover:bg-[#00d4aa]/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}>
                → Exit bar
              </button>
            )}
            <button onClick={() => { setReplayIdx(totalCandles - 1); setPlaying(false); fetchAIComment(); }} className="flex-1 py-1.5 rounded-lg text-[10px] bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] border border-[#1e293b] transition-colors">
              → End
            </button>
          </div>

          {/* AI post-replay comment */}
          {(loadingAI || aiComment) && (
            <div className="bg-[#0a0f1a] border border-[#a78bfa]/20 rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider mb-2">AI Post-Replay Coaching</p>
              {loadingAI ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#a78bfa]/20 border-t-[#a78bfa] rounded-full animate-spin" />
                  <span className="text-xs text-[#475569]">Analyzing trade...</span>
                </div>
              ) : (
                <p className="text-xs text-[#94a3b8] leading-relaxed">{aiComment}</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}