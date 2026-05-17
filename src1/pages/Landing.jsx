import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { BookOpen, Zap, ArrowRight, Loader2 } from 'lucide-react';

/**
 * Landing Page — User Segmentation Funnel
 * Routes visitors to Academy Store (education) or Trading Platform (signals/subscriptions)
 */

export default function Landing() {
  const [selected, setSelected] = useState(null);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  const options = [
    {
      id: 'education',
      icon: BookOpen,
      title: 'Start for Free',
      subtitle: 'IINT Academy — Learn Trading',
      description: 'A structured journey from total beginner to advanced market strategist. Interactive character-driven lessons, collectible notes, badges, and a bot companion — all at your pace.',
      color: '#00d4aa',
      badge: 'FREE BETA ACCESS',
    },
    {
      id: 'trading',
      icon: Zap,
      title: 'Live Trading Signals',
      subtitle: 'AI signals, market data, and platform access',
      description: 'Access real-time trading signals, premium market data, advanced risk monitoring, and professional trading tools.',
      color: '#fbbf24',
      badge: 'PREMIUM',
    },
  ];

  const handleStart = async () => {
    if (!selected) return;
    setStarting(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (selected === 'education') {
        if (!isAuth) {
          // Redirect to login, then come back to /intro after login
          base44.auth.redirectToLogin('/intro');
          return;
        }
        // Already logged in — create/update UserProfile and go to intro
        const user = await base44.auth.me();
        const existing = await base44.entities.UserProfile.filter({ user_id: user.id });
        if (!existing.length) {
          await base44.entities.UserProfile.create({
            user_id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: 'beta_tester',
            is_beta_mode: true,
            onboarding_complete: false,
          });
        }
        navigate('/');
      } else {
        if (!isAuth) {
          base44.auth.redirectToLogin('/trading-platform');
          return;
        }
        navigate('/trading-platform');
      }
    } catch {
      // If anything fails, just redirect to login
      base44.auth.redirectToLogin(selected === 'education' ? '/' : '/trading-platform');
    }
    setStarting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b14] via-[#0d1823] to-[#070b14] overflow-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 pt-8 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-16"
        >
          <div>
            <h1 className="text-2xl font-black text-[#f1f5f9] tracking-tight">
              Invest In Neural Trading
            </h1>
            <p className="text-xs text-[#475569] mt-1 tracking-widest uppercase">IINT Inc.</p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-[#f1f5f9] mb-4 leading-tight">
            What brings you here?
          </h2>
          <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
            Choose your path: learn trading from the ground up, or access live signals and platform features.
          </p>
        </motion.div>

        {/* Segmentation Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.id;

            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelected(opt.id)}
                className="group relative text-left"
              >
                <div className={`
                  relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? `bg-[${opt.color}]/5 border-[${opt.color}]/60 shadow-lg`
                    : 'bg-[#111827]/80 border-[#1e293b] hover:border-[#1e293b]/60'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? `${opt.color}05` : '#111827cc',
                  borderColor: isSelected ? opt.color + '99' : '#1e293b',
                }}
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="text-[9px] px-2 py-1 rounded-full font-bold tracking-wider uppercase"
                      style={{
                        background: `${opt.color}15`,
                        color: opt.color,
                        border: `1px solid ${opt.color}40`,
                      }}>
                      {opt.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-6">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: `${opt.color}20` }}>
                      <Icon className="w-7 h-7" style={{ color: opt.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-[#f1f5f9] mb-2">{opt.title}</h3>
                  <p className="text-sm text-[#64748b] mb-4">{opt.subtitle}</p>
                  <p className="text-sm leading-relaxed text-[#94a3b8] mb-6">{opt.description}</p>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 1 : 0.6 }}
                    className="flex items-center gap-2 font-bold text-sm"
                    style={{ color: opt.color }}
                  >
                    Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selection Action */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <button
                onClick={handleStart}
                disabled={starting}
                className="px-8 py-4 rounded-xl font-bold text-[#070b14] transition-all text-lg flex items-center gap-3 disabled:opacity-70"
                style={{
                  background: options.find(o => o.id === selected)?.color || '#00d4aa',
                  boxShadow: `0 0 40px ${options.find(o => o.id === selected)?.color}40`,
                }}
              >
                {starting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Setting up your account...</>
                ) : (
                  selected === 'education' ? 'Start for Free →' : 'Get Platform Access →'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 mt-20 py-12 border-t border-[#1e293b] text-center"
      >
        <p className="text-xs text-[#334155] mb-2">Already registered?</p>
        <button onClick={() => base44.auth.redirectToLogin('/')} className="text-sm font-bold text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors">
          Sign In to Dashboard →
        </button>
      </motion.div>
    </div>
  );
}