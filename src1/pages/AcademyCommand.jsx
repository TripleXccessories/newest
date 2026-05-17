import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Scroll, RefreshCw, BookOpen, Zap, Lock, Mic, BarChart2, BookMarked } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import NotebookDrawer from '@/components/notebook/NotebookDrawer';
import FacultyStatusCard from '@/components/academy/command/FacultyStatusCard';
import SchoolProgressBar from '@/components/academy/command/SchoolProgressBar';
import QuestTracker from '@/components/academy/command/QuestTracker';
import ArchetypeDonut from '@/components/academy/command/ArchetypeDonut';
import SchoolDistributionBar from '@/components/academy/command/SchoolDistributionBar';
import LectureTopicsFeed from '@/components/academy/command/LectureTopicsFeed';

export default function AcademyCommand() {
  const [personas, setPersonas] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quests, setQuests] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showNotebook, setShowNotebook] = useState(false); // all | active | draft | retired

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [p, l, q, user] = await Promise.all([
      base44.entities.BotPersona.list('name', 50),
      base44.entities.Lesson.list('-created_date', 50),
      base44.entities.NarratedMessage.filter({ flagged_for_deletion: false }, '-created_date', 20),
      base44.auth.me().catch(() => null),
    ]);
    let prog = null;
    if (user) {
      const [pr] = await base44.entities.UserProgress.filter({ user_id: user.id }).catch(() => []);
      prog = pr || null;
    }
    setPersonas(p);
    setLessons(l);
    setQuests(q);
    setUserProgress(prog);
    setLoading(false);
  };

  // Derived stats
  const activeCount = personas.filter(p => p.status === 'active').length;
  const draftCount = personas.filter(p => p.status === 'draft').length;
  const lockedCount = personas.filter(p => p.personality_locked || p.voice_locked).length;
  const voiceLockedCount = personas.filter(p => p.voice_locked).length;

  // Lessons per level
  const totalByLevel = {};
  lessons.forEach(l => { totalByLevel[l.school_level] = (totalByLevel[l.school_level] || 0) + 1; });

  // Lessons per persona
  const lessonsByPersona = {};
  lessons.forEach(l => { lessonsByPersona[l.faculty_id] = (lessonsByPersona[l.faculty_id] || 0) + 1; });

  const filteredPersonas = personas.filter(p => filter === 'all' ? true : p.status === filter);

  const STAT_CARDS = [
    { label: 'Total Faculty',    value: personas.length,   color: '#00d4aa', icon: Users },
    { label: 'Active',           value: activeCount,        color: '#00d4aa', icon: Zap },
    { label: 'In Draft',         value: draftCount,         color: '#f59e0b', icon: BookOpen },
    { label: 'Voices Locked',    value: voiceLockedCount,   color: '#a78bfa', icon: Mic },
    { label: 'Personalities Locked', value: lockedCount,   color: '#fb7185', icon: Lock },
    { label: 'Total Lessons',    value: lessons.length,     color: '#60a5fa', icon: BookOpen },
    { label: 'Active Quests',    value: quests.filter(q => !q.is_completed).length, color: '#f97316', icon: Scroll },
    { label: 'Courses Covered',  value: [...new Set(lessons.map(l => l.course_id))].length, color: '#34d399', icon: BarChart2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center">
            <GraduationCap size={22} className="text-[#00d4aa]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#f1f5f9]">Academy Command</h1>
            <p className="text-xs text-[#475569]">Central operations — faculty, quests, lectures & academy health</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNotebook(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-colors">
            <BookMarked size={13} /> Notebook
          </button>
          <Link to="/academy-hub"
            className="text-xs px-3 py-2 rounded-xl border border-[#1e293b] text-[#475569] hover:text-[#f1f5f9] hover:border-[#334155] transition-colors">
            Go to Academy Hub →
          </Link>
          <button onClick={loadAll}
            className="text-xs px-3 py-2 rounded-xl border border-[#1e293b] text-[#475569] hover:text-[#f1f5f9] transition-colors flex items-center gap-1.5">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {STAT_CARDS.map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-3 text-center">
            <Icon size={14} className="mx-auto mb-1" style={{ color }} />
            <p className="text-lg font-black" style={{ color }}>{value}</p>
            <p className="text-[9px] text-[#475569] leading-tight">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* School level progress */}
      <SchoolProgressBar
        currentLevel={userProgress?.current_school_level || 'Kindergarten'}
        totalByLevel={totalByLevel}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ArchetypeDonut personas={personas} />
        <SchoolDistributionBar personas={personas} />
      </div>

      {/* Middle row: Quest tracker + Lecture feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuestTracker messages={quests} />
        <LectureTopicsFeed lessons={lessons} />
      </div>

      {/* Faculty grid */}
      <div>
        {/* Filter tabs */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest flex items-center gap-1.5">
            <Users size={10} /> Faculty Roster ({filteredPersonas.length})
          </p>
          <div className="flex gap-1.5">
            {['all', 'active', 'draft', 'retired'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-[9px] px-2.5 py-1 rounded-lg border capitalize font-bold transition-all"
                style={{
                  borderColor: filter === f ? '#00d4aa' : '#1e293b',
                  color: filter === f ? '#00d4aa' : '#475569',
                  background: filter === f ? '#00d4aa10' : 'transparent',
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredPersonas.map((persona, i) => (
            <FacultyStatusCard
              key={persona.id}
              persona={persona}
              lessonCount={lessonsByPersona[persona.id] || 0}
              index={i}
            />
          ))}
        </div>

        {filteredPersonas.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#1e293b] p-12 text-center">
            <Users size={28} className="mx-auto mb-2 text-[#334155]" />
            <p className="text-sm text-[#334155]">No faculty in this category</p>
          </div>
        )}
      </div>

      <NotebookDrawer open={showNotebook} onClose={() => setShowNotebook(false)} context="academy" />
    </div>
  );
}