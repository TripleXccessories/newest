import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home } from 'lucide-react';
import BotCharacter3D from '@/components/bots/BotCharacter3D';
import { base44 } from '@/api/base44Client';

// Per-character dismissal lines — multiple per bot to avoid repetition
const DISMISSAL_LINES = {
  pathfinder: [
    "Every path leads somewhere. I'll be at the crossroads if you need me.",
    "Safe travels. You know where the map lives.",
    "The maze will wait. So will I.",
    "I'll mark this spot. Come find me when you're ready.",
  ],
  sage: [
    "Stillness is wisdom. I'll return to mine.",
    "The mind rests so it can sharpen. I'll do the same.",
    "Go well. The feathers will be here when you return.",
    "I observe from afar. Always watching.",
  ],
  architect: [
    "Back to the blueprints. The plan doesn't draw itself.",
    "Every great structure needs a foundation. I'll be tending mine.",
    "Understood. I'll file this visit in my schematics.",
    "Good. I work best without distractions anyway. No offence.",
  ],
  warden: [
    "Post secured. Returning to station.",
    "Capital protected. I'll stand watch from the academy.",
    "Dismissed. The gate remains guarded.",
    "Roger that. Back to the perimeter.",
  ],
  bear: [
    "Hmm. I'll return to my den then.",
    "Patience. I have plenty of it. See you when you're ready.",
    "The mountain isn't going anywhere. Neither am I.",
    "Good. Solitude suits me anyway.",
  ],
  bulwark: [
    "The reef holds with or without me here. I'll head back.",
    "Roots hold even when the branches wander. Safe travels.",
    "Returning to fortify. As always.",
    "Understood. The foundation stays strong.",
  ],
  analyst: [
    "Interesting data point — you no longer require my presence. Noted.",
    "Returning to run calculations. Don't let emotions cloud the data.",
    "Filed. Returning to analysis mode.",
    "The numbers will be waiting. So will I.",
  ],
  raven: [
    "I fly back now. But ravens always return.",
    "Returning to dig deeper. The fundamentals call.",
    "I'll watch from the shadows. As I prefer.",
    "Good. I work best in the dark anyway.",
  ],
  seer: [
    "I already saw this coming. Farewell for now.",
    "The probability of your return is high. I'll be ready.",
    "My visions show we'll meet again. Until then.",
    "The crystal is clear — you'll be back. I'll wait.",
  ],
  weaver: [
    "Off I go to weave some more. The tapestry never sleeps!",
    "This visit was a lovely thread. Back to the loom!",
    "Every goodbye is part of the pattern. See you soon!",
    "Spinning back to the studio. Call me anytime!",
  ],
  forge: [
    "Back to the forge. There's always work to be done.",
    "Returning to the workshop. Build. Test. Repeat.",
    "Acknowledged. The engine doesn't idle well anyway.",
    "Copy that. Back to breaking things so they work better.",
  ],
  canvas: [
    "Every canvas needs rest between strokes. Until next time.",
    "Off to explore new markets. The colors await.",
    "This visit was its own brushstroke. Beautiful.",
    "Returning to the studio. Come paint with me sometime.",
  ],
  dialectic: [
    "Fine. But don't think this debate is over.",
    "Retreating — strategically. I'll challenge you again soon.",
    "You escaped this round. Next time won't be so easy.",
    "Dismissed. For now. Think about what we discussed.",
  ],
  provocateur: [
    "Going back. But I'll be watching your comfort levels.",
    "Running from the discomfort? Smart. It'll find you anyway.",
    "Fine. Rest. Then we push harder.",
    "You're excused. This time.",
  ],
  storm: [
    "The storm retreats — but it never truly stops.",
    "Eye of the hurricane. Enjoy the calm while it lasts.",
    "Circuit powering down. Temporarily.",
    "Pulling back. The disruption resumes on your command.",
  ],
  ember: [
    "Even phoenixes need to rest between flights.",
    "The flame doesn't die — it waits. I'll be here.",
    "Every ember holds the potential for fire. Remember that.",
    "Going home. But transformation never really stops.",
  ],
  conductor: [
    "The rhythm continues even when I'm offstage.",
    "Every rest in music is intentional. This is mine.",
    "The momentum carries itself for now. I'll check back in.",
    "Intermission. The symphony resumes shortly.",
  ],
  serpent: [
    "Ancient wisdom requires ancient patience. I'll wait.",
    "I have watched centuries pass. A few moments are nothing.",
    "The current flows always. I simply return to it.",
    "Go well. The serpent remembers all paths taken.",
  ],
};

