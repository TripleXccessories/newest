import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * RobotDancer — Futuristic humanoid robot.
 * Rounded skull head with screen face (expressive eyes/mouth, code mode, matrix mode).
 * Fully articulated arms/legs that spin and rotate for "the robot" dance.
 * Chest compartment opens. "base44" inscribed on torso. Silent — never speaks.
 */

// ── Screen face modes ────────────────────────────────────────────────────────
function ScreenFace({ mode = 'happy', stage }) {
  // mode: 'happy' | 'excited' | 'thinking' | 'coding' | 'matrix' | 'zap'
  const isMatrix = mode === 'matrix' || mode === 'thinking';
  const isCoding = mode === 'coding';
  const isZap = mode === 'zap';

  return (
    <svg width="44" height="36" viewBox="0 0 44 36">
      {/* Screen background */}
      <rect x="0" y="0" width="44" height="36" rx="6" fill="#040c14" />

      {isMatrix ? (
        // Matrix rain — green binary columns
        <g>
          {[0,1,2,3,4,5].map(col => {
            const x = 3 + col * 7;
            return (
              <text key={col} x={x} y="8" fill="#00ff41" fontSize="5" fontFamily="monospace" opacity="0.95">
                <tspan x={x} dy="0">{Math.random() > 0.5 ? '1' : '0'}</tspan>
                <tspan x={x} dy="6" opacity="0.7">{Math.random() > 0.5 ? '0' : '1'}</tspan>
                <tspan x={x} dy="6" opacity="0.5">{Math.random() > 0.5 ? '1' : '0'}</tspan>
                <tspan x={x} dy="6" opacity="0.3">{Math.random() > 0.5 ? '0' : '1'}</tspan>
                <animateTransform attributeName="transform" type="translate" from="0,0" to="0,36"
                  dur={`${0.6 + col * 0.12}s`} repeatCount="indefinite" />
              </text>
            );
          })}
          {/* Green overlay glow */}
          <rect x="0" y="0" width="44" height="36" rx="6" fill="rgba(0,255,65,0.04)" />
        </g>
      ) : isCoding ? (
        // Python / JSON scrolling
        <g>
          <text x="2" y="9" fill="#00d4aa" fontSize="4.5" fontFamily="monospace">
            <tspan x="2" dy="0">def ai():</tspan>
            <tspan x="2" dy="6" fill="#a78bfa">  &#123;"id":1&#125;</tspan>
            <tspan x="2" dy="6" fill="#fbbf24">  return x</tspan>
            <tspan x="2" dy="6" fill="#00d4aa">build(44)</tspan>
            <animateTransform attributeName="transform" type="translate" from="0,0" to="0,-24"
              dur="1.4s" repeatCount="indefinite" />
          </text>
          {/* Scanline */}
          <rect x="0" y="0" width="44" height="2" fill="#00d4aa" opacity="0.15">
            <animate attributeName="y" from="0" to="34" dur="0.8s" repeatCount="indefinite" />
          </rect>
        </g>
      ) : isZap ? (
        // Zap face — X eyes, shocked mouth
        <g>
          {/* X left eye */}
          <line x1="8" y1="8" x2="16" y2="18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="16" y1="8" x2="8" y2="18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          {/* X right eye */}
          <line x1="28" y1="8" x2="36" y2="18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="8" x2="28" y2="18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          {/* Shocked O mouth */}
          <ellipse cx="22" cy="28" rx="6" ry="5" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <ellipse cx="22" cy="10" rx="22" ry="18" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3">
            <animate attributeName="rx" values="22;26;22" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
        </g>
      ) : mode === 'excited' ? (
        // Star eyes, big grin
        <g>
          {/* Star left */}
          <text x="7" y="17" fill="#fbbf24" fontSize="11" textAnchor="middle">★</text>
          {/* Star right */}
          <text x="37" y="17" fill="#fbbf24" fontSize="11" textAnchor="middle">★</text>
          {/* Big grin */}
          <path d="M 8 26 Q 22 35 36 26" stroke="#00d4aa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 8 26 Q 22 35 36 26 L 36 29 Q 22 38 8 29 Z" fill="#00d4aa" opacity="0.3" />
          {/* Rosy cheeks */}
          <ellipse cx="8" cy="22" rx="4" ry="2.5" fill="#f87171" opacity="0.4" />
          <ellipse cx="36" cy="22" rx="4" ry="2.5" fill="#f87171" opacity="0.4" />
        </g>
      ) : mode === 'wink' ? (
        <g>
          {/* Left eye normal */}
          <ellipse cx="13" cy="14" rx="6" ry="7" fill="#00d4aa" opacity="0.9" />
          <ellipse cx="13" cy="15" rx="3" ry="3.5" fill="#040c14" />
          <circle cx="11" cy="12" r="1.5" fill="white" opacity="0.8" />
          {/* Right eye wink */}
          <path d="M 29 13 Q 36 18 43 13" stroke="#00d4aa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Smile */}
          <path d="M 9 26 Q 22 34 35 26" stroke="#00d4aa" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Cheek blush */}
          <ellipse cx="7" cy="22" rx="4" ry="2.5" fill="#f87171" opacity="0.35" />
        </g>
      ) : (
        // Default happy face
        <g>
          {/* Left eye */}
          <ellipse cx="13" cy="14" rx="6" ry="7" fill="#00d4aa" opacity="0.9" />
          <ellipse cx="13" cy={mode === 'happy' ? 15 : 14} rx="3" ry="3.5" fill="#040c14" />
          <circle cx="11" cy="12" r="1.5" fill="white" opacity="0.8" />
          {/* Right eye */}
          <ellipse cx="31" cy="14" rx="6" ry="7" fill="#00d4aa" opacity="0.9" />
          <ellipse cx="31" cy={mode === 'happy' ? 15 : 14} rx="3" ry="3.5" fill="#040c14" />
          <circle cx="29" cy="12" r="1.5" fill="white" opacity="0.8" />
          {/* Mouth */}
          {mode === 'happy'
            ? <path d="M 9 26 Q 22 34 35 26" stroke="#00d4aa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            : <path d="M 12 28 Q 22 32 32 28" stroke="#00d4aa" strokeWidth="2" fill="none" strokeLinecap="round" />
          }
          {/* Screen scanline shimmer */}
          <rect x="0" y="0" width="44" height="1.5" fill="#00d4aa" opacity="0.06">
            <animate attributeName="y" from="0" to="34" dur="2s" repeatCount="indefinite" />
          </rect>
        </g>
      )}

      {/* Screen border glow */}
      <rect x="0" y="0" width="44" height="36" rx="6" fill="none"
        stroke={isMatrix ? '#00ff41' : isCoding ? '#00d4aa' : '#00d4aa'}
        strokeWidth="1.5" opacity={isMatrix ? 0.8 : 0.5} />
    </svg>
  );
}

