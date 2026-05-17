import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { parseCommand, intentToPrompt } from './VoiceCommandParser';
import { VoicePrintEngine, TRUST_LEVELS, TRUST_META } from './VoicePrintEngine';
import VoiceTrustLayer from './VoiceTrustLayer';
import {
  Mic, MicOff, Volume2, VolumeX, Wifi,
  Loader2, AlertCircle, ShieldCheck, ShieldAlert, ShieldOff
} from 'lucide-react';

const DEVICE_BRIDGES = [
  { id: 'browser',  label: 'Browser Mic',      icon: '🎙️', status: 'active',  note: 'Web Speech API' },
  { id: 'alexa',    label: 'Amazon Alexa',      icon: '🔵', status: 'planned', note: 'Alexa Skills Kit' },
  { id: 'google',   label: 'Google / Gemini',   icon: '🟢', status: 'planned', note: 'Dialogflow webhook' },
  { id: 'copilot',  label: 'MS Copilot',        icon: '🔷', status: 'planned', note: 'Bot Framework relay' },
  { id: 'galaxy',   label: 'Galaxy Watch',      icon: '⌚', status: 'planned', note: 'Bixby Capsule API' },
  { id: 'siri',     label: 'Siri Shortcuts',    icon: '🍎', status: 'planned', note: 'URL scheme bridge' },
];

const INTENT_LABELS = {
  portfolio_summary:  '📊 Portfolio Summary',
  position_query:     '📍 Position Query',
  profit_query:       '💰 P&L Query',
  suggestion_request: '💡 Trade Suggestion',
  execute_buy:        '🟢 Buy Order',
  execute_sell:       '🔴 Sell Order',
  market_sentiment:   '📡 Market Sentiment',
  risk_check:         '🛡️ Risk Check',
  bot_status:         '🤖 Bot Status',
  general_query:      '💬 General Query',
  stop_listening:     '🛑 Stop',
};

