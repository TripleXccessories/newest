import React, { useState, useEffect } from 'react';
import { Wifi, Bluetooth, Signal, Lock, Eye, EyeOff, Zap, CheckCircle2, RefreshCw, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simulated nearby connections with signal strength
const MOCK_CONNECTIONS = [
  { id: 'c1', name: 'BridgeNode-Alpha', type: 'wifi', strength: 92, secured: true, latency: 12, mode: 'STT' },
  { id: 'c2', name: 'IINT-Relay-7', type: 'wifi', strength: 87, secured: true, latency: 18, mode: 'TTS' },
  { id: 'c3', name: 'BT-Bridge-Local', type: 'bluetooth', strength: 74, secured: false, latency: 24, mode: 'STS' },
  { id: 'c4', name: 'PublicBridge-4', type: 'wifi', strength: 61, secured: false, latency: 45, mode: 'TTT' },
  { id: 'c5', name: 'BT-Booster-2A', type: 'bluetooth', strength: 48, secured: true, latency: 67, mode: 'Speaker' },
];

const BRIDGE_MODES = [
  { id: 'STT', label: 'Speech → Text', desc: 'Speak and receive transcribed text', icon: '🎤→📝' },
  { id: 'TTS', label: 'Text → Speech', desc: 'Type and hear it spoken back', icon: '📝→🔊' },
  { id: 'STS', label: 'Speech → Speech', desc: 'Speak in one language, hear another', icon: '🎤→🔊' },
  { id: 'TTT', label: 'Text → Text', desc: 'Translate text silently', icon: '📝→📝' },
  { id: 'Speaker', label: 'Speaker Mode', desc: 'Acts as a live translator speakerphone', icon: '📞🌐' },
];

function SignalBars({ strength }) {
  const bars = 4;
  const active = Math.round((strength / 100) * bars);
  const color = strength > 70 ? '#00d4aa' : strength > 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-end gap-0.5 h-4">
      {Array.from({ length: bars }, (_, i) => (
        <div key={i}
          className="w-1 rounded-sm transition-all"
          style={{
            height: `${(i + 1) * 25}%`,
            background: i < active ? color : '#1e293b',
          }} />
      ))}
    </div>
  );
}

