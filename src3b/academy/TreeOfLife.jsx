import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, Play, Star, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { SCHOOL_LEVELS, COURSES, FACULTY_META } from '@/lib/academyCurriculum';
import { base44 } from '@/api/base44Client';

function isCourseUnlocked(course, progress) {
  const level = SCHOOL_LEVELS.find(l => l.id === course.school_level);
  if (!level) return false;
  if (level.order === 0) return true; // Kindergarten always unlocked

  // Unlock if all courses in the previous level are complete
  const prevLevel = SCHOOL_LEVELS.find(l => l.order === level.order - 1);
  if (!prevLevel) return true;
  const prevCourses = COURSES.filter(c => c.school_level === prevLevel.id);
  return prevCourses.every(c => (progress?.completed_course_ids || []).includes(c.id));
}

function isCourseComplete(course, progress) {
  return (progress?.completed_course_ids || []).includes(course.id);
}

export default function TreeOfLife({ progress, user, onStartLesson }) {
  const [expandedLevel, setExpandedLevel] = useState('kindergarten');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleEnterCourse = (course) => {
    // Create a synthetic lesson entry point
    const lesson = {
      id: `${course.id}-lesson-1`,
      title: course.title,
      course_id: course.id,
      lesson_number: 1,
      school_level: course.school_level,
      faculty_id: course.faculty_id,
      faculty_name: course.faculty_name,
      dialogue_script: [],
      key_takeaway: '',
      is_exam: course.is_exam || false,
    };
    onStartLesson(course, lesson);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#475569]">Lit courses are completed. Darker ones await your light.</p>

      {SCHOOL_LEVELS.map((level) => {
        const levelCourses = COURSES.filter(c => c.school_level === level.id);
        const completedInLevel = levelCourses.filter(c => isCourseComplete(c, progress)).length;
        const levelComplete = completedInLevel === levelCourses.length;
        const isExpanded = expandedLevel === level.id;
        const firstLocked = !isCourseUnlocked(levelCourses[0], progress);

        return (
          <motion.div
            key={level.id}
            layout
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: levelComplete ? `${level.color}60` : firstLocked ? '#1e293b' : `${level.color}25`,
              background: levelComplete ? `${level.color}08` : '#111827',
            }}
          >
            {/* Level header */}
            <button
              className="w-full flex items-center gap-4 p-4 text-left"
              onClick={() => setExpandedLevel(isExpanded ? null : level.id)}
            >
              {/* Tree node indicator */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: levelComplete ? `${level.color}25` : firstLocked ? '#1e293b' : `${level.color}12`,
                    border: `1px solid ${levelComplete ? level.color : firstLocked ? '#334155' : level.color + '30'}`,
                    filter: firstLocked ? 'saturate(0.2) brightness(0.5)' : 'none',
                  }}
                  animate={levelComplete ? { boxShadow: [`0 0 0px ${level.color}`, `0 0 16px ${level.color}60`, `0 0 0px ${level.color}`] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {level.emoji}
                </motion.div>
                {levelComplete && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00d4aa] flex items-center justify-center">
                    <CheckCircle size={12} className="text-[#070b14]" />
                  </div>
                )}
                {firstLocked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1e293b] flex items-center justify-center">
                    <Lock size={10} className="text-[#475569]" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold" style={{ color: firstLocked ? '#475569' : '#f1f5f9' }}>
                    {level.label}
                  </p>
                  {level.id === 'university' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c084fc]/15 text-[#c084fc] border border-[#c084fc]/30">
                      MASTERS
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#475569] mt-0.5">{level.description}</p>
                {/* Progress bar */}
                <div className="w-full h-1 bg-[#1e293b] rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: firstLocked ? '#334155' : level.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${levelCourses.length ? (completedInLevel / levelCourses.length) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-[#475569] mt-1">{completedInLevel}/{levelCourses.length} courses</p>
              </div>

              {isExpanded ? <ChevronUp size={14} className="text-[#475569]" /> : <ChevronDown size={14} className="text-[#475569]" />}
            </button>

            {/* Course list */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 border-t border-[#1e293b]">
                    {levelCourses.map((course, idx) => {
                      const unlocked = isCourseUnlocked(course, progress);
                      const complete = isCourseComplete(course, progress);
                      const fm = FACULTY_META[course.faculty_id] || {};

                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl border mt-2"
                          style={{
                            borderColor: complete ? `${course.color}40` : unlocked ? `${course.color}20` : '#1e293b',
                            background: complete ? `${course.color}08` : '#0f172a',
                            opacity: unlocked ? 1 : 0.45,
                          }}
                        >
                          {/* Faculty emoji */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                            style={{ background: `${course.color}15`, filter: unlocked ? 'none' : 'saturate(0)' }}
                          >
                            {fm.emoji || '📖'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-[#f1f5f9] truncate">{course.title}</p>
                              {course.is_exam && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ef4444]/15 text-[#ef4444]">EXAM</span>
                              )}
                              {course.paywall && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#c084fc]/15 text-[#c084fc]">PRO</span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#475569]">{course.faculty_name} · {course.total_lessons} lesson{course.total_lessons > 1 ? 's' : ''}</p>
                          </div>

                          {complete ? (
                            <CheckCircle size={16} style={{ color: course.color }} />
                          ) : unlocked ? (
                            <button
                              onClick={() => handleEnterCourse(course)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                              style={{ background: course.color, color: '#070b14' }}
                            >
                              <Play size={10} /> Start
                            </button>
                          ) : (
                            <Lock size={14} className="text-[#334155]" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}