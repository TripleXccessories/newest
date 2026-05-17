import React from 'react';

const PRESET_COLORS = ['#ffffff', '#fbbf24', '#00d4aa', '#60a5fa', '#a78bfa', '#fb7185', '#f97316', '#34d399'];
const HATS = [
  { value: null, label: 'None' },
  { value: 'graduation', label: '🎓 Graduation' },
  { value: 'party', label: '🎉 Party' },
];

export default function CharacterColorPanel({ color, onColorChange, hat, onHatChange, soundWaves, onSoundWavesChange }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">Bulb Color</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_COLORS.map(c => (
            <button key={c} onClick={() => onColorChange(c)}
              className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
              style={{ background: c, borderColor: color === c ? '#f1f5f9' : 'transparent' }} />
          ))}
        </div>
        <input type="color" value={color} onChange={e => onColorChange(e.target.value)}
          className="w-full h-8 rounded-lg cursor-pointer border border-[#1e293b] bg-[#0a0f1e]" />
        <p className="text-[9px] text-[#334155] mt-1 font-mono">{color}</p>
      </div>

      <div>
        <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">Hat</p>
        <div className="flex gap-2">
          {HATS.map(h => (
            <button key={String(h.value)} onClick={() => onHatChange(h.value)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all"
              style={{ borderColor: hat === h.value ? '#00d4aa' : '#1e293b', background: hat === h.value ? '#00d4aa20' : '#0a0f1e', color: hat === h.value ? '#00d4aa' : '#475569' }}>
              {h.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#0a0f1e] cursor-pointer border border-[#1e293b]">
          <div>
            <span className="text-xs text-[#94a3b8] font-bold">Sound Waves</span>
            <p className="text-[9px] text-[#334155]">Listening vibration animation</p>
          </div>
          <button onClick={() => onSoundWavesChange(v => !v)}
            className="w-10 h-5 rounded-full transition-all relative"
            style={{ background: soundWaves ? '#00d4aa' : '#1e293b' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: soundWaves ? '22px' : '2px' }} />
          </button>
        </label>
      </div>
    </div>
  );
}