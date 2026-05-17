import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Send, CheckCircle, AlertTriangle, Loader2, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BotCharacter3D from '@/components/bots/BotCharacter3D';

const DIALOGUE_PROMPTS = [
  'Give me your most important trading lesson.',
  'What is the #1 mistake you see traders make?',
  'I want to set a trading goal. Can you help?',
  'Challenge me.',
];

// Faculty-specific sarcastic reactions to goals
const getSarcasticResponse = (facultyId, goal) => {
  const responses = {
    provocateur: [
      `Oh, ${goal}? *slow clap*. I've seen day-old bread with more ambition. But fine — if you're ACTUALLY committed, let's go.`,
      `You want to ${goal}? That's adorable. Truly. Now let me ask — are you ready to bleed for it, or just ready to post about it?`,
    ],
    storm: [
      `${goal}? I've stress-tested systems that would crush that goal in a Tuesday morning. You sure you're ready?`,
      `Interesting. Very interesting. I'm already calculating seven ways that goal fails. Wanna hear them? ...Actually, let's just see if you survive.`,
    ],
    dialectic: [
      `Your goal: "${goal}". My counterargument: prove it deserves to exist. What's your edge? What's your plan? Defend it or abandon it.`,
      `I've heard bolder goals from Grade 9 students. Debate me — why should I take this seriously?`,
    ],
    warden: [
      `"${goal}." First question: have you sized your risk accordingly? No? Then this goal is already failing. Let's fix that.`,
      `I don't do fluffy goals. I do systems. Tell me how you'll protect your capital while chasing this, or we're not having this conversation.`,
    ],
    forge: [
      `${goal}? Cute in theory. But has it been backtested? Has it been stress-tested? No? Then it's not a goal — it's a wish.`,
      `I build things that WORK. Let me tear this goal apart so we can rebuild it into something that actually survives contact with the market.`,
    ],
    analyst: [
      `Statistically speaking, ${goal} has... let me calculate... a non-trivial probability of failure if you haven't accounted for confluence. But the data is in your favor — if you're disciplined.`,
      `I've processed goals like this before. The ones who succeed? They track EVERYTHING. Are you ready to become a data point?`,
    ],
    serpent: [
      `I have watched empires chase goals like this. Most fell. A few... became legends. Which will you be?`,
      `In 4,000 years of watching wealth flow, I have learned: the goal rarely matters. The discipline behind it? That is everything.`,
    ],
    sage: [
      `Hmm. *tilts head* "${goal}." Do you WANT this, or do you just WANT to want it? Sit with that question before I accept.`,
      `Before I challenge you — what does your journal say about your last three failed goals? Patterns, dear student. Always patterns.`,
    ],
    pathfinder: [
      `Oh! A goal! I love goals. This one is... ambitious. Very ambitious. Maybe a little TOO ambitious? No — actually, let's map a route. If it exists, we can find it.`,
      `Every explorer sets goals that seem impossible. Then they take one step. Then another. Let's start with step one, shall we?`,
    ],
    ember: [
      `You want to ${goal}? *wings flicker* Every phoenix starts as ash. This goal? That's kindling. Let's see if you can burn bright enough.`,
      `Transformation requires discomfort. This goal will hurt before it heals. Still in?`,
    ],
  };
  const facultyResponses = responses[facultyId] || [
    `"${goal}"? Well. That's certainly a goal. Whether it's a GOOD goal... let's find out together.`,
    `Bold. I'll give you that. Whether it's achievable depends entirely on how seriously you take the challenge.`,
  ];
  return facultyResponses[Math.floor(Math.random() * facultyResponses.length)];
};

const getChallengeStatement = (facultyId, facultyName, goal) => {
  const statements = {
    provocateur: `CHALLENGE ACCEPTED. I, Da Maned Provocateur, am watching you. If you falter, I WILL call it out. If you succeed? Respect earned. Now move.`,
    storm: `Challenge registered. I'm going to throw disruptions at this goal until it breaks or until YOU prove it can't be broken. Welcome to the stress test.`,
    dialectic: `The argument has been made. The goal stands — for now. I expect weekly counter-arguments from reality. Defend it with RESULTS.`,
    warden: `Shield raised. I'm holding you to every rule while you chase this. No exceptions. No emotional overrides. The goal is set. The discipline is mandatory.`,
    forge: `Blueprint accepted. We build this goal the right way — with entry criteria, exit criteria, and performance tracking. No half measures.`,
    analyst: `Data point registered. I will be monitoring your progress metrics. Consistency is the variable that determines success. Do not deviate from your system.`,
    serpent: `So it is written. The current knows your intention now. Whether the waters carry you forward... that is up to you.`,
    sage: `Your goal is recorded in the hollow. The owl watches. When you feel like quitting — remember: patience is not doing nothing. It is waiting for YOUR moment.`,
    pathfinder: `The map is drawn! The route exists. Every step you take, I'm here to reorient if you get lost. Let's GO.`,
    ember: `CHALLENGE IGNITED. The fire is lit. Don't you dare let it go out.`,
  };
  return statements[facultyId] || `${facultyName} accepts your challenge. The Academy is watching. Prove it.`;
};

