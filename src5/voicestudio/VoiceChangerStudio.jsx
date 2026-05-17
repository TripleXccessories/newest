import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, Square, Play, Download, Loader2, UploadCloud, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoiceChangerStudio({ character }) {
  const [recording, setRecording] = useState(false);
  const [recordedB64, setRecordedB64] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [outputB64, setOutputB64] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [fileName, setFileName] = useState(null);

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const outputAudioRef = useRef(null);
  const inputAudioRef = useRef(null);

  // Timer while recording
  useEffect(() => {
    if (recording) {
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      const reader = new FileReader();
      reader.onloadend = () => setRecordedB64(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRef.current = mr;
    mr.start();
    setRecording(true);
    setOutputB64(null);
    setOutputUrl(null);
    setFileName(null);
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setRecordedUrl(url);
    const reader = new FileReader();
    reader.onloadend = () => setRecordedB64(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
    setOutputB64(null);
    setOutputUrl(null);
  };

  const clearInput = () => {
    setRecordedB64(null);
    setRecordedUrl(null);
    setOutputB64(null);
    setOutputUrl(null);
    setFileName(null);
  };

  const transform = async () => {
    if (!recordedB64 || !character?.locked_voice_id) return;
    setLoading(true);
    setOutputB64(null);
    setOutputUrl(null);
    const res = await base44.functions.invoke('elevenLabs', {
      action: 'voice_changer',
      voice_id: character.locked_voice_id,
      audio_base64: recordedB64,
    });
    const b64 = res.data?.audio_base64 || null;
    if (b64) {
      const blob = new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      setOutputUrl(URL.createObjectURL(blob));
    }
    setOutputB64(b64);
    setLoading(false);
  };

  const downloadOutput = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `${character?.name || 'transformed'}_${Date.now()}.mp3`;
    a.click();
  };

  const hasVoice = !!character?.locked_voice_id;
  const color = character?.primary_color || '#a78bfa';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-[#94a3b8] uppercase tracking-widest">Voice Changer</p>
        {character && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${color}15`, color }}>
            → {character.name}
          </span>
        )}
      </div>

      {!hasVoice && (
        <div className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/05 p-3 text-[11px] text-[#f59e0b]">
          ⚠️ Select a character with a locked voice ID from the Character Picker to enable transformation.
        </div>
      )}

      {/* STEP 1 — Record or Upload */}
      <div className="rounded-2xl border border-[#1e293b] bg-[#070b14] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#f1f5f9]">Step 1 — Record or Upload Your Voice</p>
          {recordedB64 && (
            <button onClick={clearInput} className="text-[9px] text-[#475569] hover:text-[#fb7185] transition-colors flex items-center gap-1">
              <RefreshCw size={8} /> Clear
            </button>
          )}
        </div>

        {/* Record button — big and obvious */}
        <button
          onClick={recording ? stopRecording : startRecording}
          className="w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all"
          style={{
            background: recording
              ? 'linear-gradient(135deg, #fb7185, #f43f5e)'
              : 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: recording ? 'white' : '#94a3b8',
            border: recording ? 'none' : '1px solid #1e293b',
            boxShadow: recording ? '0 0 24px rgba(251,113,133,0.4)' : 'none',
          }}
        >
          {recording ? (
            <>
              <Square size={18} /> Stop Recording
              <span className="ml-1 font-mono text-xs opacity-75">
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
              </span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </>
          ) : (
            <>
              <Mic size={18} /> Click to Record
            </>
          )}
        </button>

        {/* OR upload */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-[#1e293b]" />
          <span className="text-[9px] text-[#334155] font-semibold">OR</span>
          <div className="flex-1 h-px bg-[#1e293b]" />
        </div>

        <label className="block cursor-pointer">
          <div className="w-full py-2.5 rounded-xl border border-dashed border-[#1e293b] text-center text-[10px] text-[#475569] hover:border-[#334155] hover:text-[#94a3b8] transition-colors flex items-center justify-center gap-2">
            <UploadCloud size={13} />
            {fileName ? <span className="text-[#00d4aa]">✓ {fileName}</span> : 'Upload audio file (MP3, WAV, WebM, M4A)'}
          </div>
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
        </label>

        {/* Playback input preview */}
        {recordedUrl && !recording && (
          <div className="space-y-1">
            <p className="text-[9px] text-[#00d4aa] flex items-center gap-1"><CheckCircle size={9} /> Audio ready</p>
            <audio ref={inputAudioRef} src={recordedUrl} controls className="w-full h-8"
              style={{ filter: 'invert(1) brightness(0.5)', accentColor: '#00d4aa' }} />
          </div>
        )}
      </div>

      {/* STEP 2 — Transform */}
      <div className="rounded-2xl border border-[#1e293b] bg-[#070b14] p-4 space-y-3">
        <p className="text-[11px] font-bold text-[#f1f5f9]">
          Step 2 — Transform into {character?.name || '(select a character)'}
        </p>

        <button
          onClick={transform}
          disabled={loading || !recordedB64 || !hasVoice}
          className="w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: !loading && recordedB64 && hasVoice
              ? `linear-gradient(135deg, ${color}, ${color}99)`
              : '#1e293b',
            color: !loading && recordedB64 && hasVoice ? '#fff' : '#475569',
            boxShadow: !loading && recordedB64 && hasVoice ? `0 0 20px ${color}40` : 'none',
          }}
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Transforming voice...</>
            : <><Mic size={16} /> Transform Voice</>
          }
        </button>
      </div>

      {/* OUTPUT */}
      {outputUrl && (
        <motion_div
          className="rounded-2xl border p-4 space-y-3"
          style={{ borderColor: `${color}50`, background: `${color}08` }}
        >
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color }}>
            ✦ Transformation Complete
          </p>
          <audio ref={outputAudioRef} src={outputUrl} controls className="w-full" autoPlay />
          <button onClick={downloadOutput}
            className="w-full py-2 rounded-xl text-xs font-bold border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors flex items-center justify-center gap-2">
            <Download size={13} /> Download MP3
          </button>
        </motion_div>
      )}
    </div>
  );
}

// simple wrapper to avoid importing framer-motion in this file
function motion_div({ children, className, style }) {
  return <div className={className} style={style}>{children}</div>;
}