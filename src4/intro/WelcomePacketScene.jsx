import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LightbulbGuy from '@/components/effects/LightbulbGuy';
import TradingLedger from '@/components/branding/TradingLedger';
import AcademyNotebook from '@/components/branding/AcademyNotebook';

/**
 * WelcomePacketScene — Cinematic slapstick intro sequence.
 * Lightbulb tosses branded items one by one, pile overtakes screen,
 * then he loses it laughing about not having ears.
 * 
 * Props:
 *   onComplete: () => void  — called when scene finishes
 *   onSkip:     () => void  — called if user skips
 */

// Each "gift" item the Lightbulb tosses at the user
const GIFTS = [
  {
    id: 'ledger',
    label: 'Trading Ledger',
    sublabel: 'For the platform',
    component: TradingLedger,
    props: { size: 'lg' },
    from: { x: -300, y: -100, rotate: -40 },
    land: { x: -60, y: 20, rotate: -12 },
    speechBefore: "Now that you're here — oh man, where do I even start...",
    speechAfter:  "First things first — you're gonna NEED this.",
    speechDelay: 400,
  },
  {
    id: 'notebook',
    label: 'Academy Notebook',
    sublabel: 'For the Academy',
    component: AcademyNotebook,
    props: { size: 'lg' },
    from: { x: 300, y: -80, rotate: 35 },
    land: { x: 60, y: -10, rotate: 15 },
    speechBefore: "And we got the Academy — oh this is beautiful, this is really nice...",
    speechAfter:  "You're gonna want NOTES. Trust me.",
    speechDelay: 400,
  },
  {
    id: 'ledger2',
    label: 'Another Ledger',
    sublabel: 'Keep one. Frame one.',
    component: TradingLedger,
    props: { size: 'md' },
    from: { x: -250, y: -60, rotate: 20 },
    land: { x: -110, y: 60, rotate: 8 },
    speechBefore: "Actually — I'm gonna give you TWO of those ledgers.",
    speechAfter:  "Keep one. Frame the other. You're welcome.",
    speechDelay: 300,
  },
  {
    id: 'notebook2',
    label: 'Spare Notebook',
    sublabel: 'You will lose the first one.',
    component: AcademyNotebook,
    props: { size: 'md' },
    from: { x: 280, y: -120, rotate: -25 },
    land: { x: 100, y: 50, rotate: -20 },
    speechBefore: "Spare notebook — because you will LOSE the first one, guaranteed.",
    speechAfter:  "I've seen it happen. Every. Single. Time.",
    speechDelay: 300,
  },
  {
    id: 'ledger3',
    label: 'Command Post Pass',
    sublabel: 'VIP Access',
    component: TradingLedger,
    props: { size: 'sm' },
    from: { x: -200, y: -40, rotate: -15 },
    land: { x: -30, y: 90, rotate: 30 },
    speechBefore: "Oh — and we have a whole command post set up for you. Special spots, everything.",
    speechAfter:  "VIP pass. Don't lose it.",
    speechDelay: 200,
  },
];

const BEATS = [
  { type: 'intro',    duration: 2800 },
  { type: 'gift',     giftIdx: 0, duration: 2400 },
  { type: 'gift',     giftIdx: 1, duration: 2400 },
  { type: 'gift',     giftIdx: 2, duration: 2200 },
  { type: 'gift',     giftIdx: 3, duration: 2200 },
  { type: 'gift',     giftIdx: 4, duration: 2000 },
  { type: 'chaos',    duration: 1800 },
  { type: 'laugh',    duration: 3200 },
  { type: 'ears',     duration: 3600 },
  { type: 'recover',  duration: 2400 },
  { type: 'done',     duration: 0 },
];

const SPEECH = {
  intro:   "Now that you're here... oh man. Oh MAN. Do I have stuff for you.",
  chaos:   "And there's MORE — we got — wait hold on I'm not done—",
  laugh:   "HA! HAHAHAHA — wait. Wait wait wait.",
  ears:    "...I just realized... I don't have ears. I literally have NO ears. None. Zero.",
  ears2:   "And yet I hear EVERYTHING. I'm basically omniscient. It's fine. It's a whole thing.",
  recover: "Anyway — welcome packet! Special spots are ready. Don't worry about me. Go explore.",
};

