import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Download, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AZURE_ARCHETYPES = ['Guide', 'Creator', 'Oracle', 'Challenger', 'Guardian', 'Catalyst'];

export default function TTSStudio({ character }) {
  const [text, setText] = useState('');
  const [engine, setEngine] = useState('elevenlabs'); // 'elevenlabs' | 'azure'
  const [loading, setLoading] = useState(false);
  const [audioB64, setAudioB64] = useState(null);
  const [rate, setRate] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);
  const audioRef = useRef(null);

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAudioB64(null);

    let res;
    if (engine === 'elevenlabs') {
      const voiceId = character?.locked_voice_id || 'EXAVITQu4vr4xnSDxMaL'; // default: Bella
      res = await base44.functions.invoke('elevenLabs', {
        action: 'tts',
        voice_id: voiceId,
        text,
        stability,
        similarity_boost: similarity,
      });
    } else {
      res = await base44.functions.invoke('azureSpeech', {
        text,
        archetype: character?.archetype,
        voice_id: character?.locked_voice_id || null,
        rate: `${rate > 0 ? '+' : ''}${rate}%`,
        pitch: `${pitch > 0 ? '+' : ''}${pitch}%`,
      });
    }

    setAudioB64(res.data?.audio_base64 || null);
    setLoading(false);
  };

  const play = () => {
    if (!audioB64) return;
    const blob = new Blob(
      [Uint8Array.from(atob(audioB64), c => c.charCodeAt(0))],
      { type: 'audio/mpeg' }
    );
    const url = URL.createObjectURL(blob);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  const download = () => {
    if (!audioB64) return;
    const blob = new Blob(
      [Uint8Array.from(atob(audioB64), c => c.charCodeAt(0))],
      { type: 'audio/mpeg' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${character?.name || 'voice'}_${Date.now()}.mp3`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Text to Speech</p>

      {/* Engine toggle */}
      <div className="flex gap-2">
        {['elevenlabs', 'azure'].map(e => (
          <button
            key={e}
            onClick={() => setEngine(e)}
            className="text-[10px] px-3 py-1.5 rounded-lg border font-bold transition-all"
            style={{
              borderColor: engine === e ? '#00d4aa' : '#1e293b',
              background: engine === e ? '#00d4aa15' : 'transparent',
              color: engine === e ? '#00d4aa' : '#475569',
            }}
          >
            {e === 'elevenlabs' ? '⚡ ElevenLabs' : '☁️ Azure'}
          </button>
        ))}
      </div>

      {/* Text area */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={character
          ? `Enter message for ${character.name} to speak...`
          : 'Select a character first, then type your message...'}
        rows={4}
        className="w-full rounded-xl bg-[#070b14] border border-[#1e293b] text-[#f1f5f9] text-xs p-3 resize-none focus:outline-none focus:border-[#00d4aa] transition-colors"
      />

      {/* Voice controls */}
      {engine === 'azure' ? (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Speed', value: rate, set: setRate, min: -50, max: 50, unit: '%' },
            { label: 'Pitch', value: pitch, set: setPitch, min: -50, max: 50, unit: '%' },
          ].map(({ label, value, set, min, max, unit }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[#475569]">{label}</span>
                <span className="text-[10px] text-[#00d4aa]">{value > 0 ? '+' : ''}{value}{unit}</span>
              </div>
              <input type="range" min={min} max={max} value={value}
                onChange={e => set(+e.target.value)}
                className="w-full accent-teal" style={{ accentColor: '#00d4aa' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Stability', value: stability, set: setStability, min: 0, max: 1, step: 0.01 },
            { label: 'Clarity', value: similarity, set: setSimilarity, min: 0, max: 1, step: 0.01 },
          ].map(({ label, value, set, min, max, step }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[#475569]">{label}</span>
                <span className="text-[10px] text-[#00d4aa]">{Math.round(value * 100)}%</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(+e.target.value)}
                className="w-full" style={{ accentColor: '#00d4aa' }} />
            </div>
          ))}
        </div>
      )}

      {/* Generate button */}
      <Button
        onClick={generate}
        disabled={loading || !text.trim()}
        className="w-full text-xs font-bold bg-[#00d4aa] hover:bg-[#00a88a] text-[#070b14] h-9"
      >
        {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : <Sparkles size={14} className="mr-1" />}
        {loading ? 'Generating...' : 'Generate Voice'}
      </Button>

      {/* Playback */}
      {audioB64 && (
        <div className="flex gap-2">
          <Button onClick={play} variant="outline"
            className="flex-1 text-xs border-[#00d4aa] text-[#00d4aa] hover:bg-[#00d4aa]/10 h-9">
            <Play size={13} className="mr-1" /> Play
          </Button>
          <Button onClick={download} variant="outline"
            className="flex-1 text-xs border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] h-9">
            <Download size={13} className="mr-1" /> Download
          </Button>
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}