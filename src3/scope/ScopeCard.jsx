import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Target, Clock, Users, CheckSquare } from 'lucide-react';
import ScopeFindingForm from './ScopeFindingForm';
import { deviceLabel, browserLabel } from '@/lib/deviceDetect';

const PRIORITY_COLORS = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};

const CATEGORY_EMOJI = {
  bug_hunt: '🐛', ui_ux: '🎨', performance: '⚡', audio: '🔊',
  feature_test: '🧪', easter_egg: '🥚', security: '🔒', general: '📋',
};

export default function ScopeCard({ scope, user, userFinding }) {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(!!userFinding);
  const color = PRIORITY_COLORS[scope.priority] || '#00d4aa';

  return (
    <motion.div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${color}30`, background: `${color}06` }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between p-4 text-left"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl mt-0.5">{CATEGORY_EMOJI[scope.category] || '📋'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-[#f1f5f9] truncate">{scope.title}</h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0"
                style={{ background: `${color}20`, color }}>
                {scope.priority?.toUpperCase()}
              </span>
              {submitted && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#00d4aa]/15 text-[#00d4aa] shrink-0">
                  ✓ SUBMITTED
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748b] mt-1 line-clamp-2">{scope.description}</p>

            {/* Device/browser targets */}
            {(scope.target_devices?.length > 0 || scope.target_browsers?.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {scope.target_devices?.filter(d => d !== 'any').map(d => (
                  <span key={d} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#64748b]">
                    {deviceLabel(d)}
                  </span>
                ))}
                {scope.target_browsers?.filter(b => b !== 'any').map(b => (
                  <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#64748b]">
                    {browserLabel(b)}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-[10px] text-[#475569]">
                <Users size={9} /> {scope.completion_count || 0} submissions
              </span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-[#475569] shrink-0 mt-1" /> : <ChevronDown size={14} className="text-[#475569] shrink-0 mt-1" />}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[#1e293b] pt-4 space-y-4">
              {/* Acceptance criteria */}
              {scope.acceptance_criteria && (
                <div className="rounded-xl bg-[#0a0f1e] border border-[#1e293b] p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckSquare size={11} className="text-[#00d4aa]" />
                    <p className="text-[10px] font-bold text-[#00d4aa] uppercase tracking-wide">Acceptance Criteria</p>
                  </div>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{scope.acceptance_criteria}</p>
                </div>
              )}

              {/* Auto-seeded notice */}
              {scope.auto_seeded_from_finding_id && (
                <div className="text-[10px] text-[#f59e0b] bg-[#f59e0b]/08 border border-[#f59e0b]/20 rounded-lg px-3 py-2">
                  🔄 This scope was auto-generated from a tester finding. Multiple devices/browsers needed.
                </div>
              )}

              {submitted ? (
                <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-[#00d4aa]/08 border border-[#00d4aa]/20">
                  <CheckSquare size={14} className="text-[#00d4aa]" />
                  <p className="text-xs text-[#00d4aa] font-semibold">You've already submitted a finding for this scope.</p>
                </div>
              ) : (
                <ScopeFindingForm scope={scope} user={user} onSubmitted={() => setSubmitted(true)} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}