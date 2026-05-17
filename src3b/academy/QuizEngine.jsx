import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, RotateCcw, ChevronRight, MousePointer } from 'lucide-react';

export default function QuizEngine({ questions, lesson, faculty, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showEcho, setShowEcho] = useState(false);
  const [showCorrectHint, setShowCorrectHint] = useState(false);
  const [allCorrect, setAllCorrect] = useState([]);
  const [shakeWrong, setShakeWrong] = useState(false);
  const buzzerRef = useRef(null);

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  // Generate buzzer sound via AudioContext
  const playBuzzer = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  };

  const handleSelect = (idx) => {
    if (selected !== null) return; // Already answered correctly
    setSelected(idx);

    if (idx === currentQ.correct_answer_index) {
      // Correct!
      setAllCorrect(p => [...p, currentIdx]);
      setShowEcho(false);
      setShowCorrectHint(false);
      setAttempts(0);
    } else {
      // Wrong
      playBuzzer();
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setShowEcho(true);
      if (newAttempts >= 1) {
        setShowCorrectHint(true);
      }
      setTimeout(() => setSelected(null), 800);
    }
  };

  const handleNext = () => {
    if (!allCorrect.includes(currentIdx)) return; // Must answer correctly first
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setAttempts(0);
      setShowEcho(false);
      setShowCorrectHint(false);
    }
  };

  if (!currentQ) {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center space-y-4">
          <CheckCircle size={48} className="mx-auto text-[#00d4aa]" />
          <p className="text-base font-bold text-[#f1f5f9]">All questions complete!</p>
          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: faculty.color, color: '#070b14' }}
          >
            Continue
          </button>
        </div>
      </motion.div>
    );
  }

  const answered = allCorrect.includes(currentIdx);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-lg space-y-5">
        {/* Quiz header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: `${faculty.color}15` }}
            >
              {faculty.emoji}
            </div>
            <div>
              <p className="text-xs font-bold text-[#f1f5f9]">Quiz</p>
              <p className="text-[10px] text-[#475569]">{lesson.faculty_name}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: allCorrect.includes(i) ? faculty.color : i === currentIdx ? faculty.color + '60' : '#1e293b',
                }}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border"
          style={{ borderColor: `${faculty.color}30`, background: `${faculty.color}06` }}
        >
          <p className="text-xs text-[#64748b] mb-2">Question {currentIdx + 1} of {questions.length}</p>
          <p className="text-sm font-semibold text-[#f1f5f9] leading-relaxed">{currentQ.question_text}</p>
        </motion.div>

        {/* Options */}
        <div className="space-y-2">
          {currentQ.options.map((opt, idx) => {
            const isCorrect = idx === currentQ.correct_answer_index;
            const isAnsweredCorrectly = answered;
            const isHinted = showCorrectHint && isCorrect;

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden"
                style={{
                  borderColor: isAnsweredCorrectly && isCorrect
                    ? '#00d4aa'
                    : isHinted
                    ? '#ef4444'
                    : `${faculty.color}20`,
                  background: isAnsweredCorrectly && isCorrect
                    ? '#00d4aa10'
                    : isHinted
                    ? '#ef444410'
                    : '#0f172a',
                }}
                animate={shakeWrong && selected === idx ? { x: [-8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                disabled={isAnsweredCorrectly}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: isAnsweredCorrectly && isCorrect ? '#00d4aa20' : isHinted ? '#ef444420' : `${faculty.color}15`,
                      color: isAnsweredCorrectly && isCorrect ? '#00d4aa' : isHinted ? '#ef4444' : faculty.color,
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm text-[#e2e8f0]">{opt}</span>
                  {isAnsweredCorrectly && isCorrect && <CheckCircle size={14} className="ml-auto text-[#00d4aa]" />}
                  {isHinted && !isAnsweredCorrectly && (
                    <div className="ml-auto flex items-center gap-1 text-[#ef4444]">
                      <MousePointer size={13} className="animate-bounce" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showEcho && !answered && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl border flex items-start gap-2"
              style={{
                borderColor: showCorrectHint ? '#ef444430' : `${faculty.color}30`,
                background: showCorrectHint ? '#ef444408' : `${faculty.color}06`,
              }}
            >
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: showCorrectHint ? '#ef4444' : faculty.color }} />
              <div>
                {showCorrectHint ? (
                  <>
                    <p className="text-xs font-bold text-[#ef4444]">Psst... try this one 👆</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5 italic">"{currentQ.faculty_echo_correction}"</p>
                  </>
                ) : (
                  <p className="text-xs font-bold" style={{ color: faculty.color }}>Try again.</p>
                )}
              </div>
            </motion.div>
          )}

          {answered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl border border-[#00d4aa]/30 bg-[#00d4aa]/06 flex items-center gap-2"
            >
              <CheckCircle size={14} className="text-[#00d4aa]" />
              <p className="text-xs font-bold text-[#00d4aa]">Correct! Well done.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button */}
        {answered && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{ background: faculty.color, color: '#070b14' }}
          >
            {isLastQuestion ? 'Complete Quiz' : 'Next Question'} <ChevronRight size={16} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}