import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  Guide: '#00d4aa', Creator: '#a78bfa', Oracle: '#60a5fa',
  Challenger: '#fb7185', Guardian: '#f59e0b', Catalyst: '#f97316',
};

export default function ArchetypeDonut({ personas = [] }) {
  const counts = {};
  personas.forEach(p => { counts[p.archetype] = (counts[p.archetype] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-3">
      <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Archetype Distribution</p>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
              paddingAngle={3} dataKey="value" strokeWidth={0}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || '#475569'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend iconType="circle" iconSize={8}
              formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 10 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}