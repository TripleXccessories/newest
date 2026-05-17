import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, LogOut, Menu, Zap, TrendingUp, Shield } from 'lucide-react';
import IINTLogo from './IINTLogo';
import { base44 } from '@/api/base44Client';
import HelpSearchBar from '@/components/help/HelpSearchBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ onToggleSidebar, user }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleLogout = () => base44.auth.logout('/');

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'T';

  return (
    <header className="h-14 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-[#1e293b]/80 flex items-center px-4 gap-4 fixed top-0 left-0 right-0 z-50"
      style={{ boxShadow: '0 1px 0 rgba(0,212,170,0.06), 0 4px 24px rgba(0,0,0,0.4)' }}>
      
      {/* Ambient top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d4aa]/40 to-transparent pointer-events-none" />

      {/* Mobile menu */}
      <button onClick={onToggleSidebar} className="text-[#64748b] hover:text-[#00d4aa] transition-colors lg:hidden p-1 rounded-lg hover:bg-[#1e293b]">
        <Menu size={20} />
      </button>

      {/* Logo */}
      <div className="flex-shrink-0">
        <Link to="/">
          <IINTLogo size="sm" />
        </Link>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-auto hidden md:block">
        <HelpSearchBar placeholder="Search signals, tickers, strategies, lessons..." source="help_bar" />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#00d4aa]/8 border border-[#00d4aa]/20 rounded-full">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[10px] font-bold text-[#00d4aa] tracking-wider">LIVE</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="relative p-2 text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#1e293b] rounded-lg transition-all"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00d4aa] rounded-full ring-2 ring-[#0a0f1e]"></span>
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className="absolute right-0 top-11 w-80 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl z-50 overflow-hidden"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,170,0.08)' }}
              >
                <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
                  <p className="text-sm font-bold text-[#f1f5f9]">Notifications</p>
                  <span className="text-[10px] px-2 py-0.5 bg-[#00d4aa]/15 text-[#00d4aa] rounded-full font-bold">2 new</span>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { icon: Zap, color: '#00d4aa', title: 'New Signal: BTC/USD', sub: 'Strong Buy — 94% confidence', time: '2m ago' },
                    { icon: TrendingUp, color: '#fbbf24', title: 'Beta Update v0.3.2', sub: 'New features in signals engine', time: '1h ago' },
                    { icon: Shield, color: '#a78bfa', title: 'Kill Switch Armed', sub: 'Portfolio threshold monitoring active', time: '3h ago' },
                  ].map((n, i) => {
                    const Icon = n.icon;
                    return (
                      <div key={i} className="flex gap-3 p-2.5 rounded-xl bg-[#111827] hover:bg-[#1e293b] cursor-pointer transition-colors group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${n.color}15` }}>
                          <Icon size={14} style={{ color: n.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#f1f5f9] truncate">{n.title}</p>
                          <p className="text-[11px] text-[#64748b] mt-0.5 truncate">{n.sub}</p>
                        </div>
                        <span className="text-[10px] text-[#334155] flex-shrink-0">{n.time}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-[#1e293b]">
                  <button className="text-[11px] text-[#00d4aa] hover:text-[#00d4aa]/80 font-medium w-full text-center transition-colors">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[#1e293b] transition-all group"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-[#070b14]"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #00a88a)' }}>
              {initials}
            </div>
            <span className="text-sm text-[#f1f5f9] hidden md:block max-w-[90px] truncate font-medium">
              {user?.full_name?.split(' ')[0] || 'Trader'}
            </span>
            <ChevronDown size={12} className="text-[#64748b] hidden md:block group-hover:text-[#94a3b8] transition-colors" />
          </button>
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                className="absolute right-0 top-11 w-52 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl z-50 overflow-hidden"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
              >
                <div className="px-4 py-3 border-b border-[#1e293b]">
                  <p className="text-xs font-bold text-[#f1f5f9] truncate">{user?.full_name || 'Trader'}</p>
                  <p className="text-[11px] text-[#64748b] truncate mt-0.5">{user?.email || ''}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#f59e0b]/15 rounded-full border border-[#f59e0b]/25">
                    <span className="text-[9px] font-black text-[#f59e0b] tracking-wider">BETA TESTER</span>
                  </div>
                </div>
                <div className="py-1.5">
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b] transition-colors">
                    <Settings size={14} /> Settings
                  </Link>
                  <Link to="/trader-profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b] transition-colors">
                    <User size={14} /> My Profile
                  </Link>
                </div>
                <div className="py-1 border-t border-[#1e293b]">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}