function ConnectionRow({ conn, selected, onSelect, onConnect, connected }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]"
      style={{
        borderColor: connected ? '#00d4aa50' : selected ? '#334155' : '#1e293b',
        background: connected ? '#00d4aa08' : selected ? '#111827' : 'transparent',
      }}
      onClick={() => onSelect(conn.id)}>

      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: conn.type === 'wifi' ? '#00d4aa15' : '#a78bfa15' }}>
        {conn.type === 'wifi'
          ? <Wifi size={14} style={{ color: '#00d4aa' }} />
          : <Bluetooth size={14} style={{ color: '#a78bfa' }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-[#f1f5f9] truncate">{conn.name}</p>
          {conn.secured && <Lock size={9} className="text-[#f59e0b] shrink-0" />}
        </div>
        <p className="text-[9px] text-[#475569]">{conn.mode} · {conn.latency}ms · {conn.strength}%</p>
      </div>

      <SignalBars strength={conn.strength} />

      {connected ? (
        <CheckCircle2 size={14} className="text-[#00d4aa] shrink-0" />
      ) : selected ? (
        <button onClick={e => { e.stopPropagation(); onConnect(conn); }}
          className="px-2 py-1 rounded-lg text-[9px] font-black shrink-0"
          style={{ background: '#00d4aa20', color: '#00d4aa', border: '1px solid #00d4aa40' }}>
          Connect
        </button>
      ) : null}
    </motion.div>
  );
}

export default function BridgeConnectionPanel({ settings, onConnected, connectedId }) {
  const [connections, setConnections] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedMode, setSelectedMode] = useState('STT');
  const [showDataWarning, setShowDataWarning] = useState(false);

  const scan = () => {
    if (settings?.wifiSearch || settings?.bluetoothSearch) {
      setShowDataWarning(true);
      return;
    }
    doScan();
  };

  const doScan = () => {
    setScanning(true);
    setConnections([]);
    setTimeout(() => {
      const filtered = MOCK_CONNECTIONS
        .filter(c => {
          if (c.type === 'bluetooth' && !settings?.bluetoothSearch) return false;
          return true;
        })
        .sort((a, b) => b.strength - a.strength);
      setConnections(filtered);
      setScanning(false);
    }, 1800);
  };

  const handleConnect = (conn) => {
    onConnected({ ...conn, bridgeMode: selectedMode });
  };

  return (
    <div className="space-y-4">

      {/* Data usage warning */}
      <AnimatePresence>
        {showDataWarning && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border border-[#f59e0b]/40 bg-[#f59e0b]/08 p-4 space-y-3">
            <p className="text-xs font-black text-[#f59e0b]">⚠️ Data Usage Warning</p>
            <p className="text-[10px] text-[#94a3b8] leading-relaxed">
              Scanning via WiFi or Bluetooth may consume data from your mobile plan. Your carrier may bill you depending on your data subscription. 
              Using Bridge on WiFi is recommended to avoid charges.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setShowDataWarning(false); doScan(); }}
                className="flex-1 py-2 rounded-xl text-[10px] font-black bg-[#f59e0b] text-[#030508]">
                I Understand — Scan Anyway
              </button>
              <button onClick={() => setShowDataWarning(false)}
                className="px-4 py-2 rounded-xl text-[10px] text-[#64748b] border border-[#1e293b]">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bridge mode selector */}
      <div>
        <p className="text-[9px] font-black text-[#475569] uppercase tracking-widest mb-2">Bridge Mode</p>
        <div className="grid grid-cols-5 gap-1">
          {BRIDGE_MODES.map(m => (
            <button key={m.id} onClick={() => setSelectedMode(m.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all hover:scale-[1.03]"
              style={{
                borderColor: selectedMode === m.id ? '#00d4aa60' : '#1e293b',
                background: selectedMode === m.id ? '#00d4aa12' : 'transparent',
              }}
              title={`${m.label} — ${m.desc}`}>
              <span className="text-sm">{m.icon}</span>
              <p className="text-[7px] font-black leading-none" style={{ color: selectedMode === m.id ? '#00d4aa' : '#475569' }}>
                {m.id}
              </p>
            </button>
          ))}
        </div>
        {selectedMode && (
          <p className="text-[9px] text-[#475569] mt-1.5">
            {BRIDGE_MODES.find(m => m.id === selectedMode)?.label} — {BRIDGE_MODES.find(m => m.id === selectedMode)?.desc}
          </p>
        )}
      </div>

      {/* Scan button */}
      <button onClick={scan} disabled={scanning}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-xs font-bold transition-all hover:scale-[1.01] disabled:opacity-60"
        style={{ borderColor: '#00d4aa40', background: '#00d4aa10', color: '#00d4aa' }}>
        <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
        {scanning ? 'Scanning...' : 'Scan for Connections'}
      </button>

      {/* Hidden device reminder */}
      {settings?.hideDevice && (
        <div className="flex items-center gap-2 text-[9px] text-[#f59e0b]">
          <EyeOff size={10} /> Your device is hidden from outside scanners
        </div>
      )}

      {/* Connection list — sorted by signal strength */}
      {connections.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-black text-[#475569] uppercase tracking-widest">
            {connections.length} Connections Found — Best Signal First
          </p>
          {connections.map(c => (
            <ConnectionRow
              key={c.id}
              conn={c}
              selected={selected === c.id}
              connected={connectedId === c.id}
              onSelect={setSelected}
              onConnect={handleConnect}
            />
          ))}
        </div>
      )}

      {connections.length === 0 && !scanning && (
        <p className="text-center text-[10px] text-[#334155] py-4">No connections found. Tap scan to search.</p>
      )}
    </div>
  );
}