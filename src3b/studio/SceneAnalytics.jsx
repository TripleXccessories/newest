import React, { useState, useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, MousePointerClick, GraduationCap, BarChart2, CalendarRange } from 'lucide-react';
import { subDays, format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

// ── Demo data generator ──
function generateDemoData(days = 30, seed = 1) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const base = (Math.sin(i * 0.4 + seed) + 1) * 0.5;
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'MMM d'),
      engagement: Math.round(20 + base * 65 + Math.random() * 10),
      ctr:         parseFloat((1.5 + base * 8.5 + Math.random() * 1.5).toFixed(2)),
      completion:  Math.round(30 + base * 55 + Math.random() * 12),
      views:       Math.round(100 + base * 900 + Math.random() * 200),
    };
  });
}

const ALL_DATA = generateDemoData(60, 2);

const RANGE_PRESETS = [
  { label: '7d',  days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '60d', days: 60 },
];

const CHART_COLORS = {
  engagement: '#00d4aa',
  ctr:        '#fbbf24',
  completion: '#a78bfa',
  views:      '#60a5fa',
};

function StatCard({ label, value, unit, color, icon: Icon, sub }) {
  return (
    <div className="bg-[#070b14] border border-[#1e293b] rounded-xl p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon size={11} style={{ color }} />
        <span className="text-[10px] text-[#475569]">{label}</span>
      </div>
      <p className="text-xl font-black" style={{ color }}>{value}<span className="text-xs font-normal text-[#475569] ml-0.5">{unit}</span></p>
      {sub && <p className="text-[9px] text-[#334155]">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-3 text-xs space-y-1 shadow-xl">
      <p className="text-[#64748b] font-mono text-[10px] mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#94a3b8]">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}{p.dataKey === 'ctr' ? '%' : p.dataKey !== 'views' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

export default function SceneAnalytics({ scenes = [] }) {
  const [rangeDays, setRangeDays] = useState(30);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]   = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState(['engagement', 'ctr', 'completion']);
  const [selectedScene, setSelectedScene] = useState('all');

  const filtered = useMemo(() => {
    let data = ALL_DATA;
    if (showCustom && customFrom && customTo) {
      const from = startOfDay(parseISO(customFrom));
      const to   = endOfDay(parseISO(customTo));
      data = data.filter(d => isWithinInterval(parseISO(d.date), { start: from, end: to }));
    } else {
      data = data.slice(-rangeDays);
    }
    return data;
  }, [rangeDays, customFrom, customTo, showCustom]);

  const avg = (key) => filtered.length ? Math.round(filtered.reduce((s, d) => s + d[key], 0) / filtered.length) : 0;
  const avgCtr = filtered.length ? (filtered.reduce((s, d) => s + d.ctr, 0) / filtered.length).toFixed(2) : '0.00';
  const totalViews = filtered.reduce((s, d) => s + d.views, 0);

  const toggleMetric = (m) => setActiveMetrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const publishedScenes = scenes.filter(s => s.status === 'published');

  return (
    <div className="space-y-4">

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Avg Engagement" value={avg('engagement')} unit="%" color="#00d4aa" icon={TrendingUp} sub="Across selected range" />
        <StatCard label="Avg CTR" value={avgCtr} unit="%" color="#fbbf24" icon={MousePointerClick} sub="Promotion click-through" />
        <StatCard label="Avg Completion" value={avg('completion')} unit="%" color="#a78bfa" icon={GraduationCap} sub="Academy lessons" />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} unit="" color="#60a5fa" icon={BarChart2} sub="Scene impressions" />
      </div>

      {/* Date range controls */}
      <div className="bg-[#070b14] border border-[#1e293b] rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarRange size={12} className="text-[#64748b]" />
          <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wide">Date Range</span>
          <div className="flex gap-1 ml-auto">
            {RANGE_PRESETS.map(p => (
              <button key={p.label} onClick={() => { setRangeDays(p.days); setShowCustom(false); }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                style={{ background: !showCustom && rangeDays === p.days ? '#00d4aa20' : '#1e293b', color: !showCustom && rangeDays === p.days ? '#00d4aa' : '#64748b' }}>
                {p.label}
              </button>
            ))}
            <button onClick={() => setShowCustom(s => !s)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
              style={{ background: showCustom ? '#fbbf2420' : '#1e293b', color: showCustom ? '#fbbf24' : '#64748b' }}>
              Custom
            </button>
          </div>
        </div>
        {showCustom && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[9px] text-[#475569]">From</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="w-full mt-0.5 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-2 py-1.5 outline-none border border-[#fbbf24]/30" />
            </div>
            <div className="flex-1">
              <label className="text-[9px] text-[#475569]">To</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="w-full mt-0.5 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-2 py-1.5 outline-none border border-[#fbbf24]/30" />
            </div>
          </div>
        )}
      </div>

      {/* Scene filter */}
      {publishedScenes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[#475569]">Scene:</span>
          <button onClick={() => setSelectedScene('all')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
            style={{ background: selectedScene === 'all' ? '#00d4aa20' : '#1e293b', color: selectedScene === 'all' ? '#00d4aa' : '#64748b' }}>
            All
          </button>
          {publishedScenes.map(s => (
            <button key={s.id} onClick={() => setSelectedScene(s.id)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors truncate max-w-[120px]"
              style={{ background: selectedScene === s.id ? '#00d4aa20' : '#1e293b', color: selectedScene === s.id ? '#00d4aa' : '#64748b' }}>
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Metric toggles */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(CHART_COLORS).filter(([k]) => k !== 'views').map(([key, color]) => (
          <button key={key} onClick={() => toggleMetric(key)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all"
            style={{ borderColor: activeMetrics.includes(key) ? color : '#1e293b', color: activeMetrics.includes(key) ? color : '#475569', background: activeMetrics.includes(key) ? `${color}10` : 'transparent' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: activeMetrics.includes(key) ? color : '#334155' }} />
            {key === 'ctr' ? 'CTR' : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Engagement Rate ── */}
      {activeMetrics.includes('engagement') && (
        <div className="bg-[#070b14] border border-[#1e293b] rounded-xl p-4">
          <p className="text-[11px] font-bold text-[#00d4aa] mb-3 flex items-center gap-1.5"><TrendingUp size={11} /> Engagement Rate</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={filtered} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#00d4aa" strokeWidth={2} fill="url(#engGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Click-Through Rate ── */}
      {activeMetrics.includes('ctr') && (
        <div className="bg-[#070b14] border border-[#1e293b] rounded-xl p-4">
          <p className="text-[11px] font-bold text-[#fbbf24] mb-3 flex items-center gap-1.5"><MousePointerClick size={11} /> Click-Through Rate (Promotions)</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={filtered} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ctr" name="CTR" stroke="#fbbf24" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#fbbf24' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Completion Rate ── */}
      {activeMetrics.includes('completion') && (
        <div className="bg-[#070b14] border border-[#1e293b] rounded-xl p-4">
          <p className="text-[11px] font-bold text-[#a78bfa] mb-3 flex items-center gap-1.5"><GraduationCap size={11} /> Completion Rate (Academy Lessons)</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={filtered} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={filtered.length > 20 ? 4 : 8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completion" name="Completion" fill="#a78bfa" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-[9px] text-[#1e293b] text-center">Analytics data is illustrative. Connect your publish pipeline to stream real event data.</p>
    </div>
  );
}