import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import NarrativeTaskCard from '@/components/portal/NarrativeTaskCard';
import GenerateNarrativeModal from '@/components/portal/GenerateNarrativeModal';

export default function NarrativePortal() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.NarratedMessage.filter(
      { flagged_for_deletion: false },
      '-created_date',
      50
    );
    setMessages(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerated = (msg) => {
    setShowModal(false);
    setMessages(prev => [msg, ...prev]);
  };

  const handleComplete = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_completed: true, completed_at: new Date().toISOString() } : m));
  };

  const active = messages.filter(m => !m.is_completed && !m.flagged_for_deletion);
  const completed = messages.filter(m => m.is_completed && !m.flagged_for_deletion);

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a78bfa]/10 border border-[#a78bfa]/20 flex items-center justify-center">
            <Scroll size={20} className="text-[#a78bfa]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#f1f5f9]">Narrative Portal</h1>
            <p className="text-xs text-[#475569]">Messages from the great ancestors — complete before they vanish</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="ghost" size="sm" className="text-xs text-[#475569] h-8">
            <RefreshCw size={12} />
          </Button>
          <Button onClick={() => setShowModal(true)} size="sm"
            className="text-xs font-bold bg-[#a78bfa] hover:bg-[#8b5cf6] text-white h-8 gap-1.5">
            <Plus size={12} /> Summon
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Tasks', value: active.length, color: '#a78bfa' },
          { label: 'Completed', value: completed.length, color: '#00d4aa' },
          { label: 'Total', value: messages.length, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3 text-center">
            <p className="text-xl font-black" style={{ color }}>{value}</p>
            <p className="text-[10px] text-[#475569]">{label}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#a78bfa] rounded-full animate-spin" />
        </div>
      )}

      {/* Active tasks */}
      {!loading && active.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-[#1e293b] p-12 text-center"
        >
          <Sparkles size={32} className="mx-auto mb-3 text-[#334155]" />
          <p className="text-sm font-bold text-[#475569]">The portal is silent...</p>
          <p className="text-xs text-[#334155] mt-1">Summon a message from the ancestors to begin.</p>
          <Button onClick={() => setShowModal(true)} className="mt-4 text-xs bg-[#a78bfa] hover:bg-[#8b5cf6] text-white font-bold h-8 gap-1.5">
            <Plus size={12} /> Summon First Message
          </Button>
        </motion.div>
      )}

      {!loading && active.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Active Tasks</p>
          <AnimatePresence>
            {active.map(msg => (
              <NarrativeTaskCard key={msg.id} message={msg} onComplete={handleComplete} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed tasks */}
      {!loading && completed.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">
            Completed — Fading in 12h
          </p>
          <AnimatePresence>
            {completed.map(msg => (
              <NarrativeTaskCard key={msg.id} message={msg} onComplete={handleComplete} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {showModal && (
        <GenerateNarrativeModal onGenerated={handleGenerated} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}