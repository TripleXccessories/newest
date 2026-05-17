/**
 * Store shift logic — determines which 2 faculty members are "behind the counter"
 * based on the current date and time of day.
 * 
 * 3 shifts per day (8h each), seeded by date so it's consistent per user visit.
 * Shift 1: 00:00–07:59  (late night / early morning)
 * Shift 2: 08:00–15:59  (daytime)
 * Shift 3: 16:00–23:59  (evening)
 */

// 18 faculty code IDs — used to deterministically pick staff
const FACULTY_POOL = [
  { name: 'Da Feathered Sage',   archetype: 'Guide',      color: '#f59e0b', school: 'Foundations' },
  { name: 'The Iron Scribe',     archetype: 'Creator',    color: '#f97316', school: 'Making' },
  { name: 'Da PrEAChEr',        archetype: 'Oracle',     color: '#7c3aed', school: 'Analysis' },
  { name: 'Lady Fracture',       archetype: 'Challenger', color: '#fb7185', school: 'Critical Inquiry' },
  { name: 'The Warden',          archetype: 'Guardian',   color: '#4ade80', school: 'Stewardship' },
  { name: 'Zephyr Flux',         archetype: 'Catalyst',   color: '#2dd4bf', school: 'Transformation' },
  { name: 'Nova Strix',          archetype: 'Oracle',     color: '#818cf8', school: 'Analysis' },
  { name: 'The Cobbler',         archetype: 'Creator',    color: '#fb923c', school: 'Making' },
  { name: 'Elder Morrow',        archetype: 'Guide',      color: '#fde68a', school: 'Foundations' },
  { name: 'Sable Rune',          archetype: 'Guardian',   color: '#6ee7b7', school: 'Stewardship' },
  { name: 'Vex Thornwood',       archetype: 'Challenger', color: '#f43f5e', school: 'Critical Inquiry' },
  { name: 'Cipher Blue',         archetype: 'Catalyst',   color: '#38bdf8', school: 'Transformation' },
  { name: 'The Archivist',       archetype: 'Oracle',     color: '#c084fc', school: 'Analysis' },
  { name: 'Mira Halo',           archetype: 'Guide',      color: '#fbbf24', school: 'Foundations' },
  { name: 'Frost Lumen',         archetype: 'Creator',    color: '#67e8f9', school: 'Making' },
  { name: 'Dirk Ashvale',        archetype: 'Challenger', color: '#fca5a5', school: 'Critical Inquiry' },
  { name: 'Solenne',             archetype: 'Guardian',   color: '#86efac', school: 'Stewardship' },
  { name: 'The Headmaster',      archetype: 'Catalyst',   color: '#00d4aa', school: 'Transformation' },
];

// Deterministic seeded shuffle using date string + shift number
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dateSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getTodaysShifts(now = new Date()) {
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const hour = now.getHours();
  const shift = hour < 8 ? 0 : hour < 16 ? 1 : 2;
  const seed = dateSeed(dateStr + '-' + shift);
  const shuffled = seededShuffle(FACULTY_POOL, seed);
  // Return 2 staff members for the current shift
  return shuffled.slice(0, 2);
}

export function getShiftLabel(now = new Date()) {
  const hour = now.getHours();
  if (hour < 8) return '🌙 Late Night Shift';
  if (hour < 16) return '☀️ Day Shift';
  return '🌆 Evening Shift';
}

// Greeting lines per archetype
export const ARCHETYPE_GREETINGS = {
  Guide:     ["Welcome in. Take your time browsing.", "Good to see you. Ask us anything.", "We're here if you need us."],
  Oracle:    ["The numbers don't lie. Neither do the prices.", "Statistically, you came at the right time.", "All data. No fluff."],
  Creator:   ["Made this place with my bare hands. What can I get you?", "We got fresh stock today.", "Crafted just for you."],
  Challenger:["You gonna browse or buy?", "Don't overthink it. Just pick one.", "I've seen better decision-makers. You'll be fine."],
  Guardian:  ["You're safe here. Shop at your own pace.", "I'll keep an eye on things. You focus on the menu.", "No pressure. We close when we close."],
  Catalyst:  ["The universe brought you here for a reason.", "Energy is high today. Pick something bold.", "Transformation starts with one small purchase."],
};

export function getGreeting(archetype) {
  const lines = ARCHETYPE_GREETINGS[archetype] || ["Hey. What'll it be?"];
  const idx = Math.floor(Math.random() * lines.length);
  return lines[idx];
}

// Dialogue responses when a question is asked
export function getQuestionResponse(staffMember, question) {
  const q = question.toLowerCase();
  if (q.includes('membership') || q.includes('subscription')) {
    return `${staffMember.name}: "Oh, the memberships are solid. Pro's $29/month — bots, signals, full Academy. Lifetime is $399 — one and done forever. I'd go Lifetime if you're serious about this."`;
  }
  if (q.includes('bot') || q.includes('rental') || q.includes('mentor')) {
    return `${staffMember.name}: "Bot rentals? Single mentor is $19/month — one character guiding you through everything. The Trio is $49 for 90 days, three different perspectives. It's worth it."`;
  }
  if (q.includes('course') || q.includes('lesson') || q.includes('learn')) {
    return `${staffMember.name}: "The Foundation course is where everyone starts. $49 gets you from Kindergarten to Grade School level. Advanced Strategies is the real game though — $99, but you'll come out a different trader."`;
  }
  if (q.includes('companion') || q.includes('save') || q.includes('slot')) {
    return `${staffMember.name}: "Custom companions unlock after University graduation. Save packs start at $4.99. Think of it like buying a locker for your creation."`;
  }
  if (q.includes('tip') || q.includes('donate') || q.includes('contribute')) {
    return `${staffMember.name}: "Ha — you want to tip? That tip jar on the counter goes straight to making this place better. Every little bit counts. Seriously."`;
  }
  if (q.includes('special') || q.includes('deal') || q.includes('promo') || q.includes('discount')) {
    return `${staffMember.name}: "Check the 'Today's Specials' sign on the counter. We rotate deals — limited time stuff. Keep your eyes on it."`;
  }
  return `${staffMember.name}: "Hmm. That's a good question. I'd say — come back to that after you've browsed the menu up there. Everything you need is on the board."`;
}