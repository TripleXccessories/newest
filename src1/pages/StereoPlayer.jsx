import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Music, Radio, Upload } from 'lucide-react';
import MusicScreenEasterEgg from '@/components/music/MusicScreenEasterEgg';
import PlaylistPanel from '@/components/music/PlaylistPanel';
import { useUniversalPlayer, urlToManifest } from '@/lib/useUniversalPlayer';

/**
 * StereoPlayer — IINT branded music player with fullscreen cinematic mode.
 * Drop any audio file, or use the built-in demo tracks.
 * When fullscreen + idle >= 3 min, the Easter Egg Theatre activates.
 */

const DEMO_TRACKS = [
  { id: 1, title: 'Neural Drift',         artist: 'IINT Soundscape',   duration: 4200, color: '#00d4aa' },
  { id: 2, title: 'Algorithmic Pulse',    artist: 'IINT Soundscape',   duration: 3840, color: '#a78bfa' },
  { id: 3, title: 'The Long Arc (60min)', artist: 'IINT DJ Mix',       duration: 3600, color: '#f59e0b' },
  { id: 4, title: 'Momentum Wave',        artist: 'IINT Soundscape',   duration: 2980, color: '#fb7185' },
  { id: 5, title: 'The Secret Project',   artist: 'IINT Underground',  duration: 5400, color: '#0ea5e9' },
];

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function StereoPlayer() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [uploadedTrack, setUploadedTrack] = useState(null);
  const [visualizerBars, setVisualizerBars] = useState(Array.from({ length: 32 }, () => 4));
  const [activeDirective, setActiveDirective] = useState(null);
  const [simTime, setSimTime] = useState(0); // for demo tracks (no real audio)
  const simRef = useRef(null);
  const containerRef = useRef(null);

  const currentTrack = uploadedTrack || DEMO_TRACKS[currentTrackIdx];

  // Universal player — only active when a real file is uploaded
  const player = useUniversalPlayer(
    uploadedTrack ? urlToManifest(uploadedTrack.url) : null,
    {
      onEnded: () => {
        setUploadedTrack(null);
        setCurrentTrackIdx(i => (i + 1) % DEMO_TRACKS.length);
      },
    }
  );

  const [simPlaying, setSimPlaying] = useState(false);
  const totalDuration = uploadedTrack
    ? (player.duration || uploadedTrack.duration || 0)
    : (currentTrack?.duration || 0);
  const currentTime = uploadedTrack ? player.currentTime : simTime;

  useEffect(() => {
    if (simPlaying && !uploadedTrack) {
      simRef.current = { running: true };
      const id = setInterval(() => {
        setSimTime(t => {
          if (t >= totalDuration) {
            setCurrentTrackIdx(i => (i + 1) % DEMO_TRACKS.length);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
      return () => { clearInterval(id); simRef.current = null; };
    }
  }, [simPlaying, uploadedTrack, totalDuration]);

  // Visualizer
  const vizRef = useRef(null);
  const anyPlaying = uploadedTrack ? player.isPlaying : simPlaying;
  useEffect(() => {
    if (!anyPlaying) { setVisualizerBars(Array.from({ length: 32 }, () => 4)); return; }
    const id = setInterval(() => {
      setVisualizerBars(Array.from({ length: 32 }, () => 4 + Math.random() * 56));
    }, 80);
    return () => clearInterval(id);
  }, [anyPlaying]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setUploadedTrack({
        id: 'upload',
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Your Upload',
        duration: Math.floor(audio.duration),
        url,
        color: '#00d4aa',
      });
      setSimPlaying(false);
      setSimTime(0);
    };
  };

  // Auto-play uploaded track
  useEffect(() => {
    if (uploadedTrack) { setTimeout(() => player.play(), 100); }
  }, [uploadedTrack?.url]);

  const handlePlay = () => {
    if (uploadedTrack) {
      player.toggle();
    } else {
      setSimPlaying(p => !p);
    }
  };

  const handlePrev = () => {
    if (uploadedTrack) { player.pause(); setUploadedTrack(null); }
    setCurrentTrackIdx(i => (i - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
    setSimTime(0);
  };

  const handleNext = () => {
    if (uploadedTrack) { player.pause(); setUploadedTrack(null); }
    setCurrentTrackIdx(i => (i + 1) % DEMO_TRACKS.length);
    setSimTime(0);
  };

  const handleVolumeChange = (v) => {
    if (uploadedTrack) player.setVolume(v);
  };

  const handleMute = () => {
    if (uploadedTrack) player.toggleMute();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(f => !f);
    if (!isFullscreen && !anyPlaying) {
      uploadedTrack ? player.play() : setSimPlaying(true);
    }
  };

  const volume = uploadedTrack ? player.volume : 0.8;
  const muted = uploadedTrack ? player.muted : false;
  const progressPct = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const trackColor = currentTrack?.color || '#00d4aa';

  const playerContent = (
    <div
      className="relative flex flex-col"
      style={{
        background: isFullscreen
          ? `radial-gradient(ellipse at 50% 30%, ${trackColor}18 0%, #020408 60%)`
          : '#111827',
        height: isFullscreen ? '100vh' : 'auto',
        borderRadius: isFullscreen ? 0 : 16,
        overflow: 'hidden',
      }}
    >
      {/* Easter Egg Theatre — only active in fullscreen */}
      <MusicScreenEasterEgg
        isFullscreen={isFullscreen}
        isPlaying={anyPlaying}
        trackDuration={totalDuration - currentTime}
        onInterrupt={() => {}}
        showDirective={activeDirective}
      />

      {/* Visualizer bars */}
      <div
        className="flex items-end justify-center gap-0.5 overflow-hidden"
        style={{ height: isFullscreen ? 120 : 60, padding: '0 16px' }}
      >
        {visualizerBars.map((h, i) => (
          <motion.div
            key={i}
            className="rounded-full flex-shrink-0"
            style={{
              width: isFullscreen ? 6 : 3,
              background: `linear-gradient(to top, ${trackColor}, ${trackColor}40)`,
            }}
            animate={{ height: anyPlaying ? h : 4 }}
            transition={{ duration: 0.08, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Track info */}
      <div className={`flex flex-col items-center text-center ${isFullscreen ? 'py-8' : 'py-4'} px-6`}>
        {/* Spinning disc */}
        <motion.div
          className="rounded-full flex items-center justify-center mb-4"
          style={{
            width: isFullscreen ? 160 : 80,
            height: isFullscreen ? 160 : 80,
            background: `conic-gradient(from 0deg, ${trackColor}40, #1e293b, ${trackColor}40)`,
            border: `3px solid ${trackColor}30`,
            boxShadow: anyPlaying ? `0 0 40px ${trackColor}30` : 'none',
          }}
          animate={anyPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="rounded-full bg-[#0f172a] flex items-center justify-center"
            style={{ width: isFullscreen ? 60 : 30, height: isFullscreen ? 60 : 30 }}>
            <Music size={isFullscreen ? 24 : 12} style={{ color: trackColor }} />
          </div>
        </motion.div>

        <h2 className={`font-bold text-[#f1f5f9] ${isFullscreen ? 'text-3xl' : 'text-base'}`}>
          {currentTrack?.title}
        </h2>
        <p className={`text-[#64748b] mt-1 ${isFullscreen ? 'text-base' : 'text-xs'}`}>
          {currentTrack?.artist}
        </p>
        {isFullscreen && totalDuration >= 2700 && (
          <motion.p
            className="text-[10px] text-[#475569] mt-1 italic"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            long session detected — something might happen if you stay still... 👀
          </motion.p>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-3">
        <div
          className="w-full rounded-full cursor-pointer"
          style={{ height: 4, background: '#1e293b' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const t = Math.floor(pct * totalDuration);
            if (uploadedTrack) player.seek(t); else setSimTime(t);
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: trackColor, width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-[#475569]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className={`flex items-center justify-center gap-4 ${isFullscreen ? 'mb-8' : 'mb-4'} px-6`}>
        <button onClick={handlePrev} className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
          <SkipBack size={isFullscreen ? 28 : 18} />
        </button>
        <button
          onClick={handlePlay}
          className="rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            width: isFullscreen ? 64 : 44,
            height: isFullscreen ? 64 : 44,
            background: trackColor,
            boxShadow: anyPlaying ? `0 0 24px ${trackColor}60` : 'none',
          }}
        >
          {anyPlaying
            ? <Pause size={isFullscreen ? 26 : 18} color="#070b14" />
            : <Play size={isFullscreen ? 26 : 18} color="#070b14" />}
        </button>
        <button onClick={handleNext} className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
          <SkipForward size={isFullscreen ? 28 : 18} />
        </button>
      </div>

      {/* Volume + fullscreen + upload */}
      <div className="flex items-center gap-3 px-6 pb-5">
        <button onClick={handleMute} className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <input
          type="range" min={0} max={1} step={0.01}
          value={muted ? 0 : volume}
          onChange={e => handleVolumeChange(+e.target.value)}
          className="flex-1 accent-current"
          style={{ accentColor: trackColor }}
        />
        <label className="cursor-pointer text-[#64748b] hover:text-[#f1f5f9] transition-colors" title="Upload audio">
          <Upload size={14} />
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
        </label>
        <button onClick={toggleFullscreen} className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Playlist panel (non-fullscreen only) */}
      {!isFullscreen && (
        <div className="border-t border-[#1e293b] px-4 pt-3 pb-1 relative">
          <PlaylistPanel activeDirective={activeDirective} onActivate={setActiveDirective} />
          {activeDirective && (
            <p className="text-[9px] text-[#00d4aa]/60 italic mt-1.5">
              ✦ Theatre directed by: <strong className="text-[#00d4aa]">{activeDirective._name}</strong>
            </p>
          )}
        </div>
      )}

      {/* Track list (non-fullscreen only) */}
      {!isFullscreen && (
        <div className="border-t border-[#1e293b] px-4 pb-4 pt-3 space-y-1">
          {DEMO_TRACKS.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => { if (uploadedTrack) { player.pause(); setUploadedTrack(null); } setCurrentTrackIdx(idx); setSimTime(0); setSimPlaying(true); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors"
              style={{
                background: currentTrackIdx === idx && !uploadedTrack ? `${track.color}10` : 'transparent',
                color: currentTrackIdx === idx && !uploadedTrack ? track.color : '#64748b',
              }}
            >
              <span className="font-medium truncate">{track.title}</span>
              <span className="text-[10px] shrink-0 ml-2">{formatTime(track.duration)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen close hint */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 text-[#475569] hover:text-[#f1f5f9] transition-colors"
        >
          <Minimize2 size={20} />
        </button>
      )}

      {/* Audio handled by useUniversalPlayer hook — no DOM audio element needed */}
    </div>
  );

  if (isFullscreen) {
    return (
      <div ref={containerRef} className="fixed inset-0 z-50">
        {playerContent}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Radio size={20} className="text-[#00d4aa]" />
        <h1 className="text-xl font-bold text-[#f1f5f9]">IINT Stereo</h1>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] font-bold border border-[#fbbf24]/20">
          🎵 EASTER EGG INSIDE
        </span>
      </div>
      <div className="rounded-2xl border border-[#1e293b] overflow-hidden">
        {playerContent}
      </div>
      <p className="text-[10px] text-[#334155] text-center italic">
        Tip: go fullscreen, hit play, then walk away for a few minutes 👀
      </p>
    </div>
  );
}