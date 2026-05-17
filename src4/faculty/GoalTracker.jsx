import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, Clock, Zap, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { FACULTY_LIST } from '@/pages/FacultySitIn';

function getDaysLeft(targetDate) {
  if (!targetDate) return null;
  const diff = new Date(targetDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function GoalTracker({ user, goals, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [completing, setCompleting] = useState(null);

  const activeGoals = goals.filter(g => g.status === 'active');
  const allGoals = goals;

  const handleComplete = async (goal, early = false) => {
    setCompleting(goal.id);
    await base44.entities.FacultyGoal.update(goal.id, {
      status: 'completed',
      completed_early: early,
      completed_at: new Date().toISOString(),
    });
    await onRefresh();
    setCompleting(null);
  };

  const handleAbandon = async (goal) => {
    await base44.entities.FacultyGoal.update(goal.id, { status: 'abandoned' });
    await onRefresh();
  };

  if (allGoals.length === 0) {
    return (
      <div className="text-center py-14 space-y-3">
        <Target size={36} className="mx-auto text-[#1e293b]" />
        <p className="text-sm text-[#475569]">No goals yet.</p>
        <p className="text-xs text-[#334155]">Select a faculty member and set your first challenge.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeGoals.length > 0 && (
        <p className="text-xs text-[#475569]">
          {activeGoals.length} active challenge{activeGoals.length > 1 ? 's' : ''} in progress.
        </p>
      )}

      {allGoals.map((goal) => {
        const faculty = FACULTY_LIST.find(f => f.id === goal.faculty_id);
        const color = faculty?.color || '#a78bfa';
        const emoji = faculty?.emoji || '🎓';
        const daysLeft = getDaysLeft(goal.target_date);
        const isExpanded = expandedId === goal.id;
        const isCompleted = goal.status === 'completed';
        const isAbandoned = goal.status === 'abandoned';

        return (
          <motion.div
            key={goal.id}
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: isCompleted ? '#00d4aa40' : isAbandoned ? '#47556920' : `${color}30`,
              background: '#111827'
            }}
          >
            <button
              className="w-full p-4 flex items-center gap-3 text-left"
              onClick={() => setExpandedId(isExpanded ? null : goal.id)}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}
              >
                {isCompleted ? '✅' : isAbandoned ? '💀' : emoji}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isAbandoned ? 'text-[#475569] line-through' : 'text-[#f1f5f9]'} truncate`}>
                  {goal.goal_text}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-[#64748b]">{goal.faculty_name}</span>
                  {isCompleted && (
                    <span className="text-xs font-semibold text-[#00d4aa]">
                      {goal.completed_early ? '⚡ Early Win!' : '✓ Complete'}
                    </span>
                  )}
                  {!isCompleted && !isAbandoned && daysLeft !== null && (
                    <span className={`text-xs font-semibold ${daysLeft < 3 ? 'text-[#ef4444]' : daysLeft < 7 ? 'text-[#f59e0b]' : 'text-[#64748b]'}`}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                    </span>
                  )}
                </div>
              </div>

              {isExpanded ? <ChevronUp size={14} className="text-[#475569]" /> : <ChevronDown size={14} className="text-[#475569]" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-[#1e293b]">
                    {goal.sarcastic_response && (
                      <div className="mt-3 p-3 rounded-xl text-xs text-[#94a3b8] italic" style={{ background: `${color}08` }}>
                        <span style={{ color }} className="not-italic font-semibold">{faculty?.name}: </span>
                        "{goal.sarcastic_response}"
                      </div>
                    )}

                    {goal.challenge_statement && (
                      <div className="p-3 rounded-xl text-xs text-[#64748b] border border-[#1e293b]">
                        {goal.challenge_statement}
                      </div>
                    )}

                    {!isCompleted && !isAbandoned && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleComplete(goal, false)}
                          disabled={!!completing}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          style={{ background: '#00d4aa20', color: '#00d4aa', border: '1px solid #00d4aa40' }}
                        >
                          <CheckCircle size={12} /> Mark Complete
                        </button>
                        {daysLeft !== null && daysLeft > 5 && (
                          <button
                            onClick={() => handleComplete(goal, true)}
                            disabled={!!completing}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                            style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40' }}
                          >
                            <Zap size={12} /> Finished Early!
                          </button>
                        )}
                        <button
                          onClick={() => handleAbandon(goal)}
                          className="px-3 py-2 rounded-lg text-xs text-[#475569] border border-[#1e293b] hover:border-[#ef4444]/30 hover:text-[#ef4444] transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
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