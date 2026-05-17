import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { detectDevice, deviceLabel, browserLabel } from '@/lib/deviceDetect';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Monitor, Globe, Send, AlertCircle } from 'lucide-react';

const FINDING_TYPES = [
  { value: 'bug', label: '🐛 Bug' },
  { value: 'visual_glitch', label: '👁️ Visual Glitch' },
  { value: 'performance_issue', label: '⚡ Performance Issue' },
  { value: 'audio_issue', label: '🔊 Audio Issue' },
  { value: 'crash', label: '💥 Crash' },
  { value: 'unexpected_behavior', label: '🤔 Unexpected Behavior' },
  { value: 'easter_egg_hint', label: '🥚 Easter Egg / Hint' },
  { value: 'script_prompt', label: '📜 Script / Prompt Behavior' },
  { value: 'passed_no_issues', label: '✅ Passed — No Issues' },
  { value: 'feature_suggestion', label: '💡 Feature Suggestion' },
];

export default function ScopeFindingForm({ scope, user, onSubmitted }) {
  const [env] = useState(() => detectDevice());
  const [form, setForm] = useState({
    finding_type: 'bug',
    title: '',
    description: '',
    steps_to_reproduce: '',
    device_model: env.deviceModel,
    os_version: env.osVersion,
    browser_version: env.browserVersion,
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    const payload = {
      scope_id: scope.id,
      scope_title: scope.title,
      user_id: user?.id || '',
      user_email: user?.email || '',
      ...form,
      device_type: env.deviceType,
      browser: env.browser,
      screen_resolution: env.screenResolution,
      status: 'submitted',
      is_completed: false,
      contribution_score: 1,
    };
    await base44.entities.ScopeFinding.create(payload);
    // Update scope completion count
    await base44.entities.Scope.update(scope.id, {
      completion_count: (scope.completion_count || 0) + 1,
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => onSubmitted?.(), 1500);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 size={36} className="text-[#00d4aa]" />
        <p className="text-sm font-bold text-[#f1f5f9]">Finding submitted!</p>
        <p className="text-xs text-[#475569]">Thanks for your contribution. Admin has been notified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Auto-detected environment banner */}
      <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3 space-y-1.5">
        <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Auto-Detected Environment</p>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-[#1e293b] text-[#94a3b8]">
            <Monitor size={10} /> {deviceLabel(env.deviceType)} {env.deviceModel && `· ${env.deviceModel}`}
          </span>
          <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-[#1e293b] text-[#94a3b8]">
            <Globe size={10} /> {browserLabel(env.browser)} {env.browserVersion && `${env.browserVersion}`}
          </span>
          {env.osVersion && (
            <span className="text-[11px] px-2 py-1 rounded-lg bg-[#1e293b] text-[#94a3b8]">{env.osVersion}</span>
          )}
          {env.screenResolution && (
            <span className="text-[11px] px-2 py-1 rounded-lg bg-[#1e293b] text-[#94a3b8]">{env.screenResolution}</span>
          )}
        </div>
        <p className="text-[9px] text-[#334155] italic">
          Tip: test on multiple device types and browsers — different environments may reveal different issues.
        </p>
      </div>

      {/* Finding type */}
      <div>
        <label className="text-[11px] text-[#475569] font-semibold mb-1 block">Finding Type</label>
        <Select value={form.finding_type} onValueChange={v => set('finding_type', v)}>
          <SelectTrigger className="bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FINDING_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div>
        <label className="text-[11px] text-[#475569] font-semibold mb-1 block">Title</label>
        <Input
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Short summary of what you found"
          className="bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] text-[#475569] font-semibold mb-1 block">Description</label>
        <Textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="What happened? What did you expect to happen?"
          rows={3}
          className="bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs resize-none"
        />
      </div>

      {/* Steps to reproduce */}
      {form.finding_type !== 'passed_no_issues' && (
        <div>
          <label className="text-[11px] text-[#475569] font-semibold mb-1 block">Steps to Reproduce <span className="text-[#334155]">(optional)</span></label>
          <Textarea
            value={form.steps_to_reproduce}
            onChange={e => set('steps_to_reproduce', e.target.value)}
            placeholder="1. Go to... 2. Click... 3. Observe..."
            rows={3}
            className="bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs resize-none"
          />
        </div>
      )}

      {/* Manual overrides */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-[#475569] font-semibold mb-1 block">Device Model</label>
          <Input value={form.device_model} onChange={e => set('device_model', e.target.value)}
            className="bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs" placeholder="e.g. iPhone 15 Pro" />
        </div>
        <div>
          <label className="text-[11px] text-[#475569] font-semibold mb-1 block">OS Version</label>
          <Input value={form.os_version} onChange={e => set('os_version', e.target.value)}
            className="bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs" placeholder="e.g. iOS 17.4" />
        </div>
      </div>

      {(!form.title || !form.description) && (
        <div className="flex items-center gap-2 text-[11px] text-[#f59e0b]">
          <AlertCircle size={12} /> Title and description are required
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={saving || !form.title || !form.description}
        className="w-full text-xs font-bold"
        style={{ background: 'linear-gradient(135deg,#00d4aa,#00a88a)', color: '#070b14' }}
      >
        <Send size={12} className="mr-2" />
        {saving ? 'Submitting...' : 'Submit Finding'}
      </Button>
    </div>
  );
}