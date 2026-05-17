import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RobotCreatorScene — Cinematic intro for Robot Person
 * 
 * Sequence:
 * 1. Robot stands idle, chest panel closed
 * 2. Eyes light up — node beams shoot from eyes outward (matrix + magic)
 * 3. Nodes swirl and form a wireframe object in the air
 * 4. Wireframe collapses INTO the chest panel (teleport landing)
 * 5. Chest panel glows, processes (interior 3D printer + magic effect)
 * 6. Panel opens — digital-physical item extracted (glowing, solidifying)
 * 7. Robot presents item, panel closes
 */

// Wireframe object types that can be "created"
const CREATIONS = [
  { label: 'Strategy Blueprint',  color: '#00d4aa', shape: 'cube'     },
  { label: 'Neural Chart',        color: '#a78bfa', shape: 'pyramid'  },
  { label: 'Signal Matrix',       color: '#fbbf24', shape: 'diamond'  },
  { label: 'Risk Shield',         color: '#3b82f6', shape: 'shield'   },
];

// ── Node particle that shoots from eye ──
function NodeBeam({ startX, startY, targetX, targetY, color, delay, onArrive }) {
  return (
    <motion.div
      className="absolute rounded-full z-20"
      style={{
        width: 8, height: 8,
        background: color,
        boxShadow: `0 0 12px 4px ${color}`,
        left: startX, top: startY,
      }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: targetX - startX,
        y: targetY - startY,
        scale: [1, 1.8, 0.5],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 0.9, delay, ease: 'easeOut' }}
      onAnimationComplete={onArrive}
    />
  );
}

// ── Wireframe shape SVG ──
function WireframeShape({ shape, color, size = 80, solidify = 0 }) {
  const opacity = 0.4 + solidify * 0.6;
  const fill = `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},${solidify * 0.25})`;

  if (shape === 'cube') return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Front face */}
      <rect x="15" y="25" width="38" height="38" fill={fill} stroke={color} strokeWidth="1.5" opacity={opacity} />
      {/* Top face */}
      <polygon points="15,25 30,12 68,12 53,25" fill={fill} stroke={color} strokeWidth="1.5" opacity={opacity} />
      {/* Right face */}
      <polygon points="53,25 68,12 68,50 53,63" fill={fill} stroke={color} strokeWidth="1.5" opacity={opacity} />
      {/* Inner lines */}
      <line x1="15" y1="25" x2="30" y2="12" stroke={color} strokeWidth="1" opacity={opacity * 0.6} />
      <line x1="53" y1="25" x2="68" y2="12" stroke={color} strokeWidth="1" opacity={opacity * 0.6} />
      <line x1="53" y1="63" x2="68" y2="50" stroke={color} strokeWidth="1" opacity={opacity * 0.6} />
    </svg>
  );

  if (shape === 'pyramid') return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <polygon points="40,8 10,65 70,65" fill={fill} stroke={color} strokeWidth="1.5" opacity={opacity} />
      <line x1="40" y1="8" x2="40" y2="65" stroke={color} strokeWidth="1" opacity={opacity * 0.5} strokeDasharray="3,3" />
      <line x1="25" y1="36" x2="55" y2="36" stroke={color} strokeWidth="1" opacity={opacity * 0.5} strokeDasharray="3,3" />
      <ellipse cx="40" cy="65" rx="30" ry="8" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 0.4} />
    </svg>
  );

  if (shape === 'diamond') return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <polygon points="40,5 70,40 40,75 10,40" fill={fill} stroke={color} strokeWidth="1.5" opacity={opacity} />
      <line x1="10" y1="40" x2="70" y2="40" stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
      <line x1="40" y1="5"  x2="40" y2="75" stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
      <line x1="25" y1="22" x2="55" y2="58" stroke={color} strokeWidth="0.8" opacity={opacity * 0.4} />
      <line x1="55" y1="22" x2="25" y2="58" stroke={color} strokeWidth="0.8" opacity={opacity * 0.4} />
    </svg>
  );

  if (shape === 'shield') return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <path d="M40,6 L68,18 L68,42 Q68,64 40,74 Q12,64 12,42 L12,18 Z"
        fill={fill} stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M40,16 L58,24 L58,42 Q58,56 40,64 Q22,56 22,42 L22,24 Z"
        fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 0.5} strokeDasharray="3,2" />
      <line x1="40" y1="6" x2="40" y2="74" stroke={color} strokeWidth="0.8" opacity={opacity * 0.4} />
    </svg>
  );

  return null;
}

