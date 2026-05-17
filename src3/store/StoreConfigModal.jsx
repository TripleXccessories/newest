import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * StoreConfigModal — Admin-only modal for editing the tip jar and today's specials.
 */
export default function StoreConfigModal({ isOpen, onClose, onSaved }) {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    base44.entities.StoreConfig.filter({ config_key: 'main' }).then(([c]) => {
      if (c) {
        setConfig(c);
      } else {
        setConfig({
          config_key: 'main',
          tip_jar_title: 'Tips for Development & Cooler Features',
          tip_jar_message: '',
          tip_jar_paypal_url: '',
          tip_jar_qr_image_url: '',
          tip_presets: [2, 5, 10, 20],
          specials: [],
          is_active: true,
        });
      }
    });
  }, [isOpen]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    if (config.id) {
      await base44.entities.StoreConfig.update(config.id, config);
    } else {
      await base44.entities.StoreConfig.create(config);
    }
    setSaving(false);
    onSaved?.();
    onClose();
  };

  const updateField = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const addSpecial = () => updateField('specials', [...(config.specials || []), { label: '', description: '', price: '', badge: '' }]);
  const removeSpecial = (i) => updateField('specials', config.specials.filter((_, idx) => idx !== i));
  const updateSpecial = (i, key, val) => {
    const next = [...config.specials];
    next[i] = { ...next[i], [key]: val };
    updateField('specials', next);
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-3xl border border-[#1e293b] overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: '#0a0f1e' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-[#0a0f1e] border-b border-[#1e293b] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-sm font-black text-[#f1f5f9]">🏪 Store Config</p>
            <p className="text-[9px] text-[#475569]">Admin only — tip jar + today's specials</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center">
            <X size={12} className="text-[#64748b]" />
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* Tip Jar */}
          <section className="space-y-3">
            <p className="text-[10px] font-black text-[#fbbf24] uppercase tracking-widest">🫙 Tip Jar</p>

            <div className="space-y-2">
              <label className="text-[9px] text-[#475569] uppercase font-bold">Jar Title / Purpose</label>
              <input
                value={config.tip_jar_title || ''}
                onChange={e => updateField('tip_jar_title', e.target.value)}
                placeholder="Tips for Development & Cooler Features"
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-[#f1f5f9] outline-none focus:border-[#fbbf24]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-[#475569] uppercase font-bold">Message (holiday, thank-you, etc.)</label>
              <textarea
                value={config.tip_jar_message || ''}
                onChange={e => updateField('tip_jar_message', e.target.value)}
                placeholder="Every tip goes towards building a better experience..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-[#f1f5f9] outline-none resize-none focus:border-[#fbbf24]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-[#475569] uppercase font-bold">PayPal URL</label>
              <input
                value={config.tip_jar_paypal_url || ''}
                onChange={e => updateField('tip_jar_paypal_url', e.target.value)}
                placeholder="https://paypal.me/yourusername"
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-[#f1f5f9] outline-none focus:border-[#fbbf24]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-[#475569] uppercase font-bold">QR Code Image URL</label>
              <input
                value={config.tip_jar_qr_image_url || ''}
                onChange={e => updateField('tip_jar_qr_image_url', e.target.value)}
                placeholder="https://... (upload QR image and paste URL)"
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-[#f1f5f9] outline-none focus:border-[#fbbf24]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-[#475569] uppercase font-bold">Preset Amounts (comma separated)</label>
              <input
                value={(config.tip_presets || []).join(', ')}
                onChange={e => {
                  const nums = e.target.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                  updateField('tip_presets', nums);
                }}
                placeholder="2, 5, 10, 20"
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-[#f1f5f9] outline-none focus:border-[#fbbf24]/40"
              />
            </div>
          </section>

          {/* Today's Specials */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest">📋 Today's Specials</p>
              <button onClick={addSpecial}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10">
                <Plus size={9} /> Add Item
              </button>
            </div>

            {(config.specials || []).length === 0 && (
              <p className="text-[10px] text-[#334155] italic">No specials yet. Click Add Item above.</p>
            )}

            {(config.specials || []).map((item, i) => (
              <div key={i} className="p-3 rounded-xl border border-[#1e293b] bg-[#111827] space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-[#64748b]">Special #{i + 1}</p>
                  <button onClick={() => removeSpecial(i)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#ef4444]/20">
                    <Trash2 size={10} className="text-[#ef4444]" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={item.label} onChange={e => updateSpecial(i, 'label', e.target.value)} placeholder="Name"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0a0f1e] border border-[#1e293b] text-[10px] text-[#f1f5f9] outline-none" />
                  <input value={item.price} onChange={e => updateSpecial(i, 'price', e.target.value)} placeholder="$0.00"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0a0f1e] border border-[#1e293b] text-[10px] text-[#f1f5f9] outline-none" />
                  <input value={item.badge} onChange={e => updateSpecial(i, 'badge', e.target.value)} placeholder="🔥 Badge text"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0a0f1e] border border-[#1e293b] text-[10px] text-[#f1f5f9] outline-none" />
                  <input value={item.description} onChange={e => updateSpecial(i, 'description', e.target.value)} placeholder="Description"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0a0f1e] border border-[#1e293b] text-[10px] text-[#f1f5f9] outline-none" />
                </div>
              </div>
            ))}
          </section>

          {/* Save */}
          <button onClick={save} disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: '#00d4aa', color: '#070b14' }}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Config'}
          </button>
        </div>
      </div>
    </div>
  );
}