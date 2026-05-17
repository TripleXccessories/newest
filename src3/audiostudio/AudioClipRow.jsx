import React, { useState, useRef } from 'react';
import { Play, Pause, Download, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AudioClipRow({ clip, onDelete }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const color = clip.persona_color || '#00d4aa';

  const toggle = () => {
    if (!clip.audio_base64) return;
    if (!audioRef.current) audioRef.current = new Audio();
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    const blob = new Blob(
      [Uint8Array.from(atob(clip.audio_base64), c => c.charCodeAt(0))],
      { type: 'audio/mpeg' }
    );
    audioRef.current.src = URL.createObjectURL(blob);
    audioRef.current.onended = () => setPlaying(false);
    audioRef.current.play();
    setPlaying(true);
  };

  const download = () => {
    if (!clip.audio_base64) return;
    const blob = new Blob(
      [Uint8Array.from(atob(clip.audio_base64), c => c.charCodeAt(0))],
      { type: 'audio/mpeg' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${clip.title || 'clip'}_${clip.id?.slice(0,6)}.mp3`;
    a.click();
  };

  const remove = async () => {
    await base44.entities.AudioClip.delete(clip.id);
    onDelete?.(clip.id);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#1e293b] bg-[#0a0f1e] hover:border-[#334155] transition-colors">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: `${color}20`, color }}>
        {clip.persona_name?.charAt(0) || '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#f1f5f9] truncate">{clip.title}</p>
        <p className="text-[10px] text-[#475569] truncate">{clip.persona_name} · {clip.engine}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={toggle} disabled={!clip.audio_base64}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#1e293b]"
          style={{ color: clip.audio_base64 ? color : '#334155' }}>
          {playing ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button onClick={download} disabled={!clip.audio_base64}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#1e293b] text-[#475569]">
          <Download size={12} />
        </button>
        <button onClick={remove}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#fb7185]/10 text-[#334155] hover:text-[#fb7185]">
          <Trash2 size={12} />
        </button>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}