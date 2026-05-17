import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, BookOpen, Megaphone, Trophy, GraduationCap, Palette, X } from 'lucide-react';

const PROJECT_PRESETS = [
  {
    id: 'cinematic_intro',
    label: 'Cinematic Intro',
    icon: '🎬',
    color: '#00d4aa',
    scene_type: 'intro',
    description: 'Full robot + lightbulb reveal sequence',
    defaults: { characters: ['robot', 'lightbulb'], tags: ['cinematic', 'intro'] },
  },
  {
    id: 'promotion',
    label: 'Promotion / Ad',
    icon: '📣',
    color: '#fbbf24',
    scene_type: 'promotion',
    description: 'High-energy promo for social or in-app',
    defaults: { characters: ['robot'], tags: ['promo', 'ad'] },
  },
  {
    id: 'reward',
    label: 'Reward Delivery',
    icon: '🏆',
    color: '#a78bfa',
    scene_type: 'reward',
    description: 'Present badges, prizes or membership upgrades',
    defaults: { characters: ['robot', 'lightbulb'], tags: ['reward'] },
  },
  {
    id: 'academy_lesson',
    label: 'Academy Lesson',
    icon: '📚',
    color: '#60a5fa',
    scene_type: 'tutorial',
    description: 'Attach to a course, school level or lesson slot',
    defaults: { characters: ['lightbulb'], tags: ['academy', 'lesson'] },
    hasAcademyPlacement: true,
  },
  {
    id: 'media_export',
    label: 'Media / Ad Export',
    icon: '📸',
    color: '#f87171',
    scene_type: 'promotion',
    description: 'Optimised for export to social, press or advertising',
    defaults: { characters: ['robot', 'lightbulb'], tags: ['media', 'export', 'ad'] },
  },
  {
    id: 'custom',
    label: 'Custom / Blank',
    icon: '🎨',
    color: '#64748b',
    scene_type: 'custom',
    description: 'Start from scratch with no presets',
    defaults: { characters: [], tags: [] },
  },
];

const SCHOOL_LEVELS = ['Kindergarten', 'Grade School', 'Mid Grade', 'Junior High', 'High School', 'University'];

export default function NewSceneWizard({ onConfirm, onCancel }) {
  const [step, setStep] = useState(1); // 1 = pick preset, 2 = details
  const [preset, setPreset] = useState(null);
  const [title, setTitle] = useState('');
  const [extraTags, setExtraTags] = useState('');
  // Academy placement
  const [schoolLevel, setSchoolLevel] = useState('');
  const [courseId, setCourseId] = useState('');
  const [lessonSlot, setLessonSlot] = useState('');

  const handlePickPreset = (p) => {
    setPreset(p);
    setTitle('');
    setStep(2);
  };

  const handleCreate = () => {
    if (!title.trim() || !preset) return;
    const extraTagList = extraTags.split(',').map(t => t.trim()).filter(Boolean);
    const allTags = [...preset.defaults.tags, ...extraTagList];
    // Academy meta stored in tags + description
    const academyMeta = preset.hasAcademyPlacement && schoolLevel
      ? { academy_school_level: schoolLevel, academy_course_id: courseId, academy_lesson_slot: lessonSlot }
      : {};
    onConfirm({
      title: title.trim(),
      scene_type: preset.scene_type,
      characters: preset.defaults.characters,
      tags: allTags,
      status: 'draft',
      description: preset.description,
      ...academyMeta,
    });
  };

  return (
    <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#00d4aa]" />
          <h3 className="text-sm font-bold text-[#f1f5f9]">
            {step === 1 ? 'Choose Project Type' : `New Scene — ${preset?.label}`}
          </h3>
        </div>
        <button onClick={onCancel} className="text-[#475569] hover:text-[#f1f5f9]"><X size={14} /></button>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_PRESETS.map(p => (
                <button key={p.id} onClick={() => handlePickPreset(p)}
                  className="flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all hover:scale-[1.02]"
                  style={{ borderColor: `${p.color}30`, background: `${p.color}08` }}>
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-xs font-bold flex-1" style={{ color: p.color }}>{p.label}</span>
                    <ChevronRight size={10} style={{ color: p.color }} />
                  </div>
                  <p className="text-[10px] text-[#475569] leading-tight">{p.description}</p>
                  {p.hasAcademyPlacement && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#60a5fa]/15 text-[#60a5fa]">Academy slot</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && preset && (
          <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="space-y-3">
            <button onClick={() => setStep(1)} className="text-[10px] text-[#475569] hover:text-[#00d4aa] flex items-center gap-1">
              ← Back to presets
            </button>

            <div>
              <label className="text-[10px] text-[#475569] uppercase tracking-wide">Scene Title *</label>
              <input
                autoFocus
                placeholder={`e.g. ${preset.label} — Opening`}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-sm rounded-xl px-3 py-2 outline-none border border-transparent focus:border-[#00d4aa]/40"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#475569] uppercase tracking-wide">Extra Tags <span className="normal-case">(comma separated)</span></label>
              <input
                placeholder="e.g. summer-promo, v2, test"
                value={extraTags}
                onChange={e => setExtraTags(e.target.value)}
                className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-sm rounded-xl px-3 py-2 outline-none border border-transparent focus:border-[#00d4aa]/40"
              />
              <div className="flex gap-1 mt-1 flex-wrap">
                {preset.defaults.tags.map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1e293b] text-[#475569]">#{t}</span>
                ))}
              </div>
            </div>

            {/* Academy placement — only for academy_lesson preset */}
            {preset.hasAcademyPlacement && (
              <div className="border border-[#60a5fa]/20 rounded-xl p-3 space-y-2 bg-[#60a5fa]/05">
                <p className="text-[10px] font-bold text-[#60a5fa] flex items-center gap-1">
                  <GraduationCap size={11} /> Academy Placement
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-[#475569]">School Level</label>
                    <select value={schoolLevel} onChange={e => setSchoolLevel(e.target.value)}
                      className="w-full mt-0.5 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-2 py-1.5 outline-none">
                      <option value="">— Any —</option>
                      {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-[#475569]">Course ID / Slug</label>
                    <input placeholder="e.g. trading-foundations"
                      value={courseId} onChange={e => setCourseId(e.target.value)}
                      className="w-full mt-0.5 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-2 py-1.5 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-[#475569]">Lesson Slot / Position (optional)</label>
                  <input placeholder="e.g. Lesson 3 intro, after quiz, etc."
                    value={lessonSlot} onChange={e => setLessonSlot(e.target.value)}
                    className="w-full mt-0.5 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-2 py-1.5 outline-none" />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={handleCreate} disabled={!title.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: preset.color, color: '#070b14' }}>
                Create Scene
              </button>
              <button onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}