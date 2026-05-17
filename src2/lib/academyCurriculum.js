// IINT Academy Curriculum Data
// 18 Faculty members across 6 school levels
// This is the static curriculum definition — lessons reference BotPersona entries

export const SCHOOL_LEVELS = [
  { id: 'kindergarten', label: 'Kindergarten', emoji: '🌱', color: '#00d4aa', description: 'First steps into the market world', order: 0 },
  { id: 'grade_school', label: 'Grade School', emoji: '📚', color: '#60a5fa', description: 'Core trading vocabulary and foundations', order: 1 },
  { id: 'mid_grade', label: 'Mid Grade', emoji: '🔭', color: '#a78bfa', description: 'Technical patterns and market mechanics', order: 2 },
  { id: 'junior_high', label: 'Junior High', emoji: '⚔️', color: '#f59e0b', description: 'Strategy, debate, and fundamental analysis', order: 3 },
  { id: 'high_school', label: 'High School', emoji: '🏆', color: '#f97316', description: 'Advanced systems, psychology, and risk mastery', order: 4 },
  { id: 'university', label: 'University', emoji: '🎓', color: '#c084fc', description: 'Masters-level: AI, institutional, disruption', order: 5 },
];

export const COURSES = [
  // KINDERGARTEN
  { id: 'kinder-market-basics', school_level: 'kindergarten', title: 'What is a Market?', faculty_id: 'pathfinder', faculty_name: 'Da Mosaic Pathfinder', color: '#00d4aa', order: 0, total_lessons: 3 },
  { id: 'kinder-money-moves', school_level: 'kindergarten', title: 'Money Moves', faculty_id: 'sage', faculty_name: 'Da Feathered Sage', color: '#f59e0b', order: 1, total_lessons: 3 },

  // GRADE SCHOOL
  { id: 'gs-order-types', school_level: 'grade_school', title: 'Order Types & Trade Mechanics', faculty_id: 'architect', faculty_name: 'Da Gentle Architect', color: '#60a5fa', order: 0, total_lessons: 4 },
  { id: 'gs-reading-charts', school_level: 'grade_school', title: 'Reading Your First Chart', faculty_id: 'analyst', faculty_name: 'Da Crystal Analyst', color: '#c084fc', order: 1, total_lessons: 4 },
  { id: 'gs-exam', school_level: 'grade_school', title: 'Grade School Final Exam', faculty_id: 'pathfinder', faculty_name: 'Da Mosaic Pathfinder', color: '#60a5fa', order: 2, total_lessons: 1, is_exam: true },

  // MID GRADE
  { id: 'mg-candlesticks', school_level: 'mid_grade', title: 'Candlestick Patterns', faculty_id: 'analyst', faculty_name: 'Da Crystal Analyst', color: '#c084fc', order: 0, total_lessons: 4 },
  { id: 'mg-support-resistance', school_level: 'mid_grade', title: 'Support & Resistance', faculty_id: 'seer', faculty_name: 'Da Prismatic Seer', color: '#818cf8', order: 1, total_lessons: 4 },
  { id: 'mg-indicators', school_level: 'mid_grade', title: 'RSI, MACD & Bollinger Bands', faculty_id: 'forge', faculty_name: 'Da Forge Engine', color: '#f97316', order: 2, total_lessons: 4 },
  { id: 'mg-exam', school_level: 'mid_grade', title: 'Mid Grade Final Exam', faculty_id: 'dialectic', faculty_name: 'Da Iron Dialectic', color: '#ef4444', order: 3, total_lessons: 1, is_exam: true },

  // JUNIOR HIGH
  { id: 'jh-risk-management', school_level: 'junior_high', title: 'Risk Management & Position Sizing', faculty_id: 'warden', faculty_name: 'Da Bastion Warden', color: '#22c55e', order: 0, total_lessons: 5 },
  { id: 'jh-fundamental', school_level: 'junior_high', title: 'Fundamental Analysis', faculty_id: 'raven', faculty_name: 'Da Iron Raven', color: '#475569', order: 1, total_lessons: 4 },
  { id: 'jh-psychology', school_level: 'junior_high', title: 'Trader Psychology', faculty_id: 'sage', faculty_name: 'Da Feathered Sage', color: '#f59e0b', order: 2, total_lessons: 4 },
  { id: 'jh-exam', school_level: 'junior_high', title: 'Junior High Final Exam', faculty_id: 'dialectic', faculty_name: 'Da Iron Dialectic', color: '#ef4444', order: 3, total_lessons: 1, is_exam: true },

  // HIGH SCHOOL
  { id: 'hs-advanced-strategies', school_level: 'high_school', title: 'Advanced Trading Strategies', faculty_id: 'weaver', faculty_name: 'Da Iridescent Weaver', color: '#fb7185', order: 0, total_lessons: 5 },
  { id: 'hs-options', school_level: 'high_school', title: 'Options & Derivatives', faculty_id: 'canvas', faculty_name: 'Da Shifting Canvas', color: '#06b6d4', order: 1, total_lessons: 5 },
  { id: 'hs-crypto-forex', school_level: 'high_school', title: 'Crypto & Forex Markets', faculty_id: 'storm', faculty_name: 'Da Storm Circuit', color: '#7c3aed', order: 2, total_lessons: 4 },
  { id: 'hs-systems', school_level: 'high_school', title: 'Building Your Trading System', faculty_id: 'architect', faculty_name: 'Da Gentle Architect', color: '#60a5fa', order: 3, total_lessons: 4 },
  { id: 'hs-finals', school_level: 'high_school', title: 'High School Final Exam', faculty_id: 'provocateur', faculty_name: 'Da Maned Provocateur', color: '#dc2626', order: 4, total_lessons: 1, is_exam: true },

  // UNIVERSITY (Masters-level — paywalled)
  { id: 'uni-ai-trading', school_level: 'university', title: 'AI-Powered Trading Systems', faculty_id: 'ember', faculty_name: 'Da Phoenix Ember', color: '#f59e0b', order: 0, total_lessons: 6, paywall: true },
  { id: 'uni-institutional', school_level: 'university', title: 'Institutional Trading Mechanics', faculty_id: 'bear', faculty_name: 'Da Stone Bear', color: '#a16207', order: 1, total_lessons: 6, paywall: true },
  { id: 'uni-wealth-philosophy', school_level: 'university', title: 'Ancient Wealth Philosophy', faculty_id: 'serpent', faculty_name: 'Da Serpent Current', color: '#166534', order: 2, total_lessons: 5, paywall: true },
  { id: 'uni-portfolio', school_level: 'university', title: 'Portfolio Sustainability & Legacy', faculty_id: 'bulwark', faculty_name: 'Da Living Bulwark', color: '#10b981', order: 3, total_lessons: 5, paywall: true },
  { id: 'uni-conductor', school_level: 'university', title: 'Momentum Mastery & Timing', faculty_id: 'conductor', faculty_name: 'Da Arc Conductor', color: '#0ea5e9', order: 4, total_lessons: 5, paywall: true },
  { id: 'uni-final', school_level: 'university', title: 'University Final — Grand Thesis', faculty_id: 'serpent', faculty_name: 'Da Serpent Current', color: '#c084fc', order: 5, total_lessons: 1, paywall: true, is_exam: true },
];

