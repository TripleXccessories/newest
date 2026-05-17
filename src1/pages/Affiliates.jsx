import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Zap, Shield, Music, Brain, Globe, Dice5, ChevronDown, ChevronUp } from 'lucide-react';

const TECH_AFFILIATES = [
  {
    name: 'Base44',
    logo: '⚡',
    tagline: 'The platform that built this.',
    desc: 'No-code AI app builder — build full-stack apps with AI in minutes. Sign up and get started free.',
    url: 'https://base44.com',
    color: '#00d4aa',
    referral: true,
    badge: 'Our Builder',
  },
  {
    name: 'Microsoft',
    logo: '🪟',
    tagline: 'Azure AI Services powering our voice engine.',
    desc: 'Azure Cognitive Services — Text to Speech, Vision AI, and more. The backbone of our voice stack.',
    url: 'https://azure.microsoft.com',
    color: '#0078d4',
    badge: 'Powered By',
  },
  {
    name: 'ElevenLabs',
    logo: '🎙️',
    tagline: 'AI voice cloning & TTS.',
    desc: 'The most realistic AI voice generation platform. Clone any voice, generate studio-quality speech.',
    url: 'https://elevenlabs.io',
    color: '#a78bfa',
    referral: true,
    badge: 'Voice Partner',
  },
  {
    name: 'Google',
    logo: '🟢',
    tagline: 'Google Play distribution partner.',
    desc: 'Download our Pocket Pals apps on the Google Play Store — trusted, secure, official.',
    url: 'https://play.google.com',
    color: '#34a853',
    badge: 'App Store',
  },
  {
    name: 'Apple',
    logo: '🍎',
    tagline: 'iOS App Store distribution partner.',
    desc: 'Download our Pocket Pals apps on the Apple App Store — verified, safe, official.',
    url: 'https://apps.apple.com',
    color: '#f1f5f9',
    badge: 'App Store',
  },
];

const CASINO_AFFILIATES = [
  {
    name: 'Bet365',
    logo: '🎰',
    tagline: 'Sports, casino & live dealer.',
    desc: 'One of the world\'s most trusted online gaming platforms. Licensed & regulated. New members welcome.',
    url: 'https://www.bet365.com',
    color: '#00a651',
    crypto: false,
  },
  {
    name: 'DraftKings Casino',
    logo: '🏆',
    tagline: 'North America\'s favourite.',
    desc: 'Legal, regulated online casino available in Ontario. Slots, table games, and live dealer.',
    url: 'https://casino.draftkings.com',
    color: '#53d22c',
    crypto: false,
  },
  {
    name: 'Betway',
    logo: '🎲',
    tagline: 'Ontario licensed & trusted.',
    desc: 'Betway Casino — fully licensed in Ontario. Great welcome bonuses, hundreds of games.',
    url: 'https://betway.com',
    color: '#d4a017',
    crypto: false,
  },
  {
    name: 'Stake.com',
    logo: '💎',
    tagline: 'Crypto casino leader.',
    desc: 'The #1 crypto casino. Accepts BTC, ETH, LTC and more. Provably fair, instant payouts.',
    url: 'https://stake.com',
    color: '#1ca672',
    crypto: true,
  },
  {
    name: 'Cloudbet',
    logo: '☁️',
    tagline: 'Crypto deposits & withdrawals.',
    desc: 'Sports & casino with full crypto support. BTC, ETH, USDT accepted. No KYC for crypto.',
    url: 'https://cloudbet.com',
    color: '#3b82f6',
    crypto: true,
  },
];

