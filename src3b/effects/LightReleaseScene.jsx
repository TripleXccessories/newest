import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LightbulbGuy from './LightbulbGuy';

/**
 * LightReleaseScene — Cinematic intro: Robot manifests a living light
 * 
 * Sequence:
 * 1. Robot enters, checks things out
 * 2. Turns to face away, opens chest, pulls bulb
 * 3. Head twists 180° (body stays) — "Why are you looking at me?"
 * 4. Body pivots to face user, hands cupped with bulb
 * 5. Places bulb, walks off screen
 * 6. Re-enters (upper torso), sees bulb unresponsive
 * 7. AHA moment, whispers to bulb
 * 8. Eyes code up (JSON/Matrix), nodes shoot from eyes
 * 9. Nodes sprinkle down (sperm-meets-egg), pop sounds
 * 10. Bulb materializes: arms (pop), eyes (big, floating, pop/pop), nose, mouth (dark void)
 * 11. Little light born, robot exits gracefully
 */

const BEATS = [
  {
    id: 'enter',
    text: 'Welcome to IINT Inc.',
    sub: '— Finally, someone worth talking to.',
    gloveLeft: 'wave', gloveRight: 'wave',
    x: 0, facing: false, headTwist: 0,
    duration: 2800,
  },
  {
    id: 'examine',
    text: 'One second...',
    sub: "I've got something for you.",
    gloveLeft: 'down', gloveRight: 'point_up',
    x: 0, facing: false, headTwist: 0,
    duration: 2200,
  },
  {
    id: 'chest_open',
    text: '',
    sub: '🔊 *creak... click...*',
    gloveLeft: 'down', gloveRight: 'down',
    x: 0, facing: true, headTwist: 0,
    chestOpen: true,
    sound: 'chest_open',
    duration: 2400,
  },
  {
    id: 'head_twist',
    text: '',
    sub: '...What are you looking at?',
    gloveLeft: 'down', gloveRight: 'down',
    x: 0, facing: true, headTwist: 180,
    chestOpen: false,
    duration: 2000,
  },
  {
    id: 'body_pivot',
    text: '',
    sub: '*places it down gently*',
    gloveLeft: 'cup', gloveRight: 'cup',
    x: 0, facing: false, headTwist: 0,
    duration: 2200,
  },
  {
    id: 'exit',
    text: '',
    sub: '*walks off casually* I\'ll just... leave this here.',
    gloveLeft: 'wave', gloveRight: 'wave',
    x: -600, facing: false, headTwist: 0,
    duration: 1800,
  },
  {
    id: 'reenter',
    text: '',
    sub: '*pops back in* ...Wait. Why isn\'t it doing anything?',
    gloveLeft: 'point_right', gloveRight: 'point_right',
    x: 0, facing: false, headTwist: 0,
    duration: 2600,
  },
  {
    id: 'aha',
    text: 'AHA!',
    sub: '*whispers* Here, little one. Time to wake up.',
    gloveLeft: 'temple', gloveRight: 'temple',
    x: 0, facing: false, headTwist: 0,
    duration: 3000,
  },
  {
    id: 'coding',
    text: '',
    sub: '*eyes light up with code... JSON... Matrix raining down*',
    gloveLeft: 'temple', gloveRight: 'temple',
    showCodeEyes: true,
    x: 0, facing: false, headTwist: 0,
    duration: 3200,
  },
  {
    id: 'done',
    text: '',
    sub: "There. Now you've got your guide. I'll be around.",
    gloveLeft: 'wave', gloveRight: 'point_up',
    x: 0, facing: false, headTwist: 0,
    duration: 3500,
  },
];

function playChestSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
    setTimeout(() => {
      const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx2.createBuffer(1, ctx2.sampleRate * 0.05, ctx2.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx2.createBufferSource();
      src.buffer = buf;
      const g = ctx2.createGain(); g.gain.value = 0.3;
      src.connect(g); g.connect(ctx2.destination);
      src.start();
    }, 500);
  } catch (_) {}
}

function playPopSound(pitch = 600) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0, ctx.currentTime + 0.12);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  } catch (_) {}
}

