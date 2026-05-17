import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Film, Plus, Trash2, Pencil, CheckCircle, Clock, Zap, ChevronDown, ChevronRight, GraduationCap, Megaphone, Trophy, BookOpen, Palette, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { key: 'intro',     label: 'Cinematic Intros',     icon: '🎬', color: '#00d4aa',  lucide: Film },
  { key: 'promotion', label: 'Promotions & Ads',     icon: '📣', color: '#fbbf24',  lucide: Megaphone },
  { key: 'reward',    label: 'Reward Deliveries',    icon: '🏆', color: '#a78bfa',  lucide: Trophy },
  { key: 'tutorial',  label: 'Academy Lessons',      icon: '📚', color: '#60a5fa',  lucide: GraduationCap },
  { key: 'custom',    label: 'Custom / Other',       icon: '🎨', color: '#64748b',  lucide: Palette },
];

const STATUS_META = {
  draft:     { icon: <Clock size={9} />,        color: '#64748b', label: 'Draft' },
  ready:     { icon: <CheckCircle size={9} />,  color: '#fbbf24', label: 'Ready' },
  published: { icon: <Zap size={9} />,          color: '#00d4aa', label: 'Live' },
};

export default function SceneLibraryTOC({ activeSceneId, onSelect, onNew, onDelete, onEdit }) {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({});
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const load = () => {
    setLoading(true);
    base44.entities.SceneScript.list('-created_date', 100)
      .then(setScenes)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleCollapse = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await base44.entities.SceneScript.delete(id);
    setScenes(prev => prev.filter(s => s.id !== id));
    onDelete?.(id);
  };

  const startEdit = (e, scene) => {
    e.stopPropagation();
    setEditingId(scene.id);
    setEditTitle(scene.title);
  };

  const commitEdit = async (id) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    await base44.entities.SceneScript.update(id, { title: editTitle.trim() });
    setScenes(prev => prev.map(s => s.id === id ? { ...s, title: editTitle.trim() } : s));
    setEditingId(null);
    onEdit?.();
  };

  const filtered = search
    ? scenes.filter(s =>
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : scenes;

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: filtered.filter(s => s.scene_type === cat.key),
  }));

  // Academy sub-groups by school level
  const academyItems = filtered.filter(s => s.scene_type === 'tutorial');
  const academyByLevel = {};
  academyItems.forEach(s => {
    const lvl = s.academy_school_level || 'Unassigned';
    if (!academyByLevel[lvl]) academyByLevel[lvl] = [];
    academyByLevel[lvl].push(s);
  });

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <div className="w-5 h-5 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
        <input placeholder="Search scenes or tags..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl pl-8 pr-3 py-2 outline-none border border-transparent focus:border-[#00d4aa]/30" />
      </div>

      {/* New scene button */}
      <button onClick={onNew}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#1e293b] text-[#475569] text-xs font-bold hover:border-[#00d4aa]/40 hover:text-[#00d4aa] transition-all">
        <Plus size={12} /> New Scene
      </button>

      {/* Category sections */}
      {grouped.map(cat => {
        const isOpen = !collapsed[cat.key];
        const isAcademy = cat.key === 'tutorial';
        return (
          <div key={cat.key} className="rounded-xl border overflow-hidden"
            style={{ borderColor: cat.items.length > 0 ? `${cat.color}25` : '#1e293b' }}>

            {/* Category header */}
            <button onClick={() => toggleCollapse(cat.key)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
              style={{ background: cat.items.length > 0 ? `${cat.color}08` : '#0a0f1e' }}>
              <span className="text-base">{cat.icon}</span>
              <span className="flex-1 text-xs font-bold" style={{ color: cat.items.length > 0 ? cat.color : '#334155' }}>
                {cat.label}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: `${cat.color}20`, color: cat.color }}>
                {cat.items.length}
              </span>
              {isOpen ? <ChevronDown size={11} style={{ color: cat.color }} /> : <ChevronRight size={11} style={{ color: cat.color }} />}
            </button>

            {/* Items */}
            <AnimatePresence>
              {isOpen && cat.items.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  {/* Academy: group by school level */}
                  {isAcademy ? (
                    <div className="divide-y divide-[#0d1525]">
                      {Object.entries(academyByLevel).map(([level, items]) => (
                        <div key={level}>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#060a12]">
                            <GraduationCap size={9} className="text-[#60a5fa]" />
                            <span className="text-[9px] font-bold text-[#60a5fa] uppercase tracking-widest">{level}</span>
                          </div>
                          {items.map(scene => <SceneRow key={scene.id} scene={scene} cat={cat} activeSceneId={activeSceneId} onSelect={onSelect}
                            editingId={editingId} editTitle={editTitle} setEditTitle={setEditTitle} startEdit={startEdit} commitEdit={commitEdit}
                            handleDelete={handleDelete} />)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#0d1525]">
                      {cat.items.map(scene => (
                        <SceneRow key={scene.id} scene={scene} cat={cat} activeSceneId={activeSceneId} onSelect={onSelect}
                          editingId={editingId} editTitle={editTitle} setEditTitle={setEditTitle} startEdit={startEdit} commitEdit={commitEdit}
                          handleDelete={handleDelete} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {isOpen && cat.items.length === 0 && (
              <p className="text-[10px] text-[#334155] px-4 py-3">No {cat.label.toLowerCase()} yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SceneRow({ scene, cat, activeSceneId, onSelect, editingId, editTitle, setEditTitle, startEdit, commitEdit, handleDelete }) {
  const isActive = scene.id === activeSceneId;
  const sm = STATUS_META[scene.status] || STATUS_META.draft;
  const isEditing = editingId === scene.id;
  return (
    <div onClick={() => !isEditing && onSelect(scene)}
      className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-all hover:bg-white/[0.02] group"
      style={{ background: isActive ? `${cat.color}08` : 'transparent' }}>
      <div className="w-1 h-5 rounded-full shrink-0" style={{ background: isActive ? cat.color : 'transparent' }} />
      {isEditing ? (
        <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
          onBlur={() => commitEdit(scene.id)} onKeyDown={e => { if (e.key === 'Enter') commitEdit(scene.id); if (e.key === 'Escape') { setEditTitle(''); } }}
          onClick={e => e.stopPropagation()}
          className="flex-1 bg-[#1e293b] text-[#f1f5f9] text-xs rounded px-2 py-0.5 outline-none border border-[#00d4aa]/40" />
      ) : (
        <p className="flex-1 text-xs truncate" style={{ color: isActive ? cat.color : '#94a3b8', fontWeight: isActive ? 700 : 400 }}>
          {scene.title}
        </p>
      )}
      <span className="flex items-center gap-0.5 text-[9px] shrink-0" style={{ color: sm.color }}>
        {sm.icon} {sm.label}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={e => startEdit(e, scene)} className="text-[#475569] hover:text-[#fbbf24] p-0.5 transition-colors">
          <Pencil size={10} />
        </button>
        <button onClick={e => handleDelete(e, scene.id)} className="text-[#475569] hover:text-[#ef4444] p-0.5 transition-colors">
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}