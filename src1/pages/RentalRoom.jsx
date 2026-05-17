import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Zap, MessageSquare, BarChart2, Shield, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RentalRoomChat from '@/components/rental/RentalRoomChat';
import RentalRoomHUD from '@/components/rental/RentalRoomHUD';
import RentalAgreementScroll from '@/components/rental/RentalAgreementScroll';

// Theme configs — map rental_room_theme to visual styles
const THEME_STYLES = {
  'Tactical Fortress':   { bg: 'from-[#0a0a0a] to-[#1a0a00]', border: '#c2410c', glow: '#f97316', pattern: 'fortress' },
  'Holographic Void':    { bg: 'from-[#050510] to-[#0a0520]', border: '#a78bfa', glow: '#c084fc', pattern: 'void' },
  'White Nexus':         { bg: 'from-[#08080f] to-[#0f0820]', border: '#a78bfa', glow: '#e9d5ff', pattern: 'nexus' },
  'Archive Aerie':       { bg: 'from-[#060308] to-[#120820]', border: '#7c3aed', glow: '#ef4444', pattern: 'aerie' },
  'Refraction Chamber':  { bg: 'from-[#020208] to-[#080215]', border: '#c084fc', glow: '#fde68a', pattern: 'refraction' },
  'Argument Forge':      { bg: 'from-[#0a0202] to-[#1a0404]', border: '#ef4444', glow: '#fca5a5', pattern: 'forge' },
  'War Room':            { bg: 'from-[#080500] to-[#1a1000]', border: '#f59e0b', glow: '#fbbf24', pattern: 'warroom' },
  'Disruption Chamber':  { bg: 'from-[#020510] to-[#051020]', border: '#60a5fa', glow: '#93c5fd', pattern: 'disruption' },
  'Loom Studio':         { bg: 'from-[#0a0208] to-[#1a0515]', border: '#ec4899', glow: '#f9a8d4', pattern: 'loom' },
  'Workshop Foundry':    { bg: 'from-[#0a0400] to-[#1a0800]', border: '#f97316', glow: '#fb923c', pattern: 'foundry' },
  'Flux Lab':            { bg: 'from-[#021010] to-[#041a15]', border: '#14b8a6', glow: '#2dd4bf', pattern: 'flux' },
  'Watchtower Command':  { bg: 'from-[#020a04] to-[#041508]', border: '#22c55e', glow: '#4ade80', pattern: 'watchtower' },
  'Council Circle':      { bg: 'from-[#040800] to-[#0a1400]', border: '#84cc16', glow: '#a3e635', pattern: 'council' },
  'Armored Garden':      { bg: 'from-[#020802] to-[#051005]', border: '#4ade80', glow: '#86efac', pattern: 'garden' },
  'The Crucible':        { bg: 'from-[#0a0200] to-[#1a0400]', border: '#f97316', glow: '#fbbf24', pattern: 'crucible' },
  'Dynamo Hall':         { bg: 'from-[#050502] to-[#0f0f04]', border: '#eab308', glow: '#0ea5e9', pattern: 'dynamo' },
  'Cosmic Archive':      { bg: 'from-[#010208] to-[#030510]', border: '#2dd4bf', glow: '#854d0e', pattern: 'cosmic' },
  'Wisdom Hollow':       { bg: 'from-[#050802] to-[#0a1204]', border: '#7eb8a4', glow: '#f59e0b', pattern: 'hollow' },
  'Drafting Atrium':     { bg: 'from-[#020510] to-[#051028]', border: '#3b82f6', glow: '#93c5fd', pattern: 'atrium' },
  'Convergence Lab':     { bg: 'from-[#020805] to-[#041510]', border: '#10b981', glow: '#f59e0b', pattern: 'convergence' },
};

const DEFAULT_THEME = { bg: 'from-[#070b14] to-[#0f172a]', border: '#00d4aa', glow: '#00d4aa', pattern: 'default' };

export default function RentalRoom() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const botId = urlParams.get('bot');

  const [bot, setBot] = useState(null);
  const [userBotProfile, setUserBotProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, bots, profiles] = await Promise.all([
          base44.auth.me(),
          botId ? base44.entities.BotPersona.filter({ id: botId }) : base44.entities.BotPersona.list('-created_date', 1),
          base44.entities.UserBotProfile.list(),
        ]);
        setUser(u);
        const b = bots[0] || null;
        setBot(b);
        if (b) {
          const ubp = profiles.find((p) => p.bot_persona_id === b.id);
          setUserBotProfile(ubp || null);
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, [botId]);

  const theme = bot?.rental_room_theme ? (THEME_STYLES[bot.rental_room_theme] || DEFAULT_THEME) : DEFAULT_THEME;
  const aura = bot?.visual_aura || theme.glow;
  const displayName = userBotProfile?.user_given_name || bot?.name || 'Your Bot';
  const calledAs = userBotProfile?.call_me_as || user?.full_name?.split(' ')[0] || 'Trader';
  const greeting = bot?.default_greeting || `Welcome, ${calledAs}. I am ready.`;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#070b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="fixed inset-0 bg-[#070b14] flex flex-col items-center justify-center gap-4">
        <p className="text-[#64748b]">No bot found.</p>
        <button onClick={() => navigate('/bot-rental')} className="text-sm text-[#00d4aa] hover:underline">Back to Bot Rental</button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${theme.bg} overflow-hidden`}>
      {/* Ambient glow orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${aura}08 0%, transparent 70%)` }}
      />

      {/* Agreement Scroll Gate */}
      <AnimatePresence>
        {!agreementAccepted && bot && (
          <RentalAgreementScroll
            bot={bot}
            displayName={displayName}
            aura={aura}
            onAccept={() => setAgreementAccepted(true)}
            onDecline={() => navigate('/bot-rental')}
          />
        )}
      </AnimatePresence>

      {/* Animated border pulse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: `inset 0 0 80px ${aura}10` }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: `${theme.border}30` }}>
        <button
          onClick={() => navigate('/bot-rental')}
          className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#f1f5f9] transition-colors"
        >
          <ArrowLeft size={16} /> Exit Room
        </button>

        <div className="flex items-center gap-3">
          {/* Aura dot */}
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: aura }}
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="text-center">
            <p className="text-sm font-bold text-[#f1f5f9]">{displayName}</p>
            <p className="text-xs" style={{ color: aura }}>{bot.archetype} · {bot.school}</p>
          </div>
          {bot.super_agent_active && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: `${aura}20`, color: aura }}>
              SUPER AGENT
            </span>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-[#64748b]">Greeted as</p>
          <p className="text-xs font-semibold text-[#94a3b8]">{calledAs}</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="relative z-10 flex gap-1 px-6 pt-4">
        {[
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'hud', label: 'HUD', icon: BarChart2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeTab === id ? `${aura}20` : 'transparent',
              color: activeTab === id ? aura : '#64748b',
              border: `1px solid ${activeTab === id ? `${aura}40` : 'transparent'}`,
            }}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-[calc(100vh-120px)] px-6 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              className="h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <RentalRoomChat
                bot={bot}
                displayName={displayName}
                calledAs={calledAs}
                greeting={greeting}
                aura={aura}
                theme={theme}
              />
            </motion.div>
          )}
          {activeTab === 'hud' && (
            <motion.div
              key="hud"
              className="h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <RentalRoomHUD bot={bot} aura={aura} theme={theme} uiOverlay={bot.ui_overlay} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}