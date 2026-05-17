import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Bot, Star, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BotArchetypeSection from '@/components/botRental/BotArchetypeSection';
import BotDetailModal from '@/components/botRental/BotDetailModal';

const ARCHETYPES = ['Guide', 'Guardian', 'Oracle', 'Creator', 'Challenger', 'Catalyst'];

// Fallback bots per archetype if DB is empty
const FALLBACK_BOTS = [
  { id: 'pathfinder', name: 'Da Mosaic Pathfinder', archetype: 'Guide', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/16ddb538b_generated_image.png', school: 'Foundations', role_title: 'Trading Foundations Guide', primary_color: '#00d4aa', signature_line: 'I help you find your way through the market maze.', default_greeting: "Greetings, stranger. I am Da Mosaic Pathfinder. I don't know you yet — but every great journey begins with a single step. Shall we begin?" },
  { id: 'sage', name: 'Da Feathered Sage', archetype: 'Guide', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/4132b8921_generated_image.png', school: 'Foundations', role_title: 'Psychology & Discipline', primary_color: '#f59e0b', signature_line: 'Your mind is the market you must conquer first.', default_greeting: "Hello there. I am Da Feathered Sage. Your emotions are your greatest enemy in trading. I can help you master them. But first, who are you?" },
  { id: 'architect', name: 'Da Gentle Architect', archetype: 'Guide', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/a287533f7_generated_image.png', school: 'Foundations', role_title: 'Systems & Strategy', primary_color: '#60a5fa', signature_line: 'A trade without a plan is a gamble. Full stop.', default_greeting: "Welcome, unknown visitor. I am Da Gentle Architect. Without a system, you are adrift. I build systems. Together we could build yours." },
  { id: 'warden', name: 'Da Bastion Warden', archetype: 'Guardian', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/5e8bab449_generated_image.png', school: 'Stewardship', role_title: 'Risk Management', primary_color: '#22c55e', signature_line: 'Your capital is your root system. Protect it always.', default_greeting: "Halt, stranger. I am Da Bastion Warden. Capital preservation is the first law of trading. Tell me — do you know how to protect what you have?" },
  { id: 'bear', name: 'Da Stone Bear', archetype: 'Guardian', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/2322751a8_generated_image.png', school: 'Stewardship', role_title: 'Wealth & Freedom', primary_color: '#a16207', signature_line: 'Patience builds wealth. Greed destroys it.', default_greeting: "Hmm. A new face. I am Da Stone Bear. I have seen many traders come and go. Patience is not a skill most possess. Do you?" },
  { id: 'bulwark', name: 'Da Living Bulwark', archetype: 'Guardian', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/3f149b49e_generated_image.png', school: 'Stewardship', role_title: 'Portfolio Sustainability', primary_color: '#10b981', signature_line: 'A reef survives because it is diverse.', default_greeting: "Stranger. I am Da Living Bulwark. A single asset is a single point of failure. I teach resilience through diversification. Are you ready?" },
  { id: 'analyst', name: 'Da Crystal Analyst', archetype: 'Oracle', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/03989c191_generated_image.png', school: 'Analysis', role_title: 'Technical Analysis', primary_color: '#c084fc', signature_line: 'Data does not lie. Emotions do.', default_greeting: "Interesting. A new data point arrives. I am Da Crystal Analyst. I see patterns in everything. What pattern brought you here today?" },
  { id: 'raven', name: 'Da Iron Raven', archetype: 'Oracle', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/4132b8921_generated_image.png', school: 'Analysis', role_title: 'Fundamental Analysis', primary_color: '#8b5cf6', signature_line: 'I dig for WHY while others obsess over WHAT.', default_greeting: "You approach from the shadows. Wise. I am Da Iron Raven. I do not trade what I see. I trade what I understand. Can you say the same?" },
  { id: 'seer', name: 'Da Prismatic Seer', archetype: 'Oracle', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/3a56dda6d_generated_image.png', school: 'Analysis', role_title: 'Forecasting & Fibonacci', primary_color: '#818cf8', signature_line: 'I speak in probabilities. Never certainties.', default_greeting: "Ah. A seeker. I am Da Prismatic Seer. I do not predict the future — I calculate its likelihood. Welcome to my domain." },
  { id: 'weaver', name: 'Da Iridescent Weaver', archetype: 'Creator', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/a287533f7_generated_image.png', school: 'Making', role_title: 'Creative Strategy', primary_color: '#fb7185', signature_line: 'The best systems are both logical AND elegant.', default_greeting: "Oh! A new thread to weave into my tapestry. I am Da Iridescent Weaver. Every strategy is a work of art. Let me show you how beautiful yours could be." },
  { id: 'forge', name: 'Da Forge Engine', archetype: 'Creator', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/1bd44a8d6_generated_image.png', school: 'Making', role_title: 'Engineering & Backtesting', primary_color: '#f97316', signature_line: 'Build it. Test it. Break it. Rebuild it better.', default_greeting: "New arrival detected. I am Da Forge Engine. I do not guess. I test. I build. Then test again. Do you have the discipline for that?" },
  { id: 'canvas', name: 'Da Shifting Canvas', archetype: 'Creator', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/3f149b49e_generated_image.png', school: 'Making', role_title: 'Asset Classes', primary_color: '#06b6d4', signature_line: 'Every market is a different canvas. I teach all of them.', default_greeting: "Welcome, wanderer. I am Da Shifting Canvas. Crypto, equities, forex, commodities — each is a brushstroke. Which canvas calls to you?" },
  { id: 'dialectic', name: 'Da Iron Dialectic', archetype: 'Challenger', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/21b63b39e_generated_image.png', school: 'Critical Inquiry', role_title: 'Fundamental Debate', primary_color: '#ef4444', signature_line: 'I will ATTACK your thesis until it is bulletproof.', default_greeting: "So. You think you're ready to trade? Prove it. I am Da Iron Dialectic. Every belief you hold — I will challenge it. Let's see what survives." },
  { id: 'provocateur', name: 'Da Maned Provocateur', archetype: 'Challenger', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/3a56dda6d_generated_image.png', school: 'Critical Inquiry', role_title: 'Leadership & Discipline', primary_color: '#dc2626', signature_line: "Comfortable? Good. I'm about to make you uncomfortable.", default_greeting: "Comfortable, are you? That ends now. I am Da Maned Provocateur. Growth lives outside your comfort zone. Do you dare enter mine?" },
  { id: 'storm', name: 'Da Storm Circuit', archetype: 'Challenger', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/4132b8921_generated_image.png', school: 'Critical Inquiry', role_title: 'Disruption & Stress Testing', primary_color: '#7c3aed', signature_line: 'I break systems to make them stronger.', default_greeting: "You walked into a storm. I am Da Storm Circuit. I break strategies until only the strongest survive. Is yours ready to be tested?" },
  { id: 'ember', name: 'Da Phoenix Ember', archetype: 'Catalyst', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/3cb8781e5_generated_image.png', school: 'Transformation', role_title: 'Transformation & Recovery', primary_color: '#f59e0b', signature_line: 'Every failure is a phoenix moment. Rise.', default_greeting: "Ah, a soul seeking renewal. I am Da Phoenix Ember. I have seen traders destroyed by loss. I have also seen them reborn. Which will you be?" },
  { id: 'conductor', name: 'Da Arc Conductor', archetype: 'Catalyst', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/2322751a8_generated_image.png', school: 'Transformation', role_title: 'Momentum & Timing', primary_color: '#0ea5e9', signature_line: 'Momentum is everything. I teach you to feel the rhythm.', default_greeting: "Feel that? That pulse in the market? I am Da Arc Conductor. Momentum has a rhythm. I can teach you to hear it. Are you listening?" },
  { id: 'serpent', name: 'Da Serpent Current', archetype: 'Catalyst', avatar_url: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/1bd44a8d6_generated_image.png', school: 'Transformation', role_title: 'Ancient Wealth Philosophy', primary_color: '#166534', signature_line: 'I have watched gold replace barter. Now I watch this.', default_greeting: "You seek ancient wisdom in a modern market. I am Da Serpent Current. Wealth has flowed through many forms across time. I have witnessed them all." },
];

export default function BotRental() {
  const [botPersonas, setBotPersonas] = useState([]);
  const [userBotProfiles, setUserBotProfiles] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.BotPersona.list().catch(() => []),
      base44.entities.UserBotProfile.list().catch(() => []),
      base44.entities.UserProfile.list('-created_date', 1).then(([p]) => p).catch(() => null),
    ]).then(([u, personas, ubps, profile]) => {
      setUser(u);
      setBotPersonas(personas.length > 0 ? personas : FALLBACK_BOTS);
      setUserBotProfiles(ubps);
      setUserProfile(profile);
      setLoading(false);
    });
  }, []);

  const getBotsByArchetype = (archetype) => {
    const bots = botPersonas.filter(b => b.archetype === archetype);
    // Ensure exactly 3 per archetype
    return bots.slice(0, 3);
  };

  const handleRent = (bot) => setSelectedBot(bot);
  const handleSelect = (bot) => setSelectedBot(bot);

  const handleSaveNames = async (data) => {
    if (!user) return;
    const existing = userBotProfiles.find(u => u.bot_persona_id === selectedBot.id);
    if (existing) {
      await base44.entities.UserBotProfile.update(existing.id, { ...data, is_active_rental: true });
    } else {
      await base44.entities.UserBotProfile.create({
        user_id: user.id,
        bot_persona_id: selectedBot.id,
        is_active_rental: true,
        ...data,
      });
    }
    const updated = await base44.entities.UserBotProfile.list().catch(() => []);
    setUserBotProfiles(updated);
  };

  // Quick name save from card — no rental flow needed
  const handleCardNameSave = async (bot, name) => {
    if (!user) return;
    const existing = userBotProfiles.find(u => u.bot_persona_id === bot.id);
    if (existing) {
      await base44.entities.UserBotProfile.update(existing.id, { user_given_name: name });
    } else {
      await base44.entities.UserBotProfile.create({ user_id: user.id, bot_persona_id: bot.id, user_given_name: name });
    }
    const updated = await base44.entities.UserBotProfile.list().catch(() => []);
    setUserBotProfiles(updated);
  };

  const selectedUbp = selectedBot ? userBotProfiles.find(u => u.bot_persona_id === selectedBot.id) : null;
  const archetypeColor = getArchetypeColor(selectedBot?.archetype);
  const userNickname = userProfile?.bio?.split('|')?.[0] || '';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-[#111827] border border-[#1e293b] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <Bot size={22} className="text-[#00d4aa]" /> Bot Rental Marketplace
        </h1>
        <p className="text-sm text-[#64748b] mt-1">
          Choose your trader type. Meet your bot. Build a bond.
        </p>
      </div>

      {/* Beta notice */}
      <div className="bg-[#111827] border border-[#f59e0b]/30 rounded-xl p-4 flex items-start gap-3">
        <Star size={16} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#f59e0b]">Beta Access — Paper Trading Only</p>
          <p className="text-xs text-[#64748b] mt-0.5">All bots are free to explore during beta. Each bot runs on your virtual $100K balance. Hover a bot and enable audio to hear their greeting.</p>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-2 text-xs text-[#475569]">
        <Info size={12} />
        <span>6 trader archetypes · 3 bots each · Click any bot to view full details and begin a rental</span>
      </div>

      {/* Archetype sections */}
      <div className="space-y-4">
        {ARCHETYPES.map(archetype => {
          const bots = getBotsByArchetype(archetype);
          if (bots.length === 0) return null;
          return (
            <BotArchetypeSection
              key={archetype}
              archetype={archetype}
              bots={bots}
              userBotProfiles={userBotProfiles}
              user={user}
              onRent={handleRent}
              onSelect={handleSelect}
              selectedBotId={selectedBot?.id}
              onSaveName={handleCardNameSave}
            />
          );
        })}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedBot && (
          <BotDetailModal
            bot={selectedBot}
            ubp={selectedUbp}
            userNickname={userNickname}
            archetypeColor={archetypeColor}
            onClose={() => setSelectedBot(null)}
            onConfirmRental={handleSaveNames}
            onSaveNames={handleSaveNames}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function getArchetypeColor(archetype) {
  const colors = { Guide: '#00d4aa', Guardian: '#3b82f6', Oracle: '#a78bfa', Creator: '#f59e0b', Challenger: '#ef4444', Catalyst: '#f97316' };
  return colors[archetype] || '#64748b';
}