import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Lock, Trophy, Sparkles, Star, ChevronRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { SCHOOL_LEVELS, COURSES, BADGES } from '@/lib/academyCurriculum';
import TreeOfLife from '@/components/academy/TreeOfLife';
import TrophyRoom from '@/components/academy/TrophyRoom';
import LessonPlayer from '@/components/academy/LessonPlayer';
import LessonsLearnedGallery from '@/components/academy/LessonsLearnedGallery';
import StreakCounter, { recordStreakActivity } from '@/components/academy/StreakCounter';
import AcademyLeaderboard from '@/components/academy/AcademyLeaderboard';
import FacultyModal from '@/components/academy/FacultyModal';

const ALL_TABS = [
  { id: 'tree', label: 'Tree of Life', icon: Sparkles },
  { id: 'trophy', label: 'Trophy Room', icon: Trophy, requiresGraduation: true },
  { id: 'lessons', label: 'Lessons Learned', icon: BookOpen },
  { id: 'leaderboard', label: 'Leaderboard', icon: Users },
];

export default function AcademyHub() {
  const [tab, setTab] = useState('tree');
  const [showFaculty, setShowFaculty] = useState(false);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const [progs] = await base44.entities.UserProgress.filter({ user_id: u.id });
      if (progs) {
        setProgress(progs);
      } else {
        // Init progress for new user
        const newProg = await base44.entities.UserProgress.create({
          user_id: u.id,
          current_school_level: 'Kindergarten',
          completed_lesson_ids: [],
          completed_course_ids: [],
          earned_badge_ids: [],
          mystery_threads_found: [],
          mystery_thread_progress: 0,
          total_notes_collected: 0,
          graduation_hs_complete: false,
          graduation_uni_complete: false,
        });
        setProgress(newProg);
      }
    } catch (_) {}
    setLoading(false);
  };

  const handleStartLesson = (course, lesson) => {
    setActiveCourse(course);
    setActiveLesson(lesson);
  };

  const handleLessonComplete = async (lessonId) => {
    if (!progress) return;
    recordStreakActivity(); // record streak on lesson completion
    const updated = await base44.entities.UserProgress.update(progress.id, {
      completed_lesson_ids: [...(progress.completed_lesson_ids || []), lessonId],
      last_activity_at: new Date().toISOString(),
    });
    setProgress(updated);
    setActiveLesson(null);
    setActiveCourse(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  // If a lesson is active, render the full-screen lesson player
  if (activeLesson && activeCourse) {
    return (
      <LessonPlayer
        lesson={activeLesson}
        course={activeCourse}
        user={user}
        progress={progress}
        onComplete={handleLessonComplete}
        onExit={() => { setActiveLesson(null); setActiveCourse(null); }}
      />
    );
  }

  const totalCourses = COURSES.filter(c => !c.paywall).length;
  const completedCourses = (progress?.completed_course_ids || []).length;
  const graduationPct = Math.round((completedCourses / totalCourses) * 100);
  const hsGraduated = !!progress?.graduation_hs_complete;
  const TABS = ALL_TABS.filter(t => !t.requiresGraduation || hsGraduated);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <GraduationCap size={22} className="text-[#00d4aa]" /> IINT Academy Hub
          </h1>
          <p className="text-sm text-[#64748b] mt-1">Your journey from Kindergarten to University.</p>
          <div className="flex items-center gap-2 mt-2">
            <Link to="/imaginarium"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', color: '#00d4aa' }}>
              🌌 Enter the Imaginarium
            </Link>
            <button
              onClick={() => setShowFaculty(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', color: '#ffd700' }}>
              <Star size={10} fill="#ffd700" /> Meet the Faculty
            </button>
          </div>
        </div>
        {/* Graduation gauge */}
        <div className="text-right">
          <p className="text-xs text-[#64748b] mb-1">Graduation Readiness</p>
          <div className="w-36 h-2 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00d4aa, #a78bfa)' }}
              initial={{ width: 0 }}
              animate={{ width: `${graduationPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-[#00d4aa] mt-1 font-bold">{graduationPct}%</p>
        </div>
      </div>

      {/* Streak Counter */}
      <StreakCounter userId={user?.id} />

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === id ? 'bg-[#00d4aa] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showFaculty && <FacultyModal onClose={() => setShowFaculty(false)} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {tab === 'tree' && (
          <motion.div key="tree" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TreeOfLife
              progress={progress}
              user={user}
              onStartLesson={handleStartLesson}
            />
          </motion.div>
        )}
        {tab === 'trophy' && (
          <motion.div key="trophy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TrophyRoom progress={progress} user={user} />
          </motion.div>
        )}
        {tab === 'lessons' && (
          <motion.div key="lessons" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <LessonsLearnedGallery user={user} />
          </motion.div>
        )}
        {tab === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AcademyLeaderboard currentUser={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}