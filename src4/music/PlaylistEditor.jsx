import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Shuffle, Plus, Trash2, Check } from 'lucide-react';

/**
 * PlaylistEditor — Create or edit a playlist with music metadata
 * that maps to a theatre show directive.
 */

export const GENRES = ['electronic', 'jazz', 'hip-hop', 'classical', 'ambient', 'rock', 'lo-fi'];
export const INTENSITIES = ['chill', 'moderate', 'intense', 'euphoric'];

// Map metadata combos to show directives
export function deriveShowDirective({ bpm, intensity, genre }) {
  // High BPM + intense → full cast, fast drops, Robot zaps everyone
  if (bpm >= 140 && intensity === 'intense') return { cast: 'full', dropSpeed: 'fast',  robotEarly: true,  skipFinale: false };
  if (bpm >= 140 && intensity === 'euphoric') return { cast: 'full', dropSpeed: 'fast',  robotEarly: true,  skipFinale: false };
  // Chill/ambient → just the Lightbulb + 2 calm characters, no Robot
  if (intensity === 'chill' || genre === 'ambient') return { cast: 'minimal', dropSpeed: 'slow', robotEarly: false, skipFinale: true  };
  // Jazz / classical → small cast, slower, elegant
  if (genre === 'jazz' || genre === 'classical') return { cast: 'small',   dropSpeed: 'slow', robotEarly: false, skipFinale: false };
  // Lo-fi → Pathfinder + Weaver + Serpent only, very slow drops, no Robot
  if (genre === 'lo-fi') return { cast: 'lofi',    dropSpeed: 'slow', robotEarly: false, skipFinale: true  };
  // Hip-hop → Dialectic + Storm + Conductor lead, Robot arrives early
  if (genre === 'hip-hop') return { cast: 'hype',   dropSpeed: 'medium', robotEarly: true,  skipFinale: false };
  // Default → full show
  return { cast: 'full', dropSpeed: 'medium', robotEarly: false, skipFinale: false };
}

export const CAST_PREVIEWS = {
  full:    ['💡','🗺️','🧵','🔥','🔮','⚡','⚔️','🐍','🌩️'],
  minimal: ['💡','🗺️','🔮'],
  small:   ['💡','🗺️','🧵','🐍'],
  lofi:    ['💡','🗺️','🧵','🐍'],
  hype:    ['💡','⚔️','🌩️','⚡','🔥'],
};

function ShowPreview({ directive }) {
  const emojis = CAST_PREVIEWS[directive?.cast] || CAST_PREVIEWS.full;
  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#070b14] p-3 space-y-2">
      <p className="text-[10px] font-bold tracking-widest text-[#475569] uppercase">Show Preview</p>
      <div className="flex flex-wrap gap-1.5">
        {emojis.map((e, i) => <span key={i} className="text-lg">{e}</span>)}
        {!directive?.skipFinale && <span className="text-lg">🤖</span>}
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <span className="text-[#475569]">Drop speed: <span className="text-[#94a3b8]">{directive?.dropSpeed}</span></span>
        <span className="text-[#475569]">Robot: <span className="text-[#94a3b8]">{directive?.robotEarly ? 'early entrance' : directive?.skipFinale ? 'no show' : 'standard'}</span></span>
        <span className="text-[#475569]">Finale: <span className="text-[#94a3b8]">{directive?.skipFinale ? 'skip' : 'full'}</span></span>
        <span className="text-[#475569]">Cast size: <span className="text-[#94a3b8]">{(CAST_PREVIEWS[directive?.cast] || []).length} chars</span></span>
      </div>
    </div>
  );
}

export default function PlaylistEditor({ initialPlaylist = null, onSave, onCancel }) {
  const [name, setName] = useState(initialPlaylist?.name || '');
  const [bpm, setBpm] = useState(initialPlaylist?.bpm || 120);
  const [intensity, setIntensity] = useState(initialPlaylist?.intensity || 'moderate');
  const [genre, setGenre] = useState(initialPlaylist?.genre || 'electronic');
  const [tracks, setTracks] = useState(initialPlaylist?.tracks || []);
  const [newTrack, setNewTrack] = useState('');

  const directive = deriveShowDirective({ bpm, intensity, genre });

  const addTrack = () => {
    if (!newTrack.trim()) return;
    setTracks(t => [...t, { title: newTrack.trim(), id: Date.now() }]);
    setNewTrack('');
  };

  const removeTrack = (id) => setTracks(t => t.filter(tr => tr.id !== id));

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: initialPlaylist?.id || Date.now(), name, bpm, intensity, genre, tracks, directive });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.92)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#0f172a] overflow-hidden"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#00d4aa] uppercase">Theatre Director</p>
            <h2 className="text-base font-bold text-[#f1f5f9] mt-0.5">
              {initialPlaylist ? 'Edit Playlist' : 'New Playlist'}
            </h2>
          </div>
          <button onClick={onCancel} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">Playlist Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Late Night Session"
              className="mt-1 w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#00d4aa]/50"
            />
          </div>

          {/* BPM */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">BPM</label>
              <span className="text-sm font-bold text-[#00d4aa]">{bpm}</span>
            </div>
            <input
              type="range" min={60} max={200} value={bpm}
              onChange={e => setBpm(+e.target.value)}
              className="w-full" style={{ accentColor: '#00d4aa' }}
            />
            <div className="flex justify-between text-[9px] text-[#334155] mt-0.5">
              <span>60 — Slow</span><span>130 — Dance</span><span>200 — Rave</span>
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-2 block">Intensity</label>
            <div className="flex gap-2">
              {INTENSITIES.map(iv => (
                <button
                  key={iv}
                  onClick={() => setIntensity(iv)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold border capitalize transition-all"
                  style={{
                    background: intensity === iv ? '#00d4aa20' : 'transparent',
                    borderColor: intensity === iv ? '#00d4aa' : '#1e293b',
                    color: intensity === iv ? '#00d4aa' : '#475569',
                  }}
                >{iv}</button>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div>
            <label className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-2 block">Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize transition-all"
                  style={{
                    background: genre === g ? '#a78bfa20' : 'transparent',
                    borderColor: genre === g ? '#a78bfa' : '#1e293b',
                    color: genre === g ? '#a78bfa' : '#475569',
                  }}
                >{g}</button>
              ))}
            </div>
          </div>

          {/* Show preview */}
          <ShowPreview directive={directive} />

          {/* Track list */}
          <div>
            <label className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-2 block">Tracks (optional)</label>
            <div className="space-y-1 mb-2 max-h-28 overflow-y-auto">
              {tracks.map(tr => (
                <div key={tr.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#070b14] border border-[#1e293b]">
                  <span className="text-xs text-[#94a3b8] truncate">{tr.title}</span>
                  <button onClick={() => removeTrack(tr.id)} className="text-[#334155] hover:text-red-400 ml-2 flex-shrink-0 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {tracks.length === 0 && <p className="text-[10px] text-[#334155] italic px-1">No tracks yet — add them below or leave empty to use any track.</p>}
            </div>
            <div className="flex gap-2">
              <input
                value={newTrack}
                onChange={e => setNewTrack(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTrack()}
                placeholder="Track title..."
                className="flex-1 bg-[#070b14] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f5f9] placeholder-[#334155] focus:outline-none"
              />
              <button onClick={addTrack} className="px-2.5 py-1.5 rounded-lg bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-[#1e293b]">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-[#1e293b] text-[#64748b] text-sm font-semibold hover:text-[#f1f5f9] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all"
            style={{ background: '#00d4aa', color: '#070b14' }}
          >
            <Check size={14} /> Save Playlist
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}