import React from 'react';
import { Link } from 'react-router-dom';
import IINTLogo from './IINTLogo';

export default function Footer() {
  return (
    <footer className="border-t border-[#1e293b]/60 mt-auto relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-[#00d4aa]/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <IINTLogo size="sm" showTagline={false} />
            <p className="text-xs text-[#475569] leading-relaxed max-w-xs">
              The world's most advanced neural trading platform. Where intelligence meets execution.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
              <span className="text-[10px] font-bold text-[#00d4aa] tracking-wider">PLATFORM LIVE — BETA</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <p className="text-[11px] font-black text-[#334155] uppercase tracking-widest">Platform</p>
            <div className="space-y-2">
              {[
                { label: 'Trading Signals', path: '/signals' },
                { label: 'Academy Hub', path: '/academy-hub' },
                { label: 'Bot Rental', path: '/bot-rental' },
                { label: 'Risk Monitoring', path: '/risk-monitoring' },
                { label: 'Leaderboard', path: '/leaderboard' },
              ].map(l => (
                <Link key={l.path} to={l.path} className="block text-xs text-[#475569] hover:text-[#00d4aa] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-[11px] font-black text-[#334155] uppercase tracking-widest">Legal</p>
            <div className="space-y-2">
              {[
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/terms' },
                { label: 'Risk Disclosure', path: '/terms' },
                { label: 'Feedback', path: '/feedback' },
              ].map(l => (
                <Link key={l.label} to={l.path} className="block text-xs text-[#475569] hover:text-[#00d4aa] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1e293b]/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-[#475569]">One Platform. One Edge. One Love.</p>
            <p className="text-[10px] text-[#334155] italic mt-0.5">Trust, Built from the Core.</p>
          </div>
          <p className="text-[10px] text-[#334155]">
            © 2026 <span className="text-[#475569] font-semibold">InvestInNeuralTrading Inc.</span> — Beta Program. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}