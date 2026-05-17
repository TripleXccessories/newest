import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Zap, DollarSign, BarChart2, ArrowUpRight, Activity, Trophy, Shield, Bot, BookMarked, Sparkles, Clapperboard, Globe, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import SentimentGauge from '@/components/dashboard/SentimentGauge';
import AITradingAssistant from '@/components/dashboard/AITradingAssistant';
import TradeNodeMap from '@/components/dashboard/TradeNodeMap';
import SharedActivityFeed from '@/components/shared/SharedActivityFeed';
import BotCommandCenter from '@/components/dashboard/BotCommandCenter';

const StatCard = ({ label, value, sub, trend, color = '#00d4aa', icon: Icon, delay = 0 }) => (
  <motion.div
    className="relative bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-5 overflow-hidden group hover:border-opacity-60 transition-all duration-300"
    style={{ '--hover-color': color }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -2 }}
  >
    {/* Ambient gradient */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
      style={{ background: `radial-gradient(circle at 0% 0%, ${color}08, transparent 60%)` }} />
    
    <div className="flex items-start justify-between mb-3">
      <p className="text-[11px] text-[#475569] font-semibold uppercase tracking-widest">{label}</p>
      {Icon && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={13} style={{ color }} />
        </div>
      )}
    </div>
    <p className="text-2xl font-black tracking-tight" style={{ color }}>{value}</p>
    {sub && <p className="text-[11px] text-[#475569] mt-1.5">{sub}</p>}
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
        {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {Math.abs(trend)}% this week
      </div>
    )}
  </motion.div>
);