// Node sparks from eyes to bulb
function NodeSparks() {
  const sparks = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    delay: i * 0.08,
    color: i % 2 === 0 ? '#00d4aa' : '#a78bfa',
  }));
  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparks.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{ width: 6, height: 6, background: s.color, left: '48%', top: '42%' }}
          animate={{
            x: [0, (Math.random() - 0.5) * 140, 40],
            y: [0, -30 + Math.random() * 50, 120],
            opacity: [1, 1, 0],
            scale: [1, 1.6, 0],
          }}
          transition={{ duration: 1.1, delay: s.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// Fairy dust / node rain
function NodeRain() {
  const particles = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: 80 + Math.random() * 200,
    delay: Math.random() * 1.2,
    size: 2.5 + Math.random() * 4,
    color: ['#00d4aa', '#a78bfa', '#fbbf24'][Math.floor(Math.random() * 3)],
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: p.color, left: p.x, top: -10 }}
          animate={{ y: [0, 340], opacity: [0, 0.8, 0], rotate: [0, 360] }}
          transition={{ duration: 2.2, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

// Born light bulb with big cartoony eyes, floating
function BornLightBulb({ armRevealed, eyesRevealed, noseRevealed, mouthRevealed }) {
  return (
    <motion.div
      className="absolute"
      style={{ bottom: 80, left: '50%', transform: 'translateX(-50%)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'backOut' }}
    >
      <svg width="100" height="130" viewBox="0 0 100 130">
        <defs>
          <radialGradient id="bulbGrad" cx="38%" cy="32%">
            <stop offset="0%" stopColor="#fffde7" />
            <stop offset="60%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>

        {/* Main bulb */}
        <ellipse cx="50" cy="45" rx="32" ry="38" fill="url(#bulbGrad)" stroke="#f59e0b" strokeWidth="2" />

        {/* Coil base */}
        {[0, 1, 2].map(i => (
          <rect key={i} x="30" y="83 + i*7" width="40" height="6" rx="3" fill={i % 2 === 0 ? '#6b7280' : '#9ca3af'} />
        ))}

        {/* Arms — pop in */}
        {armRevealed && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <line x1="18" y1="60" x2="2" y2="75" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
            <line x1="82" y1="60" x2="98" y2="75" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="0" cy="77" rx="7" ry="6" fill="white" stroke="#d1d5db" strokeWidth="1" />
            <ellipse cx="100" cy="77" rx="7" ry="6" fill="white" stroke="#d1d5db" strokeWidth="1" />
          </motion.g>
        )}

        {/* Big floating eyes — cartoony, pop in separately */}
        {eyesRevealed && (
          <>
            {/* Left eye — floats slightly off */}
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ellipse cx="30" cy="35" rx="12" ry="15" fill="white" stroke="#1e293b" strokeWidth="2" />
              <ellipse cx="30" cy="36" rx="6" ry="8" fill="#1e293b" />
              <circle cx="28" cy="32" r="2.5" fill="white" opacity="0.9" />
            </motion.g>

            {/* Right eye — floats slightly off */}
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              <ellipse cx="70" cy="35" rx="12" ry="15" fill="white" stroke="#1e293b" strokeWidth="2" />
              <ellipse cx="70" cy="36" rx="6" ry="8" fill="#1e293b" />
              <circle cx="72" cy="32" r="2.5" fill="white" opacity="0.9" />
            </motion.g>
          </>
        )}

        {/* Small round nose */}
        {noseRevealed && (
          <motion.circle
            cx="50" cy="55" r="4"
            fill="#d97706"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Mouth — dark void inside, cartoony wide */}
        {mouthRevealed && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <path d="M 38 68 Q 50 80 62 68" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Dark void inside mouth */}
            <ellipse cx="50" cy="72" rx="10" ry="6" fill="#0f172a" opacity="0.9" />
          </motion.g>
        )}

        {/* Glow aura */}
        {eyesRevealed && (
          <ellipse cx="50" cy="45" rx="38" ry="42" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.2s" repeatCount="indefinite" />
          </ellipse>
        )}
      </svg>
    </motion.div>
  );
}

export default function LightReleaseScene({ onComplete }) {
  const [beatIdx, setBeatIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showDroppedBulb, setShowDroppedBulb] = useState(false);
  const [showNodeSparks, setShowNodeSparks] = useState(false);
  const [showNodeRain, setShowNodeRain] = useState(false);
  const [armRevealed, setArmRevealed] = useState(false);
  const [eyesRevealed, setEyesRevealed] = useState(false);
  const [noseRevealed, setNoseRevealed] = useState(false);
  const [mouthRevealed, setMouthRevealed] = useState(false);

  const beat = BEATS[beatIdx] || BEATS[BEATS.length - 1];
  const isLast = beatIdx >= BEATS.length - 1;

  // Trigger side effects per beat
  useEffect(() => {
    if (beat.sound === 'chest_open') playChestSound();
    if (beat.id === 'body_pivot') setShowDroppedBulb(true);
    if (beat.id === 'coding') {
      setShowNodeSparks(true);
      setTimeout(() => setShowNodeSparks(false), 2400);
      setShowNodeRain(true);
      setTimeout(() => {
        playPopSound(700); // First pop for arms
        setArmRevealed(true);
      }, 800);
      setTimeout(() => {
        playPopSound(900); // Eyes pop 1
        playPopSound(950); // Eyes pop 2
        setEyesRevealed(true);
      }, 1400);
      setTimeout(() => {
        playPopSound(600);
        setNoseRevealed(true);
      }, 1900);
      setTimeout(() => {
        playPopSound(800);
        setMouthRevealed(true);
      }, 2300);
    }
  }, [beatIdx]);

  const advance = () => {
    if (isLast) {
      setVisible(false);
      setTimeout(() => onComplete?.(), 600);
      return;
    }
    setBeatIdx(b => b + 1);
  };

  // Auto-speak
  useEffect(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = beat.text || beat.sub.replace(/\*[^*]+\*/g, '').replace(/[🔊💨]/g, '').trim();
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88; u.pitch = 1.15; u.volume = 0.85;
    window.speechSynthesis.speak(u);
    return () => window.speechSynthesis.cancel();
  }, [beatIdx]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #0d1f35 0%, #070b14 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Star field */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 0.5,
                height: Math.random() * 2 + 0.5,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3 + 0.05,
              }}
              animate={{ opacity: [0.05, 0.4, 0.05] }}
              transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,212,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Header */}
        <motion.div
          className="absolute top-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-bold tracking-[0.3em] text-[#00d4aa] uppercase">Invest In Neural Trading</p>
        </motion.div>

        {/* Dropped bulb + node effects */}
        <AnimatePresence>
          {showDroppedBulb && (
            <>
              <BornLightBulb armRevealed={armRevealed} eyesRevealed={eyesRevealed} noseRevealed={noseRevealed} mouthRevealed={mouthRevealed} />
              {showNodeSparks && <NodeSparks />}
              {showNodeRain && <NodeRain />}
            </>
          )}
        </AnimatePresence>

        {/* Robot */}
        <motion.div
          key={`char-${beat.id}`}
          className="relative z-10"
          animate={{
            y: beat.id === 'exit' ? 0 : [0, -3, 0],
            x: beat.x || 0,
            rotateY: beat.facing ? 180 : 0,
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: beat.id === 'exit' ? 0.5 : 0.4, ease: 'easeOut' },
            rotateY: { duration: 0.5 },
          }}
          initial={{ x: beat.id === 'enter' ? -400 : beat.id === 'reenter' ? 400 : undefined }}
        >
          <motion.div animate={{ rotateY: beat.headTwist }}>
            <LightbulbGuy
              mood={beat.text === 'AHA!' ? 'aha' : 'idle'}
              gloveLeft={beat.gloveLeft || 'down'}
              gloveRight={beat.gloveRight || 'down'}
              chestOpen={beat.chestOpen || false}
              showCodeEyes={beat.showCodeEyes || false}
              facingBack={beat.facing || false}
              size={200}
            />
          </motion.div>
        </motion.div>

        {/* Speech bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bubble-${beatIdx}`}
            className="max-w-md mx-4 mt-4 relative z-10"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.35 }}
          >
            {beat.text && (
              <p className="text-xl font-bold text-[#f1f5f9] text-center mb-1 tracking-wide">{beat.text}</p>
            )}
            {beat.sub && (
              <div className="bg-[#0f172a]/90 border border-[#fbbf24]/25 rounded-2xl px-5 py-3 text-center">
                <p className="text-sm text-[#cbd5e1] leading-relaxed italic">{beat.sub}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress dots + controls */}
        <div className="absolute bottom-8 flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {BEATS.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i === beatIdx ? '#fbbf24' : i < beatIdx ? '#00d4aa' : '#1e293b',
                  transform: i === beatIdx ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={advance}
              className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ background: '#fbbf24', color: '#070b14', boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}
            >
              {isLast ? '✨ Enter IINT' : 'Continue →'}
            </button>
            <button onClick={() => { setVisible(false); onComplete?.(); }}
              className="text-xs text-[#334155] hover:text-[#64748b] transition-colors">
              skip
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}