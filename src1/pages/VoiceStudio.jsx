import React, { useState } from 'react';
import { Mic, Wand2, Radio } from 'lucide-react';
import CharacterVoicePicker from '@/components/voicestudio/CharacterVoicePicker';
import TTSStudio from '@/components/voicestudio/TTSStudio';
import VoiceChangerStudio from '@/components/voicestudio/VoiceChangerStudio';

const TABS = [
  { id: 'tts', label: 'Text to Speech', icon: Wand2 },
  { id: 'changer', label: 'Voice Changer', icon: Mic },
];

export default function VoiceStudio() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [activeTab, setActiveTab] = useState('tts');

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
          <Radio size={20} className="text-[#00d4aa]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#f1f5f9]">Voice Studio</h1>
          <p className="text-xs text-[#475569]">Generate & transform voices using your Faculty characters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        {/* Character picker */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4">
          <CharacterVoicePicker
            selected={selectedCharacter}
            onSelect={setSelectedCharacter}
          />
        </div>

        {/* Studio panel */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-[#1e293b] pb-3">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                  style={{
                    background: active ? '#00d4aa15' : 'transparent',
                    color: active ? '#00d4aa' : '#475569',
                    borderBottom: active ? '2px solid #00d4aa' : '2px solid transparent',
                  }}
                >
                  <Icon size={12} /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'tts' && <TTSStudio character={selectedCharacter} />}
          {activeTab === 'changer' && <VoiceChangerStudio character={selectedCharacter} />}
        </div>
      </div>
    </div>
  );
}