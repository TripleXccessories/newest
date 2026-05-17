import React from 'react';
import { Sparkles } from 'lucide-react';

const DEFAULT_SPECIALS = [
  { label: 'Founder Bundle', description: 'Foundations Course + 3-Month Bot Trio', price: '$99', badge: '🔥 TODAY ONLY' },
  { label: 'Notes + Templates', description: 'Collectible Notes + Trading Templates combo', price: '$39', badge: '💰 SAVE $9' },
];

/**
 * SpecialsBoard — the chalkboard-style "Today's Specials" sign on the counter.
 */
export default function SpecialsBoard({ specials }) {
  const items = specials?.length ? specials : DEFAULT_SPECIALS;

  return (
    <div
      className="relative rounded-2xl px-4 py-3 w-full max-w-sm mx-auto"
      style={{
        background: 'linear-gradient(135deg, #0d1f0d 0%, #0a1a0a 100%)',
        border: '2px solid #22543d',
        boxShadow: '0 0 20px rgba(0,180,80,0.08)',
      }}
    >
      {/* Sign header */}
      <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-[#22543d]">
        <Sparkles size={11} className="text-[#fbbf24]" />
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#fbbf24]">Today's Specials</p>
        <Sparkles size={11} className="text-[#fbbf24]" />
      </div>

      {/* Items */}
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {item.badge && (
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded mr-1"
                  style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                  {item.badge}
                </span>
              )}
              <p className="text-[10px] font-bold text-[#f1f5f9] leading-tight mt-0.5">{item.label}</p>
              {item.description && (
                <p className="text-[8px] text-[#4ade80]/70 leading-snug mt-0.5">{item.description}</p>
              )}
            </div>
            <p className="text-[13px] font-black text-[#4ade80] shrink-0">{item.price}</p>
          </div>
        ))}
      </div>

      {/* Chalk texture overlay */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'0\' y=\'0\' width=\'1\' height=\'1\' fill=\'white\'/%3E%3C/svg%3E")', backgroundSize: '4px 4px' }} />
    </div>
  );
}