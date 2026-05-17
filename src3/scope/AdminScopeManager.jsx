import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ClipboardList, BarChart2, RefreshCw } from 'lucide-react';
import AdminScopeFindingRow from './AdminScopeFindingRow';

const BLANK_SCOPE = {
  title: '', description: '', acceptance_criteria: '',
  priority: 'medium', category: 'general', status: 'active',
  target_devices: [], target_browsers: [],
};

const DEVICE_OPTIONS = ['mobile_ios', 'mobile_android', 'tablet', 'desktop_windows', 'desktop_mac', 'any'];
const BROWSER_OPTIONS = ['chrome', 'firefox', 'safari', 'edge', 'brave', 'opera', 'samsung_internet', 'any'];

export default function AdminScopeManager({ onUpdate }) {
  const [scopes, setScopes] = useState([]);
  const [findings, setFindings] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'findings'
  const [selectedScopeId, setSelectedScopeId] = useState(null);
  const [form, setForm] = useState(BLANK_SCOPE);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
    loadAll();
  }, []);

  const loadAll = () => {
    Promise.all([
      base44.entities.Scope.list('-created_date'),
      base44.entities.ScopeFinding.list('-created_date'),
    ]).then(([s, f]) => { setScopes(s); setFindings(f); });
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleMulti = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
    }));
  };

  const createScope = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    await base44.entities.Scope.create({ ...form, created_by_admin: user?.email || '' });
    setSaving(false);
    setForm(BLANK_SCOPE);
    setView('list');
    loadAll();
    onUpdate?.();
  };

  const updateScopeStatus = async (id, status) => {
    await base44.entities.Scope.update(id, { status });
    loadAll();
    onUpdate?.();
  };

  const scopeFindings = findings.filter(f => f.scope_id === selectedScopeId);
  const selectedScope = scopes.find(s => s.id === selectedScopeId);

  // Stats
  const totalFindings = findings.length;
  const openFindings = findings.filter(f => !f.is_completed).length;
  const avgImportance = findings.length
    ? (findings.reduce((s, f) => s + (f.importance_rating || 0), 0) / findings.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Findings', value: totalFindings, color: '#a78bfa' },
          { label: 'Open', value: openFindings, color: '#f59e0b' },
          { label: 'Avg Importance', value: avgImportance, color: '#00d4aa' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3 text-center">
            <p className="text-xl font-black" style={{ color }}>{value}</p>
            <p className="text-[10px] text-[#475569]">{label}</p>
          </div>
        ))}
      </div>

      {/* Nav */}
      <div className="flex gap-2">
        <Button onClick={() => setView('list')} variant={view === 'list' ? 'default' : 'outline'}
          className="text-xs h-8">
          <ClipboardList size={11} className="mr-1" /> Scopes
        </Button>
        <Button onClick={() => setView('create')} variant={view === 'create' ? 'default' : 'outline'}
          className="text-xs h-8">
          <Plus size={11} className="mr-1" /> New Scope
        </Button>
        <Button onClick={() => { setView('findings'); setSelectedScopeId(null); }}
          variant={view === 'findings' && !selectedScopeId ? 'default' : 'outline'}
          className="text-xs h-8">
          <BarChart2 size={11} className="mr-1" /> All Findings
        </Button>
        <Button onClick={loadAll} variant="ghost" className="text-xs h-8 ml-auto">
          <RefreshCw size={11} />
        </Button>
      </div>

      {/* Create scope form */}
      {view === 'create' && (
        <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-4 space-y-3">
          <p className="text-xs font-bold text-[#f1f5f9]">Create New Scope</p>
          <Input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Scope title" className="bg-[#070b14] border-[#1e293b] text-[#f1f5f9] text-xs" />
          <Textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Full instructions for testers..." rows={3}
            className="bg-[#070b14] border-[#1e293b] text-[#f1f5f9] text-xs resize-none" />
          <Textarea value={form.acceptance_criteria} onChange={e => set('acceptance_criteria', e.target.value)}
            placeholder="Acceptance criteria — what counts as passing?" rows={2}
            className="bg-[#070b14] border-[#1e293b] text-[#f1f5f9] text-xs resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <Select value={form.priority} onValueChange={v => set('priority', v)}>
              <SelectTrigger className="bg-[#070b14] border-[#1e293b] text-[#f1f5f9] text-xs h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['low','medium','high','critical'].map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger className="bg-[#070b14] border-[#1e293b] text-[#f1f5f9] text-xs h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['bug_hunt','ui_ux','performance','audio','feature_test','easter_egg','security','general'].map(c => (
                  <SelectItem key={c} value={c} className="text-xs">{c.replace(/_/g,' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[10px] text-[#475569] font-semibold mb-1">Target Devices</p>
            <div className="flex flex-wrap gap-1">
              {DEVICE_OPTIONS.map(d => (
                <button key={d} onClick={() => toggleMulti('target_devices', d)}
                  className="text-[10px] px-2 py-1 rounded-lg border transition-all"
                  style={{
                    borderColor: form.target_devices.includes(d) ? '#00d4aa' : '#1e293b',
                    color: form.target_devices.includes(d) ? '#00d4aa' : '#475569',
                    background: form.target_devices.includes(d) ? '#00d4aa15' : 'transparent',
                  }}>
                  {d.replace(/_/g,' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[#475569] font-semibold mb-1">Target Browsers</p>
            <div className="flex flex-wrap gap-1">
              {BROWSER_OPTIONS.map(b => (
                <button key={b} onClick={() => toggleMulti('target_browsers', b)}
                  className="text-[10px] px-2 py-1 rounded-lg border transition-all"
                  style={{
                    borderColor: form.target_browsers.includes(b) ? '#60a5fa' : '#1e293b',
                    color: form.target_browsers.includes(b) ? '#60a5fa' : '#475569',
                    background: form.target_browsers.includes(b) ? '#60a5fa15' : 'transparent',
                  }}>
                  {b.replace(/_/g,' ')}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={createScope} disabled={saving || !form.title || !form.description}
            className="w-full text-xs font-bold bg-[#00d4aa] hover:bg-[#00a88a] text-[#070b14]">
            {saving ? 'Creating...' : '+ Create Scope'}
          </Button>
        </div>
      )}

      {/* Scope list */}
      {view === 'list' && (
        <div className="space-y-2">
          {scopes.map(scope => {
            const count = findings.filter(f => f.scope_id === scope.id).length;
            const open = findings.filter(f => f.scope_id === scope.id && !f.is_completed).length;
            return (
              <div key={scope.id} className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-[#f1f5f9]">{scope.title}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        scope.status === 'active' ? 'bg-[#00d4aa]/15 text-[#00d4aa]' :
                        scope.status === 'completed' ? 'bg-[#60a5fa]/15 text-[#60a5fa]' :
                        'bg-[#1e293b] text-[#475569]'
                      }`}>{scope.status}</span>
                    </div>
                    <p className="text-[10px] text-[#475569] mt-0.5">{count} findings · {open} open</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button onClick={() => { setSelectedScopeId(scope.id); setView('findings'); }}
                      variant="ghost" className="text-[10px] h-7 px-2">View</Button>
                    {scope.status === 'active' && (
                      <Button onClick={() => updateScopeStatus(scope.id, 'completed')}
                        variant="ghost" className="text-[10px] h-7 px-2 text-[#00d4aa]">Complete</Button>
                    )}
                    {scope.status !== 'active' && (
                      <Button onClick={() => updateScopeStatus(scope.id, 'active')}
                        variant="ghost" className="text-[10px] h-7 px-2 text-[#f59e0b]">Reopen</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {scopes.length === 0 && (
            <p className="text-center text-xs text-[#334155] py-8">No scopes yet. Create one above.</p>
          )}
        </div>
      )}

      {/* Findings view */}
      {view === 'findings' && (
        <div className="space-y-3">
          {selectedScope && (
            <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3">
              <p className="text-xs font-bold text-[#f1f5f9]">📋 {selectedScope.title}</p>
              <p className="text-[10px] text-[#475569] mt-1">{scopeFindings.length} total findings</p>
            </div>
          )}
          {(selectedScopeId ? scopeFindings : findings).map(f => (
            <AdminScopeFindingRow key={f.id} finding={f} onUpdate={loadAll} />
          ))}
          {(selectedScopeId ? scopeFindings : findings).length === 0 && (
            <p className="text-center text-xs text-[#334155] py-8">No findings yet.</p>
          )}
        </div>
      )}
    </div>
  );
}