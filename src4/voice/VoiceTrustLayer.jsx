import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ShieldAlert, ShieldOff, Mic, MicOff,
  Loader2, CheckCircle, XCircle, Fingerprint, RotateCcw, Lock
} from 'lucide-react';
import {
  VoicePrintEngine, extractFeatures,
  ENROLL_PASSPHRASE, ENROLL_SAMPLES_REQUIRED,
  TRUST_META
} from './VoicePrintEngine';

export default function VoiceTrustLayer({ userId, color = '#00d4aa', onEnrollComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | enrolling | recording | analyzing | done | error
  const [samplesDone, setSamplesDone] = useState(0);
  const [collectedFeatures, setCollectedFeatures] = useState([]);
  const [enrolled, setEnrolled] = useState(() => new VoicePrintEngine(userId).isEnrolled());
  const [verifyResult, setVerifyResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const engineRef = useRef(new VoicePrintEngine(userId));
  const mediaRecorderRef = useRef(null);
  const audioCtxRef = useRef(null);

  const recordSample = async () => {
    setPhase('recording');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;

    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      setPhase('analyzing');
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const arrayBuffer = await blob.arrayBuffer();
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer).catch(() => null);
      if (!audioBuffer) { setPhase('error'); return; }

      const features = extractFeatures(audioBuffer);
      const next = [...collectedFeatures, features];
      setCollectedFeatures(next);
      const done = next.length;
      setSamplesDone(done);

      if (done >= ENROLL_SAMPLES_REQUIRED) {
        // Average all samples and save print
        const avgFeatures = next[0].map((_, i) => next.reduce((s, v) => s + v[i], 0) / next.length);
        engineRef.current.savePrint(avgFeatures, done);
        setEnrolled(true);
        setPhase('done');
        onEnrollComplete?.();
      } else {
        setPhase('enrolling'); // ready for next sample
      }
    };

    mr.start();
    setTimeout(() => mr.stop(), 3500); // 3.5s sample
  };

  const startEnrollment = () => {
    setPhase('enrolling');
    setSamplesDone(0);
    setCollectedFeatures([]);
    setVerifyResult(null);
  };

  const revokeprint = () => {
    engineRef.current.revoke();
    setEnrolled(false);
    setPhase('idle');
    setSamplesDone(0);
    setCollectedFeatures([]);
    setVerifyResult(null);
  };

  const enrolledInfo = engineRef.current.getStoredPrint();

  return (
    <div className="space-y-3">
      {/* Trust status bar */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
        style={{
          borderColor: enrolled ? `${color}30` : '#ef4444' + '30',
          background: enrolled ? `${color}06` : '#ef444406',
        }}>
        <div className="flex items-center gap-2.5">
          {enrolled
            ? <ShieldCheck size={16} style={{ color }} />
            : <ShieldAlert size={16} className="text-[#ef4444]" />
          }
          <div>
            <p className="text-xs font-bold text-[#f1f5f9]">
              {enrolled ? 'VoicePrint Enrolled' : 'VoicePrint Not Set'}
            </p>
            <p className="text-[9px]" style={{ color: enrolled ? color : '#ef4444' }}>
              {enrolled
                ? `High-risk commands protected · enrolled ${new Date(enrolledInfo?.enrolledAt).toLocaleDateString()}`
                : 'BUY / SELL commands require voice auth to execute'
              }
            </p>
          </div>
        </div>
        {enrolled && (
          <button onClick={() => setShowDetails(v => !v)}
            className="text-[9px] font-bold px-2 py-1 rounded-lg border transition-colors"
            style={{ borderColor: `${color}30`, color }}>
            {showDetails ? 'Hide' : 'Details'}
          </button>
        )}
      </div>

      {/* Trust tier legend */}
      <AnimatePresence>
        {showDetails && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-1.5">
            {Object.entries(TRUST_META).map(([level, meta]) => (
              <div key={level} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070b14] border border-[#1e293b]">
                <span className="text-sm">{meta.icon}</span>
                <div className="flex-1">
                  <p className="text-[10px] font-bold" style={{ color: meta.color }}>{level} — {meta.label}</p>
                  <p className="text-[9px] text-[#334155]">
                    {level === 'LOW' && 'Portfolio queries, sentiment, bot status — no auth needed'}
                    {level === 'MED' && 'Trade suggestions — soft check, warning shown if mismatch'}
                    {level === 'HIGH' && 'Buy/Sell orders — hard block without verified voiceprint'}
                  </p>
                </div>
                {meta.requiresVoicePrint && <Lock size={10} style={{ color: meta.color }} />}
              </div>
            ))}
            <button onClick={revokeprint}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#ef4444]/20 text-[10px] font-bold text-[#ef4444] hover:bg-[#ef4444]/08 transition-colors">
              <ShieldOff size={10} /> Revoke VoicePrint
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enrollment flow */}
      {!enrolled && phase === 'idle' && (
        <button onClick={startEnrollment}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}80)`, color: '#070b14' }}>
          <Fingerprint size={14} /> Enroll My VoicePrint
        </button>
      )}

      <AnimatePresence mode="wait">
        {(phase === 'enrolling' || phase === 'recording' || phase === 'analyzing') && (
          <motion.div key="enrollment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3 p-4 rounded-2xl border"
            style={{ borderColor: `${color}30`, background: `${color}06` }}>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: ENROLL_SAMPLES_REQUIRED }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    background: i < samplesDone ? color : i === samplesDone && phase === 'recording' ? color + '80' : '#1e293b',
                    boxShadow: i === samplesDone && phase === 'recording' ? `0 0 8px ${color}` : 'none',
                  }} />
              ))}
            </div>

            <p className="text-xs font-bold text-center text-[#f1f5f9]">
              Sample {samplesDone + 1} of {ENROLL_SAMPLES_REQUIRED}
            </p>

            {/* Passphrase */}
            <div className="px-4 py-3 rounded-xl bg-[#070b14] border border-[#1e293b] text-center">
              <p className="text-[10px] text-[#475569] mb-1">Say this phrase clearly:</p>
              <p className="text-xs font-semibold text-[#f1f5f9] italic">"{ENROLL_PASSPHRASE}"</p>
            </div>

            {phase === 'enrolling' && (
              <button onClick={recordSample}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all"
                style={{ background: color, color: '#070b14' }}>
                <Mic size={13} /> Record Sample {samplesDone + 1}
              </button>
            )}

            {phase === 'recording' && (
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
                style={{ background: '#ef4444' + '15', border: '1px solid #ef444430' }}>
                <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                <p className="text-xs font-bold text-[#ef4444]">Recording... (3.5s)</p>
              </div>
            )}

            {phase === 'analyzing' && (
              <div className="flex items-center justify-center gap-2 py-2.5">
                <Loader2 size={13} className="animate-spin" style={{ color }} />
                <p className="text-xs" style={{ color }}>Extracting voice features...</p>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ borderColor: `${color}30`, background: `${color}08` }}>
            <CheckCircle size={18} style={{ color }} />
            <div>
              <p className="text-xs font-bold" style={{ color }}>VoicePrint Saved</p>
              <p className="text-[10px] text-[#475569]">Your voice is now your trading key</p>
            </div>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/06">
            <XCircle size={16} className="text-[#ef4444]" />
            <p className="text-xs text-[#ef4444] flex-1">Enrollment failed. Check mic permissions.</p>
            <button onClick={startEnrollment}><RotateCcw size={12} className="text-[#ef4444]" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}