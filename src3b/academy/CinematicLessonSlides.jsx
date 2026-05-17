import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Sparkles, Volume2, VolumeX, Image } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BotCharacter3D from '@/components/bots/BotCharacter3D';

// Headmaster character data
const HEADMASTER = {
  id: 'headmaster',
  name: 'Da PrEAChEr',
  archetype: 'Oracle',
  primary_color: '#f59e0b',
  emoji: '🎓',
};

// Story beat types
const BEAT_TYPES = {
  HEADMASTER_INTRO: 'headmaster_intro',
  FACULTY_SPEAK: 'faculty_speak',
  CONCEPT_ART: 'concept_art',
  BOT_INTERACTION: 'bot_interaction',
  KEY_TAKEAWAY: 'key_takeaway',
};

function buildStoryBeats(lesson, faculty, generatedArtUrl) {
  return [
    {
      type: BEAT_TYPES.HEADMASTER_INTRO,
      speaker: HEADMASTER,
      text: `*The great hall dims. A figure stirs at the front.*\n\n"Attention, students. Today's lesson is: **${lesson.title}**. ${lesson.faculty_name} has prepared something special. Pay close attention. The market does not repeat itself for those who weren't listening the first time."`,
      bg: 'radial-gradient(ellipse at center, #1a1200 0%, #070b14 70%)',
    },
    {
      type: BEAT_TYPES.FACULTY_SPEAK,
      speaker: { id: lesson.faculty_id, name: lesson.faculty_name, archetype: faculty.archetype, primary_color: faculty.color },
      text: lesson.dialogue_intro || `*${lesson.faculty_name} steps forward, the room shifting to match their presence.*\n\n"${lesson.key_takeaway || `Welcome. Today we explore ${lesson.title}. I don't waste words. Let's begin.`}"`,
      bg: `radial-gradient(ellipse at 30% 50%, ${faculty.color}15 0%, #070b14 70%)`,
    },
    {
      type: BEAT_TYPES.CONCEPT_ART,
      speaker: null,
      artUrl: generatedArtUrl,
      lessonTitle: lesson.title,
      text: `*The walls of the classroom dissolve into the concept itself.*`,
      bg: `radial-gradient(ellipse at center, ${faculty.color}20 0%, #070b14 80%)`,
    },
    {
      type: BEAT_TYPES.BOT_INTERACTION,
      speaker: { id: lesson.faculty_id, name: lesson.faculty_name, archetype: faculty.archetype, primary_color: faculty.color },
      text: lesson.demonstration_beat || `*A demonstration unfolds — wordless, precise, purposeful.*\n\n"Watch carefully. This is what mastery looks like in motion. There are no shortcuts to what you're seeing."`,
      bg: `linear-gradient(160deg, ${faculty.color}10 0%, #0f172a 60%)`,
    },
    {
      type: BEAT_TYPES.KEY_TAKEAWAY,
      speaker: HEADMASTER,
      text: `*Da PrEAChEr returns to close the session.*\n\n"The lesson today was: **${lesson.title}**.\n\nCarry this with you: *'${lesson.key_takeaway || "Every lesson is a signal. Read it carefully."}'*\n\nClass dismissed."`,
      bg: 'radial-gradient(ellipse at center, #1a1200 0%, #070b14 70%)',
    },
  ];
}

