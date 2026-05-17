import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, CheckCircle, Shuffle, Check, X } from 'lucide-react';
// No archetype fallback — each bot must have its own avatar_url (trademark assets, permanent, uneditable)

// Personality-matched name pools per archetype and gender
const NAME_POOLS = {
  Guide: {
    M: ['Atlas', 'Orion', 'Sage', 'Milo', 'Caden', 'Archer', 'Nash', 'Finn', 'Reid', 'Dex'],
    F: ['Aurora', 'Lyra', 'Iris', 'Mara', 'Wren', 'Nora', 'Sage', 'Celeste', 'Sable', 'Rue'],
    X: ['Soleil', 'Nimbus', 'Quill', 'Vesper', 'Coda', 'Reef', 'Lumen', 'Zephyr', 'Aero', 'Echo'],
  },
  Oracle: {
    M: ['Cipher', 'Rune', 'Axiom', 'Locus', 'Vael', 'Seren', 'Calix', 'Theron', 'Dusk', 'Faro'],
    F: ['Prism', 'Luna', 'Nyx', 'Selene', 'Reverie', 'Lyra', 'Cassia', 'Veda', 'Sybil', 'Zara'],
    X: ['Arcana', 'Nexus', 'Prisma', 'Omen', 'Flux', 'Relic', 'Zenith', 'Aura', 'Null', 'Vertex'],
  },
  Guardian: {
    M: ['Titan', 'Bastion', 'Warden', 'Stone', 'Rex', 'Draven', 'Arlo', 'Magnus', 'Crest', 'Holt'],
    F: ['Vale', 'Terra', 'Brynn', 'Lexa', 'Kova', 'Rhea', 'Senna', 'Haven', 'Zia', 'Cael'],
    X: ['Bulwark', 'Anchor', 'Pillar', 'Citadel', 'Rampart', 'Shield', 'Ark', 'Brace', 'Helm', 'Veil'],
  },
  Creator: {
    M: ['Loom', 'Canvas', 'Reed', 'Colt', 'Wick', 'Juno', 'Pike', 'Fen', 'Crest', 'Sable'],
    F: ['Nova', 'Ember', 'Lace', 'Wren', 'Blythe', 'Seraph', 'Vesper', 'Cleo', 'Fern', 'Juno'],
    X: ['Mosaic', 'Weave', 'Motif', 'Filament', 'Draft', 'Sketch', 'Palette', 'Glyph', 'Stitch', 'Arc'],
  },
  Challenger: {
    M: ['Blade', 'Vex', 'Raze', 'Dagger', 'Colt', 'Volt', 'Rook', 'Shard', 'Kane', 'Grit'],
    F: ['Lyric', 'Vex', 'Storm', 'Blaze', 'Reva', 'Kira', 'Zara', 'Rune', 'Cass', 'Vex'],
    X: ['Circuit', 'Surge', 'Disrupt', 'Fracture', 'Break', 'Clash', 'Fault', 'Apex', 'Breach', 'Rift'],
  },
  Catalyst: {
    M: ['Phoenix', 'Blaze', 'Flux', 'Surge', 'Cinder', 'Volt', 'Arc', 'Comet', 'Ignis', 'Flint'],
    F: ['Ember', 'Soleil', 'Nova', 'Lyra', 'Seraph', 'Aura', 'Celeste', 'Blaze', 'Ignis', 'Sear'],
    X: ['Kinetic', 'Pulse', 'Dynamo', 'Ignite', 'Catalyst', 'Surge', 'Radiant', 'Jolt', 'Crest', 'Fuse'],
  },
};

function getNamePool(archetype, gender) {
  const pool = NAME_POOLS[archetype] || NAME_POOLS.Guide;
  return pool[gender] || pool.X;
}

function pickRandomName(archetype, gender, currentName) {
  const pool = getNamePool(archetype, gender);
  const filtered = pool.filter(n => n !== currentName);
  return filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
}

