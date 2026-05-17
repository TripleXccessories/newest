import React from 'react';
import { Shield, Zap, Brain, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const TRAIT_ICONS = {
  openness: Brain,
  formality: Shield,
  empathy: Target,
  directness: Zap,
  intensity: TrendingUp,
};

export default function RentalRoomHUD({ bot, aura, theme, uiOverlay }) {
  const traits = bot.traits || {};
  const traitEntries = Object.entries(traits).filter(([, v]) => v != null);

  return (
    <div className="h-full overflow-y-auto space-y-5">
      {/* Overlay ID badge */}
      {uiOverlay && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
          style={{ background: `${aura}10`, color: aura, border: `1px solid ${aura}20` }}
        >
          <Zap size={11} /> HUD: {uiOverlay.replace(/_/g, ' ')}
        </div>
      )}

      {/* Bot stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Archetype', value: bot.archetype },
          { label: 'School', value: bot.school },
          { label: 'Trader Type', value: bot.role_title },
          { label: 'Super Agent', value: bot.super_agent_active ? 'ACTIVE' : 'Inactive' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-3 rounded-xl border"
            style={{ borderColor: `${aura}20`, background: `${aura}05` }}
          >
            <p className="text-xs text-[#64748b] mb-1">{label}</p>
            <p
              className="text-sm font-bold"
              style={{ color: label === 'Super Agent' && bot.super_agent_active ? aura : '#f1f5f9' }}
            >
              {value || '—'}
            </p>
          </div>
        ))}
      </div>

      {/* Personality trait bars */}
      {traitEntries.length > 0 && (
        <div
          className="p-4 rounded-xl border space-y-3"
          style={{ borderColor: `${aura}20`, background: `${aura}05` }}
        >
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Personality Matrix</p>
          {traitEntries.map(([key, val]) => {
            const Icon = TRAIT_ICONS[key] || Zap;
            const pct = Math.min(100, Math.max(0, Number(val) * 10));
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[#94a3b8] capitalize">
                    <Icon size={11} /> {key}
                  </span>
                  <span style={{ color: aura }}>{val}/10</span>
                </div>
                <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: aura }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Environment info */}
      <div
        className="p-4 rounded-xl border"
        style={{ borderColor: `${aura}20`, background: `${aura}05` }}
      >
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Environment</p>
        <p className="text-sm font-bold text-[#f1f5f9] mb-1">{bot.environment_name || bot.rental_room_theme || '—'}</p>
        {bot.environment_desc && (
          <p className="text-xs text-[#64748b] leading-relaxed line-clamp-4">{bot.environment_desc}</p>
        )}
      </div>

      {/* Signature line */}
      {bot.signature_line && (
        <div
          className="p-4 rounded-xl border"
          style={{ borderColor: `${aura}20`, background: `${aura}05` }}
        >
          <p className="text-xs text-[#64748b] mb-2 uppercase tracking-wider">Signature</p>
          <p className="text-sm italic leading-relaxed" style={{ color: aura }}>
            "{bot.signature_line}"
          </p>
        </div>
      )}
    </div>
  );
}