import React from 'react';
import { motion } from 'framer-motion';

/**
 * AcademyNotebook — Fun, chunky branded notebook prop.
 * Bold "IINT" in a chunky playful font on the cover, "ACADEMY" in block letters below.
 * Spiral-bound, bright cover, energetic feel.
 * size: 'sm' | 'md' | 'lg'
 */
export default function AcademyNotebook({ size = 'md', onClick, className = '' }) {
  const dims = { sm: 44, md: 76, lg: 120 };
  const w = dims[size];
  const h = Math.round(w * 1.28);

  return (
    <motion.div
      onClick={onClick}
      className={`inline-flex flex-col items-center gap-1.5 cursor-pointer select-none ${className}`}
      whileHover={{ scale: 1.04, rotate: 1 }}
      whileTap={{ scale: 0.97 }}
      title="Academy Notebook"
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 100 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 5px 14px rgba(0,0,0,0.55)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
      >
        <defs>
          {/* Deep navy cover */}
          <linearGradient id="nb_cover" x1="0" y1="0" x2="100" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0b1a2e" />
            <stop offset="50%" stopColor="#0d2040" />
            <stop offset="100%" stopColor="#071424" />
          </linearGradient>

          {/* Teal accent gradient */}
          <linearGradient id="nb_teal" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00b89a" />
            <stop offset="50%" stopColor="#00d4aa" />
            <stop offset="100%" stopColor="#00b89a" />
          </linearGradient>

          {/* White page */}
          <linearGradient id="nb_page" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f0f4f8" />
            <stop offset="100%" stopColor="#d8e0e8" />
          </linearGradient>

          {/* Spiral hole */}
          <radialGradient id="spiral_hole" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020608" />
            <stop offset="100%" stopColor="#0a1420" />
          </radialGradient>

          {/* Ruled lines tint */}
          <linearGradient id="ruled_bg" x1="0" y1="0" x2="0" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f2035" />
            <stop offset="100%" stopColor="#0b1a2e" />
          </linearGradient>
        </defs>

        {/* Page visible on right edge */}
        <rect x="88" y="6" width="10" height="116" rx="1" fill="url(#nb_page)" />
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1="88" y1={9 + i * 5} x2="97" y2={9 + i * 5} stroke="#b0bec5" strokeWidth="0.35" opacity="0.5" />
        ))}

        {/* Main cover */}
        <rect x="0" y="0" width="91" height="128" rx="4" fill="url(#nb_cover)" />

        {/* Subtle ruled lines showing through cover (faint) */}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="12" y1={92 + i * 5} x2="82" y2={92 + i * 5} stroke="#1e3a5a" strokeWidth="0.5" opacity="0.4" />
        ))}

        {/* Teal top bar */}
        <rect x="0" y="0" width="91" height="10" rx="4" fill="url(#nb_teal)" />
        <rect x="0" y="6" width="91" height="4" fill="url(#nb_teal)" />

        {/* Teal bottom bar */}
        <rect x="0" y="118" width="91" height="10" rx="4" fill="url(#nb_teal)" />
        <rect x="0" y="118" width="91" height="4" fill="url(#nb_teal)" />

        {/* Teal side accent stripe */}
        <rect x="0" y="0" width="5" height="128" rx="2" fill="#00d4aa" opacity="0.18" />

        {/* Spiral binding */}
        {Array.from({ length: 12 }, (_, i) => {
          const y = 14 + i * 9;
          return (
            <g key={i}>
              {/* Ring arc top */}
              <path
                d={`M 8 ${y} Q 12 ${y - 3} 16 ${y}`}
                stroke="#94a3b8"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Ring body */}
              <path
                d={`M 8 ${y} Q 12 ${y + 3} 16 ${y}`}
                stroke="#64748b"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Hole */}
              <ellipse cx="12" cy={y} rx="2.2" ry="1.8" fill="url(#spiral_hole)" />
            </g>
          );
        })}

        {/* Cover content — IINT in chunky style */}
        {/* Big bold IINT */}
        <text
          x="54"
          y="60"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', 'Haettenschweiler', sans-serif"
          fontWeight="900"
          fontSize="30"
          letterSpacing="1"
          fill="#00d4aa"
          style={{ paintOrder: 'stroke fill' }}
        >
          IINT
        </text>

        {/* IINT text stroke outline for chunky block feel */}
        <text
          x="54"
          y="60"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', 'Haettenschweiler', sans-serif"
          fontWeight="900"
          fontSize="30"
          letterSpacing="1"
          fill="none"
          stroke="#007a62"
          strokeWidth="2"
          style={{ paintOrder: 'stroke fill' }}
        >
          IINT
        </text>
        <text
          x="54"
          y="60"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', 'Haettenschweiler', sans-serif"
          fontWeight="900"
          fontSize="30"
          letterSpacing="1"
          fill="#00d4aa"
        >
          IINT
        </text>

        {/* Divider line */}
        <rect x="28" y="65" width="52" height="2.5" rx="1.5" fill="#00d4aa" opacity="0.5" />

        {/* ACADEMY block text */}
        <text
          x="54"
          y="80"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', 'Haettenschweiler', sans-serif"
          fontWeight="900"
          fontSize="11"
          letterSpacing="4"
          fill="#f1f5f9"
          opacity="0.92"
        >
          ACADEMY
        </text>
        {/* ACADEMY subtle outline */}
        <text
          x="54"
          y="80"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', 'Haettenschweiler', sans-serif"
          fontWeight="900"
          fontSize="11"
          letterSpacing="4"
          fill="none"
          stroke="#0f2a44"
          strokeWidth="1.5"
          style={{ paintOrder: 'stroke fill' }}
        >
          ACADEMY
        </text>
        <text
          x="54"
          y="80"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', 'Haettenschweiler', sans-serif"
          fontWeight="900"
          fontSize="11"
          letterSpacing="4"
          fill="#f1f5f9"
          opacity="0.92"
        >
          ACADEMY
        </text>

        {/* Small decorative dots */}
        <circle cx="36" cy="88" r="1.5" fill="#00d4aa" opacity="0.45" />
        <circle cx="54" cy="88" r="1.5" fill="#00d4aa" opacity="0.45" />
        <circle cx="72" cy="88" r="1.5" fill="#00d4aa" opacity="0.45" />

        {/* Corner dog-ear fold bottom right */}
        <polygon points="76,110 91,110 91,128 76,128" fill="#0d2040" opacity="0.6" />
        <polygon points="76,110 91,128 76,128" fill="#07111e" opacity="0.9" />
        <line x1="76" y1="110" x2="91" y2="128" stroke="#1e3a5a" strokeWidth="0.8" />

        {/* Right edge shadow */}
        <rect x="86" y="0" width="5" height="128" rx="1" fill="black" opacity="0.15" />
      </svg>

      {size !== 'sm' && (
        <span
          className="text-[9px] tracking-[0.18em] uppercase font-black"
          style={{ color: '#00d4aa', fontFamily: "'Arial Black', sans-serif", opacity: 0.8 }}
        >
          Academy Notebook
        </span>
      )}
    </motion.div>
  );
}