function AffiliateCard({ affiliate, index }) {
  return (
    <motion.a
      href={affiliate.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="block rounded-2xl border p-5 transition-all group"
      style={{ borderColor: `${affiliate.color}30`, background: `${affiliate.color}08` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{affiliate.logo}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f1f5f9]">{affiliate.name}</h3>
              {affiliate.badge && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: `${affiliate.color}25`, color: affiliate.color }}>
                  {affiliate.badge}
                </span>
              )}
              {affiliate.crypto && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#f59e0b]/20 text-[#f59e0b]">
                  ₿ Crypto
                </span>
              )}
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: affiliate.color }}>{affiliate.tagline}</p>
          </div>
        </div>
        <ExternalLink size={13} className="text-[#334155] group-hover:text-[#f1f5f9] transition-colors mt-1 shrink-0" />
      </div>
      <p className="text-xs text-[#64748b] leading-relaxed">{affiliate.desc}</p>
      {affiliate.referral && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: affiliate.color }}>
          <Star size={9} /> Referral rewards available — sign up through this link
        </div>
      )}
    </motion.a>
  );
}

export default function Affiliates() {
  const [showCasinos, setShowCasinos] = useState(false);

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14] px-6 py-5">
        <h1 className="text-xl font-black text-[#f1f5f9]">Affiliates & Partners</h1>
        <p className="text-xs text-[#475569] mt-1">The people, platforms, and tools that make IINT INC possible.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Tech Partners */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[#00d4aa]" />
            <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-widest">Technology Partners</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {TECH_AFFILIATES.map((a, i) => <AffiliateCard key={a.name} affiliate={a} index={i} />)}
          </div>
        </section>

        {/* Ad banner placeholder */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-[#fbbf24]" />
            <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-widest">Advertising</h2>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-[#1e293b] p-6 text-center space-y-2">
            <p className="text-xs font-bold text-[#334155]">ADVERTISING PARTNER SLOT</p>
            <p className="text-[10px] text-[#1e293b]">Premium banner placement · rotating 15s slots · contact IINT INC for rates</p>
            <div className="inline-block px-4 py-1.5 rounded-lg border border-[#1e293b] text-[10px] text-[#334155]">
              728×90 leaderboard · 300×250 medium rectangle · contact for custom
            </div>
          </div>
        </section>

        {/* Casino section — collapsed behind toggle */}
        <section>
          <button onClick={() => setShowCasinos(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-[#1e293b] bg-[#0a0f1e] transition-all hover:border-[#334155]">
            <div className="flex items-center gap-3">
              <Dice5 size={16} className="text-[#f97316]" />
              <div className="text-left">
                <p className="text-sm font-bold text-[#f1f5f9]">Gaming & Casino Partners</p>
                <p className="text-[10px] text-[#475569]">Ontario-available · some accept crypto · affiliate referrals</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#475569] italic">Need a break? Check these out.</span>
              {showCasinos ? <ChevronUp size={14} className="text-[#475569]" /> : <ChevronDown size={14} className="text-[#475569]" />}
            </div>
          </button>

          {showCasinos && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
              <div className="px-4 py-2 rounded-xl bg-[#fbbf24]/08 border border-[#fbbf24]/20">
                <p className="text-[10px] text-[#fbbf24]">
                  🎰 <strong>18+ · Gamble Responsibly.</strong> These are affiliate referral links — IINT INC may receive a commission when you sign up. Ontario residents only where applicable. If gambling is causing harm, visit <a href="https://www.connexontario.ca" target="_blank" rel="noopener noreferrer" className="underline">ConnexOntario.ca</a>.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {CASINO_AFFILIATES.map((a, i) => <AffiliateCard key={a.name} affiliate={a} index={i} />)}
              </div>
            </motion.div>
          )}
        </section>

        {/* Fine print */}
        <div className="text-center py-6 border-t border-[#1e293b]">
          <p className="text-[10px] text-[#1e293b] leading-relaxed max-w-xl mx-auto">
            IINT INC participates in affiliate programs and may receive compensation when you sign up or make a purchase through links on this page. This does not affect our recommendations or the cost to you. All gaming services are independent of IINT INC's trading and education platform.
          </p>
        </div>

      </div>
    </div>
  );
}