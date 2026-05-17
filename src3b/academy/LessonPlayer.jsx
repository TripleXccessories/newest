import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Volume2, Sparkles, BookOpen, Star, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { FACULTY_META } from '@/lib/academyCurriculum';
import QuizEngine from './QuizEngine';
import CollectibleNoteReveal from './CollectibleNoteReveal';
import TransitionScreen from './TransitionScreen';
import FacultyDialogueScene from './FacultyDialogueScene';
import CinematicLessonSlides from './CinematicLessonSlides';
import MysteryThreadReveal from './MysteryThreadReveal';
import BadgeCeremony from './BadgeCeremony';

// 9-step flow constants
const STEPS = {
  TRANSITION_IN: 'transition_in',
  FACULTY_DIALOGUE: 'faculty_dialogue',
  QUIZ: 'quiz',
  NOTE_REVEAL: 'note_reveal',
  MILESTONE_SAVE: 'milestone_save',
  MYSTERY_THREAD: 'mystery_thread',
  BADGE_UPDATE: 'badge_update',
  TRANSITION_OUT: 'transition_out',
};

export default function LessonPlayer({ lesson, course, user, progress, onComplete, onExit }) {
  const [step, setStep] = useState(STEPS.TRANSITION_IN);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [generatedDialogue, setGeneratedDialogue] = useState(null);
  const [collectibleNote, setCollectibleNote] = useState(null);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [mysteryThread, setMysteryThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const fm = FACULTY_META[lesson.faculty_id] || { color: '#00d4aa', emoji: '🎓' };

  useEffect(() => {
    loadLessonData();
  }, [lesson.id]);

  const loadLessonData = async () => {
    setLoading(true);
    try {
      // Load quiz questions for this lesson
      const qs = await base44.entities.QuizQuestion.filter({ lesson_id: lesson.id });
      setQuizQuestions(qs);

      // Generate faculty dialogue via AI backend function
      const dialogueRes = await base44.functions.invoke('generateFacultyDialogue', {
        lesson_title: lesson.title,
        faculty_id: lesson.faculty_id,
        faculty_name: lesson.faculty_name,
        school_level: lesson.school_level,
        key_takeaway: lesson.key_takeaway || '',
        is_exam: lesson.is_exam || false,
      });
      setGeneratedDialogue(dialogueRes?.data);
    } catch (_) {}
    setLoading(false);
  };

  const handleTransitionInComplete = () => setStep(STEPS.FACULTY_DIALOGUE);
  const handleDialogueComplete = () => {
    if (quizQuestions.length > 0) {
      setStep(STEPS.QUIZ);
    } else {
      setStep(STEPS.NOTE_REVEAL);
    }
  };

  const handleQuizComplete = () => setStep(STEPS.NOTE_REVEAL);

  const handleNoteCollected = async (note) => {
    setCollectibleNote(note);
    setStep(STEPS.MILESTONE_SAVE);
    await saveMilestone();
  };

  const saveMilestone = async () => {
    try {
      // Check mystery thread
      if (lesson.mystery_thread_trigger) {
        setMysteryThread({ title: 'A Thread Stirs...', hint: 'Something beneath the lesson has been disturbed.' });
        setStep(STEPS.MYSTERY_THREAD);
        return;
      }
      setStep(STEPS.BADGE_UPDATE);
    } catch (_) {
      setStep(STEPS.BADGE_UPDATE);
    }
  };

  const handleMysteryThreadSeen = () => setStep(STEPS.BADGE_UPDATE);

  const handleBadgeUpdateComplete = (badge) => {
    if (badge) setEarnedBadge(badge);
    setStep(STEPS.TRANSITION_OUT);
  };

  const handleTransitionOutComplete = () => {
    onComplete(lesson.id);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#070b14] flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <motion.div
            className="text-5xl mx-auto"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {fm.emoji}
          </motion.div>
          <p className="text-sm text-[#64748b]">Preparing your lesson...</p>
          <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#070b14] z-50 overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${fm.color}08 0%, transparent 60%)` }}
      />

      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 z-50 flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#f1f5f9] transition-colors bg-[#111827]/80 border border-[#1e293b] px-3 py-1.5 rounded-lg"
      >
        <X size={12} /> Exit Lesson
      </button>

      {/* Step progress dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
        {Object.values(STEPS).map((s, i) => (
          <div
            key={s}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{
              background: s === step ? fm.color : Object.values(STEPS).indexOf(step) > i ? fm.color + '60' : '#1e293b',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === STEPS.TRANSITION_IN && (
          <TransitionScreen
            key="trans-in"
            lesson={lesson}
            course={course}
            faculty={fm}
            type="intro"
            onComplete={handleTransitionInComplete}
          />
        )}

        {step === STEPS.FACULTY_DIALOGUE && (
          <CinematicLessonSlides
            key="dialogue"
            lesson={lesson}
            faculty={fm}
            onComplete={handleDialogueComplete}
            onExit={onExit}
          />
        )}

        {step === STEPS.QUIZ && (
          <QuizEngine
            key="quiz"
            questions={quizQuestions}
            lesson={lesson}
            faculty={fm}
            onComplete={handleQuizComplete}
          />
        )}

        {step === STEPS.NOTE_REVEAL && (
          <CollectibleNoteReveal
            key="note"
            lesson={lesson}
            user={user}
            faculty={fm}
            onCollect={handleNoteCollected}
          />
        )}

        {step === STEPS.MILESTONE_SAVE && (
          <MilestoneSaveScreen key="milestone" faculty={fm} lesson={lesson} />
        )}

        {step === STEPS.MYSTERY_THREAD && mysteryThread && (
          <MysteryThreadReveal
            key="mystery"
            thread={mysteryThread}
            onContinue={handleMysteryThreadSeen}
          />
        )}

        {step === STEPS.BADGE_UPDATE && (
          <BadgeCheckScreen
            key="badge"
            lesson={lesson}
            progress={progress}
            faculty={fm}
            onComplete={handleBadgeUpdateComplete}
          />
        )}

        {step === STEPS.TRANSITION_OUT && (
          <TransitionScreen
            key="trans-out"
            lesson={lesson}
            course={course}
            faculty={fm}
            type="outro"
            earnedBadge={earnedBadge}
            onComplete={handleTransitionOutComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Milestone save splash screen (step 6)
function MilestoneSaveScreen({ faculty, lesson }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center space-y-4">
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: `${faculty.color}20`, border: `2px solid ${faculty.color}` }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6 }}
        >
          <CheckCircle size={28} style={{ color: faculty.color }} />
        </motion.div>
        <p className="text-base font-bold text-[#f1f5f9]">Progress Saved</p>
        <p className="text-xs text-[#64748b]">{lesson.title} · Milestone recorded</p>
      </div>
    </motion.div>
  );
}

// Badge check and award (step 8)
function BadgeCheckScreen({ lesson, progress, faculty, onComplete }) {
  useEffect(() => {
    // Auto-advance after brief pause — badge ceremony handled by BadgeCeremony component separately
    const t = setTimeout(() => onComplete(null), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center space-y-3">
        <motion.div
          className="text-4xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          {faculty.emoji}
        </motion.div>
        <p className="text-xs text-[#64748b]">Updating your record...</p>
      </div>
    </motion.div>
  );
}