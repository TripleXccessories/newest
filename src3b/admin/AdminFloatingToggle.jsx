import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Eye, ChevronDown, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MODE_COLORS = {
  admin: '#ef4444', user_new: '#00d4aa', user_existing: '#60a5fa',
  user_beta: '#fbbf24', user_graduated: '#a78bfa',
};
const MODE_LABELS = {
  admin: 'Admin', user_new: 'New User', user_existing: 'User',
  user_beta: 'Beta', user_graduated: 'Grad',
};

export default function AdminFloatingToggle() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState(() => localStorage.getItem('adminPreviewMode') || 'admin');

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  // Only show for admins
  if (!user || user.role !== 'admin') return null;

  const color = MODE_COLORS[activeMode] || '#64748b';
  const label = MODE_LABELS[activeMode] || 'Admin';

  const switchMode = (mode) => {
    setActiveMode(mode);
    localStorage.setItem('adminPreviewMode', mode);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-14 left-0 w-52 rounded-2xl border border-[#1e293b] bg-[#070b14] shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-[#1e293b] flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#475569] uppercase tracking-widest">Preview Mode</span>
              <button onClick={() => setOpen(false)}><X size={10} className="text-[#475569]" /></button>
            </div>
            {Object.entries(MODE_LABELS).map(([id, label]) => (
              <button key={id} onClick={() => switchMode(id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#1e293b] transition-colors text-left"
                style={{ background: activeMode === id ? `${MODE_COLORS[id]}10` : 'transparent' }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: MODE_COLORS[id] }} />
                <span className="text-xs font-bold" style={{ color: activeMode === id ? MODE_COLORS[id] : '#94a3b8' }}>{label}</span>
                {activeMode === id && <div className="ml-auto w-1 h-1 rounded-full animate-pulse" style={{ background: MODE_COLORS[id] }} />}
              </button>
            ))}
            <div className="p-2 border-t border-[#1e293b]">
              <Link to="/admin-preview" onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-[9px] text-[#475569] hover:text-[#f1f5f9] transition-colors">
                <Shield size={9} /> Full Admin Preview Settings →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-lg text-xs font-bold transition-all"
        style={{ borderColor: `${color}40`, background: `${color}15`, color, boxShadow: `0 0 20px ${color}20` }}
      >
        <Eye size={12} />
        <span>{label}</span>
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>
    </div>
  );
}