export default function FacultyDialogue({ faculty, user, onBack, onGoalCreated }) {
  const [phase, setPhase] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'faculty', text: faculty.tagline }
  ]);
  const [input, setInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [sarcasticResponse, setSarcasticResponse] = useState('');
  const [challengeStatement, setChallengeStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetDays, setTargetDays] = useState(30);

  // Build a minimal bot-persona-like object from faculty for 3D renderer
  const facultyAsBot = {
    archetype: faculty.archetype || 'Guide',
    primary_color: faculty.color || '#00d4aa',
    school: faculty.subject || 'Foundations',
    texture_map: faculty.portrait_url || null,
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${faculty.name} from IINT Academy. Your archetype is ${faculty.archetype} and you teach ${faculty.subject}. Your personality: "${faculty.tagline}". 

Respond to this student message in your character's voice — be authentic, educational, and use your specific teaching style. Keep it under 3 sentences. Be direct.

Student says: "${text}"`,
      });
      setMessages(m => [...m, { role: 'faculty', text: typeof res === 'string' ? res : res.response || 'Interesting question. Think on it.' }]);
    } catch {
      setMessages(m => [...m, { role: 'faculty', text: 'The signal was lost. Ask again, student.' }]);
    }
    setLoading(false);
  };

  const handleGoalSubmit = () => {
    if (!goalInput.trim()) return;
    const sarcasm = getSarcasticResponse(faculty.id, goalInput);
    const challenge = getChallengeStatement(faculty.id, faculty.name, goalInput);
    setSarcasticResponse(sarcasm);
    setChallengeStatement(challenge);
    setPhase('sarcasm');
  };

  const handleAcceptChallenge = async () => {
    setPhase('confirmed');
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + targetDays);
      await base44.entities.FacultyGoal.create({
        user_id: user?.id || 'unknown',
        faculty_id: faculty.id,
        faculty_name: faculty.name,
        goal_text: goalInput,
        sarcastic_response: sarcasticResponse,
        challenge_accepted: true,
        challenge_statement: challengeStatement,
        status: 'active',
        target_date: targetDate.toISOString().split('T')[0],
      });
      setTimeout(onGoalCreated, 1800);
    } catch (_) {}
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-sm font-bold text-[#f1f5f9]">{faculty.name}</p>
          <p className="text-xs" style={{ color: faculty.color }}>{faculty.archetype} · {faculty.subject}</p>
        </div>
      </div>

      {/* 3D Faculty Character */}
      <div className="flex justify-center">
        <BotCharacter3D
          bot={facultyAsBot}
          portraitUrl={faculty.portrait_url}
          isSpeaking={loading}
          size={140}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* PHASE: Chat */}
        {phase === 'chat' && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Messages */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={msg.role === 'faculty'
                      ? { background: `${faculty.color}12`, border: `1px solid ${faculty.color}25`, color: '#e2e8f0' }
                      : { background: '#1e293b', color: '#f1f5f9' }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl" style={{ background: `${faculty.color}12`, border: `1px solid ${faculty.color}25` }}>
                    <Loader2 size={14} className="animate-spin text-[#64748b]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2">
              {DIALOGUE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => p.includes('goal') ? setPhase('goal-input') : sendMessage(p)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{ background: `${faculty.color}12`, color: faculty.color, border: `1px solid ${faculty.color}25` }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder={`Ask ${faculty.name.split(' ').slice(-1)[0]}...`}
                className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none"
                style={{ '--focus-border': faculty.color }}
                onFocus={e => (e.target.style.borderColor = faculty.color)}
                onBlur={e => (e.target.style.borderColor = '#1e293b')}
              />
              <button
                onClick={() => sendMessage(input)}
                className="px-4 py-3 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: `${faculty.color}20`, color: faculty.color, border: `1px solid ${faculty.color}40` }}
              >
                <Send size={15} />
              </button>
            </div>

            <button
              onClick={() => setPhase('goal-input')}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{ background: `${faculty.color}20`, color: faculty.color, border: `1px solid ${faculty.color}40` }}
            >
              <Target size={15} /> Set a Goal with {faculty.name.split(' ').slice(-1)[0]}
            </button>
          </motion.div>
        )}

        {/* PHASE: Goal Input */}
        {phase === 'goal-input' && (
          <motion.div key="goal-input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-4 rounded-xl border" style={{ borderColor: `${faculty.color}30`, background: `${faculty.color}08` }}>
              <p className="text-xs font-bold mb-1" style={{ color: faculty.color }}>{faculty.name} says:</p>
              <p className="text-sm text-[#94a3b8] italic">
                "State your goal. Be specific. Be bold. I don't deal in vague intentions."
              </p>
            </div>

            <div>
              <label className="text-xs text-[#64748b] mb-2 block">Your Trading Goal</label>
              <textarea
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                placeholder="e.g. I will not revenge trade for 30 days. / I want to make 10% on my paper portfolio this month..."
                rows={4}
                className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none resize-none"
                onFocus={e => (e.target.style.borderColor = faculty.color)}
                onBlur={e => (e.target.style.borderColor = '#1e293b')}
              />
            </div>

            <div>
              <label className="text-xs text-[#64748b] mb-2 block">Target timeframe: <span style={{ color: faculty.color }}>{targetDays} days</span></label>
              <input
                type="range"
                min={7}
                max={90}
                value={targetDays}
                onChange={e => setTargetDays(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: faculty.color }}
              />
              <div className="flex justify-between text-xs text-[#475569] mt-1">
                <span>7 days</span><span>30 days</span><span>90 days</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPhase('chat')}
                className="flex-1 py-2.5 rounded-xl text-sm text-[#64748b] border border-[#1e293b] hover:border-[#475569] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGoalSubmit}
                disabled={!goalInput.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                style={{ background: faculty.color, color: '#070b14' }}
              >
                Present to Faculty
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE: Sarcasm */}
        {phase === 'sarcasm' && (
          <motion.div key="sarcasm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-5 rounded-xl border" style={{ borderColor: `${faculty.color}40`, background: `${faculty.color}08` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{faculty.emoji}</span>
                <p className="text-xs font-bold" style={{ color: faculty.color }}>{faculty.name} reacts:</p>
              </div>
              <p className="text-sm text-[#e2e8f0] leading-relaxed italic">"{sarcasticResponse}"</p>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
              <p className="text-xs text-[#64748b] mb-1">Your goal:</p>
              <p className="text-sm font-semibold text-[#f1f5f9]">{goalInput}</p>
              <p className="text-xs text-[#475569] mt-1">Target: {targetDays} days</p>
            </div>

            <p className="text-center text-xs text-[#64748b]">
              Still want to do this? Accept and it becomes a real challenge.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPhase('goal-input')}
                className="flex-1 py-2.5 rounded-xl text-sm text-[#64748b] border border-[#1e293b] hover:border-[#475569] transition-colors"
              >
                Revise Goal
              </button>
              <button
                onClick={() => setPhase('challenge')}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: `${faculty.color}`, color: '#070b14' }}
              >
                <Flame size={14} /> I Accept the Challenge
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE: Challenge Declaration */}
        {phase === 'challenge' && (
          <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-5 rounded-xl border-2" style={{ borderColor: faculty.color, background: `${faculty.color}08` }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} style={{ color: faculty.color }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: faculty.color }}>Challenge Declaration</p>
              </div>
              <p className="text-sm text-[#e2e8f0] leading-relaxed">"{challengeStatement}"</p>
            </div>

            <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0f172a] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748b]">Goal:</span>
                <span className="text-[#f1f5f9] font-semibold text-right max-w-[60%]">{goalInput}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748b]">Faculty:</span>
                <span style={{ color: faculty.color }}>{faculty.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748b]">Deadline:</span>
                <span className="text-[#f1f5f9]">{targetDays} days from today</span>
              </div>
            </div>

            <p className="text-xs text-center text-[#475569]">
              No matter how ridiculous the goal sounds — the faculty commits to guiding you through it.
            </p>

            <button
              onClick={handleAcceptChallenge}
              className="w-full py-3 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: faculty.color, color: '#070b14' }}
            >
              <CheckCircle size={16} /> Seal the Challenge
            </button>
          </motion.div>
        )}

        {/* PHASE: Confirmed */}
        {phase === 'confirmed' && (
          <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-6">
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto"
              style={{ background: `${faculty.color}20`, border: `2px solid ${faculty.color}` }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
            >
              {faculty.emoji}
            </motion.div>
            <div>
              <p className="text-base font-bold" style={{ color: faculty.color }}>Challenge Sealed.</p>
              <p className="text-sm text-[#64748b] mt-1">The Academy is watching. Now go prove it.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}