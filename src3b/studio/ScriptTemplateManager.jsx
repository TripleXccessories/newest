import React, { useState } from 'react';
import { Save, Trash2, Download, Check } from 'lucide-react';

export default function ScriptTemplateManager({ templates, onLoad, onDelete, onSave, currentParams }) {
  const [newName, setNewName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!newName.trim()) return;
    onSave(newName.trim());
    setSaved(true);
    setNewName('');
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="bg-[#0a0f1e] border border-[#fbbf24]/20 rounded-2xl p-4 space-y-3">
      <p className="text-xs font-bold text-[#fbbf24]">📋 Parameter Templates</p>

      {/* Save current */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Template name e.g. Kindergarten Playful"
          className="flex-1 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2 outline-none"
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <button onClick={handleSave} disabled={!newName.trim()}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
          style={{ background: saved ? '#00d4aa20' : '#fbbf2420', color: saved ? '#00d4aa' : '#fbbf24' }}>
          {saved ? <Check size={11} /> : <Save size={11} />}
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* Template list */}
      {templates.length === 0 ? (
        <p className="text-[10px] text-[#334155]">No templates saved yet. Configure parameters and save above.</p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {templates.map(t => (
            <div key={t.name} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#070b14] border border-[#1e293b]">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#94a3b8] truncate">{t.name}</p>
                <p className="text-[9px] text-[#475569]">{t.school_level} · {t.category}</p>
              </div>
              <button onClick={() => onLoad(t)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-[#00d4aa]/10 text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-colors">
                <Download size={9} /> Load
              </button>
              <button onClick={() => onDelete(t.name)}
                className="text-[#334155] hover:text-[#ef4444] transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}