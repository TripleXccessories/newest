import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingDown, Activity, Bell, RefreshCw, Target, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Cell
} from 'recharts';

function calcExposure(positions) {
  if (!positions.length) return { total: 0, byAsset: [], totalValue: 100000 };
  const totalValue = 100000;
  const byAsset = positions
    .filter(p => p.status === 'open')
    .map(p => ({
      ticker: p.ticker,
      value: (p.entry_price || 0) * (p.quantity || 0),
      pct: 0,
      type: p.trade_type,
    }));
  const invested = byAsset.reduce((s, a) => s + a.value, 0);
  byAsset.forEach(a => { a.pct = +((a.value / totalValue) * 100).toFixed(1); });
  return { total: +((invested / totalValue) * 100).toFixed(1), byAsset, totalValue, invested };
}

function buildDrawdownSeries(positions) {
  // Simulate daily portfolio equity for last 30 days
  let equity = 100000;
  const series = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d);
    const dailyChange = (Math.random() - 0.48) * 0.025;
    equity = equity * (1 + dailyChange);
    series.push({ day: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }), equity: +equity.toFixed(0) });
  }
  // Inject actual pnl from positions
  const totalPnl = positions.reduce((s, p) => s + (p.pnl || 0), 0);
  if (series.length) series[series.length - 1].equity = 100000 + totalPnl;
  return series;
}

function buildDailyPnl() {
  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (13 - i));
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      pnl: +(((Math.random() - 0.45) * 800).toFixed(0)),
    };
  });
}

const RiskGauge = ({ value, max, label, color, warningAt, dangerAt }) => {
  const pct = Math.min((value / max) * 100, 100);
  const status = value >= dangerAt ? 'danger' : value >= warningAt ? 'warning' : 'safe';
  const statusColor = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#00d4aa';
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#64748b]">{label}</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${statusColor}20`, color: statusColor }}>
          {status.toUpperCase()}
        </span>
      </div>
      <p className="text-2xl font-black" style={{ color: statusColor }}>{value.toFixed(1)}%</p>
      <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: statusColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[10px] text-[#475569]">Limit: {max}%</p>
    </div>
  );
};

