import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mic, BookOpen, Zap } from 'lucide-react';

const ARCHETYPE_ICONS = {
  Guide: '🧭', Creator: '🎨', Oracle: '🔮', Challenger: '⚔️', Guardian: '🛡️', Catalyst: '⚡',
};

const STATUS_STYLES = {
  active:  { label: 'Active',   dot: '#00d4aa', ring: '#00d4aa30' },
  draft:   { label: 'In Draft', dot: '#f59e0b', ring: '#f59e0b30' },
  retired: { label: 'Retired',  dot: '#475569', ring: '#47556930' },
};

export default function FacultyStatusCard({ persona, lessonCount = 0, index = 0 }) {
  const color = persona.primary_color || '#00d4aa';
  const st = STATUS_STYLES[persona.status] || STATUS_STYLES.draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="rounded-2xl border p-4 space-y-3 relative overflow-hidden group hover:scale-[1.02] transition-transform"
      style={{ borderColor: `${color}25`, background: `radial-gradient(ellipse at top left, ${color}08, #070b14 75%)` }}
    >
      {/* Glow top-left */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}10, transparent 55%)` }} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Avatar circle */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 font-bold"
            style={{ background: `${color}20`, border: `2px solid ${color}40`, color }}>
            {ARCHETYPE_ICONS[persona.archetype] || persona.name?.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-black text-[#f1f5f9] leading-tight">{persona.name}</p>
            <p className="text-[10px] text-[#475569]">{persona.archetype} · {persona.school}</p>
          </div>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-full"
          style={{ background: st.ring }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
          <span className="text-[9px] font-bold" style={{ color: st.dot }}>{st.label}</span>
        </div>
      </div>

      {/* Role */}
      {persona.role_title && (
        <p className="text-[10px] text-[#64748b] italic leading-snug line-clamp-2">
          {persona.role_title}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1 text-[10px] text-[#475569]">
          <BookOpen size={10} style={{ color }} />
          <span>{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</span>
        </div>
        {persona.voice_locked && (
          <div className="flex items-center gap-1 text-[10px] text-[#475569]">
            <Mic size={10} className="text-[#a78bfa]" />
            <span className="text-[#a78bfa]">Voice locked</span>
          </div>
        )}
        {persona.super_agent_active && (
          <div className="flex items-center gap-1 text-[10px] text-[#f59e0b]">
            <Zap size={10} />
            <span>Super Agent</span>
          </div>
        )}
        {persona.personality_locked && (
          <div className="flex items-center gap-1 text-[10px] text-[#475569]">
            <Lock size={10} />
            <span>Locked</span>
          </div>
        )}
      </div>

      {/* Signature line */}
      {persona.signature_line && (
        <p className="text-[9px] italic text-[#334155] border-t border-[#1e293b] pt-2 line-clamp-2">
          "{persona.signature_line}"
        </p>
      )}
    </motion.div>
  );
}