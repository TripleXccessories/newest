import React from 'react';

const MOODS = [
  { value: 'idle', label: '😐 Idle' },
  { value: 'happy', label: '😊 Happy' },
  { value: 'excited', label: '🤩 Excited' },
  { value: 'wink', label: '😉 Wink' },
  { value: 'thinking', label: '🤔 Thinking' },
  { value: 'surprised', label: '😲 Surprised' },
  { value: 'aha', label: '💡 Aha!' },
  { value: 'coding', label: '💻 Coding' },
];

const GLOVES = [
  { value: 'down', label: '⬇️ Down' },
  { value: 'wave', label: '👋 Wave' },
  { value: 'point_up', label: '☝️ Point Up' },
  { value: 'point_right', label: '👉 Point Right' },
  { value: 'cup', label: '🤲 Cup' },
  { value: 'temple', label: '🤫 Temple' },
];

export default function CharacterMoodPanel({ mood, onMoodChange, gloveLeft, gloveRight, onGloveLChange, onGloveRChange }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">Mood Expression</p>
        <div className="grid grid-cols-2 gap-1.5">
          {MOODS.map(m => (
            <button key={m.value} onClick={() => onMoodChange(m.value)}
              className="py-2 px-2 rounded-xl text-[10px] font-bold border transition-all text-left"
              style={{ borderColor: mood === m.value ? '#00d4aa' : '#1e293b', background: mood === m.value ? '#00d4aa20' : '#0a0f1e', color: mood === m.value ? '#00d4aa' : '#64748b' }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">Left Glove</p>
        <div className="grid grid-cols-2 gap-1.5">
          {GLOVES.map(g => (
            <button key={g.value} onClick={() => onGloveLChange(g.value)}
              className="py-1.5 px-2 rounded-lg text-[9px] font-bold border transition-all"
              style={{ borderColor: gloveLeft === g.value ? '#60a5fa' : '#1e293b', background: gloveLeft === g.value ? '#60a5fa20' : '#0a0f1e', color: gloveLeft === g.value ? '#60a5fa' : '#475569' }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">Right Glove</p>
        <div className="grid grid-cols-2 gap-1.5">
          {GLOVES.map(g => (
            <button key={g.value} onClick={() => onGloveRChange(g.value)}
              className="py-1.5 px-2 rounded-lg text-[9px] font-bold border transition-all"
              style={{ borderColor: gloveRight === g.value ? '#a78bfa' : '#1e293b', background: gloveRight === g.value ? '#a78bfa20' : '#0a0f1e', color: gloveRight === g.value ? '#a78bfa' : '#475569' }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}