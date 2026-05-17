import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Mic, MicOff, Music, Zap, RefreshCw, Settings, Volume2, VolumeX,
  Loader2, AlertCircle, Lock, Crown, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

const MUSIC_STYLES = ['Trap', 'Boom Bap', 'Spoken Word', 'Gospel', 'Reggae', 'R&B', 'Lo-Fi', 'Jazz Rap', 'Drill', 'Neo Soul'];
const RHYME_FORMATS = ['AABB (couplets)', 'ABAB (alternating)', 'Triplets (AAA)', 'Free Verse', 'Haiku Flow', 'Double Time', 'Bars & Hook'];
const TOPICS = ['Love & Loss', 'Hustle & Grind', 'Family', 'Faith', 'City Life', 'Growth', 'Custom...'];
const INTENSITIES = ['Chill', 'Mid', 'Lit', 'Frenzy'];

const LANGUAGES = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'pt', label: '🇧🇷 Portuguese' },
  { code: 'de', label: '🇩🇪 German' },
];

const FREE_LIMIT = 15;

export default function TheBard() {
  const [usageCount, setUsageCount] = useState(() => parseInt(localStorage.getItem('bard_usage') || '0'));
  const [subscription, setSubscription] = useState(() => localStorage.getItem('bard_sub') || 'free'); // free | monthly | annual

  // Params
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [style, setStyle] = useState('Trap');
  const [rhymeFormat, setRhymeFormat] = useState('AABB (couplets)');
  const [intensity, setIntensity] = useState('Mid');
  const [language, setLanguage] = useState('en');
  const [voiceCloneId, setVoiceCloneId] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showParams, setShowParams] = useState(true);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [transcriptScroll, setTranscriptScroll] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.9);

  // Beat detection
  const [beatListening, setBeatListening] = useState(false);
  const [detectedBpm, setDetectedBpm] = useState(null);
  const [waveform, setWaveform] = useState(Array(32).fill(2));

  // Voices
  const [xiVoices, setXiVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  const waveIntervalRef = useRef(null);
  const utteranceRef = useRef(null);
  const scrollRef = useRef(null);

  const isLocked = subscription === 'free' && usageCount >= FREE_LIMIT;
  const remaining = Math.max(0, FREE_LIMIT - usageCount);

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    if (beatListening) {
      waveIntervalRef.current = setInterval(() => setWaveform(Array(32).fill(0).map(() => Math.random() * 28 + 4)), 80);
    } else {
      clearInterval(waveIntervalRef.current);
      setWaveform(Array(32).fill(2));
    }
    return () => clearInterval(waveIntervalRef.current);
  }, [beatListening]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptScroll]);

  const loadVoices = async () => {
    setLoadingVoices(true);
    const res = await base44.functions.invoke('elevenLabs', { action: 'list_voices' }).catch(() => null);
    const cloned = (res?.data?.voices || []).filter(v => v.category === 'cloned' || v.category === 'professional');
    setXiVoices(cloned);
    if (cloned.length) setVoiceCloneId(cloned[0].voice_id);
    setLoadingVoices(false);
  };

  const detectBeat = async () => {
    setBeatListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 512;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const peaks = [];
      let last = 0;

      const detect = setInterval(() => {
        analyser.getByteTimeDomainData(data);
        const peak = Math.max(...data);
        if (peak > 200 && Date.now() - last > 300) { peaks.push(Date.now()); last = Date.now(); }
      }, 50);

      setTimeout(() => {
        clearInterval(detect);
        stream.getTracks().forEach(t => t.stop());
        audioCtx.close();
        setBeatListening(false);
        if (peaks.length > 2) {
          const intervals = peaks.slice(1).map((p, i) => p - peaks[i]);
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const bpm = Math.round(60000 / avgInterval);
          setDetectedBpm(Math.min(Math.max(bpm, 60), 200));
        }
      }, 5000);
    } catch {
      setBeatListening(false);
    }
  };

  const buildPrompt = () => {
    const finalTopic = topic === 'Custom...' ? customTopic : topic;
    const bpmNote = detectedBpm ? ` The beat is ${detectedBpm} BPM — match the syllable flow accordingly.` : '';
    const langNote = language !== 'en' ? ` Write in ${LANGUAGES.find(l => l.code === language)?.label || language}.` : '';

    return `You are The Bard — a freestyle AI poet who ONLY speaks in rhymes. NEVER break character or produce prose.

Generate original freestyle lyrics with these exact parameters:
- Topic: ${finalTopic || 'life and everything in it'}
- Music Style: ${style}
- Rhyme Format: ${rhymeFormat}
- Intensity: ${intensity}
- Extra context: ${extraContext || 'none'}
${bpmNote}${langNote}

Rules:
1. Every single line MUST rhyme according to the chosen format
2. Always use parables and metaphors — never literal
3. Always produce DIFFERENT content, even for the same topic
4. No chorus repetition allowed — each verse must be unique
5. Output ONLY the lyrics, no titles, no labels, no prose explanations
6. Minimum 12 lines, maximum 24 lines
7. Style must match the music genre authentically`;
  };

  const generateFreestyle = useCallback(async () => {
    if (isLocked) return;
    if (!topic && !customTopic) { alert('Pick a topic first.'); return; }

    setGenerating(true);
    setLyrics('');
    setTranscriptScroll([]);
    window.speechSynthesis?.cancel();

    const res = await base44.functions.invoke('generateFacultyDialogue', {
      faculty_name: 'The Bard',
      faculty_archetype: 'Creator',
      faculty_school: 'Transformation',
      user_message: buildPrompt(),
      context: buildPrompt(),
      signature_line: 'Every word rhymes, every truth shines.',
    }).catch(() => null);

    const generated = res?.data?.dialogue || res?.data?.response ||
      `From the streets to the stars, I navigate the bars,\nEvery scar a memoir, every dream a radar,\nCounting time like a clock that never stops,\nRising from the bottom to the very top.`;

    setGenerating(false);
    setLyrics(generated);

    // Increment usage
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('bard_usage', String(newCount));

    // Animate transcript line by line
    const lines = generated.split('\n').filter(l => l.trim());
    setTranscriptScroll([]);
    lines.forEach((line, i) => {
      setTimeout(() => setTranscriptScroll(prev => [...prev, line]), i * 1200);
    });

    // Speak via ElevenLabs or browser TTS
    if (audioEnabled) {
      if (voiceCloneId) {
        const audioRes = await base44.functions.invoke('elevenLabs', {
          action: 'tts',
          voice_id: voiceCloneId,
          text: generated,
          stability: 0.4,
          similarity_boost: 0.85,
          language_code: language !== 'en' ? language : undefined,
        }).catch(() => null);
        if (audioRes?.data?.audio_base64) {
          const audio = new Audio(`data:audio/mp3;base64,${audioRes.data.audio_base64}`);
          audio.playbackRate = playbackSpeed;
          audio.play();
          audio.onplay = () => setSpeaking(true);
          audio.onended = () => setSpeaking(false);
          return;
        }
      }
      // Fallback browser TTS
      const utt = new SpeechSynthesisUtterance(generated);
      utt.lang = language === 'en' ? 'en-US' : language;
      utt.rate = playbackSpeed;
      utt.onstart = () => setSpeaking(true);
      utt.onend = () => setSpeaking(false);
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    }
  }, [isLocked, topic, customTopic, style, rhymeFormat, intensity, extraContext, detectedBpm, language, voiceCloneId, audioEnabled, playbackSpeed, usageCount, buildPrompt]);

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#f59e0b]/20">
            <Music size={18} className="text-[#f59e0b]" />
          </div>
          <div>
            <h1 className="text-lg font-black">The Bard</h1>
            <p className="text-[10px] text-[#475569]">AI freestyle · rhymes only · your voice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {subscription === 'free' && (
            <div className="text-[10px] px-3 py-1.5 rounded-xl font-bold"
              style={{ background: isLocked ? '#ef444420' : '#f59e0b20', color: isLocked ? '#ef4444' : '#f59e0b' }}>
              {isLocked ? '🔒 Limit reached' : `${remaining} free left`}
            </div>
          )}
          <button onClick={() => setAudioEnabled(v => !v)} className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center">
            {audioEnabled ? <Volume2 size={14} className="text-[#f59e0b]" /> : <VolumeX size={14} className="text-[#475569]" />}
          </button>
          <button onClick={() => setShowSettings(v => !v)} className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center">
            <Settings size={14} className={showSettings ? 'text-[#f59e0b]' : 'text-[#475569]'} />
          </button>
        </div>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-b border-[#1e293b] bg-[#0a0f1e] px-6 py-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <div>
                <label className="text-[10px] text-[#475569] uppercase tracking-widest">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full mt-1 bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#475569] uppercase tracking-widest">Voice (Cloned)</label>
                {loadingVoices
                  ? <p className="text-[10px] text-[#475569] mt-1">Loading voices...</p>
                  : xiVoices.length > 0
                    ? <select value={voiceCloneId} onChange={e => setVoiceCloneId(e.target.value)}
                        className="w-full mt-1 bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none">
                        {xiVoices.map(v => <option key={v.voice_id} value={v.voice_id}>{v.name}</option>)}
                      </select>
                    : <p className="text-[11px] text-[#fbbf24] mt-1">No cloned voice found. Visit Voice Studio to clone your voice.</p>
                }
              </div>
              <div>
                <label className="text-[10px] text-[#475569] uppercase tracking-widest">Playback Speed: {playbackSpeed}x</label>
                <input type="range" min="0.5" max="1.5" step="0.05" value={playbackSpeed}
                  onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-[#f59e0b]" />
              </div>
            </div>
            {/* Subscription options */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
              {[
                { key: 'free', label: 'Free', desc: '15 freestyles total', price: '$0', color: '#64748b' },
                { key: 'monthly', label: 'Monthly', desc: 'Unlimited freestyles', price: '$9.99/mo', color: '#f59e0b' },
                { key: 'annual', label: 'Annual', desc: 'Pay 6 months · get 12', price: '$49.99/yr', color: '#00d4aa' },
              ].map(tier => (
                <button key={tier.key} onClick={() => { setSubscription(tier.key); localStorage.setItem('bard_sub', tier.key); }}
                  className="p-3 rounded-xl border text-left transition-all"
                  style={{ borderColor: subscription === tier.key ? tier.color : '#1e293b', background: subscription === tier.key ? `${tier.color}15` : '#111827' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: tier.color }}>{tier.label}</span>
                    {subscription === tier.key && <Sparkles size={10} style={{ color: tier.color }} />}
                  </div>
                  <p className="text-[10px] text-[#64748b]">{tier.desc}</p>
                  <p className="text-[11px] font-bold text-[#f1f5f9] mt-1">{tier.price}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Params panel */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] overflow-hidden">
          <button onClick={() => setShowParams(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 border-b border-[#1e293b]">
            <span className="text-sm font-bold text-[#f1f5f9]">🎛️ Set Your Vibe</span>
            {showParams ? <ChevronUp size={14} className="text-[#475569]" /> : <ChevronDown size={14} className="text-[#475569]" />}
          </button>
          <AnimatePresence>
            {showParams && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-5 space-y-4">
                  {/* Topic */}
                  <div>
                    <label className="text-[10px] text-[#475569] uppercase tracking-widest">Topic</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {TOPICS.map(t => (
                        <button key={t} onClick={() => setTopic(t)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                          style={{ borderColor: topic === t ? '#f59e0b' : '#1e293b', background: topic === t ? '#f59e0b20' : '#111827', color: topic === t ? '#f59e0b' : '#64748b' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {topic === 'Custom...' && (
                      <input value={customTopic} onChange={e => setCustomTopic(e.target.value)}
                        placeholder="Describe your topic..."
                        className="w-full mt-2 bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] placeholder-[#334155] focus:outline-none" />
                    )}
                  </div>

                  {/* Style */}
                  <div>
                    <label className="text-[10px] text-[#475569] uppercase tracking-widest">Music Style</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {MUSIC_STYLES.map(s => (
                        <button key={s} onClick={() => setStyle(s)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                          style={{ borderColor: style === s ? '#f59e0b' : '#1e293b', background: style === s ? '#f59e0b20' : '#111827', color: style === s ? '#f59e0b' : '#64748b' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rhyme Format */}
                  <div>
                    <label className="text-[10px] text-[#475569] uppercase tracking-widest">Rhyme Format</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {RHYME_FORMATS.map(r => (
                        <button key={r} onClick={() => setRhymeFormat(r)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                          style={{ borderColor: rhymeFormat === r ? '#a78bfa' : '#1e293b', background: rhymeFormat === r ? '#a78bfa20' : '#111827', color: rhymeFormat === r ? '#a78bfa' : '#64748b' }}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intensity + Extra */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#475569] uppercase tracking-widest">Intensity</label>
                      <div className="flex gap-2 mt-2">
                        {INTENSITIES.map(i => (
                          <button key={i} onClick={() => setIntensity(i)}
                            className="flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                            style={{ borderColor: intensity === i ? '#ef4444' : '#1e293b', background: intensity === i ? '#ef444420' : '#111827', color: intensity === i ? '#ef4444' : '#64748b' }}>
                            {i}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] uppercase tracking-widest">Extra Context</label>
                      <input value={extraContext} onChange={e => setExtraContext(e.target.value)}
                        placeholder="Mood, story, anything..."
                        className="w-full mt-1 bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-[#f1f5f9] placeholder-[#334155] focus:outline-none" />
                    </div>
                  </div>

                  {/* Beat detection */}
                  <div className="flex items-center gap-3">
                    <button onClick={detectBeat} disabled={beatListening}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-50"
                      style={{ borderColor: beatListening ? '#00d4aa' : '#1e293b', background: beatListening ? '#00d4aa15' : '#111827', color: beatListening ? '#00d4aa' : '#64748b' }}>
                      {beatListening ? <Loader2 size={11} className="animate-spin" /> : <Music size={11} />}
                      {beatListening ? 'Detecting beat...' : 'Detect Beat BPM'}
                    </button>
                    {detectedBpm && (
                      <div className="text-xs font-bold text-[#00d4aa]">🥁 {detectedBpm} BPM detected</div>
                    )}
                    {beatListening && (
                      <div className="flex items-center gap-0.5 h-6">
                        {waveform.slice(0, 16).map((h, i) => (
                          <motion.div key={i} className="w-0.5 rounded-full bg-[#00d4aa]"
                            animate={{ height: h * 0.5 }} transition={{ duration: 0.08 }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generate button */}
        {isLocked ? (
          <div className="p-6 rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/05 text-center space-y-3">
            <Lock size={24} className="text-[#ef4444] mx-auto" />
            <p className="text-sm font-bold text-[#ef4444]">Free limit reached (15/15)</p>
            <p className="text-xs text-[#64748b]">Upgrade to Monthly ($9.99/mo) or Annual ($49.99/yr — pay 6, get 12)</p>
            <button onClick={() => setShowSettings(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#070b14]">
              <Crown size={13} className="inline mr-1" /> Upgrade in Settings
            </button>
          </div>
        ) : (
          <button onClick={generateFreestyle} disabled={generating || (!topic && !customTopic)}
            className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#070b14', boxShadow: '0 4px 24px rgba(245,158,11,0.3)' }}>
            {generating
              ? <><Loader2 size={18} className="animate-spin" /> Crafting your freestyle...</>
              : <><Zap size={18} /> Drop the Bars</>
            }
          </button>
        )}

        {/* Live transcript scroll */}
        <AnimatePresence>
          {transcriptScroll.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/05 p-5 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Music size={12} className="text-[#f59e0b]" />
                <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest">Live Transcription</span>
                {speaking && (
                  <div className="flex gap-0.5 ml-2">
                    {[0, 0.1, 0.2].map((d, i) => (
                      <motion.div key={i} className="w-1 rounded-full bg-[#f59e0b]" style={{ height: 8 }}
                        animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.4, delay: d, repeat: Infinity }} />
                    ))}
                  </div>
                )}
              </div>
              {transcriptScroll.map((line, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-[#f1f5f9] leading-relaxed font-medium">
                  {line}
                </motion.p>
              ))}
              <div ref={scrollRef} />
              <p className="text-[10px] text-[#475569] italic mt-4 border-t border-[#1e293b] pt-3">
                📝 Read along above. No saving available in free mode — record your way, copy the words. That's fair use.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!window.SpeechSynthesis && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#fbbf24]/20 bg-[#fbbf24]/05">
            <AlertCircle size={13} className="text-[#fbbf24]" />
            <p className="text-xs text-[#fbbf24]">Visit Voice Studio to clone your voice for authentic Bard output.</p>
          </div>
        )}
      </div>
    </div>
  );
}