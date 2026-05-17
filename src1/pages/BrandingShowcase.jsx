import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TradingLedger from '@/components/branding/TradingLedger';
import AcademyNotebook from '@/components/branding/AcademyNotebook';

export default function BrandingShowcase() {
  return (
    <div className="min-h-screen bg-[#030508] flex flex-col items-center justify-center gap-16 p-12">

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <p className="text-[10px] font-mono tracking-[0.4em] text-[#334155] uppercase">IINT Brand Props</p>
        <h1 className="text-2xl font-black text-[#f1f5f9] tracking-tight">Prop Showcase</h1>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-20">

        {/* Trading Ledger */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-[10px] font-mono tracking-[0.3em] text-[#c8980a] uppercase">Trading Prop</p>

          {/* Three sizes */}
          <div className="flex items-end gap-6">
            <TradingLedger size="sm" />
            <TradingLedger size="md" />
            <TradingLedger size="lg" />
          </div>

          <div className="text-center space-y-1 max-w-[200px]">
            <p className="text-xs font-bold text-[#c8980a]">Trading Ledger</p>
            <p className="text-[10px] text-[#475569] leading-relaxed">
              Dark cognac leather. Gold embroidered IINT crest. Gilt page edges. Formal. Premium.
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="w-px h-48 bg-[#1e293b] hidden sm:block" />

        {/* Academy Notebook */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-[10px] font-mono tracking-[0.3em] text-[#00d4aa] uppercase">Academy Prop</p>

          {/* Three sizes */}
          <div className="flex items-end gap-6">
            <AcademyNotebook size="sm" />
            <AcademyNotebook size="md" />
            <AcademyNotebook size="lg" />
          </div>

          <div className="text-center space-y-1 max-w-[200px]">
            <p className="text-xs font-bold text-[#00d4aa]">Academy Notebook</p>
            <p className="text-[10px] text-[#475569] leading-relaxed">
              Deep navy with teal accents. Spiral-bound. Chunky IINT block type. "ACADEMY" underneath.
            </p>
          </div>
        </motion.div>

      </div>

      {/* Trigger scene button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-2"
      >
        <Link
          to="/welcome-scene"
          className="px-8 py-3 rounded-2xl text-sm font-black tracking-wide transition-all hover:scale-105 inline-block"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', color: '#030508', boxShadow: '0 0 30px rgba(0,212,170,0.35)' }}
        >
          ▶ Play Welcome Packet Scene
        </Link>
        <p className="text-[10px] text-[#334155] font-mono">Lightbulb intro · slapstick ears gag · full pile</p>
      </motion.div>

      {/* Usage note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center border border-[#1e293b] rounded-2xl px-8 py-4 max-w-md"
      >
        <p className="text-[10px] text-[#334155] leading-relaxed">
          Both props are fully interactive SVG components — hover/tap animated, available in <code className="text-[#00d4aa]">sm</code>, <code className="text-[#00d4aa]">md</code>, and <code className="text-[#00d4aa]">lg</code> sizes.
          Drop them into any page as buttons or decorative brand accents.
        </p>
      </motion.div>
    </div>
  );
}