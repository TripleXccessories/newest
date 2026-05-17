import React, { useState, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';

/**
 * SnackBarScene — the visual "counter" scene at the top of the Academy Store.
 * 
 * 🥚 EASTER EGG: Tap the "IINT" watermark on the back wall 5 times to toggle
 * full anime/manga art style mode. Tap again 5 times to revert.
 */

const ARCHETYPE_EMOJIS = {
  Guide: '🦅', Oracle: '🔮', Creator: '🛠️', Challenger: '⚔️', Guardian: '🛡️', Catalyst: '⚡',
};

// Archetype → anime visual identity
const ARCHETYPE_ANIME = {
  Guide:     { kanji: '導', aura: '#f59e0b', hair: '#f59e0b', eyes: '#fbbf24', skinTone: '#fde68a', outfit: '#92400e', effect: 'flame' },
  Oracle:    { kanji: '神', aura: '#7c3aed', hair: '#c4b5fd', eyes: '#a78bfa', skinTone: '#ede9fe', outfit: '#4c1d95', effect: 'crystal' },
  Creator:   { kanji: '創', aura: '#f97316', hair: '#fb923c', eyes: '#fed7aa', skinTone: '#ffedd5', outfit: '#7c2d12', effect: 'spark' },
  Challenger:{ kanji: '戦', aura: '#fb7185', hair: '#f43f5e', eyes: '#fda4af', skinTone: '#ffe4e6', outfit: '#9f1239', effect: 'slash' },
  Guardian:  { kanji: '守', aura: '#4ade80', hair: '#86efac', eyes: '#bbf7d0', skinTone: '#dcfce7', outfit: '#14532d', effect: 'shield' },
  Catalyst:  { kanji: '変', aura: '#2dd4bf', hair: '#5eead4', eyes: '#99f6e4', skinTone: '#ccfbf1', outfit: '#134e4a', effect: 'lightning' },
};

// SVG anime character silhouette — chibi-proportion manga figure
function AnimeCharacterSVG({ style, isTalking, color }) {
  const aura = style?.aura || color || '#00d4aa';
  const hair = style?.hair || '#64748b';
  const skin = style?.skinTone || '#fde68a';
  const outfit = style?.outfit || '#1e293b';
  const eyes = style?.eyes || '#f1f5f9';

  return (
    <svg width="90" height="130" viewBox="0 0 90 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Aura glow ring */}
      {isTalking && (
        <ellipse cx="45" cy="115" rx="34" ry="8" fill={aura} opacity="0.35" />
      )}
      {/* Body / outfit */}
      <path d="M27 75 Q20 100 18 120 L72 120 Q70 100 63 75 Q55 68 45 68 Q35 68 27 75Z"
        fill={outfit} stroke={aura} strokeWidth="1.5" />
      {/* Collar detail */}
      <path d="M38 75 L45 85 L52 75" stroke={aura} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      {/* Arms */}
      <path d="M27 78 Q15 90 14 108" stroke={outfit} strokeWidth="8" strokeLinecap="round" />
      <path d="M63 78 Q75 90 76 108" stroke={outfit} strokeWidth="8" strokeLinecap="round" />
      {/* Hands */}
      <circle cx="14" cy="110" r="5" fill={skin} stroke={aura} strokeWidth="1" />
      <circle cx="76" cy="110" r="5" fill={skin} stroke={aura} strokeWidth="1" />
      {/* Neck */}
      <rect x="40" y="58" width="10" height="12" rx="5" fill={skin} />
      {/* Head */}
      <ellipse cx="45" cy="45" rx="22" ry="24" fill={skin} stroke={aura} strokeWidth="1.5" />
      {/* Hair — top + sides */}
      <path d="M23 38 Q22 18 45 16 Q68 18 67 38 Q62 22 45 21 Q28 22 23 38Z" fill={hair} />
      <path d="M23 38 Q18 48 20 56 Q23 48 24 44Z" fill={hair} />
      <path d="M67 38 Q72 48 70 56 Q67 48 66 44Z" fill={hair} />
      {/* Eyes — large manga style */}
      <ellipse cx="36" cy="46" rx="5" ry="6" fill="#0a0f1e" />
      <ellipse cx="54" cy="46" rx="5" ry="6" fill="#0a0f1e" />
      <ellipse cx="36" cy="46" rx="3.5" ry="4.5" fill={eyes} />
      <ellipse cx="54" cy="46" rx="3.5" ry="4.5" fill={eyes} />
      {/* Eye shine */}
      <circle cx="37.5" cy="44" r="1.2" fill="white" opacity="0.9" />
      <circle cx="55.5" cy="44" r="1.2" fill="white" opacity="0.9" />
      {/* Eyebrows */}
      <path d="M30 39 Q36 37 40 39" stroke="#2d1b00" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M50 39 Q54 37 60 39" stroke="#2d1b00" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <path d="M43 52 Q45 54 47 52" stroke="#d97706" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Mouth */}
      {isTalking
        ? <ellipse cx="45" cy="57" rx="5" ry="3.5" fill="#be123c" stroke="#9f1239" strokeWidth="0.5" />
        : <path d="M40 57 Q45 60 50 57" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      }
      {/* Blush */}
      <ellipse cx="30" cy="52" rx="5" ry="2.5" fill="#fb7185" opacity="0.4" />
      <ellipse cx="60" cy="52" rx="5" ry="2.5" fill="#fb7185" opacity="0.4" />
    </svg>
  );
}

// Speed lines burst for the "talking" effect
function SpeedLines({ color }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 130 160" preserveAspectRatio="none">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * 360;
        const rad = (angle * Math.PI) / 180;
        const cx = 65, cy = 80;
        const r1 = 55, r2 = 85;
        return (
          <line key={i}
            x1={cx + Math.cos(rad) * r1} y1={cy + Math.sin(rad) * r1}
            x2={cx + Math.cos(rad) * r2} y2={cy + Math.sin(rad) * r2}
            stroke={color} strokeWidth="0.8" opacity="0.25"
          />
        );
      })}
    </svg>
  );
}

