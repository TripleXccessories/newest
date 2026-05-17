import React, { useState } from 'react';
import { Heart, QrCode, ExternalLink, X, DollarSign } from 'lucide-react';

/**
 * TipJar — the interactive tip jar component for the Academy Store counter.
 * Shows a tip jar icon. On click, opens a modal with PayPal link + QR code.
 */

export default function TipJar({ config }) {
  const [open, setOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const title = config?.tip_jar_title || 'Tips for Development & Cooler Features';
  const message = config?.tip_jar_message || 'Every contribution goes straight back into building new features, better characters, and a cooler experience for everyone. Thank you! 🙏';
  const paypalUrl = config?.tip_jar_paypal_url || '#';
  const qrUrl = config?.tip_jar_qr_image_url || null;
  const presets = config?.tip_presets || [2, 5, 10, 20];

  const handleTip = (amount) => {
    const url = paypalUrl === '#' ? '#' : `${paypalUrl}/${amount}USD`;
    if (url !== '#') window.open(url, '_blank');
    else alert('PayPal link coming soon!');
  };

  return (
    <>
      {/* The jar on the counter */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 group cursor-pointer"
        title="Tip Jar — Support Development"
      >
        <div className="relative w-12 h-14 flex items-end justify-center">
          {/* Jar body */}
          <div
            className="w-10 h-12 rounded-b-xl rounded-t-lg border-2 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-[#fbbf24]"
            style={{ background: 'rgba(251,191,36,0.08)', borderColor: '#fbbf24aa' }}
          >
            {/* Coins inside */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-1 rounded-full" style={{ background: '#fbbf24', opacity: 0.6 + i * 0.15 }} />
              ))}
            </div>
            {/* Heart icon */}
            <Heart size={12} className="text-[#fbbf24] mb-4" fill="#fbbf24" />
          </div>
          {/* Jar lid */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-2 rounded-t-lg border-t-2 border-x-2 transition-all group-hover:border-[#fbbf24]"
            style={{ background: 'rgba(251,191,36,0.15)', borderColor: '#fbbf24aa' }}
          />
        </div>
        <p
          className="text-[7px] font-black tracking-widest uppercase text-center max-w-[56px] leading-tight transition-colors group-hover:text-[#fbbf24]"
          style={{ color: '#fbbf2499' }}
        >
          TIPS
        </p>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-[#fbbf24]/30 p-6 space-y-5"
            style={{ background: 'linear-gradient(135deg, #0a0c14 0%, #111623 100%)', boxShadow: '0 0 40px rgba(251,191,36,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]">
              <X size={12} className="text-[#64748b]" />
            </button>

            {/* Header */}
            <div className="text-center">
              <div className="text-4xl mb-2">🫙</div>
              <h3 className="text-sm font-black text-[#fbbf24]">{title}</h3>
              <p className="text-[10px] text-[#64748b] mt-1 leading-relaxed">{message}</p>
            </div>

            {/* Preset tip amounts */}
            <div>
              <p className="text-[9px] text-[#475569] uppercase font-bold mb-2 tracking-widest">Quick Tip</p>
              <div className="grid grid-cols-4 gap-2">
                {presets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleTip(amount)}
                    className="py-2 rounded-xl text-xs font-black border transition-all hover:scale-105"
                    style={{ borderColor: '#fbbf2450', background: 'rgba(251,191,36,0.08)', color: '#fbbf24' }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <p className="text-[9px] text-[#475569] uppercase font-bold mb-2 tracking-widest">Custom Amount</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-[#0a0f1e] border border-[#1e293b] text-[#f1f5f9] outline-none focus:border-[#fbbf24]/50"
                  />
                </div>
                <button
                  onClick={() => customAmount && handleTip(parseFloat(customAmount))}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                  style={{ background: '#fbbf24', color: '#0a0c14' }}
                >
                  Tip
                </button>
              </div>
            </div>

            {/* PayPal link */}
            <a
              href={paypalUrl !== '#' ? paypalUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={paypalUrl === '#' ? e => { e.preventDefault(); alert('PayPal link coming soon!'); } : undefined}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border transition-all hover:opacity-90"
              style={{ borderColor: '#0070ba', background: 'rgba(0,112,186,0.12)', color: '#4da9e8' }}
            >
              <ExternalLink size={12} /> Open PayPal Directly
            </a>

            {/* QR Code */}
            {qrUrl ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-[9px] text-[#475569] uppercase font-bold tracking-widest">Scan QR to Tip</p>
                <div className="p-2 rounded-xl bg-white inline-block">
                  <img src={qrUrl} alt="Tip QR Code" className="w-28 h-28 object-contain" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 opacity-40">
                <QrCode size={32} className="text-[#475569]" />
                <p className="text-[8px] text-[#334155]">QR code — set by admin</p>
              </div>
            )}

            <p className="text-[8px] text-[#334155] text-center">All tips go towards development & new features. Non-refundable. Thank you! ❤️</p>
          </div>
        </div>
      )}
    </>
  );
}