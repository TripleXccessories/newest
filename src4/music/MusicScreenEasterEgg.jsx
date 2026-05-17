import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LightbulbGuy from '@/components/effects/LightbulbGuy';
import DancingCharacter from './DancingCharacter';
import RobotDancer from './RobotDancer';
import ZapBeam from './ZapBeam';
import FinaleScene from './FinaleScene';
import PanicExit from './PanicExit';

/**
 * MusicScreenEasterEgg
 * 
 * Hidden theatre that activates only when the music player has been in
 * fullscreen for >= MIN_IDLE_MS without user interaction.
 * 
 * State machine:
 *   idle → char_drop → dancing → robot_arrives → zapping → transformed →
 *   finale → exit  (or at any point: interrupted → panic)
 * 
 * Props:
 *   isFullscreen   — boolean, player is in fullscreen
 *   trackDuration  — number, current track duration in seconds (need >= 45min total)
 *   onInterrupt    — called when user interaction detected mid-scene
 */

// How long user must be idle in fullscreen before the show starts (ms)
const MIN_IDLE_MS = 3 * 60 * 1000; // 3 min — adjustable
// Min total track time remaining required to even attempt the sequence
const MIN_TRACK_SECONDS = 45 * 60;

// Full master cast — order of appearance
const FULL_CAST = [
  { id: 'lightbulb',   label: 'The Lightbulb',       color: '#fbbf24', danceStyle: 'bounce'   },
  { id: 'pathfinder',  label: 'Da Mosaic Pathfinder', color: '#00d4aa', danceStyle: 'sway'     },
  { id: 'weaver',      label: 'Da Iridescent Weaver', color: '#fb7185', danceStyle: 'spin'     },
  { id: 'ember',       label: 'Da Phoenix Ember',     color: '#f97316', danceStyle: 'flap'     },
  { id: 'analyst',     label: 'Da Crystal Analyst',   color: '#c084fc', danceStyle: 'glitch'   },
  { id: 'conductor',   label: 'Da Arc Conductor',     color: '#0ea5e9', danceStyle: 'conduct'  },
  { id: 'dialectic',   label: 'Da Iron Dialectic',    color: '#ef4444', danceStyle: 'stomp'    },
  { id: 'serpent',     label: 'Da Serpent Current',   color: '#166534', danceStyle: 'slither'  },
  { id: 'storm',       label: 'Da Storm Circuit',     color: '#7c3aed', danceStyle: 'jolt'     },
];

// Cast sets keyed by directive.cast
const CAST_SETS = {
  full:    ['lightbulb','pathfinder','weaver','ember','analyst','conductor','dialectic','serpent','storm'],
  minimal: ['lightbulb','pathfinder','analyst'],
  small:   ['lightbulb','pathfinder','weaver','serpent'],
  lofi:    ['lightbulb','pathfinder','weaver','serpent'],
  hype:    ['lightbulb','dialectic','storm','conductor','ember'],
};

// Drop delay multipliers per speed
const DROP_SPEED_MS = { fast: 2000, medium: 4000, slow: 7000 };

function buildCast(directive) {
  const ids = CAST_SETS[directive?.cast] || CAST_SETS.full;
  const interval = DROP_SPEED_MS[directive?.dropSpeed] || DROP_SPEED_MS.medium;
  return FULL_CAST
    .filter(c => ids.includes(c.id))
    .map((c, i) => ({ ...c, dropDelay: i * interval }));
}

// Legacy default cast for non-directed shows
const CAST = FULL_CAST.map((c, i) => ({ ...c, dropDelay: i * 4000 }));

// Stages
const STAGE = {
  IDLE:        'idle',
  CHAR_DROP:   'char_drop',
  DANCING:     'dancing',
  ROBOT_IN:    'robot_in',
  ZAPPING:     'zapping',
  TRANSFORMED: 'transformed',
  FINALE:      'finale',
  EXIT:        'exit',
  PANIC:       'panic',
  PAUSED:      'paused',
};

