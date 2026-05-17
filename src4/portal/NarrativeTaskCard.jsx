import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, CheckCircle2, Clock, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setRemaining('EXPIRED'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

export default function NarrativeTaskCard({ message, onComplete, onRemove }) {
  const [playing, setPlaying] = useState(false);
  const [completing, setCompleting] = useState(false);
  const audioRef = useRef(null);
  const countdown = useCountdown(message.expires_at);
  const color = message.narrator_color || '#00d4aa';
  const isExpired = countdown === 'EXPIRED';

  const playAudio = () => {
    if (!message.audio_base64) return;
    if (!audioRef.current) audioRef.current = new Audio();
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    const blob = new Blob(
      [Uint8Array.from(atob(message.audio_base64), c => c.charCodeAt(0))],
      { type: 'audio/mpeg' }
    );
    audioRef.current.src = URL.createObjectURL(blob);
    audioRef.current.onended = () => setPlaying(false);
    audioRef.current.play();
    setPlaying(true);
  };

  const complete = async () => {
    setCompleting(true);
    await base44.entities.NarratedMessage.update(message.id, {
      is_completed: true,
      completed_at: new Date().toISOString(),
    });
    setCompleting(false);
    onComplete?.(message.id);
  };

  const TASK_ICONS = {
    quest: '⚔️', mission: '🎯', decree: '📜', prophecy: '🔮', ritual: '🕯️', summons: '⚡'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border p-5 space-y-4 relative overflow-hidden"
      style={{ borderColor: `${color}40`, background: `radial-gradient(ellipse at top left, ${color}08, #070b14 70%)` }}
    >
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}10, transparent 60%)` }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ background: `${color}20`, border: `2px solid ${color}40` }}>
            {TASK_ICONS[message.task_type] || '📜'}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
              {message.task_type} · from {message.narrator_name}
            </p>
            <h3 className="text-sm font-black text-[#f1f5f9] mt-0.5">{message.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Clock size={11} style={{ color: isExpired ? '#fb7185' : '#f59e0b' }} />
          <span className="text-[10px] font-bold" style={{ color: isExpired ? '#fb7185' : '#f59e0b' }}>
            {countdown}
          </span>
        </div>
      </div>

      {/* Read-along text */}
      <div className="rounded-xl border border-[#1e293b] bg-[#070b14]/80 p-4">
        <p className="text-xs leading-relaxed text-[#94a3b8] italic">"{message.text_content}"</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {message.audio_base64 && (
          <Button onClick={playAudio} variant="outline" size="sm"
            className="text-xs border-[#1e293b] h-8 gap-1.5"
            style={{ color }}>
            {playing ? <Pause size={12} /> : <Volume2 size={12} />}
            {playing ? 'Pause' : 'Hear Message'}
          </Button>
        )}
        {!message.is_completed && !isExpired && (
          <Button onClick={complete} disabled={completing} size="sm"
            className="text-xs h-8 gap-1.5 ml-auto font-bold"
            style={{ background: color, color: '#070b14' }}>
            {completing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            Mark Complete
          </Button>
        )}
        {message.is_completed && (
          <span className="ml-auto text-[10px] text-[#00d4aa] font-bold flex items-center gap-1">
            <CheckCircle2 size={11} /> Completed — erases in 12h
          </span>
        )}
        {isExpired && !message.is_completed && (
          <span className="ml-auto text-[10px] text-[#fb7185] font-bold">⚠️ Expired</span>
        )}
      </div>
    </motion.div>
  );
}