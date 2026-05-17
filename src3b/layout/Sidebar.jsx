import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Zap, PlayCircle, Star, Trophy, Users,
  GraduationCap, MessageSquare, Settings, Bot, ChevronLeft, ChevronRight,
  X, Scroll, FlaskConical, Shield, BookMarked, Radio, Activity, ChevronRight as Arrow
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_SECTIONS = [
  {
    label: 'Trading',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/', accent: '#00d4aa' },
      { label: 'Signals', icon: Zap, path: '/signals', accent: '#fbbf24', badge: 'LIVE' },
      { label: 'Paper Trading', icon: PlayCircle, path: '/paper-trading', accent: '#00d4aa' },
      { label: 'Backtester', icon: FlaskConical, path: '/backtester', accent: '#a78bfa' },
      { label: 'Watchlists', icon: Star, path: '/watchlists', accent: '#fbbf24' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Risk Analysis', icon: Shield, path: '/risk-analysis', accent: '#ef4444' },
      { label: 'Risk Monitoring', icon: Activity, path: '/risk-monitoring', accent: '#f97316' },
      { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', accent: '#fbbf24' },
    ],
  },
  {
    label: 'Academy',
    items: [
      { label: 'Academy Hub', icon: BookMarked, path: '/academy-hub', accent: '#00d4aa' },
      { label: 'Faculty Sit-In', icon: Scroll, path: '/faculty-sit-in', accent: '#a78bfa' },
      { label: 'My Mentors', icon: GraduationCap, path: '/my-mentors', accent: '#06b6d4' },
      { label: 'Bot Rental', icon: Bot, path: '/bot-rental', accent: '#a78bfa' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Community', icon: Users, path: '/community', accent: '#00d4aa' },
      { label: 'IINT Stereo', icon: Radio, path: '/stereo', accent: '#ec4899', badge: '🎵' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Feedback', icon: MessageSquare, path: '/feedback', accent: '#64748b' },
      { label: 'Settings', icon: Settings, path: '/settings', accent: '#64748b' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();

  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={onMobileClose}
        className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'text-[#f1f5f9]'
            : 'text-[#475569] hover:text-[#94a3b8] hover:bg-[#111827]'
        }`}
        style={isActive ? {
          background: `linear-gradient(90deg, ${item.accent}15, transparent)`,
          borderLeft: `2px solid ${item.accent}`,
          paddingLeft: '10px',
        } : {}}
      >
        <Icon size={16} className="flex-shrink-0 transition-colors duration-200"
          style={{ color: isActive ? item.accent : undefined }} />
        {(!collapsed || mobileOpen) && (
          <span className="text-[13px] font-medium truncate">{item.label}</span>
        )}
        {(!collapsed || mobileOpen) && item.badge && (
          <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md"
            style={{ background: `${item.accent}20`, color: item.accent }}>
            {item.badge}
          </span>
        )}
        {collapsed && !mobileOpen && (
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0f172a] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity shadow-xl">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1e293b]" />
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={onMobileClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 flex flex-col bg-[#070b14] border-r border-[#1e293b]/60 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed && !mobileOpen ? 'lg:w-16' : 'lg:w-64'}`}
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}
      >
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {(!collapsed || mobileOpen) && (
                <p className="text-[9px] font-black text-[#334155] uppercase tracking-[0.15em] px-3 mb-1.5">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-[#1e293b]/60">
          {(!collapsed || mobileOpen) && (
            <div className="px-3 py-2 mb-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
                <p className="text-[10px] font-bold text-[#00d4aa]">IINT Platform Beta</p>
              </div>
              <p className="text-[9px] text-[#334155]">v0.1.0 — Trust Built from Da Core</p>
              <a href="/terms" className="text-[9px] text-[#334155] hover:text-[#475569] transition-colors mt-0.5 block">
                Terms & Conditions
              </a>
            </div>
          )}
          <button
            onClick={onToggle}
            className="hidden lg:flex w-full items-center justify-center p-2 text-[#334155] hover:text-[#64748b] hover:bg-[#111827] rounded-xl transition-all"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
          {mobileOpen && (
            <button onClick={onMobileClose} className="lg:hidden w-full flex items-center justify-center p-2 text-[#475569] hover:text-[#f1f5f9] hover:bg-[#111827] rounded-xl transition-all">
              <X size={15} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}