/**
 * IINT Tier Rules — Companion & Rental Allowances
 * Visible/purchasable ONLY after University level unlock.
 *
 * "selectable" = included in tier price (companions you get)
 * "rental_slots" = max rentals allowed (not included in price)
 */

export const TIER_RULES = {
  free: {
    label: 'Free / Beta',
    companions_included: 0,
    rental_slots_allowed: 0,
    headmaster_access: false,
  },
  retail: {
    label: 'Tier 1 — Retail',
    companions_included: 0,
    rental_slots_allowed: 5,
    headmaster_access: false,
  },
  pro: {
    label: 'Tier 2 — Pro',
    companions_included: 2,
    rental_slots_allowed: 5,    // additional 5 rentals allowed
    headmaster_access: false,
  },
  creator: {
    label: 'Tier 3 — Creator',
    companions_included: 3,
    rental_slots_allowed: 10,
    headmaster_access: false,
  },
  institutional: {
    label: 'Tier 4 — Institutional',
    companions_included: 4,    // selectable/included
    rental_slots_allowed: 15,
    headmaster_access: false,
  },
  ultimate: {
    label: 'Tier 5 — Ultimate (Institutional)',
    companions_included: 5,
    rental_slots_allowed: 19,   // 14 open + headmaster = 19 faculty
    headmaster_access: true,    // Headmaster unlocked
    open_slots: 14,
  },
};

/**
 * Companion Save Packs (pay-as-you-go saves)
 * Each "save" counts as 1 usage (edits count too).
 * Each "slot" = 1 card frame + background scene + character image + voice + mood + personality
 * Max 20 slots can be owned at any time.
 */
export const SAVE_PACKS = [
  {
    id: 'saves_5',
    label: '5 Saves',
    saves: 5,
    slots: 1,
    price_usd: 4.99,
    description: '5 save credits + 1 character slot',
    override_note: 'If no free slots, you can override an existing slot.',
  },
  {
    id: 'saves_15',
    label: '15 Saves',
    saves: 15,
    slots: 1,
    price_usd: 12.99,
    description: '15 save credits + 1 character slot',
    override_note: 'If no free slots, you can override an existing slot.',
  },
  {
    id: 'saves_30',
    label: '30 Saves + Bonus Slot',
    saves: 30,
    slots: 2,   // 1 standard + 1 free bonus
    price_usd: 24.99,
    description: '30 save credits + 1 character slot + 1 FREE bonus slot',
    badge: 'BEST VALUE',
    override_note: 'If no free slots, you can override an existing slot.',
  },
];

export const MAX_COMPANION_SLOTS = 20;

/**
 * Check if a user's subscription tier has Creator-level access
 * (needed to Save/Export custom companions)
 */
export function hasCreatorAccess(subscriptionTier) {
  return ['creator', 'institutional', 'ultimate'].includes(subscriptionTier);
}

/**
 * Check if companion store/pricing is visible (requires University graduation)
 */
export function isCompanionStoreUnlocked(progress) {
  return !!progress?.graduation_uni_complete;
}

/**
 * Get companion allowance for a given tier
 */
export function getTierAllowance(tier) {
  return TIER_RULES[tier] || TIER_RULES.free;
}