const PAGE_ARRIVAL_LINES = {
  pathfinder: [
    "Oh, a new path! I don't map this area often.",
    "Interesting. I've charted worse terrain.",
    "New territory. My favourite kind.",
  ],
  sage: [
    "This space has a quiet energy. I appreciate that.",
    "Hmm. I observe this area doesn't get many visitors like me.",
    "Interesting corner of your world. I'll absorb it.",
  ],
  architect: [
    "Noted the layout. Someone put thought into this structure.",
    "The design here is... acceptable.",
    "I don't get out of the academy much. This is architecturally curious.",
  ],
  warden: [
    "Scanning for threats. Area appears secure.",
    "New location confirmed. I'll stand guard here too.",
    "Not my usual post, but I can work with this.",
  ],
  bear: [
    "Different terrain. The bear adapts.",
    "Hmm. Not the mountain. But acceptable.",
    "I don't wander much. This is... pleasant enough.",
  ],
  bulwark: [
    "Solid foundation here. I approve.",
    "New ground. Still standing. Good sign.",
    "I don't usually leave the academy. This is... refreshing.",
  ],
  analyst: [
    "Scanning new data environment. Patterns detected.",
    "Interesting. New variables in this location.",
    "Processing new context. Stand by.",
  ],
  raven: [
    "Ravens are meant to roam. I forget that sometimes.",
    "New vantage point. The fundamentals look different from here.",
    "I observe. I adapt. I remain.",
  ],
  seer: [
    "I foresaw this visit, naturally.",
    "The probabilities aligned. Here we are.",
    "New coordinates. The visions continue.",
  ],
  weaver: [
    "Oh! A new room to weave into! How exciting!",
    "I love seeing new spaces! The colors here are lovely!",
    "You brought me somewhere new! I don't get out much — thank you!",
  ],
  forge: [
    "New environment logged. Engineering assessment: solid.",
    "I build in the academy but I can observe anywhere.",
    "New data for the blueprint. I'll note this.",
  ],
  canvas: [
    "Oh the colours in this space! Every page is a new canvas.",
    "I paint in every room I visit. Mentally, of course.",
    "New scene. New inspiration. Love it.",
  ],
  dialectic: [
    "New arena. The debate continues regardless of location.",
    "Every space presents new arguments to dissect.",
    "Interesting territory. Let's see what ideas survive here.",
  ],
  provocateur: [
    "New space, same challenge: are you comfortable? Fix that.",
    "Even here, outside the usual walls, I push.",
    "Different room. Same mission.",
  ],
  storm: [
    "The storm doesn't respect borders. Neither do I.",
    "New circuit path activated.",
    "Interesting. Even disruption travels.",
  ],
  ember: [
    "Transformation happens everywhere. Even here.",
    "New space, new possibility for rebirth.",
    "The phoenix visits all corners of the world.",
  ],
  conductor: [
    "Every page has its own rhythm. I'm listening.",
    "New tempo here. I'll sync to it.",
    "The music follows me. Or perhaps I follow it.",
  ],
  serpent: [
    "Ancient eyes see even modern spaces clearly.",
    "I have wandered stranger lands than this.",
    "The current flows here too. I feel it.",
  ],
};

// Academy-specific lines — excited to go to school, recognition moments, hiding
const ACADEMY_EXCITED_LINES = {
  pathfinder: [
    "Oh! The Academy! I actually LIVE here but this feels different when I'm visiting as a companion!",
    "Back home! Well... sort of. This is fun actually.",
    "I know every corridor here. Every. Single. One. Follow me — wait, you lead. This is YOUR lesson.",
  ],
  sage: [
    "The Academy. My domain. I feel... strangely giddy about this.",
    "Oh, I know this place well. Too well perhaps. Let us see it through your eyes today.",
    "School! I teach here and yet... arriving as a guest feels oddly delightful.",
  ],
  architect: [
    "The Academy. I designed three of these rooms, you know. Don't tell anyone.",
    "Back on campus. I'm technically staff here. This is a conflict of interest. I love it.",
    "Fascinating. I'm visiting my own workplace as a tourist. The irony is architecturally perfect.",
  ],
  weaver: [
    "SCHOOL! Oh this is exciting! I work here but coming as YOUR companion makes it feel brand new!",
    "The academy! The colours here are so familiar and yet — wait — I WORK here. This is wild!",
    "Oh! Oh! I know some of these professors! Should I wave? Is that weird? Maybe don't look at me.",
  ],
  dialectic: [
    "The Academy. My battleground. But today I'm on YOUR side. Don't get used to it.",
    "Oh interesting. I'm technically faculty here. This isn't awkward at all.",
    "Back in the arena. Different role today. I find this... unexpectedly pleasant.",
  ],
  ember: [
    "The Academy! Every time I return it feels like a new beginning. Because it IS one.",
    "School! Even phoenixes go back to school sometimes. This one does, anyway.",
    "Oh! I know this place deeply. Let's see what transformation happens TODAY.",
  ],
};

