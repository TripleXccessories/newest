import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Play, BarChart2, Share2, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import StrategyBuilder from '@/components/backtester/StrategyBuilder';
import LiveModeToggle from '@/components/backtester/LiveModeToggle';
import StrategyRepository from '@/components/backtester/StrategyRepository';
import DeepDiveReport from '@/components/backtester/DeepDiveReport';
import StrategyOptimizer from '@/components/backtester/StrategyOptimizer';

const TICKERS = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA', 'SPY', 'QQQ', 'NVDA', 'AMZN'];
const PERIODS = [
  { id: '3m', label: '3 Months' },
  { id: '6m', label: '6 Months' },
  { id: '1y', label: '1 Year' },
  { id: '2y', label: '2 Years' },
];

const BACKTESTER_TABS = [
  { id: 'backtest', label: 'Backtest', icon: FlaskConical },
  { id: 'live', label: 'Live Mode', icon: Radio },
  { id: 'community', label: 'Community', icon: Share2 },
];

export default function Backtester() {
  const [activeTab, setActiveTab] = useState('backtest');
  const [customIndicators, setCustomIndicators] = useState([]);
  const [customLogic, setCustomLogic] = useState('AND');
  const [ticker, setTicker] = useState('BTC/USD');
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const handleBuilderChange = (indicators, logic) => {
    setCustomIndicators(indicators);
    setCustomLogic(logic);
  };

  const handleLoadStrategy = (strategy) => {
    setCustomIndicators(strategy.indicators || []);
    setCustomLogic(strategy.logic || 'AND');
    setTicker(strategy.ticker || 'BTC/USD');
    setPeriod(strategy.period || '1y');
    setActiveTab('backtest');
  };

  const buildStrategyDescription = () => {
    if (customIndicators.length === 0) return 'No indicators configured yet.';
    const parts = customIndicators.map(ind => {
      const params = Object.entries(ind.params || {}).map(([k, v]) => `${k}=${v}`).join(', ');
      return `${ind.type.toUpperCase()}${params ? `(${params})` : ''}`;
    });
    return `Custom strategy: ${parts.join(` ${customLogic} `)}`;
  };

  const runBacktest = async () => {
    if (customIndicators.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const stratDesc = buildStrategyDescription();
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a quantitative trading analyst. Simulate a backtest of the following custom strategy on ${ticker} over the last ${PERIODS.find(p => p.id === period)?.label}.

Strategy: ${stratDesc}

Use realistic historical price data knowledge to generate a plausible simulation result.

Return a JSON object with:
- roi_percent: total return percentage (can be negative)
- win_rate: percentage of winning trades (0-100)
- total_trades: number of trades executed
- max_drawdown_percent: maximum drawdown percentage (positive number)
- profit_factor: ratio of gross profit to gross loss
- sharpe_ratio: annualized sharpe ratio
- monthly_returns: array of 6 objects with { month: "Jan", return_pct: number } for the most recent 6 months
- best_trade_pct: best single trade percentage
- worst_trade_pct: worst single trade percentage (negative)
- summary: a 2-sentence analysis of what drove the results`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            roi_percent: { type: "number" },
            win_rate: { type: "number" },
            total_trades: { type: "number" },
            max_drawdown_percent: { type: "number" },
            profit_factor: { type: "number" },
            sharpe_ratio: { type: "number" },
            monthly_returns: { type: "array", items: { type: "object" } },
            best_trade_pct: { type: "number" },
            worst_trade_pct: { type: "number" },
            summary: { type: "string" }
          }
        }
      });
      setResult(res);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <FlaskConical size={22} className="text-[#a78bfa]" /> Strategy Backtester
        </h1>
        <p className="text-sm text-[#64748b] mt-1">Build, test, and share custom strategies with the IINT community.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1">
        {BACKTESTER_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === id ? 'bg-[#a78bfa] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Live mode tab */}
      {activeTab === 'live' && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 space-y-4">
          <div className="border border-[#1e293b] rounded-xl p-4 bg-[#0f172a]">
            <StrategyBuilder value={customIndicators} onChange={handleBuilderChange} />
          </div>
          <LiveModeToggle
            isLive={isLive}
            onToggle={() => setIsLive(v => !v)}
            ticker={ticker}
            onTickerChange={setTicker}
            indicators={customIndicators}
          />
        </div>
      )}

      {/* Community tab */}
      {activeTab === 'community' && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
          <StrategyRepository
            currentUser={user}
            currentResult={result}
            currentIndicators={customIndicators}
            currentTicker={ticker}
            currentPeriod={period}
            currentLogic={customLogic}
            onLoadStrategy={handleLoadStrategy}
          />
        </div>
      )}

      {/* Backtest tab */}
      {activeTab === 'backtest' && <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 space-y-6">
        {/* Strategy builder section */}
        <div className="border border-[#1e293b] rounded-xl p-4 bg-[#0f172a]">
          <StrategyBuilder value={customIndicators} onChange={handleBuilderChange} />
        </div>

        {/* Asset + Period row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#64748b] mb-2 block">Asset</label>
            <select
              value={ticker}
              onChange={e => setTicker(e.target.value)}
              className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            >
              {TICKERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#64748b] mb-2 block">Period</label>
            <div className="grid grid-cols-4 gap-1.5">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`py-2 rounded-xl text-xs font-medium transition-all ${
                    period === p.id ? 'bg-[#a78bfa] text-[#070b14]' : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={runBacktest}
          disabled={loading || customIndicators.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-[#a78bfa] hover:bg-[#a78bfa]/90 text-[#070b14] rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-[#070b14]/30 border-t-[#070b14] rounded-full animate-spin" /> Running simulation...</>
          ) : (
            <><Play size={14} /> Run Backtest {customIndicators.length === 0 ? '(add indicators first)' : `— ${customIndicators.length} indicator${customIndicators.length > 1 ? 's' : ''}`}</>
          )}
        </button>
      </div>}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'ROI', value: `${result.roi_percent >= 0 ? '+' : ''}${result.roi_percent?.toFixed(2)}%`, color: result.roi_percent >= 0 ? '#00d4aa' : '#ef4444' },
                { label: 'Win Rate', value: `${result.win_rate?.toFixed(1)}%`, color: result.win_rate > 50 ? '#00d4aa' : '#f97316' },
                { label: 'Max Drawdown', value: `-${result.max_drawdown_percent?.toFixed(1)}%`, color: result.max_drawdown_percent < 10 ? '#00d4aa' : result.max_drawdown_percent < 20 ? '#f97316' : '#ef4444' },
                { label: 'Total Trades', value: result.total_trades, color: '#94a3b8' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
                  <p className="text-xs text-[#64748b] mb-1">{label}</p>
                  <p className="text-xl font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Monthly returns chart */}
              <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
                  <BarChart2 size={14} className="text-[#a78bfa]" /> Monthly Returns
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={result.monthly_returns || []} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                      formatter={v => [`${v?.toFixed(2)}%`, 'Return']}
                    />
                    <Bar dataKey="return_pct" radius={[4, 4, 0, 0]}>
                      {(result.monthly_returns || []).map((entry, i) => (
                        <Cell key={i} fill={entry.return_pct >= 0 ? '#00d4aa' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Additional metrics */}
              <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Performance Details</h3>
                {[
                  { label: 'Profit Factor', value: result.profit_factor?.toFixed(2), good: result.profit_factor >= 1.5 },
                  { label: 'Sharpe Ratio', value: result.sharpe_ratio?.toFixed(2), good: result.sharpe_ratio >= 1 },
                  { label: 'Best Trade', value: `+${result.best_trade_pct?.toFixed(2)}%`, good: true },
                  { label: 'Worst Trade', value: `${result.worst_trade_pct?.toFixed(2)}%`, good: false },
                ].map(({ label, value, good }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#1e293b] last:border-0">
                    <span className="text-xs text-[#64748b]">{label}</span>
                    <span className={`text-sm font-bold ${good ? 'text-[#00d4aa]' : 'text-red-400'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            {result.summary && (
              <div className="bg-[#111827] border border-[#a78bfa]/20 rounded-2xl p-5">
                <p className="text-xs text-[#a78bfa] font-semibold mb-2">AI Analysis</p>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{result.summary}</p>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              <DeepDiveReport
                result={result}
                ticker={ticker}
                period={period}
                indicators={customIndicators}
                logic={customLogic}
              />
              <StrategyOptimizer
                indicators={customIndicators}
                logic={customLogic}
                ticker={ticker}
                period={period}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}