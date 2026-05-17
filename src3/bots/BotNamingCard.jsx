import React, { useState } from 'react';
import { Pencil, Check, Shuffle, X } from 'lucide-react';

const RANDOM_NAMES = ['Apex', 'Vortex', 'Echo', 'Cipher', 'Nova', 'Raven', 'Atlas', 'Flux', 'Zenith', 'Sage', 'Ember', 'Ghost', 'Titan', 'Prism', 'Volt'];

export default function BotNamingCard({ bot, userBotProfile, onSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userBotProfile?.user_given_name || '');
  const [callMe, setCallMe] = useState(userBotProfile?.call_me_as || '');

  const randomize = () => {
    setName(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]);
  };

  const handleSave = () => {
    onSave({ user_given_name: name, call_me_as: callMe });
    setEditing(false);
  };

  const displayName = userBotProfile?.user_given_name || '—';

  return (
    <div
      className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 hover:border-[#00d4aa]/20 transition-all"
      style={{ borderTopColor: bot.primary_color || '#1e293b' }}
    >
      {/* Bot header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-base font-bold text-[#f1f5f9]">{displayName}</p>
          <p className="text-xs text-[#64748b] mt-0.5">"{bot.archetype ? `The ${bot.archetype}` : bot.role_title}"</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-[#64748b] hover:text-[#00d4aa] transition-colors"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {/* Signature line */}
      <p className="text-xs text-[#475569] italic mb-4 leading-relaxed">"{bot.signature_line}"</p>

      {editing ? (
        <div className="space-y-3">
          {/* Bot name input */}
          <div>
            <label className="text-xs text-[#64748b] mb-1 block">Give this bot a name</label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nova, Atlas, Cipher..."
                className="flex-1 bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
              />
              <button
                onClick={randomize}
                title="Randomize"
                className="px-3 py-2 border border-[#1e293b] rounded-lg text-[#64748b] hover:text-[#00d4aa] hover:border-[#00d4aa]/30 transition-colors"
              >
                <Shuffle size={13} />
              </button>
            </div>
          </div>

          {/* What should this bot call you */}
          <div>
            <label className="text-xs text-[#64748b] mb-1 block">What should this bot call you?</label>
            <input
              value={callMe}
              onChange={(e) => setCallMe(e.target.value)}
              placeholder="e.g. Chief, Commander, Alex..."
              className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d4aa] text-[#070b14] rounded-lg text-xs font-bold"
            >
              <Check size={12} /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1e293b] text-[#64748b] rounded-lg text-xs hover:text-[#f1f5f9] transition-colors"
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-[#64748b]">
          <span>Calls you: <span className="text-[#94a3b8]">{userBotProfile?.call_me_as || 'Not set'}</span></span>
          <span
            className="px-2 py-0.5 rounded text-[10px]"
            style={{
              background: `${bot.primary_color || '#00d4aa'}15`,
              color: bot.primary_color || '#00d4aa',
            }}
          >
            {bot.knowledge_domain?.replace('_', ' ')}
          </span>
        </div>
      )}
    </div>
  );
}