import React from 'react';
import { motion } from 'framer-motion';

export default function PocketPalCard({ pal, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.03, y: -4 }}
      onClick={() => onClick(pal)}
      className="cursor-pointer rounded-3xl border p-6 space-y-4 transition-all"
      style={{
        borderColor: `${pal.color}30`,
        background: `linear-gradient(145deg, ${pal.color}0a, #070b14)`,
      }}
    >
      {/* Symbol */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: `${pal.color}18`, border: `1px solid ${pal.color}35` }}
      >
        {pal.symbol}
      </div>

      {/* Category badge */}
      <div>
        <span
          className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
          style={{ background: `${pal.color}20`, color: pal.color }}
        >
          {pal.category}
        </span>
      </div>

      {/* Name & tagline */}
      <div className="space-y-1">
        <h3 className="text-sm font-black text-[#f1f5f9] leading-tight">{pal.name}</h3>
        <p className="text-[11px] text-[#64748b] leading-relaxed italic">"{pal.tagline}"</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {pal.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-[#1e293b] text-[#475569]">
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <p className="text-[10px] font-bold" style={{ color: pal.color }}>
        Tap to meet {pal.name.split(' ')[0]} →
      </p>
    </motion.div>
  );
}