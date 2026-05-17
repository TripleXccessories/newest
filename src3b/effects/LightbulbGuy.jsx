import React from 'react';

/**
 * LightbulbGuy — Smart color-changing lightbulb character.
 * 
 * KEY DESIGN RULES:
 * - Eyes and smile are EXTERNAL — attached on the OUTSIDE surface of the glass.
 *   When head turns, they move WITH the glass surface (like stickers on the bulb).
 * - The bulb itself is a translucent glass globe, soft warm-white glow (not blinding).
 * - Smart bulb: `bulbColor` prop changes the glow/tint color.
 * - Arms with white Mickey-style gloves (no headset).
 * - Metallic screw base at bottom.
 * 
 * Props:
 *  mood: 'idle' | 'happy' | 'excited' | 'wink' | 'thinking' | 'surprised' | 'aha' | 'coding'
 *  gloveLeft: 'down' | 'wave' | 'point_up' | 'point_right' | 'cup' | 'temple'
 *  gloveRight: 'down' | 'wave' | 'point_up' | 'point_right' | 'cup' | 'temple'
 *  bulbColor: hex color string (default '#ffffff' — white smart bulb)
 *  chestOpen: boolean — only for cinematic intro
 *  hatType: null | 'graduation' | 'party'
 *  showSoundWaves: boolean
 *  size: number (default 200)
 *  facingBack: boolean
 *  headTurnDeg: number (0 = forward, used to offset external face features)
 */
