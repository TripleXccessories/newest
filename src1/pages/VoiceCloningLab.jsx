import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Mic, Upload, Play, Pause, CheckCircle, Loader2, Sliders, Trash2, ChevronLeft, Volume2, Wand2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const FACULTY = [
  'Da Feathered Sage', 'Da PrEAChEr', 'The Architect', 'The Oracle',
  'The Challenger', 'The Guardian', 'The Catalyst', 'The Strategist',
  'The Analyst', 'The Creator', 'The Mentor', 'The Pioneer',
  'The Sage', 'The Warrior', 'The Healer', 'The Mystic',
  'The Commander', 'The Visionary',
];

function VoiceAdjuster({ settings, onChange }) {
  return (
    <div className="space-y-3 p-4 rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/05">
      <p className="text-[10px] font-mono text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
        <Sliders size={10} /> Voice Adjuster
      </p>
      {[
        { key: 'stability', label: 'Stability', min: 0, max: 1, step: 0.05 },
        { key: 'similarity_boost', label: 'Similarity', min: 0, max: 1, step: 0.05 },
        { key: 'style', label: 'Style Exaggeration', min: 0, max: 1, step: 0.05 },
      ].map(({ key, label, min, max, step }) => (
        <div key={key}>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-[#94a3b8]">{label}</span>
            <span className="text-[10px] font-mono text-[#f59e0b]">{settings[key]?.toFixed(2)}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={settings[key]}
            onChange={e => onChange({ ...settings, [key]: parseFloat(e.target.value) })}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#f59e0b' }}
          />
        </div>
      ))}
    </div>
  );
}

export default function VoiceCloningLab() {
  const [personas, setPersonas] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [clonedVoices, setClonedVoices] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [testText, setTestText] = useState('Welcome to the IINT Academy. I am your guide.');
  const [previewAudio, setPreviewAudio] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({ stability: 0.5, similarity_boost: 0.75, style: 0 });
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    base44.entities.BotPersona.list().then(setPersonas).catch(() => setPersonas([]));
  }, []);

  const allChars = personas.length ? personas.map(p => p.name) : FACULTY;

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files].slice(0, 5));
  };

  const handleClone = async () => {
    if (!selectedChar || uploadedFiles.length === 0) return;
    setLoading(true);
    setStatus('Uploading samples...');
    try {
      const urls = [];
      for (const file of uploadedFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      setStatus('Cloning voice with ElevenLabs...');
      const res = await base44.functions.invoke('elevenLabs', {
        action: 'clone_voice',
        name: `IINT_${selectedChar.replace(/\s+/g, '_')}`,
        description: `Voice clone for ${selectedChar} — IINT Faculty`,
        file_urls: urls,
      });
      if (res.data?.voice_id) {
        setClonedVoices(prev => ({ ...prev, [selectedChar]: res.data.voice_id }));
        // Save voice_id back to persona if found
        const persona = personas.find(p => p.name === selectedChar);
        if (persona) {
          await base44.entities.BotPersona.update(persona.id, { locked_voice_id: res.data.voice_id });
        }
        setStatus(`✓ Voice cloned! ID: ${res.data.voice_id}`);
        setUploadedFiles([]);
      } else {
        setStatus('Clone failed: ' + (res.data?.error || 'Unknown error'));
      }
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handlePreview = async () => {
    const voiceId = clonedVoices[selectedChar];
    if (!voiceId || !testText) return;
    setLoading(true);
    setStatus('Generating preview...');
    try {
      const res = await base44.functions.invoke('elevenLabs', {
        action: 'tts',
        voice_id: voiceId,
        text: testText,
        ...voiceSettings,
      });
      if (res.data?.audio_base64) {
        const src = `data:audio/mpeg;base64,${res.data.audio_base64}`;
        setPreviewAudio(src);
        setStatus('Preview ready — hit play');
      }
    } catch (err) {
      setStatus('Preview error: ' + err.message);
    }
    setLoading(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#f59e0b]/20 px-6 py-3 flex items-center gap-3 bg-[#030508]/95 backdrop-blur-sm sticky top-0 z-20">
        <Link to="/mission-control" className="w-7 h-7 rounded-lg bg-[#1a1200] border border-[#f59e0b]/30 flex items-center justify-center">
          <ChevronLeft size={13} className="text-[#f59e0b]" />
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[#f59e0b] uppercase tracking-[0.3em]">IINT // VOICE CLONING LAB</p>
          <p className="text-[8px] text-[#475569] font-mono">ElevenLabs Instant Clone · Adjuster · Preview</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
          <span className="text-[9px] font-mono text-[#f59e0b]">LIVE</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* Character selector */}
        <div className="space-y-3">
          <p className="text-[9px] font-mono text-[#475569] uppercase tracking-widest">── SELECT CHARACTER ──</p>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
            {allChars.map(name => {
              const hasVoice = !!clonedVoices[name];
              return (
                <button key={name} onClick={() => setSelectedChar(name)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2"
                  style={{
                    borderColor: selectedChar === name ? '#f59e0b60' : '#1e293b',
                    background: selectedChar === name ? '#f59e0b10' : '#070b14',
                  }}>
                  <div className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: hasVoice ? '#00d4aa' : '#334155', boxShadow: hasVoice ? '0 0 6px #00d4aa' : 'none' }} />
                  <span className="text-xs font-medium truncate"
                    style={{ color: selectedChar === name ? '#f59e0b' : '#94a3b8' }}>{name}</span>
                  {hasVoice && <CheckCircle size={11} className="text-[#00d4aa] shrink-0 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {!selectedChar ? (
            <div className="flex items-center justify-center h-64 rounded-2xl border border-[#1e293b]">
              <p className="text-sm font-mono text-[#334155]">← Select a character to begin</p>
            </div>
          ) : (
            <>
              {/* Selected character header */}
              <div className="rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/05 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-base font-black text-[#f1f5f9]">{selectedChar}</p>
                  <p className="text-[10px] text-[#f59e0b] font-mono mt-0.5">
                    {clonedVoices[selectedChar] ? `Voice ID: ${clonedVoices[selectedChar]}` : 'No voice cloned yet'}
                  </p>
                </div>
                <Mic size={22} className="text-[#f59e0b]" />
              </div>

              {/* Upload samples */}
              <div className="rounded-2xl border border-[#1e293b] p-5 space-y-4">
                <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">── UPLOAD AUDIO SAMPLES (max 5) ──</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#1e293b] hover:border-[#f59e0b]/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <Upload size={24} className="text-[#334155] mx-auto mb-2" />
                  <p className="text-xs text-[#475569]">Click to upload .mp3 / .wav samples</p>
                  <p className="text-[10px] text-[#334155] mt-1">Longer samples = better clone quality</p>
                  <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleFileUpload} />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827] border border-[#1e293b]">
                        <Volume2 size={11} className="text-[#f59e0b] shrink-0" />
                        <span className="text-[11px] text-[#94a3b8] flex-1 truncate">{f.name}</span>
                        <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}>
                          <X size={11} className="text-[#475569] hover:text-[#ef4444]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Adjuster toggle */}
                <button onClick={() => setShowAdjuster(v => !v)}
                  className="flex items-center gap-2 text-[10px] font-mono text-[#475569] hover:text-[#f59e0b] transition-colors">
                  <Sliders size={11} /> {showAdjuster ? 'Hide' : 'Show'} Voice Adjuster
                </button>
                <AnimatePresence>
                  {showAdjuster && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <VoiceAdjuster settings={voiceSettings} onChange={setVoiceSettings} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleClone}
                  disabled={loading || uploadedFiles.length === 0}
                  className="w-full py-3 rounded-xl font-black text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#030508' }}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  Clone Voice with ElevenLabs
                </button>
              </div>

              {/* Preview cloned voice */}
              {clonedVoices[selectedChar] && (
                <div className="rounded-2xl border border-[#00d4aa]/25 p-5 space-y-4">
                  <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">── TEST CLONED VOICE ──</p>
                  <textarea
                    value={testText}
                    onChange={e => setTestText(e.target.value)}
                    rows={2}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] resize-none focus:outline-none focus:border-[#00d4aa]/50"
                    placeholder="Enter test dialogue..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handlePreview} disabled={loading}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#00d4aa]/15 border border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/25 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40">
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <Mic size={12} />}
                      Generate Preview
                    </button>
                    {previewAudio && (
                      <button onClick={togglePlay}
                        className="w-10 h-10 rounded-xl bg-[#00d4aa]/15 border border-[#00d4aa]/30 flex items-center justify-center">
                        {playing ? <Pause size={14} className="text-[#00d4aa]" /> : <Play size={14} className="text-[#00d4aa]" />}
                      </button>
                    )}
                  </div>
                  {previewAudio && (
                    <audio ref={audioRef} src={previewAudio} onEnded={() => setPlaying(false)} className="hidden" />
                  )}
                </div>
              )}

              {/* Status */}
              {status && (
                <p className="text-[11px] font-mono px-3 py-2 rounded-lg bg-[#111827] border border-[#1e293b]"
                  style={{ color: status.startsWith('✓') ? '#00d4aa' : status.startsWith('Error') ? '#ef4444' : '#f59e0b' }}>
                  {status}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}