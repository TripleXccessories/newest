import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Shuffle, Check, Sparkles, User } from 'lucide-react';

const ARCHETYPE_PORTRAITS = {
  Guide: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/16ddb538b_generated_image.png',
  Oracle: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/03989c191_generated_image.png',
  Challenger: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/21b63b39e_generated_image.png',
  Catalyst: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/3cb8781e5_generated_image.png',
  Guardian: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/5e8bab449_generated_image.png',
  Creator: 'https://media.base44.com/images/public/69f32f995f3699f6d15704df/a287533f7_generated_image.png',
};

const RANDOM_NAMES_M = ['Atlas', 'Titan', 'Cipher', 'Vortex', 'Raven', 'Apex', 'Orion', 'Nexus', 'Draven', 'Blaze'];
const RANDOM_NAMES_F = ['Nova', 'Luna', 'Sage', 'Echo', 'Iris', 'Lyra', 'Zara', 'Ember', 'Seraph', 'Aura'];
const RANDOM_NAMES_X = ['Flux', 'Prism', 'Zenith', 'Arc', 'Quill', 'Soleil', 'Reef', 'Coda', 'Vesper', 'Nimbus'];

export default function BotDetailModal({ bot, ubp, userNickname, archetypeColor, onClose, onConfirmRental, onSaveNames }) {
  const [step, setStep] = useState(ubp?.is_active_rental ? 'manage' : 'preview'); // preview | agree | name | manage
  const [speaking, setSpeaking] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [botName, setBotName] = useState(ubp?.user_given_name || '');
  const [nameGender, setNameGender] = useState('?');
  const [saving, setSaving] = useState(false);
  const greetedRef = useRef(false);

  useEffect(() => {
    if (audioOn && !greetedRef.current) {
      greetedRef.current = true;
      speakLine(
        ubp?.is_active_rental && ubp?.call_me_as
          ? `Welcome back, ${ubp.call_me_as}. Ready to continue your journey?`
          : bot.default_greeting || bot.signature_line || `Greetings, stranger. I am ${bot.name}. I don't know you yet — but perhaps we can change that.`
      );
    }
    return () => window.speechSynthesis?.cancel();
  }, [audioOn]);

  const speakLine = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88; utt.pitch = getArchetypePitch(bot.archetype); utt.volume = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const randomizeName = () => {
    const pool = nameGender === 'M' ? RANDOM_NAMES_M : nameGender === 'F' ? RANDOM_NAMES_F : RANDOM_NAMES_X;
    setBotName(pool[Math.floor(Math.random() * pool.length)]);
  };

  const handleSaveNames = async () => {
    setSaving(true);
    await onSaveNames({ user_given_name: botName });
    setSaving(false);
    setStep('manage');
    speakLine(`${botName}... I like it. And I'll call you ${userNickname || 'friend'} from now on. Our journey begins.`);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden z-10"
        style={{ background: `linear-gradient(160deg, #0f172a, #070b14)`, border: `1px solid ${archetypeColor}40` }}
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      >
        {/* Ambient glow top */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: archetypeColor }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${archetypeColor}20`, color: archetypeColor }}>
              {bot.archetype}
            </span>
            <p className="text-sm text-[#64748b]">{bot.school}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setAudioOn(v => !v); if (audioOn) window.speechSynthesis?.cancel(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: audioOn ? `${archetypeColor}25` : '#1e293b' }}>
              {audioOn ? <Volume2 size={14} style={{ color: archetypeColor }} /> : <VolumeX size={14} className="text-[#475569]" />}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9]">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Character display */}
        <div className="flex justify-center py-4 relative">
          <div className="relative">
            <div className="w-[160px] h-[160px] rounded-2xl overflow-hidden border-2"
              style={{ borderColor: `${archetypeColor}60`, boxShadow: `0 0 40px ${archetypeColor}25` }}>
              <img
                src={bot.avatar_url || ARCHETYPE_PORTRAITS[bot.archetype] || ARCHETYPE_PORTRAITS.Guide}
                alt={bot.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            {speaking && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {[0, 0.1, 0.2].map((d, i) => (
                  <motion.div key={i} className="w-1.5 rounded-full" style={{ height: 10, background: archetypeColor }}
                    animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.5, delay: d, repeat: Infinity }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bot name */}
        <div className="text-center px-6 pb-4">
          <h2 className="text-xl font-bold text-[#f1f5f9]">
            {ubp?.user_given_name || bot.name}
          </h2>
          {ubp?.user_given_name && ubp.user_given_name !== bot.name && (
            <p className="text-xs text-[#475569] mt-0.5">"{bot.name}"</p>
          )}
          <p className="text-sm text-[#64748b] mt-1 italic">"{bot.signature_line || bot.school_tagline}"</p>
          {speaking && (
            <div className="flex justify-center gap-1 mt-2">
              {[0, 0.1, 0.2].map((d, i) => (
                <motion.div key={i} className="w-1.5 rounded-full" style={{ height: 10, background: archetypeColor }}
                  animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.5, delay: d, repeat: Infinity }} />
              ))}
            </div>
          )}
        </div>

        {/* Step content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">

            {step === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="bg-[#111827] rounded-2xl p-4 space-y-2 text-sm text-[#94a3b8] leading-relaxed">
                  <p>{bot.environment_desc || bot.reveal_desc || `${bot.name} is a ${bot.archetype} archetype from the School of ${bot.school}.`}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3">
                    <p className="text-[10px] text-[#475569] mb-1">School</p>
                    <p className="text-xs font-semibold text-[#f1f5f9]">{bot.school}</p>
                  </div>
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3">
                    <p className="text-[10px] text-[#475569] mb-1">Archetype</p>
                    <p className="text-xs font-semibold" style={{ color: archetypeColor }}>{bot.archetype}</p>
                  </div>
                </div>
                <button onClick={() => setStep('agree')}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ background: archetypeColor, color: '#070b14' }}>
                  Begin Rental Agreement
                </button>
              </motion.div>
            )}

            {step === 'agree' && (
              <motion.div key="agree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="bg-[#0f172a] border rounded-2xl p-4 text-xs text-[#64748b] leading-relaxed space-y-2 max-h-40 overflow-y-auto"
                  style={{ borderColor: `${archetypeColor}20` }}>
                  <p className="text-[#f1f5f9] font-semibold">Bot Rental Agreement</p>
                  <p>By proceeding, you agree to a paper-trading bot rental. This bot operates on your virtual $100K balance only. No real funds are involved during the IINT Beta period.</p>
                  <p>This bot will remember your interactions, your preferred nickname, and your trading history. You may cancel at any time through Settings → My Bots.</p>
                  <p>Cancelling a rental preserves all name memories unless manually cleared in Settings.</p>
                </div>
                <button onClick={() => setStep('name')}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ background: archetypeColor, color: '#070b14' }}>
                  I Agree — Let's Get Acquainted
                </button>
              </motion.div>
            )}

            {step === 'name' && (
              <motion.div key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-[#94a3b8] text-center">Give this bot a name. This is how you'll know them.</p>

                {/* Gender selector for random names */}
                <div className="flex gap-2 justify-center">
                  {['M', 'F', '?'].map(g => (
                    <button key={g} onClick={() => setNameGender(g)}
                      className="w-9 h-9 rounded-full text-sm font-bold border transition-all"
                      style={{
                        borderColor: nameGender === g ? archetypeColor : '#1e293b',
                        background: nameGender === g ? `${archetypeColor}20` : '#111827',
                        color: nameGender === g ? archetypeColor : '#475569',
                      }}>
                      {g}
                    </button>
                  ))}
                  <span className="text-[10px] text-[#475569] self-center ml-1">for random names</span>
                </div>

                <div className="flex gap-2">
                  <input value={botName} onChange={e => setBotName(e.target.value)}
                    placeholder="Name this bot..."
                    className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none"
                    style={{ '--tw-ring-color': archetypeColor }} />
                  <button onClick={randomizeName}
                    className="px-3 rounded-xl border border-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                    <Shuffle size={14} />
                  </button>
                </div>

                <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <User size={13} className="text-[#475569]" />
                  <p className="text-xs text-[#475569]">Bot will call you: <span className="text-[#94a3b8] font-semibold">{userNickname || '(set in Settings → Profile)'}</span></p>
                </div>

                <button onClick={handleSaveNames} disabled={!botName.trim() || saving}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background: archetypeColor, color: '#070b14' }}>
                  <Check size={14} /> {saving ? 'Confirming...' : 'Confirm & Activate Rental'}
                </button>
              </motion.div>
            )}

            {step === 'manage' && (
              <motion.div key="manage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="bg-[#0f172a] border rounded-2xl p-4 space-y-2" style={{ borderColor: `${archetypeColor}20` }}>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Bot Name</span>
                    <span className="text-[#f1f5f9] font-semibold">{ubp?.user_given_name || bot.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Calls You</span>
                    <span className="text-[#f1f5f9] font-semibold">{userNickname || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Status</span>
                    <span className="font-semibold" style={{ color: archetypeColor }}>Active Rental</span>
                  </div>
                </div>
                <button onClick={() => setStep('name')}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{ borderColor: `${archetypeColor}30`, color: archetypeColor, background: `${archetypeColor}08` }}>
                  <Sparkles size={12} className="inline mr-1" /> Edit Names
                </button>
                <p className="text-[10px] text-[#334155] text-center">To cancel rental, go to Settings → My Bots</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getArchetypePitch(archetype) {
  const pitches = { Guide: 1.1, Guardian: 0.7, Oracle: 0.9, Creator: 1.0, Challenger: 0.8, Catalyst: 1.2 };
  return pitches[archetype] || 1.0;
}