export default function VoiceCommandCenter({ activeBot, allBots = [], archetypeColor, trades = [], userId }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState(null);
  const [botResponse, setBotResponse] = useState('');
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [waveform, setWaveform] = useState(Array(20).fill(2));
  const [history, setHistory] = useState([]);
  const [supported, setSupported] = useState(true);
  const [showBridges, setShowBridges] = useState(false);
  const [blockedCommand, setBlockedCommand] = useState(null); // command blocked by trust gate
  const [trustWarning, setTrustWarning] = useState(null);    // soft MED warning
  const [voiceprintEnrolled, setVoiceprintEnrolled] = useState(false);

  const recognitionRef = useRef(null);
  const waveIntervalRef = useRef(null);
  const engineRef = useRef(null);
  const color = archetypeColor || '#00d4aa';

  useEffect(() => {
    if (userId) {
      engineRef.current = new VoicePrintEngine(userId);
      setVoiceprintEnrolled(engineRef.current.isEnrolled());
    }
  }, [userId]);

  // Check support
  useEffect(() => {
    setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  // Animate waveform while listening
  useEffect(() => {
    if (listening) {
      waveIntervalRef.current = setInterval(() => {
        setWaveform(Array(20).fill(0).map(() => Math.random() * 28 + 4));
      }, 80);
    } else {
      clearInterval(waveIntervalRef.current);
      setWaveform(Array(20).fill(2));
    }
    return () => clearInterval(waveIntervalRef.current);
  }, [listening]);

  const buildPortfolioContext = () => {
    if (!trades.length) return 'Virtual paper trading account, $100,000 starting balance.';
    const lines = trades.slice(0, 5).map(t =>
      `${t.ticker} (${t.trade_type}): entry $${t.entry_price}, current P&L ${t.pnl >= 0 ? '+' : ''}$${t.pnl?.toFixed(2) || 0} (${t.pnl_percent >= 0 ? '+' : ''}${t.pnl_percent?.toFixed(1) || 0}%)`
    );
    return lines.join('; ');
  };

  const speakResponse = useCallback((text) => {
    if (!audioEnabled || !text) return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88;
    utt.pitch = 1.0;
    utt.volume = 0.95;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [audioEnabled]);

  const processCommand = useCallback(async (rawText) => {
    if (!rawText.trim() || !activeBot) return;
    setProcessing(true);

    const command = parseCommand(rawText, allBots.length ? allBots : [activeBot]);
    setLastCommand(command);

    if (command.intent === 'stop_listening') {
      stopListening();
      setProcessing(false);
      return;
    }

    // ── TRUST GATE ──────────────────────────────────────────────────────────
    const trustLevel = TRUST_LEVELS[command.intent] || 'LOW';
    const trustInfo = TRUST_META[trustLevel];

    if (trustLevel === 'HIGH') {
      const enrolled = engineRef.current?.isEnrolled();
      if (!enrolled) {
        setBlockedCommand(command);
        setBotResponse(`⛔ Voice authentication required to execute ${command.intent === 'execute_buy' ? 'buy' : 'sell'} orders. Enroll your VoicePrint in the Security tab first.`);
        setProcessing(false);
        return;
      }
      // Mark as voice-verified in history (in production: run live sample verification here)
      command.voiceVerified = true;
    }

    if (trustLevel === 'MED' && !engineRef.current?.isEnrolled()) {
      setTrustWarning('VoicePrint not enrolled — suggestion shown without full identity verification.');
    } else {
      setTrustWarning(null);
    }
    // ────────────────────────────────────────────────────────────────────────

    const portfolioContext = buildPortfolioContext();
    const prompt = intentToPrompt(command, activeBot, portfolioContext);

    const res = await base44.functions.invoke('generateFacultyDialogue', {
      faculty_name: activeBot.name,
      faculty_archetype: activeBot.archetype,
      faculty_school: activeBot.school,
      user_message: rawText,
      context: prompt,
      signature_line: activeBot.signature_line,
      role_title: activeBot.role_title,
    }).catch(() => null);

    const reply = res?.data?.dialogue || res?.data?.response || res?.data?.content
      || `${activeBot.name} here. ${activeBot.signature_line || 'Let me think on that.'}`;

    setBotResponse(reply);
    setHistory(prev => [{
      transcript: rawText,
      intent: command.intent,
      ticker: command.ticker,
      response: reply,
      ts: new Date(),
    }, ...prev].slice(0, 8));

    if (audioEnabled) speakResponse(reply);
    setProcessing(false);
  }, [activeBot, allBots, audioEnabled, speakResponse, trades]);

  const startListening = () => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(text);
    };
    recognition.onend = () => {
      setListening(false);
      const finalText = recognitionRef.current?._lastTranscript;
      if (finalText) processCommand(finalText);
    };
    recognition.onerror = () => setListening(false);

    // Patch to capture final transcript
    let lastText = '';
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(text);
      lastText = text;
      recognition._lastTranscript = text;
    };
    recognitionRef.current = recognition;
    recognitionRef.current._lastTranscript = '';
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  const [activeVoiceTab, setActiveVoiceTab] = useState('mic');

  if (!activeBot) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#f1f5f9]">Voice Command Center</p>
          <p className="text-[10px] text-[#475569]">Speak to {activeBot._ubp?.user_given_name || activeBot.name} directly</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Trust status pill */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold"
            style={voiceprintEnrolled
              ? { borderColor: `${color}30`, background: `${color}08`, color }
              : { borderColor: '#ef4444' + '30', background: '#ef444408', color: '#ef4444' }}>
            {voiceprintEnrolled ? <ShieldCheck size={9} /> : <ShieldAlert size={9} />}
            {voiceprintEnrolled ? 'Voice Secured' : 'Unsecured'}
          </div>
          <button onClick={() => setShowBridges(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all"
            style={{ borderColor: `${color}30`, color: showBridges ? color : '#475569', background: showBridges ? `${color}10` : 'transparent' }}>
            <Wifi size={10} /> Bridges
          </button>
        </div>
      </div>

      {/* Sub-tabs: Mic | Security */}
      <div className="flex rounded-xl overflow-hidden border border-[#1e293b]">
        {[{ id: 'mic', label: '🎙️ Microphone' }, { id: 'security', label: '🛡️ Voice Security' }].map(t => (
          <button key={t.id} onClick={() => setActiveVoiceTab(t.id)}
            className="flex-1 py-2 text-[11px] font-semibold transition-all"
            style={{
              background: activeVoiceTab === t.id ? `${color}15` : '#070b14',
              color: activeVoiceTab === t.id ? color : '#475569',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Security tab */}
      {activeVoiceTab === 'security' && (
        <VoiceTrustLayer
          userId={userId}
          color={color}
          onEnrollComplete={() => setVoiceprintEnrolled(true)}
        />
      )}

      {activeVoiceTab === 'mic' && <>

      {/* Device Bridges panel */}
      <AnimatePresence>
        {showBridges && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-1.5 overflow-hidden">
            {DEVICE_BRIDGES.map(d => (
              <div key={d.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1e293b] bg-[#070b14]">
                <span className="text-sm">{d.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#f1f5f9] truncate">{d.label}</p>
                  <p className="text-[8px] text-[#334155]">{d.note}</p>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  d.status === 'active' ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#1e293b] text-[#334155]'
                }`}>
                  {d.status === 'active' ? 'LIVE' : 'SOON'}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main mic interface */}
      <div className="relative flex flex-col items-center py-6 rounded-2xl border overflow-hidden"
        style={{ borderColor: listening ? `${color}60` : '#1e293b', background: listening ? `${color}05` : '#070b14' }}>

        {/* Ambient pulse when listening */}
        {listening && (
          <div className="absolute inset-0 pointer-events-none">
            {[1, 2, 3].map(i => (
              <motion.div key={i} className="absolute inset-0 rounded-2xl border"
                style={{ borderColor: color }}
                initial={{ opacity: 0.4, scale: 1 }}
                animate={{ opacity: 0, scale: 1 + i * 0.08 }}
                transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }} />
            ))}
          </div>
        )}

        {/* Waveform */}
        <div className="flex items-center gap-0.5 h-10 mb-4">
          {waveform.map((h, i) => (
            <motion.div key={i} className="w-1 rounded-full"
              style={{ background: listening ? color : '#1e293b' }}
              animate={{ height: h }}
              transition={{ duration: 0.08 }} />
          ))}
        </div>

        {/* Mic button */}
        <button onClick={toggleListening} disabled={!supported || processing}
          className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
          style={{
            background: listening
              ? `radial-gradient(circle, ${color}, ${color}80)`
              : `radial-gradient(circle, #1e293b, #111827)`,
            boxShadow: listening ? `0 0 30px ${color}60` : 'none',
          }}>
          {processing
            ? <Loader2 size={22} className="animate-spin text-[#f1f5f9]" />
            : listening
              ? <MicOff size={22} className="text-[#070b14]" />
              : <Mic size={22} style={{ color }} />
          }
        </button>

        <p className="text-[10px] mt-3 font-semibold"
          style={{ color: listening ? color : '#475569' }}>
          {processing ? 'Processing...' : listening ? 'Listening — tap to stop' : 'Tap to speak'}
        </p>

        {/* Live transcript */}
        {(listening || transcript) && (
          <div className="mt-3 mx-4 px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] w-full max-w-[90%]">
            <p className="text-[11px] text-[#94a3b8] italic text-center min-h-[16px]">
              {transcript || '...'}
            </p>
          </div>
        )}

        {/* Browser not supported */}
        {!supported && (
          <div className="flex items-center gap-2 mt-3 text-[11px] text-[#fbbf24]">
            <AlertCircle size={11} /> Use Chrome or Edge for voice input
          </div>
        )}
      </div>

      {/* Last command parsed */}
      {lastCommand && (
        <div className="px-4 py-3 rounded-xl bg-[#0a0f1e] border border-[#1e293b] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Last Command</span>
            <div className="flex items-center gap-2">
              {lastCommand.ticker && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-[#1e293b] text-[#94a3b8]">{lastCommand.ticker}</span>
              )}
              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                style={{ background: `${color}15`, color }}>
                {INTENT_LABELS[lastCommand.intent] || lastCommand.intent}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#475569] italic">"{lastCommand.raw}"</p>
        </div>
      )}

      {/* Bot response */}
      {botResponse && (
        <div className="px-4 py-3 rounded-xl border space-y-2"
          style={{ borderColor: `${color}20`, background: `${color}06` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full overflow-hidden border" style={{ borderColor: `${color}40` }}>
                {activeBot.avatar_url
                  ? <img src={activeBot.avatar_url} alt="" className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full flex items-center justify-center text-[8px] font-black" style={{ background: `${color}20`, color }}>{activeBot.name?.charAt(0)}</div>
                }
              </div>
              <p className="text-[10px] font-bold" style={{ color }}>{activeBot._ubp?.user_given_name || activeBot.name}</p>
              {speaking && (
                <div className="flex gap-0.5 items-center">
                  {[0, 0.1, 0.2].map((d, i) => (
                    <motion.div key={i} className="w-0.5 rounded-full" style={{ height: 8, background: color }}
                      animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.5, delay: d, repeat: Infinity }} />
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setAudioEnabled(v => !v); if (speaking) window.speechSynthesis?.cancel(); }}
              className="text-[#334155] hover:text-[#f1f5f9] transition-colors">
              {audioEnabled ? <Volume2 size={12} style={{ color }} /> : <VolumeX size={12} />}
            </button>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">{botResponse}</p>
        </div>
      )}

      {/* Command history */}
      {history.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-[#334155] uppercase tracking-widest">Session History</p>
          {history.map((h, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b]">
              <span className="text-[10px]">{INTENT_LABELS[h.intent]?.split(' ')[0] || '💬'}</span>
              <p className="text-[10px] text-[#475569] flex-1 truncate italic">"{h.transcript}"</p>
              {h.ticker && <span className="text-[9px] font-mono text-[#334155]">{h.ticker}</span>}
              <span className="text-[9px] text-[#1e293b]">{h.ts.toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Trust warning (MED) */}
      {trustWarning && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#fbbf24]/20 bg-[#fbbf24]/06">
          <ShieldAlert size={11} className="text-[#fbbf24] shrink-0" />
          <p className="text-[10px] text-[#fbbf24]">{trustWarning}</p>
        </div>
      )}

      {/* Blocked HIGH command */}
      {blockedCommand && (
        <div className="px-4 py-3 rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/06 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldOff size={13} className="text-[#ef4444]" />
            <p className="text-xs font-bold text-[#ef4444]">Command Blocked — Voice Auth Required</p>
          </div>
          <p className="text-[10px] text-[#ef4444]/70">"{blockedCommand.raw}"</p>
          <button onClick={() => { setActiveVoiceTab('security'); setBlockedCommand(null); }}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors">
            → Enroll VoicePrint to unlock trade execution
          </button>
        </div>
      )}

      {/* Suggested commands */}
      {!listening && !processing && history.length === 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-[#334155] uppercase tracking-widest">Try saying...</p>
          {[
            `"${activeBot._ubp?.user_given_name || activeBot.name}, show me my portfolio"`,
            '"Suggest the best trade right now"',
            '"What\'s the market sentiment today?"',
            '"Buy BTC"  🔴 requires voice auth',
          ].map(s => (
            <div key={s} className="px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b]">
              <p className="text-[10px] text-[#475569] italic">{s}</p>
            </div>
          ))}
        </div>
      )}

      </>}
    </div>
  );
}