export default function BotCharacterCard({ bot, ubp, isSelected, onSelect, onRent, archetypeColor, onSaveName }) {
  const [speaking, setSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [showNameGen, setShowNameGen] = useState(false);
  const [nameGender, setNameGender] = useState('X');
  const [draftName, setDraftName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const utteranceRef = useRef(null);

  const isRented = !!ubp?.is_active_rental;
  const botDisplayName = ubp?.user_given_name || bot.name;

  useEffect(() => {
    if (isSelected && audioEnabled && !greeted) {
      speakGreeting();
      setGreeted(true);
    }
    if (!isSelected) {
      stopSpeaking();
      setGreeted(false);
    }
  }, [isSelected, audioEnabled]);

  useEffect(() => {
    if (showNameGen) setDraftName(ubp?.user_given_name || '');
  }, [showNameGen]);

  const speakGreeting = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const greeting = isRented && ubp?.call_me_as
      ? `Welcome back, ${ubp.call_me_as}. ${bot.default_greeting || bot.signature_line || "Good to see you again."}`
      : bot.default_greeting || bot.signature_line || `Greetings, stranger. I am ${bot.name}.`;
    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.rate = 0.9;
    utterance.pitch = getArchetypePitch(bot.archetype);
    utterance.volume = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const toggleAudio = (e) => {
    e.stopPropagation();
    if (audioEnabled) {
      stopSpeaking();
      setAudioEnabled(false);
      setGreeted(false);
    } else {
      setAudioEnabled(true);
      if (isSelected) setTimeout(() => { speakGreeting(); setGreeted(true); }, 100);
    }
  };

  const handleRandomName = (e) => {
    e.stopPropagation();
    setDraftName(pickRandomName(bot.archetype, nameGender, draftName));
  };

  const handleSaveName = async (e) => {
    e.stopPropagation();
    if (!draftName.trim() || !onSaveName) return;
    setSavingName(true);
    await onSaveName(bot, draftName.trim());
    setSavingName(false);
    setShowNameGen(false);
    if (audioEnabled) {
      setTimeout(() => {
        const utt = new SpeechSynthesisUtterance(`${draftName}... I like it. That name suits me.`);
        utt.rate = 0.88; utt.pitch = getArchetypePitch(bot.archetype); utt.volume = 0.9;
        utt.onstart = () => setSpeaking(true); utt.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(utt);
      }, 300);
    }
  };

  // botShape kept for reference but portrait replaces 3D render

  return (
    <motion.div
      onClick={onSelect}
      className="relative rounded-2xl border cursor-pointer transition-all overflow-hidden"
      style={{
        borderColor: isSelected ? archetypeColor : `${archetypeColor}25`,
        background: isSelected ? `linear-gradient(160deg, ${archetypeColor}15, #0f172a)` : '#111827',
        boxShadow: isSelected ? `0 0 24px ${archetypeColor}30` : 'none',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Rented badge */}
      {isRented && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: `${archetypeColor}30`, color: archetypeColor }}>
          <CheckCircle size={9} /> Rented
        </div>
      )}

      {/* Audio toggle */}
      <button onClick={toggleAudio}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
        style={{ background: audioEnabled ? `${archetypeColor}30` : '#1e293b' }}>
        {audioEnabled ? <Volume2 size={12} style={{ color: archetypeColor }} /> : <VolumeX size={12} className="text-[#475569]" />}
      </button>

      {/* Character Portrait */}
      <div className="flex justify-center pt-4 pb-2 relative">
        <div className="relative">
          <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden border-2 transition-all"
            style={{ borderColor: isSelected ? archetypeColor : `${archetypeColor}40` }}>
            {bot.avatar_url ? (
              <img
                src={bot.avatar_url}
                alt={bot.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black"
                style={{ background: `${archetypeColor}20`, color: archetypeColor }}>
                {bot.name?.charAt(0)}
              </div>
            )}
          </div>
          {speaking && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
              {[0, 0.1, 0.2].map((d, i) => (
                <motion.div key={i} className="w-1 rounded-full" style={{ height: 6, background: archetypeColor }}
                  animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.5, delay: d, repeat: Infinity }} />
              ))}
            </div>
          )}
          {/* Travel glow — character "comes alive" outside the card only when selected */}
          {isSelected && (
            <motion.div
              className="absolute -inset-3 rounded-3xl pointer-events-none z-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ boxShadow: `0 0 40px ${archetypeColor}70, 0 0 80px ${archetypeColor}30` }}
            />
          )}
        </div>
      </div>

      {/* Bot info */}
      <div className="px-4 pb-4 space-y-2">
        <div>
          <p className="text-sm font-bold text-[#f1f5f9] truncate">{botDisplayName}</p>
          {ubp?.user_given_name && ubp.user_given_name !== bot.name && (
            <p className="text-[10px] text-[#475569]">"{bot.name}"</p>
          )}
          <p className="text-[10px] mt-0.5" style={{ color: archetypeColor }}>{bot.role_title || bot.school}</p>
        </div>

        <p className="text-[11px] text-[#64748b] leading-relaxed line-clamp-2 italic">
          "{bot.signature_line || bot.school_tagline}"
        </p>

        {speaking && (
          <div className="flex items-center gap-1.5">
            {[0, 0.1, 0.2].map((d, i) => (
              <motion.div key={i} className="w-1 rounded-full" style={{ height: 8, background: archetypeColor }}
                animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.5, delay: d, repeat: Infinity }} />
            ))}
            <span className="text-[10px]" style={{ color: archetypeColor }}>speaking...</span>
          </div>
        )}

        {/* Name Generator — inline when selected */}
        <AnimatePresence>
          {showNameGen && isSelected && (
            <motion.div
              onClick={e => e.stopPropagation()}
              className="rounded-xl border p-3 space-y-2"
              style={{ borderColor: `${archetypeColor}30`, background: '#0f172a' }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <p className="text-[10px] font-semibold" style={{ color: archetypeColor }}>Name Generator</p>
              {/* Gender filter */}
              <div className="flex gap-1 items-center">
                {[['M', '♂'], ['F', '♀'], ['X', '✦']].map(([g, sym]) => (
                  <button key={g} onClick={() => { setNameGender(g); setDraftName(pickRandomName(bot.archetype, g, draftName)); }}
                    className="w-8 h-7 rounded-lg text-xs font-bold border transition-all"
                    style={{
                      borderColor: nameGender === g ? archetypeColor : '#1e293b',
                      background: nameGender === g ? `${archetypeColor}20` : '#111827',
                      color: nameGender === g ? archetypeColor : '#475569',
                    }}>
                    {sym}
                  </button>
                ))}
                <span className="text-[9px] text-[#334155] ml-1">M · F · Non-binary</span>
              </div>
              {/* Name input + shuffle */}
              <div className="flex gap-1">
                <input
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  placeholder="Bot name..."
                  className="flex-1 bg-[#070b14] border border-[#1e293b] rounded-lg px-2 py-1.5 text-xs text-[#f1f5f9] placeholder-[#334155] focus:outline-none"
                  style={{ '--border-focus': archetypeColor }}
                />
                <button onClick={handleRandomName}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                  <Shuffle size={11} />
                </button>
              </div>
              <div className="flex gap-1">
                <button onClick={handleSaveName} disabled={!draftName.trim() || savingName}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition-all"
                  style={{ background: archetypeColor, color: '#070b14' }}>
                  <Check size={10} /> {savingName ? 'Saving...' : 'Confirm Name'}
                </button>
                <button onClick={e => { e.stopPropagation(); setShowNameGen(false); }}
                  className="w-8 flex items-center justify-center rounded-lg border border-[#1e293b] text-[#475569] hover:text-[#f1f5f9]">
                  <X size={11} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-1.5 mt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onRent(); }}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: isRented ? `${archetypeColor}20` : archetypeColor,
              color: isRented ? archetypeColor : '#070b14',
              border: isRented ? `1px solid ${archetypeColor}40` : 'none',
            }}>
            {isRented ? <span className="flex items-center justify-center gap-1"><Sparkles size={11} /> Manage</span> : 'Select'}
          </button>
          {isSelected && (
            <button
              onClick={e => { e.stopPropagation(); setShowNameGen(v => !v); }}
              className="px-2.5 py-2 rounded-xl border text-[10px] font-semibold transition-all"
              style={{
                borderColor: showNameGen ? archetypeColor : `${archetypeColor}30`,
                color: showNameGen ? archetypeColor : '#64748b',
                background: showNameGen ? `${archetypeColor}10` : 'transparent',
              }}
              title="Name Generator">
              ✦ Name
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getArchetypePitch(archetype) {
  const pitches = { Guide: 1.1, Guardian: 0.7, Oracle: 0.9, Creator: 1.0, Challenger: 0.8, Catalyst: 1.2 };
  return pitches[archetype] || 1.0;
}