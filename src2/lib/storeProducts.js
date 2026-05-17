/**
 * Shared product definitions for both Academy Store and Trading Platform
 * Memberships and Bot Rentals are available in BOTH stores
 */

import { Award, Users, BookOpen } from 'lucide-react';

// Memberships — unlock bot rentals in both stores
export const MEMBERSHIPS = [
  {
    id: 'membership-pro',
    type: 'membership',
    title: 'Pro Companion',
    subtitle: 'Monthly access to AI mentors',
    description: 'Full Academy + Trading Platform. Rent bots for personalized guidance on learning or trading strategy.',
    price: 29,
    billing: '/month',
    color: '#fbbf24',
    icon: Award,
    content: 'Bot rental slots unlocked, Academy courses, signal access, community',
    renewable: true,
    renewalPeriod: 'month',
  },
  {
    id: 'membership-lifetime',
    type: 'membership',
    title: 'Lifetime Companion',
    subtitle: 'Permanent membership',
    description: 'Forever access to bot rentals, Academy content, trading signals, and all future platform features.',
    price: 399,
    color: '#fb7185',
    icon: Award,
    content: 'Unlimited bot rental slots forever, all courses, all signals, priority support',
    renewable: false,
  },
];

// Bot Rentals — accessible to members in both stores
export const BOT_RENTALS = [
  {
    id: 'rental-monthly',
    type: 'rental',
    title: 'Single Bot Mentor',
    subtitle: '30-day rental',
    description: 'Rent one faculty bot as your personal guide. For learning trading foundations or discussing live strategies.',
    price: 19,
    billing: '/month',
    color: '#0ea5e9',
    icon: Users,
    content: 'Chat access to 1 bot, personalized guidance, strategy discussion, 30-day window',
    renewable: true,
    renewalPeriod: 'month',
  },
  {
    id: 'rental-trio',
    type: 'rental',
    title: 'Bot Trio',
    subtitle: '90-day rental',
    description: 'Rent up to 3 bots simultaneously. Different perspectives on your trades and learning goals.',
    price: 49,
    billing: '/quarter',
    color: '#06b6d4',
    icon: Users,
    content: 'Chat access to 3 bots, diverse mentorship, group sessions, 90-day window',
    renewable: true,
    renewalPeriod: 'quarter',
  },
];

// Academy-only products (courses + digital resources)
export const ACADEMY_ONLY_PRODUCTS = [
  {
    id: 'course-foundations',
    type: 'course',
    title: 'Trading Foundations',
    subtitle: 'Kindergarten → Grade School',
    description: 'Learn market basics, chart reading, and fundamental analysis from our faculty.',
    price: 49,
    color: '#00d4aa',
    icon: BookOpen,
    content: '12 interactive lessons, 48 key takeaway notes, 1 badge',
    renewable: false,
  },
  {
    id: 'course-advanced',
    type: 'course',
    title: 'Advanced Trading Strategies',
    subtitle: 'High School → University',
    description: 'Deep dive into technical analysis, risk management, and portfolio construction.',
    price: 99,
    color: '#a78bfa',
    icon: BookOpen,
    content: '24 advanced lessons, 96 concept visuals, 3 badges, lifetime access',
    renewable: false,
  },
  {
    id: 'resource-notes',
    type: 'resource',
    title: 'Collectible Notes Bundle',
    subtitle: 'All 200+ concept visuals',
    description: 'Digital art collection of all key lessons learned throughout the Academy.',
    price: 29,
    color: '#8b5cf6',
    icon: BookOpen,
    content: '200+ high-res PNG/PDF, shareable on social media',
    renewable: false,
  },
  {
    id: 'resource-templates',
    type: 'resource',
    title: 'Trading Templates',
    subtitle: 'Strategy worksheets & journals',
    description: 'Downloadable Excel templates, PDF worksheets, and journaling tools.',
    price: 19,
    color: '#ec4899',
    icon: BookOpen,
    content: '50+ templates, trade journal, risk calculator, strategy builder',
    renewable: false,
  },
];

// Trading Platform-only products (signals + data)
export const TRADING_ONLY_PRODUCTS = [
  {
    id: 'signal-pro',
    type: 'signals',
    title: 'Pro Signals',
    subtitle: 'Real-time trading signals',
    description: 'AI-generated trading signals with risk analysis, confidence scoring, and historical performance.',
    price: 49,
    color: '#fbbf24',
    content: 'Real-time signals, technical analysis, risk metrics, signal history, email alerts',
    renewable: true,
    renewalPeriod: 'month',
  },
  {
    id: 'data-premium',
    type: 'data',
    title: 'Premium Market Data',
    subtitle: 'Advanced analytics & historical data',
    description: 'High-quality market data, advanced charting, volatility indices, and backtesting tools.',
    price: 29,
    color: '#00d4aa',
    content: 'Real-time data, advanced charts, volatility analysis, backtesting, API access',
    renewable: true,
    renewalPeriod: 'month',
  },
];