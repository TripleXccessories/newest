import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, RefreshCw, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

// Production-ready flags stored locally in browser (per-character)
const STORAGE_KEY = 'iint_asset_flags';

function loadFlags() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveFlags(flags) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}

const FLAG_DEFS = [
  { key: 'render_3d',    label: '3D Render',      color: '#a78bfa', icon: '🎨' },
  { key: 'voice',        label: 'Voice',           color: '#00d4aa', icon: '🎙️' },
  { key: 'bg_image',     label: 'BG Image',        color: '#f59e0b', icon: '🖼️' },
  { key: 'environment',  label: 'Environment',     color: '#4ade80', icon: '🌿' },
  { key: 'personality',  label: 'Personality Lock', color: '#fb7185', icon: '🔒' },
];

function FlagCell({ value, onChange, color, label, icon }) {
  const states = ['none', 'wip', 'done'];
  const next = () => onChange(states[(states.indexOf(value || 'none') + 1) % states.length]);
  const cfg = {
    none:  { icon: <Circle size={14} className="text-[#334155]" />, bg: '#1e293b', label: '—' },
    wip:   { icon: <AlertCircle size={14} style={{ color: '#fbbf24' }} />, bg: '#fbbf2415', label: 'WIP' },
    done:  { icon: <CheckCircle2 size={14} style={{ color }} />, bg: `${color}15`, label: '✓' },
  };
  const s = cfg[value || 'none'];
  return (
    <button onClick={next}
      className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all hover:opacity-80"
      style={{ background: s.bg, minWidth: 52 }}
      title={`${icon} ${label}: ${value || 'none'} → click to advance`}>
      {s.icon}
      <span className="text-[8px] font-bold" style={{ color: value === 'done' ? color : value === 'wip' ? '#fbbf24' : '#334155' }}>
        {s.label}
      </span>
    </button>
  );
}

