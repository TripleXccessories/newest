import React, { useState } from 'react';
import { BookOpen, HelpCircle, Film, Image, MessageSquare } from 'lucide-react';

const TABS = [
  { id: 'script',   label: 'Dialogue Script', icon: MessageSquare },
  { id: 'quiz',     label: 'Quiz',             icon: HelpCircle },
  { id: 'animated', label: 'Animated Moments', icon: Film },
  { id: 'art',      label: 'Concept Art',      icon: Image },
];

const LINE_TYPE_COLORS = {
  intro:           '#00d4aa',
  dialogue:        '#f1f5f9',
  transition:      '#fbbf24',
  concept_visual:  '#a78bfa',
  echo_correction: '#f87171',
};

export default function GeneratedLessonPreview({ lesson, persona, schoolLevel }) {
  const [activeTab, setActiveTab] = useState('script');
  const [selectedAnswer, setSelectedAnswer] = useState({});

  if (!lesson) return null;

  const personaColor = persona?.primary_color || '#00d4aa';

  return (
    <div className="space-y-4">

      {/* Header card */}
      <div className="p-5 rounded-2xl border"
        style={{ borderColor: `${personaColor}30`, background: `${personaColor}08` }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0"
            style={{ background: `${personaColor}20`, color: personaColor }}>
            {persona?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-[#f1f5f9]">{lesson.title}</h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-black"
                style={{ background: `${personaColor}20`, color: personaColor }}>
                {schoolLevel}
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">{persona?.name} · {persona?.archetype}</p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">{lesson.summary}</p>

        {/* Collectible note */}
        <div className="p-3 rounded-xl border"
          style={{ borderColor: '#fbbf2430', background: '#fbbf2408' }}>
          <p className="text-[10px] text-[#fbbf24] font-bold mb-1 flex items-center gap-1">
            <BookOpen size={10} /> COLLECTIBLE KEY TAKEAWAY
          </p>
          <p className="text-xs text-[#fde68a] italic">"{lesson.key_takeaway}"</p>
        </div>

        {/* Mystery thread */}
        {lesson.mystery_thread_hint && (
          <div className="mt-2 p-2.5 rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/06">
            <p className="text-[9px] text-[#a78bfa] font-black uppercase tracking-widest mb-0.5">🔮 Mystery Thread Hint</p>
            <p className="text-[10px] text-[#c4b5fd] italic">{lesson.mystery_thread_hint}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e293b]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all"
            style={{ borderColor: activeTab === id ? personaColor : 'transparent', color: activeTab === id ? personaColor : '#475569' }}>
            <Icon size={11} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'script' && (
        <div className="space-y-2">
          {(lesson.dialogue_script || []).map((line, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-[#070b14] border border-[#1e293b]">
              <div className="shrink-0 text-right w-24">
                <p className="text-[10px] font-black" style={{ color: line.speaker === persona?.name ? personaColor : '#64748b' }}>
                  {line.speaker}
                </p>
                <p className="text-[9px] font-mono mt-0.5"
                  style={{ color: LINE_TYPE_COLORS[line.type] || '#475569' }}>
                  {line.type}
                </p>
              </div>
              <div className="flex-1 border-l border-[#1e293b] pl-3">
                <p className="text-xs text-[#f1f5f9] leading-relaxed">{line.line}</p>
                {line.visual_prompt && (
                  <p className="text-[10px] text-[#475569] italic mt-1.5 border-t border-[#1e293b] pt-1.5">
                    🎨 {line.visual_prompt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="space-y-4">
          {(lesson.quiz_questions || []).map((q, qi) => (
            <div key={qi} className="p-4 rounded-2xl bg-[#070b14] border border-[#1e293b] space-y-3">
              <p className="text-xs font-bold text-[#f1f5f9]">Q{qi + 1}. {q.question}</p>
              <div className="space-y-1.5">
                {(q.options || []).map((opt, oi) => {
                  const letter = ['A', 'B', 'C', 'D'][oi];
                  const isSelected = selectedAnswer[qi] === letter;
                  const isCorrect = letter === q.correct_answer;
                  const showResult = selectedAnswer[qi] !== undefined;
                  return (
                    <button key={oi}
                      onClick={() => setSelectedAnswer(prev => ({ ...prev, [qi]: letter }))}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all"
                      style={{
                        borderColor: showResult ? (isCorrect ? '#00d4aa60' : isSelected ? '#ef444460' : '#1e293b') : isSelected ? `${personaColor}60` : '#1e293b',
                        background: showResult ? (isCorrect ? '#00d4aa10' : isSelected ? '#ef444410' : '#0a0f1e') : isSelected ? `${personaColor}10` : '#0a0f1e',
                        color: showResult ? (isCorrect ? '#00d4aa' : isSelected ? '#ef4444' : '#64748b') : isSelected ? personaColor : '#94a3b8',
                      }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ background: isSelected ? `${personaColor}20` : '#1e293b' }}>
                        {letter}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selectedAnswer[qi] !== undefined && q.explanation && (
                <div className="p-2.5 rounded-xl border border-[#00d4aa]/20 bg-[#00d4aa]/06">
                  <p className="text-[10px] text-[#00d4aa] font-bold mb-0.5">Explanation</p>
                  <p className="text-[10px] text-[#94a3b8]">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'animated' && (
        <div className="space-y-2">
          {(lesson.animated_moments || []).length === 0 ? (
            <p className="text-xs text-[#334155] text-center py-6">No animated moments generated.</p>
          ) : (
            (lesson.animated_moments || []).map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b] flex items-start gap-3">
                <span className="text-lg shrink-0">{m.character === 'robot' ? '🤖' : '💡'}</span>
                <div>
                  <p className="text-[10px] text-[#475569]">After dialogue line {m.trigger}</p>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'art' && (
        <div className="space-y-2">
          {(lesson.concept_art_descriptions || []).length === 0 ? (
            <p className="text-xs text-[#334155] text-center py-6">No concept art descriptions generated.</p>
          ) : (
            (lesson.concept_art_descriptions || []).map((desc, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#070b14] border border-[#1e293b]">
                <p className="text-[9px] text-[#475569] uppercase tracking-widest mb-1">Scene {i + 1}</p>
                <p className="text-xs text-[#94a3b8] leading-relaxed italic">"{desc}"</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}