import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Plus, Trash2, Volume2, VolumeX } from 'lucide-react';

const STEPS = 16;
const DEFAULT_BPM = 120;

const TRACK_COLORS = [
  '#00d4aa', '#a78bfa', '#fbbf24', '#f87171',
  '#34d399', '#60a5fa', '#fb923c', '#e879f9',
];

const DEFAULT_TRACKS = [
  { id: 1, name: 'Kick',    color: '#00d4aa', volume: 0.9, muted: false, steps: Array(STEPS).fill(false) },
  { id: 2, name: 'Snare',   color: '#a78bfa', volume: 0.8, muted: false, steps: Array(STEPS).fill(false) },
  { id: 3, name: 'Hi-Hat',  color: '#fbbf24', volume: 0.7, muted: false, steps: Array(STEPS).fill(false) },
  { id: 4, name: 'Perc',    color: '#f87171', volume: 0.7, muted: false, steps: Array(STEPS).fill(false) },
  { id: 5, name: 'Bass',    color: '#34d399', volume: 0.8, muted: false, steps: Array(STEPS).fill(false) },
  { id: 6, name: 'Melody',  color: '#60a5fa', volume: 0.7, muted: false, steps: Array(STEPS).fill(false) },
  { id: 7, name: 'FX',      color: '#fb923c', volume: 0.6, muted: false, steps: Array(STEPS).fill(false) },
  { id: 8, name: 'Sample',  color: '#e879f9', volume: 0.6, muted: false, steps: Array(STEPS).fill(false) },
];

// Tone generator using Web Audio API
function createTone(ctx, freq, type = 'sine', duration = 0.1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

const TRACK_FREQS = [60, 200, 800, 400, 80, 520, 1200, 300];
const TRACK_TYPES = ['sawtooth', 'square', 'square', 'triangle', 'sawtooth', 'sine', 'sine', 'triangle'];

export default function BeatMachine({ onSave, initialState }) {
  const [tracks, setTracks] = useState(initialState?.tracks || DEFAULT_TRACKS);
  const [bpm, setBpm] = useState(initialState?.bpm || DEFAULT_BPM);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [audioAssets, setAudioAssets] = useState({}); // trackId -> AudioBuffer

  const audioCtxRef = useRef(null);
  const schedulerRef = useRef(null);
  const stepRef = useRef(0);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playStep = useCallback((step) => {
    const ctx = getAudioCtx();
    tracksRef.current.forEach((track, i) => {
      if (!track.muted && track.steps[step]) {
        // Use uploaded audio if available, else synthesize tone
        if (audioAssets[track.id]) {
          const source = ctx.createBufferSource();
          const gainNode = ctx.createGain();
          source.buffer = audioAssets[track.id];
          gainNode.gain.value = track.volume;
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          source.start(ctx.currentTime);
        } else {
          createTone(ctx, TRACK_FREQS[i] || 440, TRACK_TYPES[i] || 'sine', 0.12);
        }
      }
    });
  }, [audioAssets]);

  useEffect(() => {
    if (!playing) {
      clearInterval(schedulerRef.current);
      setCurrentStep(-1);
      stepRef.current = 0;
      return;
    }
    const interval = (60 / bpm / 4) * 1000; // 16th notes
    schedulerRef.current = setInterval(() => {
      const step = stepRef.current % STEPS;
      setCurrentStep(step);
      playStep(step);
      stepRef.current++;
    }, interval);
    return () => clearInterval(schedulerRef.current);
  }, [playing, bpm, playStep]);

  const toggleStep = (trackId, stepIdx) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, steps: t.steps.map((s, i) => i === stepIdx ? !s : s) } : t
    ));
  };

  const toggleMute = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const setVolume = (trackId, vol) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, volume: parseFloat(vol) } : t));
  };

  const clearTrack = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, steps: Array(STEPS).fill(false) } : t));
  };

  const handleAudioUpload = async (trackId, file) => {
    const ctx = getAudioCtx();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    setAudioAssets(prev => ({ ...prev, [trackId]: audioBuffer }));
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, name: file.name.replace(/\.[^.]+$/, '').substring(0, 10) } : t));
  };

  const handleSave = () => {
    onSave?.({ bpm, tracks });
  };

  return (
    <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl p-4 space-y-4">
      {/* Transport */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: playing ? '#ef4444' : '#00d4aa', color: '#070b14' }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => { setPlaying(false); stepRef.current = 0; setCurrentStep(-1); }}
            className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#64748b] flex items-center justify-center hover:text-[#f1f5f9] transition-colors"
          >
            <Square size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748b] font-mono">BPM</span>
          <input
            type="range" min={60} max={200} value={bpm}
            onChange={e => setBpm(+e.target.value)}
            className="w-24 accent-[#00d4aa]"
          />
          <span className="text-sm font-black text-[#00d4aa] font-mono w-8">{bpm}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {Array.from({ length: STEPS }, (_, i) => (
            <div key={i}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: currentStep === i ? '#00d4aa' : '#1e293b' }}
            />
          ))}
        </div>
      </div>

      {/* Tracks */}
      <div className="space-y-1.5">
        {tracks.map((track, ti) => (
          <div key={track.id} className="flex items-center gap-2">
            {/* Track name + controls */}
            <div className="flex items-center gap-1 w-28 shrink-0">
              <button onClick={() => toggleMute(track.id)} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
                {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
              <label className="cursor-pointer text-[10px] truncate font-bold hover:text-[#00d4aa] transition-colors"
                style={{ color: track.muted ? '#334155' : track.color }}
                title="Click to upload audio for this track">
                {track.name}
                <input type="file" accept="audio/*" className="hidden"
                  onChange={e => e.target.files[0] && handleAudioUpload(track.id, e.target.files[0])} />
              </label>
              <button onClick={() => clearTrack(track.id)} className="ml-auto text-[#334155] hover:text-[#ef4444] transition-colors">
                <Trash2 size={10} />
              </button>
            </div>

            {/* Step buttons */}
            <div className="flex gap-0.5 flex-1">
              {track.steps.map((active, si) => (
                <button
                  key={si}
                  onClick={() => toggleStep(track.id, si)}
                  className="flex-1 h-7 rounded transition-all"
                  style={{
                    background: active
                      ? (currentStep === si && playing ? '#ffffff' : track.color)
                      : (si % 4 === 0 ? '#1a2236' : '#111827'),
                    opacity: track.muted ? 0.3 : 1,
                    boxShadow: active && currentStep === si && playing ? `0 0 8px ${track.color}` : 'none',
                    border: `1px solid ${si % 4 === 0 ? '#1e293b' : 'transparent'}`,
                  }}
                />
              ))}
            </div>

            {/* Volume */}
            <input type="range" min={0} max={1} step={0.05} value={track.volume}
              onChange={e => setVolume(track.id, e.target.value)}
              className="w-14 accent-current"
              style={{ accentColor: track.color }}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-[#1e293b]">
        <p className="text-[10px] text-[#334155]">Click track name to upload audio sample · Click steps to activate</p>
        <button onClick={handleSave}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30 hover:bg-[#00d4aa]/25 transition-colors">
          Save Pattern
        </button>
      </div>
    </div>
  );
}