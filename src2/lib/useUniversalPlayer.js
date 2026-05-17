/**
 * useUniversalPlayer — Cross-device audio hook with manifest-based format detection.
 * Automatically selects the best supported audio format per browser:
 *   - Safari / iOS: prefers AAC (.m4a) → fallback mp3
 *   - Firefox: prefers Ogg Vorbis (.ogg) → fallback mp3
 *   - Chrome / Brave / Edge / Opera: mp3 is always fine, also supports ogg
 *   - All: mp3 is the universal fallback
 *
 * Usage:
 *   const player = useUniversalPlayer(trackManifest, options);
 *   trackManifest = { mp3: 'url.mp3', ogg?: 'url.ogg', m4a?: 'url.m4a' }
 *   options = { autoplay?, volume?, onEnded?, onError? }
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Format capability detection ─────────────────────────────────────────────

let _formatCache = null;

function detectSupportedFormats() {
  if (_formatCache) return _formatCache;
  const audio = document.createElement('audio');
  _formatCache = {
    mp3:  audio.canPlayType('audio/mpeg')              !== '',
    ogg:  audio.canPlayType('audio/ogg; codecs="vorbis"') !== '',
    m4a:  audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '',
    opus: audio.canPlayType('audio/ogg; codecs="opus"')  !== '',
    wav:  audio.canPlayType('audio/wav')               !== '',
  };
  return _formatCache;
}

/**
 * Given a track manifest ({ mp3, ogg, m4a, wav }), pick the best URL for
 * the current browser. Priority order:
 *   1. Native preferred format (ogg on Firefox, m4a on Safari)
 *   2. mp3 universal fallback
 *   3. First available URL in manifest
 */
export function resolveTrackUrl(manifest) {
  if (!manifest) return null;
  if (typeof manifest === 'string') return manifest; // plain URL shorthand

  const fmt = detectSupportedFormats();
  const ua = navigator.userAgent.toLowerCase();

  // Safari / iOS — prefers AAC/m4a, struggles with ogg
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
  const isFirefox = /firefox/.test(ua);

  if (isSafari && manifest.m4a && fmt.m4a) return manifest.m4a;
  if (isFirefox && manifest.ogg && fmt.ogg) return manifest.ogg;

  // Universal preference order
  const order = ['mp3', 'ogg', 'm4a', 'opus', 'wav'];
  for (const f of order) {
    if (manifest[f] && fmt[f]) return manifest[f];
  }

  // Last resort: first value in manifest
  return Object.values(manifest).find(Boolean) || null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUniversalPlayer(manifest, options = {}) {
  const { autoplay = false, volume: initVolume = 0.8, onEnded, onError } = options;

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initVolume);
  const [muted, setMutedState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedUrl, setResolvedUrl] = useState(null);

  // Resolve best URL when manifest changes
  useEffect(() => {
    if (!manifest) { setResolvedUrl(null); return; }
    const url = resolveTrackUrl(manifest);
    setResolvedUrl(url);
  }, [JSON.stringify(manifest)]);

  // Create / configure the audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(isFinite(audio.duration) ? audio.duration : 0);
    const onLoadStart = () => { setLoading(true); setError(null); };
    const onCanPlay = () => setLoading(false);
    const onEndedCb = () => { setIsPlaying(false); onEnded?.(); };
    const onErrorCb = (e) => {
      setLoading(false);
      const msg = `Audio error: ${audio.error?.message || 'unknown'}`;
      setError(msg);
      onError?.(msg);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEndedCb);
    audio.addEventListener('error', onErrorCb);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadstart', onLoadStart);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEndedCb);
      audio.removeEventListener('error', onErrorCb);
    };
  }, []);

  // Load new source when URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!resolvedUrl) { audio.pause(); audio.src = ''; return; }
    audio.src = resolvedUrl;
    audio.volume = muted ? 0 : volume;
    audio.load();
    if (autoplay) audio.play().catch(() => {});
  }, [resolvedUrl]);

  // Sync play/pause
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !resolvedUrl) return;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [resolvedUrl]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, play, pause]);

  // Volume
  const setVolume = useCallback((v) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = muted ? 0 : clamped;
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMutedState(m => {
      const next = !m;
      if (audioRef.current) audioRef.current.volume = next ? 0 : volume;
      return next;
    });
  }, [volume]);

  // Seek
  const seek = useCallback((time) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return {
    isPlaying, currentTime, duration, volume, muted, loading, error, resolvedUrl,
    play, pause, toggle, seek, setVolume, toggleMute,
    audioRef, // expose for external use if needed
  };
}

// ─── Track manifest builder helper ───────────────────────────────────────────

/**
 * Build a track manifest from a single URL by inferring alternate formats.
 * Pass baseUrl (without extension) + available extensions.
 * e.g. buildManifest('https://cdn.example.com/track', ['mp3', 'ogg'])
 */
export function buildManifest(baseUrl, extensions = ['mp3']) {
  if (!baseUrl) return null;
  const manifest = {};
  extensions.forEach(ext => { manifest[ext] = `${baseUrl}.${ext}`; });
  return manifest;
}

/**
 * Quick manifest from a single URL — detects extension automatically.
 */
export function urlToManifest(url) {
  if (!url) return null;
  const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase();
  return { [ext || 'mp3']: url };
}