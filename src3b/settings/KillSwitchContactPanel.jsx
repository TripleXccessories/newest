import React, { useState } from 'react';
import { AlertTriangle, Phone, CheckCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const SCENARIOS = [
  { value: '1', label: 'Terminally ill — I am aware and have limited time remaining.' },
  { value: '2', label: 'Unavailable — detained, hospitalized, or without device access.' },
  { value: '3', label: 'Permanently deceased or in an unexpected recovery state.' },
];

export default function KillSwitchContactPanel({ profile, onSave }) {
  const [emergencyEmail, setEmergencyEmail] = useState(profile?.emergency_contact_email || '');
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(profile?.kill_switch_enabled ?? true);
  const [threshold, setThreshold] = useState(profile?.kill_switch_threshold_pct || 49);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simulate the outreach flow preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [previewConfirmed, setPreviewConfirmed] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      emergency_contact_email: emergencyEmail,
      kill_switch_enabled: killSwitchEnabled,
      kill_switch_threshold_pct: threshold,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const fakeSavedPct = Math.max(0, 100 - threshold).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Emergency contact */}
      <div>
        <label className="text-xs text-[#64748b] mb-1 block">Emergency Contact Email</label>
        <input
          type="email"
          value={emergencyEmail}
          onChange={e => setEmergencyEmail(e.target.value)}
          placeholder="Trusted person's email address"
          className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
        />
        <p className="text-[10px] text-[#475569] mt-1">
          This contact receives a structured check-in if our system detects unusual inactivity or a kill switch event. They also serve as your default Benevolent Benefactor if no separate benefactor is designated.
        </p>
      </div>

      {/* Kill switch settings */}
      <div className="bg-[#0f172a] border border-[#ef4444]/20 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-[#ef4444]" />
          <p className="text-sm font-semibold text-[#f1f5f9]">ARM Kill Switch Settings</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#94a3b8]">Kill Switch Active</p>
            <p className="text-[10px] text-[#475569]">Auto-liquidate when equity drops below threshold</p>
          </div>
          <button
            onClick={() => setKillSwitchEnabled(v => !v)}
            className={`relative w-10 h-5 rounded-full transition-colors ${killSwitchEnabled ? 'bg-[#ef4444]' : 'bg-[#1e293b]'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${killSwitchEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div>
          <label className="text-xs text-[#64748b] mb-1 block">Loss Threshold: <span className="text-[#ef4444] font-semibold">{threshold}%</span></label>
          <input
            type="range"
            min={10} max={90} step={1}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="w-full accent-[#ef4444]"
          />
          <div className="flex justify-between text-[10px] text-[#475569] mt-0.5">
            <span>10% (Conservative)</span>
            <span>90% (Aggressive)</span>
          </div>
        </div>
      </div>

      {/* Emergency outreach preview */}
      <div className="border border-[#1e293b] rounded-xl overflow-hidden">
        <button
          onClick={() => { setShowPreview(v => !v); setPreviewStep(0); setSelectedScenario(null); setPreviewConfirmed(false); }}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] text-left hover:bg-[#111827] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-[#f59e0b]" />
            <span className="text-xs font-semibold text-[#f1f5f9]">Preview Emergency Contact Outreach Flow</span>
          </div>
          <span className="text-[10px] text-[#475569]">{showPreview ? 'Hide' : 'Show'}</span>
        </button>

        {showPreview && (
          <div className="px-4 py-4 bg-[#070b14] space-y-4">
            {previewStep === 0 && (
              <div className="space-y-3">
                <p className="text-[10px] text-[#475569] italic">This is an example of what your emergency contact would receive via email/SMS:</p>
                <div className="bg-[#0f172a] border border-[#f59e0b]/20 rounded-xl p-4 text-xs text-[#94a3b8] leading-relaxed space-y-2">
                  <p className="font-semibold text-[#f1f5f9]">URGENT: IINT Platform — Emergency Account Check-In</p>
                  <p>Hello,</p>
                  <p>
                    You are listed as an emergency contact for <span className="text-[#00d4aa] font-semibold">[User Full Name]</span> on the IINT trading platform. We have detected a Kill Switch event on their account and are reaching out to you as their designated contact.
                  </p>
                  <p className="font-semibold text-[#f59e0b]">Please reply with one of the following to confirm their status:</p>
                  <div className="space-y-1 pl-2">
                    <p>1️⃣ — They are terminally ill and have limited time remaining.</p>
                    <p>2️⃣ — They are temporarily unavailable (detained, hospitalized, or without device access).</p>
                    <p>3️⃣ — They have permanently passed away or are in an unexpected unrecoverable state.</p>
                  </div>
                  <p className="text-[#475569]">If none of these apply, you may disregard this message. The account holder can resolve this directly by logging in.</p>
                </div>
                <button
                  onClick={() => setPreviewStep(1)}
                  className="text-xs text-[#00d4aa] underline"
                >
                  → See what happens after a reply is received
                </button>
              </div>
            )}

            {previewStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-[#94a3b8]">Contact selects a reply scenario:</p>
                <div className="space-y-2">
                  {SCENARIOS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedScenario(s.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs border transition-all ${
                        selectedScenario === s.value
                          ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-[#f1f5f9]'
                          : 'border-[#1e293b] text-[#64748b] hover:border-[#475569]'
                      }`}
                    >
                      <span className="font-bold mr-2">{s.value}.</span>{s.label}
                    </button>
                  ))}
                </div>
                {selectedScenario && !previewConfirmed && (
                  <button
                    onClick={() => setPreviewConfirmed(true)}
                    className="w-full py-2 bg-[#00d4aa] text-[#070b14] rounded-xl text-xs font-bold"
                  >
                    Submit Selection
                  </button>
                )}
                {previewConfirmed && (
                  <div className="bg-[#0f172a] border border-[#00d4aa]/30 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#00d4aa] font-semibold">
                      <CheckCircle size={13} /> Kill Switch Confirmed &amp; Activated
                    </div>
                    {selectedScenario === '3' ? (
                      <p className="text-[#94a3b8] leading-relaxed">
                        Account holdings have been secured. <span className="text-[#00d4aa] font-bold">{fakeSavedPct}%</span> of total account equity was preserved at time of activation. Please contact IINT Inc. at <span className="text-[#00d4aa]">admin@iint.com</span> with documentation (proof of passing, identity verification) to begin the benefactor claims process. Account will remain frozen during the verification period.
                      </p>
                    ) : selectedScenario === '2' ? (
                      <p className="text-[#94a3b8] leading-relaxed">
                        Account has been suspended and protected. <span className="text-[#00d4aa] font-bold">{fakeSavedPct}%</span> of equity has been secured. The account holder may restore access by logging in directly once they are available. No funds will be released to any party during a temporary unavailability status.
                      </p>
                    ) : (
                      <p className="text-[#94a3b8] leading-relaxed">
                        Account preserved with <span className="text-[#00d4aa] font-bold">{fakeSavedPct}%</span> equity secured. IINT's care team has been notified. Please contact <span className="text-[#00d4aa]">admin@iint.com</span> for support resources and next steps.
                      </p>
                    )}
                    <p className="text-[10px] text-[#475569] italic">Note: No currency values are disclosed to contacts. Only equity percentage preserved is communicated.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold hover:bg-[#00d4aa]/90 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving...' : saved ? <><CheckCircle size={14} /> Saved!</> : <><Shield size={14} /> Save Emergency Settings</>}
      </button>
    </div>
  );
}