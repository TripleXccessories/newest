import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Save, Download } from 'lucide-react';
import LightbulbGuy from '@/components/effects/LightbulbGuy';
import RobotBody from '@/components/characterlab/RobotDesignPanel';
import CharacterColorPanel from '@/components/characterlab/CharacterColorPanel';
import CharacterMoodPanel from '@/components/characterlab/CharacterMoodPanel';
import CharacterExportPanel from '@/components/characterlab/CharacterExportPanel';

export default function CharacterDesignLab() {
  const [activeChar, setActiveChar] = useState('lightbulb'); // lightbulb | robot
  const [tab, setTab] = useState('look'); // look | mood | poses | export

  // Lightbulb state
  const [lbMood, setLbMood] = useState('happy');
  const [lbColor, setLbColor] = useState('#ffffff');
  const [lbGloveL, setLbGloveL] = useState('wave');
  const [lbGloveR, setLbGloveR] = useState('point_up');
  const [lbHat, setLbHat] = useState(null);
  const [lbSoundWaves, setLbSoundWaves] = useState(false);

  // Robot state
  const [robotGlowColor, setRobotGlowColor] = useState('#00d4aa');
  const [robotEyesGlow, setRobotEyesGlow] = useState(true);
  const [robotChestOpen, setRobotChestOpen] = useState(false);
  const [robotChestProcess, setRobotChestProcess] = useState(false);

  const TABS = [
    { id: 'look', label: '🎨 Look' },
    { id: 'mood', label: '😄 Mood & Poses' },
    { id: 'export', label: '📤 Export' },
  ];

  return (
    <div className="min-h-screen bg-[#030508] text-[#f1f5f9]">
      {/* Header */}
      <div className="border-b border-[#1e293b] bg-[#070b14] px-6 py-4 flex items-center gap-4">
        <Link to="/directors-cut" className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-[#f1f5f9]">Character Design Lab</h1>
          <p className="text-[10px] text-[#475569]">Customize Robot & LightbulbGuy appearance, mood, and poses</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Character selector */}
          {['lightbulb', 'robot'].map(c => (
            <button key={c} onClick={() => setActiveChar(c)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
              style={{
                borderColor: activeChar === c ? (c === 'lightbulb' ? '#fbbf24' : '#60a5fa') : '#1e293b',
                background: activeChar === c ? (c === 'lightbulb' ? '#fbbf2420' : '#60a5fa20') : 'transparent',
                color: activeChar === c ? (c === 'lightbulb' ? '#fbbf24' : '#60a5fa') : '#475569',
              }}>
              {c === 'lightbulb' ? '💡 Lightbulb Guy' : '🤖 Robot'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Preview Panel */}
        <div className="flex-1 flex items-center justify-center bg-[#030508] relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: activeChar === 'lightbulb'
              ? `radial-gradient(ellipse at 50% 40%, ${lbColor}15 0%, transparent 60%)`
              : `radial-gradient(ellipse at 50% 40%, ${robotGlowColor}12 0%, transparent 60%)` }} />

          {/* Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)', backgroundSize: '30px 30px' }} />

          <motion.div
            key={activeChar}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            {activeChar === 'lightbulb' ? (
              <LightbulbGuy
                mood={lbMood}
                gloveLeft={lbGloveL}
                gloveRight={lbGloveR}
                bulbColor={lbColor}
                hatType={lbHat}
                showSoundWaves={lbSoundWaves}
                size={260}
              />
            ) : (
              <svg width="180" height="300" viewBox="0 0 160 260">
                <RobotBodyPreview
                  eyesGlowing={robotEyesGlow}
                  chestOpen={robotChestOpen}
                  chestProcessing={robotChestProcess}
                  glowColor={robotGlowColor}
                />
              </svg>
            )}
          </motion.div>

          {/* Character label */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-[10px] font-mono text-[#334155] uppercase tracking-widest">
              {activeChar === 'lightbulb' ? 'LightbulbGuy · Smart Character' : 'Robot · AI Programmer'}
            </p>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-80 border-l border-[#1e293b] bg-[#070b14] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#1e293b]">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 py-3 text-[10px] font-bold transition-colors"
                style={{ color: tab === t.id ? '#00d4aa' : '#475569', borderBottom: tab === t.id ? '2px solid #00d4aa' : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeChar === 'lightbulb' && tab === 'look' && (
              <CharacterColorPanel
                color={lbColor}
                onColorChange={setLbColor}
                hat={lbHat}
                onHatChange={setLbHat}
                soundWaves={lbSoundWaves}
                onSoundWavesChange={setLbSoundWaves}
              />
            )}
            {activeChar === 'lightbulb' && tab === 'mood' && (
              <CharacterMoodPanel
                mood={lbMood}
                onMoodChange={setLbMood}
                gloveLeft={lbGloveL}
                gloveRight={lbGloveR}
                onGloveLChange={setLbGloveL}
                onGloveRChange={setLbGloveR}
              />
            )}
            {activeChar === 'robot' && tab === 'look' && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">Glow Color</p>
                  <div className="flex flex-wrap gap-2">
                    {['#00d4aa','#60a5fa','#a78bfa','#fbbf24','#fb7185','#34d399','#f97316','#ffffff'].map(c => (
                      <button key={c} onClick={() => setRobotGlowColor(c)}
                        className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                        style={{ background: c, borderColor: robotGlowColor === c ? '#f1f5f9' : 'transparent' }} />
                    ))}
                  </div>
                  <input type="color" value={robotGlowColor} onChange={e => setRobotGlowColor(e.target.value)}
                    className="mt-2 w-full h-8 rounded-lg cursor-pointer border border-[#1e293b] bg-[#0a0f1e]" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest">State</p>
                  {[
                    { label: 'Eyes Glowing', value: robotEyesGlow, set: setRobotEyesGlow },
                    { label: 'Chest Open', value: robotChestOpen, set: setRobotChestOpen },
                    { label: 'Chest Processing', value: robotChestProcess, set: setRobotChestProcess },
                  ].map(({ label, value, set }) => (
                    <label key={label} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#0a0f1e] cursor-pointer">
                      <span className="text-xs text-[#94a3b8]">{label}</span>
                      <button onClick={() => set(v => !v)}
                        className="w-10 h-5 rounded-full transition-all relative"
                        style={{ background: value ? '#00d4aa' : '#1e293b' }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                          style={{ left: value ? '22px' : '2px' }} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {tab === 'export' && (
              <CharacterExportPanel
                charType={activeChar}
                config={activeChar === 'lightbulb' ? { mood: lbMood, bulbColor: lbColor, gloveLeft: lbGloveL, gloveRight: lbGloveR, hatType: lbHat } : { glowColor: robotGlowColor, eyesGlowing: robotEyesGlow }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline robot body preview (reuses SVG from RobotCreatorScene)
function RobotBodyPreview({ eyesGlowing, chestOpen, chestProcessing, glowColor }) {
  return (
    <g>
      {/* Neck */}
      <rect x="68" y="72" width="24" height="20" rx="4" fill="#475569" stroke="#334155" strokeWidth="1" />
      {/* Head */}
      <rect x="28" y="12" width="104" height="62" rx="14" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      <ellipse cx="80" cy="18" rx="48" ry="14" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
      <rect x="38" y="20" width="84" height="46" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <rect x="42" y="24" width="76" height="38" rx="6"
        fill={eyesGlowing ? '#020c04' : '#070b14'}
        stroke={eyesGlowing ? glowColor : '#1e293b'} strokeWidth={eyesGlowing ? 1.5 : 1} />
      {/* Eyes */}
      <ellipse cx="63" cy="43" rx="11" ry="8" fill={eyesGlowing ? glowColor : '#1e293b'} />
      <ellipse cx="97" cy="43" rx="11" ry="8" fill={eyesGlowing ? glowColor : '#1e293b'} />
      {/* Mouth */}
      <rect x="58" y="56" width="44" height="4" rx="2" fill={eyesGlowing ? glowColor : '#1e293b'} opacity={eyesGlowing ? 0.8 : 0.4} />
      {/* Shoulders */}
      <ellipse cx="26" cy="108" rx="18" ry="14" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
      <ellipse cx="134" cy="108" rx="18" ry="14" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
      {/* Arms */}
      <rect x="10" y="118" width="22" height="70" rx="10" fill="#64748b" stroke="#475569" strokeWidth="1" />
      <rect x="128" y="118" width="22" height="70" rx="10" fill="#64748b" stroke="#475569" strokeWidth="1" />
      {/* Torso */}
      <rect x="30" y="90" width="100" height="100" rx="12" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
      {/* Chest panel */}
      <rect x="48" y="100" width="64" height="56" rx="10"
        fill={chestOpen ? '#001a0a' : '#0f172a'}
        stroke={chestProcessing || chestOpen ? glowColor : '#334155'}
        strokeWidth={chestProcessing || chestOpen ? 2 : 1.5} />
      {/* Legs */}
      <rect x="42" y="188" width="32" height="60" rx="10" fill="#475569" stroke="#334155" strokeWidth="1" />
      <rect x="86" y="188" width="32" height="60" rx="10" fill="#475569" stroke="#334155" strokeWidth="1" />
      <rect x="36" y="242" width="44" height="16" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="1" />
      <rect x="80" y="242" width="44" height="16" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="1" />
    </g>
  );
}