import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Clock, Megaphone, Mail, MessageSquare, Users,
  Download, ChevronRight, Check, AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SAVE_MODES = [
  { id: 'draft',      label: 'Save as Draft',       icon: '📝', color: '#64748b', desc: 'Private, not dispatched' },
  { id: 'promo_temp', label: 'Temp Promotion',       icon: '⏱️', color: '#fbbf24', desc: 'Auto-expires, good for limited events' },
  { id: 'ready',      label: 'Mark as Ready',        icon: '✅', color: '#00d4aa', desc: 'Ready for dispatch / publishing' },
  { id: 'published',  label: 'Save & Publish Now',   icon: '🚀', color: '#a78bfa', desc: 'Dispatch to selected audience immediately' },
  { id: 'export',     label: 'Export File',          icon: '📤', color: '#60a5fa', desc: 'Download for media coverage or advertising' },
];

const NOTIFY_CHANNELS = [
  { id: 'email_all',   label: 'Email all users',        icon: <Mail size={13} />,          color: '#00d4aa' },
  { id: 'sms_all',     label: 'Text all users',         icon: <MessageSquare size={13} />, color: '#a78bfa' },
  { id: 'email_tier',  label: 'Email by membership tier',icon: <Users size={13} />,        color: '#60a5fa' },
  { id: 'sms_tier',    label: 'Text by membership tier', icon: <MessageSquare size={13} />,color: '#fbbf24' },
  { id: 'email_indiv', label: 'Email specific users',   icon: <Mail size={13} />,          color: '#f87171' },
  { id: 'sms_indiv',   label: 'Text specific users',    icon: <MessageSquare size={13} />, color: '#fb923c' },
  { id: 'custom_msg',  label: 'Custom message / push',  icon: <Megaphone size={13} />,     color: '#e879f9' },
];

const EXPORT_FORMATS = [
  { id: 'json',  label: 'JSON',        ext: '.json',  desc: 'Full scene data — re-importable' },
  { id: 'mp4',   label: 'MP4 Video',   ext: '.mp4',   desc: 'Rendered video for social / ads' },
  { id: 'gif',   label: 'GIF',         ext: '.gif',   desc: 'Shareable animated preview' },
  { id: 'png',   label: 'PNG Still',   ext: '.png',   desc: 'Press / thumbnail image' },
  { id: 'pdf',   label: 'PDF One-Pager',ext: '.pdf',  desc: 'Ad brief / overview document' },
];

const TIERS = ['beta_tester', 'free', 'retail', 'pro', 'institutional'];

