import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, GripVertical, Settings2, ChevronDown, ChevronUp } from 'lucide-react';

const INDICATOR_LIBRARY = [
  { id: 'rsi', label: 'RSI', category: 'Momentum', color: '#a78bfa', defaultParams: { period: 14, overbought: 70, oversold: 30 }, paramDefs: [{ key: 'period', label: 'Period', min: 2, max: 50 }, { key: 'overbought', label: 'Overbought', min: 50, max: 100 }, { key: 'oversold', label: 'Oversold', min: 0, max: 50 }] },
  { id: 'sma', label: 'SMA', category: 'Trend', color: '#00d4aa', defaultParams: { period: 20 }, paramDefs: [{ key: 'period', label: 'Period', min: 2, max: 200 }] },
  { id: 'ema', label: 'EMA', category: 'Trend', color: '#34d399', defaultParams: { period: 12 }, paramDefs: [{ key: 'period', label: 'Period', min: 2, max: 200 }] },
  { id: 'macd', label: 'MACD', category: 'Momentum', color: '#f59e0b', defaultParams: { fast: 12, slow: 26, signal: 9 }, paramDefs: [{ key: 'fast', label: 'Fast', min: 2, max: 50 }, { key: 'slow', label: 'Slow', min: 5, max: 100 }, { key: 'signal', label: 'Signal', min: 2, max: 30 }] },
  { id: 'bollinger', label: 'Bollinger Bands', category: 'Volatility', color: '#60a5fa', defaultParams: { period: 20, stddev: 2 }, paramDefs: [{ key: 'period', label: 'Period', min: 5, max: 50 }, { key: 'stddev', label: 'Std Dev', min: 1, max: 4 }] },
  { id: 'atr', label: 'ATR', category: 'Volatility', color: '#fb7185', defaultParams: { period: 14 }, paramDefs: [{ key: 'period', label: 'Period', min: 2, max: 50 }] },
  { id: 'stoch', label: 'Stochastic', category: 'Momentum', color: '#c084fc', defaultParams: { k: 14, d: 3, smooth: 3 }, paramDefs: [{ key: 'k', label: '%K Period', min: 2, max: 50 }, { key: 'd', label: '%D Period', min: 1, max: 20 }, { key: 'smooth', label: 'Smooth', min: 1, max: 10 }] },
  { id: 'vwap', label: 'VWAP', category: 'Volume', color: '#06b6d4', defaultParams: {}, paramDefs: [] },
  { id: 'obv', label: 'OBV', category: 'Volume', color: '#0ea5e9', defaultParams: {}, paramDefs: [] },
  { id: 'adx', label: 'ADX', category: 'Trend', color: '#f97316', defaultParams: { period: 14 }, paramDefs: [{ key: 'period', label: 'Period', min: 2, max: 50 }] },
];

const CATEGORIES = ['All', 'Trend', 'Momentum', 'Volatility', 'Volume'];

const LOGIC_OPS = [
  { id: 'AND', label: 'AND — all conditions must be true' },
  { id: 'OR', label: 'OR — any condition can be true' },
];

