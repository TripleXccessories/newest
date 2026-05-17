import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSovereign } from '@/lib/sovereignConfig';

const ACTION_META = {
  delete_entity_record:       { color: '#ef4444', icon: XCircle,       label: 'Record Deleted' },
  bulk_delete:                { color: '#ef4444', icon: XCircle,       label: 'Bulk Delete' },
  admin_grant:                { color: '#fbbf24', icon: AlertTriangle,  label: 'Admin Granted' },
  admin_revoke:               { color: '#fbbf24', icon: AlertTriangle,  label: 'Admin Revoked' },
  sovereign_override:         { color: '#a78bfa', icon: Shield,         label: 'Sovereign Override' },
  destructive_config_change:  { color: '#f87171', icon: AlertTriangle,  label: 'Config Changed' },
  data_export:                { color: '#60a5fa', icon: Shield,         label: 'Data Exported' },
  function_edit:              { color: '#fbbf24', icon: AlertTriangle,  label: 'Function Edited' },
  access_attempt_blocked:     { color: '#ef4444', icon: Lock,           label: 'Access Blocked' },
};

export default function SovereignLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const u = await base44.auth.me();
    setUser(u);
    if (u?.role !== 'admin') { setLoading(false); return; }
    const data = await base44.entities.SovereignLog.list('-created_date', 100);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? logs
    : filter === 'blocked' ? logs.filter(l => l.was_blocked)
    : filter === 'sovereign' ? logs.filter(l => l.sovereignty_confirmed)
    : logs;

  if (loading) return (
    <div className="min-h-screen bg-[#030508] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
    </div>
  );

  if (user?.role !== 'admin') return (
    <div className="min-h-screen bg-[#030508] flex items-center justify-center text-[#ef4444] text-sm font-bold">
      Access denied. Admins only.
    </div>
  );

  const blockedCount = logs.filter(l => l.was_blocked).length;
  const sovereignCount = logs.filter(l => l.sovereignty_confirmed).length;

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9] p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/directors-cut" className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">Immutable Audit Trail</p>
              <h1 className="text-xl font-black flex items-center gap-2">
                <Shield size={18} className="text-[#ef4444]" /> Sovereign Log
              </h1>
            </div>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 text-[#475569] hover:text-[#f1f5f9] text-xs transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Sovereign identity badge */}
        <div className="p-4 rounded-xl border flex items-center gap-3"
          style={{ borderColor: isSovereign(user.email) ? '#00d4aa30' : '#fbbf2430',
                   background: isSovereign(user.email) ? '#00d4aa08' : '#fbbf2408' }}>
          <Shield size={16} style={{ color: isSovereign(user.email) ? '#00d4aa' : '#fbbf24' }} />
          <div>
            <p className="text-xs font-bold" style={{ color: isSovereign(user.email) ? '#00d4aa' : '#fbbf24' }}>
              {isSovereign(user.email) ? 'Viewing as Sovereign Owner' : 'Viewing as Admin (read-only)'}
            </p>
            <p className="text-[10px] text-[#475569]">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Logged', value: logs.length, color: '#64748b' },
            { label: 'Blocked Attempts', value: blockedCount, color: '#ef4444' },
            { label: 'Sovereign Actions', value: sovereignCount, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} className="bg-[#070b14] border border-[#1e293b] rounded-xl p-4 text-center">
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-[#475569] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {[['all', 'All'], ['blocked', '🚫 Blocked'], ['sovereign', '👑 Sovereign']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{
                background: filter === val ? '#1e293b' : 'transparent',
                color: filter === val ? '#f1f5f9' : '#475569',
                border: `1px solid ${filter === val ? '#334155' : 'transparent'}`,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Log entries */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#334155] text-sm">
            No log entries yet. Actions through the Sovereign Gate will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((log, i) => {
              const meta = ACTION_META[log.action_type] || { color: '#64748b', icon: Shield, label: log.action_type };
              const Icon = meta.icon;
              return (
                <motion.div key={log.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-[#070b14] border rounded-xl p-4 space-y-2"
                  style={{ borderColor: log.was_blocked ? '#ef444425' : '#1e293b' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon size={13} style={{ color: meta.color }} />
                      <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
                      {log.was_blocked && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#ef4444]/15 text-[#ef4444] font-black">BLOCKED</span>
                      )}
                      {log.sovereignty_confirmed && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa] font-black">SOVEREIGN</span>
                      )}
                    </div>
                    <span className="text-[9px] text-[#334155] font-mono shrink-0">
                      {new Date(log.created_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                    <div><span className="text-[#334155]">Actor: </span><span className="text-[#64748b]">{log.actor_email}</span></div>
                    <div><span className="text-[#334155]">Target: </span><span className="text-[#64748b] truncate">{log.target}</span></div>
                  </div>
                  {log.reason && (
                    <div className="bg-[#0a0f1e] rounded-lg p-3">
                      <p className="text-[10px] text-[#334155] mb-1 uppercase tracking-wide">Written Justification</p>
                      <p className="text-[11px] text-[#94a3b8] leading-relaxed">{log.reason}</p>
                    </div>
                  )}
                  {log.block_reason && (
                    <p className="text-[10px] text-[#ef4444] pl-2 border-l border-[#ef4444]/30">{log.block_reason}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-[9px] text-[#1e293b] text-center pb-4">
          SovereignLog entries are write-only from the application layer. No UI can delete these records.
          For maximum protection, export and back up this log periodically.
        </p>
      </div>
    </div>
  );
}