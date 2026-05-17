import React from 'react';
import { Trophy, Star, CheckCircle2, AlertCircle, Monitor, Zap, Bug, Eye, Music, Flame, HelpCircle, Egg, ScrollText, ThumbsUp, Lightbulb } from 'lucide-react';
import { deviceLabel, browserLabel } from '@/lib/deviceDetect';

const FINDING_TYPE_LABELS = {
  bug: '🐛 Bug', visual_glitch: '👁️ Visual Glitch', performance_issue: '⚡ Performance',
  audio_issue: '🔊 Audio', crash: '💥 Crash', unexpected_behavior: '🤔 Unexpected',
  easter_egg_hint: '🥚 Easter Egg', script_prompt: '📜 Script Prompt',
  passed_no_issues: '✅ Passed', feature_suggestion: '💡 Suggestion',
};

export default function ScopeTesterStats({ user, findings }) {
  const totalScore = findings.reduce((s, f) => s + (f.contribution_score || 1), 0);
  const completedFindings = findings.filter(f => f.is_completed);
  const avgImportance = findings.length
    ? (findings.reduce((s, f) => s + (f.importance_rating || 0), 0) / findings.length).toFixed(1)
    : 0;

  const typeBreakdown = findings.reduce((acc, f) => {
    acc[f.finding_type] = (acc[f.finding_type] || 0) + 1;
    return acc;
  }, {});

  const StatIcon = ({ color, icon: Icon }) => <Icon size={16} className="mx-auto mb-1" style={{ color }} />;

  const deviceBreakdown = findings.reduce((acc, f) => {
    const key = `${deviceLabel(f.device_type)} · ${browserLabel(f.browser)}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Score cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Score', value: totalScore, icon: Star, color: '#f59e0b' },
          { label: 'Findings', value: findings.length, icon: AlertCircle, color: '#a78bfa' },
          { label: 'Resolved', value: completedFindings.length, icon: CheckCircle2, color: '#00d4aa' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3 text-center">
            <StatIcon icon={Icon} color={color} />
            <p className="text-xl font-black" style={{ color }}>{value}</p>
            <p className="text-[10px] text-[#475569] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Avg importance */}
      <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3 flex items-center justify-between">
        <p className="text-xs text-[#64748b]">Avg Importance Rating</p>
        <p className="text-sm font-bold text-[#f59e0b]">{avgImportance} / 10</p>
      </div>

      {/* Finding types */}
      {Object.keys(typeBreakdown).length > 0 && (
        <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-3">Finding Breakdown</p>
          <div className="space-y-2">
            {Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-[#94a3b8]">{FINDING_TYPE_LABELS[type] || type}</span>
                <span className="text-xs font-bold text-[#f1f5f9]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device coverage */}
      {Object.keys(deviceBreakdown).length > 0 && (
        <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-3 flex items-center gap-1">
            <Monitor size={10} /> Device Coverage
          </p>
          <div className="space-y-2">
            {Object.entries(deviceBreakdown).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-[#94a3b8]">{key}</span>
                <span className="text-xs font-bold text-[#f1f5f9]">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {findings.length === 0 && (
        <div className="text-center py-8 text-[#334155]">
          <Trophy size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No findings yet — pick a scope and get started!</p>
        </div>
      )}
    </div>
  );
}