function IndicatorChip({ indicator, lib, onRemove, onParamChange }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: `${lib.color}40`, background: `${lib.color}08` }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical size={13} className="text-[#475569] cursor-grab flex-shrink-0" />
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lib.color }} />
        <span className="text-sm font-semibold flex-1" style={{ color: lib.color }}>{lib.label}</span>
        <span className="text-[10px] text-[#475569] bg-[#1e293b] px-1.5 py-0.5 rounded">{lib.category}</span>
        {lib.paramDefs.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="text-[#475569] hover:text-[#94a3b8]">
            {expanded ? <ChevronUp size={13} /> : <Settings2 size={13} />}
          </button>
        )}
        <button onClick={onRemove} className="text-[#475569] hover:text-[#ef4444]">
          <X size={13} />
        </button>
      </div>
      <AnimatePresence>
        {expanded && lib.paramDefs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 pb-3 grid grid-cols-3 gap-2"
          >
            {lib.paramDefs.map(pd => (
              <div key={pd.key}>
                <label className="text-[10px] text-[#64748b] block mb-1">{pd.label}</label>
                <input
                  type="number"
                  min={pd.min}
                  max={pd.max}
                  value={indicator.params[pd.key] ?? lib.defaultParams[pd.key]}
                  onChange={e => onParamChange(pd.key, Number(e.target.value))}
                  className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-2 py-1 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function StrategyBuilder({ value, onChange }) {
  const [catFilter, setCatFilter] = useState('All');
  const [logic, setLogic] = useState('AND');
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const indicators = value || [];

  const addIndicator = (lib) => {
    const entry = { id: `${lib.id}_${Date.now()}`, type: lib.id, params: { ...lib.defaultParams } };
    onChange([...indicators, entry], logic);
  };

  const removeIndicator = (id) => {
    onChange(indicators.filter(i => i.id !== id), logic);
  };

  const updateParam = (id, key, val) => {
    onChange(indicators.map(i => i.id === id ? { ...i, params: { ...i.params, [key]: val } } : i), logic);
  };

  const handleDragStart = (idx) => {
    dragItem.current = idx;
    setDraggingId(indicators[idx].id);
  };
  const handleDragEnter = (idx) => {
    dragOverItem.current = idx;
    setDragOverIdx(idx);
  };
  const handleDragEnd = () => {
    const copy = [...indicators];
    const dragged = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingId(null);
    setDragOverIdx(null);
    onChange(copy, logic);
  };

  const filtered = catFilter === 'All' ? INDICATOR_LIBRARY : INDICATOR_LIBRARY.filter(l => l.category === catFilter);
  const usedTypes = new Set(indicators.map(i => i.type));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f1f5f9]">Custom Strategy Builder</p>
          <p className="text-xs text-[#475569] mt-0.5">Drag indicators to reorder · Click ⚙ to configure params</p>
        </div>
        {indicators.length >= 2 && (
          <select
            value={logic}
            onChange={e => { setLogic(e.target.value); onChange(indicators, e.target.value); }}
            className="bg-[#070b14] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
          >
            {LOGIC_OPS.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
          </select>
        )}
      </div>

      {/* Canvas — drop zone */}
      <div className="min-h-[80px] bg-[#070b14] border-2 border-dashed border-[#1e293b] rounded-2xl p-3 space-y-2 transition-colors">
        {indicators.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-xs text-[#334155]">
            Click indicators below to add them to your strategy
          </div>
        ) : (
          <AnimatePresence>
            {indicators.map((ind, idx) => {
              const lib = INDICATOR_LIBRARY.find(l => l.id === ind.type);
              if (!lib) return null;
              return (
                <div
                  key={ind.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className={`transition-opacity ${draggingId === ind.id ? 'opacity-40' : 'opacity-100'} ${dragOverIdx === idx && draggingId !== ind.id ? 'ring-2 ring-[#a78bfa] rounded-xl' : ''}`}
                >
                  <IndicatorChip
                    indicator={ind}
                    lib={lib}
                    onRemove={() => removeIndicator(ind.id)}
                    onParamChange={(key, val) => updateParam(ind.id, key, val)}
                  />
                </div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Indicator library */}
      <div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${catFilter === c ? 'bg-[#a78bfa] text-[#070b14]' : 'bg-[#1e293b] text-[#64748b] hover:text-[#f1f5f9]'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.map(lib => {
            const alreadyUsed = usedTypes.has(lib.id);
            return (
              <button
                key={lib.id}
                onClick={() => !alreadyUsed && addIndicator(lib)}
                disabled={alreadyUsed}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                  alreadyUsed
                    ? 'border-[#1e293b] opacity-40 cursor-not-allowed'
                    : 'border-[#1e293b] hover:border-[#a78bfa]/40 cursor-pointer'
                }`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lib.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#f1f5f9] truncate">{lib.label}</p>
                  <p className="text-[10px] text-[#475569]">{lib.category}</p>
                </div>
                {alreadyUsed ? (
                  <span className="ml-auto text-[10px] text-[#475569]">Added</span>
                ) : (
                  <Plus size={11} className="ml-auto text-[#475569]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}