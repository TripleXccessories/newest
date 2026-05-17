import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * RiskHeatmap — Canvas-based visualization of position risk distribution.
 * Darker red = deeper loss. Brighter teal = bigger gains. Size = exposure.
 */

export default function RiskHeatmap({ trades, balance }) {
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 240 });
  const containerRef = useRef(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setSize({ w: width, h: 240 });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = size;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = 'rgba(0,212,170,0.04)';
    ctx.lineWidth = 1;
    const grid = 40;
    for (let x = 0; x < w; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Plot each position as a circle
    const maxExposure = Math.max(...trades.map(t => Math.abs(t.quantity * t.entry_price || 1)), balance * 0.1);
    trades.forEach((trade, idx) => {
      const x = (idx / Math.max(trades.length - 1, 1)) * (w - 40) + 20;
      const y = h / 2;

      const exposure = Math.abs(trade.quantity * trade.entry_price || 0);
      const radius = 8 + (exposure / maxExposure) * 18;

      const pnl = trade.pnl || 0;
      const drawdownPct = (pnl / balance) * 100;

      let color;
      if (pnl > 0) {
        color = `rgba(0,212,170,${Math.min(0.8, drawdownPct / 5)})`;
      } else {
        color = `rgba(239,68,68,${Math.min(0.8, Math.abs(drawdownPct) / 5)})`;
      }

      // Glow
      const glow = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 2.5);
      glow.addColorStop(0, color.replace(')', ', 0.3)').replace('rgba', 'rgba'));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Node
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = pnl > 0 ? '#00d4aa' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillStyle = pnl > 0 ? '#00d4aa' : '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText(trade.ticker || 'N/A', x, y + radius + 14);
    });
  }, [trades, size]);

  return (
    <div ref={containerRef} className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa]" />
          <h2 className="text-sm font-semibold text-[#f1f5f9]">Position Heat Map</h2>
        </div>
        <p className="text-[10px] text-[#334155]">size = exposure · color = pnl</p>
      </div>
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        style={{ display: 'block', background: '#070b14' }}
      />
      <div className="flex items-center gap-4 px-5 py-3 border-t border-[#1e293b] text-[10px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00d4aa]" />
          <span className="text-[#475569]">Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-[#475569]">Loss</span>
        </div>
      </div>
    </div>
  );
}