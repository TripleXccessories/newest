import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SCHOOL_COLORS = {
  'Foundations': '#00d4aa',
  'Making': '#a78bfa',
  'Analysis': '#60a5fa',
  'Critical Inquiry': '#f59e0b',
  'Stewardship': '#fb7185',
  'Transformation': '#f97316',
};

export default function SchoolDistributionBar({ personas = [] }) {
  const counts = {};
  personas.forEach(p => { counts[p.school] = (counts[p.school] || 0) + 1; });
  const data = Object.entries(counts).map(([name, count]) => ({ name: name.split(' ')[0], full: name, count }));

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 space-y-3">
      <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Faculty by School</p>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#334155', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: '#1e293b' }}
              contentStyle={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
              formatter={(v, n, p) => [v + ' faculty', p.payload.full]}
              labelFormatter={() => ''}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.full} fill={SCHOOL_COLORS[entry.full] || '#334155'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}