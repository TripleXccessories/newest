import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, ShieldCheck, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

const ACADEMY_SLOTS = ['Kindergarten', 'Grade School', 'Mid Grade', 'Junior High', 'High School', 'University'];

function runValidation(scene, beatPattern) {
  const warnings = [];
  const errors = [];
  const passes = [];

  if (!scene) return { warnings, errors, passes, score: 0 };

  // ── Character checks ──
  const chars = scene.characters || [];
  if (chars.length === 0) {
    warnings.push({ code: 'NO_CHARS', message: 'No characters assigned to this scene.' });
  } else {
    passes.push('Characters assigned: ' + chars.join(', '));
  }

  // Character voices/looks locked — verify known characters only
  const VALID_CHARS = ['robot', 'lightbulb'];
  const invalidChars = chars.filter(c => !VALID_CHARS.includes(c));
  if (invalidChars.length > 0) {
    errors.push({ code: 'INVALID_CHARS', message: `Unknown characters detected: ${invalidChars.join(', ')}. Only "robot" and "lightbulb" are allowed — voices and looks are locked.` });
  }

  // ── Script events checks ──
  const events = scene.script_events || [];
  if (events.length === 0) {
    warnings.push({ code: 'NO_EVENTS', message: 'Script has no events. Add at least one action.' });
  } else {
    passes.push(`Script has ${events.length} event${events.length > 1 ? 's' : ''}.`);

    // Check total scripted duration
    const totalDuration = events.reduce((sum, e) => sum + (e.duration || 0) + (e.time || 0), 0);
    if (totalDuration < 3) {
      warnings.push({ code: 'SHORT_DURATION', message: `Scene scripted duration is very short (~${totalDuration.toFixed(1)}s). Minimum recommended is 3s.` });
    } else {
      passes.push(`Scene duration ~${totalDuration.toFixed(1)}s meets minimum.`);
    }

    // Events referencing invalid characters
    const badEventChars = events.filter(e => e.character && !VALID_CHARS.includes(e.character));
    if (badEventChars.length > 0) {
      errors.push({ code: 'EVENT_INVALID_CHAR', message: `${badEventChars.length} event(s) reference invalid characters. Only "robot" / "lightbulb" allowed.` });
    }
  }

  // ── Audio checks ──
  const audioAssets = scene.audio_assets || [];
  const beat = beatPattern || scene.beat_track;
  if (audioAssets.length === 0 && !beat?.tracks?.some(t => t.steps?.some(Boolean))) {
    warnings.push({ code: 'NO_AUDIO', message: 'No audio assets or beat pattern found. Consider adding music or SFX.' });
  } else {
    passes.push('Audio presence confirmed.');
  }

  // Minimum audio duration via beat BPM
  if (beat?.bpm && beat.bpm < 60) {
    warnings.push({ code: 'LOW_BPM', message: `Beat BPM (${beat.bpm}) is unusually low. Recommended minimum is 60 BPM.` });
  }
  if (beat?.bpm && beat.bpm > 200) {
    warnings.push({ code: 'HIGH_BPM', message: `Beat BPM (${beat.bpm}) is very high. Recommended max is 200 BPM.` });
  }

  // ── Academy alignment ──
  if (scene.scene_type === 'tutorial') {
    if (!scene.academy_school_level) {
      errors.push({ code: 'NO_SCHOOL_LEVEL', message: 'Academy lesson scene must have a School Level assigned.' });
    } else if (!ACADEMY_SLOTS.includes(scene.academy_school_level)) {
      errors.push({ code: 'INVALID_SCHOOL_LEVEL', message: `"${scene.academy_school_level}" is not a valid school level.` });
    } else {
      passes.push(`Academy level: ${scene.academy_school_level}`);
    }

    if (!scene.academy_course_id) {
      warnings.push({ code: 'NO_COURSE_ID', message: 'Academy scene has no Course ID. Link it to a course for correct lesson placement.' });
    } else {
      passes.push(`Linked to course: ${scene.academy_course_id}`);
    }
  }

  // ── Status check ──
  if (scene.status === 'published' && errors.length > 0) {
    errors.push({ code: 'PUBLISH_BLOCKED', message: 'This scene has critical errors and should not be published.' });
  }

  // ── Title ──
  if (!scene.title || scene.title.trim().length < 3) {
    errors.push({ code: 'NO_TITLE', message: 'Scene title is missing or too short (min 3 characters).' });
  } else {
    passes.push('Title is valid.');
  }

  const total = errors.length + warnings.length + passes.length;
  const score = total > 0 ? Math.round((passes.length / total) * 100) : 100;

  return { warnings, errors, passes, score };
}

export default function SceneValidator({ scene, beatPattern, onValidationChange }) {
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const validate = useCallback(() => {
    const r = runValidation(scene, beatPattern);
    setResult(r);
    onValidationChange?.(r);
  }, [scene, beatPattern, onValidationChange]);

  // Re-validate whenever scene or beatPattern changes
  useEffect(() => { validate(); }, [validate]);

  if (!scene) return null;

  const { warnings = [], errors = [], passes = [], score = 0 } = result || {};
  const hasIssues = errors.length > 0 || warnings.length > 0;

  const scoreColor = score >= 80 ? '#00d4aa' : score >= 50 ? '#fbbf24' : '#ef4444';
  const headerBg = errors.length > 0 ? '#ef444408' : warnings.length > 0 ? '#fbbf2408' : '#00d4aa08';
  const headerBorder = errors.length > 0 ? '#ef444430' : warnings.length > 0 ? '#fbbf2430' : '#00d4aa30';

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: headerBorder, background: headerBg }}>
      {/* Header */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
        <ShieldCheck size={13} style={{ color: scoreColor }} />
        <span className="text-xs font-bold flex-1" style={{ color: scoreColor }}>Scene Validation</span>

        {/* Score badge */}
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
          style={{ background: `${scoreColor}20`, color: scoreColor }}>
          {score}%
        </span>

        {errors.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-[#ef4444]">
            <XCircle size={10} /> {errors.length}
          </span>
        )}
        {warnings.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-[#fbbf24]">
            <AlertTriangle size={10} /> {warnings.length}
          </span>
        )}
        {!hasIssues && (
          <span className="flex items-center gap-1 text-[10px] text-[#00d4aa]">
            <CheckCircle size={10} /> All clear
          </span>
        )}

        <button onClick={e => { e.stopPropagation(); validate(); }}
          className="text-[#334155] hover:text-[#00d4aa] transition-colors ml-1">
          <RefreshCw size={10} />
        </button>
        {expanded ? <ChevronDown size={11} className="text-[#475569]" /> : <ChevronRight size={11} className="text-[#475569]" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t" style={{ borderColor: headerBorder }}>
            <div className="px-3 py-2 space-y-1.5 bg-[#060a12]">

              {errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <XCircle size={11} className="text-[#ef4444] mt-0.5 shrink-0" />
                  <span className="text-[#ef4444]">{e.message}</span>
                </div>
              ))}

              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <AlertTriangle size={11} className="text-[#fbbf24] mt-0.5 shrink-0" />
                  <span className="text-[#fbbf24]">{w.message}</span>
                </div>
              ))}

              {passes.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <CheckCircle size={11} className="text-[#00d4aa] mt-0.5 shrink-0" />
                  <span className="text-[#475569]">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}