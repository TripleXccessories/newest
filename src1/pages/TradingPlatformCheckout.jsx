import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Zap, ArrowLeft, Lock, TrendingUp } from 'lucide-react';

/**
 * TradingPlatformCheckout — High-risk processor (Nuvei/Checkout.com)
 * Trading signals, market data, memberships, bot rentals
 * Memberships unlock bot rentals in both stores
 */

import { MEMBERSHIPS, BOT_RENTALS, TRADING_ONLY_PRODUCTS } from '@/lib/storeProducts';

const PLATFORM_TIERS = [
  {
    id: 'pro-monthly',
    name: 'Pro Trader',
    subtitle: 'Monthly subscription',
    price: 49,
    billing: '/month',
    color: '#fbbf24',
    features: [
      'Real-time trading signals',
      'Advanced risk monitoring',
      'Kill switch automation',
      'Premium market data',
      'Technical analysis tools',
      'Bot rental eligibility',
    ],
  },
  {
    id: 'institutional',
    name: 'Institutional',
    subtitle: 'Monthly subscription',
    price: 199,
    billing: '/month',
    color: '#00d4aa',
    features: [
      'Everything in Pro',
      'Custom API access',
      'Multi-account management',
      'Dedicated support',
      'White-label options',
      'Webhook integrations',
      'Advanced analytics',
      'Unlimited bot rentals',
    ],
    highlighted: true,
  },
  {
    id: 'signal-only',
    name: 'Signal Access',
    subtitle: 'Limited platform access',
    price: 19,
    billing: '/month',
    color: '#a78bfa',
    features: [
      'AI-generated trading signals',
      'Signal history & stats',
      'Basic market data',
      'Email notifications',
    ],
  },
];

export default function TradingPlatformCheckout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState('pro-monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const selectedTier = PLATFORM_TIERS.find(t => t.id === selected);

  return (
    <div className="min-h-screen bg-[#070b14]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-sm border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#64748b] hover:text-[#f1f5f9] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl font-bold text-[#f1f5f9]">Trading Platform Access</h1>
          <div className="flex items-center gap-2 text-[#00d4aa]">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold">SECURE</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-[#fbbf24]" />
            <h2 className="text-4xl font-bold text-[#f1f5f9]">Trading Signals & Data</h2>
          </div>
          <p className="text-[#64748b] max-w-2xl mx-auto">
            Access live trading signals, advanced risk monitoring, and market data to power your trading strategy.
          </p>
        </motion.div>

        {/* Pricing Tiers + Add-ons */}
        <div className="space-y-8 mb-12">
          <div>
            <h3 className="text-lg font-bold text-[#f1f5f9] mb-4">Platform Access</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {PLATFORM_TIERS.map((tier, idx) => {
                const isSelected = selected === tier.id;
                return (
                  <motion.button
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelected(tier.id)}
                    className={`relative p-8 rounded-2xl border-2 transition-all text-left group ${
                      isSelected
                        ? 'border-[#00d4aa] bg-[#00d4aa]/5 shadow-lg'
                        : 'border-[#1e293b] bg-[#111827] hover:border-[#1e293b]/60'
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#fbbf24] text-[#070b14] text-xs font-black rounded-full">
                        POPULAR
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-[#f1f5f9] mb-1">{tier.name}</h3>
                    <p className="text-xs text-[#64748b] mb-4">{tier.subtitle}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-black" style={{ color: tier.color }}>${tier.price}</span>
                      <span className="text-sm text-[#64748b]">{tier.billing}</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="text-sm text-[#94a3b8] flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${
                        isSelected
                          ? `bg-[${tier.color}] text-[#070b14]`
                          : 'bg-[#1e293b] text-[#f1f5f9] group-hover:bg-[#1e293b]/60'
                      }`}
                      style={{
                        background: isSelected ? tier.color : undefined,
                        color: isSelected ? '#070b14' : undefined,
                      }}
                    >
                      {isSelected ? '✓ Selected' : 'Select Plan'}
                    </button>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Optional Add-ons: Memberships & Bot Rentals */}
          <div>
            <h3 className="text-lg font-bold text-[#f1f5f9] mb-4">Optional Add-ons: Bot Companions</h3>
            <p className="text-sm text-[#64748b] mb-4">Access AI mentors across both Academy and Trading platform.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[...MEMBERSHIPS, ...BOT_RENTALS].map((addon, idx) => (
                <motion.div
                  key={addon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 hover:border-[#1e293b]/60 transition-all group"
                >
                  <h4 className="font-bold text-[#f1f5f9] mb-1">{addon.title}</h4>
                  <p className="text-xs text-[#64748b] mb-3">{addon.subtitle}</p>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black" style={{ color: addon.color }}>
                      ${addon.price.toFixed(2)}
                    </span>
                    {addon.billing && <span className="text-xs text-[#64748b]">{addon.billing}</span>}
                  </div>
                  <p className="text-xs text-[#94a3b8] mb-4">{addon.content}</p>
                  <button
                    className="w-full py-2 text-xs rounded-lg font-bold transition-all text-[#070b14]"
                    style={{ background: addon.color }}
                  >
                    Add to Cart
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Checkout Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-[#111827] border border-[#1e293b] rounded-2xl p-8"
        >
          <h3 className="text-lg font-bold text-[#f1f5f9] mb-6">Order Summary</h3>

          <div className="space-y-4 mb-6 pb-6 border-b border-[#1e293b]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#f1f5f9]">{selectedTier?.name}</p>
                <p className="text-xs text-[#64748b]">{selectedTier?.subtitle}</p>
              </div>
              <p className="text-lg font-bold" style={{ color: selectedTier?.color }}>
                ${selectedTier?.price}{selectedTier?.billing}
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-lg mb-6">
            <Lock className="w-4 h-4 text-[#0ea5e9] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#64748b]">
              Payments processed by <strong>Nuvei</strong> — PCI-DSS compliant, high-risk fintech approved. Your data is encrypted and secure.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              // TODO: Integrate Nuvei/Checkout.com
              alert('Nuvei checkout integration coming soon!');
            }}
            className="w-full py-4 rounded-xl font-bold transition-all"
            style={{
              background: selectedTier?.color,
              color: '#070b14',
              boxShadow: `0 0 40px ${selectedTier?.color}40`,
            }}
          >
            Proceed to Secure Checkout →
          </button>

          <p className="text-[10px] text-[#334155] text-center mt-4">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-[#f1f5f9] mb-6">Frequently Asked Questions</h3>
          {[
            {
              q: 'Can I change my subscription later?',
              a: 'Yes, you can upgrade, downgrade, or cancel anytime from your account dashboard.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, bank transfers, and digital wallets through our secure Nuvei processor.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Academy members get free access to basic signals. Platform features require a paid subscription.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'Yes, 30-day refund policy for all first-time subscriptions if you\'re not satisfied.',
            },
          ].map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#111827] border border-[#1e293b] rounded-xl p-4"
            >
              <p className="font-bold text-[#f1f5f9] text-sm mb-2">{faq.q}</p>
              <p className="text-sm text-[#94a3b8]">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}