// Manga-style halftone dot pattern overlay
function HalftoneDots({ color }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 130 160">
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => (
          <circle key={`${row}-${col}`}
            cx={col * 22 + (row % 2 === 0 ? 11 : 0) + 4}
            cy={row * 20 + 10}
            r="3"
            fill={color}
          />
        ))
      )}
    </svg>
  );
}

// ─── ANIME mode portrait ───────────────────────────────────────────────────
function AnimePortrait({ staff, isTalking, dialogue, side, onDismiss }) {
  const animeStyle = ARCHETYPE_ANIME[staff.archetype] || ARCHETYPE_ANIME.Guide;
  const aura = animeStyle.aura;

  return (
    <div className={`relative flex flex-col items-center`}>
      {/* Manga speech bubble */}
      {isTalking && dialogue && (
        <div className={`absolute z-20 bottom-full mb-2 ${side === 'right' ? 'right-0' : 'left-0'}`}
          style={{ width: 240 }}>
          {/* Jagged manga bubble border */}
          <div className="relative p-3 text-[#0a0f1e] text-xs leading-relaxed font-bold shadow-2xl"
            style={{
              background: '#fff',
              border: `3px solid #0a0f1e`,
              borderRadius: '12px 12px 12px 0px',
              clipPath: side === 'right'
                ? 'polygon(0 0,100% 0,100% 80%,90% 100%,80% 80%,0 80%)'
                : 'polygon(0 0,100% 0,100% 80%,20% 80%,10% 100%,0 80%)',
              fontFamily: '"Bangers", "Inter", sans-serif',
              letterSpacing: '0.02em',
            }}>
            <button onClick={onDismiss}
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
              <X size={9} className="text-gray-600" />
            </button>
            <p className="pr-4">{dialogue}</p>
            <p className="text-[8px] mt-1 font-black" style={{ color: aura }}>— {staff.name}</p>
          </div>
        </div>
      )}

      {/* Portrait card — manga panel style */}
      <div className="relative overflow-hidden flex flex-col items-center justify-end"
        style={{
          width: 130, height: 170,
          background: isTalking
            ? `linear-gradient(160deg, ${aura}22 0%, #0a0f1e 100%)`
            : `linear-gradient(180deg, #0d1117 0%, #0a0c12 100%)`,
          border: `3px solid ${isTalking ? '#0a0f1e' : aura + '50'}`,
          borderRadius: 12,
          boxShadow: isTalking ? `0 0 0 2px ${aura}, 0 0 24px ${aura}55` : 'none',
        }}>

        {/* Halftone dots */}
        <HalftoneDots color={aura} />
        {/* Speed lines when talking */}
        {isTalking && <SpeedLines color={aura} />}

        {/* Kanji watermark */}
        <div className="absolute top-2 left-2 text-3xl font-black select-none pointer-events-none"
          style={{ color: aura, opacity: 0.18, lineHeight: 1 }}>
          {animeStyle.kanji}
        </div>

        {/* Anime character */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-1">
          <AnimeCharacterSVG style={animeStyle} isTalking={isTalking} color={aura} />
        </div>

        {/* Bottom name plate — manga style */}
        <div className="relative z-10 w-full text-center pb-2 pt-1"
          style={{ background: `linear-gradient(0deg, #0a0f1e 60%, transparent)` }}>
          <div className="px-1 py-0.5 mx-2 rounded text-[9px] font-black tracking-widest mb-0.5 uppercase"
            style={{ background: aura, color: '#0a0f1e' }}>
            {animeStyle.kanji} {staff.archetype}
          </div>
          <p className="text-[9px] font-black text-white leading-tight px-1">{staff.name}</p>
          <p className="text-[7px]" style={{ color: aura }}>{staff.school}</p>
        </div>
      </div>
    </div>
  );
}

// ─── DEFAULT mode portrait ─────────────────────────────────────────────────
function StaffPortrait({ staff, isTalking, dialogue, side, onDismiss }) {
  const emoji = ARCHETYPE_EMOJIS[staff.archetype] || '👤';
  const initials = staff.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={`relative flex flex-col items-center ${side === 'right' ? 'items-end' : 'items-start'}`}>
      {isTalking && dialogue && (
        <div className={`absolute z-20 max-w-[260px] w-[260px] bottom-full mb-3 ${side === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="relative p-3 rounded-2xl text-xs leading-relaxed text-[#f1f5f9] shadow-xl"
            style={{ background: `${staff.color}22`, border: `1px solid ${staff.color}55`, backdropFilter: 'blur(8px)' }}>
            <span className="text-base absolute -bottom-5 text-xl"
              style={{ left: side === 'right' ? 'auto' : 12, right: side === 'right' ? 12 : 'auto' }}>💬</span>
            <button onClick={onDismiss}
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20">
              <X size={9} className="text-[#94a3b8]" />
            </button>
            <p className="pr-4">{dialogue}</p>
            <p className="text-[9px] mt-2 font-bold" style={{ color: staff.color }}>Click anywhere to dismiss</p>
          </div>
        </div>
      )}
      <div className="relative w-[130px] h-[160px] rounded-2xl overflow-hidden flex flex-col items-center justify-end pb-3"
        style={{
          background: `linear-gradient(180deg, ${staff.color}18 0%, ${staff.color}35 60%, ${staff.color}55 100%)`,
          border: `2px solid ${staff.color}${isTalking ? 'cc' : '40'}`,
          boxShadow: isTalking ? `0 0 18px ${staff.color}55` : 'none',
        }}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: `${staff.color}25`, border: `2px solid ${staff.color}60` }}>
            {emoji}
          </div>
          <div className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide mt-1"
            style={{ background: `${staff.color}30`, color: staff.color, border: `1px solid ${staff.color}50` }}>
            {initials}
          </div>
        </div>
        <div className="text-center z-10">
          <p className="text-[10px] font-black text-[#f1f5f9] leading-tight max-w-[110px] text-center">{staff.name}</p>
          <p className="text-[8px] mt-0.5" style={{ color: staff.color }}>{staff.archetype} · {staff.school}</p>
        </div>
        {!isTalking && (
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: staff.color, opacity: 0.5 }} />
        )}
      </div>
    </div>
  );
}

// ─── MAIN SCENE ────────────────────────────────────────────────────────────
export default function SnackBarScene({ staff, dialogue, talkingIndex, onDismiss, shiftLabel }) {
  const [left, right] = staff;
  const [animeMode, setAnimeMode] = useState(() => {
    try { return localStorage.getItem('iint_anime_mode') === '1'; } catch { return false; }
  });
  const [taps, setTaps] = useState(0);
  const tapTimer = useRef(null);
  const [showUnlock, setShowUnlock] = useState(false);

  const handleWatermarkTap = (e) => {
    e.stopPropagation();
    const next = taps + 1;
    setTaps(next);
    clearTimeout(tapTimer.current);
    if (next >= 5) {
      const newMode = !animeMode;
      setAnimeMode(newMode);
      try { localStorage.setItem('iint_anime_mode', newMode ? '1' : '0'); } catch {}
      setTaps(0);
      setShowUnlock(true);
      setTimeout(() => setShowUnlock(false), 3000);
    } else {
      tapTimer.current = setTimeout(() => setTaps(0), 2000);
    }
  };

  const Portrait = animeMode ? AnimePortrait : StaffPortrait;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden"
      style={{
        background: animeMode
          ? 'linear-gradient(180deg, #09070f 0%, #0d0a18 60%, #13101f 100%)'
          : 'linear-gradient(180deg, #0a0c12 0%, #0d1117 60%, #111827 100%)',
        border: animeMode ? '2px solid #3b2f6e' : '1px solid #1e293b',
        minHeight: 220,
      }}
    >
      {/* Ambient ceiling light bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${left?.color || '#00d4aa'}, ${right?.color || '#a78bfa'}, transparent)` }} />

      {/* Anime mode: screentone panel lines overlay */}
      {animeMode && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px)',
          }} />
      )}

      {/* Back wall watermark — THE EASTER EGG BUTTON */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-auto select-none cursor-pointer"
        onClick={handleWatermarkTap}
        title={animeMode ? 'Tap 5× to exit anime mode' : 'Tap 5× to unlock...'}
        style={{ zIndex: 1 }}
      >
        <p className="text-[80px] font-black tracking-widest"
          style={{
            opacity: animeMode ? 0.06 : 0.04,
            color: animeMode ? '#a78bfa' : 'white',
            fontFamily: animeMode ? 'serif' : 'inherit',
          }}>
          {animeMode ? '映画' : 'IINT'}
        </p>
        {/* Tap progress dots */}
        {taps > 0 && taps < 5 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-150"
                style={{ background: i < taps ? (animeMode ? '#a78bfa' : '#00d4aa') : '#1e293b' }} />
            ))}
          </div>
        )}
      </div>

      {/* Unlock / unlock-exit toast */}
      {showUnlock && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-2xl"
          style={{
            background: animeMode ? 'linear-gradient(135deg, #1e1040, #2d1b69)' : '#111827',
            border: `1px solid ${animeMode ? '#a78bfa' : '#334155'}`,
          }}>
          <Sparkles size={14} style={{ color: animeMode ? '#a78bfa' : '#00d4aa' }} />
          <p className="text-xs font-black" style={{ color: animeMode ? '#e9d5ff' : '#f1f5f9' }}>
            {animeMode ? '✨ アニメモード ON — Anime Mode Unlocked!' : 'Back to standard mode'}
          </p>
        </div>
      )}

      {/* Main scene layout */}
      <div className="relative flex items-end justify-between px-8 pt-8 pb-0" style={{ minHeight: 200, zIndex: 2 }}>
        {left && (
          <Portrait
            staff={left}
            isTalking={talkingIndex === 0}
            dialogue={talkingIndex === 0 ? dialogue : null}
            side="left"
            onDismiss={onDismiss}
          />
        )}

        {/* Counter surface */}
        <div className="flex-1 mx-4 flex flex-col items-center justify-end pb-0 gap-2 self-end">
          <div
            className="w-full rounded-t-2xl px-4 pt-3 pb-2 flex items-center justify-center gap-6 relative"
            style={{
              background: animeMode
                ? 'linear-gradient(180deg, #1a1035 0%, #100d20 100%)'
                : 'linear-gradient(180deg, #1e2535 0%, #141923 100%)',
              borderTop: `2px solid ${animeMode ? '#3b2f6e' : '#334155'}`,
            }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0a0f1e] border border-[#1e293b] text-[8px] text-[#64748b] font-mono whitespace-nowrap">
              {shiftLabel}
              {animeMode && <span className="ml-1.5 text-[#a78bfa]">· アニメ</span>}
            </div>
            <div className="w-full flex items-center justify-center text-[9px] font-mono italic"
              style={{ color: animeMode ? '#6d28d9' : '#475569' }}>
              {animeMode ? '↑ 今日のスペシャル · Today\'s Specials ↑' : '↑ Today\'s Specials above · Menu board overhead ↑'}
            </div>
          </div>
        </div>

        {right && (
          <Portrait
            staff={right}
            isTalking={talkingIndex === 1}
            dialogue={talkingIndex === 1 ? dialogue : null}
            side="right"
            onDismiss={onDismiss}
          />
        )}
      </div>

      {/* Floor shadow line */}
      <div className="h-5 w-full"
        style={{ background: animeMode
          ? 'linear-gradient(180deg, #100d20 0%, #09070f 100%)'
          : 'linear-gradient(180deg, #141923 0%, #0a0c12 100%)'
        }} />

      {/* Anime mode: corner panel notch decoration */}
      {animeMode && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#a78bfa] rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#a78bfa] rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#a78bfa] rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#a78bfa] rounded-br-3xl pointer-events-none" />
        </>
      )}
    </div>
  );
}