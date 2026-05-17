import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TASK_TYPES = ['quest', 'mission', 'decree', 'prophecy', 'ritual', 'summons'];
const TASK_PROMPTS = {
  quest: "You are a mystical academy instructor. Write a short, immersive quest task (2-3 sentences) for a student of the financial arts. Make it feel ancient and purposeful.",
  mission: "Write a covert mission directive (2-3 sentences) in the voice of a strategic trading mentor. Mysterious and urgent.",
  decree: "Write an official decree (2-3 sentences) from a financial wisdom council to their student. Formal and powerful.",
  prophecy: "Write a short prophecy (2-3 sentences) about a student's financial journey. Cryptic and inspiring.",
  ritual: "Write a ritual task (2-3 sentences) that a student must perform to advance their trading wisdom. Sacred and deliberate.",
  summons: "Write a summons (2-3 sentences) calling a student to take immediate action in their learning. Direct and commanding.",
};

export default function GenerateNarrativeModal({ onGenerated, onClose }) {
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [taskType, setTaskType] = useState('quest');
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');

  useEffect(() => {
    base44.entities.BotPersona.filter({ status: 'active' }, 'name', 50).then(p => {
      setPersonas(p);
      if (p.length) setSelectedPersona(p[Math.floor(Math.random() * p.length)]);
    });
  }, []);

  const pickRandom = () => {
    if (!personas.length) return;
    setSelectedPersona(personas[Math.floor(Math.random() * personas.length)]);
  };

  const generate = async () => {
    if (!selectedPersona) return;
    setLoading(true);

    // Step 1: Generate text
    let messageText = customText.trim();
    if (!messageText) {
      setStep('Consulting the ancestors...');
      const llmRes = await base44.integrations.Core.InvokeLLM({
        prompt: `${TASK_PROMPTS[taskType]} The narrator is ${selectedPersona.name}, a ${selectedPersona.archetype} of the ${selectedPersona.school} school. Respond with ONLY the task text, no preamble.`,
        response_json_schema: { type: 'object', properties: { text: { type: 'string' }, title: { type: 'string' } } }
      });
      messageText = llmRes.text || llmRes;
      if (typeof messageText === 'object') messageText = messageText.text || 'A great task awaits you.';
    }

    // Step 2: Generate voice
    setStep('Channeling the voice...');
    const voiceId = selectedPersona.locked_voice_id || 'EXAVITQu4vr4xnSDxMaL';
    let audioB64 = null;
    try {
      const voiceRes = await base44.functions.invoke('elevenLabs', {
        action: 'tts',
        voice_id: voiceId,
        text: messageText,
        stability: 0.6,
        similarity_boost: 0.8,
      });
      audioB64 = voiceRes.data?.audio_base64 || null;
    } catch (e) {
      // voice failed, still create text message
    }

    // Step 3: Save
    setStep('Inscribing the message...');
    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    const titleOptions = ['A Message Has Arrived', 'The Ancestors Speak', 'A Task Descends', 'The Portal Opens'];
    const saved = await base44.entities.NarratedMessage.create({
      title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
      text_content: messageText,
      audio_base64: audioB64,
      narrator_persona_id: selectedPersona.id,
      narrator_name: selectedPersona.name,
      narrator_archetype: selectedPersona.archetype,
      narrator_color: selectedPersona.primary_color || '#00d4aa',
      task_type: taskType,
      expires_at: expires,
      is_completed: false,
      flagged_for_deletion: false,
    });

    setLoading(false);
    onGenerated?.(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-[#f1f5f9]">✦ Summon a Narrative</h2>
          <button onClick={onClose} className="text-[#475569] hover:text-[#f1f5f9]"><X size={16} /></button>
        </div>

        {/* Task type */}
        <div>
          <p className="text-[10px] text-[#475569] font-semibold uppercase tracking-widest mb-2">Task Type</p>
          <div className="flex flex-wrap gap-2">
            {TASK_TYPES.map(t => (
              <button key={t} onClick={() => setTaskType(t)}
                className="text-[10px] px-2 py-1 rounded-lg border capitalize transition-all"
                style={{
                  borderColor: taskType === t ? '#00d4aa' : '#1e293b',
                  color: taskType === t ? '#00d4aa' : '#475569',
                  background: taskType === t ? '#00d4aa10' : 'transparent',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Narrator */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-[#475569] font-semibold uppercase tracking-widest">Narrator</p>
            <button onClick={pickRandom} className="text-[10px] text-[#00d4aa] hover:underline">Random</button>
          </div>
          {selectedPersona && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#1e293b] bg-[#070b14]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: `${selectedPersona.primary_color || '#00d4aa'}20`, color: selectedPersona.primary_color || '#00d4aa' }}>
                {selectedPersona.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-[#f1f5f9]">{selectedPersona.name}</p>
                <p className="text-[10px] text-[#475569]">{selectedPersona.archetype} · {selectedPersona.school}</p>
              </div>
            </div>
          )}
          <select
            value={selectedPersona?.id || ''}
            onChange={e => setSelectedPersona(personas.find(p => p.id === e.target.value))}
            className="w-full mt-2 bg-[#070b14] border border-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-3 py-2"
          >
            {personas.map(p => <option key={p.id} value={p.id}>{p.name} ({p.archetype})</option>)}
          </select>
        </div>

        {/* Custom text toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)}
              className="accent-[#00d4aa]" />
            <span className="text-[11px] text-[#94a3b8]">Write custom message instead of AI-generated</span>
          </label>
          {useCustom && (
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              rows={3}
              placeholder="Enter the message to be narrated..."
              className="w-full bg-[#070b14] border border-[#1e293b] text-[#f1f5f9] text-xs rounded-xl p-3 resize-none focus:outline-none focus:border-[#00d4aa]"
            />
          )}
        </div>

        <Button onClick={generate} disabled={loading || !selectedPersona}
          className="w-full font-bold bg-[#00d4aa] hover:bg-[#00a88a] text-[#070b14] text-xs h-10">
          {loading
            ? <><Loader2 size={14} className="animate-spin mr-2" />{step}</>
            : <><Sparkles size={14} className="mr-2" />Summon Message</>}
        </Button>
      </div>
    </div>
  );
}