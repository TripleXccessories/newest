import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Eye, EyeOff, Shield, Monitor, Users, Zap, Lock, Unlock, RefreshCw, ChevronDown } from 'lucide-react';

const PREVIEW_MODES = [
  { id: 'admin', label: 'Admin View', desc: 'Full admin access — all tools visible', color: '#ef4444', icon: Shield },
  { id: 'user_new', label: 'New User', desc: 'First-time user experience (skips intro video)', color: '#00d4aa', icon: Users },
  { id: 'user_existing', label: 'Existing User', desc: 'Returning user — standard experience', color: '#60a5fa', icon: Monitor },
  { id: 'user_beta', label: 'Beta Tester', desc: 'Beta tester with limited feature access', color: '#fbbf24', icon: Zap },
  { id: 'user_graduated', label: 'Graduated User', desc: 'University graduate — unlocked features', color: '#a78bfa', icon: Zap },
];

const PROTECTED_SECTIONS = [
  { id: 'directors-cut', label: "Director's Cut", path: '/directors-cut' },
  { id: 'academy-command', label: 'Academy Command', path: '/academy-command' },
  { id: 'sovereign-log', label: 'Sovereign Log', path: '/sovereign-log' },
  { id: 'scope-testing', label: 'Scope Testing', path: '/scope-testing' },
  { id: 'render-pipeline', label: 'Render Pipeline', path: '/render-pipeline' },
];