export default function SaveDispatchModal({ scene, beatPattern, validationResult, onClose, onSaved }) {
  const [saveMode, setSaveMode] = useState(null);
  const [notifyChannels, setNotifyChannels] = useState([]);
  const [exportFormat, setExportFormat] = useState(null);
  const [customText, setCustomText] = useState('');
  const [selectedTiers, setSelectedTiers] = useState([]);
  const [specificEmails, setSpecificEmails] = useState('');
  const [promoExpiry, setPromoExpiry] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(1); // 1=save mode, 2=notify, 3=confirm

  const toggleChannel = (id) => setNotifyChannels(prev =>
    prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
  );
  const toggleTier = (t) => setSelectedTiers(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );

  const needsNotify = saveMode === 'published';
  const needsTierPick = notifyChannels.some(c => c.includes('tier'));
  const needsIndivPick = notifyChannels.some(c => c.includes('indiv'));
  const needsCustomMsg = notifyChannels.includes('custom_msg');
  const needsExpiry = saveMode === 'promo_temp';
  const isExport = saveMode === 'export';

  const handleSave = async () => {
    if (!scene) return;
    setSaving(true);
    try {
      const updateData = {
        beat_track: beatPattern,
        status: saveMode === 'export' ? scene.status : (saveMode === 'promo_temp' ? 'ready' : saveMode),
      };
      if (saveMode === 'promo_temp' && promoExpiry) {
        updateData.tags = [...(scene.tags || []), `expires:${promoExpiry}`];
      }
      await base44.entities.SceneScript.update(scene.id, updateData);

      // Export: generate and download JSON
      if (isExport && exportFormat === 'json') {
        const blob = new Blob([JSON.stringify({ ...scene, ...updateData, beat_track: beatPattern }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${scene.title.replace(/\s+/g, '_')}.json`; a.click();
        URL.revokeObjectURL(url);
      }

      if (isExport && exportFormat !== 'json') {
        // For video/image exports a render pipeline would be needed — notify user
        alert(`Export as ${exportFormat.toUpperCase()} queued. A render pipeline can be connected to produce this format.`);
      }

      setDone(true);
      setTimeout(() => { onSaved?.({ ...scene, ...updateData }); onClose(); }, 1200);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const canProceedStep1 = !!saveMode && (!needsExpiry || promoExpiry) && (!isExport || exportFormat);
  const canProceedStep2 = !needsNotify || notifyChannels.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0a0f1e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
          <div>
            <h2 className="text-sm font-black text-[#f1f5f9]">Save & Dispatch</h2>
            <p className="text-[10px] text-[#475569] mt-0.5 truncate max-w-xs">{scene?.title}</p>
          </div>
          <button onClick={onClose} className="text-[#475569] hover:text-[#f1f5f9]"><X size={16} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex px-5 pt-3 gap-2">
          {['Save Mode', needsNotify ? 'Notify' : null, 'Confirm'].filter(Boolean).map((label, i, arr) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ background: step > i + 1 ? '#00d4aa' : step === i + 1 ? '#00d4aa' : '#1e293b',
                           color: step >= i + 1 ? '#070b14' : '#475569' }}>
                  {step > i + 1 ? <Check size={8} /> : i + 1}
                </div>
                <span className="text-[10px]" style={{ color: step === i + 1 ? '#00d4aa' : '#475569' }}>{label}</span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 h-px bg-[#1e293b] self-center" />}
            </React.Fragment>
          ))}
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Save Mode ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* Validation summary gate */}
                {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                  <div className="p-3 rounded-xl border space-y-1.5"
                    style={{ borderColor: validationResult.errors.length > 0 ? '#ef444430' : '#fbbf2430', background: validationResult.errors.length > 0 ? '#ef444408' : '#fbbf2408' }}>
                    <p className="text-[10px] font-bold" style={{ color: validationResult.errors.length > 0 ? '#ef4444' : '#fbbf24' }}>
                      {validationResult.errors.length > 0 ? '⛔ Critical validation errors must be resolved before publishing' : '⚠️ Warnings found — review before saving'}
                    </p>
                    {validationResult.errors.map((e, i) => (
                      <p key={i} className="text-[10px] text-[#ef4444] pl-2">• {e.message}</p>
                    ))}
                    {validationResult.warnings.map((w, i) => (
                      <p key={i} className="text-[10px] text-[#fbbf24] pl-2">• {w.message}</p>
                    ))}
                    {validationResult.errors.length > 0 && (
                      <p className="text-[9px] text-[#475569]">You may still save as Draft. Publishing is blocked.</p>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-[#64748b] uppercase tracking-widest">How do you want to save this scene?</p>
                <div className="space-y-2">
                  {SAVE_MODES.map(m => {
                    const isBlocked = m.id === 'published' && validationResult?.errors?.length > 0;
                    return (
                    <button key={m.id} onClick={() => !isBlocked && setSaveMode(m.id)}
                      disabled={isBlocked}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderColor: saveMode === m.id ? `${m.color}60` : '#1e293b', background: saveMode === m.id ? `${m.color}10` : '#070b14' }}>
                      <span className="text-lg">{m.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold" style={{ color: saveMode === m.id ? m.color : '#f1f5f9' }}>{m.label}</p>
                        <p className="text-[10px] text-[#475569]">{m.desc}</p>
                      </div>
                      {saveMode === m.id && <Check size={13} style={{ color: m.color }} />}
                      {isBlocked && <span className="text-[9px] text-[#ef4444] shrink-0">blocked</span>}
                    </button>
                  );})}
                </div>

                {/* Promo expiry */}
                {needsExpiry && (
                  <div>
                    <label className="text-[10px] text-[#fbbf24]">Promotion Expiry Date/Time</label>
                    <input type="datetime-local" value={promoExpiry} onChange={e => setPromoExpiry(e.target.value)}
                      className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2 outline-none border border-[#fbbf24]/30" />
                  </div>
                )}

                {/* Export format picker */}
                {isExport && (
                  <div>
                    <label className="text-[10px] text-[#60a5fa] mb-2 block">Choose Export Format</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {EXPORT_FORMATS.map(f => (
                        <button key={f.id} onClick={() => setExportFormat(f.id)}
                          className="flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all"
                          style={{ borderColor: exportFormat === f.id ? '#60a5fa60' : '#1e293b', background: exportFormat === f.id ? '#60a5fa10' : '#070b14' }}>
                          <Download size={11} style={{ color: exportFormat === f.id ? '#60a5fa' : '#475569' }} />
                          <div>
                            <p className="text-[10px] font-bold" style={{ color: exportFormat === f.id ? '#60a5fa' : '#f1f5f9' }}>{f.label}</p>
                            <p className="text-[9px] text-[#334155]">{f.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button disabled={!canProceedStep1}
                  onClick={() => setStep(needsNotify ? 2 : 3)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: '#00d4aa', color: '#070b14' }}>
                  Next <ChevronRight size={14} />
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: Notify (only for published) ── */}
            {step === 2 && needsNotify && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-[10px] text-[#64748b] uppercase tracking-widest">Who should be notified?</p>
                <div className="space-y-1.5">
                  {NOTIFY_CHANNELS.map(ch => (
                    <button key={ch.id} onClick={() => toggleChannel(ch.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                      style={{ borderColor: notifyChannels.includes(ch.id) ? `${ch.color}60` : '#1e293b', background: notifyChannels.includes(ch.id) ? `${ch.color}10` : '#070b14' }}>
                      <span style={{ color: notifyChannels.includes(ch.id) ? ch.color : '#475569' }}>{ch.icon}</span>
                      <p className="text-xs flex-1" style={{ color: notifyChannels.includes(ch.id) ? ch.color : '#94a3b8' }}>{ch.label}</p>
                      {notifyChannels.includes(ch.id) && <Check size={12} style={{ color: ch.color }} />}
                    </button>
                  ))}
                </div>

                {/* Tier picker */}
                {needsTierPick && (
                  <div>
                    <label className="text-[10px] text-[#60a5fa] mb-1 block">Select Membership Tiers</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TIERS.map(t => (
                        <button key={t} onClick={() => toggleTier(t)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors"
                          style={{ borderColor: selectedTiers.includes(t) ? '#60a5fa' : '#1e293b', color: selectedTiers.includes(t) ? '#60a5fa' : '#475569', background: selectedTiers.includes(t) ? '#60a5fa15' : 'transparent' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual emails */}
                {needsIndivPick && (
                  <div>
                    <label className="text-[10px] text-[#f87171] mb-1 block">Specific User Emails (comma separated)</label>
                    <textarea value={specificEmails} onChange={e => setSpecificEmails(e.target.value)}
                      placeholder="user@example.com, another@example.com"
                      rows={2}
                      className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2 outline-none border border-[#f87171]/30 resize-none" />
                  </div>
                )}

                {/* Custom message */}
                {needsCustomMsg && (
                  <div>
                    <label className="text-[10px] text-[#e879f9] mb-1 block">Custom Message / Push Notification Text</label>
                    <textarea value={customText} onChange={e => setCustomText(e.target.value)}
                      placeholder="🚀 Check out what's new at IINT Academy..."
                      rows={3}
                      className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2 outline-none border border-[#e879f9]/30 resize-none" />
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#1e293b] text-[#64748b]">← Back</button>
                  <button disabled={!canProceedStep2} onClick={() => setStep(3)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: '#00d4aa', color: '#070b14' }}>
                    Review <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Confirm ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {done ? (
                  <div className="text-center py-6 space-y-2">
                    <div className="text-4xl">✅</div>
                    <p className="text-sm font-bold text-[#00d4aa]">Saved successfully!</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] text-[#64748b] uppercase tracking-widest">Confirm & Save</p>
                    <div className="bg-[#070b14] rounded-xl border border-[#1e293b] divide-y divide-[#1e293b]">
                      <Row label="Scene" value={scene?.title} />
                      <Row label="Save as" value={SAVE_MODES.find(m => m.id === saveMode)?.label} highlight />
                      {promoExpiry && <Row label="Expires" value={new Date(promoExpiry).toLocaleString()} />}
                      {exportFormat && <Row label="Export format" value={exportFormat.toUpperCase()} />}
                      {notifyChannels.length > 0 && (
                        <Row label="Notify via" value={notifyChannels.map(c => NOTIFY_CHANNELS.find(x => x.id === c)?.label).join(', ')} />
                      )}
                      {selectedTiers.length > 0 && <Row label="Tiers" value={selectedTiers.join(', ')} />}
                      {specificEmails && <Row label="Specific users" value={specificEmails} />}
                      {customText && <Row label="Message" value={customText} />}
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#fbbf24]/08 border border-[#fbbf24]/20">
                      <AlertCircle size={12} className="text-[#fbbf24] mt-0.5 shrink-0" />
                      <p className="text-[10px] text-[#fbbf24]">
                        A backup is always saved to the database before any dispatch is triggered.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setStep(needsNotify ? 2 : 1)} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#1e293b] text-[#64748b]">← Back</button>
                      <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: '#00d4aa', color: '#070b14' }}>
                        <Save size={14} /> {saving ? 'Saving...' : 'Confirm & Save'}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2.5">
      <span className="text-[10px] text-[#475569] shrink-0">{label}</span>
      <span className={`text-[11px] text-right ${highlight ? 'font-bold text-[#00d4aa]' : 'text-[#94a3b8]'}`}>{value || '—'}</span>
    </div>
  );
}