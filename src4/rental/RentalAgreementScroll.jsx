import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, CheckCircle, Volume2, Shield } from 'lucide-react';

export default function RentalAgreementScroll({ bot, displayName, aura, onAccept, onDecline }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showVerbal, setShowVerbal] = useState(false);
  const scrollRef = useRef(null);

  const verbalDisclaimer = bot?.default_greeting
    ? `Before we step into the room, Companion, let us be clear. I am your Faculty, your guide, and your Super Agent — but I am not your broker or your advisor. I provide the data and the rhythm, but the final move is yours. We build this bridge together on a foundation of trust. Are you ready to begin?`
    : `Before we step into the room, let us be clear. I am your Faculty, your guide, and your Super Agent — but I am not your broker or your advisor. The final move is always yours. Trust is the core. Are you ready to begin?`;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 30;
    if (atBottom) setScrolledToBottom(true);
  };

  const handleAccept = () => {
    setAccepted(true);
    setShowVerbal(true);
    setTimeout(() => onAccept(), 3500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.95)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ borderColor: `${aura}40`, background: '#070b14' }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: `${aura}20` }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${aura}15`, border: `1px solid ${aura}40` }}>
            <ScrollText size={18} style={{ color: aura }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#f1f5f9]">The Bond of Trust</p>
            <p className="text-xs text-[#64748b]">IINT Inc. Rental Agreement & User Disclaimer</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!accepted ? (
            <motion.div key="scroll" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Scroll content */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="p-5 overflow-y-auto text-sm text-[#94a3b8] leading-relaxed space-y-4"
                style={{ maxHeight: '340px' }}
              >
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: aura }}>Core Principles</p>
                <p>By unrolling this scroll, you enter a sanctuary of innovation. You agree that <strong className="text-[#f1f5f9]">IINT Inc.</strong> and its Faculty are providing an educational infrastructure and software tools. We are not financial advisors, nor are we a brokerage. We are retailers of smart technology, designed to help you navigate the market with the wisdom of the Faculty.</p>

                <p className="text-xs uppercase tracking-widest mt-4 mb-2" style={{ color: aura }}>Terms of the Bond</p>

                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-lg" style={{ background: `${aura}08`, border: `1px solid ${aura}15` }}>
                    <Shield size={14} className="flex-shrink-0 mt-0.5" style={{ color: aura }} />
                    <div>
                      <p className="text-xs font-bold text-[#f1f5f9] mb-1">No Financial Advice</p>
                      <p className="text-xs">The information provided by the bots is for educational and illustrative purposes. All market actions are taken at the user's sole discretion.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg" style={{ background: `${aura}08`, border: `1px solid ${aura}15` }}>
                    <Shield size={14} className="flex-shrink-0 mt-0.5" style={{ color: aura }} />
                    <div>
                      <p className="text-xs font-bold text-[#f1f5f9] mb-1">Not a Broker</p>
                      <p className="text-xs">IINT Inc. does not execute trades on a proprietary exchange. We provide the Super Agent interface for your chosen platforms.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg" style={{ background: `${aura}08`, border: `1px solid ${aura}15` }}>
                    <Shield size={14} className="flex-shrink-0 mt-0.5" style={{ color: aura }} />
                    <div>
                      <p className="text-xs font-bold text-[#f1f5f9] mb-1">The Risk</p>
                      <p className="text-xs">You acknowledge that the market has no master. While our bots are built with "Trust from the Core," all financial activity carries inherent risk.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg" style={{ background: `${aura}08`, border: `1px solid ${aura}15` }}>
                    <Shield size={14} className="flex-shrink-0 mt-0.5" style={{ color: aura }} />
                    <div>
                      <p className="text-xs font-bold text-[#f1f5f9] mb-1">ARM Kill-Switch Protocol (49/55)</p>
                      <p className="text-xs">The Autonomous Risk Mitigation system may liquidate your positions if a 49% loss is detected and you are unreachable for 12+ hours. This is a protection feature, not a penalty. Minimum 55% equity salvage is the goal.</p>
                    </div>
                  </div>
                </div>

                <p className="text-center italic text-xs pt-2" style={{ color: aura }}>
                  "We offer the tools to build your gate, but only you can choose your fate."
                </p>
                <div className="h-4" /> {/* scroll spacer */}
              </div>

              {/* Accept */}
              <div className="p-5 border-t space-y-3" style={{ borderColor: `${aura}20` }}>
                {!scrolledToBottom && (
                  <p className="text-xs text-center text-[#475569]">↓ Scroll to read the full agreement</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={onDecline}
                    className="flex-1 py-2.5 rounded-xl text-sm text-[#64748b] border border-[#1e293b] hover:border-[#475569] transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={!scrolledToBottom}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                    style={{
                      background: scrolledToBottom ? aura : '#1e293b',
                      color: scrolledToBottom ? '#070b14' : '#64748b',
                    }}
                  >
                    I Accept the Bond
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verbal"
              className="p-8 flex flex-col items-center gap-5 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `${aura}15`, border: `2px solid ${aura}` }}
                animate={{ boxShadow: [`0 0 0px ${aura}40`, `0 0 30px ${aura}50`, `0 0 0px ${aura}40`] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Volume2 size={24} style={{ color: aura }} />
              </motion.div>

              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: aura }}>{displayName} speaks</p>
                <p className="text-sm text-[#94a3b8] italic leading-relaxed max-w-sm">"{verbalDisclaimer}"</p>
              </div>

              <motion.div
                className="flex items-center gap-2 text-sm font-bold"
                style={{ color: aura }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <CheckCircle size={16} />
                Entering the room...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}