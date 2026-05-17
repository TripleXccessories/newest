import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Target, ClipboardList, Trophy, BarChart2, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ScopeCard from '@/components/scope/ScopeCard';
import AdminScopeManager from '@/components/scope/AdminScopeManager';
import ScopeTesterStats from '@/components/scope/ScopeTesterStats';
import ScopeLeaderboard from '@/components/scope/ScopeLeaderboard';

const TABS = [
  { id: 'active', label: '🎯 Active Scopes' },
  { id: 'stats', label: '📊 My Stats' },
  { id: 'leaderboard', label: '🏆 Leaderboard' },
  { id: 'completed', label: '✅ Completed' },
];

export default function ScopeTesting() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scopes, setScopes] = useState([]);
  const [myFindings, setMyFindings] = useState([]);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setIsAdmin(u?.role === 'admin');
      Promise.all([
        base44.entities.Scope.list('-created_date'),
        base44.entities.ScopeFinding.filter({ user_id: u.id }),
      ]).then(([s, f]) => {
        setScopes(s);
        setMyFindings(f);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  const reload = () => {
    base44.entities.Scope.list('-created_date').then(setScopes);
    if (user?.id) base44.entities.ScopeFinding.filter({ user_id: user.id }).then(setMyFindings);
  };

  const activeScopes = scopes.filter(s => s.status === 'active');
  const completedScopes = scopes.filter(s => s.status === 'completed');
  const filtered = (tab === 'completed' ? completedScopes : activeScopes)
    .filter(s => !search || s.title?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#f1f5f9] flex items-center gap-2">
            <Target size={20} className="text-[#00d4aa]" /> Scope Testing
          </h1>
          <p className="text-xs text-[#475569] mt-1">Accept scopes, submit findings, help build IINT INC.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setTab('admin')}
            className="text-xs font-bold"
            style={{ background: tab === 'admin' ? '#00d4aa' : undefined, color: tab === 'admin' ? '#070b14' : undefined }}
            variant={tab === 'admin' ? 'default' : 'outline'}
          >
            <Plus size={12} className="mr-1" /> Admin Panel
          </Button>
        )}
      </div>

      {/* How-to banner */}
      <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-4 space-y-2">
        <p className="text-xs font-bold text-[#f1f5f9]">📖 How Scope Testing Works</p>
        <ol className="text-[11px] text-[#64748b] space-y-1 list-decimal list-inside leading-relaxed">
          <li>Pick an active scope — read the task description and acceptance criteria carefully.</li>
          <li>Complete the task on your device. Note any bugs, glitches, or unexpected behavior.</li>
          <li>Submit your finding — your environment (device, browser, OS) is auto-detected.</li>
          <li>Test on multiple devices/browsers when possible — different results matter.</li>
          <li>Admin reviews findings, marks fixes as completed, and awards contribution scores.</li>
        </ol>
        <p className="text-[10px] text-[#334155] italic">
          💡 Device coverage matters! iOS Safari may behave differently than Windows Chrome. Try both!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0a0f1e] rounded-xl p-1 border border-[#1e293b]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all"
            style={{
              background: tab === t.id ? '#1e293b' : 'transparent',
              color: tab === t.id ? '#f1f5f9' : '#475569',
            }}>
            {t.label}
          </button>
        ))}
        {isAdmin && (
          <button onClick={() => setTab('admin')}
            className="flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all"
            style={{
              background: tab === 'admin' ? '#00d4aa' : 'transparent',
              color: tab === 'admin' ? '#070b14' : '#475569',
            }}>
            ⚙️ Admin
          </button>
        )}
      </div>

      {/* Search (scopes list) */}
      {(tab === 'active' || tab === 'completed') && (
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search scopes..."
            className="pl-8 bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] text-xs" />
        </div>
      )}

      {/* Tab content */}
      {tab === 'active' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#334155]">
              <Target size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active scopes right now. Check back soon.</p>
            </div>
          ) : (
            filtered.map(scope => (
              <ScopeCard
                key={scope.id}
                scope={scope}
                user={user}
                userFinding={myFindings.find(f => f.scope_id === scope.id)}
              />
            ))
          )}
        </div>
      )}

      {tab === 'completed' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#334155]">
              <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No completed scopes yet.</p>
            </div>
          ) : (
            filtered.map(scope => (
              <ScopeCard key={scope.id} scope={scope} user={user}
                userFinding={myFindings.find(f => f.scope_id === scope.id)} />
            ))
          )}
        </div>
      )}

      {tab === 'stats' && <ScopeTesterStats user={user} findings={myFindings} />}
      {tab === 'leaderboard' && <ScopeLeaderboard currentUser={user} />}
      {tab === 'admin' && isAdmin && <AdminScopeManager onUpdate={reload} />}
    </div>
  );
}