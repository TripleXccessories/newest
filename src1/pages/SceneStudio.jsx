import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Film, Music, Sliders, Code, Eye, ArrowLeft, Sparkles, ChevronDown, History, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SceneLibraryTOC from '@/components/studio/SceneLibraryTOC';
import NewSceneWizard from '@/components/studio/NewSceneWizard';
import SaveDispatchModal from '@/components/studio/SaveDispatchModal';
import BeatMachine from '@/components/studio/BeatMachine';
import FXPluginRack from '@/components/studio/FXPluginRack';
import AudioUploader from '@/components/studio/AudioUploader';
import ScriptSequencer from '@/components/studio/ScriptSequencer';
import SceneHistory, { pushHistory } from '@/components/studio/SceneHistory';
import SceneAnalytics from '@/components/studio/SceneAnalytics';
import SceneValidator from '@/components/studio/SceneValidator';
import AIScriptAssistant from '@/components/studio/AIScriptAssistant';
import LightbulbGuy from '@/components/effects/LightbulbGuy';
import RobotCreatorScene from '@/components/effects/RobotCreatorScene';

const TABS = [
  { id: 'scenes',    label: 'Library',    icon: Film },
  { id: 'sequencer', label: 'Sequencer',  icon: Code },
  { id: 'history',   label: 'History',    icon: History },
  { id: 'beats',     label: '8-Track',    icon: Music },
  { id: 'fx',        label: 'FX Plugins', icon: Sliders },
  { id: 'audio',     label: 'Audio',      icon: Music },
  { id: 'analytics', label: 'Analytics',  icon: BarChart2 },
];

const MOODS  = ['idle', 'happy', 'excited', 'wink', 'thinking', 'surprised', 'aha', 'coding'];
const GLOVES = ['down', 'wave', 'point_up', 'point_right', 'cup', 'temple'];
const BULB_COLORS = ['#ffffff', '#00d4aa', '#a78bfa', '#fbbf24', '#f87171', '#60a5fa'];

