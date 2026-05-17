import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Bell, BellOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AIMentorSidebar from '@/components/journal/AIMentorSidebar';

const EMOTIONS = [
  { id: 'confident', label: 'Confident', emoji: '💪' },
  { id: 'disciplined', label: 'Disciplined', emoji: '🎯' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'excited', label: 'Excited', emoji: '🚀' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'fearful', label: 'Fearful', emoji: '😨' },
  { id: 'greedy', label: 'Greedy', emoji: '🤑' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
];

const LESSON_TAGS = [
  'patience', 'fomo', 'risk_management', 'entry_timing',
  'exit_timing', 'position_sizing', 'emotional_control', 'market_reading', 'other'
];

export default function TradeJournalModal({ trade, user, onClose, onSaved }) {
  const [emotion, setEmotion] = useState('');
  const [note, setNote] = useState('');
  const [lessonTag, setLessonTag] = useState('other');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [journalHistory, setJournalHistory] = useState([]);

  useEffect(() => {
    if (user?.id) {
      base44.entities.TradeJournal.filter({ user_id: user.id }, '-created_date', 10)
        .then(setJournalHistory).catch(() => {});
    }
  }, [user?.id]);

  const handleSave = async () => {
    if (!emotion || !note.trim()) return;
    setSaving(true);
    await base44.entities.TradeJournal.create({
      trade_id: trade.id,
      user_id: user?.id || 'demo',
      ticker: trade.ticker,
      trade_type: trade.trade_type,
      entry_price: trade.entry_price,
      pnl: trade.pnl || 0,
      pnl_percent: trade.pnl_percent || 0,
      emotion,
      note,
      lesson_tag: lessonTag,
      notify_enabled: notifyEnabled,
    });
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.88)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl bg-[#111827] border border-[#00d4aa]/30 rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
          <h3 className="text-base font-bold text-[#f1f5f9] flex items-center gap-2">
            <BookOpen size={16} className="text-[#00d4aa]" /> Trade Journal
          </h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#f1f5f9]"><X size={16} /></button>
        </div>

        <div className="p-5 grid md:grid-cols-[1fr_280px] gap-5">
          <div className="space-y-5">
          {/* Trade context */}
          <div className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-[#1e293b]">
            <div>
              <p className="text-sm font-bold text-[#f1f5f9]">{trade.ticker}</p>
              <p className="text-xs text-[#64748b]">{trade.trade_type?.toUpperCase()} · Entry ${trade.entry_price?.toLocaleString()}</p>
            </div>
            {trade.pnl !== undefined && (
              <span className={`ml-auto text-sm font-bold ${(trade.pnl || 0) >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
              </span>
            )}
          </div>

          {/* Emotion picker */}
          <div>
            <p className="text-xs text-[#64748b] mb-2">How did this trade feel?</p>
            <div className="grid grid-cols-4 gap-2">
              {EMOTIONS.map(e => (
                <button
                  key={e.id}
                  onClick={() => setEmotion(e.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                    emotion === e.id
                      ? 'border-[#00d4aa] bg-[#00d4aa]/10'
                      : 'border-[#1e293b] hover:border-[#334155]'
                  }`}
                >
                  <span className="text-xl">{e.emoji}</span>
                  <span className="text-[10px] text-[#94a3b8]">{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-xs text-[#64748b] mb-2">What did you learn?</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Describe your thinking, what worked, what didn't..."
              rows={3}
              className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa] resize-none"
            />
          </div>

          {/* Lesson tag */}
          <div>
            <p className="text-xs text-[#64748b] mb-2">Tag this lesson</p>
            <div className="flex flex-wrap gap-1.5">
              {LESSON_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setLessonTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    lessonTag === tag
                      ? 'bg-[#00d4aa] text-[#070b14]'
                      : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'
                  }`}
                >
                  {tag.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Notification toggle */}
          <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-xl border border-[#1e293b]">
            <div className="flex items-center gap-2">
              {notifyEnabled ? <Bell size={14} className="text-[#00d4aa]" /> : <BellOff size={14} className="text-[#64748b]" />}
              <p className="text-xs text-[#94a3b8]">Journal reminders</p>
            </div>
            <button
              onClick={() => setNotifyEnabled(!notifyEnabled)}
              className={`relative w-9 h-5 rounded-full transition-colors ${notifyEnabled ? 'bg-[#00d4aa]' : 'bg-[#1e293b]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifyEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#1e293b] text-[#64748b] rounded-xl text-sm hover:text-[#f1f5f9] transition-colors">
              Skip
            </button>
            <button
              onClick={handleSave}
              disabled={!emotion || !note.trim() || saving}
              className="flex-1 py-2.5 bg-[#00d4aa] text-[#070b14] rounded-xl text-sm font-bold hover:bg-[#00d4aa]/90 transition-colors disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
          </div>

          {/* AI Mentor Sidebar */}
          <div className="hidden md:block">
            <AIMentorSidebar
              trade={trade}
              emotion={emotion}
              note={note}
              lessonTag={lessonTag}
              journalHistory={journalHistory}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}