const SignalRow = ({ signal, index }) => (
  <motion.div
    className="flex items-center justify-between py-3 border-b border-[#1e293b]/60 last:border-0 hover:bg-[#111827]/50 px-2 -mx-2 rounded-lg transition-colors cursor-pointer group"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <div className="flex items-center gap-3">
      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide ${
        signal.signal_type === 'buy' || signal.signal_type === 'strong_buy'
          ? 'bg-[#00d4aa]/12 text-[#00d4aa] border border-[#00d4aa]/20'
          : 'bg-red-500/12 text-red-400 border border-red-500/20'
      }`}>
        {signal.signal_type?.toUpperCase().replace('_', ' ')}
      </div>
      <div>
        <p className="text-sm font-bold text-[#f1f5f9] group-hover:text-[#00d4aa] transition-colors">{signal.ticker}</p>
        <p className="text-[11px] text-[#475569]">{signal.asset_class} · {signal.timeframe}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-[#f1f5f9]">${signal.entry_price?.toLocaleString()}</p>
      <p className="text-[11px] text-[#00d4aa] font-semibold">{signal.confidence}% conf.</p>
    </div>
  </motion.div>
);

// eslint-disable-next-line no-unused-vars
const QuickNav = ({ to, icon: Icon, label, color = '#00d4aa', badge }) => (
  <Link to={to} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#111827] text-sm text-[#475569] hover:text-[#f1f5f9] transition-all group">
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={12} style={{ color }} />
      </div>
      <span className="font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{ background: `${color}20`, color }}>{badge}</span>}
      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
    </div>
  </Link>
);

export default function Dashboard() {
  const [signals, setSignals] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academyProgress, setAcademyProgress] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      base44.entities.UserProgress.filter({ user_id: u.id }).then(([p]) => setAcademyProgress(p || null)).catch(() => {});
    }).catch(() => {});
    base44.entities.Signal.list('-created_date', 5).then(setSignals).catch(() => {});
    base44.entities.UserProfile.list('-created_date', 1).then(([p]) => setProfile(p)).catch(() => {});
  }, []);

  const virtualBalance = profile?.virtual_balance ?? 100000;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── ADMIN QUICK ACCESS BAR ── */}
      {user?.role === 'admin' && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl border border-[#1e293b] bg-[#070b14]">
          <span className="text-[9px] font-mono text-[#334155] uppercase tracking-[0.3em] mr-1">Admin ►</span>
          {[
            { to: '/directors-cut', label: "Director's Cut", icon: Clapperboard, color: '#00d4aa' },
            { to: '/mission-control', label: 'Mission Control', icon: Zap, color: '#f59e0b' },
            { to: '/academy-command', label: 'Academy Command', icon: Sparkles, color: '#a78bfa' },
            { to: '/thebridge', label: 'Bridge Master Site', icon: Globe, color: '#60a5fa' },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all hover:scale-105"
              style={{ borderColor: `${color}35`, background: `${color}10`, color }}>
              <Icon size={11} /> {label}
            </Link>
          ))}
        </motion.div>
      )}

      {/* ── WEBSITE EDITOR BANNER — always visible for admin ── */}
      {user?.role === 'admin' && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 rounded-2xl border-2 border-[#00d4aa]/40 bg-[#00d4aa]/06">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', boxShadow: '0 0 20px rgba(0,212,170,0.3)' }}>
              <Globe size={16} className="text-[#030508]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#f1f5f9]">🌐 Your Website — TheBridgeMaster.com</p>
              <p className="text-[10px] text-[#475569] mt-0.5">Edit · Preview · Publish from here. Domain syncs via Base44 Dashboard → Publish → Custom Domain.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/thebridge"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold border border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/10 transition-colors">
              <Globe size={11} /> Preview Site
            </Link>
            <Link to="/thebridge"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', color: '#030508' }}>
              <Pencil size={11} /> Edit Website
            </Link>
          </div>
        </motion.div>
      )}

      {/* Welcome header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-black text-[#f1f5f9] tracking-tight">
            Welcome back, <span className="text-[#00d4aa]">{user?.full_name?.split(' ')[0] || 'Trader'}</span> 👋
          </h1>
          <p className="text-sm text-[#475569] mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] inline-block animate-pulse" />
            IINT Beta Dashboard — All systems operational
          </p>
        </div>
        <Link to="/signals"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#070b14] transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #00a88a)', boxShadow: '0 4px 20px rgba(0,212,170,0.3)' }}>
          <Zap size={14} /> Live Signals
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Virtual Balance" value={`$${virtualBalance.toLocaleString()}`} sub="Paper trading account" icon={DollarSign} delay={0.05} />
        <StatCard label="Total P&L" value="+$3,247" sub="All time" trend={3.25} icon={TrendingUp} delay={0.1} />
        <StatCard label="Active Signals" value={signals.length || '—'} sub="Available now" color="#fbbf24" icon={Zap} delay={0.15} />
        <StatCard label="Win Rate" value="68%" sub="Last 30 trades" trend={5.2} icon={Trophy} color="#a78bfa" delay={0.2} />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Signals panel */}
        <div className="lg:col-span-2 bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#f1f5f9] flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#fbbf24]/15 flex items-center justify-center">
                <Zap size={13} className="text-[#fbbf24]" />
              </div>
              Latest Signals
            </h2>
            <Link to="/signals" className="flex items-center gap-1 text-xs text-[#00d4aa] hover:text-[#00d4aa]/80 font-semibold transition-colors">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {signals.length > 0 ? (
            signals.map((s, i) => <SignalRow key={s.id} signal={s} index={i} />)
          ) : (
            <div className="flex flex-col items-center py-12 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1e293b] flex items-center justify-center">
                <Activity size={20} className="text-[#334155]" />
              </div>
              <p className="text-sm text-[#475569]">No signals yet. Check back soon.</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Portfolio snapshot */}
          <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#f1f5f9] flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-[#00d4aa]/15 flex items-center justify-center">
                <DollarSign size={13} className="text-[#00d4aa]" />
              </div>
              Portfolio Snapshot
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Virtual Balance', value: `$${virtualBalance.toLocaleString()}`, color: '#f1f5f9' },
                { label: 'Unrealized P&L', value: '+$1,840.00', color: '#00d4aa' },
                { label: 'Open Positions', value: '3', color: '#f1f5f9' },
                { label: "Today's P&L", value: '+$412.50', color: '#00d4aa' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-[#475569]">{label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
            <Link to="/paper-trading"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-[#00d4aa]/25 text-[#00d4aa] rounded-xl text-xs font-bold hover:bg-[#00d4aa]/8 transition-colors">
              <BarChart2 size={13} /> Open Trading Terminal
            </Link>
          </div>

          <SentimentGauge />

          {/* Quick navigation */}
          <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-4">
            <p className="text-xs font-bold text-[#334155] uppercase tracking-widest mb-3">Quick Access</p>
            <div className="space-y-0.5">
              <QuickNav to="/paper-trading" icon={BarChart2} label="Paper Trading" color="#00d4aa" />
              <QuickNav to="/bot-rental" icon={Bot} label="Bot Rental" color="#a78bfa" badge="NEW" />
              <QuickNav to="/academy-hub" icon={BookMarked} label="Academy Hub" color="#06b6d4" />
              <QuickNav to="/risk-monitoring" icon={Shield} label="Risk Monitor" color="#ef4444" />
              <QuickNav to="/leaderboard" icon={Trophy} label="Leaderboard" color="#fbbf24" />
              {academyProgress?.graduation_hs_complete && (
                <QuickNav
                  to="/academy-hub"
                  icon={Sparkles}
                  label="Trophy Room"
                  color="#f59e0b"
                />
              )}
              {user?.role === 'admin' && (
                <>
                  <QuickNav to="/directors-cut" icon={Clapperboard} label="Director's Cut" color="#00d4aa" badge="ADMIN" />
                  <QuickNav to="/mission-control" icon={Zap} label="Mission Control" color="#f59e0b" badge="ADMIN" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-5">
        <h2 className="text-base font-bold text-[#f1f5f9] flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-lg bg-[#00d4aa]/15 flex items-center justify-center">
            <Activity size={13} className="text-[#00d4aa]" />
          </div>
          Activity & Achievements
        </h2>
        <SharedActivityFeed limit={6} />
      </div>

      {/* Bot Command Center */}
      <BotCommandCenter user={user} />

      <TradeNodeMap />
      <AITradingAssistant user={user} />
    </div>
  );
}