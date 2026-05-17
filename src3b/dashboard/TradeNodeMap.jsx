import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

/**
 * TradeNodeMap — "The Secret Project" aesthetic.
 * Live canvas rendering of trading nodes and connections derived from
 * the user's simulated trade data. Each node = a position/ticker.
 * Connections = correlated or sequential trades.
 * Node sparks pulse on winning trades; red flickers on losses.
 * The whole thing feels like the Robot's zapping network map.
 */

const COLORS = {
  win:    '#00d4aa',
  loss:   '#ef4444',
  neutral:'#a78bfa',
  edge:   'rgba(0,212,170,',   // teal edge
  edgeLoss:'rgba(239,68,68,',  // red edge
  bg:     '#070b14',
};

// Build nodes + edges from trade data
function buildGraph(trades, w, h) {
  if (!trades || trades.length === 0) return buildDemoGraph(w, h);

  const tickerMap = {};
  trades.forEach(t => {
    if (!tickerMap[t.ticker]) {
      tickerMap[t.ticker] = { ticker: t.ticker, pnl: 0, count: 0, trades: [] };
    }
    tickerMap[t.ticker].pnl += (t.pnl || 0);
    tickerMap[t.ticker].count += 1;
    tickerMap[t.ticker].trades.push(t);
  });

  const tickers = Object.values(tickerMap);
  const cx = w / 2, cy = h / 2;
  const radius = Math.min(w, h) * 0.35;

  const nodes = tickers.map((tk, i) => {
    const angle = (i / tickers.length) * Math.PI * 2 - Math.PI / 2;
    const r = radius * (0.5 + Math.random() * 0.5);
    return {
      id: tk.ticker,
      label: tk.ticker,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      pnl: tk.pnl,
      count: tk.count,
      radius: 6 + Math.min(tk.count * 2, 18),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      pulse: 0,
    };
  });

  // Add a central "portfolio" hub node
  nodes.unshift({
    id: '__hub__',
    label: 'IINT',
    x: cx, y: cy,
    pnl: trades.reduce((s, t) => s + (t.pnl || 0), 0),
    count: trades.length,
    radius: 18,
    vx: 0, vy: 0,
    pulse: 0,
    isHub: true,
  });

  // Edges: hub to each ticker, plus some cross-connections for nearby nodes
  const edges = [];
  nodes.slice(1).forEach(n => edges.push({ from: '__hub__', to: n.id, profit: n.pnl >= 0 }));
  for (let i = 1; i < nodes.length - 1; i++) {
    if (Math.random() < 0.35) {
      edges.push({ from: nodes[i].id, to: nodes[i + 1].id, profit: nodes[i].pnl >= 0 });
    }
  }

  return { nodes, edges };
}

function buildDemoGraph(w, h) {
  const cx = w / 2, cy = h / 2;
  const tickers = [
    { id: 'AAPL', pnl: 840,    count: 5,  radius: 14 },
    { id: 'BTC',  pnl: -320,   count: 3,  radius: 11 },
    { id: 'ETH',  pnl: 210,    count: 2,  radius: 10 },
    { id: 'TSLA', pnl: -95,    count: 4,  radius: 12 },
    { id: 'SPY',  pnl: 560,    count: 6,  radius: 13 },
    { id: 'EUR',  pnl: 130,    count: 2,  radius: 9  },
    { id: 'GLD',  pnl: -40,    count: 1,  radius: 8  },
    { id: 'NVDA', pnl: 1200,   count: 4,  radius: 16 },
  ];

  const radius = Math.min(w, h) * 0.33;
  const nodes = tickers.map((tk, i) => {
    const angle = (i / tickers.length) * Math.PI * 2 - Math.PI / 2;
    const r = radius * (0.65 + Math.random() * 0.35);
    return { ...tk, label: tk.id, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25, pulse: 0 };
  });

  nodes.unshift({ id: '__hub__', label: 'IINT', x: cx, y: cy, pnl: 2485, count: 27, radius: 18, vx: 0, vy: 0, pulse: 0, isHub: true });

  const edges = [];
  nodes.slice(1).forEach(n => edges.push({ from: '__hub__', to: n.id, profit: n.pnl >= 0 }));
  edges.push({ from: 'AAPL', to: 'NVDA', profit: true });
  edges.push({ from: 'BTC', to: 'ETH', profit: false });
  edges.push({ from: 'SPY', to: 'TSLA', profit: true });
  edges.push({ from: 'EUR', to: 'GLD', profit: true });

  return { nodes, edges };
}

// Photon traveling along an edge
function spawnPhoton(from, to, profit) {
  return { from, to, t: 0, speed: 0.004 + Math.random() * 0.004, profit };
}