export default function LightbulbGuy({
  mood = 'idle',
  gloveLeft = 'down',
  gloveRight = 'down',
  bulbColor = '#ffffff',
  chestOpen = false,
  hatType = null,
  showSoundWaves = false,
  size = 200,
  facingBack = false,
  headTurnDeg = 0,
}) {
  // Arm configs
  const armConfigs = {
    down:        { armEnd: [0, 40],    gloveRot: 0   },
    wave:        { armEnd: [-20, -10], gloveRot: -40  },
    point_up:    { armEnd: [0, -30],   gloveRot: -80  },
    point_right: { armEnd: [40, 0],    gloveRot: 10   },
    cup:         { armEnd: [10, 30],   gloveRot: 20   },
    temple:      { armEnd: [-10, -20], gloveRot: -50  },
  };

  const lArm = armConfigs[gloveLeft] || armConfigs.down;
  const rArm = armConfigs[gloveRight] || armConfigs.down;

  // Arm origins (sides of the screw base)
  const LAX = 72, LAY = 172;
  const RAX = 128, RAY = 172;

  const lHandX = LAX + lArm.armEnd[0] - 28;
  const lHandY = LAY + lArm.armEnd[1];
  const rHandX = RAX + rArm.armEnd[0] + 28;
  const rHandY = RAY + rArm.armEnd[1];

  // Parse bulbColor to derive glow/tint
  // If white, use warm white. Otherwise tint the bulb.
  const isWhite = bulbColor === '#ffffff' || bulbColor === '#fff';
  const glowColor = isWhite ? '#fff8e7' : bulbColor;
  const glowOuter = isWhite ? '#fde68a' : bulbColor;
  const glowOpacity = isWhite ? 0.18 : 0.35;

  // Face feature offset based on head turn (external features shift with surface)
  // As the head turns, eyes/mouth slide slightly left or right on the surface
  const turnOffset = (headTurnDeg / 90) * 22;

  // Mood configs for EXTERNAL face features
  const faceConfigs = {
    idle:      { browY: 0,   eyeScaleY: 1,    mouthType: 'smile_small', eyeColor: '#1a1a2e' },
    happy:     { browY: -5,  eyeScaleY: 0.85, mouthType: 'smile_big',   eyeColor: '#1a1a2e' },
    excited:   { browY: -8,  eyeScaleY: 1.1,  mouthType: 'open',        eyeColor: '#1a1a2e' },
    wink:      { browY: -3,  eyeScaleY: 1,    mouthType: 'smile_big',   eyeColor: '#1a1a2e' },
    thinking:  { browY: 5,   eyeScaleY: 0.7,  mouthType: 'flat',        eyeColor: '#1a1a2e' },
    surprised: { browY: -10, eyeScaleY: 1.3,  mouthType: 'open_wide',   eyeColor: '#1a1a2e' },
    aha:       { browY: -12, eyeScaleY: 1.2,  mouthType: 'open_wide',   eyeColor: '#1a1a2e' },
    coding:    { browY: -4,  eyeScaleY: 0.9,  mouthType: 'flat',        eyeColor: '#1a1a2e' },
  };

  const fc = faceConfigs[mood] || faceConfigs.idle;

  // Eye centers — placed on the OUTSIDE of the bulb surface
  // Bulb center: cx=100, cy=95, rx=60, ry=68
  // Eyes sit at ~y=88 (upper-mid of bulb), left x=76, right x=124
  const lEyeCX = 76 + turnOffset;
  const rEyeCX = 124 + turnOffset;
  const eyeCY = 90;

  // External white of eye (big cartoony)
  const eyeRX = 13;
  const eyeRY = 15 * fc.eyeScaleY;

  // Pupil (slightly offset for "looking" feel)
  const pupilR = 7;

  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 200 250"
      style={{ filter: 'drop-shadow(0 6px 24px rgba(253,230,138,0.28))' }}
    >
      <defs>
        {/* Smart bulb glass — soft translucent */}
        <radialGradient id="bulbGlass" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%"  stopColor={isWhite ? '#fefce8' : glowColor} stopOpacity="0.85" />
          <stop offset="70%"  stopColor={isWhite ? '#fde68a' : glowColor} stopOpacity="0.55" />
          <stop offset="100%" stopColor={isWhite ? '#f59e0b' : glowOuter} stopOpacity="0.4" />
        </radialGradient>

        {/* Bulb glow aura */}
        <radialGradient id="bulbAura" cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor={glowColor} stopOpacity={glowOpacity} />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>

        {/* Metallic screw base */}
        <linearGradient id="screwMetal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#374151" />
          <stop offset="30%"  stopColor="#9ca3af" />
          <stop offset="55%"  stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>

        {/* Glove */}
        <radialGradient id="gloveWhite" cx="38%" cy="32%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="75%"  stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#d1d5db" />
        </radialGradient>

        {/* Inner glow highlight on bulb */}
        <radialGradient id="innerHighlight" cx="35%" cy="28%" r="50%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Clip for glass surface */}
        <clipPath id="bulbClip">
          <ellipse cx="100" cy="95" rx="59" ry="67" />
        </clipPath>
      </defs>

      {/* ── FLOATING SHADOW ── */}
      <ellipse cx="100" cy="244" rx="36" ry="5" fill="rgba(0,0,0,0.15)" />

      {/* ── AURA GLOW (outer, subtle) ── */}
      <ellipse cx="100" cy="90" rx="76" ry="84"
        fill="url(#bulbAura)" opacity="0.7">
        <animate attributeName="rx" values="76;80;76" dur="3s" repeatCount="indefinite" />
        <animate attributeName="ry" values="84;88;84" dur="3s" repeatCount="indefinite" />
      </ellipse>

      {facingBack ? (
        /* Back view */
        <g>
          <ellipse cx="100" cy="95" rx="60" ry="68"
            fill={isWhite ? '#fde68a' : glowColor} stroke={glowOuter} strokeWidth="2" />
          {/* Screw base back */}
          {[0,1,2,3,4].map(i => (
            <rect key={i} x={68} y={162 + i*8} width={64} height={7} rx={3.5}
              fill={i%2===0 ? 'url(#screwMetal)' : '#4b5563'} stroke="#1f2937" strokeWidth="0.8" />
          ))}
        </g>
      ) : (
        <g>
          {/* ── BULB GLASS BODY ── */}
          {/* Outer subtle stroke */}
          <ellipse cx="100" cy="95" rx="61" ry="69"
            fill="none" stroke={isWhite ? '#fde68a' : glowOuter} strokeWidth="1.5" opacity="0.5" />
          {/* Main glass fill */}
          <ellipse cx="100" cy="95" rx="60" ry="68"
            fill="url(#bulbGlass)" />
          {/* Inner highlight */}
          <ellipse cx="100" cy="95" rx="60" ry="68"
            fill="url(#innerHighlight)" />
          {/* Glass sheen */}
          <path d="M 62 72 Q 70 50 88 56 Q 80 72 66 82 Z"
            fill="white" opacity="0.4" />
          {/* Subtle secondary sheen */}
          <ellipse cx="115" cy="118" rx="8" ry="5"
            fill="white" opacity="0.12" transform="rotate(-30 115 118)" />

          {/* Smart color tint overlay (when not white) */}
          {!isWhite && (
            <ellipse cx="100" cy="95" rx="60" ry="68"
              fill={bulbColor} opacity="0.22" />
          )}

          {/* ── SOUND WAVES (listening vibrations, sides) ── */}
          {[0,1,2].map(i => (
            <g key={`sw${i}`}>
              <path
                d={`M ${37-i*7} ${78+i*8} Q ${30-i*7} ${95+i*4} ${37-i*7} ${114+i*4}`}
                stroke={isWhite ? '#fde68a' : glowColor}
                strokeWidth={showSoundWaves ? 2-i*0.3 : 1-i*0.2}
                fill="none" strokeLinecap="round"
                opacity={showSoundWaves ? 0.7-i*0.15 : 0.2-i*0.05}
              >
                {showSoundWaves && (
                  <animate attributeName="opacity"
                    values={`${0.7-i*0.15};${0.2};${0.7-i*0.15}`}
                    dur={`${0.5+i*0.12}s`} repeatCount="indefinite" />
                )}
              </path>
              <path
                d={`M ${163+i*7} ${78+i*8} Q ${170+i*7} ${95+i*4} ${163+i*7} ${114+i*4}`}
                stroke={isWhite ? '#fde68a' : glowColor}
                strokeWidth={showSoundWaves ? 2-i*0.3 : 1-i*0.2}
                fill="none" strokeLinecap="round"
                opacity={showSoundWaves ? 0.7-i*0.15 : 0.2-i*0.05}
              >
                {showSoundWaves && (
                  <animate attributeName="opacity"
                    values={`${0.7-i*0.15};${0.2};${0.7-i*0.15}`}
                    dur={`${0.5+i*0.12}s`} repeatCount="indefinite" />
                )}
              </path>
            </g>
          ))}

          {/* ── EXTERNAL FACE FEATURES (on the glass surface, like stickers) ── */}
          {/* These move with turnOffset to simulate being ON the outside of the bulb */}

          {/* LEFT EYEBROW — thick, expressive */}
          <path
            d={`M ${lEyeCX-14} ${eyeCY - eyeRY - 8 + fc.browY} 
                Q ${lEyeCX} ${eyeCY - eyeRY - 14 + fc.browY} 
                  ${lEyeCX+14} ${eyeCY - eyeRY - 8 + fc.browY}`}
            stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round"
          />

          {/* RIGHT EYEBROW */}
          {mood !== 'wink' ? (
            <path
              d={`M ${rEyeCX-14} ${eyeCY - eyeRY - 8 + fc.browY}
                  Q ${rEyeCX} ${eyeCY - eyeRY - 14 + fc.browY}
                    ${rEyeCX+14} ${eyeCY - eyeRY - 8 + fc.browY}`}
              stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round"
            />
          ) : (
            /* Wink brow — angled */
            <path
              d={`M ${rEyeCX-14} ${eyeCY - eyeRY - 4 + fc.browY}
                  Q ${rEyeCX} ${eyeCY - eyeRY - 10 + fc.browY}
                    ${rEyeCX+14} ${eyeCY - eyeRY - 14 + fc.browY}`}
              stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round"
            />
          )}

          {/* LEFT EYE — big, white, cartoony, ON surface */}
          <ellipse cx={lEyeCX} cy={eyeCY} rx={eyeRX} ry={eyeRY}
            fill="white" stroke="#1a1a2e" strokeWidth="2.5" />
          {/* Left pupil */}
          <circle cx={lEyeCX + 2} cy={eyeCY + 2} r={pupilR}
            fill={fc.eyeColor} />
          {/* Left pupil highlight */}
          <circle cx={lEyeCX - 2} cy={eyeCY - 3} r="3.5"
            fill="white" opacity="0.9" />
          {/* Left pupil tiny shine */}
          <circle cx={lEyeCX + 4} cy={eyeCY + 4} r="1.5"
            fill="white" opacity="0.5" />

          {/* RIGHT EYE or WINK */}
          {mood === 'wink' ? (
            /* Wink — closed eye arc */
            <path
              d={`M ${rEyeCX - eyeRX} ${eyeCY} Q ${rEyeCX} ${eyeCY + 10} ${rEyeCX + eyeRX} ${eyeCY}`}
              stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round"
            />
          ) : (
            <>
              <ellipse cx={rEyeCX} cy={eyeCY} rx={eyeRX} ry={eyeRY}
                fill="white" stroke="#1a1a2e" strokeWidth="2.5" />
              <circle cx={rEyeCX + 2} cy={eyeCY + 2} r={pupilR}
                fill={fc.eyeColor} />
              <circle cx={rEyeCX - 2} cy={eyeCY - 3} r="3.5"
                fill="white" opacity="0.9" />
              <circle cx={rEyeCX + 4} cy={eyeCY + 4} r="1.5"
                fill="white" opacity="0.5" />
            </>
          )}

          {/* Eye glow when excited/surprised/aha */}
          {(mood === 'excited' || mood === 'surprised' || mood === 'aha') && (
            <>
              <ellipse cx={lEyeCX} cy={eyeCY} rx={eyeRX+4} ry={eyeRY+4}
                fill="none" stroke={isWhite ? '#fbbf24' : glowColor} strokeWidth="2" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx={rEyeCX} cy={eyeCY} rx={eyeRX+4} ry={eyeRY+4}
                fill="none" stroke={isWhite ? '#fbbf24' : glowColor} strokeWidth="2" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite" />
              </ellipse>
            </>
          )}

          {/* ── NOSE — small, cute, external ── */}
          <ellipse cx={100 + turnOffset} cy={eyeCY + eyeRY + 10}
            rx="5" ry="4" fill="#92400e" opacity="0.6" />

          {/* ── MOUTH — big cartoony smile, external ── */}
          {fc.mouthType === 'smile_small' && (
            <path
              d={`M ${84 + turnOffset} ${eyeCY + eyeRY + 22}
                  Q ${100 + turnOffset} ${eyeCY + eyeRY + 34}
                    ${116 + turnOffset} ${eyeCY + eyeRY + 22}`}
              stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round"
            />
          )}
          {fc.mouthType === 'smile_big' && (
            <>
              <path
                d={`M ${80 + turnOffset} ${eyeCY + eyeRY + 20}
                    Q ${100 + turnOffset} ${eyeCY + eyeRY + 38}
                      ${120 + turnOffset} ${eyeCY + eyeRY + 20}`}
                stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round"
              />
              {/* Teeth */}
              <path
                d={`M ${83 + turnOffset} ${eyeCY + eyeRY + 24}
                    Q ${100 + turnOffset} ${eyeCY + eyeRY + 36}
                      ${117 + turnOffset} ${eyeCY + eyeRY + 24}`}
                fill="white" stroke="none" />
            </>
          )}
          {fc.mouthType === 'open' && (
            <>
              <ellipse cx={100 + turnOffset} cy={eyeCY + eyeRY + 26}
                rx="16" ry="10" fill="#1a1a2e" />
              <ellipse cx={100 + turnOffset} cy={eyeCY + eyeRY + 22}
                rx="16" ry="8" fill="white" />
              <ellipse cx={100 + turnOffset} cy={eyeCY + eyeRY + 26}
                rx="14" ry="9" fill="#e11d48" opacity="0.8" />
            </>
          )}
          {fc.mouthType === 'open_wide' && (
            <>
              <ellipse cx={100 + turnOffset} cy={eyeCY + eyeRY + 26}
                rx="20" ry="13" fill="#1a1a2e" />
              <ellipse cx={100 + turnOffset} cy={eyeCY + eyeRY + 20}
                rx="20" ry="8" fill="white" />
              <ellipse cx={100 + turnOffset} cy={eyeCY + eyeRY + 27}
                rx="17" ry="11" fill="#e11d48" opacity="0.85" />
            </>
          )}
          {fc.mouthType === 'flat' && (
            <line
              x1={84 + turnOffset} y1={eyeCY + eyeRY + 22}
              x2={116 + turnOffset} y2={eyeCY + eyeRY + 22}
              stroke="#1a1a2e" strokeWidth="3.5" strokeLinecap="round"
            />
          )}

          {/* ── SCREW BASE ── */}
          {[0,1,2,3,4].map(i => (
            <rect key={i} x={68} y={162 + i*8} width={64} height={7} rx={3.5}
              fill={i%2===0 ? 'url(#screwMetal)' : '#4b5563'}
              stroke="#1f2937" strokeWidth="0.8" />
          ))}
          {/* Base cap */}
          <rect x="72" y="202" width="56" height="10" rx="5"
            fill="#374151" stroke="#1f2937" strokeWidth="1" />
          <rect x="76" y="208" width="48" height="8" rx="4" fill="#1f2937" />

          {/* ── HAT ── */}
          {hatType === 'graduation' && (
            <g>
              <rect x="50" y="20" width="100" height="10" rx="2" fill="#1e293b" />
              <rect x="68" y="8"  width="64"  height="14" rx="4" fill="#1e293b" />
              <line x1="150" y1="20" x2="156" y2="40" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="156" cy="42" r="4" fill="#f59e0b" />
            </g>
          )}
          {hatType === 'party' && (
            <g>
              <polygon points="100,6 70,42 130,42" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2" />
              <circle cx="100" cy="6" r="4" fill="#fbbf24" />
              {[[82,24],[100,18],[116,26]].map(([px,py],i) => (
                <circle key={i} cx={px} cy={py} r="3"
                  fill={['#fbbf24','#f87171','#00d4aa'][i]} />
              ))}
            </g>
          )}
        </g>
      )}

      {/* ── LEFT ARM + WHITE GLOVE ── */}
      <line x1={LAX} y1={LAY} x2={lHandX} y2={lHandY}
        stroke="#6b7280" strokeWidth="5.5" strokeLinecap="round" />
      <g transform={`translate(${lHandX}, ${lHandY}) rotate(${lArm.gloveRot})`}>
        <ellipse cx="0" cy="0" rx="13" ry="12" fill="url(#gloveWhite)" stroke="#d1d5db" strokeWidth="1.5" />
        {[-9,-3,3,9].map((fx, i) => (
          <ellipse key={i} cx={fx} cy="-11" rx="4.5" ry="5.5"
            fill="url(#gloveWhite)" stroke="#d1d5db" strokeWidth="1" />
        ))}
        <ellipse cx="-14" cy="-2" rx="4.5" ry="5.5"
          fill="url(#gloveWhite)" stroke="#d1d5db" strokeWidth="1" />
        <line x1="-7" y1="-4" x2="-7" y2="4" stroke="#d1d5db" strokeWidth="0.8" opacity="0.6" />
        <line x1="0"  y1="-5" x2="0"  y2="4" stroke="#d1d5db" strokeWidth="0.8" opacity="0.6" />
        <line x1="7"  y1="-4" x2="7"  y2="4" stroke="#d1d5db" strokeWidth="0.8" opacity="0.6" />
        <rect x="-13" y="8" width="26" height="7" rx="3.5"
          fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      </g>

      {/* ── RIGHT ARM + WHITE GLOVE ── */}
      <line x1={RAX} y1={RAY} x2={rHandX} y2={rHandY}
        stroke="#6b7280" strokeWidth="5.5" strokeLinecap="round" />
      <g transform={`translate(${rHandX}, ${rHandY}) rotate(${rArm.gloveRot})`}>
        <ellipse cx="0" cy="0" rx="13" ry="12" fill="url(#gloveWhite)" stroke="#d1d5db" strokeWidth="1.5" />
        {[-9,-3,3,9].map((fx, i) => (
          <ellipse key={i} cx={fx} cy="-11" rx="4.5" ry="5.5"
            fill="url(#gloveWhite)" stroke="#d1d5db" strokeWidth="1" />
        ))}
        <ellipse cx="14" cy="-2" rx="4.5" ry="5.5"
          fill="url(#gloveWhite)" stroke="#d1d5db" strokeWidth="1" />
        <line x1="-7" y1="-4" x2="-7" y2="4" stroke="#d1d5db" strokeWidth="0.8" opacity="0.6" />
        <line x1="0"  y1="-5" x2="0"  y2="4" stroke="#d1d5db" strokeWidth="0.8" opacity="0.6" />
        <line x1="7"  y1="-4" x2="7"  y2="4" stroke="#d1d5db" strokeWidth="0.8" opacity="0.6" />
        <rect x="-13" y="8" width="26" height="7" rx="3.5"
          fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      </g>
    </svg>
  );
}