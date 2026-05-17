import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function PocketPalModal({ pal, onClose }) {
  if (!pal) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(3,5,8,0.85)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-3xl border p-8 space-y-6"
          style={{
            borderColor: `${pal.color}35`,
            background: `linear-gradient(145deg, ${pal.color}0d, #0a0f1e)`,
            boxShadow: `0 0 80px ${pal.color}20`,
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-[#1e293b] flex items-center justify-center hover:bg-[#334155] transition-colors"
          >
            <X size={14} className="text-[#94a3b8]" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: `${pal.color}20`, border: `1px solid ${pal.color}40` }}
            >
              {pal.symbol}
            </div>
            <div>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                style={{ background: `${pal.color}20`, color: pal.color }}
              >
                {pal.category}
              </span>
              <h2 className="text-xl font-black text-[#f1f5f9] mt-1">{pal.name}</h2>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm italic text-[#94a3b8] leading-relaxed border-l-2 pl-4" style={{ borderColor: pal.color }}>
            "{pal.tagline}"
          </p>

          {/* Description */}
          <p className="text-sm text-[#64748b] leading-relaxed">{pal.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {pal.tags.map(tag => (
              <span
                key={tag}
                className="text-[10px] px-3 py-1 rounded-full font-bold"
                style={{ background: `${pal.color}15`, color: pal.color, border: `1px solid ${pal.color}30` }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Signature */}
          <div className="rounded-2xl p-4 border" style={{ borderColor: `${pal.color}20`, background: `${pal.color}08` }}>
            <p className="text-[10px] font-mono text-[#475569] mb-1 uppercase tracking-widest">Signature Line</p>
            <p className="text-sm font-bold text-[#f1f5f9] italic">"{pal.signature}"</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}