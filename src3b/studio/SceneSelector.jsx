import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Film, Tag, CheckCircle, Clock, Zap } from 'lucide-react';

const TYPE_COLORS = { intro: '#00d4aa', promotion: '#fbbf24', reward: '#a78bfa', tutorial: '#60a5fa', custom: '#64748b' };
const TYPE_ICONS = { intro: '🎬', promotion: '📣', reward: '🏆', tutorial: '📚', custom: '🎨' };

export default function SceneSelector({ activeSceneId, onSelect, onNew }) {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SceneScript.list('-created_date', 50)
      .then(setScenes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deleteScene = async (e, id) => {
    e.stopPropagation();
    await base44.entities.SceneScript.delete(id);
    setScenes(prev => prev.filter(s => s.id !== id));
  };

  const STATUS_ICONS = { draft: <Clock size={10} />, ready: <CheckCircle size={10} />, published: <Zap size={10} /> };
  const STATUS_COLORS = { draft: '#64748b', ready: '#fbbf24', published: '#00d4aa' };

  if (loading) return (
    <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl p-6 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film size={14} className="text-[#00d4aa]" />
          <h3 className="text-sm font-bold text-[#f1f5f9]">Scene Library</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#64748b]">{scenes.length}</span>
        </div>
        <button onClick={onNew}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30 hover:bg-[#00d4aa]/25 transition-colors">
          <Plus size={10} /> New Scene
        </button>
      </div>

      {scenes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#475569] text-xs">No scenes yet.</p>
          <button onClick={onNew} className="mt-2 text-[#00d4aa] text-xs hover:underline">Create your first scene</button>
        </div>
      )}

      <div className="space-y-1.5 max-h-72 overflow-y-auto">
        {scenes.map(scene => {
          const color = TYPE_COLORS[scene.scene_type] || '#64748b';
          const isActive = scene.id === activeSceneId;
          return (
            <div key={scene.id}
              onClick={() => onSelect(scene)}
              className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]"
              style={{
                borderColor: isActive ? `${color}50` : '#1e293b',
                background: isActive ? `${color}08` : '#0a0f1e',
              }}>
              <span className="text-base shrink-0">{TYPE_ICONS[scene.scene_type] || '🎨'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: isActive ? color : '#f1f5f9' }}>
                  {scene.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px]" style={{ color }}>{scene.scene_type}</span>
                  {scene.tags?.map(tag => (
                    <span key={tag} className="text-[9px] px-1 rounded bg-[#1e293b] text-[#475569]">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="flex items-center gap-0.5 text-[9px]"
                  style={{ color: STATUS_COLORS[scene.status] }}>
                  {STATUS_ICONS[scene.status]} {scene.status}
                </span>
                <button onClick={e => deleteScene(e, scene.id)} className="text-[#334155] hover:text-[#ef4444] transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}