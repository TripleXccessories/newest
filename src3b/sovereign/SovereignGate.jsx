import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import { isSovereign, validateSovereignReason, SOVEREIGN_CONFIG } from '@/lib/sovereignConfig';
import { base44 } from '@/api/base44Client';

/**
 * SovereignGate
 * 
 * Wraps any destructive or privileged action with an identity + reason confirmation wall.
 * 
 * Props:
 *   action_type   — one of SOVEREIGN_CONFIG.sovereign_required_actions
 *   target        — human-readable description of what is being acted upon
 *   user          — current user object (must have .email and .role)
 *   onConfirmed   — callback when the gate passes
 *   onCancel      — callback when dismissed
 *   children      — optional trigger element (if not provided, gate renders standalone)
 */
export default function SovereignGate({ action_type, target, user, onConfirmed, onCancel }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [passed, setPassed] = useState(false);

  const userIsSovereign = isSovereign(user?.email);
  const requiresSovereign = SOVEREIGN_CONFIG.sovereign_required_actions.includes(action_type);

  const handleConfirm = async () => {
    setError('');

    // Block non-sovereigns from sovereign-required actions
    if (requiresSovereign && !userIsSovereign) {
      // Log the blocked attempt
      await base44.entities.SovereignLog.create({
        actor_email: user?.email || 'unknown',
        actor_role: user?.role || 'unknown',
        action_type,
        target,
        reason: reason || '(no reason provided)',
        sovereignty_confirmed: false,
        was_blocked: true,
        block_reason: 'Actor is not the Sovereign. This action requires Sovereign-level authorization.',
        ip_fingerprint: navigator.userAgent,
        metadata: { timestamp: new Date().toISOString() },
      });
      setError('This action requires Sovereign authorization. Only the platform owner may proceed. This attempt has been logged.');
      return;
    }

    // Validate the written reason
    const { valid, issues } = validateSovereignReason(reason);
    if (!valid) {
      setError(issues.join('\n'));
      return;
    }

    setSubmitting(true);

    // Log the confirmed action
    await base44.entities.SovereignLog.create({
      actor_email: user?.email || 'unknown',
      actor_role: user?.role || 'unknown',
      action_type,
      target,
      reason: reason.trim(),
      sovereignty_confirmed: userIsSovereign,
      was_blocked: false,
      ip_fingerprint: navigator.userAgent,
      metadata: { timestamp: new Date().toISOString() },
    });

    setPassed(true);
    setSubmitting(false);

    setTimeout(() => {
      onConfirmed?.();
    }, 800);
  };

  const charCount = reason.trim().length;
  const minChars = SOVEREIGN_CONFIG.min_reason_length;
  const progress = Math.min((charCount / minChars) * 100, 100);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onCancel?.()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-[#070b14] border rounded-2xl overflow-hidden shadow-2xl"
        style={{ borderColor: requiresSovereign ? '#ef444440' : '#fbbf2440' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-start justify-between"
          style={{ borderColor: requiresSovereign ? '#ef444420' : '#fbbf2420',
                   background: requiresSovereign ? '#ef444408' : '#fbbf2408' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: requiresSovereign ? '#ef444420' : '#fbbf2420' }}>
              {requiresSovereign ? (
                <Lock size={18} className="text-[#ef4444]" />
              ) : (
                <AlertTriangle size={18} className="text-[#fbbf24]" />
              )}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest"
                style={{ color: requiresSovereign ? '#ef4444' : '#fbbf24' }}>
                {requiresSovereign ? 'Sovereign Authorization Required' : 'Destructive Action — Logged'}
              </p>
              <p className="text-sm font-bold text-[#f1f5f9] mt-0.5">
                {action_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-[#475569] hover:text-[#f1f5f9] transition-colors mt-0.5">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Target */}
          <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-3">
            <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1">Target</p>
            <p className="text-sm text-[#f1f5f9] font-mono">{target}</p>
          </div>

          {/* Sovereign status */}
          {requiresSovereign && (
            <div className="flex items-center gap-2 p-3 rounded-xl border"
              style={{
                borderColor: userIsSovereign ? '#00d4aa30' : '#ef444430',
                background: userIsSovereign ? '#00d4aa08' : '#ef444408',
              }}>
              <Shield size={14} style={{ color: userIsSovereign ? '#00d4aa' : '#ef4444' }} />
              <p className="text-xs font-bold" style={{ color: userIsSovereign ? '#00d4aa' : '#ef4444' }}>
                {userIsSovereign
                  ? 'Sovereign identity recognized — proceed with justification'
                  : 'You are not the Sovereign. This attempt will be logged and blocked.'}
              </p>
            </div>
          )}

          {/* Written justification */}
          <div>
            <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest block mb-2">
              Written Justification <span className="text-[#ef4444]">*</span>
            </label>
            <p className="text-[10px] text-[#475569] mb-2 leading-relaxed">
              Explain in your own words — clearly and completely — why this action is necessary,
              what it affects, and that you understand it cannot be undone. Minimum {minChars} characters.
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={5}
              placeholder="Write your reason here. Be specific. Explain the why, the impact, and confirm your understanding of the consequences..."
              className="w-full bg-[#0a0f1e] text-[#f1f5f9] text-sm rounded-xl px-4 py-3 outline-none border resize-none leading-relaxed"
              style={{ borderColor: charCount >= minChars ? '#00d4aa40' : '#1e293b' }}
            />
            {/* Progress bar */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-1 bg-[#1e293b] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: progress >= 100 ? '#00d4aa' : progress > 50 ? '#fbbf24' : '#ef4444',
                  }} />
              </div>
              <span className="text-[10px] font-mono shrink-0"
                style={{ color: charCount >= minChars ? '#00d4aa' : '#64748b' }}>
                {charCount}/{minChars}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-[#ef4444]/08 border border-[#ef4444]/30">
              <p className="text-xs text-[#ef4444] whitespace-pre-line">{error}</p>
            </div>
          )}

          {/* Passed */}
          <AnimatePresence>
            {passed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/30">
                <CheckCircle size={16} className="text-[#00d4aa]" />
                <p className="text-sm font-bold text-[#00d4aa]">Authorized & Logged. Proceeding...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!passed && (
            <div className="flex gap-3">
              <button onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting || charCount < minChars}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{
                  background: requiresSovereign ? (userIsSovereign ? '#ef4444' : '#334155') : '#fbbf24',
                  color: '#070b14',
                }}
              >
                {submitting ? 'Logging & Authorizing...' : requiresSovereign ? 'Sovereign Authorize' : 'Confirm & Log Action'}
              </button>
            </div>
          )}

          <p className="text-[9px] text-[#334155] text-center leading-relaxed">
            Every action through this gate is permanently logged to the SovereignLog with your identity,
            reason, timestamp, and browser fingerprint. This log cannot be deleted by any admin.
          </p>
        </div>
      </motion.div>
    </div>
  );
}