export default function WelcomePacketScene({ onComplete, onSkip }) {
  const [beatIdx, setBeatIdx] = useState(0);
  const [droppedGifts, setDroppedGifts] = useState([]);
  const [speech, setSpeech] = useState('');
  const [showSpeech, setShowSpeech] = useState(false);
  const [chaosPhase, setChaosPhase] = useState(false);
  const [laughPhase, setLaughPhase] = useState(false);
  const [earsPhase, setEarsPhase] = useState(false);
  const timerRef = useRef(null);

  const currentBeat = BEATS[beatIdx];

  const advance = () => setBeatIdx(i => Math.min(i + 1, BEATS.length - 1));

  const showSpeechBubble = (text, delay = 0) => {
    setTimeout(() => {
      setSpeech(text);
      setShowSpeech(true);
    }, delay);
  };

  const hideSpeech = (delay = 1600) => {
    setTimeout(() => setShowSpeech(false), delay);
  };

  useEffect(() => {
    if (!currentBeat) return;
    clearTimeout(timerRef.current);

    if (currentBeat.type === 'done') {
      setTimeout(() => onComplete?.(), 600);
      return;
    }

    if (currentBeat.type === 'intro') {
      showSpeechBubble(SPEECH.intro, 400);
      hideSpeech(2200);
    }

    if (currentBeat.type === 'gift') {
      const gift = GIFTS[currentBeat.giftIdx];
      showSpeechBubble(gift.speechBefore, 300);
      setTimeout(() => {
        setDroppedGifts(prev => [...prev, currentBeat.giftIdx]);
        showSpeechBubble(gift.speechAfter, 700);
        hideSpeech(1800);
      }, 900);
    }

    if (currentBeat.type === 'chaos') {
      setChaosPhase(true);
      showSpeechBubble(SPEECH.chaos, 200);
      hideSpeech(1400);
    }

    if (currentBeat.type === 'laugh') {
      setChaosPhase(false);
      setLaughPhase(true);
      showSpeechBubble(SPEECH.laugh, 300);
      hideSpeech(2800);
    }

    if (currentBeat.type === 'ears') {
      setEarsPhase(true);
      setLaughPhase(false);
      showSpeechBubble(SPEECH.ears, 400);
      setTimeout(() => showSpeechBubble(SPEECH.ears2, 2200), 0);
      hideSpeech(3200);
    }

    if (currentBeat.type === 'recover') {
      setEarsPhase(false);
      showSpeechBubble(SPEECH.recover, 300);
      hideSpeech(2000);
    }

    if (currentBeat.duration > 0) {
      timerRef.current = setTimeout(advance, currentBeat.duration);
    }

    return () => clearTimeout(timerRef.current);
  }, [beatIdx]);

  // Compute lightbulb mood/pose for each beat
  const getMood = () => {
    if (laughPhase) return 'excited';
    if (earsPhase) return 'surprised';
    if (chaosPhase) return 'aha';
    if (currentBeat?.type === 'gift') return 'happy';
    if (currentBeat?.type === 'intro') return 'wink';
    return 'idle';
  };

  const getGloves = () => {
    if (laughPhase) return { left: 'cup', right: 'cup' };
    if (earsPhase) return { left: 'wave', right: 'wave' };
    if (chaosPhase) return { left: 'point_up', right: 'point_right' };
    if (currentBeat?.type === 'gift') return { left: 'cup', right: 'point_up' };
    return { left: 'wave', right: 'down' };
  };

  const gloves = getGloves();
  const itemOverflow = droppedGifts.length >= 4;

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #0d1f35 0%, #030508 70%)', minHeight: '100vh' }}>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="absolute top-5 right-5 z-50 text-[11px] text-[#334155] hover:text-[#64748b] font-mono tracking-widest transition-colors"
      >
        SKIP →
      </button>

      {/* Scene counter dots */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
        {BEATS.filter(b => b.type !== 'done').map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: i <= beatIdx ? '#00d4aa' : '#1e293b' }} />
        ))}
      </div>

      {/* ── PILE OF ITEMS (behind character) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {droppedGifts.map((giftIdx) => {
            const gift = GIFTS[giftIdx];
            const GiftComp = gift.component;
            return (
              <motion.div
                key={gift.id}
                className="absolute"
                initial={{
                  x: gift.from.x,
                  y: gift.from.y,
                  rotate: gift.from.rotate,
                  scale: 1.4,
                  opacity: 0,
                }}
                animate={{
                  x: gift.land.x,
                  y: gift.land.y,
                  rotate: gift.land.rotate,
                  scale: 1,
                  opacity: 1,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, duration: 0.7 }}
                style={{ zIndex: 10 + giftIdx }}
              >
                <GiftComp {...gift.props} />
                <div className="mt-1 text-center">
                  <p className="text-[9px] font-bold" style={{ color: '#64748b' }}>{gift.label}</p>
                  <p className="text-[8px]" style={{ color: '#334155' }}>{gift.sublabel}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* CHAOS: extra items flying in randomly */}
        {chaosPhase && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`chaos-${i}`}
                className="absolute text-2xl"
                initial={{ x: (i % 2 === 0 ? -400 : 400), y: -200 + i * 30, opacity: 0, rotate: i * 30 }}
                animate={{ x: (i % 2 === 0 ? -120 + i * 20 : 80 + i * 15), y: -60 + i * 35, opacity: 1, rotate: i * 15 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 18 }}
                style={{ zIndex: 30 + i }}
              >
                {['📦','🏆','🎖️','📋','🗂️','🔑'][i]}
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* ── OVERFLOW OVERLAY (pile takes over screen) ── */}
      <AnimatePresence>
        {itemOverflow && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 8 }}
          >
            {/* Scattered emoji items all over */}
            {[
              { emoji: '📦', x: '8%',  y: '15%', r: -20 },
              { emoji: '🏆', x: '82%', y: '12%', r: 15 },
              { emoji: '🎁', x: '5%',  y: '72%', r: 10 },
              { emoji: '📋', x: '88%', y: '68%', r: -12 },
              { emoji: '🔑', x: '50%', y: '8%',  r: 30 },
              { emoji: '⭐', x: '20%', y: '45%', r: -8 },
              { emoji: '🎖️', x: '75%', y: '40%', r: 18 },
              { emoji: '💎', x: '38%', y: '78%', r: -25 },
            ].map((item, i) => (
              <motion.div
                key={`overflow-${i}`}
                className="absolute text-3xl"
                style={{ left: item.x, top: item.y, rotate: item.r, zIndex: 9 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.85 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 20 }}
              >
                {item.emoji}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIGHTBULB CHARACTER ── */}
      <motion.div
        className="relative z-40"
        animate={
          laughPhase
            ? { rotate: [0, -8, 8, -6, 6, -3, 3, 0], y: [0, -8, -12, -8, -4, -8, -4, 0] }
            : earsPhase
              ? { x: [-4, 4, -4, 4, 0] }
              : chaosPhase
                ? { y: [0, -5, 0, -5, 0] }
                : { y: [0, -4, 0] }
        }
        transition={
          laughPhase
            ? { duration: 0.9, repeat: 3, ease: 'easeInOut' }
            : earsPhase
              ? { duration: 0.4, repeat: 5 }
              : chaosPhase
                ? { duration: 0.4, repeat: Infinity }
                : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <LightbulbGuy
          mood={getMood()}
          gloveLeft={gloves.left}
          gloveRight={gloves.right}
          bulbColor={laughPhase ? '#fbbf24' : earsPhase ? '#f87171' : '#ffffff'}
          showSoundWaves={earsPhase}
          size={200}
          hatType={null}
        />
      </motion.div>

      {/* ── SPEECH BUBBLE ── */}
      <AnimatePresence>
        {showSpeech && speech && (
          <motion.div
            key={speech}
            className="absolute z-50 max-w-sm"
            style={{ bottom: '24%', left: '50%', x: '-50%' }}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {/* Bubble */}
            <div className="relative rounded-2xl px-5 py-3 text-center"
              style={{
                background: 'rgba(13, 31, 53, 0.96)',
                border: '1px solid rgba(0, 212, 170, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}>
              <p className="text-sm text-[#f1f5f9] leading-relaxed font-medium">{speech}</p>
              {/* Tail pointing up */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-3 overflow-hidden">
                <div className="w-3 h-3 mx-auto rotate-45 -translate-y-1.5"
                  style={{ background: 'rgba(13, 31, 53, 0.96)', border: '1px solid rgba(0, 212, 170, 0.3)' }} />
              </div>
            </div>

            {/* Ears joke indicator */}
            {earsPhase && (
              <motion.div
                className="absolute -right-10 top-0"
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ duration: 0.6, repeat: 3 }}
              >
                <span className="text-xl">😂</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EARS ZAP LINES (no ears gag) ── */}
      <AnimatePresence>
        {earsPhase && (
          <motion.div className="absolute inset-0 pointer-events-none z-45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Sound waves going INTO the character with no ears to land */}
            {[-1, 1].map((side, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: '50%', top: '38%', x: side * 120 }}
                animate={{ x: [side * 120, side * 60, side * 90, side * 55], opacity: [0.7, 0.3, 0.7, 0] }}
                transition={{ duration: 1.2, repeat: 2 }}
              >
                <span className="text-lg" style={{ transform: `scaleX(${side})`, display: 'inline-block' }}>〜〜</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM: item labels (when pile is full) ── */}
      <AnimatePresence>
        {itemOverflow && !laughPhase && !earsPhase && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-wrap gap-2 justify-center max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {GIFTS.map(g => (
              <span key={g.id} className="text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide"
                style={{ background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.25)', color: '#00d4aa' }}>
                {g.label}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTINUE BUTTON (final beat) ── */}
      <AnimatePresence>
        {currentBeat?.type === 'recover' && (
          <motion.button
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: '#00d4aa', color: '#030508' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            onClick={() => onComplete?.()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Let's go →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}