export default function CinematicLessonSlides({ lesson, faculty, onComplete, onExit }) {
  const [beats, setBeats] = useState([]);
  const [current, setCurrent] = useState(0);
  const [artUrl, setArtUrl] = useState(null);
  const [generatingArt, setGeneratingArt] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  useEffect(() => {
    generateConceptArt();
  }, [lesson.id]);

  useEffect(() => {
    const b = buildStoryBeats(lesson, faculty, artUrl);
    setBeats(b);
  }, [lesson, faculty, artUrl]);

  useEffect(() => {
    if (audioOn && beats[current]) {
      speakBeat(beats[current].text);
    }
    return () => window.speechSynthesis?.cancel();
  }, [current, audioOn]);

  const generateConceptArt = async () => {
    setGeneratingArt(true);
    try {
      const prompt = lesson.visual_prompt ||
        `Cinematic concept art for a trading academy lesson titled "${lesson.title}". ${faculty.color ? `Color palette centered on ${faculty.color}.` : ''} Dramatic lighting, abstract financial symbolism, painterly style, dark atmospheric background, epic educational scene.`;
      const res = await base44.integrations.Core.GenerateImage({ prompt });
      setArtUrl(res?.url || null);
    } catch (_) {}
    setGeneratingArt(false);
  };

  const speakBeat = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*[^*]*\*/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').trim();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 0.85;
    utt.pitch = beats[current]?.speaker?.id === 'headmaster' ? 0.7 : 1.0;
    utt.volume = 0.9;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utterRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const go = (dir) => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    const next = current + dir;
    if (next < 0) return;
    if (next >= beats.length) { onComplete(); return; }
    setCurrent(next);
  };

  if (beats.length === 0) return (
    <div className="fixed inset-0 bg-[#070b14] flex items-center justify-center z-50">
      <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#f59e0b] rounded-full animate-spin" />
    </div>
  );

  const beat = beats[current];
  const isHeadmaster = beat.speaker?.id === 'headmaster';
  const speakerColor = beat.speaker?.primary_color || faculty.color || '#00d4aa';
  const totalBeats = beats.length;

  // Format text: bold **x** and italic *x*
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return (
        <p key={i} className={`${line.startsWith('*') && !line.startsWith('**') ? 'text-[#64748b] italic text-xs' : 'text-sm text-[#e2e8f0] leading-relaxed'} mb-1`}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*')) return <em key={j} className="text-[#64748b]">{part.slice(1, -1)}</em>;
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col" style={{ background: beat.bg || '#070b14' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 z-10">
        <div className="flex gap-1.5">
          {beats.map((_, i) => (
            <div key={i} className="h-1 rounded-full transition-all" style={{
              width: i === current ? 24 : 8,
              background: i <= current ? speakerColor : '#1e293b',
            }} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setAudioOn(v => !v); if (audioOn) window.speechSynthesis?.cancel(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center border border-[#1e293b]"
            style={{ background: audioOn ? `${speakerColor}20` : '#111827' }}>
            {audioOn ? <Volume2 size={12} style={{ color: speakerColor }} /> : <VolumeX size={12} className="text-[#475569]" />}
          </button>
          <button onClick={onExit} className="w-7 h-7 rounded-full bg-[#111827] border border-[#1e293b] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9]">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="w-full max-w-xl flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
          >
            {/* Concept Art beat */}
            {beat.type === BEAT_TYPES.CONCEPT_ART && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border flex items-center justify-center"
                style={{ borderColor: `${faculty.color}30`, background: '#0a0f1a' }}>
                {generatingArt ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#1e293b] rounded-full animate-spin" style={{ borderTopColor: faculty.color }} />
                    <p className="text-xs text-[#475569]">Generating concept art...</p>
                  </div>
                ) : artUrl ? (
                  <img src={artUrl} alt={lesson.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#334155]">
                    <Image size={32} />
                    <p className="text-xs">Concept art unavailable</p>
                  </div>
                )}
              </div>
            )}

            {/* Character */}
            {beat.speaker && beat.type !== BEAT_TYPES.CONCEPT_ART && (
              <div className="relative">
                <BotCharacter3D
                  bot={{ archetype: beat.speaker.archetype || 'Oracle', primary_color: beat.speaker.primary_color }}
                  size={140}
                  isSpeaking={speaking}
                />
                {/* Headmaster hat indicator */}
                {isHeadmaster && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">🎓</div>
                )}
                {speaking && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {[0, 0.1, 0.2].map((d, i) => (
                      <motion.div key={i} className="w-1 rounded-full" style={{ height: 5, background: speakerColor }}
                        animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.5, delay: d, repeat: Infinity }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speaker label */}
            {beat.speaker && (
              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: `${speakerColor}30` }} />
                <span className="text-[10px] font-bold px-2" style={{ color: speakerColor }}>{beat.speaker.name}</span>
                <div className="h-px flex-1" style={{ background: `${speakerColor}30` }} />
              </div>
            )}

            {/* Text */}
            <div className="w-full bg-[#0f172a]/80 backdrop-blur-sm border rounded-2xl px-5 py-4 space-y-1 max-h-48 overflow-y-auto"
              style={{ borderColor: `${speakerColor}20` }}>
              {formatText(beat.text)}
            </div>

            {/* Beat label */}
            <p className="text-[10px] text-[#334155]">
              {current + 1} of {totalBeats} · {lesson.school_level} · {lesson.title}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 pb-6 pt-2">
        <button onClick={() => go(-1)} disabled={current === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold disabled:opacity-30 transition-all"
          style={{ borderColor: `${speakerColor}30`, color: speakerColor, background: `${speakerColor}08` }}>
          <ChevronLeft size={14} /> Back
        </button>
        <button onClick={() => go(1)}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: speakerColor, color: '#070b14' }}>
          {current === totalBeats - 1 ? <><Sparkles size={13} /> Complete</> : <>Next <ChevronRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}