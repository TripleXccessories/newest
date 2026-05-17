import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Ad banner that appears at top with countdown.
 * After countdown hits 0, shows skip button.
 * If user has subscription, ad is suppressed entirely.
 */

const ADS = [
  {
    id: 'pocket_pals',
    label: 'IINT Pocket Pals',
    body: 'Meet your AI trading companion. Personalized. Always learning. Always with you.',
    cta: 'Meet Your Pal →',
    link: '/academy-store',
    color: '#00d4aa',
    badge: 'IINT EXCLUSIVE',
    isPocketPal: true,
  },
  {
    id: 'academy',
    label: 'IINT Academy',
    body: 'Learn trading from 18 AI faculty. Free beta access — limited time.',
    cta: 'Join Academy →',
    link: '/academy-hub',
    color: '#a78bfa',
    badge: 'FEATURED',
  },
  {
    id: 'upgrade',
    label: 'Remove All Ads',
    body: 'Skip every ad automatically. Unlimited Bridge sessions. Priority AI compute.',
    cta: 'Get Bridge Pro — $29.99/mo',
    link: '#upgrade',
    color: '#f59e0b',
    badge: 'UPGRADE',
    isUpsell: true,
  },
];

export default function BridgeAdBanner({ hasSubscription, onAdStart, onAdEnd }) {
  const [adIndex, setAdIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (hasSubscription || dismissed) return;
    if (!visible) return;
    onAdStart?.();
    setCountdown(5);
    setCanSkip(false);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [adIndex, visible, hasSubscription, dismissed]);

  if (hasSubscription || dismissed) return null;

  const skip = () => {
    const next = adIndex + 1;
    if (next >= ADS.length) {
      setDismissed(true);
      onAdEnd?.();
    } else {
      setAdIndex(next);
      setCanSkip(false);
      setCountdown(5);
    }
  };

  const ad = ADS[adIndex];

  return (
    <div className="relative w-full overflow-hidden"
      style={{ background: `${ad.color}10`, borderBottom: `1px solid ${ad.color}30` }}>

      {/* Top ticker bar */}
      <div className="flex items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded"
            style={{ background: ad.color, color: '#030508' }}>
            {ad.badge}
          </span>
          <span className="text-[9px] text-[#64748b] font-mono">
            {canSkip ? 'Ad complete' : `Ad starts in ${countdown}s`}
          </span>
          {/* Countdown progress bar */}
          {!canSkip && (
            <div className="w-16 h-1 bg-[#1e293b] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%`, background: ad.color }} />
            </div>
          )}
        </div>

        {canSkip ? (
          <button onClick={skip}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black transition-all hover:scale-105"
            style={{ background: ad.color, color: '#030508' }}>
            {adIndex < ADS.length - 1 ? 'Skip Ad ›' : 'Close ×'}
          </button>
        ) : (
          <span className="text-[9px] text-[#334155] font-mono">Skip in {countdown}s</span>
        )}
      </div>

      {/* Ad body */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-[#f1f5f9]">{ad.label}</p>
          <p className="text-[10px] text-[#64748b] mt-0.5">{ad.body}</p>
        </div>
        <a href={ad.link}
          className="shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black transition-all hover:scale-105 whitespace-nowrap"
          style={{ background: `${ad.color}20`, border: `1px solid ${ad.color}50`, color: ad.color }}>
          {ad.cta}
        </a>
      </div>

      {/* Upsell strip — always visible below ads */}
      <div className="px-4 pb-2 flex items-center justify-between border-t border-[#1e293b]/50">
        <span className="text-[8px] text-[#334155]">Remove all ads with Bridge Pro</span>
        <div className="flex items-center gap-2">
          <a href="#upgrade" className="text-[8px] font-black text-[#f59e0b] hover:underline">$29.99/mo →</a>
          <button onClick={() => setDismissed(true)} className="text-[8px] text-[#334155] hover:text-[#64748b]">No thanks</button>
        </div>
      </div>
    </div>
  );
}