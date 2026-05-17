import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RefreshCw, Monitor, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { deviceLabel, browserLabel } from '@/lib/deviceDetect';

const STATUS_COLORS = {
  submitted: '#f59e0b', acknowledged: '#60a5fa', in_progress: '#a78bfa',
  fixed: '#00d4aa', wont_fix: '#ef4444', duplicate: '#64748b', by_design: '#94a3b8',
};

const FINDING_TYPE_LABELS = {
  bug: '🐛 Bug', visual_glitch: '👁️ Visual Glitch', performance_issue: '⚡ Performance',
  audio_issue: '🔊 Audio', crash: '💥 Crash', unexpected_behavior: '🤔 Unexpected',
  easter_egg_hint: '🥚 Easter Egg', script_prompt: '📜 Script Prompt',
  passed_no_issues: '✅ Passed', feature_suggestion: '💡 Suggestion',
};

export default function AdminScopeFindingRow({ finding, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(finding.status);
  const [adminNotes, setAdminNotes] = useState(finding.admin_notes || '');
  const [importance, setImportance] = useState(finding.importance_rating || 0);
  const [autoSeed, setAutoSeed] = useState(finding.auto_seed_to_scope || false);
  const [saving, setSaving] = useState(false);

  const color = STATUS_COLORS[status] || '#64748b';

  const save = async (markComplete = false) => {
    setSaving(true);
    const updates = {
      status,
      admin_notes: adminNotes,
      importance_rating: importance,
      auto_seed_to_scope: autoSeed,
    };
    if (markComplete) updates.is_completed = true;
    await base44.entities.ScopeFinding.update(finding.id, updates);

    // Auto-seed: create a new scope from this finding
    if (autoSeed && markComplete && !finding.auto_seeded) {
      await base44.entities.Scope.create({
        title: `[Auto-Seeded] ${finding.title}`,
        description: `Auto-generated from tester finding:\n\n${finding.description}\n\nSteps: ${finding.steps_to_reproduce || 'N/A'}`,
        category: 'bug_hunt',
        priority: 'high',
        auto_seeded_from_finding_id: finding.id,
        status: 'active',
      });
    }

    setSaving(false);
    onUpdate?.();
  };

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#070b14] overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between p-3 text-left hover:bg-[#0a0f1e] transition-colors"
      >
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-sm mt-0.5">{FINDING_TYPE_LABELS[finding.finding_type]?.split(' ')[0]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold text-[#f1f5f9] truncate">{finding.title}</p>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0"
                style={{ background: `${color}20`, color }}>
                {status?.replace(/_/g, ' ').toUpperCase()}
              </span>
              {finding.is_completed && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#00d4aa]/15 text-[#00d4aa] shrink-0">DONE</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="flex items-center gap-1 text-[10px] text-[#475569]">
                <Monitor size={9} /> {deviceLabel(finding.device_type)} {finding.device_model && `· ${finding.device_model}`}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#475569]">
                <Globe size={9} /> {browserLabel(finding.browser)} {finding.browser_version}
              </span>
              {finding.os_version && <span className="text-[10px] text-[#475569]">{finding.os_version}</span>}
              <span className="text-[10px] text-[#475569]">{finding.user_email}</span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={13} className="text-[#475569] shrink-0" /> : <ChevronDown size={13} className="text-[#475569] shrink-0" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[#1e293b] pt-3 space-y-3">
          <p className="text-xs text-[#94a3b8] leading-relaxed">{finding.description}</p>
          {finding.steps_to_reproduce && (
            <div className="bg-[#0a0f1e] rounded-lg p-2">
              <p className="text-[10px] font-bold text-[#475569] mb-1">Steps to Reproduce</p>
              <p className="text-xs text-[#64748b] whitespace-pre-line">{finding.steps_to_reproduce}</p>
            </div>
          )}

          {/* Admin controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#475569] font-semibold block mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(STATUS_COLORS).map(s => (
                    <SelectItem key={s} value={s} className="text-xs">{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-[#475569] font-semibold block mb-1">Importance (1–10)</label>
              <input type="number" min={0} max={10} value={importance}
                onChange={e => setImportance(+e.target.value)}
                className="w-full h-8 bg-[#0a0f1e] border border-[#1e293b] text-[#f1f5f9] text-xs rounded-md px-2" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#475569] font-semibold block mb-1">Admin Notes</label>
            <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
              rows={2} className="bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs resize-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autoSeed} onChange={e => setAutoSeed(e.target.checked)}
              className="accent-[#f59e0b]" />
            <span className="text-[11px] text-[#f59e0b]">🔄 Auto-seed as new scope for other testers</span>
          </label>

          <div className="flex gap-2">
            <Button onClick={() => save(false)} disabled={saving} variant="outline"
              className="flex-1 text-xs h-8 border-[#1e293b]">
              <RefreshCw size={11} className="mr-1" /> Save
            </Button>
            {!finding.is_completed && (
              <Button onClick={() => save(true)} disabled={saving}
                className="flex-1 text-xs h-8 bg-[#00d4aa] hover:bg-[#00a88a] text-[#070b14]">
                <CheckCircle2 size={11} className="mr-1" /> Mark Completed
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}