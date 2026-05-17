import React from 'react';
import { motion } from 'framer-motion';

/**
 * TradingLedger — Premium leather-bound ledger prop.
 * Dark cognac leather texture, gold embroidered IINT crest, gilt page edges.
 * size: 'sm' | 'md' | 'lg'
 */
export default function TradingLedger({ size = 'md', onClick, className = '' }) {
  const dims = { sm: 48, md: 80, lg: 130 };
  const w = dims[size];
  const h = Math.round(w * 1.3);

  return (
    <motion.div
      onClick={onClick}
      className={`inline-flex flex-col items-center gap-1.5 cursor-pointer select-none ${className}`}
      whileHover={{ scale: 1.04, rotateY: 4 }}
      whileTap={{ scale: 0.97 }}
      style={{ perspective: 600 }}
      title="Trading Ledger"
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.7)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Deep leather gradient */}
          <linearGradient id="leather_body" x1="0" y1="0" x2="100" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2a1a0e" />
            <stop offset="35%" stopColor="#3d2410" />
            <stop offset="70%" stopColor="#2e1b0c" />
            <stop offset="100%" stopColor="#1c1008" />
          </linearGradient>

          {/* Spine gradient */}
          <linearGradient id="leather_spine" x1="0" y1="0" x2="14" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a0f06" />
            <stop offset="50%" stopColor="#3d2410" />
            <stop offset="100%" stopColor="#241509" />
          </linearGradient>

          {/* Gold gradient for trim */}
          <linearGradient id="gold_trim" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="40%" stopColor="#ffd700" />
            <stop offset="60%" stopColor="#daa520" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>

          {/* Gold for spine */}
          <linearGradient id="gold_spine" x1="0" y1="0" x2="0" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>

          {/* Page edge gradient */}
          <linearGradient id="page_edge" x1="85" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8d5a0" />
            <stop offset="40%" stopColor="#f5e6b0" />
            <stop offset="100%" stopColor="#c8b87a" />
          </linearGradient>

          {/* Leather grain texture */}
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>

          {/* Emboss for embroidery */}
          <filter id="emboss" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="4" specularConstant="1.2" specularExponent="12" result="specular">
              <fePointLight x="50" y="20" z="60" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceAlpha" operator="in" result="lit" />
            <feBlend in="SourceGraphic" in2="lit" mode="screen" />
          </filter>

          <clipPath id="book_clip">
            <rect x="0" y="0" width="100" height="130" rx="3" />
          </clipPath>
        </defs>

        {/* Page edges (right side gilt) */}
        <rect x="84" y="4" width="12" height="122" rx="1" fill="url(#page_edge)" />
        {/* Page lines on edge */}
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1="85" y1={6 + i * 4} x2="95" y2={6 + i * 4} stroke="#c8b060" strokeWidth="0.3" opacity="0.6" />
        ))}

        {/* Main cover body */}
        <rect x="0" y="0" width="88" height="130" rx="3" fill="url(#leather_body)" clipPath="url(#book_clip)" />

        {/* Leather grain overlay */}
        <rect x="0" y="0" width="88" height="130" rx="3" fill="url(#leather_body)" filter="url(#grain)" opacity="0.18" />

        {/* Subtle leather highlight (top sheen) */}
        <ellipse cx="44" cy="12" rx="30" ry="8" fill="white" opacity="0.04" />

        {/* Spine */}
        <rect x="0" y="0" width="14" height="130" rx="2" fill="url(#leather_spine)" />

        {/* Spine gold line left */}
        <line x1="13.5" y1="0" x2="13.5" y2="130" stroke="url(#gold_spine)" strokeWidth="0.8" opacity="0.7" />

        {/* Spine decorative bands */}
        <rect x="0" y="22" width="14" height="1.5" fill="url(#gold_trim)" opacity="0.6" />
        <rect x="0" y="107" width="14" height="1.5" fill="url(#gold_trim)" opacity="0.6" />

        {/* Cover border — gold gilt frame */}
        <rect x="17" y="8" width="65" height="114" rx="1.5" fill="none" stroke="url(#gold_trim)" strokeWidth="0.8" opacity="0.55" />
        <rect x="20" y="11" width="59" height="108" rx="1" fill="none" stroke="url(#gold_trim)" strokeWidth="0.4" opacity="0.35" />

        {/* Corner ornaments */}
        {[
          [17, 8], [82, 8], [17, 122], [82, 122]
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="2.2" fill="url(#gold_trim)" opacity="0.7" />
            <circle cx={cx} cy={cy} r="1" fill="#ffd700" opacity="0.9" />
          </g>
        ))}

        {/* Central embroidery crest area */}
        <ellipse cx="49" cy="58" rx="22" ry="26" fill="none" stroke="url(#gold_trim)" strokeWidth="0.6" opacity="0.3" />

        {/* Embroidered IINT text */}
        <g filter="url(#emboss)" opacity="0.92">
          <text
            x="49"
            y="55"
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="700"
            fontSize="16"
            letterSpacing="3"
            fill="#c8980a"
          >
            IINT
          </text>
          {/* Decorative line below IINT */}
          <line x1="32" y1="59" x2="66" y2="59" stroke="#c8980a" strokeWidth="0.7" opacity="0.8" />
          <line x1="36" y1="61" x2="62" y2="61" stroke="#c8980a" strokeWidth="0.4" opacity="0.5" />
        </g>

        {/* Small fleur / ornament above IINT */}
        <g opacity="0.6">
          <text x="49" y="44" textAnchor="middle" fontSize="7" fill="#c8980a" fontFamily="Georgia, serif">✦</text>
        </g>

        {/* Small ornament below lines */}
        <g opacity="0.5">
          <text x="49" y="71" textAnchor="middle" fontSize="5" fill="#c8980a" fontFamily="Georgia, serif">◆ ◆ ◆</text>
        </g>

        {/* Bottom label — "TRADING LEDGER" */}
        <text
          x="49"
          y="103"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="400"
          fontSize="4.5"
          letterSpacing="2.5"
          fill="#c8980a"
          opacity="0.65"
        >
          TRADING LEDGER
        </text>

        {/* Top spine label */}
        <text
          x="7"
          y="68"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontWeight="700"
          fontSize="5"
          letterSpacing="1.5"
          fill="#c8980a"
          opacity="0.7"
          transform="rotate(-90, 7, 68)"
        >
          IINT
        </text>

        {/* Subtle edge shadow on right */}
        <rect x="82" y="0" width="6" height="130" fill="black" opacity="0.2" rx="1" />

        {/* Top and bottom edge */}
        <rect x="0" y="0" width="88" height="1.5" rx="1" fill="url(#gold_trim)" opacity="0.25" />
        <rect x="0" y="128.5" width="88" height="1.5" rx="1" fill="url(#gold_trim)" opacity="0.25" />
      </svg>

      {size !== 'sm' && (
        <span
          className="text-[9px] tracking-[0.2em] uppercase font-medium"
          style={{ color: '#c8980a', fontFamily: 'Georgia, serif', opacity: 0.75 }}
        >
          Trading Ledger
        </span>
      )}
    </motion.div>
  );
}