import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Scroll } from 'lucide-react';

const TYPE_COLORS = {
  quest: '#a78bfa', mission: '#60a5fa', decree: '#f59e0b',
  prophecy: '#fb7185', ritual: '#00d4aa', summons: '#f97316',
};

export default function QuestTracker({ messages = [] }) {
  const active = messages.filter(m => !m.is_completed && !m.flagged_for_deletion);
  const completed = messages.filter(m => m.is_completed).slice(0, 3);

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest flex items-center gap-1.5">
          <Scroll size={10} /> Active Quests
        </p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a78bfa]/10 text-[#a78bfa] font-bold">
          {active.length} open
        </span>
      </div>

      {active.length === 0 && completed.length === 0 && (
        <div className="text-center py-6">
          <Scroll size={24} className="mx-auto mb-2 text-[#334155]" />
          <p className="text-xs text-[#334155]">No active quests</p>
          <p className="text-[10px] text-[#1e293b] mt-0.5">Summon one from the Narrative Portal</p>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {active.map((msg, i) => {
            const color = TYPE_COLORS[msg.task_type] || '#a78bfa';
            const expires = new Date(msg.expires_at);
            const hoursLeft = Math.max(0, Math.floor((expires - new Date()) / 3600000));
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ borderColor: `${color}25`, background: `${color}06` }}>
                <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-[#f1f5f9] truncate">{msg.title}</p>
                  <p className="text-[9px] text-[#475569]">{msg.narrator_name} · {msg.task_type}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Clock size={9} style={{ color: hoursLeft <= 2 ? '#fb7185' : '#f59e0b' }} />
                  <span className="text-[9px]" style={{ color: hoursLeft <= 2 ? '#fb7185' : '#f59e0b' }}>
                    {hoursLeft}h
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {completed.length > 0 && (
          <div className="pt-1 border-t border-[#1e293b]">
            <p className="text-[9px] text-[#334155] mb-1.5 uppercase tracking-widest">Recently Completed</p>
            {completed.map(msg => (
              <div key={msg.id} className="flex items-center gap-2 py-1.5 opacity-50">
                <CheckCircle2 size={10} className="text-[#00d4aa] shrink-0" />
                <p className="text-[10px] text-[#64748b] truncate">{msg.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}