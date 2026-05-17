import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Wand2, Loader2, RefreshCw, Lock, CheckCircle } from 'lucide-react';

const TRAITS = {
  riskAppetite:  { label: 'Risk Appetite',  options: ['Conservative', 'Balanced', 'Aggressive', 'Extreme'] },
  strategy:      { label: 'Strategy Style', options: ['Swing', 'Scalp', 'Position', 'Momentum'] },
  marketFocus:   { label: 'Market Focus',   options: ['Crypto', 'Equities', 'Forex', 'Multi-Asset'] },
  timeHorizon:   { label: 'Time Horizon',   options: ['Intraday', 'Weekly', 'Monthly', 'Long-Term'] },
};

const STORAGE_KEY = (botId) => `iint_bot_training_${botId}`;
const VISUAL_KEY  = (botId) => `iint_bot_visual_${botId}`;

export default function BotTrainingCard({ activeBot, archetypeColor }) {
  const [selections, setSelections] = useState({});
  const [visualUrl, setVisualUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const color = archetypeColor || '#00d4aa';

  // Load saved training state
  useEffect(() => {
    if (!activeBot?.id) return;
    const savedTraining = localStorage.getItem(STORAGE_KEY(activeBot.id));
    const savedVisual = localStorage.getItem(VISUAL_KEY(activeBot.id));
    if (savedTraining) { try { setSelections(JSON.parse(savedTraining)); } catch { setSelections({}); } }
    if (savedVisual) setVisualUrl(savedVisual);
  }, [activeBot?.id]);

  const allSelected = Object.keys(TRAITS).every(k => selections[k]);

  const select = (traitKey, option) => {
    setSelections(prev => ({ ...prev, [traitKey]: option }));
    setSaved(false);
  };

  const generateVisual = async () => {
    if (!allSelected || generating) return;
    setGenerating(true);
    setSaved(false);

    const prompt = `A cinematic digital trading identity card for a ${activeBot.archetype} bot named "${activeBot.name}". 
    Trading style: ${selections.strategy}, ${selections.riskAppetite} risk, focused on ${selections.marketFocus}, ${selections.timeHorizon} horizon. 
    Character personality: ${activeBot.role_title || activeBot.school}. 
    Visual style: futuristic dark data visualization, glowing ${activeBot.primary_color || color} accents, neural network patterns, abstract trading charts, 
    holographic card aesthetic, cinematic sci-fi quality.`;

    const res = await base44.functions.invoke('generateConceptVisual', { prompt, style: 'cinematic', context: activeBot.name }).catch(() => null);
    const url = res?.data?.image_url || res?.data?.url || res?.data?.imageUrl || null;

    if (url) {
      setVisualUrl(url);
      localStorage.setItem(VISUAL_KEY(activeBot.id), url);
    }
    // Save training config
    localStorage.setItem(STORAGE_KEY(activeBot.id), JSON.stringify(selections));
    setSaved(true);
    setGenerating(false);
  };

  if (!activeBot) return null;

  return (
    <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-5 space-y-4"
      style={{ borderColor: `${color}20` }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
            <Wand2 size={13} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#f1f5f9]">Bot Training Profile</p>
            <p className="text-[10px]" style={{ color }}>Shape {activeBot.name}'s strategy identity</p>
          </div>
        </div>
        {saved && <CheckCircle size={14} className="text-[#00d4aa]" />}
      </div>

      {/* Trait selectors */}
      <div className="space-y-3">
        {Object.entries(TRAITS).map(([key, trait]) => (
          <div key={key}>
            <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1.5">{trait.label}</p>
            <div className="flex gap-1.5 flex-wrap">
              {trait.options.map(opt => (
                <button key={opt} onClick={() => select(key, opt)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all"
                  style={{
                    borderColor: selections[key] === opt ? color : '#1e293b',
                    background: selections[key] === opt ? `${color}15` : '#111827',
                    color: selections[key] === opt ? color : '#475569',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Identity Card */}
      <AnimatePresence mode="wait">
        {visualUrl && (
          <motion.div key={visualUrl}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden border-2"
            style={{ borderColor: `${color}40`, aspectRatio: '16/7' }}>
            <img src={visualUrl} alt="Bot identity visual" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/80 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3">
              <p className="text-[10px] font-black" style={{ color }}>{activeBot.name}</p>
              <p className="text-[9px] text-[#94a3b8]">
                {selections.strategy} · {selections.riskAppetite} · {selections.marketFocus}
              </p>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold"
              style={{ background: `${color}30`, color }}>
              <Lock size={8} /> ID CARD
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate button */}
      <button
        onClick={generateVisual}
        disabled={!allSelected || generating}
        className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
        style={{ background: allSelected && !generating ? `linear-gradient(135deg, ${color}, ${color}99)` : '#1e293b', color: '#070b14' }}>
        {generating
          ? <><Loader2 size={12} className="animate-spin text-[#070b14]" /> Generating Identity Card...</>
          : visualUrl
            ? <><RefreshCw size={12} /> Regenerate Identity Card</>
            : <><Wand2 size={12} /> {allSelected ? 'Generate Identity Card' : 'Select all traits above'}</>
        }
      </button>
    </div>
  );
}