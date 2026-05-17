import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BotCharacterCard from './BotCharacterCard';

const ARCHETYPE_META = {
  Guide:      { color: '#00d4aa', desc: 'Navigate the market maze with clarity and wisdom', symbol: '🧭' },
  Guardian:   { color: '#3b82f6', desc: 'Protect your capital with iron discipline', symbol: '🛡️' },
  Oracle:     { color: '#a78bfa', desc: 'See patterns others miss through data mastery', symbol: '🔮' },
  Creator:    { color: '#f59e0b', desc: 'Build elegant systems and strategies from scratch', symbol: '⚒️' },
  Challenger: { color: '#ef4444', desc: 'Stress-test your thesis until it is bulletproof', symbol: '⚔️' },
  Catalyst:   { color: '#f97316', desc: 'Ignite breakthroughs and ride momentum waves', symbol: '⚡' },
};

export default function BotArchetypeSection({ archetype, bots, userBotProfiles, user, onRent, onSelect, selectedBotId, onSaveName }) {
  const [expanded, setExpanded] = useState(true);
  const meta = ARCHETYPE_META[archetype] || { color: '#64748b', desc: '', symbol: '🤖' };

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${meta.color}30` }}>
      {/* Section header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${meta.color}12, ${meta.color}06)` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.symbol}</span>
          <div className="text-left">
            <p className="text-base font-bold text-[#f1f5f9]">Da {archetype}s</p>
            <p className="text-xs mt-0.5" style={{ color: meta.color }}>{meta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#475569]">{bots.length} bots</span>
          {expanded ? <ChevronUp size={16} className="text-[#475569]" /> : <ChevronDown size={16} className="text-[#475569]" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-[#070b14]">
              {bots.map(bot => {
                const ubp = userBotProfiles?.find(u => u.bot_persona_id === bot.id);
                return (
                  <BotCharacterCard
                    key={bot.id}
                    bot={bot}
                    ubp={ubp}
                    isSelected={selectedBotId === bot.id}
                    onSelect={() => onSelect(bot)}
                    onRent={() => onRent(bot)}
                    archetypeColor={meta.color}
                    onSaveName={onSaveName}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}