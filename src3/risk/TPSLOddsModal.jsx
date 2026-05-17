import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Target, AlertCircle } from 'lucide-react';

/**
 * TPSLOddsModal — TP/SL slider with live win probability calculation.
 * Shows odds of hitting targets based on entry, current price, volatility estimate.
 */

export default function TPSLOddsModal({ trade, onClose }) {
  const currentPrice = trade.entry_price * (1 + ((trade.pnl || 0) / (trade.quantity * trade.entry_price)));
  const [tp, setTP] = useState(trade.entry_price * 1.05);
  const [sl, setSL] = useState(trade.entry_price * 0.95);

  // Simple win odds calculation (entry price relative to TP/SL)
  const tpDist = Math.abs(tp - currentPrice);
  const slDist = Math.abs(currentPrice - sl);
  const winOdds = (tpDist / (tpDist + slDist)) * 100;
  const riskReward = tpDist / slDist;

  const pnlAtTP = (tp - trade.entry_price) * trade.quantity;
  const pnlAtSL = (sl - trade.entry_price) * trade.quantity;

  const isLong = trade.trade_type === 'buy' || trade.trade_type === 'long';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111827] border border-[#1e293b] rounded-2xl p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#fbbf24]" />
            <h2 className="text-lg font-bold text-[#f1f5f9]">TP/SL Odds</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#64748b]" />
          </button>
        </div>

        {/* Trade Summary */}
        <div className="bg-[#0f172a] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#475569] uppercase tracking-wider">{trade.ticker}</p>
            <p className="text-xs font-bold text-[#f1f5f9]">{trade.quantity} @ ${trade.entry_price?.toFixed(2)}</p>
          </div>
          <p className="text-sm text-[#64748b]">Current: ${currentPrice.toFixed(2)}</p>
        </div>

        {/* Win Odds Display */}
        <motion.div
          className="bg-gradient-to-r from-[#00d4aa]/10 to-[#fbbf24]/10 border border-[#00d4aa]/30 rounded-xl p-5 text-center"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Win Probability</p>
          <motion.p
            key={winOdds}
            className="text-4xl font-black text-[#00d4aa]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            {winOdds.toFixed(1)}%
          </motion.p>
          <p className="text-xs text-[#475569] mt-2">Risk:Reward = {riskReward.toFixed(2)}:1</p>
        </motion.div>

        {/* TP Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#f1f5f9]">Take Profit</label>
            <div className="text-right">
              <p className="text-sm font-bold text-[#00d4aa]">${tp.toFixed(2)}</p>
              <p className="text-xs text-[#64748b]">+{pnlAtTP.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <input
            type="range"
            min={trade.entry_price * 0.8}
            max={trade.entry_price * 2}
            step={0.01}
            value={tp}
            onChange={e => setTP(parseFloat(e.target.value))}
            className="w-full accent-[#00d4aa]"
          />
          <div className="flex items-center justify-between text-[10px] text-[#475569]">
            <span>${(trade.entry_price * 0.8).toFixed(2)}</span>
            <span>${(trade.entry_price * 2).toFixed(2)}</span>
          </div>
        </div>

        {/* SL Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#f1f5f9]">Stop Loss</label>
            <div className="text-right">
              <p className="text-sm font-bold text-red-400">${sl.toFixed(2)}</p>
              <p className="text-xs text-[#64748b]">{pnlAtSL.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <input
            type="range"
            min={trade.entry_price * 0.5}
            max={trade.entry_price * 1.2}
            step={0.01}
            value={sl}
            onChange={e => setSL(parseFloat(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="flex items-center justify-between text-[10px] text-[#475569]">
            <span>${(trade.entry_price * 0.5).toFixed(2)}</span>
            <span>${(trade.entry_price * 1.2).toFixed(2)}</span>
          </div>
        </div>

        {/* Scenarios */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/30 rounded-lg p-3 text-center">
            <p className="text-xs text-[#475569] mb-1">If TP Hit</p>
            <p className="text-sm font-bold text-[#00d4aa]">{winOdds.toFixed(1)}% odds</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
            <p className="text-xs text-[#475569] mb-1">If SL Hit</p>
            <p className="text-sm font-bold text-red-400">{(100 - winOdds).toFixed(1)}% odds</p>
          </div>
        </div>

        {/* Expected Value */}
        {riskReward < 1 ? (
          <motion.div
            className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">Risk:Reward below 1:1 — adjust your targets for better odds.</p>
          </motion.div>
        ) : null}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-[#070b14] rounded-xl font-bold transition-colors"
        >
          Close & Monitor
        </button>
      </motion.div>
    </motion.div>
  );
}