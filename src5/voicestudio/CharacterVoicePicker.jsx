import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, Lock, Shuffle } from 'lucide-react';

const ARCHETYPE_COLORS = {
  Guide: '#00d4aa',
  Creator: '#a78bfa',
  Oracle: '#60a5fa',
  Challenger: '#fb7185',
  Guardian: '#f59e0b',
  Catalyst: '#f97316',
};

export default function CharacterVoicePicker({ selected, onSelect }) {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BotPersona.filter({ status: 'active' }, 'name', 50)
      .then(setPersonas)
      .finally(() => setLoading(false));
  }, []);

  const pickRandom = () => {
    if (!personas.length) return;
    const r = personas[Math.floor(Math.random() * personas.length)];
    onSelect(r);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="w-5 h-5 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Select Character</p>
        <button
          onClick={pickRandom}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border border-[#1e293b] text-[#00d4aa] hover:bg-[#00d4aa]/10 transition-colors"
        >
          <Shuffle size={10} /> Random
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
        {personas.map(p => {
          const color = ARCHETYPE_COLORS[p.archetype] || '#64748b';
          const isSelected = selected?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex items-center gap-2 p-2 rounded-xl border text-left transition-all"
              style={{
                borderColor: isSelected ? color : '#1e293b',
                background: isSelected ? `${color}12` : '#0a0f1e',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                style={{ background: `${color}20`, color }}
              >
                {p.name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#f1f5f9] truncate">{p.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px]" style={{ color }}>{p.archetype}</span>
                  {p.voice_locked && <Lock size={8} style={{ color }} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: ARCHETYPE_COLORS[selected.archetype] || '#1e293b', background: '#070b14' }}
        >
          <div className="flex items-center gap-2">
            <Mic size={14} style={{ color: ARCHETYPE_COLORS[selected.archetype] || '#00d4aa' }} />
            <div>
              <p className="text-xs font-bold text-[#f1f5f9]">{selected.name}</p>
              <p className="text-[10px] text-[#475569]">
                Voice: {selected.locked_voice_id || selected.archetype || 'Auto-assigned'}
                {selected.voice_locked && ' 🔒'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}