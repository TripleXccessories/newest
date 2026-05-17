import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';

export default function CharacterExportPanel({ charType, config }) {
  const [copied, setCopied] = useState(false);

  const code = charType === 'lightbulb'
    ? `<LightbulbGuy\n  mood="${config.mood}"\n  bulbColor="${config.bulbColor}"\n  gloveLeft="${config.gloveLeft}"\n  gloveRight="${config.gloveRight}"\n  hatType={${config.hatType ? `"${config.hatType}"` : 'null'}}\n  size={200}\n/>`
    : `// Robot settings\nglowColor="${config.glowColor}"\neyesGlowing={${config.eyesGlowing}}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${charType}_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">React Component Code</p>
        <div className="relative bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-3 overflow-x-auto">
          <pre className="text-[9px] text-[#94a3b8] font-mono whitespace-pre-wrap">{code}</pre>
          <button onClick={handleCopy} className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]">
            {copied ? <Check size={10} className="text-[#00d4aa]" /> : <Copy size={10} className="text-[#475569]" />}
          </button>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">Config JSON</p>
        <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-3">
          <pre className="text-[9px] text-[#64748b] font-mono">{JSON.stringify(config, null, 2)}</pre>
        </div>
      </div>

      <button onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors">
        <Download size={12} /> Download JSON Config
      </button>

      <div className="p-3 rounded-xl bg-[#0a0f1e] border border-[#1e293b]">
        <p className="text-[9px] text-[#334155] leading-relaxed">
          Copy this code and paste it anywhere in the app to use this exact character configuration.
          The JSON config can be saved to a BotPersona record for persistence.
        </p>
      </div>
    </div>
  );
}