export default function SceneStudio() {
  const [activeTab, setActiveTab]         = useState('scenes');
  const [activeScene, setActiveScene]     = useState(null);
  const [showWizard, setShowWizard]       = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [creating, setCreating]           = useState(false);

  // Stage state
  const [robotKey,   setRobotKey]   = useState(0);
  const [bulbMood,   setBulbMood]   = useState('idle');
  const [bulbGloveL, setBulbGloveL] = useState('down');
  const [bulbGloveR, setBulbGloveR] = useState('down');
  const [bulbColor,  setBulbColor]  = useState('#ffffff');
  const [showBulb,   setShowBulb]   = useState(true);
  const [showRobot,  setShowRobot]  = useState(true);
  const [beatPattern, setBeatPattern] = useState(null);

  const handleSequencerState = ({ character, action, value }) => {
    if (character === 'lightbulb') {
      if (action === 'mood')      setBulbMood(value);
      if (action === 'glove')     setBulbGloveL(value);
      if (action === 'bulbColor') setBulbColor(value);
    }
    if (character === 'robot') {
      if (action === 'nodes' || action === 'chestPanel') setRobotKey(k => k + 1);
    }
  };

  const handleWizardConfirm = async (data) => {
    setCreating(true);
    const scene = await base44.entities.SceneScript.create(data);
    setActiveScene(scene);
    setShowWizard(false);
    setCreating(false);
    setActiveTab('sequencer');
  };

  const handleSaved = (updatedScene) => {
    // Push to history whenever a save completes
    if (updatedScene?.id) {
      pushHistory(updatedScene.id, { ...updatedScene, beat_track: beatPattern || updatedScene.beat_track });
    }
    setActiveScene(updatedScene);
  };

  const handleRestoreSnapshot = async (snap) => {
    const { _saved_at, _id, ...restoreData } = snap;
    await base44.entities.SceneScript.update(snap.id, restoreData);
    setActiveScene({ ...snap });
  };

  const [allScenes, setAllScenes] = useState([]);
  const [validationResult, setValidationResult] = useState(null);

  return (
    <div className="min-h-screen bg-[#050911] text-[#f1f5f9]">

      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14]">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#00d4aa]" />
              <h1 className="text-lg font-black tracking-tight">IINT Scene Studio</h1>
            </div>
            {activeScene && (
              <span className="text-xs px-2 py-1 rounded-lg bg-[#1e293b] text-[#64748b] max-w-[180px] truncate">
                {activeScene.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeScene && (
              <div className="flex items-center gap-2">
                {/* Validation quick badge */}
                {validationResult && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: validationResult.errors.length > 0 ? '#ef444415' : validationResult.warnings.length > 0 ? '#fbbf2415' : '#00d4aa15',
                      color: validationResult.errors.length > 0 ? '#ef4444' : validationResult.warnings.length > 0 ? '#fbbf24' : '#00d4aa',
                    }}>
                    {validationResult.errors.length > 0 ? '⛔' : validationResult.warnings.length > 0 ? '⚠️' : '✅'}
                    {validationResult.score}%
                  </div>
                )}
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#00d4aa] text-[#070b14] hover:bg-[#00d4aa]/90 transition-all">
                  <Save size={14} /> Save & Dispatch
                  <ChevronDown size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-screen-2xl mx-auto px-6 flex gap-1 overflow-x-auto pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap"
              style={{
                borderColor: activeTab === id ? '#00d4aa' : 'transparent',
                color: activeTab === id ? '#00d4aa' : '#64748b',
              }}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-105px)]">

        {/* Stage */}
        <div className="flex-1 relative bg-[#030508] border-r border-[#1e293b] flex flex-col items-center justify-center overflow-hidden min-h-[320px]">
          <div className="absolute bottom-0 left-0 right-0 h-24"
            style={{ background: 'linear-gradient(to top, #0a0f1e, transparent)' }} />
          <div className="absolute bottom-16 left-0 right-0 h-px bg-[#1e293b] opacity-50" />

          <div className="relative flex items-end justify-center gap-16 pb-12">
            {showRobot && (
              <motion.div initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                <RobotCreatorScene key={robotKey} />
              </motion.div>
            )}
            {showBulb && (
              <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <LightbulbGuy mood={bulbMood} gloveLeft={bulbGloveL} gloveRight={bulbGloveR} bulbColor={bulbColor} size={160} />
              </motion.div>
            )}
          </div>

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Eye size={12} className="text-[#334155]" />
            <span className="text-[10px] text-[#334155] font-mono uppercase tracking-widest">Live Stage Preview</span>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setShowRobot(r => !r)}
              className="px-2 py-1 rounded text-[10px] font-bold border transition-colors"
              style={{ borderColor: showRobot ? '#60a5fa' : '#1e293b', color: showRobot ? '#60a5fa' : '#334155' }}>
              🤖 Robot
            </button>
            <button onClick={() => setShowBulb(b => !b)}
              className="px-2 py-1 rounded text-[10px] font-bold border transition-colors"
              style={{ borderColor: showBulb ? '#fbbf24' : '#1e293b', color: showBulb ? '#fbbf24' : '#334155' }}>
              💡 Bulb
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-[480px] overflow-y-auto p-4 space-y-4 bg-[#070b14]">
          <AnimatePresence mode="wait">

            {/* ── LIBRARY / TOC ── */}
            {activeTab === 'scenes' && (
              <motion.div key="scenes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Film size={14} className="text-[#00d4aa]" />
                    <h3 className="text-sm font-bold text-[#f1f5f9]">Scene Library</h3>
                  </div>
                  <SceneLibraryTOC
                    activeSceneId={activeScene?.id}
                    onSelect={(scene) => { setActiveScene(scene); setActiveTab('sequencer'); }}
                    onNew={() => setShowWizard(true)}
                    onDelete={(id) => { if (activeScene?.id === id) setActiveScene(null); }}
                    onEdit={() => {}}
                  />
                </div>

                <AnimatePresence>
                  {showWizard && (
                    <motion.div key="wizard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <NewSceneWizard
                        onConfirm={handleWizardConfirm}
                        onCancel={() => setShowWizard(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── SEQUENCER + MANUAL ── */}
            {activeTab === 'sequencer' && (
              <motion.div key="sequencer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {!activeScene && (
                  <div className="text-center py-8 bg-[#0a0f1e] border border-[#1e293b] rounded-2xl">
                    <p className="text-sm text-[#475569]">Select or create a scene first.</p>
                    <button onClick={() => setActiveTab('scenes')} className="mt-2 text-[#00d4aa] text-xs hover:underline">Go to Library →</button>
                  </div>
                )}
                {activeScene && <ScriptSequencer onStateChange={handleSequencerState} />}

                {/* Scene Validator */}
                {activeScene && (
                  <SceneValidator
                    scene={activeScene}
                    beatPattern={beatPattern}
                    onValidationChange={setValidationResult}
                  />
                )}

                {/* AI Script Assistant */}
                {activeScene && (
                  <AIScriptAssistant
                    scene={activeScene}
                    onApplyScript={(events) => {
                      setActiveScene(prev => ({
                        ...prev,
                        script_events: [...(prev.script_events || []), ...events],
                      }));
                    }}
                  />
                )}

                {activeScene && (
                  <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Manual Controls — LightbulbGuy</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-[#475569] mb-1">Mood</p>
                        <select value={bulbMood} onChange={e => setBulbMood(e.target.value)}
                          className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-2 py-1.5 outline-none">
                          {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#475569] mb-1">Bulb Color</p>
                        <div className="flex gap-1 flex-wrap">
                          {BULB_COLORS.map(c => (
                            <button key={c} onClick={() => setBulbColor(c)}
                              className="w-5 h-5 rounded-full border-2 transition-all"
                              style={{ background: c, borderColor: bulbColor === c ? '#f1f5f9' : 'transparent' }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#475569] mb-1">Left Glove</p>
                        <select value={bulbGloveL} onChange={e => setBulbGloveL(e.target.value)}
                          className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-2 py-1.5 outline-none">
                          {GLOVES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#475569] mb-1">Right Glove</p>
                        <select value={bulbGloveR} onChange={e => setBulbGloveR(e.target.value)}
                          className="w-full bg-[#1e293b] text-[#f1f5f9] text-xs rounded-lg px-2 py-1.5 outline-none">
                          {GLOVES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={() => setRobotKey(k => k + 1)}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/30 hover:bg-[#60a5fa]/25 transition-colors">
                      🤖 Replay Robot Scene
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── HISTORY ── */}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-4">
                  <SceneHistory
                    scene={activeScene}
                    beatPattern={beatPattern}
                    onRestore={handleRestoreSnapshot}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'beats' && (
              <motion.div key="beats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BeatMachine onSave={pattern => setBeatPattern(pattern)} />
              </motion.div>
            )}

            {activeTab === 'fx' && (
              <motion.div key="fx" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FXPluginRack />
              </motion.div>
            )}

            {activeTab === 'audio' && (
              <motion.div key="audio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-[#f1f5f9]">Audio Assets</h3>
                  <p className="text-[11px] text-[#475569]">Upload audio files for use in scenes, beat tracks, and SFX.</p>
                  <AudioUploader onAssetUploaded={() => {}} />
                </div>
              </motion.div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SceneAnalytics scenes={allScenes} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Save & Dispatch Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <SaveDispatchModal
            scene={activeScene}
            beatPattern={beatPattern}
            validationResult={validationResult}
            onClose={() => setShowSaveModal(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}