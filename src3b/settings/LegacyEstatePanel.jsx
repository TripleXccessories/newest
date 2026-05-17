import React, { useState, useEffect } from 'react';
import { Scroll, Heart, Phone, AlertTriangle, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const SUBSECTIONS = [
  { id: 'benefactor', label: 'Benevolent Benefactor', icon: Heart, color: '#f59e0b' },
  { id: 'emergency', label: 'Emergency Contact', icon: Phone, color: '#ef4444' },
  { id: 'policy', label: 'Estate Policy Summary', icon: Scroll, color: '#64748b' },
];

export default function LegacyEstatePanel({ profile, onSave }) {
  const [open, setOpen] = useState('benefactor');
  const [form, setForm] = useState({
    benefactor_name: '',
    benefactor_email: '',
    benefactor_phone: '',
    benefactor_relationship: '',
    benefactor_confirmed: false,
    emergency_contact_email: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        benefactor_name: profile.benefactor_name || '',
        benefactor_email: profile.benefactor_email || '',
        benefactor_phone: profile.benefactor_phone || '',
        benefactor_relationship: profile.benefactor_relationship || '',
        benefactor_confirmed: profile.benefactor_confirmed || false,
        emergency_contact_email: profile.emergency_contact_email || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, benefactor_updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="text-xs text-[#64748b] mb-1 block">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
        form.benefactor_confirmed
          ? 'bg-[#00d4aa]/10 border-[#00d4aa]/20 text-[#00d4aa]'
          : 'bg-[#f59e0b]/10 border-[#f59e0b]/20 text-[#f59e0b]'
      }`}>
        {form.benefactor_confirmed
          ? <><CheckCircle size={13} /> Benevolent Benefactor designated and confirmed.</>
          : <><AlertTriangle size={13} /> No confirmed benefactor on file. Your emergency contact will be used as default.</>
        }
      </div>

      {SUBSECTIONS.map(({ id, label, icon: Icon, color }) => (
        <div key={id} className="border border-[#1e293b] rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpen(open === id ? null : id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111827] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon size={14} style={{ color }} />
              <span className="text-sm font-semibold text-[#f1f5f9]">{label}</span>
              {id === 'benefactor' && form.benefactor_name && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                  {form.benefactor_name}
                </span>
              )}
              {id === 'emergency' && form.emergency_contact_email && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444]">Set</span>
              )}
            </div>
            {open === id ? <ChevronUp size={14} className="text-[#475569]" /> : <ChevronDown size={14} className="text-[#475569]" />}
          </button>

          {open === id && (
            <div className="px-4 pb-4 space-y-4 border-t border-[#1e293b] pt-4">
              {id === 'benefactor' && (
                <>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    In the event of your passing or permanent incapacitation, this person receives your account's estate. See{' '}
                    <Link to="/terms" target="_blank" className="text-[#00d4aa] underline">Terms §13–14</Link> for full policy.
                  </p>
                  <div className="grid gap-3">
                    {field('Full Legal Name *', 'benefactor_name', 'text', 'As it appears on government ID')}
                    {field('Email Address *', 'benefactor_email', 'email', 'benefactor@email.com')}
                    {field('Phone (optional)', 'benefactor_phone', 'tel', '+1 (000) 000-0000')}
                    <div>
                      <label className="text-xs text-[#64748b] mb-1 block">Relationship to You</label>
                      <select
                        value={form.benefactor_relationship}
                        onChange={e => setForm({ ...form, benefactor_relationship: e.target.value })}
                        className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]"
                      >
                        <option value="">Select...</option>
                        {['Spouse / Partner', 'Parent', 'Child', 'Sibling', 'Legal Representative / Executor', 'Trusted Friend', 'Other'].map(r => (
                          <option key={r} value={r.toLowerCase().replace(/\s+/g, '_')}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-[#f1f5f9] mb-2">Benefactor Agreement Summary</p>
                    <ul className="text-[10px] text-[#64748b] space-y-1 list-disc list-inside leading-relaxed">
                      <li>12-month trust hold from date of confirmed passing notification</li>
                      <li>A legally witnessed will naming this platform overrides this form during the hold</li>
                      <li>4-month sub-window for estate to be updated after the hold begins</li>
                      <li>After grace periods: holdings transfer to this benefactor</li>
                      <li>All changes timestamped and legally binding per continued platform use</li>
                    </ul>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.benefactor_confirmed}
                      onChange={e => setForm({ ...form, benefactor_confirmed: e.target.checked })}
                      className="mt-0.5 accent-[#00d4aa]"
                    />
                    <span className="text-xs text-[#94a3b8]">
                      I acknowledge the Benevolent Benefactor Agreement as detailed in{' '}
                      <Link to="/terms" target="_blank" className="text-[#00d4aa] underline">Terms §13–14</Link>.
                    </span>
                  </label>
                </>
              )}

              {id === 'emergency' && (
                <>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Your emergency contact receives the structured check-in when a Kill Switch event occurs and no login has been detected. If no separate benefactor is designated, this contact assumes that role under the same guidelines.
                  </p>
                  {field('Emergency Contact Email', 'emergency_contact_email', 'email', 'trusted-person@email.com')}
                  <div className="text-[10px] text-[#475569] bg-[#0f172a] rounded-xl p-3 leading-relaxed">
                    <p className="font-semibold text-[#64748b] mb-1">What they will receive:</p>
                    <p>A structured email asking them to confirm your status via 3 options:</p>
                    <p className="mt-1 pl-2">1️⃣ Terminally ill · 2️⃣ Temporarily unavailable · 3️⃣ Permanently deceased</p>
                    <p className="mt-1">Upon reply, the Kill Switch activates and they receive a % equity preservation summary (no currency value disclosed).</p>
                  </div>
                </>
              )}

              {id === 'policy' && (
                <div className="text-xs text-[#64748b] leading-relaxed space-y-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#94a3b8]">Priority Order of Claims</p>
                    <p>1. Legally witnessed will naming this platform</p>
                    <p>2. Named Benevolent Benefactor (this form)</p>
                    <p>3. Emergency Contact on file (if no benefactor)</p>
                    <p>4. IINT Inc. as trustee (if none of the above)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#94a3b8]">IINT Inc. as Trustee</p>
                    <p>Unclaimed funds may be donated in your name (based on your account activity and interests), used for platform development, or other purposes deemed respectful and appropriate.</p>
                  </div>
                  <Link to="/terms" target="_blank" className="inline-flex items-center gap-1 text-[#00d4aa] underline">
                    Read full Terms §13–14 <ExternalLink size={10} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold hover:bg-[#00d4aa]/90 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving...' : saved ? <><CheckCircle size={14} /> Saved!</> : <><Scroll size={14} /> Save Legacy Settings</>}
      </button>

      <p className="text-[10px] text-[#334155] leading-relaxed">
        All changes to this form are timestamped and logged. The most recent confirmed designation overrides previous versions and any unlisted estate claims where this platform is not specifically named in a will. Continued use of the IINT platform constitutes agreement to these terms as a binding supplement.
      </p>
    </div>
  );
}