export default function RiskAnalysis() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [drawdownLimit, setDrawdownLimit] = useState(15);
  const [stopLossLimit, setStopLossLimit] = useState(3);
  const [exposureLimit, setExposureLimit] = useState(60);
  const [dailyPnl] = useState(buildDailyPnl);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const trades = await base44.entities.Trade.list('-created_date', 50);
      setPositions(trades.length > 0 ? trades : [
        { id: '1', ticker: 'BTC/USD', trade_type: 'buy', quantity: 0.5, entry_price: 65000, status: 'open', pnl: 1120, pnl_percent: 3.45 },
        { id: '2', ticker: 'AAPL', trade_type: 'buy', quantity: 10, entry_price: 186.40, status: 'open', pnl: 28, pnl_percent: 1.50 },
        { id: '3', ticker: 'NVDA', trade_type: 'buy', quantity: 2, entry_price: 860, status: 'open', pnl: -134, pnl_percent: -0.78 },
      ]);
    } catch (_) {}
    setLoading(false);
  };

  const exposure = calcExposure(positions);
  const equitySeries = buildDrawdownSeries(positions);
  const peak = Math.max(...equitySeries.map(e => e.equity));
  const current = equitySeries[equitySeries.length - 1]?.equity || 100000;
  const currentDrawdown = +((1 - current / peak) * 100).toFixed(2);
  const todayPnl = dailyPnl[dailyPnl.length - 1]?.pnl || 0;
  const dailyPnlPct = +((todayPnl / 100000) * 100).toFixed(2);
  const totalPnl = positions.reduce((s, p) => s + (p.pnl || 0), 0);
  const winTrades = positions.filter(p => (p.pnl || 0) > 0).length;
  const winRate = positions.length > 0 ? +((winTrades / positions.length) * 100).toFixed(1) : 0;

  // Generate alerts
  useEffect(() => {
    const newAlerts = [];
    if (currentDrawdown >= drawdownLimit) newAlerts.push({ type: 'danger', msg: `Max drawdown limit reached: ${currentDrawdown.toFixed(1)}%` });
    if (Math.abs(dailyPnlPct) >= stopLossLimit && todayPnl < 0) newAlerts.push({ type: 'danger', msg: `Daily stop-loss triggered: ${dailyPnlPct.toFixed(2)}%` });
    if (exposure.total >= exposureLimit * 0.85) newAlerts.push({ type: 'warning', msg: `Portfolio exposure approaching limit: ${exposure.total.toFixed(1)}%` });
    if (currentDrawdown >= drawdownLimit * 0.7) newAlerts.push({ type: 'warning', msg: `Drawdown at ${currentDrawdown.toFixed(1)}% — approaching ${drawdownLimit}% limit` });
    setAlerts(newAlerts);
  }, [positions, drawdownLimit, stopLossLimit, exposureLimit]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#1e293b] border-t-[#ef4444] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Shield size={22} className="text-red-400" /> Risk Analysis
          </h1>
          <p className="text-sm text-[#64748b] mt-1">Portfolio exposure, drawdown limits, and daily stop-loss tracking.</p>
        </div>
        <button onClick={load} className="text-[#475569] hover:text-[#f1f5f9] transition-colors p-2">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Active alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                a.type === 'danger' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'
              }`}
            >
              <AlertTriangle size={14} />
              <p className="text-xs font-semibold">{a.msg}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Risk Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <RiskGauge label="Portfolio Exposure" value={exposure.total} max={exposureLimit} warningAt={exposureLimit * 0.75} dangerAt={exposureLimit * 0.9} color="#00d4aa" />
        <RiskGauge label="Current Drawdown" value={currentDrawdown} max={drawdownLimit} warningAt={drawdownLimit * 0.7} dangerAt={drawdownLimit * 0.95} color="#ef4444" />
        <RiskGauge label="Daily P&L Risk" value={Math.abs(dailyPnlPct)} max={stopLossLimit} warningAt={stopLossLimit * 0.7} dangerAt={stopLossLimit * 0.95} color="#f59e0b" />
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? '#00d4aa' : '#ef4444' },
          { label: 'Open Positions', value: positions.filter(p => p.status === 'open').length, color: '#f1f5f9' },
          { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? '#00d4aa' : '#f97316' },
          { label: 'Capital at Risk', value: `$${exposure.invested?.toFixed(0) || 0}`, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
            <p className="text-xs text-[#64748b] mb-1">{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Equity curve / drawdown */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
            <TrendingDown size={14} className="text-red-400" /> Portfolio Equity (30d)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={equitySeries}>
              <defs>
                <linearGradient id="eqGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} formatter={v => [`$${v.toLocaleString()}`, 'Equity']} />
              <Area type="monotone" dataKey="equity" stroke="#00d4aa" strokeWidth={2} fill="url(#eqGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily P&L bars */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Activity size={14} className="text-[#a78bfa]" /> Daily P&L (14d)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyPnl} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <ReferenceLine y={0} stroke="#334155" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} formatter={v => [`$${v}`, 'P&L']} />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                {dailyPnl.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? '#00d4aa' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exposure breakdown */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
          <Target size={14} className="text-[#60a5fa]" /> Position Exposure Breakdown
        </h3>
        {exposure.byAsset.length === 0 ? (
          <p className="text-xs text-[#475569] text-center py-4">No open positions.</p>
        ) : (
          <div className="space-y-3">
            {exposure.byAsset.map((pos, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#f1f5f9]">{pos.ticker}</span>
                    <span className={`text-[10px] font-bold ${pos.type === 'buy' ? 'text-[#00d4aa]' : 'text-red-400'}`}>{pos.type?.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#64748b]">${pos.value.toLocaleString()}</span>
                    <span className="font-bold text-[#f1f5f9]">{pos.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: pos.pct > exposureLimit / 3 ? '#f59e0b' : '#60a5fa' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pos.pct * 2, 100)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk limit controls */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
          <Bell size={14} className="text-[#f59e0b]" /> Risk Limit Configuration
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Max Drawdown Limit', value: drawdownLimit, setter: setDrawdownLimit, min: 5, max: 50, step: 1, unit: '%', color: '#ef4444' },
            { label: 'Daily Stop-Loss', value: stopLossLimit, setter: setStopLossLimit, min: 1, max: 10, step: 0.5, unit: '%', color: '#f59e0b' },
            { label: 'Exposure Cap', value: exposureLimit, setter: setExposureLimit, min: 20, max: 100, step: 5, unit: '%', color: '#60a5fa' },
          ].map(({ label, value, setter, min, max, step, unit, color }) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#64748b]">{label}</label>
                <span className="text-sm font-bold" style={{ color }}>{value}{unit}</span>
              </div>
              <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={e => setter(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: color }}
              />
              <div className="flex justify-between text-[10px] text-[#334155]">
                <span>{min}{unit}</span><span>{max}{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}