// ── Glove (Mickey-style white) ───────────────────────────────────────────────
function Glove({ x, y, rot = 0 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <ellipse cx="0" cy="0" rx="7" ry="6.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      {[-5,-1.5,2,5.5].map((fx,i) => (
        <ellipse key={i} cx={fx} cy="-6" rx="2.5" ry="3" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.8" />
      ))}
      <ellipse cx="-8" cy="-1" rx="2.5" ry="3" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.8" />
      <rect x="-7" y="4" width="14" height="4" rx="2" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.8" />
    </g>
  );
}

// ── Main Robot ───────────────────────────────────────────────────────────────
export default function RobotDancer({ stage, doing_robot }) {
  const isZapping = stage === 'zapping';
  const isFinale = stage === 'finale';

  // Face mode based on stage
  const faceMode = isZapping ? 'zap'
    : isFinale ? 'excited'
    : stage === 'transformed' ? 'coding'
    : stage === 'robot_in' ? 'matrix'
    : doing_robot ? 'happy'
    : 'happy';

  // Body bob
  const bodyAnim = doing_robot ? {
    animate: { y: [0, -10, 0, -10, 0], x: [0, 6, 0, -6, 0] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'steps(3)' },
  } : { animate: { y: 0 }, transition: {} };

  // Arms spin continuously when dancing
  const lArmAnim = doing_robot ? {
    animate: { rotate: [0, -90, -180, -270, -360] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'linear' },
  } : { animate: { rotate: 0 }, transition: { duration: 0.4 } };

  const rArmAnim = doing_robot ? {
    animate: { rotate: [0, 90, 180, 270, 360] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'linear' },
  } : { animate: { rotate: 0 }, transition: { duration: 0.4 } };

  // Head spin when zapping
  const headAnim = isZapping ? {
    animate: { rotate: [0, 360] },
    transition: { duration: 0.6, repeat: Infinity, ease: 'linear' },
  } : { animate: { rotate: 0 }, transition: { duration: 0.3 } };

  // Leg alternating kick
  const lLegAnim = doing_robot ? {
    animate: { rotate: [0, 30, 0, -10, 0] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'steps(2)' },
  } : { animate: { rotate: 0 }, transition: {} };

  const rLegAnim = doing_robot ? {
    animate: { rotate: [0, -10, 0, 30, 0] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'steps(2)' },
  } : { animate: { rotate: 0 }, transition: {} };

  return (
    <motion.div
      className="absolute bottom-20"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
      initial={{ x: 500, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -600, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      {/* Label */}
      <motion.div
        className="text-[9px] font-bold text-center mb-1 px-2 py-0.5 rounded-full"
        style={{ color: '#00d4aa', background: '#00d4aa18', border: '1px solid #00d4aa30' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        The Robot
      </motion.div>

      {/* Body wrapper — bobs when dancing */}
      <motion.div
        animate={bodyAnim.animate}
        transition={bodyAnim.transition}
        style={{ position: 'relative', width: 100, height: 200 }}
      >
        <svg width="100" height="200" viewBox="0 0 100 200" overflow="visible">
          <defs>
            <linearGradient id="robotBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="robotMetal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="50%" stopColor="#6b7280" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
            <radialGradient id="chestGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── ANTENNA ── */}
          <line x1="50" y1="2" x2="50" y2="12" stroke="#6b7280" strokeWidth="2.5" />
          <circle cx="50" cy="0" r="4" fill="#fbbf24">
            <animate attributeName="r" values="4;6;4" dur="0.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="0.9s" repeatCount="indefinite" />
          </circle>

          {/* ── HEAD — rounded humanoid skull ── */}
          <motion.g
            style={{ originX: '50px', originY: '35px' }}
            animate={headAnim.animate}
            transition={headAnim.transition}
          >
            {/* Skull shape — wider at top, tapers to jaw */}
            <ellipse cx="50" cy="32" rx="26" ry="28" fill="url(#robotBody)" stroke="#334155" strokeWidth="1.5" />
            {/* Jaw plate */}
            <ellipse cx="50" cy="52" rx="18" ry="10" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Temple panels */}
            <rect x="22" y="22" width="5" height="18" rx="2" fill="#334155" stroke="#4b5563" strokeWidth="0.8" />
            <rect x="73" y="22" width="5" height="18" rx="2" fill="#334155" stroke="#4b5563" strokeWidth="0.8" />
            {/* Side ear nodes */}
            <circle cx="22" cy="30" r="3.5" fill="#1e293b" stroke="#00d4aa" strokeWidth="1">
              <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="78" cy="30" r="3.5" fill="#1e293b" stroke="#00d4aa" strokeWidth="1">
              <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
            </circle>
            {/* Screen face inset */}
            <rect x="28" y="14" width="44" height="36" rx="7" fill="#020a10" stroke="#00d4aa" strokeWidth="1.5" />
            {/* Chin LED strip */}
            {[0,1,2,3,4].map(i => (
              <rect key={i} x={36+i*6} y="53" width="4" height="3" rx="1.5"
                fill={['#00d4aa','#fbbf24','#a78bfa','#00d4aa','#fbbf24'][i]} opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.2;0.7"
                  dur={`${0.4+i*0.1}s`} repeatCount="indefinite" />
              </rect>
            ))}
            {/* Foreign object: face SVG embedded */}
            <foreignObject x="28" y="14" width="44" height="36">
              <div xmlns="http://www.w3.org/1999/xhtml">
                <ScreenFace mode={faceMode} stage={stage} />
              </div>
            </foreignObject>
          </motion.g>

          {/* ── NECK ── */}
          <rect x="40" y="60" width="20" height="10" rx="3" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
          {/* Neck joint rings */}
          <rect x="42" y="62" width="16" height="2" rx="1" fill="#6b7280" opacity="0.6" />
          <rect x="42" y="65" width="16" height="2" rx="1" fill="#6b7280" opacity="0.4" />

          {/* ── TORSO ── */}
          <rect x="18" y="70" width="64" height="60" rx="8" fill="url(#robotBody)" stroke="#334155" strokeWidth="1.5" />
          {/* Shoulder plates */}
          <rect x="14" y="70" width="14" height="12" rx="4" fill="#1e293b" stroke="#4b5563" strokeWidth="1" />
          <rect x="72" y="70" width="14" height="12" rx="4" fill="#1e293b" stroke="#4b5563" strokeWidth="1" />

          {/* Chest panel — opens when zapping */}
          {isZapping ? (
            <g>
              {/* Open chest glow */}
              <rect x="28" y="78" width="44" height="30" rx="5" fill="#001a12" stroke="#00d4aa" strokeWidth="1.5" />
              <ellipse cx="50" cy="93" rx="18" ry="12" fill="url(#chestGlow)">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="0.5s" repeatCount="indefinite" />
              </ellipse>
              {[0,1,2].map(i => (
                <circle key={i} cx={36+i*14} cy={93} r={4.5} fill={['#00d4aa','#fbbf24','#a78bfa'][i]}>
                  <animate attributeName="r" values="4.5;7;4.5" dur={`${0.4+i*0.12}s`} repeatCount="indefinite" />
                </circle>
              ))}
              {/* Energy beam emitter */}
              <ellipse cx="50" cy="93" rx="22" ry="16" fill="none" stroke="#00d4aa" strokeWidth="1.5" opacity="0.5">
                <animate attributeName="rx" values="22;30;22" dur="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.6s" repeatCount="indefinite" />
              </ellipse>
            </g>
          ) : (
            <g>
              {/* Closed chest panel */}
              <rect x="28" y="78" width="44" height="30" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              {/* base44 inscription */}
              <text x="50" y="90" textAnchor="middle" fill="#00d4aa" fontSize="6"
                fontFamily="monospace" fontWeight="bold" opacity="0.85" letterSpacing="1">
                base44
              </text>
              {/* Status LEDs */}
              {[0,1,2,3].map(i => (
                <circle key={i} cx={33+i*12} cy={100} r={3} fill={['#00d4aa','#00d4aa','#fbbf24','#a78bfa'][i]} opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.2;0.7"
                    dur={`${0.5+i*0.13}s`} repeatCount="indefinite" />
                </circle>
              ))}
              {/* Vent slats */}
              {[0,1,2].map(i => (
                <rect key={i} x="30" y={104+i*4} width="40" height="2" rx="1" fill="#1e293b" opacity="0.8" />
              ))}
            </g>
          )}

          {/* Hip / pelvis plate */}
          <rect x="22" y="128" width="56" height="12" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <rect x="28" y="131" width="44" height="5" rx="2" fill="#334155" opacity="0.6" />

          {/* ── LEFT ARM (spins at shoulder) ── */}
          <motion.g
            style={{ originX: '21px', originY: '76px' }}
            animate={lArmAnim.animate}
            transition={lArmAnim.transition}
          >
            {/* Upper arm */}
            <rect x="5" y="70" width="16" height="32" rx="5" fill="#1e293b" stroke="#374151" strokeWidth="1" />
            {/* Elbow joint */}
            <circle cx="13" cy="102" r="5" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
            {/* Forearm */}
            <rect x="7" y="102" width="12" height="26" rx="4" fill="#111827" stroke="#374151" strokeWidth="1" />
            {/* Wrist joint */}
            <circle cx="13" cy="128" r="4" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
            {/* Glove */}
            <Glove x="13" y="138" rot={doing_robot ? 0 : 10} />
          </motion.g>

          {/* ── RIGHT ARM (spins opposite) ── */}
          <motion.g
            style={{ originX: '79px', originY: '76px' }}
            animate={rArmAnim.animate}
            transition={rArmAnim.transition}
          >
            {/* Upper arm */}
            <rect x="79" y="70" width="16" height="32" rx="5" fill="#1e293b" stroke="#374151" strokeWidth="1" />
            {/* Elbow joint */}
            <circle cx="87" cy="102" r="5" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
            {/* Forearm */}
            <rect x="81" y="102" width="12" height="26" rx="4" fill="#111827" stroke="#374151" strokeWidth="1" />
            {/* Wrist */}
            <circle cx="87" cy="128" r="4" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
            {/* Glove */}
            <Glove x="87" y="138" rot={doing_robot ? 0 : -10} />
          </motion.g>

          {/* ── LEFT LEG ── */}
          <motion.g
            style={{ originX: '34px', originY: '140px' }}
            animate={lLegAnim.animate}
            transition={lLegAnim.transition}
          >
            {/* Thigh */}
            <rect x="22" y="140" width="24" height="30" rx="6" fill="#1e293b" stroke="#374151" strokeWidth="1" />
            {/* Knee joint */}
            <circle cx="34" cy="170" r="6" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
            {/* Shin */}
            <rect x="25" y="170" width="18" height="22" rx="5" fill="#111827" stroke="#374151" strokeWidth="1" />
            {/* Ankle */}
            <circle cx="34" cy="192" r="4" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
            {/* Foot */}
            <rect x="20" y="190" width="28" height="10" rx="4" fill="#1e293b" stroke="#374151" strokeWidth="1" />
            <rect x="22" y="196" width="24" height="4" rx="2" fill="#374151" opacity="0.7" />
          </motion.g>

          {/* ── RIGHT LEG ── */}
          <motion.g
            style={{ originX: '66px', originY: '140px' }}
            animate={rLegAnim.animate}
            transition={rLegAnim.transition}
          >
            {/* Thigh */}
            <rect x="54" y="140" width="24" height="30" rx="6" fill="#1e293b" stroke="#374151" strokeWidth="1" />
            {/* Knee joint */}
            <circle cx="66" cy="170" r="6" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
            {/* Shin */}
            <rect x="57" y="170" width="18" height="22" rx="5" fill="#111827" stroke="#374151" strokeWidth="1" />
            {/* Ankle */}
            <circle cx="66" cy="192" r="4" fill="url(#robotMetal)" stroke="#4b5563" strokeWidth="1" />
            {/* Foot */}
            <rect x="52" y="190" width="28" height="10" rx="4" fill="#1e293b" stroke="#374151" strokeWidth="1" />
            <rect x="54" y="196" width="24" height="4" rx="2" fill="#374151" opacity="0.7" />
          </motion.g>

          {/* Body edge glow */}
          <rect x="18" y="70" width="64" height="60" rx="8" fill="none"
            stroke="#00d4aa" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </motion.div>
    </motion.div>
  );
}