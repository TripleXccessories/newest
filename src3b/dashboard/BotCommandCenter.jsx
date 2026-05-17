import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Bot, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import BotSentimentPanel from './BotSentimentPanel';
import BotChatPanel from './BotChatPanel';
import BotTrainingCard from './BotTrainingCard';
import VoiceCommandCenter from '@/components/voice/VoiceCommandCenter';

const ARCHETYPE_COLORS = {
  Guide: '#00d4aa', Guardian: '#3b82f6', Oracle: '#a78bfa',
  Creator: '#f59e0b', Challenger: '#ef4444', Catalyst: '#f97316',
};

const TABS = [
  { id: 'sentiment', label: '📡 Sentiment' },
  { id: 'chat',      label: '💬 Chat' },
  { id: 'voice',     label: '🎙️ Voice' },
  { id: 'training',  label: '🧬 Training' },
];

export default function BotCommandCenter({ user }) {
  const [activeBot, setActiveBot] = useState(null);
  const [allBots, setAllBots] = useState([]);
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState('sentiment');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.UserBotProfile.filter({ user_id: user.id, is_active_rental: true }),
      base44.entities.BotPersona.list().catch(() => []),
      base44.entities.Trade.filter({ user_id: user.id }).catch(() => []),
    ]).then(([profiles, personas, userTrades]) => {
      setAllBots(personas);
      setTrades(userTrades);
      if (!profiles.length) { setLoading(false); return; }
      const profile = profiles[0];
      const found = personas.find(p => p.id === profile.bot_persona_id);
      if (found) setActiveBot({ ...found, _ubp: profile });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const color = ARCHETYPE_COLORS[activeBot?.archetype] || '#00d4aa';

  if (loading) {
    return (
      <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-6 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeBot) {
    return (
      <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#1e293b] flex items-center justify-center">
          <Bot size={20} className="text-[#334155]" />
        </div>
        <p className="text-sm font-bold text-[#f1f5f9]">No Active Bot Rental</p>
        <p className="text-xs text-[#475569] max-w-xs">Rent a bot from the marketplace to unlock the Command Center — sentiment feed, chat, and training.</p>
        <Link to="/bot-rental"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold mt-1"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #00a88a)', color: '#070b14' }}>
          <Bot size={12} /> Browse Bots
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-[#0a0f1e] border rounded-2xl overflow-hidden"
      style={{ borderColor: `${color}25` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}40, transparent)` }} />

      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden border" style={{ borderColor: `${color}40` }}>
            {activeBot.avatar_url
              ? <img src={activeBot.avatar_url} alt={activeBot.name} className="w-full h-full object-cover object-top" />
              : <div className="w-full h-full flex items-center justify-center text-sm font-black" style={{ background: `${color}20`, color }}>{activeBot.name?.charAt(0)}</div>
            }
          </div>
          <div>
            <p className="text-sm font-bold text-[#f1f5f9]">{activeBot._ubp?.user_given_name || activeBot.name}</p>
            <p className="text-[10px]" style={{ color }}>{activeBot.archetype} · Bot Command Center</p>
          </div>
        </div>
        <Link to="/bot-rental" className="text-[10px] text-[#475569] hover:text-[#f1f5f9] flex items-center gap-1 transition-colors">
          <LinkIcon size={10} /> Manage
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex-1 py-2.5 text-[11px] font-semibold border-b-2 transition-all"
            style={{
              borderColor: activeTab === t.id ? color : 'transparent',
              color: activeTab === t.id ? color : '#475569',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'sentiment' && <BotSentimentPanel activeBot={activeBot} archetypeColor={color} />}
        {activeTab === 'chat'      && <BotChatPanel activeBot={activeBot} archetypeColor={color} />}
        {activeTab === 'voice'     && <VoiceCommandCenter activeBot={activeBot} allBots={allBots} archetypeColor={color} trades={trades} userId={user?.id} />}
        {activeTab === 'training'  && <BotTrainingCard activeBot={activeBot} archetypeColor={color} />}
      </div>
    </motion.div>
  );
}