export default function AdminPreview() {
  const [user, setUser] = useState(null);
  const [activeMode, setActiveMode] = useState(() => localStorage.getItem('adminPreviewMode') || 'admin');
  const [skipIntro, setSkipIntro] = useState(() => localStorage.getItem('adminSkipIntro') === 'true');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newAdminPin, setNewAdminPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savedPin] = useState(() => localStorage.getItem('adminSectionPin') || '');
  const [unlockedSections, setUnlockedSections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('unlockedSections') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('adminPreviewMode', activeMode);
  }, [activeMode]);

  useEffect(() => {
    localStorage.setItem('adminSkipIntro', String(skipIntro));
  }, [skipIntro]);

  const setMode = (modeId) => {
    setActiveMode(modeId);
    localStorage.setItem('adminPreviewMode', modeId);
  };

  const unlockSection = (sectionId) => {
    if (pinInput === savedPin || !savedPin) {
      const updated = [...new Set([...unlockedSections, sectionId])];
      setUnlockedSections(updated);
      localStorage.setItem('unlockedSections', JSON.stringify(updated));
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const lockSection = (sectionId) => {
    const updated = unlockedSections.filter(s => s !== sectionId);
    setUnlockedSections(updated);
    localStorage.setItem('unlockedSections', JSON.stringify(updated));
  };

  const saveNewPin = () => {
    if (newAdminPin.length >= 4 && newAdminPin === confirmPin) {
      localStorage.setItem('adminSectionPin', newAdminPin);
      setNewAdminPin('');
      setConfirmPin('');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#030508] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" /></div>;
  if (user?.role !== 'admin') return <div className="min-h-screen bg-[#030508] flex items-center justify-center text-[#ef4444] font-bold">Access Denied — Admins only</div>;

  const currentMode = PREVIEW_MODES.find(m => m.id === activeMode);

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ef4444]/15 flex items-center justify-center">
            <Shield size={18} className="text-[#ef4444]" />
          </div>
          <div>
            <h1 className="text-lg font-black">Admin Preview Control</h1>
            <p className="text-[10px] text-[#475569]">Toggle view modes, protect sections, manage admin access</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold"
            style={{ borderColor: `${currentMode?.color}40`, background: `${currentMode?.color}10`, color: currentMode?.color }}>
            <Eye size={12} /> Active: {currentMode?.label}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Preview Mode Selector */}
        <section>
          <h2 className="text-sm font-black text-[#f1f5f9] mb-1">Preview Mode</h2>
          <p className="text-[10px] text-[#475569] mb-4">Simulate how the app looks to different user types. Applied to your current session only.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PREVIEW_MODES.map(mode => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <motion.button key={mode.id} onClick={() => setMode(mode.id)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-2xl border text-left transition-all"
                  style={{ borderColor: isActive ? `${mode.color}60` : '#1e293b', background: isActive ? `${mode.color}12` : '#070b14' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} style={{ color: mode.color }} />
                    <span className="text-xs font-black" style={{ color: isActive ? mode.color : '#f1f5f9' }}>{mode.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: mode.color }} />}
                  </div>
                  <p className="text-[10px] text-[#475569] leading-relaxed">{mode.desc}</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Intro Video Toggle */}
        <section className="p-5 rounded-2xl border border-[#1e293b] bg-[#070b14]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#f1f5f9]">Skip Intro Video</h3>
              <p className="text-[10px] text-[#475569] mt-0.5">Bypass the CinematicIntro when previewing as a new user. Great for QA without triggering the onboarding sequence.</p>
            </div>
            <button onClick={() => setSkipIntro(v => !v)}
              className="w-12 h-6 rounded-full transition-all relative shrink-0 ml-4"
              style={{ background: skipIntro ? '#00d4aa' : '#1e293b' }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: skipIntro ? '26px' : '4px' }} />
            </button>
          </div>
          {skipIntro && (
            <p className="mt-2 text-[10px] text-[#00d4aa] font-mono">✓ Intro skipped — new user views will land directly on Dashboard</p>
          )}
        </section>

        {/* Section Pin Protection */}
        <section>
          <h2 className="text-sm font-black text-[#f1f5f9] mb-1">Section Pin Protection</h2>
          <p className="text-[10px] text-[#475569] mb-4">Lock sensitive admin sections behind a PIN for hired admins. You set the PIN, they enter it to access.</p>

          {/* Set PIN */}
          <div className="p-4 rounded-2xl border border-[#1e293b] bg-[#070b14] mb-4">
            <p className="text-xs font-bold text-[#94a3b8] mb-3">{savedPin ? '🔒 PIN is set — update below' : '⚠️ No PIN set — sections are unprotected'}</p>
            <div className="flex gap-2">
              <input type="password" placeholder="New PIN (min 4 digits)" value={newAdminPin} onChange={e => setNewAdminPin(e.target.value)}
                className="flex-1 bg-[#0a0f1e] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] outline-none focus:border-[#334155]" />
              <input type="password" placeholder="Confirm PIN" value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
                className="flex-1 bg-[#0a0f1e] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] outline-none focus:border-[#334155]" />
              <button onClick={saveNewPin} disabled={newAdminPin.length < 4 || newAdminPin !== confirmPin}
                className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 transition-all"
                style={{ background: '#00d4aa', color: '#030508' }}>
                Save PIN
              </button>
            </div>
          </div>

          {/* Protected sections */}
          <div className="space-y-2">
            {PROTECTED_SECTIONS.map(section => {
              const isUnlocked = unlockedSections.includes(section.id);
              return (
                <div key={section.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#070b14] border border-[#1e293b]">
                  <div className="w-2 h-2 rounded-full" style={{ background: isUnlocked ? '#00d4aa' : '#ef4444' }} />
                  <span className="text-xs font-bold text-[#f1f5f9] flex-1">{section.label}</span>
                  <span className="text-[9px] font-mono text-[#334155]">{section.path}</span>
                  {isUnlocked ? (
                    <button onClick={() => lockSection(section.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors">
                      <Lock size={10} /> Lock
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input type="password" placeholder="PIN" value={pinInput} onChange={e => setPinInput(e.target.value)}
                        className={`w-20 bg-[#0a0f1e] border rounded-lg px-2 py-1 text-[10px] text-[#f1f5f9] outline-none ${pinError ? 'border-[#ef4444]' : 'border-[#1e293b]'}`} />
                      <button onClick={() => unlockSection(section.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-[#00d4aa] hover:bg-[#00d4aa]/10 transition-colors">
                        <Unlock size={10} /> Unlock
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Active session info */}
        <section className="p-4 rounded-2xl border border-[#334155] bg-[#0a0f1e]">
          <p className="text-[10px] font-mono text-[#475569] mb-2">CURRENT SESSION</p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div><span className="text-[#334155]">User:</span> <span className="text-[#00d4aa] font-mono">{user?.email}</span></div>
            <div><span className="text-[#334155]">Role:</span> <span className="text-[#fbbf24] font-mono">{user?.role}</span></div>
            <div><span className="text-[#334155]">Preview Mode:</span> <span className="font-mono" style={{ color: currentMode?.color }}>{currentMode?.label}</span></div>
            <div><span className="text-[#334155]">Skip Intro:</span> <span className={`font-mono ${skipIntro ? 'text-[#00d4aa]' : 'text-[#475569]'}`}>{skipIntro ? 'YES' : 'NO'}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}