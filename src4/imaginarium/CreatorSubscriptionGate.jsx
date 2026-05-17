import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Sparkles, Star, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SAVE_PACKS, MAX_COMPANION_SLOTS } from '@/lib/tierRules';

/**
 * CreatorSubscriptionGate
 * Shows a CTA popup when user tries to Save or Export a companion
 * without a Creator subscription or without save credits.
 */
export default function CreatorSubscriptionGate({
  isOpen,
  onClose,
  mode = 'save',          // 'save' | 'export' | 'no_slots' | 'no_credits'
  savesRemaining = 0,
  slotsRemaining = 0,
  isFirstFreeCompanion = false,
  onPurchase,             // (packId) => void
  isUnlocked = false,     // University graduated
}) {
  const [selectedPack, setSelectedPack] = useState(null);

  if (!isOpen) return null;

  // First companion is always free (no gate)
  if (isFirstFreeCompanion) return null;

  const isNoSlots = mode === 'no_slots';
  const isNoCredits = mode === 'no_credits' || savesRemaining === 0;
  const needsSubscription = !isUnlocked || mode === 'subscription';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md rounded-3xl border overflow-hidden"
          style={{ background: '#070b14', borderColor: '#1e293b' }}
        >
          {/* Header */}
          <div className="relative p-6 pb-4 text-center"
            style={{ background: 'linear-gradient(180deg, rgba(0,212,170,0.08) 0%, transparent 100%)' }}>
            <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]">
              <X size={12} className="text-[#64748b]" />
            </button>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)' }}>
              {isNoSlots ? <AlertTriangle size={24} className="text-[#fbbf24]" /> : <Lock size={24} className="text-[#00d4aa]" />}
            </div>

            {isNoSlots ? (
              <>
                <h2 className="text-lg font-black text-[#f1f5f9] mb-1">No Slot Available</h2>
                <p className="text-xs text-[#64748b]">All your companion slots are full. Purchase more slots or override an existing one.</p>
              </>
            ) : isNoCredits ? (
              <>
                <h2 className="text-lg font-black text-[#f1f5f9] mb-1">Out of Save Credits</h2>
                <p className="text-xs text-[#64748b]">You've used all your save credits. Every save or edit counts as 1 credit.</p>
              </>
            ) : needsSubscription ? (
              <>
                <h2 className="text-lg font-black text-[#f1f5f9] mb-1">Creator Access Required</h2>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  {!isUnlocked
                    ? 'Complete University level to unlock the Companion Creator subscription options.'
                    : `Saving and exporting custom companions requires a Creator-tier subscription or save pack.`}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-[#f1f5f9] mb-1">Save Your Companion</h2>
                <p className="text-xs text-[#64748b]">Choose a save pack — each save counts, including minor edits.</p>
              </>
            )}

            {/* Status chips */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="px-2 py-1 rounded-lg text-[9px] font-bold bg-[#1e293b] text-[#475569]">
                💾 {savesRemaining} saves left
              </div>
              <div className="px-2 py-1 rounded-lg text-[9px] font-bold bg-[#1e293b] text-[#475569]">
                🗂️ {slotsRemaining}/{MAX_COMPANION_SLOTS} slots
              </div>
            </div>
          </div>

          {/* Locked university notice */}
          {!isUnlocked && (
            <div className="mx-4 mb-4 p-3 rounded-2xl border border-[#fbbf24]/20 bg-[#fbbf24]/05 flex items-start gap-3">
              <Star size={14} className="text-[#fbbf24] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                Companion Creator pricing is unlocked after completing the <strong className="text-[#fbbf24]">University level</strong> course and your first free interactive companion build.
              </p>
            </div>
          )}

          {/* Save packs — only show if unlocked */}
          {isUnlocked && (
            <div className="px-4 pb-4 space-y-2">
              <p className="text-[9px] font-bold text-[#475569] uppercase tracking-widest mb-3">Select a Save Pack</p>
              {SAVE_PACKS.map(pack => (
                <button key={pack.id} onClick={() => setSelectedPack(pack.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: selectedPack === pack.id ? '#00d4aa' : '#1e293b',
                    background: selectedPack === pack.id ? 'rgba(0,212,170,0.07)' : '#0a0f1e',
                  }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-black text-[#f1f5f9]">{pack.label}</span>
                      {pack.badge && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-[#00d4aa]/15 text-[#00d4aa]">{pack.badge}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#64748b]">{pack.description}</p>
                    <p className="text-[9px] text-[#334155] mt-0.5">Each slot = card frame + scene + character + voice + personality</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-[#00d4aa]">${pack.price_usd}</p>
                    <p className="text-[8px] text-[#475569]">non-refundable</p>
                  </div>
                  {selectedPack === pack.id && (
                    <CheckCircle2 size={16} className="text-[#00d4aa] shrink-0" />
                  )}
                </button>
              ))}

              {/* Override notice */}
              {slotsRemaining === 0 && (
                <div className="p-3 rounded-xl border border-[#fbbf24]/20 bg-[#fbbf24]/05 text-[10px] text-[#94a3b8]">
                  <strong className="text-[#fbbf24]">No free slots.</strong> A new purchase will ask if you want to override an existing slot or add a slot (if under {MAX_COMPANION_SLOTS} max).
                </div>
              )}

              {/* Max slots notice */}
              {slotsRemaining >= MAX_COMPANION_SLOTS && (
                <div className="p-3 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/05 text-[10px] text-[#94a3b8]">
                  <strong className="text-[#ef4444]">Maximum {MAX_COMPANION_SLOTS} slots reached.</strong> You must override an existing companion to save new ones.
                </div>
              )}

              <button
                onClick={() => selectedPack && onPurchase?.(selectedPack)}
                disabled={!selectedPack}
                className="w-full py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-40 mt-2"
                style={{ background: selectedPack ? '#00d4aa' : '#1e293b', color: selectedPack ? '#070b14' : '#475569' }}>
                <Sparkles size={14} className="inline mr-2" />
                Purchase Save Pack
              </button>

              <p className="text-center text-[9px] text-[#334155]">
                Max {MAX_COMPANION_SLOTS} slots total · All purchases non-refundable · Slots are permanent to your account
              </p>
            </div>
          )}

          {/* Not unlocked — teaser */}
          {!isUnlocked && (
            <div className="px-4 pb-6 text-center">
              <div className="text-3xl mb-2">🎓</div>
              <p className="text-xs text-[#475569]">Keep going through the Academy. The Companion Creator opens at University.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}