function ReadinessBar({ persona, flags }) {
  const f = flags[persona.id] || {};
  const done = FLAG_DEFS.filter(d => f[d.key] === 'done').length;
  const pct = Math.round((done / FLAG_DEFS.length) * 100);
  const color = pct === 100 ? '#00d4aa' : pct >= 60 ? '#fbbf24' : '#fb7185';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[9px] font-bold w-7 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function AssetDashboard() {
  const [personas, setPersonas] = useState([]);
  const [flags, setFlags] = useState(loadFlags());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | done | wip | pending
  const [sortBy, setSortBy] = useState('name'); // name | readiness

  useEffect(() => {
    base44.entities.BotPersona.list('name', 50)
      .then(setPersonas)
      .finally(() => setLoading(false));
  }, []);

  const setFlag = (personaId, flagKey, value) => {
    setFlags(prev => {
      const next = { ...prev, [personaId]: { ...(prev[personaId] || {}), [flagKey]: value } };
      saveFlags(next);
      return next;
    });
  };

  const getReadinessPct = (personaId) => {
    const f = flags[personaId] || {};
    return Math.round((FLAG_DEFS.filter(d => f[d.key] === 'done').length / FLAG_DEFS.length) * 100);
  };

  const filteredPersonas = personas
    .filter(p => {
      const pct = getReadinessPct(p.id);
      if (filter === 'done') return pct === 100;
      if (filter === 'wip') return pct > 0 && pct < 100;
      if (filter === 'pending') return pct === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'readiness') return getReadinessPct(b.id) - getReadinessPct(a.id);
      return a.name.localeCompare(b.name);
    });

  // Summary stats
  const total = personas.length;
  const allDone = personas.filter(p => getReadinessPct(p.id) === 100).length;
  const inProgress = personas.filter(p => { const pct = getReadinessPct(p.id); return pct > 0 && pct < 100; }).length;
  const notStarted = personas.filter(p => getReadinessPct(p.id) === 0).length;
  const overallPct = total > 0 ? Math.round((personas.reduce((s, p) => s + getReadinessPct(p.id), 0) / (total * 100)) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#f1f5f9]">Asset Production Dashboard</h1>
          <p className="text-xs text-[#475569]">Track 3D render · voice · background image · environment · personality status for all 18 faculty</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { const f = loadFlags(); setFlags({ ...f }); }}
            className="flex items-center gap-1 text-xs text-[#475569] hover:text-[#94a3b8] px-2 py-1.5 rounded-lg border border-[#1e293b]">
            <RefreshCw size={11} /> Refresh
          </button>
          <Link to="/character-profiles"
            className="text-xs text-[#00d4aa] hover:underline px-2 py-1.5 rounded-lg border border-[#00d4aa]/20 bg-[#00d4aa]/05">
            Character Profiles →
          </Link>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Overall Ready', value: `${overallPct}%`, color: overallPct === 100 ? '#00d4aa' : '#fbbf24', sub: `${total} characters total` },
          { label: 'Production Ready', value: allDone, color: '#00d4aa', sub: 'all 5 flags done' },
          { label: 'In Progress', value: inProgress, color: '#fbbf24', sub: 'partially complete' },
          { label: 'Not Started', value: notStarted, color: '#fb7185', sub: 'no flags set yet' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4">
            <p className="text-[9px] uppercase tracking-widest text-[#475569] mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] text-[#334155] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter + sort */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[9px] text-[#475569] uppercase tracking-widest flex items-center gap-1"><Filter size={9} /> Filter:</span>
        {['all', 'done', 'wip', 'pending'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="text-xs px-3 py-1 rounded-xl font-semibold transition-all"
            style={{ background: filter === f ? '#00d4aa20' : '#1e293b', color: filter === f ? '#00d4aa' : '#64748b', border: filter === f ? '1px solid #00d4aa40' : '1px solid transparent' }}>
            {f === 'all' ? 'All' : f === 'done' ? '✓ Done' : f === 'wip' ? '⚡ WIP' : '○ Pending'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] text-[#475569]">Sort:</span>
          <button onClick={() => setSortBy(s => s === 'name' ? 'readiness' : 'name')}
            className="text-[10px] px-2 py-1 rounded-lg bg-[#1e293b] text-[#64748b] flex items-center gap-1">
            {sortBy === 'name' ? 'A–Z' : '% Readiness'} <ChevronDown size={9} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {FLAG_DEFS.map(f => (
          <div key={f.key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: f.color }} />
            <span className="text-[9px] text-[#475569]">{f.icon} {f.label}</span>
          </div>
        ))}
        <span className="text-[9px] text-[#334155] ml-2">Click flags to cycle: — → WIP → Done</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1e293b] overflow-hidden">
          {/* Header */}
          <div className="grid bg-[#0a0f1e] border-b border-[#1e293b] px-4 py-2.5"
            style={{ gridTemplateColumns: '2fr 80px ' + FLAG_DEFS.map(() => '64px').join(' ') + ' 100px' }}>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#475569]">Character</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#475569]">Arch.</span>
            {FLAG_DEFS.map(f => (
              <span key={f.key} className="text-[9px] font-black uppercase tracking-widest text-center" style={{ color: f.color }}>{f.icon}</span>
            ))}
            <span className="text-[9px] font-black uppercase tracking-widest text-[#475569] text-center">Ready</span>
          </div>

          {filteredPersonas.map((persona, i) => {
            const pflags = flags[persona.id] || {};
            const pct = getReadinessPct(persona.id);
            const archetypeColor = { Guide:'#f59e0b', Oracle:'#7c3aed', Catalyst:'#2dd4bf', Creator:'#f97316', Guardian:'#4ade80', Challenger:'#fb7185' }[persona.archetype] || '#64748b';

            return (
              <motion.div key={persona.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="grid items-center px-4 py-2 border-b border-[#1e293b] hover:bg-[#0d1424] transition-colors"
                style={{ gridTemplateColumns: '2fr 80px ' + FLAG_DEFS.map(() => '64px').join(' ') + ' 100px' }}>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: `${archetypeColor}20`, color: archetypeColor }}>
                    {persona.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#f1f5f9] truncate">{persona.name}</p>
                    <p className="text-[9px] text-[#475569] truncate">{persona.role_title}</p>
                  </div>
                </div>

                <span className="text-[9px] font-semibold truncate" style={{ color: archetypeColor }}>
                  {persona.archetype}
                </span>

                {FLAG_DEFS.map(flagDef => (
                  <div key={flagDef.key} className="flex justify-center">
                    <FlagCell
                      value={pflags[flagDef.key]}
                      onChange={val => setFlag(persona.id, flagDef.key, val)}
                      color={flagDef.color}
                      label={flagDef.label}
                      icon={flagDef.icon}
                    />
                  </div>
                ))}

                <div className="pl-2">
                  <ReadinessBar persona={persona} flags={flags} />
                  {pct === 100 && (
                    <p className="text-[8px] font-black text-[#00d4aa] text-center mt-0.5">READY</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-[9px] text-[#1e293b] text-center">Flags are saved locally in your browser. Export CSV coming soon.</p>
    </div>
  );
}