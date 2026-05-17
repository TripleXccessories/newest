import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMOTION_EMOJI = {
  confident: '💪', anxious: '😰', greedy: '🤑', disciplined: '🎯',
  fearful: '😨', neutral: '😐', excited: '🚀', frustrated: '😤',
};

const EMOTION_COLORS = {
  confident: '#00d4aa', disciplined: '#00d4aa', excited: '#f59e0b',
  neutral: '#94a3b8', anxious: '#f97316', fearful: '#ef4444',
  greedy: '#a78bfa', frustrated: '#ef4444',
};

export default function LessonsLearnedGallery({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    base44.entities.TradeJournal.filter({ user_id: user.id }, '-created_date', 50)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const allTags = ['all', ...new Set(entries.map(e => e.lesson_tag).filter(Boolean))];

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.note?.toLowerCase().includes(search.toLowerCase()) || e.ticker?.toLowerCase().includes(search.toLowerCase());
    const matchTag = tagFilter === 'all' || e.lesson_tag === tagFilter;
    return matchSearch && matchTag;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + tag filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lessons..."
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl pl-8 pr-3 py-2 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                tagFilter === tag ? 'bg-[#00d4aa] text-[#070b14]' : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'
              }`}
            >
              {tag === 'all' ? 'All' : tag.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#475569]">
          <BookOpen size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No journal entries yet.</p>
          <p className="text-xs text-[#334155] mt-1">Journal a trade from Paper Trading to start building your lessons gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((entry, i) => {
            const color = EMOTION_COLORS[entry.emotion] || '#94a3b8';
            const emoji = EMOTION_EMOJI[entry.emotion] || '💭';
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl border bg-[#0f172a] hover:border-opacity-60 transition-all"
                style={{ borderColor: `${color}30` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-[#f1f5f9]">{entry.ticker}</p>
                      <p className="text-[10px] text-[#475569] capitalize">{entry.emotion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${(entry.pnl || 0) >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                      {(entry.pnl || 0) >= 0 ? '+' : ''}${(entry.pnl || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#cbd5e1] leading-relaxed line-clamp-3">{entry.note}</p>

                <div className="flex items-center justify-between mt-3">
                  {entry.lesson_tag && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}15`, color }}>
                      {entry.lesson_tag.replace(/_/g, ' ')}
                    </span>
                  )}
                  <span className="text-[10px] text-[#334155] ml-auto">
                    {new Date(entry.created_date).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}