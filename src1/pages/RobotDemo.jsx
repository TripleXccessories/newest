import React, { useState } from 'react';
import RobotCreatorScene from '@/components/effects/RobotCreatorScene';

const CREATIONS = [
  { label: 'Strategy Blueprint', color: '#00d4aa', shape: 'cube'    },
  { label: 'Neural Chart',       color: '#a78bfa', shape: 'pyramid' },
  { label: 'Signal Matrix',      color: '#fbbf24', shape: 'diamond' },
  { label: 'Risk Shield',        color: '#3b82f6', shape: 'shield'  },
];

export default function RobotDemo() {
  const [key, setKey] = useState(0);
  const [selected, setSelected] = useState(0);

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-black text-[#f1f5f9] mb-1">Robot Creator</h1>
        <p className="text-xs text-[#475569]">Node-shooting programmer — magic chest extraction</p>
      </div>

      {/* Creation selector */}
      <div className="flex gap-3 flex-wrap justify-center">
        {CREATIONS.map((c, i) => (
          <button key={i}
            onClick={() => { setSelected(i); setKey(k => k + 1); }}
            className="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all hover:scale-105"
            style={{
              borderColor: selected === i ? c.color : '#1e293b',
              color: selected === i ? c.color : '#475569',
              background: selected === i ? `${c.color}15` : 'transparent',
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Scene */}
      <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-8">
        <RobotCreatorScene
          key={key}
          creation={CREATIONS[selected]}
          onComplete={() => setKey(k => k + 1)}
        />
      </div>

      <p className="text-xs text-[#334155]">Select a creation type above to restart with that theme</p>
    </div>
  );
}