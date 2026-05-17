import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BOT_EXTRACT_PROMPTS = [
  { label: 'Tactical Warrior', style: 'armored mercenary, dark cyberpunk financial district background, dramatic rim lighting, hyper-realistic portrait' },
  { label: 'Data Oracle', style: 'holographic data streams, neural network glow, deep space background, cinematic portrait lighting' },
  { label: 'Mystical Sage', style: 'ancient wisdom keeper, glowing runes, misty mountain backdrop, ethereal portrait lighting' },
  { label: 'Phoenix Catalyst', style: 'fire and rebirth theme, phoenix feathers, volcanic landscape, epic portrait lighting' },
];

export default function BotPortraitGenerator({ botPersonas = [], onPortraitsGenerated }) {
  const [groupPhotoUrl, setGroupPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [portraits, setPortraits] = useState([]);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setGroupPhotoUrl(file_url);
    } catch (_) {}
    setUploading(false);
  };

  const generatePortraits = async () => {
    if (!groupPhotoUrl && botPersonas.length === 0) return;
    setGenerating(true);
    setProgress(0);
    setPortraits([]);

    const targets = botPersonas.length > 0
      ? botPersonas.slice(0, 8).map((p, i) => ({
          id: p.id,
          name: p.name,
          archetype: p.archetype,
          school: p.school,
          primary_color: p.primary_color || '#00d4aa',
          style: BOT_EXTRACT_PROMPTS[i % BOT_EXTRACT_PROMPTS.length].style,
        }))
      : BOT_EXTRACT_PROMPTS.map((s, i) => ({
          id: `mock_${i}`,
          name: s.label,
          archetype: 'Guide',
          school: 'Foundations',
          primary_color: '#00d4aa',
          style: s.style,
        }));

    const results = [];
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      try {
        const prompt = groupPhotoUrl
          ? `Extract and render a single individual character portrait from this group image. Focus on character #${i + 1} (or the ${target.archetype} archetype figure). Render them as a unique ${target.style}. Make it a striking, cinematic close-up portrait with bokeh background. Style: dark financial platform aesthetic, neon accents in ${target.primary_color}.`
          : `Create a unique AI trading bot character portrait. Character name: ${target.name}. Archetype: ${target.archetype}. School: ${target.school}. Style: ${target.style}. Cinematic close-up portrait, dark background, neon accent color ${target.primary_color}, hyper-realistic digital art.`;

        const res = await base44.integrations.Core.GenerateImage({
          prompt,
          existing_image_urls: groupPhotoUrl ? [groupPhotoUrl] : undefined,
        });

        results.push({ ...target, portrait_url: res.url });
      } catch (_) {
        results.push({ ...target, portrait_url: null });
      }
      setProgress(Math.round(((i + 1) / targets.length) * 100));
    }

    setPortraits(results);
    setGenerating(false);
  };

  const saveToPersonas = async () => {
    setSaving(true);
    try {
      for (const portrait of portraits) {
        if (!portrait.portrait_url || portrait.id.startsWith('mock_')) continue;
        await base44.entities.BotPersona.update(portrait.id, {
          texture_map: portrait.portrait_url,
        });
      }
      setSaved(true);
      onPortraitsGenerated?.(portraits);
    } catch (_) {}
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#f1f5f9] mb-1 flex items-center gap-2">
          <Sparkles size={14} className="text-[#a78bfa]" /> Bot Portrait Generator
        </h3>
        <p className="text-xs text-[#64748b]">Upload a group photo or generate individual portraits for each bot persona using AI.</p>
      </div>

      {/* Upload zone */}
      <label className="block cursor-pointer">
        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          groupPhotoUrl ? 'border-[#a78bfa]/50 bg-[#a78bfa]/05' : 'border-[#1e293b] hover:border-[#334155]'
        }`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#a78bfa] rounded-full animate-spin" />
              <p className="text-xs text-[#64748b]">Uploading...</p>
            </div>
          ) : groupPhotoUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img src={groupPhotoUrl} alt="Group" className="h-24 w-auto rounded-lg object-cover mx-auto" />
              <p className="text-xs text-[#a78bfa]">Group photo loaded ✓</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#475569]">
              <Upload size={24} />
              <p className="text-xs">Upload group photo (optional)</p>
              <p className="text-[10px] text-[#334155]">JPG, PNG — AI will extract individual characters</p>
            </div>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      </label>

      <button
        onClick={generatePortraits}
        disabled={generating || uploading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[#a78bfa] text-[#070b14] hover:bg-[#a78bfa]/90 transition-colors disabled:opacity-50"
      >
        {generating ? (
          <><RefreshCw size={14} className="animate-spin" /> Generating... {progress}%</>
        ) : (
          <><Sparkles size={14} /> Generate {botPersonas.length > 0 ? `${Math.min(botPersonas.length, 8)} Bot Portraits` : 'Sample Portraits'}</>
        )}
      </button>

      {/* Progress bar */}
      {generating && (
        <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#a78bfa] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Portrait grid */}
      <AnimatePresence>
        {portraits.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {portraits.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group"
                >
                  {p.portrait_url ? (
                    <img
                      src={p.portrait_url}
                      alt={p.name}
                      className="w-full aspect-square object-cover rounded-xl border border-[#1e293b] group-hover:border-[#a78bfa]/40 transition-colors"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-[#1e293b] flex items-center justify-center text-[#334155] text-xs">
                      Failed
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-[10px] text-white font-semibold truncate">{p.name}</p>
                    <p className="text-[9px] text-[#94a3b8]">{p.archetype}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {botPersonas.length > 0 && (
              <button
                onClick={saveToPersonas}
                disabled={saving || saved}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  saved
                    ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30'
                    : 'bg-[#00d4aa] text-[#070b14] hover:bg-[#00d4aa]/90'
                } disabled:opacity-50`}
              >
                {saved ? <><CheckCircle size={14} /> Saved to Bot Personas</> : saving ? 'Saving...' : <><Download size={14} /> Save Portraits to Bot Personas</>}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}