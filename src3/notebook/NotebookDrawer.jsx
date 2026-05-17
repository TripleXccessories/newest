import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookMarked, Save, Plus, Trash2, Pin, PinOff, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NotebookDrawer({ open, onClose, context = 'general' }) {
  const [entries, setEntries] = useState([]);
  const [active, setActive] = useState(null); // null = list view, entry = edit view
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) load();
  }, [open]);

  useEffect(() => {
    if (active === 'new' && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [active]);

  const load = async () => {
    const all = await base44.entities.NotebookEntry.list('-created_date', 100);
    setEntries(all);
  };

  const openNew = () => {
    setDraft({ title: '', content: '' });
    setActive('new');
  };

  const openEntry = (entry) => {
    setDraft({ title: entry.title || '', content: entry.content || '' });
    setActive(entry);
  };

  const save = async () => {
    if (!draft.content.trim()) return;
    setSaving(true);
    if (active === 'new') {
      const created = await base44.entities.NotebookEntry.create({
        title: draft.title.trim() || null,
        content: draft.content.trim(),
        context,
        pinned: false,
      });
      setEntries(prev => [created, ...prev]);
    } else {
      const updated = await base44.entities.NotebookEntry.update(active.id, {
        title: draft.title.trim() || null,
        content: draft.content.trim(),
      });
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
    }
    setSaving(false);
    setActive(null);
  };

  const togglePin = async (entry, e) => {
    e.stopPropagation();
    const updated = await base44.entities.NotebookEntry.update(entry.id, { pinned: !entry.pinned });
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const deleteEntry = async (entry, e) => {
    e.stopPropagation();
    await base44.entities.NotebookEntry.delete(entry.id);
    setEntries(prev => prev.filter(e => e.id !== entry.id));
    if (active?.id === entry.id) setActive(null);
  };

  const filtered = entries.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (e.title || '').toLowerCase().includes(q) || e.content.toLowerCase().includes(q);
  });
  const pinned = filtered.filter(e => e.pinned);
  const rest = filtered.filter(e => !e.pinned);

  const CONTEXT_COLOR = context === 'trading' ? '#f59e0b' : context === 'academy' ? '#a78bfa' : '#00d4aa';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{ background: '#07090f', borderLeft: `1px solid ${CONTEXT_COLOR}25` }}
          >
            {/* Notebook cover strip */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${CONTEXT_COLOR}, ${CONTEXT_COLOR}40)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${CONTEXT_COLOR}15`, border: `1px solid ${CONTEXT_COLOR}30` }}>
                  <BookMarked size={16} style={{ color: CONTEXT_COLOR }} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#f1f5f9]">Notebook</p>
                  <p className="text-[9px] text-[#475569] capitalize">{context} notes · {entries.length} pages</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {active === null && (
                  <button onClick={openNew}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                    style={{ background: `${CONTEXT_COLOR}15`, color: CONTEXT_COLOR }}>
                    <Plus size={12} /> New Page
                  </button>
                )}
                <button onClick={onClose} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* EDIT VIEW */}
            {active !== null && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Notebook lines background */}
                <div className="flex-1 flex flex-col p-5 gap-3 overflow-hidden"
                  style={{
                    backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, #1e293b40 28px)`,
                    backgroundSize: '100% 28px',
                    backgroundPositionY: '52px',
                  }}>
                  {/* Title input */}
                  <input
                    value={draft.title}
                    onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                    placeholder="Page title (optional)..."
                    className="bg-transparent text-base font-bold text-[#f1f5f9] placeholder-[#334155] focus:outline-none border-b-2 pb-2"
                    style={{ borderColor: `${CONTEXT_COLOR}40` }}
                  />
                  {/* Content */}
                  <textarea
                    ref={textareaRef}
                    value={draft.content}
                    onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
                    placeholder="Start writing..."
                    className="flex-1 bg-transparent text-sm text-[#e2e8f0] placeholder-[#334155] focus:outline-none resize-none leading-7"
                    style={{ lineHeight: '28px' }}
                  />
                </div>

                {/* Save bar */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-[#1e293b]">
                  <button onClick={() => setActive(null)} className="text-xs text-[#475569] hover:text-[#f1f5f9]">
                    ← Back
                  </button>
                  <button onClick={save} disabled={saving || !draft.content.trim()}
                    className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold disabled:opacity-40 transition-all"
                    style={{ background: CONTEXT_COLOR, color: '#070b14' }}>
                    <Save size={12} /> {saving ? 'Saving...' : 'Save Page'}
                  </button>
                </div>
              </div>
            )}

            {/* LIST VIEW */}
            {active === null && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Search */}
                <div className="px-5 py-3 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2 bg-[#0a0f1e] border border-[#1e293b] rounded-xl px-3 py-2">
                    <Search size={12} className="text-[#334155] shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search notes..."
                      className="bg-transparent text-xs text-[#f1f5f9] placeholder-[#334155] focus:outline-none flex-1" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                  {entries.length === 0 && (
                    <div className="text-center py-16">
                      <BookMarked size={32} className="mx-auto mb-3" style={{ color: CONTEXT_COLOR }} />
                      <p className="text-sm font-bold text-[#475569]">Empty notebook</p>
                      <p className="text-xs text-[#334155] mt-1">Tap "New Page" to start writing</p>
                    </div>
                  )}

                  {pinned.length > 0 && (
                    <p className="text-[9px] text-[#334155] uppercase tracking-widest px-1 pt-1">📌 Pinned</p>
                  )}
                  {[...pinned, ...rest].map(entry => (
                    <button key={entry.id} onClick={() => openEntry(entry)}
                      className="w-full text-left p-3.5 rounded-xl border border-[#1e293b] hover:border-[#334155] transition-colors bg-[#0a0f1e] group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {entry.title && (
                            <p className="text-xs font-bold text-[#f1f5f9] truncate mb-0.5">{entry.title}</p>
                          )}
                          <p className="text-[11px] text-[#64748b] line-clamp-2 leading-relaxed">{entry.content}</p>
                          <p className="text-[9px] text-[#334155] mt-1.5">
                            {new Date(entry.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={e => togglePin(entry, e)}
                            className="p-1 rounded hover:bg-[#1e293b] transition-colors text-[#475569]">
                            {entry.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                          </button>
                          <button onClick={e => deleteEntry(entry, e)}
                            className="p-1 rounded hover:bg-[#fb7185]/10 text-[#334155] hover:text-[#fb7185] transition-colors">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}