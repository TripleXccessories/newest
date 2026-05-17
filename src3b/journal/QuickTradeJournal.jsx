import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMOTIONS = ['😤 Frustrated', '😰 Anxious', '😌 Calm', '😤 FOMO', '🤑 Greedy', '😎 Confident', '😔 Regretful', '⚡ Excited'];
const SETUPS = ['Breakout', 'Pullback', 'Support/Resistance', 'Trend Follow', 'Reversal', 'News Event', 'Other'];
const OUTCOMES = ['Planned target hit', 'Stopped out', 'Broke even', 'Still open', 'Early exit'];
const LESSONS = ['Stuck to plan', 'Moved stop loss', 'Entered too early', 'Sized too large', 'Good discipline', 'Chased entry', 'Nothing to change'];

export default function QuickTradeJournal({ open, onClose, trade = null }) {
  const [emotion, setEmotionState] = useState('');
  const [setup, setSetup] = useState('');
  const [outcome, setOutcome] = useState('');
  const [lessonList, setLessonList] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLesson = (l) => setLessonList(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  const save = async () => {
    setSaving(true);
    await base44.entities.TradeJournal.create({
      trade_id: trade?.id || null,
      ticker: trade?.ticker || '',
      emotion_at_entry: emotion,
      setup_type: setup,
      outcome_label: outcome,
      lessons_noted: lessonList.join(', '),
      notes,
      entry_price: trade?.entry_price || null,
      trade_type: trade?.trade_type || null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-[#1e293b] bg-[#07090f] max-h-[90vh] overflow-y-auto"
          >
            <div className="h-1 w-16 rounded-full bg-[#1e293b] mx-auto mt-3 mb-1" />

            <div className="px-5 pb-8 pt-3 space-y-5 max-w-lg mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#f59e0b]" />
                  <p className="text-sm font-black text-[#f1f5f9]">
                    Trade Journal {trade ? `· ${trade.ticker}` : ''}
                  </p>
                </div>
                <button onClick={onClose} className="text-[#475569] hover:text-[#f1f5f9]"><X size={16} /></button>
              </div>

              {/* Emotion */}
              <div>
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">How were you feeling?</p>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(e => (
                    <button key={e} onClick={() => setEmotionState(e)}
                      className="text-xs px-3 py-1.5 rounded-xl border transition-all"
                      style={{
                        borderColor: emotion === e ? '#f59e0b' : '#1e293b',
                        background: emotion === e ? '#f59e0b15' : 'transparent',
                        color: emotion === e ? '#f59e0b' : '#64748b',
                      }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setup */}
              <div>
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">Setup type</p>
                <div className="flex flex-wrap gap-2">
                  {SETUPS.map(s => (
                    <button key={s} onClick={() => setSetup(s)}
                      className="text-xs px-3 py-1.5 rounded-xl border transition-all"
                      style={{
                        borderColor: setup === s ? '#00d4aa' : '#1e293b',
                        background: setup === s ? '#00d4aa15' : 'transparent',
                        color: setup === s ? '#00d4aa' : '#64748b',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outcome */}
              <div>
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">Outcome</p>
                <div className="flex flex-wrap gap-2">
                  {OUTCOMES.map(o => (
                    <button key={o} onClick={() => setOutcome(o)}
                      className="text-xs px-3 py-1.5 rounded-xl border transition-all"
                      style={{
                        borderColor: outcome === o ? '#a78bfa' : '#1e293b',
                        background: outcome === o ? '#a78bfa15' : 'transparent',
                        color: outcome === o ? '#a78bfa' : '#64748b',
                      }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lessons */}
              <div>
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">What did you learn? (pick all that apply)</p>
                <div className="flex flex-wrap gap-2">
                  {LESSONS.map(l => (
                    <button key={l} onClick={() => toggleLesson(l)}
                      className="text-xs px-3 py-1.5 rounded-xl border transition-all"
                      style={{
                        borderColor: lessonList.includes(l) ? '#fb7185' : '#1e293b',
                        background: lessonList.includes(l) ? '#fb718515' : 'transparent',
                        color: lessonList.includes(l) ? '#fb7185' : '#64748b',
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free notes */}
              <div>
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">Additional notes</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Anything else you want to remember about this trade..."
                  className="w-full bg-[#0a0f1e] border border-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              {/* Save */}
              <button onClick={save} disabled={saving || saved}
                className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: saved ? '#00d4aa' : '#f59e0b', color: '#070b14' }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Journal Entry'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}