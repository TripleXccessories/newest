import React, { useState, useEffect } from 'react';
import { Heart, AlertTriangle, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function BenevolentBenefactorForm({ profile, onSave }) {
  const [form, setForm] = useState({
    benefactor_name: '',
    benefactor_email: '',
    benefactor_phone: '',
    benefactor_relationship: '',
    benefactor_confirmed: false,
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
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isComplete = form.benefactor_name && form.benefactor_email && form.benefactor_confirmed;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-[#0f172a] border border-[#f59e0b]/20 rounded-xl">
        <Heart size={16} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
        <div className="text-xs text-[#94a3b8] leading-relaxed space-y-1">
          <p className="font-semibold text-[#f59e0b]">Benevolent Benefactor Designation</p>
          <p>
            In the event of your passing or permanent incapacitation, the person listed here will be contacted by IINT Inc. as your designated benefactor. This designation governs how your virtual account holdings are handled. See{' '}
            <Link to="/terms" className="text-[#00d4aa] underline" target="_blank">Terms &amp; Conditions §13</Link>
            {' '}for full policy details.
          </p>
          <p className="text-[#64748b]">
            This form is optional. If skipped, your emergency contact (if set) assumes this role under the same guidelines. If neither is set, IINT Inc. becomes the sole trustee after the prescribed grace periods have elapsed.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="text-xs text-[#64748b] mb-1 block">Benefactor Full Legal Name <span className="text-red-400">*</span></label>
          <input
            value={form.benefactor_name}
            onChange={e => setForm({ ...form, benefactor_name: e.target.value })}
            placeholder="Full name as it appears on legal ID"
            className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
          />
        </div>
        <div>
          <label className="text-xs text-[#64748b] mb-1 block">Benefactor Email Address <span className="text-red-400">*</span></label>
          <input
            type="email"
            value={form.benefactor_email}
            onChange={e => setForm({ ...form, benefactor_email: e.target.value })}
            placeholder="contact@email.com"
            className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
          />
        </div>
        <div>
          <label className="text-xs text-[#64748b] mb-1 block">Benefactor Phone (optional)</label>
          <input
            value={form.benefactor_phone}
            onChange={e => setForm({ ...form, benefactor_phone: e.target.value })}
            placeholder="+1 (000) 000-0000"
            className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
          />
        </div>
        <div>
          <label className="text-xs text-[#64748b] mb-1 block">Relationship to You</label>
          <select
            value={form.benefactor_relationship}
            onChange={e => setForm({ ...form, benefactor_relationship: e.target.value })}
            className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]"
          >
            <option value="">Select relationship...</option>
            <option value="spouse">Spouse / Partner</option>
            <option value="parent">Parent</option>
            <option value="child">Child</option>
            <option value="sibling">Sibling</option>
            <option value="legal_representative">Legal Representative / Executor</option>
            <option value="friend">Trusted Friend</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Agreement checkbox */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-[#f1f5f9]">Benefactor Agreement — Read Before Confirming</p>
        <ul className="text-xs text-[#64748b] leading-relaxed space-y-1.5 list-disc list-inside">
          <li>The person listed will be contacted by IINT Inc. in the event of your reported passing or permanent incapacitation.</li>
          <li>Any funds held in your account will be frozen for a 12-month grace period from the date of confirmed notification.</li>
          <li>During the grace period, a legally witnessed will or estate document specifically referencing this platform will take precedence over this form.</li>
          <li>If no such document is produced within 12 months, the named benefactor herein becomes the designated recipient of any residual virtual holdings at time of conversion to real funds.</li>
          <li>Changes to this form are timestamped and override any unlisted estate claims where this platform is not specifically named in the will.</li>
          <li>IINT Inc. reserves the right to request proof of death certificate and identity verification from the claimant before releasing any funds.</li>
          <li>By confirming, you accept these terms as a binding supplement to the IINT Terms &amp; Conditions.</li>
        </ul>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.benefactor_confirmed}
            onChange={e => setForm({ ...form, benefactor_confirmed: e.target.checked })}
            className="mt-0.5 accent-[#00d4aa]"
          />
          <span className="text-xs text-[#94a3b8]">
            I acknowledge and agree to the Benevolent Benefactor Agreement as described above and as further detailed in the{' '}
            <Link to="/terms" target="_blank" className="text-[#00d4aa] underline">IINT Terms &amp; Conditions</Link>.
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!isComplete || saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold hover:bg-[#00d4aa]/90 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Saving...' : saved ? <><CheckCircle size={14} /> Saved!</> : <><Heart size={14} /> Save Benefactor</>}
        </button>
      </div>

      {/* Footer doc note */}
      <div className="border-t border-[#1e293b] pt-4 mt-2">
        <p className="text-[10px] text-[#334155] leading-relaxed">
          <span className="text-[#475569] font-semibold">How IINT Handles Inactive &amp; Deceased Accounts:</span>{' '}
          Accounts with no login activity for 12+ months will receive a reactivation notice to the registered email and emergency contact (if set). Accounts confirmed as belonging to a deceased user are subject to the Benevolent Benefactor Policy. The 12-month trust hold begins from the date of IINT's first written confirmation of the reported passing. A 4-month sub-window is given for any existing but un-updated estate or will to be amended to include this platform. After the full 12-month period with no verified claim or legal document produced, holdings transfer to the designated benefactor on this form, or if none designated, to the IINT Community Trust. IINT Inc. may, at its sole discretion, use unclaimed funds for platform development, charitable donation in the user's name based on any indicated admiration or stated interests found in their account activity, or other purposes as deemed appropriate and respectful. All such decisions are made with due consideration for the user's history and character. This policy constitutes part of the Terms &amp; Conditions agreed to upon continued use of the platform.{' '}
          <Link to="/terms" target="_blank" className="text-[#00d4aa] underline inline-flex items-center gap-0.5">
            Read full Terms <ExternalLink size={9} />
          </Link>
        </p>
      </div>
    </div>
  );
}