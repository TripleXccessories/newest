import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListMusic, Plus, Edit2, Trash2, Play, Clapperboard } from 'lucide-react';
import PlaylistEditor, { CAST_PREVIEWS } from './PlaylistEditor';

const STORAGE_KEY = 'iint_theatre_playlists';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function save(playlists) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

function DirectiveBadge({ directive }) {
  const emojis = (CAST_PREVIEWS[directive?.cast] || CAST_PREVIEWS.full).slice(0, 4);
  return (
    <div className="flex items-center gap-0.5">
      {emojis.map((e, i) => <span key={i} className="text-sm">{e}</span>)}
      {!directive?.skipFinale && <span className="text-sm">🤖</span>}
    </div>
  );
}

export default function PlaylistPanel({ activeDirective, onActivate }) {
  const [playlists, setPlaylists] = useState(load);
  const [editing, setEditing] = useState(null);   // null | 'new' | playlist object
  const [open, setOpen] = useState(false);

  const persist = (updated) => { setPlaylists(updated); save(updated); };

  const handleSave = (pl) => {
    const existing = playlists.find(p => p.id === pl.id);
    const updated = existing
      ? playlists.map(p => p.id === pl.id ? pl : p)
      : [...playlists, pl];
    persist(updated);
    setEditing(null);
  };

  const handleDelete = (id) => {
    persist(playlists.filter(p => p.id !== id));
    if (activeDirective?._playlistId === id) onActivate(null);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
        style={{
          borderColor: open ? '#00d4aa' : '#1e293b',
          background: open ? '#00d4aa15' : 'transparent',
          color: open ? '#00d4aa' : '#64748b',
        }}
        title="Theatre Playlists"
      >
        <Clapperboard size={13} />
        Playlists {playlists.length > 0 && <span className="bg-[#00d4aa] text-[#070b14] rounded-full px-1.5 py-0.5 text-[9px] font-black">{playlists.length}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full mb-2 left-0 right-0 z-40 rounded-2xl border border-[#1e293b] bg-[#0f172a] overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <ListMusic size={14} className="text-[#00d4aa]" />
                <span className="text-xs font-bold text-[#f1f5f9]">Theatre Playlists</span>
              </div>
              <button
                onClick={() => setEditing('new')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#00d4aa] text-[#070b14] text-[11px] font-bold hover:bg-[#00d4aa]/90 transition-colors"
              >
                <Plus size={11} /> New
              </button>
            </div>

            {/* Playlist list */}
            <div className="max-h-64 overflow-y-auto">
              {playlists.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-[#334155] italic">No playlists yet.</p>
                  <p className="text-[10px] text-[#1e293b] mt-1">Create one to direct your own theatre show.</p>
                </div>
              ) : playlists.map(pl => {
                const isActive = activeDirective?._playlistId === pl.id;
                return (
                  <div
                    key={pl.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-[#1e293b]/50 last:border-0 hover:bg-[#070b14]/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-[#f1f5f9] truncate">{pl.name}</p>
                        {isActive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] font-bold border border-[#00d4aa]/30 flex-shrink-0">ACTIVE</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#475569] capitalize">{pl.genre} · {pl.bpm} BPM · {pl.intensity}</span>
                      </div>
                      <DirectiveBadge directive={pl.directive} />
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onActivate(isActive ? null : { ...pl.directive, _playlistId: pl.id, _name: pl.name })}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all"
                        style={{
                          borderColor: isActive ? '#00d4aa' : '#1e293b',
                          background: isActive ? '#00d4aa20' : 'transparent',
                          color: isActive ? '#00d4aa' : '#475569',
                        }}
                        title={isActive ? 'Deactivate' : 'Activate for next show'}
                      >
                        <Play size={11} fill={isActive ? '#00d4aa' : 'none'} />
                      </button>
                      <button
                        onClick={() => setEditing(pl)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e293b] text-[#475569] hover:text-[#f1f5f9] transition-colors"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        onClick={() => handleDelete(pl.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e293b] text-[#475569] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active hint */}
            {activeDirective && (
              <div className="px-4 py-2 bg-[#00d4aa]/5 border-t border-[#00d4aa]/20">
                <p className="text-[10px] text-[#00d4aa]">
                  ✦ <strong>{activeDirective._name}</strong> will direct the next show when idle triggers
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor modal */}
      <AnimatePresence>
        {editing && (
          <PlaylistEditor
            initialPlaylist={editing === 'new' ? null : editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}