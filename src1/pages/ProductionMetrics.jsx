import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2, RefreshCw, AlertTriangle, CheckCircle, Film, Music, Mic, Image, BarChart2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#00d4aa', '#f59e0b', '#a78bfa', '#fb7185', '#60a5fa'];

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="rounded-2xl border p-5 space-y-3"
      style={{ borderColor: `${color}25`, background: `linear-gradient(145deg, ${color}08, #070b14)` }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">{label}</p>
        <Icon size={14} style={{ color }} />
      </div>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-[#475569]">{sub}</p>}
    </div>
  );
}

function PendingRow({ item, type }) {
  const icons = { scene: Film, audio: Music, voice: Mic, image: Image };
  const Icon = icons[type] || AlertTriangle;
  const colors = { scene: '#f59e0b', audio: '#a78bfa', voice: '#00d4aa', image: '#fb7185' };
  const color = colors[type] || '#f59e0b';
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1e293b] bg-[#070b14]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#f1f5f9] truncate">{item.name}</p>
        <p className="text-[10px] text-[#475569]">{item.reason}</p>
      </div>
      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0"
        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
        {item.priority}
      </span>
    </div>
  );
}

export default function ProductionMetrics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [scenes, personas, audioAssets, fxPlugins, audioClips] = await Promise.all([
        base44.entities.SceneScript.list('-created_date', 100),
        base44.entities.BotPersona.list(),
        base44.entities.AudioAsset.list('-created_date', 100),
        base44.entities.FXPlugin.list(),
        base44.entities.AudioClip.list('-created_date', 50),
      ]);

      // Scene stats
      const totalScenes = scenes.length;
      const draftScenes = scenes.filter(s => s.status === 'draft').length;
      const readyScenes = scenes.filter(s => s.status === 'ready').length;
      const publishedScenes = scenes.filter(s => s.status === 'published').length;

      // Compute cost estimate (scenes × $0.04 per DALL-E frame, audio clips × $0.003 per char)
      const totalChars = audioClips.reduce((sum, c) => sum + (c.text_content?.length || 0), 0);
      const dalleFrames = scenes.reduce((sum, s) => sum + (s.script_events?.filter(e => e.action === 'render')?.length || 1), 0);
      const estimatedCost = (dalleFrames * 0.04 + totalChars * 0.000015).toFixed(2);

      // Persona asset readiness
      const readyPersonas = personas.filter(p => p.locked_voice_id && p.status === 'active').length;
      const pendingPersonas = personas.filter(p => !p.locked_voice_id).length;

      // Scene status breakdown for chart
      const sceneBreakdown = [
        { name: 'Draft', value: draftScenes },
        { name: 'Ready', value: readyScenes },
        { name: 'Published', value: publishedScenes },
      ].filter(d => d.value > 0);

      // FX plugins per type
      const fxByType = fxPlugins.reduce((acc, p) => {
        acc[p.plugin_type] = (acc[p.plugin_type] || 0) + 1;
        return acc;
      }, {});
      const fxChartData = Object.entries(fxByType).map(([name, count]) => ({ name, count }));

      // Pending assets list
      const pending = [];
      personas.filter(p => !p.locked_voice_id).slice(0, 5).forEach(p => {
        pending.push({ name: p.name, reason: 'No voice cloned yet', priority: 'HIGH', type: 'voice' });
      });
      personas.filter(p => p.status === 'draft').slice(0, 3).forEach(p => {
        pending.push({ name: p.name, reason: 'Character still in draft', priority: 'MED', type: 'scene' });
      });
      scenes.filter(s => s.status === 'draft').slice(0, 3).forEach(s => {
        pending.push({ name: s.title, reason: 'Scene not marked ready', priority: 'MED', type: 'scene' });
      });
      audioAssets.filter(a => !a.file_url).slice(0, 2).forEach(a => {
        pending.push({ name: a.name, reason: 'Missing audio file URL', priority: 'LOW', type: 'audio' });
      });

      // Weekly scene generation (last 7 days)
      const now = Date.now();
      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(now - (6 - i) * 86400000);
        const label = day.toLocaleDateString('en', { weekday: 'short' });
        const count = scenes.filter(s => {
          const d = new Date(s.created_date);
          return d.toDateString() === day.toDateString();
        }).length;
        return { name: label, count };
      });

      setMetrics({
        totalScenes, draftScenes, readyScenes, publishedScenes,
        totalPersonas: personas.length, readyPersonas, pendingPersonas,
        totalAudioAssets: audioAssets.length,
        totalFXPlugins: fxPlugins.length,
        totalAudioClips: audioClips.length,
        estimatedCost,
        dalleFrames,
        sceneBreakdown,
        fxChartData,
        weeklyData,
        pending,
      });
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMetrics(); }, []);

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#a78bfa]/20 px-6 py-3 flex items-center gap-3 bg-[#030508]/95 backdrop-blur-sm sticky top-0 z-20">
        <Link to="/mission-control" className="w-7 h-7 rounded-lg bg-[#110d1f] border border-[#a78bfa]/30 flex items-center justify-center">
          <ChevronLeft size={13} className="text-[#a78bfa]" />
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[#a78bfa] uppercase tracking-[0.3em]">IINT // PRODUCTION METRICS</p>
          <p className="text-[8px] text-[#475569] font-mono">Scenes · Compute · Pending Assets · FX Library</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {lastRefresh && <span className="text-[8px] font-mono text-[#334155]">Updated {lastRefresh.toLocaleTimeString()}</span>}
          <button onClick={fetchMetrics} disabled={loading}
            className="w-7 h-7 rounded-lg bg-[#110d1f] border border-[#a78bfa]/30 flex items-center justify-center hover:border-[#a78bfa]/60 transition-colors">
            <RefreshCw size={12} className={`text-[#a78bfa] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !metrics ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="text-[#a78bfa] animate-spin" />
        </div>
      ) : metrics && (
        <div className="max-w-5xl mx-auto p-6 space-y-6">

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Scenes" value={metrics.totalScenes} sub={`${metrics.publishedScenes} published`} color="#00d4aa" icon={Film} />
            <StatCard label="Est. Compute" value={`$${metrics.estimatedCost}`} sub={`${metrics.dalleFrames} DALL-E frames`} color="#f59e0b" icon={Zap} />
            <StatCard label="Characters" value={metrics.totalPersonas} sub={`${metrics.readyPersonas} voice-ready`} color="#a78bfa" icon={Mic} />
            <StatCard label="FX Plugins" value={metrics.totalFXPlugins} sub={`${metrics.totalAudioAssets} audio assets`} color="#fb7185" icon={Music} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Weekly scene generation */}
            <div className="rounded-2xl border border-[#1e293b] bg-[#070b14] p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">Scenes Generated — Last 7 Days</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={metrics.weeklyData}>
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scene status pie */}
            <div className="rounded-2xl border border-[#1e293b] bg-[#070b14] p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">Scene Status Breakdown</p>
              {metrics.sceneBreakdown.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={metrics.sceneBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                        {metrics.sceneBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {metrics.sceneBreakdown.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-[11px] text-[#94a3b8]">{d.name}</span>
                        <span className="text-[11px] font-bold text-[#f1f5f9] ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-xs text-[#334155] font-mono">No scenes yet</p>
                </div>
              )}
            </div>

            {/* FX by type bar */}
            <div className="rounded-2xl border border-[#1e293b] bg-[#070b14] p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">FX Library — Plugins by Type</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={metrics.fxChartData} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Character readiness */}
            <div className="rounded-2xl border border-[#1e293b] bg-[#070b14] p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">Character Readiness</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Voice Cloned', value: metrics.readyPersonas, total: metrics.totalPersonas, color: '#00d4aa' },
                  { label: 'Awaiting Voice', value: metrics.pendingPersonas, total: metrics.totalPersonas, color: '#f59e0b' },
                  { label: 'Audio Clips', value: metrics.totalAudioClips, total: metrics.totalAudioClips, color: '#a78bfa' },
                ].map(row => (
                  <div key={row.label} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[#64748b]">{row.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: row.color }}>{row.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: row.total ? `${Math.min(100, (row.value / row.total) * 100)}%` : '0%', background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending assets */}
          <div className="rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/04 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-[#f59e0b]" />
              <p className="text-[10px] font-mono text-[#f59e0b] uppercase tracking-widest">
                Pending Assets — {metrics.pending.length} items need attention
              </p>
            </div>
            {metrics.pending.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20">
                <CheckCircle size={14} className="text-[#00d4aa]" />
                <p className="text-xs text-[#00d4aa] font-bold">All assets complete — ready for final export!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {metrics.pending.map((item, i) => (
                  <PendingRow key={i} item={item} type={item.type} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}