export default function TradeNodeMap() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ nodes: [], edges: [], photons: [], frame: 0 });
  const rafRef = useRef(null);
  const [trades, setTrades] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [size, setSize] = useState({ w: 600, h: 280 });
  const containerRef = useRef(null);

  // Fetch trades
  useEffect(() => {
    base44.entities.Trade.list('-created_date', 30).then(setTrades).catch(() => setTrades([]));
  }, []);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setSize({ w: width, h: Math.max(240, Math.min(320, width * 0.48)) });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Build graph when trades or size changes
  useEffect(() => {
    const { nodes, edges } = buildGraph(trades, size.w, size.h);
    stateRef.current.nodes = nodes;
    stateRef.current.edges = edges;
    stateRef.current.photons = [];
  }, [trades, size]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let photonTimer = 0;

    const draw = () => {
      const { nodes, edges, photons } = stateRef.current;
      const { w, h } = size;
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = 'rgba(0,212,170,0.04)';
      ctx.lineWidth = 1;
      const grid = 32;
      for (let x = 0; x < w; x += grid) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for (let y = 0; y < h; y += grid) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

      // Drift nodes gently — soft bounce off walls
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < n.radius + 10 || n.x > w - n.radius - 10) n.vx *= -1;
        if (n.y < n.radius + 10 || n.y > h - n.radius - 10) n.vy *= -1;
        if (n.isHub) { n.x = w/2; n.y = h/2; } // hub stays centered
      });

      const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

      // Draw edges
      edges.forEach(e => {
        const a = nodeById[e.from], b = nodeById[e.to];
        if (!a || !b) return;
        const alpha = 0.18;
        const color = e.profit ? COLORS.edge : COLORS.edgeLoss;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `${color}${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Spawn photons periodically
      photonTimer++;
      if (photonTimer > 45 && edges.length > 0) {
        photonTimer = 0;
        const e = edges[Math.floor(Math.random() * edges.length)];
        stateRef.current.photons.push(spawnPhoton(e.from, e.to, e.profit));
        if (Math.random() < 0.4) stateRef.current.photons.push(spawnPhoton(e.to, e.from, e.profit));
      }

      // Update + draw photons
      stateRef.current.photons = photons.filter(p => p.t < 1);
      stateRef.current.photons.forEach(p => {
        p.t += p.speed;
        const a = nodeById[p.from], b = nodeById[p.to];
        if (!a || !b) return;
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;
        const color = p.profit ? COLORS.win : COLORS.loss;
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 6);
        grd.addColorStop(0, color);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        // Pulse target node when photon arrives
        if (p.t > 0.92) { if (b) b.pulse = 1; }
      });

      // Draw nodes
      nodes.forEach(n => {
        const color = n.isHub ? '#fbbf24' : n.pnl >= 0 ? COLORS.win : COLORS.loss;
        if (n.pulse > 0) n.pulse -= 0.05;
        const pulseR = n.radius + n.pulse * 14;

        // Outer glow pulse ring
        if (n.pulse > 0) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = color.replace(')', `,${n.pulse * 0.5})`).replace('#', 'rgba(') ;
          // simplified: just draw a fading ring
          ctx.globalAlpha = n.pulse * 0.5;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Glow halo
        const halo = ctx.createRadialGradient(n.x, n.y, n.radius * 0.4, n.x, n.y, n.radius * 2.5);
        halo.addColorStop(0, color + '55');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.isHub ? '#1a1208' : '#0f172a';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = n.isHub ? 2.5 : 1.5;
        ctx.stroke();

        // Hub inner ring animation
        if (n.isHub) {
          const t = Date.now() * 0.001;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251,191,36,${0.3 + 0.3 * Math.sin(t * 2)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label
        ctx.font = n.isHub ? 'bold 9px Inter, sans-serif' : '8px Inter, sans-serif';
        ctx.fillStyle = n.isHub ? '#fbbf24' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.radius + 11);
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [size]);

  // Tooltip on hover
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = stateRef.current.nodes.find(n => {
      const dx = n.x - mx, dy = n.y - my;
      return Math.sqrt(dx*dx + dy*dy) < n.radius + 6;
    });
    if (hit) {
      setTooltip({ x: mx, y: my, node: hit });
    } else {
      setTooltip(null);
    }
  }, []);

  return (
    <div ref={containerRef} className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden relative"
      style={{ borderColor: 'rgba(0,212,170,0.12)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
          <h2 className="text-sm font-semibold text-[#f1f5f9]">Neural Trade Map</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00d4aa]/10 text-[#00d4aa] font-bold border border-[#00d4aa]/20">LIVE</span>
        </div>
        <p className="text-[10px] text-[#334155] italic">nodes = tickers · sparks = capital flow</p>
      </div>

      {/* Canvas */}
      <div className="relative" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
        <canvas
          ref={canvasRef}
          width={size.w}
          height={size.h}
          style={{ display: 'block', background: COLORS.bg }}
        />

        {/* Tooltip */}
        {tooltip && (
          <motion.div
            className="absolute pointer-events-none z-10 px-2.5 py-2 rounded-lg border text-xs"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 10,
              background: '#0f172a',
              borderColor: tooltip.node.pnl >= 0 ? 'rgba(0,212,170,0.4)' : 'rgba(239,68,68,0.4)',
              color: '#e2e8f0',
              maxWidth: 140,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.12 }}
          >
            <p className="font-bold" style={{ color: tooltip.node.pnl >= 0 ? '#00d4aa' : '#ef4444' }}>
              {tooltip.node.label}
            </p>
            <p>P&L: <span style={{ color: tooltip.node.pnl >= 0 ? '#00d4aa' : '#ef4444' }}>
              {tooltip.node.pnl >= 0 ? '+' : ''}{tooltip.node.pnl?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </span></p>
            {tooltip.node.count > 0 && <p className="text-[#64748b]">{tooltip.node.count} trade{tooltip.node.count !== 1 ? 's' : ''}</p>}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[#1e293b]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa]" />
          <span className="text-[10px] text-[#475569]">Profitable node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] text-[#475569]">Loss node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
          <span className="text-[10px] text-[#475569]">Portfolio hub</span>
        </div>
        <div className="ml-auto text-[10px] text-[#1e293b] italic">✦ secret project ✦</div>
      </div>
    </div>
  );
}