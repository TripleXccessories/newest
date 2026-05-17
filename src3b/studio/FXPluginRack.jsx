import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RefreshCw, Power, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

export default function FXPluginRack() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    base44.entities.FXPlugin.list('-created_date', 50)
      .then(setPlugins)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('syncFXLibrary', { query: 'cinematic game sfx', page_size: 15 });
      const updated = await base44.entities.FXPlugin.list('-created_date', 50);
      setPlugins(updated);
    } catch (e) {
      console.error(e);
    }
    setSyncing(false);
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const updateParam = (pluginId, key, value) => {
    setPlugins(prev => prev.map(p =>
      p.id === pluginId ? { ...p, parameters: { ...p.parameters, [key]: value } } : p
    ));
  };

  const toggleActive = async (plugin) => {
    const updated = { ...plugin, is_active: !plugin.is_active };
    setPlugins(prev => prev.map(p => p.id === plugin.id ? updated : p));
    await base44.entities.FXPlugin.update(plugin.id, { is_active: updated.is_active });
  };

  const TYPE_COLORS = {
    reverb: '#00d4aa', delay: '#a78bfa', chorus: '#fbbf24', distortion: '#ef4444',
    eq: '#3b82f6', compressor: '#f97316', filter: '#10b981', pitch: '#e879f9', custom: '#64748b',
  };

  if (loading) return (
    <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl p-6 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-[#070b14] border border-[#1e293b] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-[#00d4aa]" />
          <h3 className="text-sm font-bold text-[#f1f5f9]">FX Plugin Rack</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#64748b]">{plugins.length}</span>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#1e293b] text-[#64748b] hover:text-[#00d4aa] transition-colors">
          <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Library'}
        </button>
      </div>

      {plugins.length === 0 && (
        <div className="text-center py-8 text-[#475569] text-sm">
          <p>No plugins yet.</p>
          <button onClick={handleSync} className="mt-2 text-[#00d4aa] text-xs hover:underline">
            Click Sync Library to load built-in plugins
          </button>
        </div>
      )}

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {plugins.map(plugin => {
          const color = TYPE_COLORS[plugin.plugin_type] || '#64748b';
          const isExpanded = expanded[plugin.id];
          const params = plugin.parameters || {};
          return (
            <div key={plugin.id}
              className="border rounded-xl overflow-hidden transition-all"
              style={{ borderColor: plugin.is_active ? `${color}40` : '#1e293b' }}>
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-base">{plugin.icon_emoji || '🔌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: plugin.is_active ? color : '#475569' }}>
                    {plugin.name}
                  </p>
                  <p className="text-[9px] text-[#334155]">{plugin.provider} · {plugin.plugin_type}</p>
                </div>
                <button onClick={() => toggleActive(plugin)}
                  className="transition-colors"
                  style={{ color: plugin.is_active ? color : '#334155' }}>
                  <Power size={12} />
                </button>
                {Object.keys(params).length > 0 && (
                  <button onClick={() => toggleExpand(plugin.id)} className="text-[#475569] hover:text-[#f1f5f9] transition-colors">
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>

              {/* Params */}
              {isExpanded && Object.keys(params).length > 0 && (
                <div className="px-3 pb-3 space-y-1.5 border-t" style={{ borderColor: `${color}20` }}>
                  {Object.entries(params).map(([key, val]) => (
                    typeof val === 'number' ? (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[9px] text-[#475569] w-16 capitalize">{key.replace(/_/g, ' ')}</span>
                        <input type="range" min={0} max={key.includes('freq') || key.includes('cutoff') ? 20000 : key === 'semitones' ? 24 : 1}
                          step={key.includes('freq') ? 10 : 0.01}
                          value={val}
                          onChange={e => updateParam(plugin.id, key, parseFloat(e.target.value))}
                          className="flex-1 accent-current" style={{ accentColor: color }} />
                        <span className="text-[9px] text-[#64748b] w-8 text-right font-mono">
                          {typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(2)) : val}
                        </span>
                      </div>
                    ) : (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[9px] text-[#475569] w-16 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-[9px] text-[#64748b]">{String(val)}</span>
                      </div>
                    )
                  ))}
                  {/* Sample previews */}
                  {plugin.audio_sample_urls?.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[9px] text-[#334155] mb-1">Samples:</p>
                      {plugin.audio_sample_urls.slice(0, 2).map((url, i) => (
                        <audio key={i} src={url} controls className="w-full h-6" style={{ filter: 'invert(0.8) hue-rotate(160deg)' }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}