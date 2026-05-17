import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, BookOpen, ChevronDown, ChevronRight, RefreshCw, Download, Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import GeneratedLessonPreview from '@/components/studio/GeneratedLessonPreview';
import ScriptTemplateManager from '@/components/studio/ScriptTemplateManager';

const SCHOOL_LEVELS = ['Kindergarten', 'Grade School', 'Mid Grade', 'Junior High', 'High School', 'University'];

const CATEGORIES = [
  'Trading Foundations', 'Technical Analysis', 'Risk Management',
  'Market Structure', 'Crypto', 'Forex', 'Options', 'Futures',
  'Psychology & Discipline', 'Advanced Strategies', 'Companion & Automation',
];

const TONE_DESCRIPTIONS = {
  'Kindergarten':  '😄 Very playful, silly, warm — maximum fun',
  'Grade School':  '🌟 Friendly and curious — building excitement',
  'Mid Grade':     '📚 Engaging balance — occasional jokes, growing confidence',
  'Junior High':   '🎯 Focused and preparing — serious with moments',
  'High School':   '🔥 Smart & witty — story arc climax, secret event hints',
  'University':    '🎓 Professional & authoritative — companion mastery',
};

export default function LessonScriptGenerator() {
  const [personas, setPersonas] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previousContext, setPreviousContext] = useState([]);
  const [saveToDB, setSaveToDB] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [params, setParams] = useState({
    lesson_title: '',
    category: 'Trading Foundations',
    sub_category: '',
    school_level: 'Kindergarten',
    character_id: '',
    storyline_active: false,
    storyline_chapter: 1,
    tone_override: '',
    course_id: '',
    lesson_number: 1,
  });

  useEffect(() => {
    base44.entities.BotPersona.filter({ status: 'active' }).then(setPersonas).catch(() => {});
    // Load saved templates from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('lesson_gen_templates') || '[]');
      setSavedTemplates(saved);
    } catch {}
  }, []);

  const selectedPersona = personas.find(p => p.id === params.character_id);

  const set = (key, val) => setParams(prev => ({ ...prev, [key]: val }));

  const handleGenerate = async () => {
    if (!params.lesson_title.trim() || !params.character_id) return;
    setGenerating(true);
    setGeneratedLesson(null);
    try {
      const res = await base44.functions.invoke('generateLessonScript', {
        ...params,
        character_name: selectedPersona?.name || '',
        character_archetype: selectedPersona?.archetype || '',
        character_traits: selectedPersona?.traits || {},
        character_signature_line: selectedPersona?.signature_line || '',
        previous_lessons_context: previousContext,
        save_to_db: saveToDB,
      });
      setGeneratedLesson(res.data?.lesson);
    } catch (e) {
      alert('Generation failed: ' + e.message);
    }
    setGenerating(false);
  };

  const handleSaveToContext = () => {
    if (!generatedLesson) return;
    const entry = { title: generatedLesson.title, key_takeaway: generatedLesson.key_takeaway };
    setPreviousContext(prev => [...prev.slice(-4), entry]); // keep last 5
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveTemplate = (name) => {
    const template = { name, ...params };
    const updated = [...savedTemplates.filter(t => t.name !== name), template];
    setSavedTemplates(updated);
    localStorage.setItem('lesson_gen_templates', JSON.stringify(updated));
  };

  const handleLoadTemplate = (template) => {
    const { name, ...rest } = template;
    setParams(prev => ({ ...prev, ...rest }));
    setShowTemplates(false);
  };

  const handleDeleteTemplate = (name) => {
    const updated = savedTemplates.filter(t => t.name !== name);
    setSavedTemplates(updated);
    localStorage.setItem('lesson_gen_templates', JSON.stringify(updated));
  };

  const handleExportJSON = () => {
    if (!generatedLesson) return;
    const blob = new Blob([JSON.stringify(generatedLesson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedLesson.title?.replace(/\s+/g, '_') || 'lesson'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">

      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/directors-cut" className="text-[#64748b] hover:text-[#f1f5f9]">
            <ArrowLeft size={16} />
          </Link>
          <Sparkles size={16} className="text-[#00d4aa]" />
          <div>
            <h1 className="text-base font-black">AI Lesson Script Generator</h1>
            <p className="text-[10px] text-[#475569]">Generate full scenes with character voice, tone, quiz & animated moments</p>
          </div>
        </div>
        <button onClick={() => setShowTemplates(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] hover:border-[#334155] transition-all">
          <BookOpen size={12} /> Templates ({savedTemplates.length})
        </button>
      </div>

      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-0 h-[calc(100vh-65px)]">

        {/* Left — Config Panel */}
        <div className="w-full lg:w-[420px] overflow-y-auto p-5 space-y-4 border-r border-[#1e293b] bg-[#070b14]">

          {/* Template Manager */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div key="templates" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <ScriptTemplateManager
                  templates={savedTemplates}
                  onLoad={handleLoadTemplate}
                  onDelete={handleDeleteTemplate}
                  onSave={handleSaveTemplate}
                  currentParams={params}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* School Level */}
          <Section title="School Level / Act">
            <div className="grid grid-cols-2 gap-2">
              {SCHOOL_LEVELS.map(level => (
                <button key={level} onClick={() => set('school_level', level)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left"
                  style={{
                    borderColor: params.school_level === level ? '#00d4aa' : '#1e293b',
                    background: params.school_level === level ? '#00d4aa10' : '#0a0f1e',
                    color: params.school_level === level ? '#00d4aa' : '#64748b',
                  }}>
                  {level}
                </button>
              ))}
            </div>
            {params.school_level && (
              <p className="text-[10px] text-[#475569] mt-2 pl-1">{TONE_DESCRIPTIONS[params.school_level]}</p>
            )}
          </Section>

          {/* Character */}
          <Section title="Faculty Character (Scene Teacher)">
            {personas.length === 0 ? (
              <p className="text-[10px] text-[#475569]">No active personas found. Create BotPersonas with status=active first.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {personas.map(p => (
                  <button key={p.id} onClick={() => set('character_id', p.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: params.character_id === p.id ? '#a78bfa60' : '#1e293b',
                      background: params.character_id === p.id ? '#a78bfa10' : '#0a0f1e',
                    }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: p.primary_color ? `${p.primary_color}30` : '#1e293b', color: p.primary_color || '#64748b' }}>
                      {p.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: params.character_id === p.id ? '#a78bfa' : '#f1f5f9' }}>{p.name}</p>
                      <p className="text-[9px] text-[#475569]">{p.archetype} · {p.school}</p>
                    </div>
                    {params.character_id === p.id && <Check size={11} className="text-[#a78bfa] shrink-0 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* Lesson Details */}
          <Section title="Scene / Lesson Details">
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-[#475569] uppercase tracking-wide">Lesson Title *</label>
                <input value={params.lesson_title} onChange={e => set('lesson_title', e.target.value)}
                  placeholder="e.g. What is a Candlestick?"
                  className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-sm rounded-xl px-3 py-2 outline-none border border-transparent focus:border-[#00d4aa]/40" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#475569] uppercase tracking-wide">Category</label>
                  <select value={params.category} onChange={e => set('category', e.target.value)}
                    className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-2 py-2 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#475569] uppercase tracking-wide">Sub-Category</label>
                  <input value={params.sub_category} onChange={e => set('sub_category', e.target.value)}
                    placeholder="e.g. Candlestick Patterns"
                    className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-2 py-2 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#475569] uppercase tracking-wide">Course ID</label>
                  <input value={params.course_id} onChange={e => set('course_id', e.target.value)}
                    placeholder="e.g. trading-foundations"
                    className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-2 py-2 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-[#475569] uppercase tracking-wide">Lesson #</label>
                  <input type="number" value={params.lesson_number} onChange={e => set('lesson_number', parseInt(e.target.value))}
                    className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-2 py-2 outline-none" />
                </div>
              </div>
            </div>
          </Section>

          {/* Storyline */}
          <Section title="Storyline Thread">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#94a3b8]">Activate storyline thread</label>
                <button onClick={() => set('storyline_active', !params.storyline_active)}
                  className="w-10 h-5 rounded-full transition-colors relative"
                  style={{ background: params.storyline_active ? '#00d4aa' : '#1e293b' }}>
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: params.storyline_active ? '22px' : '2px' }} />
                </button>
              </div>
              {params.storyline_active && (
                <div>
                  <label className="text-[10px] text-[#475569]">Storyline Chapter</label>
                  <input type="number" value={params.storyline_chapter} onChange={e => set('storyline_chapter', parseInt(e.target.value))}
                    className="w-full mt-1 bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-2 py-2 outline-none" />
                </div>
              )}
            </div>
          </Section>

          {/* Tone Override */}
          <Section title="Tone Override (optional)">
            <input value={params.tone_override} onChange={e => set('tone_override', e.target.value)}
              placeholder="e.g. Make this lesson extra dramatic, robot is nervous today"
              className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded-xl px-3 py-2 outline-none" />
          </Section>

          {/* Continuity Context */}
          <Section title={`Continuity Memory (${previousContext.length} lessons loaded)`}>
            <p className="text-[10px] text-[#475569] mb-2">After generating, click "Add to Memory" to chain lessons so the AI avoids repeating topics and maintains story flow.</p>
            {previousContext.length > 0 && (
              <div className="space-y-1 mb-2">
                {previousContext.map((ctx, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#0a0f1e] border border-[#1e293b]">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#94a3b8] truncate">{ctx.title}</p>
                      <p className="text-[9px] text-[#475569] truncate">{ctx.key_takeaway}</p>
                    </div>
                    <button onClick={() => setPreviousContext(prev => prev.filter((_, j) => j !== i))} className="text-[#334155] hover:text-[#ef4444] ml-2 shrink-0">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {previousContext.length > 0 && (
              <button onClick={() => setPreviousContext([])} className="text-[10px] text-[#475569] hover:text-[#ef4444]">Clear all memory</button>
            )}
          </Section>

          {/* Save to DB */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0f1e] border border-[#1e293b]">
            <div>
              <p className="text-xs font-bold text-[#94a3b8]">Auto-save to Lessons DB</p>
              <p className="text-[10px] text-[#475569]">Requires Course ID</p>
            </div>
            <button onClick={() => setSaveToDB(s => !s)}
              className="w-10 h-5 rounded-full transition-colors relative"
              style={{ background: saveToDB ? '#00d4aa' : '#1e293b' }}>
              <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: saveToDB ? '22px' : '2px' }} />
            </button>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !params.lesson_title.trim() || !params.character_id}
            className="w-full py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #00a88a)', color: '#070b14', boxShadow: '0 4px 20px rgba(0,212,170,0.25)' }}>
            {generating ? (
              <><RefreshCw size={14} className="animate-spin" /> Generating Scene...</>
            ) : (
              <><Sparkles size={14} /> Generate Lesson Script</>
            )}
          </button>

          {/* Note on AI credit usage */}
          <p className="text-[9px] text-[#334155] text-center">Uses Claude Sonnet for high-quality lesson generation. Each generation uses integration credits.</p>
        </div>

        {/* Right — Preview Panel */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#050911]">
          {!generatedLesson && !generating && (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0a0f1e] border border-[#1e293b] flex items-center justify-center">
                <Sparkles size={24} className="text-[#1e293b]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#334155]">Configure your scene on the left</p>
                <p className="text-xs text-[#1e293b] mt-1">Set level, character, title → Generate</p>
              </div>
            </div>
          )}

          {generating && (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
              <p className="text-sm text-[#475569]">Writing your scene...</p>
              <p className="text-xs text-[#334155]">Character voice + tone + quiz + animated moments</p>
            </div>
          )}

          {generatedLesson && !generating && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleSaveToContext}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{ borderColor: savedSuccess ? '#00d4aa60' : '#1e293b', color: savedSuccess ? '#00d4aa' : '#64748b', background: savedSuccess ? '#00d4aa10' : 'transparent' }}>
                  {savedSuccess ? <Check size={11} /> : <Plus size={11} />}
                  {savedSuccess ? 'Added to Memory!' : 'Add to Continuity Memory'}
                </button>
                <button onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                  <Download size={11} /> Export JSON
                </button>
                <button onClick={handleGenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                  <RefreshCw size={11} /> Regenerate
                </button>
              </div>

              <GeneratedLessonPreview lesson={generatedLesson} persona={selectedPersona} schoolLevel={params.school_level} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-[#64748b] hover:text-[#f1f5f9] transition-colors">
        {title}
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}