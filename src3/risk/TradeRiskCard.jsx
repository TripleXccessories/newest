import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export default function TradeRiskCard({ trade, index, onClick }) {
  const isWinning = trade.pnl >= 0;
  const pnlPct = trade.entry_price ? ((trade.pnl || 0) / (trade.quantity * trade.entry_price)) * 100 : 0;

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full text-left group"
    >
      <div className={`
        p-4 rounded-xl border transition-all cursor-pointer
        ${isWinning
          ? 'bg-[#00d4aa]/5 border-[#00d4aa]/30 hover:border-[#00d4aa]/60 hover:bg-[#00d4aa]/10'
          : 'bg-red-500/5 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10'
        }
      `}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${isWinning ? 'bg-[#00d4aa]/20' : 'bg-red-500/20'}
            `}>
              {isWinning ? (
                <TrendingUp className={`w-5 h-5 ${isWinning ? 'text-[#00d4aa]' : 'text-red-500'}`} />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[#f1f5f9]">{trade.ticker}</p>
              <p className="text-xs text-[#64748b] capitalize">{trade.trade_type} · {trade.quantity} shares</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${isWinning ? 'text-[#00d4aa]' : 'text-red-500'}`}>
              {isWinning ? '+' : ''}{trade.pnl?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </p>
            <p className={`text-xs ${isWinning ? 'text-[#00d4aa]/70' : 'text-red-500/70'}`}>
              {isWinning ? '+' : ''}{pnlPct.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${isWinning ? 'bg-[#00d4aa]' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, Math.min(100, 50 + (pnlPct / 2)))}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <BarChart3 className="w-4 h-4 text-[#475569]" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-[#0f172a] rounded-lg p-2">
            <p className="text-[#64748b] mb-0.5">Entry</p>
            <p className="font-bold text-[#f1f5f9]">${trade.entry_price?.toFixed(2)}</p>
          </div>
          <div className="bg-[#0f172a] rounded-lg p-2">
            <p className="text-[#64748b] mb-0.5">Current</p>
            <p className="font-bold text-[#f1f5f9]">${(trade.entry_price * (1 + pnlPct / 100))?.toFixed(2)}</p>
          </div>
          <div className="bg-[#0f172a] rounded-lg p-2">
            <p className="text-[#64748b] mb-0.5">Exposure</p>
            <p className="font-bold text-[#f1f5f9]">${(trade.quantity * trade.entry_price)?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <p className="text-[10px] text-[#334155] mt-3 italic group-hover:text-[#475569]">Click to set TP/SL odds</p>
      </div>
    </motion.button>
  );
}