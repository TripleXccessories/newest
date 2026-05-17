import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Trophy, ChevronRight, Star } from 'lucide-react';
// Icon is used via TABS map
import { base44 } from '@/api/base44Client';
import FacultyCard from '@/components/faculty/FacultyCard';
import FacultyDialogue from '@/components/faculty/FacultyDialogue';
import GoalTracker from '@/components/faculty/GoalTracker';

const TABS = [
  { id: 'faculty', label: 'Faculty', icon: Users },
  { id: 'goals', label: 'My Goals', icon: Target },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

export default function FacultySitIn() {
  const [tab, setTab] = useState('faculty');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const u = await base44.auth.me();
      const g = await base44.entities.FacultyGoal.filter({ user_id: u.id, status: 'active' });
      setGoals(g);
    } catch (_) {}
  };

  const activeCount = goals.filter(g => g.status === 'active').length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <Users size={22} className="text-[#a78bfa]" /> Faculty Sit-In
        </h1>
        <p className="text-sm text-[#64748b] mt-1">
          Engage your faculty. Set bold goals. Accept the challenge.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors relative ${
              tab === id ? 'bg-[#a78bfa] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Icon size={13} /> {label}
            {id === 'goals' && activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f59e0b] text-[#070b14] text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'faculty' && (
          <motion.div key="faculty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {selectedFaculty ? (
              <FacultyDialogue
                faculty={selectedFaculty}
                user={user}
                onBack={() => setSelectedFaculty(null)}
                onGoalCreated={() => { loadGoals(); setTab('goals'); }}
              />
            ) : (
              <FacultyRoster onSelect={setSelectedFaculty} goals={goals} />
            )}
          </motion.div>
        )}
        {tab === 'goals' && (
          <motion.div key="goals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GoalTracker user={user} goals={goals} onRefresh={loadGoals} />
          </motion.div>
        )}
        {tab === 'achievements' && (
          <motion.div key="achievements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AchievementsPanel goals={goals} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FacultyRoster({ onSelect, goals }) {
  const activeGoalFacultyIds = goals.filter(g => g.status === 'active').map(g => g.faculty_id);

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#475569]">Select a faculty member to begin a sit-in dialogue or set a trading goal.</p>
      <div className="grid grid-cols-1 gap-3">
        {FACULTY_LIST.map((f) => (
          <FacultyCard
            key={f.id}
            faculty={f}
            hasActiveGoal={activeGoalFacultyIds.includes(f.id)}
            onClick={() => onSelect(f)}
          />
        ))}
      </div>
    </div>
  );
}