export default function MusicScreenEasterEgg({ isFullscreen, trackDuration = 0, onInterrupt, showDirective = null }) {
  const [stage, setStage] = useState(STAGE.IDLE);
  const [presentChars, setPresentChars] = useState([]); // ids on screen
  const [zappedChars, setZappedChars] = useState([]);   // ids that got zapped → real skin
  const [activeZap, setActiveZap] = useState(null);     // { from, to }
  const [robotPresent, setRobotPresent] = useState(false);
  const [interruptCount, setInterruptCount] = useState(0);
  // Derive active cast from directive (or fallback to default CAST)
  const activeCast = showDirective ? buildCast(showDirective) : CAST;

  const idleTimerRef  = useRef(null);
  const stageTimerRef = useRef(null);
  const dropTimersRef = useRef([]);
  const zapTimersRef  = useRef([]);
  const stageRef      = useRef(stage);

  // Keep ref in sync
  useEffect(() => { stageRef.current = stage; }, [stage]);

  // ── Idle detection ──────────────────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    if (!isFullscreen || trackDuration < MIN_TRACK_SECONDS) return;
    if ([STAGE.PANIC, STAGE.EXIT].includes(stageRef.current)) return;
    if (stageRef.current !== STAGE.IDLE && stageRef.current !== STAGE.PAUSED) return;

    idleTimerRef.current = setTimeout(() => {
      if (isFullscreen && stageRef.current === STAGE.IDLE) {
        beginShow();
      }
    }, MIN_IDLE_MS);
  }, [isFullscreen, trackDuration]);

  useEffect(() => {
    resetIdleTimer();
    return () => clearTimeout(idleTimerRef.current);
  }, [resetIdleTimer]);

  // Reset everything when fullscreen exits
  useEffect(() => {
    if (!isFullscreen) {
      fullReset();
    }
  }, [isFullscreen]);

  // ── User interaction = interrupt ───────────────────────────────────────────
  useEffect(() => {
    const onActivity = () => {
      const s = stageRef.current;
      const active = [STAGE.CHAR_DROP, STAGE.DANCING, STAGE.ROBOT_IN, STAGE.ZAPPING, STAGE.TRANSFORMED, STAGE.FINALE];
      if (active.includes(s)) {
        triggerPanic();
      } else if (s === STAGE.IDLE || s === STAGE.PAUSED) {
        resetIdleTimer();
      }
    };
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
    };
  }, [resetIdleTimer]);

  // ── Show lifecycle ─────────────────────────────────────────────────────────
  const fullReset = () => {
    clearAllTimers();
    setStage(STAGE.IDLE);
    setPresentChars([]);
    setZappedChars([]);
    setActiveZap(null);
    setRobotPresent(false);
  };

  const clearAllTimers = () => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(stageTimerRef.current);
    dropTimersRef.current.forEach(clearTimeout);
    zapTimersRef.current.forEach(clearTimeout);
    dropTimersRef.current = [];
    zapTimersRef.current = [];
  };

  const beginShow = () => {
    const cast = activeCast;
    const directive = showDirective;
    setStage(STAGE.CHAR_DROP);
    setPresentChars([]);

    const robotDelay = directive?.robotEarly ? 6000 : 15000;
    const skipRobot = directive?.skipFinale && !directive?.robotEarly;

    // Drop each character in sequence
    cast.forEach((char, idx) => {
      const t = setTimeout(() => {
        setPresentChars(prev => [...prev, char.id]);
        // After all chars dropped, move to group dancing
        if (idx === cast.length - 1) {
          stageTimerRef.current = setTimeout(() => {
            setStage(STAGE.DANCING);
            if (skipRobot) {
              // No robot — go straight to finale after dancing
              stageTimerRef.current = setTimeout(() => {
                setStage(STAGE.FINALE);
                stageTimerRef.current = setTimeout(() => {
                  setStage(STAGE.EXIT);
                  stageTimerRef.current = setTimeout(fullReset, 4000);
                }, 12000);
              }, 20000);
            } else {
              stageTimerRef.current = setTimeout(() => {
                setRobotPresent(true);
                setStage(STAGE.ROBOT_IN);
                stageTimerRef.current = setTimeout(() => {
                  setStage(STAGE.ZAPPING);
                  startZapping(cast, directive);
                }, 8000);
              }, robotDelay);
            }
          }, 3000);
        }
      }, char.dropDelay);
      dropTimersRef.current.push(t);
    });
  };

  const startZapping = (cast = activeCast, directive = showDirective) => {
    const companions = cast.filter(c => c.id !== 'lightbulb');
    companions.forEach((char, idx) => {
      const t = setTimeout(() => {
        // Show zap beam
        setActiveZap({ from: 'robot', to: char.id });
        setTimeout(() => {
          setActiveZap(null);
          setZappedChars(prev => [...prev, char.id]);
          // If all zapped, move to transformed
          if (idx === companions.length - 1) {
            stageTimerRef.current = setTimeout(() => {
              setStage(STAGE.TRANSFORMED);
              // Finale after 8s of transformed dancing
              stageTimerRef.current = setTimeout(() => {
                setStage(STAGE.FINALE);
                // Auto exit after finale
                stageTimerRef.current = setTimeout(() => {
                  setStage(STAGE.EXIT);
                  stageTimerRef.current = setTimeout(fullReset, 4000);
                }, 12000);
              }, 8000);
            }, 2000);
          }
        }, 1200);
      }, idx * 5000);
      zapTimersRef.current.push(t);
    });
  };

  const triggerPanic = () => {
    clearAllTimers();
    setInterruptCount(c => c + 1);
    setStage(STAGE.PANIC);
    // After panic exit animation completes, reset to paused (wait for next long track)
    stageTimerRef.current = setTimeout(() => {
      fullReset();
      setStage(STAGE.PAUSED);
      // Resume idle watching after 30s
      stageTimerRef.current = setTimeout(() => {
        setStage(STAGE.IDLE);
        resetIdleTimer();
      }, 30000);
    }, 4000);
    onInterrupt?.();
  };

  // Don't render anything when idle/paused/not fullscreen
  if (!isFullscreen || stage === STAGE.IDLE || stage === STAGE.PAUSED) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>

        {/* ── Characters on screen ─────────────────────────── */}
        {stage !== STAGE.PANIC && stage !== STAGE.EXIT && presentChars.map((charId, idx) => {
          const char = activeCast.find(c => c.id === charId);
          if (!char) return null;
          const isZapped = zappedChars.includes(charId);
          const isTransformed = isZapped && stage === STAGE.TRANSFORMED;
          const xPos = getCharXPos(idx, activeCast.length);

          return (
            <DancingCharacter
              key={charId}
              char={char}
              xPos={xPos}
              stage={stage}
              isZapped={isZapped}
              isTransformed={isTransformed}
              dancing={[STAGE.DANCING, STAGE.ROBOT_IN, STAGE.ZAPPING, STAGE.TRANSFORMED, STAGE.FINALE].includes(stage)}
            />
          );
        })}

        {/* ── Robot ────────────────────────────────────────── */}
        {robotPresent && stage !== STAGE.PANIC && stage !== STAGE.EXIT && (
          <RobotDancer
            key="robot"
            stage={stage}
            doing_robot={[STAGE.ROBOT_IN, STAGE.ZAPPING, STAGE.TRANSFORMED, STAGE.FINALE].includes(stage)}
          />
        )}

        {/* ── Zap beam ─────────────────────────────────────── */}
        {activeZap && (
          <ZapBeam key={`zap-${activeZap.to}`} from={activeZap.from} to={activeZap.to} />
        )}

        {/* ── Finale scene ──────────────────────────────────── */}
        {stage === STAGE.FINALE && (
          <FinaleScene key="finale" cast={activeCast} />
        )}

        {/* ── Exit sweep ───────────────────────────────────── */}
        {stage === STAGE.EXIT && (
          <ExitSweep key="exit" cast={activeCast} />
        )}

        {/* ── Panic exit ───────────────────────────────────── */}
        {stage === STAGE.PANIC && (
          <PanicExit
            key="panic"
            cast={presentChars.map(id => activeCast.find(c => c.id === id)).filter(Boolean)}
            robotPresent={robotPresent}
          />
        )}

      </AnimatePresence>
    </div>
  );
}

// Spread characters evenly across screen width
function getCharXPos(idx, total) {
  const margin = 8; // percent
  const range = 100 - margin * 2;
  return margin + (range / Math.max(total - 1, 1)) * idx;
}

// Orderly exit — chars wave and float off screen
function ExitSweep({ cast }) {
  return (
    <>
      {cast.map((char, i) => (
        <motion.div
          key={char.id}
          className="absolute bottom-24"
          style={{ left: `${getCharXPos(i, cast.length)}%`, transform: 'translateX(-50%)' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -120 }}
          transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeIn' }}
        >
          <div className="text-3xl">{getCharEmoji(char.id)}</div>
        </motion.div>
      ))}
    </>
  );
}

function getCharEmoji(id) {
  const map = { lightbulb: '💡', pathfinder: '🗺️', weaver: '🧵', ember: '🔥', analyst: '🔮',
    conductor: '⚡', dialectic: '⚔️', serpent: '🐍', storm: '🌩️' };
  return map[id] || '✨';
}