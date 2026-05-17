import React, { useState, useEffect } from 'react';

// Rotating ad slots — replace slot.content with real ad tags / images when live
const AD_SLOTS = [
  { id: 1, label: 'Your Ad Here', sub: 'Premium placement · IINT INC', color: '#00d4aa', bg: '#00d4aa08' },
  { id: 2, label: 'Advertise with IINT', sub: 'Rotating 15s slots · growing audience', color: '#fbbf24', bg: '#fbbf2408' },
  { id: 3, label: 'Partner Spotlight', sub: 'Contact us for rates', color: '#a78bfa', bg: '#a78bfa08' },
];

const ROTATE_INTERVAL = 15000; // 15 seconds

export default function AdBanner({ position = 'bottom' }) {
  const [currentSlot, setCurrentSlot] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentSlot(prev => (prev + 1) % AD_SLOTS.length);
        setVisible(true);
      }, 300);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const slot = AD_SLOTS[currentSlot];

  return (
    <div
      className="w-full border-t border-[#1e293b] select-none pointer-events-none"
      style={{ background: slot.bg }}
      aria-hidden="true"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-1.5 flex items-center justify-between">
        <div
          className="flex items-center gap-3 transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <span className="text-[9px] text-[#1e293b] uppercase tracking-widest font-bold shrink-0">AD</span>
          <span className="text-xs font-bold" style={{ color: slot.color }}>{slot.label}</span>
          <span className="text-[10px] text-[#334155]">— {slot.sub}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {AD_SLOTS.map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full transition-colors"
              style={{ background: i === currentSlot ? slot.color : '#1e293b' }} />
          ))}
        </div>
      </div>
    </div>
  );
}