function AchievementsPanel({ goals }) {
  const completed = goals.filter(g => g.status === 'completed');
  const early = completed.filter(g => g.completed_early);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Goals Set', value: goals.length, color: '#a78bfa' },
          { label: 'Completed', value: completed.length, color: '#00d4aa' },
          { label: 'Early Wins', value: early.length, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-[#64748b] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {completed.length === 0 ? (
        <div className="text-center py-10 text-[#475569] text-sm">
          <Trophy size={32} className="mx-auto mb-3 opacity-30" />
          Complete your first faculty challenge to earn achievements.
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((g) => (
            <div key={g.id} className="bg-[#111827] border border-[#00d4aa]/30 rounded-xl p-4 flex items-center gap-3">
              <Star size={18} className="text-[#f59e0b]" fill="#f59e0b" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f1f5f9] truncate">{g.goal_text}</p>
                <p className="text-xs text-[#64748b]">{g.faculty_name}{g.completed_early ? ' · ⚡ Finished early' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const FACULTY_LIST = [
  { id: 'pathfinder', name: 'Da Mosaic Pathfinder', archetype: 'Guide', subject: 'Trading Foundations', color: '#00d4aa', emoji: '🧭', tagline: 'I help you find your way through the market maze.' },
  { id: 'sage', name: 'Da Feathered Sage', archetype: 'Guide', subject: 'Psychology & Discipline', color: '#f59e0b', emoji: '🦉', tagline: 'Your mind is the market you must conquer first.' },
  { id: 'architect', name: 'Da Gentle Architect', archetype: 'Guide', subject: 'Systems & Strategy', color: '#60a5fa', emoji: '📐', tagline: 'A trade without a plan is a gamble. Full stop.' },
  { id: 'warden', name: 'Da Bastion Warden', archetype: 'Guardian', subject: 'Risk Management', color: '#22c55e', emoji: '🛡️', tagline: 'Your capital is your root system. Protect it always.' },
  { id: 'bear', name: 'Da Stone Bear', archetype: 'Guardian', subject: 'Wealth & Freedom', color: '#a16207', emoji: '🐻', tagline: 'Patience builds wealth. Greed destroys it.' },
  { id: 'bulwark', name: 'Da Living Bulwark', archetype: 'Guardian', subject: 'Portfolio Sustainability', color: '#10b981', emoji: '🪨', tagline: 'A reef survives because it is diverse.' },
  { id: 'analyst', name: 'Da Crystal Analyst', archetype: 'Oracle', subject: 'Technical Analysis', color: '#c084fc', emoji: '🔮', tagline: 'Data does not lie. Emotions do.' },
  { id: 'raven', name: 'Da Iron Raven', archetype: 'Oracle', subject: 'Fundamental Analysis', color: '#475569', emoji: '🐦‍⬛', tagline: 'I dig for WHY while others obsess over WHAT.' },
  { id: 'seer', name: 'Da Prismatic Seer', archetype: 'Oracle', subject: 'Forecasting & Fibonacci', color: '#818cf8', emoji: '🌈', tagline: 'I speak in probabilities. Never certainties.' },
  { id: 'weaver', name: 'Da Iridescent Weaver', archetype: 'Creator', subject: 'Creative Strategy', color: '#fb7185', emoji: '🕸️', tagline: 'The best systems are both logical AND elegant.' },
  { id: 'forge', name: 'Da Forge Engine', archetype: 'Creator', subject: 'Engineering & Backtesting', color: '#f97316', emoji: '⚒️', tagline: 'Build it. Test it. Break it. Rebuild it better.' },
  { id: 'canvas', name: 'Da Shifting Canvas', archetype: 'Creator', subject: 'Asset Classes', color: '#06b6d4', emoji: '🎨', tagline: 'Every market is a different canvas. I teach all of them.' },
  { id: 'dialectic', name: 'Da Iron Dialectic', archetype: 'Challenger', subject: 'Fundamental Debate', color: '#ef4444', emoji: '⚔️', tagline: 'I will ATTACK your thesis until it is bulletproof.' },
  { id: 'provocateur', name: 'Da Maned Provocateur', archetype: 'Challenger', subject: 'Leadership & Discipline', color: '#dc2626', emoji: '🦁', tagline: "Comfortable? Good. I'm about to make you uncomfortable." },
  { id: 'storm', name: 'Da Storm Circuit', archetype: 'Challenger', subject: 'Disruption & Stress Testing', color: '#7c3aed', emoji: '⚡', tagline: 'I break systems to make them stronger.' },
  { id: 'ember', name: 'Da Phoenix Ember', archetype: 'Catalyst', subject: 'Transformation & Recovery', color: '#f59e0b', emoji: '🔥', tagline: 'Every failure is a phoenix moment. Rise.' },
  { id: 'conductor', name: 'Da Arc Conductor', archetype: 'Catalyst', subject: 'Momentum & Timing', color: '#0ea5e9', emoji: '🎼', tagline: 'Momentum is everything. I teach you to feel the rhythm.' },
  { id: 'serpent', name: 'Da Serpent Current', archetype: 'Catalyst', subject: 'Ancient Wealth Philosophy', color: '#166534', emoji: '🐍', tagline: 'I have watched gold replace barter. Now I watch this.' },
];