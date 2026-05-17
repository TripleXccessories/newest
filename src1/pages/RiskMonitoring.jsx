import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import RiskHeatmap from '@/components/risk/RiskHeatmap';
import TradeRiskCard from '@/components/risk/TradeRiskCard';
import TPSLOddsModal from '@/components/risk/TPSLOddsModal';

export default function RiskMonitoring() {
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [killSwitchStatus, setKillSwitchStatus] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me().then(setUser),
      base44.entities.Trade.list('-created_date', 50).then(setTrades),
    ])
      .then(async () => {
        try {
          const response = await base44.functions.invoke('killSwitchMonitor', {});
          setKillSwitchStatus(response.data);
        } catch (_) {
          setKillSwitchStatus(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 text-[#00d4aa] animate-spin mx-auto mb-2" />
          <p className="text-sm text-[#64748b]">Scanning positions...</p>
        </div>
      </div>
    );
  }

  const activeTrades = trades.filter(t => t.status === 'active');
  const totalExposure = activeTrades.reduce((sum, t) => sum + (t.quantity * t.entry_price || 0), 0);
  const unrealizedPnL = activeTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const drawdownPct = user ? (unrealizedPnL / (user.virtual_balance || 100000)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9] flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#fbbf24]" />
            Risk Monitoring
          </h1>
          <p className="text-xs text-[#475569] mt-1">Live position heat + kill switch status</p>
        </div>
      </div>

      {/* Kill Switch Alert */}
      {killSwitchStatus?.active && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">Kill Switch Armed</p>
            <p className="text-xs text-red-300/80 mt-0.5">Threshold: {user?.kill_switch_threshold_pct || 49}% loss trigger</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 font-bold">ACTIVE</span>
        </motion.div>
      )}

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#475569] uppercase tracking-wider mb-2">Total Exposure</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">${(totalExposure / 1000).toFixed(1)}K</p>
          <p className="text-xs text-[#64748b] mt-1">{activeTrades.length} active trades</p>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#475569] uppercase tracking-wider mb-2">Unrealized P&L</p>
          <p className={`text-2xl font-bold ${unrealizedPnL >= 0 ? 'text-[#00d4aa]' : 'text-red-500'}`}>
            {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-[#64748b] mt-1">{drawdownPct.toFixed(2)}% of balance</p>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#475569] uppercase tracking-wider mb-2">Win Rate</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">
            {activeTrades.length > 0 ? ((activeTrades.filter(t => t.pnl > 0).length / activeTrades.length) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-[#64748b] mt-1">{activeTrades.filter(t => t.pnl > 0).length} / {activeTrades.length} wins</p>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#475569] uppercase tracking-wider mb-2">Max Drawdown</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">{Math.abs(Math.min(0, drawdownPct)).toFixed(2)}%</p>
          <p className="text-xs text-[#64748b] mt-1">Salvage at {user?.kill_switch_salvage_pct || 55}%</p>
        </div>
      </div>

      {/* Heat Map */}
      <RiskHeatmap trades={activeTrades} balance={user?.virtual_balance || 100000} />

      {/* Trade Risk Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[#f1f5f9]">Active Positions</h2>
        {activeTrades.length === 0 ? (
          <div className="text-center py-12 bg-[#111827] rounded-xl border border-[#1e293b]">
            <p className="text-[#64748b]">No active trades — the market is quiet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {activeTrades.map((trade, idx) => (
                <TradeRiskCard
                  key={trade.id}
                  trade={trade}
                  index={idx}
                  onClick={() => setSelectedTrade(trade)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* TP/SL Odds Modal */}
      <AnimatePresence>
        {selectedTrade && (
          <TPSLOddsModal
            trade={selectedTrade}
            onClose={() => setSelectedTrade(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}