export const FACULTY_META = {
  pathfinder: { color: '#00d4aa', emoji: '🧭', archetype: 'Guide', school: 'Foundations' },
  sage:        { color: '#f59e0b', emoji: '🦉', archetype: 'Guide', school: 'Foundations' },
  architect:   { color: '#60a5fa', emoji: '📐', archetype: 'Guide', school: 'Making' },
  warden:      { color: '#22c55e', emoji: '🛡️', archetype: 'Guardian', school: 'Stewardship' },
  bear:        { color: '#a16207', emoji: '🐻', archetype: 'Guardian', school: 'Stewardship' },
  bulwark:     { color: '#10b981', emoji: '🪨', archetype: 'Guardian', school: 'Stewardship' },
  analyst:     { color: '#c084fc', emoji: '🔮', archetype: 'Oracle', school: 'Analysis' },
  raven:       { color: '#475569', emoji: '🐦‍⬛', archetype: 'Oracle', school: 'Analysis' },
  seer:        { color: '#818cf8', emoji: '🌈', archetype: 'Oracle', school: 'Analysis' },
  weaver:      { color: '#fb7185', emoji: '🕸️', archetype: 'Creator', school: 'Making' },
  forge:       { color: '#f97316', emoji: '⚒️', archetype: 'Creator', school: 'Making' },
  canvas:      { color: '#06b6d4', emoji: '🎨', archetype: 'Creator', school: 'Making' },
  dialectic:   { color: '#ef4444', emoji: '⚔️', archetype: 'Challenger', school: 'Critical Inquiry' },
  provocateur: { color: '#dc2626', emoji: '🦁', archetype: 'Challenger', school: 'Critical Inquiry' },
  storm:       { color: '#7c3aed', emoji: '⚡', archetype: 'Challenger', school: 'Critical Inquiry' },
  ember:       { color: '#f59e0b', emoji: '🔥', archetype: 'Catalyst', school: 'Transformation' },
  conductor:   { color: '#0ea5e9', emoji: '🎼', archetype: 'Catalyst', school: 'Transformation' },
  serpent:     { color: '#166534', emoji: '🐍', archetype: 'Catalyst', school: 'Transformation' },
};

