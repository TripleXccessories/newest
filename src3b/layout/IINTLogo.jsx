import React from 'react';
import { motion } from 'framer-motion';

export default function IINTLogo({ size = 'md', showTagline = false, animated = false }) {
  const sizes = {
    sm: { icon: 22, text: 'text-sm', tagline: 'text-xs', gap: 'gap-2' },
    md: { icon: 30, text: 'text-lg', tagline: 'text-xs', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-2xl', tagline: 'text-sm', gap: 'gap-3' },
    xl: { icon: 60, text: 'text-3xl', tagline: 'text-base', gap: 'gap-4' },
  };
  const s = sizes[size] || sizes.md;

  const NodeSvg = (
    <svg width={s.icon} height={s.icon} viewBox="0 0 44 44" fill="none">
      {/* Outer ring */}
      <circle cx="22" cy="22" r="20" stroke="#00d4aa" strokeWidth="0.5" strokeOpacity="0.15" />
      {/* Core node */}
      <circle cx="22" cy="22" r="5" fill="#00d4aa" fillOpacity="0.2" stroke="#00d4aa" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="2" fill="#00d4aa" />
      {/* Satellite nodes */}
      {[
        { cx: 7, cy: 22 }, { cx: 37, cy: 22 },
        { cx: 22, cy: 7 }, { cx: 22, cy: 37 },
        { cx: 11, cy: 11 }, { cx: 33, cy: 11 },
        { cx: 11, cy: 33 }, { cx: 33, cy: 33 },
      ].map((n, i) => (
        <circle key={i} cx={n.cx} cy={n.cy} r="2.5" fill="#00d4aa" fillOpacity={i < 4 ? 0.9 : 0.5} />
      ))}
      {/* Cardinal connections */}
      {[
        [9.5, 22, 17, 22], [27, 22, 34.5, 22],
        [22, 9.5, 22, 17], [22, 27, 22, 34.5],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00d4aa" strokeWidth="1.2" strokeOpacity="0.6" />
      ))}
      {/* Diagonal connections */}
      {[
        [13.5, 13.5, 18, 18], [25.5, 18, 30.5, 13.5],
        [13.5, 30.5, 18, 26], [25.5, 26, 30.5, 30.5],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00d4aa" strokeWidth="0.8" strokeOpacity="0.35" />
      ))}
      {/* Pulse ring */}
      {animated && (
        <circle cx="22" cy="22" r="10" fill="none" stroke="#00d4aa" strokeWidth="1" strokeOpacity="0.3">
          <animate attributeName="r" values="10;18;10" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );

  return (
    <div className={`flex flex-col items-start ${s.gap}`}>
      <div className={`flex items-center ${s.gap}`}>
        {NodeSvg}
        <div className="flex items-baseline gap-1.5">
          <span className={`${s.text} font-black text-[#f1f5f9] tracking-tight leading-none`}>
            <span className="text-[#00d4aa]">I</span>nvest
            <span className="text-[#00d4aa]">I</span>n
            <span className="text-[#00d4aa]">N</span>eural
            <span className="text-[#00d4aa]">T</span><span className="text-[#00d4aa]">rading</span>
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-black bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#070b14] rounded-md uppercase tracking-wider shadow-sm">
            BETA
          </span>
        </div>
      </div>
      {showTagline && (
        <p className={`${s.tagline} text-[#475569] font-medium italic tracking-wide`}>
          "Trust, Built from the Core."
        </p>
      )}
    </div>
  );
}