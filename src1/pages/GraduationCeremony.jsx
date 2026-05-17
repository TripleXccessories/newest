import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, GraduationCap, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

const ACTS = ['intro', 'badges', 'trophy_room', 'transition', 'university'];

const EARNED_BADGES_MOCK = [
  { id: 'b1', name: 'First Steps', emoji: '👶', rarity: 'Bronze',   color: '#cd7f32', description: 'Completed Kindergarten' },
  { id: 'b2', name: 'Curious Mind', emoji: '🔍', rarity: 'Silver',   color: '#94a3b8', description: 'Completed Grade School' },
  { id: 'b3', name: 'Chart Reader', emoji: '📊', rarity: 'Gold',     color: '#f59e0b', description: 'Completed Mid Grade' },
  { id: 'b4', name: 'Risk Aware',   emoji: '🛡️', rarity: 'Gold',     color: '#f59e0b', description: 'Completed Junior High' },
  { id: 'b5', name: 'Strategist',   emoji: '♟️', rarity: 'Platinum', color: '#e2e8f0', description: 'Completed High School' },
];

export default function GraduationCeremony() {
  const navigate = useNavigate();
  const [act, setAct] = useState('intro');
  const [actIndex, setActIndex] = useState(0);
  const [badges, setBadges] = useState([]);
  const [revealedBadges, setRevealedBadges] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    // Load real earned badges if available
    base44.entities.UserAchievement.list().then(achievements => {
      if (achievements.length) setBadges(achievements.map(a => ({
        id: a.id, name: a.badge_name, emoji: a.badge_emoji, rarity: a.badge_rarity, color: '#f59e0b', description: a.badge_description,
      })));
      else setBadges(EARNED_BADGES_MOCK);
    }).catch(() => setBadges(EARNED_BADGES_MOCK));
  }, []);

  // Auto-advance intro
  useEffect(() => {
    if (act === 'intro') {
      const t = setTimeout(() => goNext(), 4500);
      return () => clearTimeout(t);
    }
  }, [act]);

  // Reveal badges one by one
  useEffect(() => {
    if (act === 'badges') {
      let i = 0;
      const interval = setInterval(() => {
        setRevealedBadges(prev => [...prev, badges[i]?.id]);
        if (i === badges.length - 1) {
          clearInterval(interval);
          // Fire confetti
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#a78bfa', '#00d4aa'] });
        }
        i++;
      }, 600);
      return () => clearInterval(interval);
    }
  }, [act, badges]);

  // Confetti on trophy room
  useEffect(() => {
    if (act === 'trophy_room') {
      setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#f59e0b', '#fbbf24', '#fff'] }), 400);
    }
  }, [act]);

  const goNext = () => {
    const next = actIndex + 1;
    if (next >= ACTS.length) { navigate('/academy-hub'); return; }
    setActIndex(next);
    setAct(ACTS[next]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030508] overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">

        {/* ── ACT 1: INTRO ── */}
        {act === 'intro' && (
          <motion.div key="intro" className="text-center space-y-6 px-8 max-w-2xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 1 }}>
            {/* Starfield */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 60 }).map((_, i) => (
                <motion.div key={i}
                  className="absolute rounded-full bg-white"
                  style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
                />
              ))}
            </div>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}>
              <div className="text-8xl">🎓</div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }}>
              <p className="text-[11px] font-mono tracking-[0.4em] text-[#00d4aa] uppercase mb-3">IINT Academy · High School Complete</p>
              <h1 className="text-5xl font-black text-[#f1f5f9] leading-tight">
                Congratulations,<br />
                <span className="text-[#f59e0b]">{user?.full_name?.split(' ')[0] || 'Graduate'}</span>
              </h1>
              <p className="text-[#64748b] mt-4 text-base">You've completed the journey from Kindergarten to High School.<br />Your trophies await.</p>
            </motion.div>
          </motion.div>
        )}

        {/* ── ACT 2: BADGE REVEAL ── */}
        {act === 'badges' && (
          <motion.div key="badges" className="text-center space-y-8 px-8 max-w-3xl w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <div>
              <p className="text-[11px] font-mono tracking-[0.35em] text-[#f59e0b] uppercase mb-2">Your Achievements</p>
              <h2 className="text-3xl font-black text-[#f1f5f9]">Badges Earned</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {badges.map((badge, i) => (
                <AnimatePresence key={badge.id}>
                  {revealedBadges.includes(badge.id) && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl border"
                      style={{ borderColor: badge.color + '40', background: badge.color + '0a', minWidth: 110 }}>
                      <motion.div className="text-5xl"
                        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}>
                        {badge.emoji}
                      </motion.div>
                      <p className="text-xs font-black" style={{ color: badge.color }}>{badge.name}</p>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: badge.color + '20', color: badge.color }}>{badge.rarity}</span>
                      <p className="text-[9px] text-[#475569] text-center leading-tight">{badge.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>
            {revealedBadges.length === badges.length && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                onClick={goNext}
                className="px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2 mx-auto"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#070b14' }}>
                See Your Trophy Room <ChevronRight size={16} />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ── ACT 3: TROPHY ROOM UNVEIL ── */}
        {act === 'trophy_room' && (
          <motion.div key="trophy" className="text-center space-y-8 px-8 max-w-3xl w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            {/* Dramatic curtain reveal */}
            <motion.div
              className="absolute inset-0 bg-[#f59e0b]"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
              style={{ transformOrigin: 'top' }}
            />
            <div className="text-7xl">🏆</div>
            <div>
              <p className="text-[11px] font-mono tracking-[0.35em] text-[#f59e0b] uppercase mb-2">The Hall of Trophies</p>
              <h2 className="text-4xl font-black text-[#f1f5f9]">Your Trophy Room</h2>
              <p className="text-[#64748b] mt-2">Every medal. Every milestone. Your proof of mastery.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {badges.map((b, i) => (
                <motion.div key={b.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 + 0.5 }}
                  className="p-4 rounded-2xl border text-center"
                  style={{ borderColor: b.color + '40', background: b.color + '0a' }}>
                  <div className="text-3xl mb-1">{b.emoji}</div>
                  <p className="text-[10px] font-bold" style={{ color: b.color }}>{b.name}</p>
                </motion.div>
              ))}
            </div>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              onClick={goNext}
              className="px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2 mx-auto"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #00a88a)', color: '#070b14' }}>
              Continue <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ── ACT 4: TONE TRANSITION ── */}
        {act === 'transition' && (
          <motion.div key="transition" className="text-center space-y-8 px-8 max-w-2xl w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center border"
              style={{ borderColor: '#a78bfa40', background: '#a78bfa10' }}
              animate={{ boxShadow: ['0 0 0px #a78bfa00', '0 0 40px #a78bfa60', '0 0 0px #a78bfa00'] }}
              transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles size={36} className="text-[#a78bfa]" />
            </motion.div>
            <div>
              <p className="text-[11px] font-mono tracking-[0.35em] text-[#a78bfa] uppercase mb-2">The Shift Begins</p>
              <h2 className="text-4xl font-black text-[#f1f5f9]">Welcome to the<br /><span className="text-[#a78bfa]">Advanced Chapter</span></h2>
              <p className="text-[#64748b] mt-3 leading-relaxed">
                Your journey transitions now. The playful hallways of High School give way to the<br />
                serious trading floors of the University.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-3xl mb-1">🏫</div>
                <p className="text-xs text-[#475569]">High School</p>
                <p className="text-[10px] text-[#334155]">Exploratory</p>
              </div>
              <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ChevronRight size={24} className="text-[#a78bfa]" />
              </motion.div>
              <div className="text-center">
                <div className="text-3xl mb-1">🎓</div>
                <p className="text-xs text-[#a78bfa] font-bold">University</p>
                <p className="text-[10px] text-[#a78bfa]/60">Professional</p>
              </div>
            </div>
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              onClick={goNext}
              className="px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2 mx-auto border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-colors">
              Enter the University <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ── ACT 5: UNIVERSITY UNLOCK ── */}
        {act === 'university' && (
          <motion.div key="university" className="text-center space-y-8 px-8 max-w-2xl w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            {/* University glow backdrop */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.08) 0%, transparent 70%)' }} />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}>
              <div className="text-8xl">🎓</div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <p className="text-[11px] font-mono tracking-[0.4em] text-[#a78bfa] uppercase mb-3">IINT University · Now Unlocked</p>
              <h1 className="text-4xl font-black text-[#f1f5f9]">
                Advanced Market<br /><span className="text-[#a78bfa]">Strategy Curriculum</span>
              </h1>
              <p className="text-[#64748b] mt-3 leading-relaxed text-sm">
                Market structure mastery. Institutional order flow. Bot companion integration.<br />
                This is where traders are forged.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {['Order Flow Analysis', 'Institutional Strategies', 'Bot Companion Mode', 'Live Market Structure'].map((item, i) => (
                <motion.div key={item} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 + i * 0.1 }}
                  className="p-3 rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/06 text-left">
                  <div className="w-5 h-5 rounded-full bg-[#a78bfa]/20 flex items-center justify-center mb-2">
                    <Star size={10} className="text-[#a78bfa]" />
                  </div>
                  <p className="text-[11px] font-bold text-[#c4b5fd]">{item}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8 }}
              onClick={goNext}
              className="px-10 py-4 rounded-2xl text-base font-black flex items-center gap-3 mx-auto"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff', boxShadow: '0 8px 32px rgba(167,139,250,0.35)' }}>
              <GraduationCap size={20} /> Begin University
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {ACTS.map((a, i) => (
          <div key={a} className="rounded-full transition-all"
            style={{ width: act === a ? 20 : 6, height: 6, background: i <= actIndex ? '#f59e0b' : '#1e293b' }} />
        ))}
      </div>

      {/* Skip */}
      <button onClick={() => navigate('/academy-hub')}
        className="absolute top-6 right-6 text-[11px] text-[#334155] hover:text-[#64748b] transition-colors">
        Skip →
      </button>
    </div>
  );
}