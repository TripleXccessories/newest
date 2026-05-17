import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Lightbulb } from 'lucide-react';
import LightbulbModerator from '@/components/moderation/LightbulbModerator';

export default function HelpSearchBar({ onSearch, placeholder = "Ask anything... I'm all ears (or not).", source = 'help_bar' }) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitted(value);
    setDrawerOpen(true);
    if (onSearch) onSearch(value);
  };

  const handleSuspend = (level) => {
    // Parent can handle redirect to login / suspension page
    console.warn('User suspended:', level);
  };

  return (
    <div className="relative w-full">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search size={16} className="absolute left-4 text-[#475569]" />
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setDrawerOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#111827] border border-[#1e293b] rounded-2xl pl-10 pr-14 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#fbbf24]/40 transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(''); setSubmitted(''); }}
            className="absolute right-10 text-[#475569] hover:text-[#94a3b8]"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setDrawerOpen(v => !v)}
          className="absolute right-3 text-[#fbbf24] hover:text-[#fbbf24]/80 transition-colors"
          title="Toggle lightbulb assistant"
        >
          <Lightbulb size={16} />
        </button>
      </form>

      {/* Lightbulb drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
          >
            <div className="bg-[#0f172a] border border-[#fbbf24]/20 rounded-3xl p-6 shadow-2xl">
              <LightbulbModerator
                inputValue={submitted}
                onSuspend={handleSuspend}
                source={source}
              />
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-2 text-[10px] text-[#475569] hover:text-[#94a3b8]"
            >
              close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}