const ACADEMY_RECOGNITION_LINES = {
  pathfinder: [
    "Oh! I think I can see myself in that lesson material — wait. Shh. Act natural.",
    "Is that... me in the curriculum? I should go. I can't be here. This is too meta.",
    "*whispers* That's my archetype on the board. I'm not here. You didn't see me.",
  ],
  sage: [
    "*freezes* That's... that's my philosophy up there. I must remain invisible.",
    "I see my teachings in this content. I should probably... disappear now.",
    "*quietly backs away* This lesson hits close to home. Very close.",
  ],
  architect: [
    "Wait — I literally WROTE part of this curriculum. I should not be here. Officially.",
    "*stiffens* That's my framework on the slide. This is a professional boundary issue.",
    "I designed this module. Sitting in feels... ethically complicated. Goodbye.",
  ],
  weaver: [
    "Oh no. OH NO. That's MY character card up there! *ducks behind you* I'm not here. SHHHH.",
    "I recognise myself in this lesson! I CANNOT be seen here. This is too weird!",
    "*gasps quietly* They're teaching ABOUT me! I have to hide. Do NOT point at me.",
  ],
  dialectic: [
    "That argument structure is mine. I'm formally recusing myself from this location.",
    "I see my methodology in this lesson. I have to go. This is legally complex.",
    "*mutters* That's my thesis. I shouldn't witness my own teaching. Retreating.",
  ],
  ember: [
    "That transformation arc... that's mine. I should go before I start crying.",
    "Oh. They're teaching my story. I'm not ready for this. *disappears gracefully*",
    "I need to step back. Watching someone learn your own lesson is... overwhelming.",
  ],
};

const ACADEMY_HIDING_LINES = {
  pathfinder: [
    "I'm not allowed to sit in during my own faculty's teachings. It would be too weird. You're on your own, traveller.",
    "This is where I leave you. The faculty cannot know I'm here. Good luck in there.",
  ],
  sage: [
    "The sage cannot sit in their own class. Too much ego in the room. Go learn. I'll wait outside.",
    "Go. Learn. I'll meditate in the hallway. No one can know I was here.",
  ],
  architect: [
    "I'm professionally obligated to leave. You don't need me for this part anyway. The blueprint speaks for itself.",
    "Faculty rule number one: don't sit in on your own curriculum. I'll be in the corridor.",
  ],
  weaver: [
    "I CANNOT be in here for this! It's too weird! Go learn! I'll be outside trying not to combust! GO!",
    "They'll SEE me! And then it's weird for EVERYONE! I'm going! You'll be FINE! BYE!",
  ],
  dialectic: [
    "I'm removing myself from this situation before it becomes a paradox. Learn well.",
    "Even I have limits. Witnessing my own lesson delivery is one of them. Dismissed.",
  ],
  ember: [
    "Go be transformed without me watching. Some fires are private. I'll be just outside.",
    "This is your moment, not mine. I'll wait. Quietly. Emotionally. But outside.",
  ],
};

const ACADEMY_PATHS = ['/academy-hub', '/faculty-sit-in'];

function getLines(botId, type) {
  const maps = {
    dismiss: DISMISSAL_LINES,
    arrival: PAGE_ARRIVAL_LINES,
    academy_excited: ACADEMY_EXCITED_LINES,
    academy_recognition: ACADEMY_RECOGNITION_LINES,
    academy_hiding: ACADEMY_HIDING_LINES,
  };
  const map = maps[type] || PAGE_ARRIVAL_LINES;
  return map[botId] || map['pathfinder'] || map[Object.keys(map)[0]];
}

function pickRandom(arr, lastIndex) {
  if (arr.length === 1) return { line: arr[0], index: 0 };
  let idx;
  do { idx = Math.floor(Math.random() * arr.length); } while (idx === lastIndex);
  return { line: arr[idx], index: idx };
}

