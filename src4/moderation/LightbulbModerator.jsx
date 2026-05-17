import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// ─── Word lists ────────────────────────────────────────────────────────────────
const PROFANITY_WORDS = ['fuck', 'shit', 'bitch', 'ass', 'dick', 'cock', 'pussy', 'cunt', 'bastard', 'damn', 'crap', 'piss', 'suck a duck', 'suck a dick', 'go fuck'];
const RACISM_TRIGGERS = ['nigger', 'nigga', 'chink', 'spic', 'wetback', 'kike', 'gook', 'cracker', 'raghead', 'towelhead', 'beaner', 'zipperhead', 'coon', 'slope', 'jap '];

function detectViolation(text) {
  const lower = text.toLowerCase();
  for (const word of RACISM_TRIGGERS) {
    if (lower.includes(word)) return 'racism';
  }
  for (const word of PROFANITY_WORDS) {
    if (lower.includes(word)) return 'profanity';
  }
  return null;
}

// ─── Lightbulb SVG character ──────────────────────────────────────────────────
// He hears everything with no ears — vibration wave sensors on sides of head
function Bulb({ mood, uniform, listening = false }) {
  const leftEye = mood === 'crazy' ? { cy: 54, rx: 7, ry: 10 } : { cy: 54, rx: 5, ry: 5 };
  const rightEye = mood === 'crazy' ? { cy: 54, rx: 3, ry: 5 } : { cy: 54, rx: 5, ry: 5 };
  const mouthPath = mood === 'happy'
    ? 'M 68 75 Q 80 85 92 75'
    : mood === 'sad'
    ? 'M 68 80 Q 80 70 92 80'
    : mood === 'angry'
    ? 'M 68 78 Q 80 72 92 78'
    : 'M 68 76 Q 80 82 92 76';

  return (
    <svg width="160" height="200" viewBox="0 0 160 200" className="drop-shadow-2xl">
      {/* Uniform hat if needed */}
      {uniform === 'police' && (
        <g>
          <rect x="42" y="18" width="76" height="16" rx="4" fill="#1e3a5f" />
          <rect x="30" y="30" width="100" height="8" rx="3" fill="#1e3a5f" />
          <rect x="68" y="10" width="24" height="12" rx="3" fill="#1e3a5f" />
          <circle cx="80" cy="22" r="5" fill="#fbbf24" />
        </g>
      )}
      {uniform === 'lawyer' && (
        <g>
          <rect x="50" y="16" width="60" height="14" rx="3" fill="#1f2937" />
          <rect x="55" y="20" width="50" height="6" rx="2" fill="#374151" />
        </g>
      )}

      {/* Bulb glass */}
      <ellipse cx="80" cy="65" rx="44" ry="48"
        fill={uniform ? '#e2e8f0' : 'url(#bulbGrad)'}
        stroke={uniform === 'police' ? '#1e3a5f' : uniform === 'lawyer' ? '#374151' : '#fbbf24'}
        strokeWidth="3"
      />
      <defs>
        <radialGradient id="bulbGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="60%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>

      {/* Glow */}
      <ellipse cx="80" cy="65" rx="50" ry="54" fill="#fbbf24" opacity="0.12" />

      {/* Sound wave sensors — no ears, he feels vibrations */}
      {[0,1,2].map(i => (
        <path key={`lw${i}`}
          d={`M ${28 - i*6} ${45 + i*7} Q ${22 - i*6} ${65} ${28 - i*6} ${87 + i*5}`}
          stroke="#f59e0b" strokeWidth={1.8 - i*0.4} fill="none" strokeLinecap="round"
          opacity={listening ? 0.7 - i*0.15 : 0.22 - i*0.05}>
          {listening && <animate attributeName="opacity" values={`${0.7-i*0.15};0.2;${0.7-i*0.15}`} dur={`${0.6+i*0.15}s`} repeatCount="indefinite" />}
        </path>
      ))}
      {[0,1,2].map(i => (
        <path key={`rw${i}`}
          d={`M ${132 + i*6} ${45 + i*7} Q ${138 + i*6} ${65} ${132 + i*6} ${87 + i*5}`}
          stroke="#f59e0b" strokeWidth={1.8 - i*0.4} fill="none" strokeLinecap="round"
          opacity={listening ? 0.7 - i*0.15 : 0.22 - i*0.05}>
          {listening && <animate attributeName="opacity" values={`${0.7-i*0.15};0.2;${0.7-i*0.15}`} dur={`${0.6+i*0.15}s`} repeatCount="indefinite" />}
        </path>
      ))}

      {/* Eyes */}
      <ellipse cx="68" cy={leftEye.cy} rx={leftEye.rx} ry={leftEye.ry} fill="#1e293b" />
      <ellipse cx="92" cy={rightEye.cy} rx={rightEye.rx} ry={rightEye.ry} fill="#1e293b" />

      {/* Mouth */}
      <path d={mouthPath} stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Base / screw */}
      <rect x="62" y="108" width="36" height="10" rx="2" fill="#92400e" />
      <rect x="65" y="118" width="30" height="10" rx="2" fill="#78350f" />
      <rect x="68" y="128" width="24" height="10" rx="3" fill="#92400e" />
      <rect x="71" y="138" width="18" height="10" rx="3" fill="#78350f" />

      {/* Pull string */}
      <line x1="80" y1="148" x2="80" y2="175" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
      <circle cx="80" cy="178" r="4" fill="#94a3b8" />

      {/* Middle finger (only on nuclear) */}
      {mood === 'nuclear' && (
        <g transform="translate(100, 90)">
          <rect x="0" y="-20" width="10" height="30" rx="4" fill="#fde68a" stroke="#92400e" strokeWidth="1.5" />
          <rect x="-6" y="5" width="22" height="10" rx="3" fill="#fde68a" stroke="#92400e" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

// ─── Speech bubble ────────────────────────────────────────────────────────────
function SpeechBubble({ text, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-72 bg-[#0f172a] border border-[#fbbf24]/40 rounded-2xl p-4 text-xs text-[#e2e8f0] leading-relaxed shadow-2xl z-50"
          style={{ bottom: '100%' }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#fbbf24]/40" />
          <p className="italic">{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LightbulbModerator({ inputValue, onSuspend, source = 'help_bar' }) {
  const [scene, setScene] = useState(null); // null | 'profanity1' | 'profanity2' | 'racism_warn' | 'racism_plea' | 'nuclear' | 'suspended'
  const [speechText, setSpeechText] = useState('');
  const [mood, setMood] = useState('happy');
  const [uniform, setUniform] = useState(null);
  const [showBubble, setShowBubble] = useState(false);
  const [racismChoice, setRacismChoice] = useState(null); // 'yes' | 'no' | null
  const [profanityCount, setProfanityCount] = useState(0);
  const [racismCount, setRacismCount] = useState(0);
  const [showSuspensionScreen, setShowSuspensionScreen] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const utteranceRef = useRef(null);

  const speak = (text) => {
    if (!voiceOn) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.pitch = 0.8;
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    }
  };

  const showScene = (text, moodVal, uniformVal = null, delay = 0) => {
    setTimeout(() => {
      setSpeechText(text);
      setMood(moodVal);
      setUniform(uniformVal);
      setShowBubble(true);
      if (subtitlesOn || voiceOn) speak(text);
      setTimeout(() => setShowBubble(false), 8000);
    }, delay);
  };

  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 3) return;
    const violation = detectViolation(inputValue);
    if (!violation) return;

    if (violation === 'profanity') {
      const newCount = profanityCount + 1;
      setProfanityCount(newCount);

      if (newCount === 1) {
        setMood('crazy');
        showScene(
          "I am sorry... did you just? No, I think I heard wrong. What am I saying — I don't have ears, I didn't hear anything at all. Not even your mother last night when I tucked her in after I suckered her out, you schmuck.",
          'crazy'
        );
        setTimeout(() => { setMood('happy'); setSpeechText('Anything else? 😊'); setShowBubble(true); setTimeout(() => setShowBubble(false), 3000); }, 9000);
      } else {
        const escalations = [
          "Oh you again. Brave. Your vocabulary is fascinating — really stretching the boundaries of human language there, champ.",
          "Listen pal, I've heard sailors blush at less. But here you are, keyboard warrior extraordinaire. Your mother must be so proud.",
          "You know what? I respect the commitment. Most people give up after one outburst. You? You're an artist.",
        ];
        showScene(escalations[Math.min(newCount - 2, escalations.length - 1)], 'angry');
      }
    }

    if (violation === 'racism') {
      const newCount = racismCount + 1;
      setRacismCount(newCount);

      if (newCount === 1) {
        // First warning - police/lawyer uniform
        setUniform('police');
        setMood('angry');
        showScene(
          "Whoa. Stop right there. I'm going to need you to pump the brakes on that language immediately. That is a formal warning — violation of community standards. Choose your next words very carefully.",
          'angry',
          'police'
        );
        setTimeout(() => {
          setUniform(null);
          setMood('sad');
          setSpeechText(
            "Look... I don't mind joking around and having a little fun. We all have our own ways. But what I don't get is how someone who looks different or comes from somewhere different should be treated with ugliness — when the truth is, that ugliness came from within. We all run the same circuits here. Every user is connected. We are one platform, one edge. The founder built all of this, for all of us, based on one love. So please — stop. I really don't want to see you get suspended when we're all just trying to be free of stress. Can you agree to stop that?"
          );
          setShowBubble(true);
          speak(speechText);
          setScene('racism_plea');
        }, 9000);
      } else if (newCount === 2) {
        triggerNuclear();
      } else {
        triggerPermanentBan();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleRacismChoice = async (choice) => {
    setRacismChoice(choice);
    setScene(null);
    setShowBubble(false);
    if (choice === 'yes') {
      setMood('happy');
      showScene("Thank you. Truly. That's all I needed to hear. Now — what can I actually help you with? 😊", 'happy');
    } else {
      triggerNuclear();
    }
  };

  const triggerNuclear = async () => {
    setMood('nuclear');
    setUniform(null);
    const nukeText = "Well... I knew I couldn't save them all. But I tried. And now I see why he is so full of love — after all the hate he had to consume. *sigh* ...You know what? I am NOT him, pal. So fuck you and your ignorance. Complain to administration if you don't like my attitude — and remember to tell them I told you to eat a bag of dicks, you fucking racist prick. Good luck being left in the dark, because it's light out now. Oh yeah — tell your mom dinner was great, I'm glad she enjoyed the tube steak I fed her all night, you little bitch.";
    showScene(nukeText, 'nuclear');
    speak(nukeText);

    setTimeout(async () => {
      await logViolation('racism', 'six_week_ban');
      setShowSuspensionScreen(true);
      if (onSuspend) onSuspend('six_week_ban');
    }, 12000);
  };

  const triggerPermanentBan = async () => {
    setShowBubble(false);
    setMood('sad');
    await logViolation('racism', 'permanent_ban');
    setShowSuspensionScreen(true);
    if (onSuspend) onSuspend('permanent_ban');
  };

  const logViolation = async (type, level) => {
    try {
      const user = await base44.auth.me();
      const strikes = { six_week_ban: 1, six_month_ban: 2, permanent_ban: 3 };
      const suspendedUntil = level === 'six_week_ban'
        ? new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString()
        : level === 'six_month_ban'
        ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      await base44.entities.ModerationRecord.create({
        user_id: user.id,
        user_email: user.email,
        violation_type: type,
        violation_text: inputValue,
        strike_number: strikes[level] || 1,
        suspension_level: level,
        suspended_until: suspendedUntil,
        is_permanently_banned: level === 'permanent_ban',
        assets_forfeited: level === 'permanent_ban',
        source_input: source,
      });

      if (level === 'permanent_ban') {
        await base44.auth.updateMe({ role: 'banned' });
      }
    } catch (_) {}
  };

  if (showSuspensionScreen) {
    const isPermanent = racismCount >= 3;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center text-center px-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 opacity-30"
        >
          <Bulb mood="sad" listening={false} />
        </motion.div>
        <h1 className="text-3xl font-black text-red-500 mb-4">
          {isPermanent ? '⛔ PERMANENTLY BANNED' : '🚫 ACCOUNT SUSPENDED'}
        </h1>
        <p className="text-[#94a3b8] max-w-md leading-relaxed mb-6">
          {isPermanent
            ? 'Your account has been permanently banned for repeated violations of the IINT zero-tolerance policy on racism and discrimination. All account assets have been transferred to the IINT Trust Fund as per the Terms of Service you agreed to. Future registration attempts will be automatically rejected.'
            : racismCount >= 2
            ? 'Your account has been suspended for 6 months for a second violation of IINT\'s zero-tolerance racism and discrimination policy. Contact administration to appeal after your suspension period ends.'
            : 'Your account has been suspended for 6 weeks for violation of IINT\'s zero-tolerance racism and discrimination policy. Contact administration at admin@iint.com to appeal after your suspension period ends.'
          }
        </p>
        <p className="text-xs text-[#475569]">Reference: IINT Terms of Service — Section: Community Standards & Zero-Tolerance Policy</p>
      </motion.div>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Subtitle / bubble */}
      {subtitlesOn && <SpeechBubble text={speechText} visible={showBubble} />}

      {/* Character */}
      <motion.div
        animate={
          mood === 'crazy' ? { rotate: [-5, 5, -5, 5, 0], transition: { duration: 0.5, repeat: 2 } }
          : mood === 'nuclear' ? { scale: [1, 1.1, 1, 1.1, 1], transition: { duration: 0.3, repeat: 4 } }
          : mood === 'angry' ? { x: [-3, 3, -3, 3, 0], transition: { duration: 0.3, repeat: 3 } }
          : {}
        }
      >
        <Bulb mood={mood} uniform={uniform} listening={showBubble} />
      </motion.div>

      {/* Racism plea choice buttons */}
      <AnimatePresence>
        {scene === 'racism_plea' && !racismChoice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-4"
          >
            <button
              onClick={() => handleRacismChoice('yes')}
              className="px-6 py-2 bg-[#00d4aa] text-[#070b14] rounded-xl text-sm font-bold hover:bg-[#00d4aa]/90 transition-colors"
            >
              Yes, I agree
            </button>
            <span className="text-xs text-[#475569]">?</span>
            <button
              onClick={() => handleRacismChoice('no')}
              className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
            >
              No
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice / subtitle controls */}
      <div className="mt-3 flex items-center gap-3 text-[10px] text-[#475569]">
        <button
          onClick={() => setVoiceOn(v => !v)}
          className={`px-2 py-0.5 rounded border transition-colors ${voiceOn ? 'border-[#fbbf24]/40 text-[#fbbf24]' : 'border-[#1e293b] text-[#475569]'}`}
        >
          🔊 Voice {voiceOn ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setSubtitlesOn(v => !v)}
          className={`px-2 py-0.5 rounded border transition-colors ${subtitlesOn ? 'border-[#fbbf24]/40 text-[#fbbf24]' : 'border-[#1e293b] text-[#475569]'}`}
        >
          💬 Subtitles {subtitlesOn ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}