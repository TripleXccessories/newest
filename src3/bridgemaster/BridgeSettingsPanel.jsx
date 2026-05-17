import React, { useState } from 'react';
import { X, Eye, Globe, Wifi, Bluetooth, Save, Brain } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const VOICES = [
  { id: 'male_young', label: 'Young Male', age: '20s', lang: 'en' },
  { id: 'male_mid', label: 'Mid Male', age: '40s', lang: 'en' },
  { id: 'male_senior', label: 'Senior Male', age: '60s', lang: 'en' },
  { id: 'female_young', label: 'Young Female', age: '20s', lang: 'en' },
  { id: 'female_mid', label: 'Mid Female', age: '40s', lang: 'en' },
  { id: 'female_senior', label: 'Senior Female', age: '60s', lang: 'en' },
];

const COLORBLIND_MODES = [
  { id: 'none', label: 'Standard' },
  { id: 'protanopia', label: 'Protanopia (Red-blind)' },
  { id: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
  { id: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
  { id: 'high_contrast', label: 'High Contrast' },
];

function Toggle({ on, onToggle, color = '#00d4aa' }) {
  return (
    <button onClick={onToggle}
      className="w-10 h-5 rounded-full relative transition-all duration-200 shrink-0"
      style={{ background: on ? color : '#1e293b' }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
        style={{ left: on ? '22px' : '2px' }} />
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2">
        <Icon size={12} className="text-[#00d4aa]" />
        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Row({ label, sublabel, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs text-[#f1f5f9]">{label}</p>
        {sublabel && <p className="text-[9px] text-[#475569]">{sublabel}</p>}
      </div>
      {children}
    </div>
  );
}

export default function BridgeSettingsPanel({ settings, onChange, onClose }) {
  const set = (key, val) => onChange({ ...settings, [key]: val });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(3,5,8,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-3xl border border-[#1e293b] bg-[#0a0f1e] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
          <div>
            <p className="text-sm font-black text-[#f1f5f9]">Bridge Settings</p>
            <p className="text-[9px] text-[#475569]">Customize your experience</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#111827] flex items-center justify-center hover:bg-[#1e293b]">
            <X size={14} className="text-[#64748b]" />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto max-h-[75vh]">

          {/* Language */}
          <Section title="Language & Voice" icon={Globe}>
            <Row label="Interface Language">
              <select value={settings.language} onChange={e => set('language', e.target.value)}
                className="bg-[#111827] border border-[#1e293b] rounded-lg px-2 py-1 text-xs text-[#f1f5f9] outline-none">
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </Row>
            <Row label="AI Voice Narrator" sublabel="Voice guides and responses">
              <Toggle on={settings.voiceNarration} onToggle={() => set('voiceNarration', !settings.voiceNarration)} />
            </Row>
            <Row label="Default Voice">
              <select value={settings.voiceId} onChange={e => set('voiceId', e.target.value)}
                className="bg-[#111827] border border-[#1e293b] rounded-lg px-2 py-1 text-xs text-[#f1f5f9] outline-none">
                {VOICES.map(v => (
                  <option key={v.id} value={v.id}>{v.label} ({v.age})</option>
                ))}
              </select>
            </Row>
            <Row label="Match Voice to Language" sublabel="Auto-select native accent">
              <Toggle on={settings.voiceMatchLanguage} onToggle={() => set('voiceMatchLanguage', !settings.voiceMatchLanguage)} />
            </Row>
          </Section>

          {/* Accessibility */}
          <Section title="Accessibility" icon={Eye}>
            <Row label="Color Blind Mode">
              <select value={settings.colorblindMode} onChange={e => set('colorblindMode', e.target.value)}
                className="bg-[#111827] border border-[#1e293b] rounded-lg px-2 py-1 text-xs text-[#f1f5f9] outline-none">
                {COLORBLIND_MODES.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </Row>
            <Row label="Large Text Mode">
              <Toggle on={settings.largeText} onToggle={() => set('largeText', !settings.largeText)} />
            </Row>
          </Section>

          {/* Connection */}
          <Section title="Connection & Network" icon={Wifi}>
            <Row label="Search via WiFi" sublabel="Uses device data — carrier may charge">
              <Toggle on={settings.wifiSearch} onToggle={() => set('wifiSearch', !settings.wifiSearch)} />
            </Row>
            <Row label="Search via Bluetooth" sublabel="Short range booster detection">
              <Toggle on={settings.bluetoothSearch} onToggle={() => set('bluetoothSearch', !settings.bluetoothSearch)} />
            </Row>
            <Row label="Hide My Device" sublabel="Invisible to outside scanners (recommended)">
              <Toggle on={settings.hideDevice} onToggle={() => set('hideDevice', !settings.hideDevice)} color="#f59e0b" />
            </Row>
            <Row label="Data Saver Mode" sublabel="Text only — no voice streaming">
              <Toggle on={settings.dataSaver} onToggle={() => set('dataSaver', !settings.dataSaver)} />
            </Row>
          </Section>

          {/* AI Behavior */}
          <Section title="AI Behavior" icon={Brain}>
            <Row label="Mood / Attitude Sensing" sublabel="AI detects and matches your tone">
              <Toggle on={settings.moodSensing} onToggle={() => set('moodSensing', !settings.moodSensing)} color="#a78bfa" />
            </Row>
            <Row label="Attitude Mirror" sublabel='"This is how you spoke to me last"'>
              <Toggle on={settings.attitudeMirror} onToggle={() => set('attitudeMirror', !settings.attitudeMirror)} color="#fb7185" />
            </Row>
            <Row label="Memory Bank" sublabel="Continued conversations across sessions">
              <Toggle on={settings.memoryBank} onToggle={() => set('memoryBank', !settings.memoryBank)} color="#00d4aa" />
            </Row>
          </Section>

          {/* Transcription */}
          <Section title="Transcription & Save" icon={Save}>
            <Row label="Auto-Save Transcripts" sublabel="Saved automatically on session end">
              <Toggle on={settings.autoSave} onToggle={() => set('autoSave', !settings.autoSave)} />
            </Row>
            <Row label="Prompt to Save on Close" sublabel='Shows "Save As" dialog before closing'>
              <Toggle on={settings.promptSaveOnClose} onToggle={() => set('promptSaveOnClose', !settings.promptSaveOnClose)} />
            </Row>
          </Section>

        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-black transition-all hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #007a62)', color: '#030508' }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}