// ── SVG Robot body ──
function RobotBody({ eyesGlowing, chestOpen, chestProcessing, glowColor }) {
  return (
    <svg width="160" height="260" viewBox="0 0 160 260">
      <defs>
        <radialGradient id="headGrad" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
        <radialGradient id="bodyGrad" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
        <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <radialGradient id="chestGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── NECK ── */}
      <rect x="68" y="72" width="24" height="20" rx="4"
        fill="#475569" stroke="#334155" strokeWidth="1" />
      {/* Neck details */}
      <rect x="72" y="75" width="16" height="3" rx="1.5" fill="#334155" opacity="0.6" />
      <rect x="72" y="81" width="16" height="3" rx="1.5" fill="#334155" opacity="0.6" />
      <rect x="72" y="87" width="16" height="3" rx="1.5" fill="#334155" opacity="0.6" />

      {/* ── HEAD ── */}
      {/* Head base */}
      <rect x="28" y="12" width="104" height="62" rx="14"
        fill="url(#headGrad)" stroke="#64748b" strokeWidth="1.5" />
      {/* Head top dome */}
      <ellipse cx="80" cy="18" rx="48" ry="14"
        fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
      {/* Head panel lines */}
      <line x1="80" y1="12" x2="80" y2="74" stroke="#94a3b8" strokeWidth="0.8" opacity="0.4" />
      <rect x="38" y="20" width="84" height="46" rx="8"
        fill="#0f172a" stroke="#334155" strokeWidth="1" />

      {/* ── VISOR / SCREEN FACE ── dark interior display ── */}
      <rect x="42" y="24" width="76" height="38" rx="6"
        fill={eyesGlowing ? '#020c04' : '#070b14'}
        stroke={eyesGlowing ? glowColor : '#1e293b'}
        strokeWidth={eyesGlowing ? 1.5 : 1} />

      {/* Scanlines on visor */}
      {eyesGlowing && [0,1,2,3,4,5,6].map(i => (
        <line key={i} x1="42" y1={27 + i*5} x2="118" y2={27 + i*5}
          stroke={glowColor} strokeWidth="0.4" opacity="0.12" />
      ))}

      {/* ── EYES — glowing from inside screen ── */}
      {/* Left eye */}
      <ellipse cx="63" cy="43" rx="11" ry="8"
        fill={eyesGlowing ? glowColor : '#1e293b'}
        stroke={eyesGlowing ? glowColor : '#334155'} strokeWidth="1" opacity={eyesGlowing ? 1 : 0.5}>
        {eyesGlowing && (
          <animate attributeName="opacity" values="1;0.6;1" dur="0.4s" repeatCount="indefinite" />
        )}
      </ellipse>
      {eyesGlowing && (
        <ellipse cx="63" cy="43" rx="16" ry="12"
          fill="none" stroke={glowColor} strokeWidth="1" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Right eye */}
      <ellipse cx="97" cy="43" rx="11" ry="8"
        fill={eyesGlowing ? glowColor : '#1e293b'}
        stroke={eyesGlowing ? glowColor : '#334155'} strokeWidth="1" opacity={eyesGlowing ? 1 : 0.5}>
        {eyesGlowing && (
          <animate attributeName="opacity" values="1;0.6;1" dur="0.4s" repeatCount="indefinite" />
        )}
      </ellipse>
      {eyesGlowing && (
        <ellipse cx="97" cy="43" rx="16" ry="12"
          fill="none" stroke={glowColor} strokeWidth="1" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Mouth bar — status indicator */}
      <rect x="58" y="56" width="44" height="4" rx="2"
        fill={eyesGlowing ? glowColor : '#1e293b'} opacity={eyesGlowing ? 0.8 : 0.4} />

      {/* Head side details */}
      <circle cx="32" cy="43" r="7" fill="#334155" stroke="#475569" strokeWidth="1" />
      <circle cx="32" cy="43" r="3" fill="#1e293b" />
      <circle cx="128" cy="43" r="7" fill="#334155" stroke="#475569" strokeWidth="1" />
      <circle cx="128" cy="43" r="3" fill="#1e293b" />

      {/* ── SHOULDERS ── */}
      <ellipse cx="26" cy="108" rx="18" ry="14"
        fill="#64748b" stroke="#475569" strokeWidth="1.5" />
      <ellipse cx="134" cy="108" rx="18" ry="14"
        fill="#64748b" stroke="#475569" strokeWidth="1.5" />

      {/* ── ARMS ── */}
      {/* Left arm */}
      <rect x="10" y="118" width="22" height="70" rx="10"
        fill="url(#armGrad)" stroke="#475569" strokeWidth="1" />
      <rect x="12" y="140" width="18" height="8" rx="4"
        fill="#334155" opacity="0.6" />
      {/* Left hand */}
      <ellipse cx="21" cy="196" rx="13" ry="10"
        fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
      {[-6,-2,2,6].map((fx,i) => (
        <ellipse key={i} cx={21+fx} cy="188" rx="3.5" ry="5"
          fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
      ))}

      {/* Right arm */}
      <rect x="128" y="118" width="22" height="70" rx="10"
        fill="url(#armGrad)" stroke="#475569" strokeWidth="1" />
      <rect x="130" y="140" width="18" height="8" rx="4"
        fill="#334155" opacity="0.6" />
      {/* Right hand */}
      <ellipse cx="139" cy="196" rx="13" ry="10"
        fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
      {[-6,-2,2,6].map((fx,i) => (
        <ellipse key={i} cx={139+fx} cy="188" rx="3.5" ry="5"
          fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
      ))}

      {/* ── TORSO ── */}
      <rect x="30" y="90" width="100" height="100" rx="12"
        fill="url(#bodyGrad)" stroke="#475569" strokeWidth="1.5" />
      {/* Torso panel lines */}
      <line x1="80" y1="92" x2="80" y2="188" stroke="#94a3b8" strokeWidth="0.6" opacity="0.3" />
      <line x1="32" y1="140" x2="128" y2="140" stroke="#94a3b8" strokeWidth="0.6" opacity="0.3" />
      {/* Shoulder seams */}
      <path d="M30,100 Q26,108 28,120" stroke="#64748b" strokeWidth="1.5" fill="none" />
      <path d="M130,100 Q134,108 132,120" stroke="#64748b" strokeWidth="1.5" fill="none" />

      {/* ── CHEST PANEL — teleport landing zone ── */}
      <rect x="48" y="100" width="64" height="56" rx="10"
        fill={chestOpen ? '#001a0a' : '#0f172a'}
        stroke={chestProcessing || chestOpen ? glowColor : '#334155'}
        strokeWidth={chestProcessing || chestOpen ? 2 : 1.5} />

      {chestProcessing && !chestOpen && (
        /* Interior processing — 3D printer magic glow */
        <g>
          <rect x="50" y="102" width="60" height="52" rx="9"
            fill="#001a0a" />
          {/* Spinning rings */}
          <ellipse cx="80" cy="128" rx="22" ry="10"
            fill="none" stroke={glowColor} strokeWidth="1.2" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate"
              from="0 80 128" to="360 80 128" dur="1.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="80" cy="128" rx="14" ry="18"
            fill="none" stroke={glowColor} strokeWidth="1" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate"
              from="90 80 128" to="-270 80 128" dur="0.9s" repeatCount="indefinite" />
          </ellipse>
          {/* Core spark */}
          <circle cx="80" cy="128" r="5" fill={glowColor} opacity="0.8">
            <animate attributeName="r" values="5;9;5" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.6s" repeatCount="indefinite" />
          </circle>
          {/* Magic particles */}
          {[0,1,2,3,4,5].map(i => {
            const angle = (i / 6) * Math.PI * 2;
            const px = 80 + Math.cos(angle) * 18;
            const py = 128 + Math.sin(angle) * 12;
            return (
              <circle key={i} cx={px} cy={py} r="2.5"
                fill={['#00d4aa','#a78bfa','#fbbf24'][i%3]} opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.1;0.8"
                  dur={`${0.4+i*0.1}s`} repeatCount="indefinite" />
              </circle>
            );
          })}
          {/* Scan beam */}
          <rect x="52" y="128" width="56" height="2" fill={glowColor} opacity="0.3">
            <animateTransform attributeName="transform" type="translate"
              from="0,-26" to="0,26" dur="0.8s" repeatCount="indefinite" />
          </rect>
        </g>
      )}

      {chestOpen && (
        /* Panel open — extraction portal */
        <g>
          <rect x="50" y="102" width="60" height="52" rx="9"
            fill="#000d06" />
          {/* Portal ring */}
          <ellipse cx="80" cy="128" rx="26" ry="22"
            fill="none" stroke={glowColor} strokeWidth="2" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="80" cy="128" rx="20" ry="16"
            fill={glowColor} opacity="0.15">
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Open panel flaps — left and right */}
          <rect x="48" y="100" width="16" height="56" rx="4"
            fill="#1e293b" stroke={glowColor} strokeWidth="1"
            style={{ transformOrigin: '48px 128px' }}
          />
          <rect x="96" y="100" width="16" height="56" rx="4"
            fill="#1e293b" stroke={glowColor} strokeWidth="1" />
        </g>
      )}

      {!chestProcessing && !chestOpen && (
        /* Closed chest panel decoration */
        <g>
          {/* Center core ring */}
          <circle cx="80" cy="125" r="14"
            fill="none" stroke="#334155" strokeWidth="1.5" />
          <circle cx="80" cy="125" r="8"
            fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <circle cx="80" cy="125" r="4" fill="#334155" />
          {/* Status bars */}
          <rect x="54" y="142" width="52" height="3" rx="1.5" fill="#1e40af" opacity="0.7" />
          <rect x="54" y="148" width="36" height="3" rx="1.5" fill="#065f46" opacity="0.7" />
        </g>
      )}

      {/* ── LEGS ── */}
      <rect x="42" y="188" width="32" height="60" rx="10"
        fill="#475569" stroke="#334155" strokeWidth="1" />
      <rect x="86" y="188" width="32" height="60" rx="10"
        fill="#475569" stroke="#334155" strokeWidth="1" />
      {/* Knee joints */}
      <ellipse cx="58" cy="218" rx="14" ry="8"
        fill="#64748b" stroke="#475569" strokeWidth="1" />
      <ellipse cx="102" cy="218" rx="14" ry="8"
        fill="#64748b" stroke="#475569" strokeWidth="1" />
      {/* Feet */}
      <rect x="36" y="242" width="44" height="16" rx="8"
        fill="#334155" stroke="#1e293b" strokeWidth="1" />
      <rect x="80" y="242" width="44" height="16" rx="8"
        fill="#334155" stroke="#1e293b" strokeWidth="1" />

      {/* Glow aura when eyes active */}
      {eyesGlowing && (
        <ellipse cx="80" cy="43" rx="60" ry="40"
          fill="none" stroke={glowColor} strokeWidth="1" opacity="0.2">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}

// ── Floating node ring that forms the wireframe ──
function NodeRing({ color, targetX, targetY }) {
  const nodes = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    return {
      id: i,
      x: targetX + Math.cos(angle) * 55,
      y: targetY + Math.sin(angle) * 40,
      delay: i * 0.05,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {nodes.map(n => (
        <motion.div key={n.id}
          className="absolute rounded-full"
          style={{ width: 6, height: 6, background: color, left: n.x, top: n.y,
            boxShadow: `0 0 10px 3px ${color}` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0.6], scale: [0, 1.4, 1, 0.8] }}
          transition={{ duration: 0.5, delay: n.delay }}
        />
      ))}
      {/* Connecting lines (SVG overlay) */}
      <svg className="absolute inset-0 w-full h-full">
        {nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return (
            <motion.line key={i}
              x1={n.x + 3} y1={n.y + 3}
              x2={next.x + 3} y2={next.y + 3}
              stroke={color} strokeWidth="1" opacity="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 0.4, delay: n.delay + 0.2 }}
            />
          );
        })}
        {/* Cross connections */}
        {[0,3,6,9].map(i => {
          const opp = nodes[(i + 6) % 12];
          return (
            <motion.line key={`x${i}`}
              x1={nodes[i].x + 3} y1={nodes[i].y + 3}
              x2={opp.x + 3} y2={opp.y + 3}
              stroke={color} strokeWidth="0.6" opacity="0.3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ── Main Scene ──
const PHASES = [
  'idle',        // Robot standing
  'eyes_glow',   // Eyes light up
  'nodes_shoot', // Nodes fire from eyes
  'form',        // Nodes form wireframe in air
  'collapse',    // Wireframe collapses into chest
  'process',     // Chest processes (interior magic)
  'open',        // Chest opens
  'extract',     // Item emerges
  'present',     // Robot presents item
  'done',
];

export default function RobotCreatorScene({ onComplete, creation = null }) {
  const [phase, setPhase] = useState('idle');
  const [creationData] = useState(creation || CREATIONS[Math.floor(Math.random() * CREATIONS.length)]);
  const [solidify, setSolidify] = useState(0);
  const [beams, setBeams] = useState([]);
  const containerRef = useRef(null);
  const solidifyRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const glowColor = creationData.color;

  // Auto-advance through phases
  useEffect(() => {
    const timings = {
      idle:        1200,
      eyes_glow:   1000,
      nodes_shoot: 1200,
      form:        1800,
      collapse:    800,
      process:     2200,
      open:        600,
      extract:     1000,
      present:     2800,
    };

    if (phase === 'done') return;

    // Shoot beams when entering nodes_shoot
    if (phase === 'nodes_shoot') {
      const newBeams = Array.from({ length: 14 }, (_, i) => ({
        id: i,
        delay: i * 0.06,
        startX: i < 7 ? 120 : 196, // left eye, right eye (approx container coords)
        startY: 80,
        targetX: 160 + (Math.random() - 0.5) * 200,
        targetY: 60 + Math.random() * 120,
      }));
      setBeams(newBeams);
    }

    // Solidify extraction
    if (phase === 'extract') {
      let s = 0;
      solidifyRef.current = setInterval(() => {
        s += 0.04;
        setSolidify(Math.min(s, 1));
        if (s >= 1) clearInterval(solidifyRef.current);
      }, 40);
    }

    const nextPhase = PHASES[PHASES.indexOf(phase) + 1];
    if (!nextPhase) return;
    const timer = setTimeout(() => setPhase(nextPhase), timings[phase] || 1000);
    return () => {
      clearTimeout(timer);
      if (solidifyRef.current) clearInterval(solidifyRef.current);
    };
  }, [phase]);

  const eyesGlowing = ['eyes_glow','nodes_shoot','form','collapse','process','open','extract','present'].includes(phase);
  const chestProcessing = phase === 'process';
  const chestOpen = ['open','extract','present'].includes(phase);
  const showWireframe = ['form','collapse'].includes(phase);
  const showExtracted = ['extract','present'].includes(phase);
  const showNodeRing = phase === 'form';

  return (
    <div ref={containerRef}
      className="relative flex flex-col items-center justify-center select-none"
      style={{ minHeight: 420, minWidth: 340 }}>

      {/* Background glow */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${glowColor}18 0%, transparent 70%)` }}
          animate={{ opacity: eyesGlowing ? 1 : 0.3 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Phase label */}
      <motion.div className="absolute top-3 left-0 right-0 text-center z-30"
        key={phase}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <span className="text-[10px] font-mono tracking-widest uppercase"
          style={{ color: glowColor, opacity: 0.7 }}>
          {phase.replace('_', ' ')}
        </span>
      </motion.div>

      {/* Node beams from eyes */}
      <AnimatePresence>
        {phase === 'nodes_shoot' && beams.map(b => (
          <NodeBeam key={b.id}
            startX={b.startX} startY={b.startY}
            targetX={b.targetX} targetY={b.targetY}
            color={glowColor} delay={b.delay}
          />
        ))}
      </AnimatePresence>

      {/* Node ring forming wireframe in air */}
      <AnimatePresence>
        {showNodeRing && (
          <div className="absolute" style={{ top: 30, left: '50%', transform: 'translateX(-50%)' }}>
            <NodeRing color={glowColor} targetX={40} targetY={60} />
          </div>
        )}
      </AnimatePresence>

      {/* Wireframe object floating above robot */}
      <AnimatePresence>
        {showWireframe && (
          <motion.div
            className="absolute z-20"
            style={{ top: 10, left: '50%', transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{
              opacity: phase === 'collapse' ? [1, 0] : 1,
              scale: phase === 'collapse' ? [1, 0.1] : [0.6, 1, 0.95, 1],
              y: phase === 'collapse' ? [0, 120] : 0,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: phase === 'collapse' ? 0.7 : 0.6 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <WireframeShape shape={creationData.shape} color={glowColor} size={90} solidify={0.5} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot */}
      <motion.div
        className="relative z-10"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <RobotBody
          eyesGlowing={eyesGlowing}
          chestOpen={chestOpen}
          chestProcessing={chestProcessing}
          glowColor={glowColor}
        />
      </motion.div>

      {/* Extracted item emerging from chest */}
      <AnimatePresence>
        {showExtracted && (
          <motion.div
            className="absolute z-30"
            style={{ top: 148, left: '50%', transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: phase === 'present' ? -80 : -20 }}
            transition={{ duration: 0.8, ease: 'backOut' }}
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <WireframeShape shape={creationData.shape} color={glowColor} size={70} solidify={solidify} />
            </motion.div>
            {/* Item label */}
            {phase === 'present' && (
              <motion.div
                className="text-center mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-xs font-bold font-mono" style={{ color: glowColor }}>
                  {creationData.label}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ground shadow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="w-28 h-3 rounded-full" style={{
          background: `radial-gradient(ellipse, ${glowColor}30, transparent 70%)`
        }} />
      </div>

      {/* Controls */}
      {phase === 'done' || phase === 'present' ? (
        <motion.div
          className="absolute bottom-6 flex gap-3 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <button
            onClick={() => { setPhase('idle'); setSolidify(0); setBeams([]); }}
            className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105"
            style={{ borderColor: glowColor, color: glowColor, background: `${glowColor}15` }}
          >
            ↺ Replay
          </button>
          {onComplete && (
            <button
              onClick={onComplete}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: glowColor, color: '#070b14' }}
            >
              Continue →
            </button>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}