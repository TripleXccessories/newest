import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';

const ACTION_TYPES = {
  robot:    ['mood', 'move', 'headTurn', 'chestPanel', 'nodes', 'bow', 'glove'],
  lightbulb:['mood', 'move', 'glove', 'bulbColor', 'reveal'],
  audio:    ['play', 'stop', 'sfx'],
  scene:    ['pause', 'fade', 'title'],
};

const ACTION_DEFAULTS = {
  mood:       'idle',
  move:       { x: 0, y: 0 },
  headTurn:   0,
  chestPanel: 'closed',
  nodes:      true,
  bow:        true,
  glove:      'down',
  bulbColor:  '#ffffff',
  reveal:     'all',
  play:       '',
  stop:       '',
  sfx:        '',
  pause:      1000,
  fade:       'in',
  title:      'Welcome to IINT Inc.',
};

const CHAR_COLORS = { robot: '#60a5fa', lightbulb: '#fbbf24', audio: '#00d4aa', scene: '#a78bfa' };

let nextId = 100;

export default function ScriptSequencer({ onStateChange }) {
  const [events, setEvents] = useState([
    { id: 1, time: 0,    character: 'scene',    action: 'fade',       value: 'in',     duration: 1000 },
    { id: 2, time: 1000, character: 'robot',    action: 'mood',       value: 'idle',   duration: 500  },
    { id: 3, time: 2000, character: 'robot',    action: 'chestPanel', value: 'open',   duration: 800  },
    { id: 4, time: 3500, character: 'lightbulb',action: 'reveal',     value: 'all',    duration: 1200 },
    { id: 5, time: 5000, character: 'robot',    action: 'bow',        value: true,     duration: 600  },
  ]);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [firedIds, setFiredIds] = useState(new Set());
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);
  const totalDuration = Math.max(...events.map(e => e.time + (e.duration || 0))) + 1000;

  const fire = (event) => {
    onStateChange?.({ character: event.character, action: event.action, value: event.value });
  };

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    startTimeRef.current = performance.now() - elapsed;
    const tick = () => {
      const now = performance.now() - startTimeRef.current;
      setElapsed(now);
      // Fire events
      events.forEach(ev => {
        if (now >= ev.time && !firedIds.has(ev.id)) {
          fire(ev);
          setFiredIds(prev => new Set([...prev, ev.id]));
        }
      });
      if (now >= totalDuration) {
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const handlePlay = () => {
    if (!playing) {
      setFiredIds(new Set());
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  };

  const handleStop = () => {
    setPlaying(false);
    setElapsed(0);
    setFiredIds(new Set());
  };

  const addEvent = () => {
    const lastTime = events.length ? Math.max(...events.map(e => e.time)) : 0;
    setEvents(prev => [...prev, {
      id: ++nextId, time: lastTime + 1000, character: 'robot',
      action: 'mood', value: 'idle', duration: 500
    }]);
  };

  const updateEvent = (id, field, value) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));

  const sortedEvents = [...events].sort((a, b) => a.time - b.time);
  const progressPct = totalDuration > 0 ? Math.min((elapsed / totalDuration) * 100, 100) : 0;

  return (
    <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#f1f5f9]">Script Sequencer</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-[#070b14]"
            style={{ background: playing ? '#fbbf24' : '#00d4aa' }}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button onClick={handleStop}
            className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] transition-colors">
            <Square size={12} />
          </button>
          <button onClick={addEvent}
            className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-colors">
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Timeline scrubber */}
      <div className="relative h-1.5 bg-[#1e293b] rounded-full overflow-hidden cursor-pointer"
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setElapsed(pct * totalDuration);
          setFiredIds(new Set());
        }}>
        <div className="h-full rounded-full bg-[#00d4aa] transition-all" style={{ width: `${progressPct}%` }} />
        {/* Event markers */}
        {events.map(ev => (
          <div key={ev.id} className="absolute top-0 w-0.5 h-full rounded-full"
            style={{ left: `${(ev.time / totalDuration) * 100}%`, background: CHAR_COLORS[ev.character] || '#64748b' }} />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-[#334155] font-mono">
        <span>{Math.floor(elapsed / 1000)}s</span>
        <span>{Math.ceil(totalDuration / 1000)}s total</span>
      </div>

      {/* Event list */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {sortedEvents.map(ev => {
          const color = CHAR_COLORS[ev.character] || '#64748b';
          const fired = firedIds.has(ev.id);
          return (
            <div key={ev.id}
              className="flex items-center gap-2 p-2 rounded-xl border transition-all"
              style={{ borderColor: fired && playing ? `${color}60` : '#1e293b', background: fired && playing ? `${color}08` : '#0a0f1e' }}>
              <GripVertical size={12} className="text-[#334155] shrink-0" />
              {/* Time */}
              <input type="number" value={ev.time} min={0} step={100}
                onChange={e => updateEvent(ev.id, 'time', +e.target.value)}
                className="w-14 bg-[#1e293b] text-[#f1f5f9] text-[10px] rounded px-1.5 py-0.5 font-mono outline-none" />
              <span className="text-[9px] text-[#334155]">ms</span>
              {/* Character */}
              <select value={ev.character} onChange={e => updateEvent(ev.id, 'character', e.target.value)}
                className="text-[10px] rounded px-1 py-0.5 outline-none border-0 font-bold"
                style={{ background: `${color}20`, color }}>
                {['robot', 'lightbulb', 'audio', 'scene'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {/* Action */}
              <select value={ev.action}
                onChange={e => updateEvent(ev.id, 'action', e.target.value)}
                className="text-[10px] bg-[#1e293b] text-[#94a3b8] rounded px-1 py-0.5 outline-none border-0">
                {(ACTION_TYPES[ev.character] || []).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {/* Value */}
              <input value={typeof ev.value === 'object' ? JSON.stringify(ev.value) : String(ev.value)}
                onChange={e => {
                  try { updateEvent(ev.id, 'value', JSON.parse(e.target.value)); }
                  catch { updateEvent(ev.id, 'value', e.target.value); }
                }}
                className="flex-1 bg-[#1e293b] text-[#f1f5f9] text-[10px] rounded px-1.5 py-0.5 outline-none font-mono min-w-0" />
              {/* Duration */}
              <input type="number" value={ev.duration || 500} min={0} step={100}
                onChange={e => updateEvent(ev.id, 'duration', +e.target.value)}
                className="w-14 bg-[#1e293b] text-[#64748b] text-[10px] rounded px-1.5 py-0.5 font-mono outline-none" />
              <button onClick={() => deleteEvent(ev.id)} className="text-[#334155] hover:text-[#ef4444] transition-colors shrink-0">
                <Trash2 size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}