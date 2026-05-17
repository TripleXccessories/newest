import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, RotateCcw, GitCompare, Clock, ChevronDown, ChevronRight, Save } from 'lucide-react';

const HISTORY_KEY = (sceneId) => `scene_history_${sceneId}`;
const MAX_HISTORY = 30;

// Serialize a snapshot label from the saved data
function snapshotLabel(snap) {
  const parts = [];
  if (snap.script_events?.length) parts.push(`${snap.script_events.length} events`);
  if (snap.beat_track?.bpm) parts.push(`${snap.beat_track.bpm} BPM`);
  if (snap.status) parts.push(snap.status);
  return parts.join(' · ') || 'Snapshot';
}

function diffSummary(a, b) {
  const changes = [];
  if (a.title !== b.title) changes.push({ field: 'Title', from: a.title, to: b.title });
  if (a.status !== b.status) changes.push({ field: 'Status', from: a.status, to: b.status });
  if (JSON.stringify(a.script_events) !== JSON.stringify(b.script_events))
    changes.push({ field: 'Script Events', from: `${(a.script_events||[]).length} events`, to: `${(b.script_events||[]).length} events` });
  if (JSON.stringify(a.beat_track) !== JSON.stringify(b.beat_track))
    changes.push({ field: 'Beat Track', from: a.beat_track?.bpm ? `${a.beat_track.bpm} BPM` : 'none', to: b.beat_track?.bpm ? `${b.beat_track.bpm} BPM` : 'none' });
  if (JSON.stringify(a.tags) !== JSON.stringify(b.tags))
    changes.push({ field: 'Tags', from: (a.tags||[]).join(', '), to: (b.tags||[]).join(', ') });
  if (JSON.stringify(a.characters) !== JSON.stringify(b.characters))
    changes.push({ field: 'Characters', from: (a.characters||[]).join(', '), to: (b.characters||[]).join(', ') });
  return changes;
}

export function pushHistory(sceneId, snapshot) {
  try {
    const key = HISTORY_KEY(sceneId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const entry = { ...snapshot, _saved_at: new Date().toISOString(), _id: Date.now() };
    const updated = [entry, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (_) {}
}

export default function SceneHistory({ scene, beatPattern, onRestore }) {
  const [history, setHistory] = useState([]);
  const [compareIdx, setCompareIdx] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [restoring, setRestoring] = useState(null);

  const load = useCallback(() => {
    if (!scene?.id) return;
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY(scene.id)) || '[]');
      setHistory(stored);
    } catch (_) { setHistory([]); }
  }, [scene?.id]);

  useEffect(() => { load(); }, [load]);

  const handleManualSave = () => {
    if (!scene) return;
    const snap = { ...scene, beat_track: beatPattern || scene.beat_track };
    pushHistory(scene.id, snap);
    load();
  };

  const handleRestore = async (snap) => {
    setRestoring(snap._id);
    // Push current state before restoring (safety backup)
    pushHistory(scene.id, { ...scene, beat_track: beatPattern || scene.beat_track });
    await onRestore(snap);
    setRestoring(null);
    load();
  };

  const currentForCompare = { ...scene, beat_track: beatPattern || scene.beat_track };

  if (!scene) return (
    <div className="text-center py-8 text-[#475569] text-xs">Select a scene to view its history.</div>
  );

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={13} className="text-[#a78bfa]" />
          <span className="text-xs font-bold text-[#f1f5f9]">Version History</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#64748b]">{history.length}</span>
        </div>
        <button onClick={handleManualSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30 hover:bg-[#a78bfa]/25 transition-colors">
          <Save size={10} /> Save Snapshot
        </button>
      </div>

      {/* Compare banner */}
      <AnimatePresence>
        {compareIdx !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-[#a78bfa]/08 border border-[#a78bfa]/30 rounded-xl p-3 space-y-2 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#a78bfa] flex items-center gap-1.5">
                <GitCompare size={11} /> Comparing with v{history.length - compareIdx}
              </span>
              <button onClick={() => setCompareIdx(null)} className="text-[10px] text-[#475569] hover:text-[#f1f5f9]">✕ Close</button>
            </div>
            {(() => {
              const diffs = diffSummary(history[compareIdx], currentForCompare);
              if (diffs.length === 0) return <p className="text-[10px] text-[#475569]">No differences found.</p>;
              return (
                <div className="space-y-1.5">
                  {diffs.map((d, i) => (
                    <div key={i} className="text-[10px] grid grid-cols-3 gap-2">
                      <span className="text-[#64748b] font-bold">{d.field}</span>
                      <span className="text-[#ef4444] truncate bg-[#ef4444]/08 rounded px-1.5 py-0.5">{d.from || '—'}</span>
                      <span className="text-[#00d4aa] truncate bg-[#00d4aa]/08 rounded px-1.5 py-0.5">{d.to || '—'}</span>
                    </div>
                  ))}
                  <div className="flex gap-1 text-[9px] text-[#334155] pt-1">
                    <span className="text-[#ef4444]">■</span> Past &nbsp;
                    <span className="text-[#00d4aa]">■</span> Current
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {history.length === 0 && (
        <p className="text-[10px] text-[#334155] text-center py-6">
          No snapshots yet. Saves are captured automatically when you save & dispatch, or manually above.
        </p>
      )}

      {/* History entries */}
      <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
        {history.map((snap, idx) => {
          const isExpanded = expandedIdx === idx;
          const isComparing = compareIdx === idx;
          const versionNum = history.length - idx;
          return (
            <div key={snap._id}
              className="rounded-xl border overflow-hidden transition-all"
              style={{ borderColor: isComparing ? '#a78bfa50' : '#1e293b' }}>
              <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-white/[0.02]"
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                <div className="w-5 h-5 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-black text-[#64748b]">v{versionNum}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#94a3b8] truncate">{snapshotLabel(snap)}</p>
                  <p className="text-[9px] text-[#334155] flex items-center gap-1 mt-0.5">
                    <Clock size={8} />
                    {new Date(snap._saved_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={e => { e.stopPropagation(); setCompareIdx(isComparing ? null : idx); }}
                    className="px-2 py-1 rounded text-[9px] font-bold border transition-colors"
                    style={{ borderColor: isComparing ? '#a78bfa' : '#1e293b', color: isComparing ? '#a78bfa' : '#475569' }}>
                    <GitCompare size={9} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleRestore(snap); }}
                    disabled={restoring === snap._id}
                    className="px-2 py-1 rounded text-[9px] font-bold border border-[#1e293b] text-[#475569] hover:border-[#00d4aa] hover:text-[#00d4aa] transition-colors disabled:opacity-40">
                    {restoring === snap._id ? '...' : <RotateCcw size={9} />}
                  </button>
                  {isExpanded ? <ChevronDown size={11} className="text-[#475569]" /> : <ChevronRight size={11} className="text-[#475569]" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-[#1e293b]">
                    <div className="px-3 py-2 space-y-1 bg-[#060a12]">
                      {[
                        ['Title', snap.title],
                        ['Status', snap.status],
                        ['Type', snap.scene_type],
                        ['Characters', (snap.characters||[]).join(', ')],
                        ['Tags', (snap.tags||[]).join(', ')],
                        ['Beat BPM', snap.beat_track?.bpm],
                        ['Script Events', snap.script_events?.length],
                      ].map(([label, val]) => val != null && val !== '' && (
                        <div key={label} className="flex gap-3 text-[10px]">
                          <span className="text-[#334155] w-24 shrink-0">{label}</span>
                          <span className="text-[#64748b] truncate">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}