export const MYSTERY_THREADS = [
  { id: 'mt-1', trigger_course: 'gs-reading-charts', title: 'The First Whisper', hint: 'Markets move in patterns older than memory...' },
  { id: 'mt-2', trigger_course: 'mg-support-resistance', title: 'The Hidden Hand', hint: 'Who sets the levels that everyone watches?' },
  { id: 'mt-3', trigger_course: 'jh-fundamental', title: 'The Signal Behind the Signal', hint: 'There is data beneath the data...' },
  { id: 'mt-4', trigger_course: 'hs-systems', title: 'The Architecture of Wealth', hint: 'Systems within systems. Fractals of control.' },
  { id: 'mt-5', trigger_course: 'uni-wealth-philosophy', title: 'The Ancient Code', hint: 'The serpent saw this before markets existed.' },
];

export const BADGES = [
  { id: 'badge-first-step', name: 'First Step', emoji: '🌱', trigger: 'complete_kindergarten', color: '#00d4aa', rarity: 'Bronze', ceremony_line: 'Every journey begins with one step. You have taken yours.' },
  { id: 'badge-bookworm', name: 'Bookworm', emoji: '📚', trigger: 'complete_grade_school', color: '#60a5fa', rarity: 'Bronze', ceremony_line: 'The fundamentals are yours. The market vocabulary is now your language.' },
  { id: 'badge-pattern-seeker', name: 'Pattern Seeker', emoji: '🔭', trigger: 'complete_mid_grade', color: '#a78bfa', rarity: 'Silver', ceremony_line: 'You see what others miss. Patterns in the chaos. This is the gift.' },
  { id: 'badge-strategist', name: 'The Strategist', emoji: '⚔️', trigger: 'complete_junior_high', color: '#f59e0b', rarity: 'Silver', ceremony_line: 'Risk is not the enemy. Ignorance of risk is. You now know the difference.' },
  { id: 'badge-graduate', name: 'IINT Graduate', emoji: '🏆', trigger: 'complete_high_school', color: '#f97316', rarity: 'Gold', ceremony_line: 'You have earned this. Not because it was given — because it was forged.' },
  { id: 'badge-thread-finder', name: 'Thread Finder', emoji: '🧵', trigger: 'mystery_thread_found', color: '#c084fc', rarity: 'Epic', ceremony_line: 'You sensed the current beneath the surface. Most never do.' },
  { id: 'badge-master', name: 'IINT Master', emoji: '🎓', trigger: 'complete_university', color: '#c084fc', rarity: 'Mythic', ceremony_line: 'The academy bows to you. Go build empires.' },
];