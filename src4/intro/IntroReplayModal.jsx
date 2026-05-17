import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import IntroAct1 from './IntroAct1';
import IntroAct2 from './IntroAct2';
import IntroAct3 from './IntroAct3';

export default function IntroReplayModal({ userName, onClose }) {
  const [act, setAct] = useState(1);

  const handleComplete = () => onClose();

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#020408]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 text-[#64748b] hover:text-[#f1f5f9] border border-[#1e293b] rounded-lg transition-colors"
      >
        <X size={16} />
      </button>

      <AnimatePresence mode="wait">
        {act === 1 && <IntroAct1 key="act1" userName={userName} onComplete={() => setAct(2)} />}
        {act === 2 && <IntroAct2 key="act2" onComplete={() => setAct(3)} />}
        {act === 3 && <IntroAct3 key="act3" userName={userName || 'Trader'} onComplete={handleComplete} />}
      </AnimatePresence>
    </motion.div>
  );
}