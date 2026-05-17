import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Radio, MessageSquare, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BridgeAdBanner from '@/components/bridgemaster/BridgeAdBanner';
import BridgeSettingsPanel from '@/components/bridgemaster/BridgeSettingsPanel';
import BridgeConnectionPanel from '@/components/bridgemaster/BridgeConnectionPanel';
import BridgeChatPanel from '@/components/bridgemaster/BridgeChatPanel';

const DEFAULT_SETTINGS = {
  language: 'en',
  voiceNarration: true,
  voiceId: 'female_mid',
  voiceMatchLanguage: true,
  colorblindMode: 'none',
  largeText: false,
  wifiSearch: true,
  bluetoothSearch: false,
  hideDevice: true,
  dataSaver: false,
  moodSensing: true,
  attitudeMirror: false,
  memoryBank: true,
  autoSave: false,
  promptSaveOnClose: true,
};

// IINT logo loading splash
function LoadingSplash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#030508' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="flex flex-col items-center gap-4">
        {/* IINT logo */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', boxShadow: '0 0 60px rgba(0,212,170,0.4)' }}>
          <span className="text-[#030508] font-black text-2xl tracking-tighter">IINT</span>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-[#f1f5f9]">Bridge Master</p>
          <p className="text-[10px] text-[#475569] font-mono">by IINT Inc.</p>
        </div>
        {/* Loading bar */}
        <div className="w-40 h-0.5 bg-[#1e293b] rounded-full overflow-hidden mt-2">
          <motion.div className="h-full bg-[#00d4aa] rounded-full"
            initial={{ width: 0 }} animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

const TABS = [
  { id: 'connect', label: 'Connect', icon: Radio },
  { id: 'chat', label: 'Bridge', icon: MessageSquare },
];

export default function BridgeMaster() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('connect');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('bridge_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });
  const [connection, setConnection] = useState(null);
  const [adActive, setAdActive] = useState(false);
  const [hasSubscription] = useState(false); // wire to real user subscription check

  const saveSettings = (s) => {
    setSettings(s);
    try { localStorage.setItem('bridge_settings', JSON.stringify(s)); } catch {}
  };

  const handleConnected = (conn) => {
    setConnection(conn);
    setTab('chat');
    // Trigger ad on new connection (unless subscribed)
    if (!hasSubscription) setAdActive(true);
  };

  const handleAdEnd = () => setAdActive(false);

  // Colorblind filter applied to root
  const cbFilter = {
    protanopia: 'url(#protanopia)',
    deuteranopia: 'url(#deuteranopia)',
    tritanopia: 'url(#tritanopia)',
    high_contrast: 'contrast(1.5) saturate(0)',
  }[settings.colorblindMode] || 'none';

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingSplash onDone={() => setLoading(false)} />}
      </AnimatePresence>

      {/* SVG colorblind filter defs */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="protanopia"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/></filter>
          <filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/></filter>
          <filter id="tritanopia"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/></filter>
        </defs>
      </svg>

      <div className="min-h-screen bg-[#030508] text-[#f1f5f9] flex flex-col"
        style={{ filter: cbFilter, fontSize: settings.largeText ? '110%' : undefined }}>

        {/* Ad banner — top of everything */}
        <BridgeAdBanner
          hasSubscription={hasSubscription}
          onAdStart={() => setAdActive(true)}
          onAdEnd={handleAdEnd}
        />

        {/* Header */}
        <div className="border-b border-[#1e293b] bg-[#030508]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center">
            <ChevronLeft size={14} className="text-[#64748b]" />
          </Link>

          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)' }}>
              <span className="text-[#030508] font-black text-[9px]">BM</span>
            </div>
            <div>
              <p className="text-xs font-black text-[#f1f5f9] leading-none">Bridge Master</p>
              <p className="text-[8px] text-[#475569]">
                {connection ? `🟢 ${connection.name} · ${connection.bridgeMode}` : '⚫ Not connected'}
              </p>
            </div>
          </div>

          <button onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:border-[#334155]">
            <Settings size={13} className="text-[#64748b]" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#1e293b] bg-[#030508]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                tab === id ? 'border-[#00d4aa] text-[#00d4aa]' : 'border-transparent text-[#475569] hover:text-[#94a3b8]'
              }`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {tab === 'connect' && (
              <motion.div key="connect"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="flex-1 overflow-y-auto p-4">
                <BridgeConnectionPanel
                  settings={settings}
                  onConnected={handleConnected}
                  connectedId={connection?.id}
                />
              </motion.div>
            )}
            {tab === 'chat' && (
              <motion.div key="chat"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="flex-1 overflow-hidden flex flex-col">
                <BridgeChatPanel
                  connection={connection}
                  settings={settings}
                  adActive={adActive}
                  onAdClear={() => setAdActive(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <BridgeSettingsPanel
              settings={settings}
              onChange={saveSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}