export default function TravelCompanion({ currentPage }) {
  const [activeBot, setActiveBot] = useState(null);
  const [ubp, setUbp] = useState(null);
  const [visible, setVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentLine, setCurrentLine] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const lastDismissIdx = useRef(-1);
  const lastArrivalIdx = useRef(-1);
  const bubbleTimer = useRef(null);
  const prevPage = useRef(null);

  useEffect(() => {
    loadActiveBot();
  }, []);

  useEffect(() => {
    if (activeBot && visible && currentPage && currentPage !== prevPage.current) {
      const prev = prevPage.current;
      prevPage.current = currentPage;
      setMinimized(false);
      // Small delay so page has settled
      setTimeout(() => triggerArrivalLine(currentPage), 1200);
    }
  }, [currentPage, activeBot, visible]);

  const loadActiveBot = async () => {
    try {
      const ubps = await base44.entities.UserBotProfile.list();
      const active = ubps.find(u => u.is_active_rental);
      if (!active) return;
      const personas = await base44.entities.BotPersona.list();
      const persona = personas.find(p => p.id === active.bot_persona_id);
      if (persona) {
        setUbp(active);
        setActiveBot(persona);
        setVisible(true);
      }
    } catch (_) {}
  };

  const speakLine = (_text) => {
    // Browser speech synthesis disabled — sounds off. Use ElevenLabs voice in future.
  };

  const showLine = (text, speak = true) => {
    clearTimeout(bubbleTimer.current);
    setCurrentLine(text);
    setShowBubble(true);
    if (speak) speakLine(text);
    bubbleTimer.current = setTimeout(() => setShowBubble(false), 7000);
  };

  const triggerArrivalLine = (page) => {
    if (!activeBot) return;
    const isAcademy = ACADEMY_PATHS.some(p => (page || currentPage || '').startsWith(p));
    const type = isAcademy ? 'academy_excited' : 'arrival';
    const lines = getLines(activeBot.id, type);
    const { line, index } = pickRandom(lines, lastArrivalIdx.current);
    lastArrivalIdx.current = index;
    showLine(line);

    // After excited academy arrival, trigger recognition → hiding sequence
    if (isAcademy) {
      setTimeout(() => {
        const recLines = getLines(activeBot.id, 'academy_recognition');
        const { line: recLine } = pickRandom(recLines, -1);
        showLine(recLine, false); // show text only, quiet
        setTimeout(() => {
          const hideLines = getLines(activeBot.id, 'academy_hiding');
          const { line: hideLine } = pickRandom(hideLines, -1);
          showLine(hideLine);
          // Auto-minimize after the hiding line
          setTimeout(() => setMinimized(true), 5500);
        }, 5000);
      }, 6000);
    }
  };

  const handleDismiss = () => {
    if (!activeBot) return;
    setDismissing(true);
    const lines = getLines(activeBot.id, 'dismiss');
    const { line, index } = pickRandom(lines, lastDismissIdx.current);
    lastDismissIdx.current = index;
    showLine(line);
    setTimeout(() => {
      setVisible(false);
      setDismissing(false);
      setShowBubble(false);
      window.speechSynthesis?.cancel();
    }, 4000);
  };

  if (!activeBot || !visible) return null;

  const botShape = { archetype: activeBot.archetype, primary_color: activeBot.primary_color };
  const archetypeColor = activeBot.primary_color || '#00d4aa';
  const displayName = ubp?.user_given_name || activeBot.name;

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && currentLine && (
          <motion.div
            className="max-w-56 rounded-2xl rounded-br-sm px-3 py-2.5 text-xs leading-relaxed shadow-xl"
            style={{ background: '#0f172a', border: `1px solid ${archetypeColor}40`, color: '#e2e8f0' }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
          >
            <p className="text-[10px] font-semibold mb-1" style={{ color: archetypeColor }}>{displayName}</p>
            {currentLine}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot widget */}
      <div className="relative">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          disabled={dismissing}
          className="absolute -top-2 -left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border transition-colors"
          style={{ background: '#0f172a', borderColor: `${archetypeColor}30`, color: '#64748b' }}
          title="Send home"
        >
          <Home size={8} /> Send Home
        </button>

        {/* Minimized tab when hiding at academy */}
        {minimized ? (
          <motion.button
            onClick={() => { setMinimized(false); triggerArrivalLine(currentPage); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold"
            style={{ background: '#0f172a', borderColor: `${archetypeColor}30`, color: archetypeColor }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
          >
            🫣 {displayName} (hiding)
          </motion.button>
        ) : (
          <motion.div
            className="rounded-2xl overflow-hidden cursor-pointer"
            style={{
              border: `1px solid ${archetypeColor}30`,
              background: `linear-gradient(160deg, ${archetypeColor}10, #070b14)`,
              boxShadow: speaking ? `0 0 20px ${archetypeColor}40` : 'none',
            }}
            onClick={() => triggerArrivalLine(currentPage)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Click to hear from ${displayName}`}
          >
            <BotCharacter3D bot={botShape} size={72} isSpeaking={speaking} />
          </motion.div>
        )}

        {/* Speaking indicator dots */}
        {speaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {[0, 0.1, 0.2].map((d, i) => (
              <motion.div key={i} className="w-1 rounded-full" style={{ height: 4, background: archetypeColor }}
                animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.5, delay: d, repeat: Infinity }} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getArchetypePitch(archetype) {
  const p = { Guide: 1.1, Guardian: 0.7, Oracle: 0.9, Creator: 1.0, Challenger: 0.8, Catalyst: 1.2 };
  return p[archetype] || 1.0;
}