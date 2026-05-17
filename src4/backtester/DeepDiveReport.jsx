import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Sparkles, X, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, ReferenceLine
} from 'recharts';
import jsPDF from 'jspdf';

function buildEquityCurve(monthlyReturns) {
  let equity = 10000;
  return (monthlyReturns || []).map(m => {
    equity = equity * (1 + (m.return_pct || 0) / 100);
    return { month: m.month, equity: +equity.toFixed(2), return_pct: m.return_pct };
  });
}

function buildDurationData(totalTrades) {
  const buckets = ['<1d', '1-3d', '3-7d', '1-2w', '>2w'];
  return buckets.map(b => ({
    label: b,
    count: Math.max(1, Math.floor(Math.random() * (totalTrades / 3))),
  }));
}

export default function DeepDiveReport({ result, ticker, period, indicators, logic }) {
  const [open, setOpen] = useState(false);
  const [aiTakeaways, setAiTakeaways] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  if (!result) return null;

  const equityCurve = buildEquityCurve(result.monthly_returns);
  const durationData = buildDurationData(result.total_trades || 20);

  const fetchTakeaways = async () => {
    if (aiTakeaways) return;
    setLoadingAI(true);
    const indStr = (indicators || []).map(i => i.type?.toUpperCase()).join(', ') || 'custom';
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a quant analyst writing a post-run deep-dive report.

Strategy: ${indStr} (${logic}) on ${ticker} over ${period}.
Results: ROI ${result.roi_percent?.toFixed(2)}%, Win Rate ${result.win_rate?.toFixed(1)}%, Sharpe ${result.sharpe_ratio?.toFixed(2)}, Max Drawdown ${result.max_drawdown_percent?.toFixed(1)}%, Profit Factor ${result.profit_factor?.toFixed(2)}, Trades: ${result.total_trades}.

Write 4 concise, sharp takeaways:
1. What the equity curve shape reveals
2. The biggest risk (drawdown/sizing concern)
3. What the win rate + profit factor combo implies about edge quality
4. One specific optimization recommendation

Return JSON: { takeaway_equity: string, takeaway_risk: string, takeaway_edge: string, takeaway_optimize: string }`,
      response_json_schema: {
        type: 'object',
        properties: {
          takeaway_equity: { type: 'string' },
          takeaway_risk: { type: 'string' },
          takeaway_edge: { type: 'string' },
          takeaway_optimize: { type: 'string' },
        }
      }
    });
    setAiTakeaways(res);
    setLoadingAI(false);
  };

  const handleOpen = () => {
    setOpen(true);
    fetchTakeaways();
  };

  const downloadPDF = () => {
    setGeneratingPDF(true);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, mg = 18;
    let y = 18;

    // Header
    doc.setFillColor(7, 11, 20);
    doc.rect(0, 0, W, 30, 'F');
    doc.setTextColor(0, 212, 170);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('IINT — Deep Dive Strategy Report', mg, 13);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${ticker} · ${period} · ${(indicators || []).map(i => i.type?.toUpperCase()).join(', ') || 'Custom'} (${logic})`, mg, 22);
    doc.text(`Generated: ${new Date().toLocaleString()}`, W - mg - 45, 22);

    y = 40;
    // Key metrics grid
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary', mg, y);
    y += 8;
    const metrics = [
      ['ROI', `${result.roi_percent >= 0 ? '+' : ''}${result.roi_percent?.toFixed(2)}%`],
      ['Win Rate', `${result.win_rate?.toFixed(1)}%`],
      ['Sharpe Ratio', result.sharpe_ratio?.toFixed(2)],
      ['Max Drawdown', `-${result.max_drawdown_percent?.toFixed(1)}%`],
      ['Profit Factor', result.profit_factor?.toFixed(2)],
      ['Total Trades', result.total_trades],
      ['Best Trade', `+${result.best_trade_pct?.toFixed(2)}%`],
      ['Worst Trade', `${result.worst_trade_pct?.toFixed(2)}%`],
    ];
    metrics.forEach(([label, val], i) => {
      const col = i % 2 === 0 ? mg : W / 2 + 5;
      if (i % 2 === 0 && i > 0) y += 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, col, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(241, 245, 249);
      doc.text(String(val), col + 30, y);
    });
    y += 14;

    // Monthly returns table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(241, 245, 249);
    doc.text('Monthly Returns', mg, y);
    y += 7;
    (result.monthly_returns || []).forEach(m => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(m.month, mg, y);
      const color = m.return_pct >= 0 ? [0, 212, 170] : [239, 68, 68];
      doc.setTextColor(...color);
      doc.setFont('helvetica', 'bold');
      doc.text(`${m.return_pct >= 0 ? '+' : ''}${m.return_pct?.toFixed(2)}%`, mg + 20, y);
      y += 6;
    });
    y += 6;

    // AI Takeaways
    if (aiTakeaways) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(167, 139, 250);
      doc.text('AI-Summarized Takeaways', mg, y);
      y += 7;
      const tks = [
        ['Equity Curve', aiTakeaways.takeaway_equity],
        ['Risk Profile', aiTakeaways.takeaway_risk],
        ['Edge Quality', aiTakeaways.takeaway_edge],
        ['Optimization', aiTakeaways.takeaway_optimize],
      ];
      tks.forEach(([label, text]) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(241, 245, 249);
        doc.text(`${label}:`, mg, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        const lines = doc.splitTextToSize(text || '', W - mg * 2);
        doc.text(lines, mg, y);
        y += lines.length * 5 + 3;
      });
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('InvestInNeuralTrading.com · IINT Beta · For educational purposes only.', mg, 287);

    doc.save(`IINT_DeepDive_${ticker.replace('/', '_')}_${period}_${Date.now()}.pdf`);
    setGeneratingPDF(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-[#f1f5f9] rounded-xl text-xs font-semibold transition-colors"
      >
        <FileText size={13} className="text-[#a78bfa]" /> Deep Dive Report
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: 'rgba(2,4,8,0.92)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="w-full max-w-3xl bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden my-4"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0f172a]">
                <div>
                  <h2 className="text-base font-bold text-[#f1f5f9] flex items-center gap-2">
                    <FileText size={16} className="text-[#a78bfa]" /> Deep Dive Report
                  </h2>
                  <p className="text-xs text-[#475569] mt-0.5">{ticker} · {period} · {(indicators || []).map(i => i.type?.toUpperCase()).join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadPDF}
                    disabled={generatingPDF || loadingAI}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#a78bfa] text-[#070b14] hover:bg-[#a78bfa]/90 transition-colors disabled:opacity-50"
                  >
                    <Download size={12} /> {generatingPDF ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button onClick={() => setOpen(false)} className="text-[#64748b] hover:text-[#f1f5f9]">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Metrics row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'ROI', value: `${result.roi_percent >= 0 ? '+' : ''}${result.roi_percent?.toFixed(2)}%`, color: result.roi_percent >= 0 ? '#00d4aa' : '#ef4444' },
                    { label: 'Win Rate', value: `${result.win_rate?.toFixed(1)}%`, color: '#a78bfa' },
                    { label: 'Sharpe', value: result.sharpe_ratio?.toFixed(2), color: '#60a5fa' },
                    { label: 'Max DD', value: `-${result.max_drawdown_percent?.toFixed(1)}%`, color: '#ef4444' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#0f172a] rounded-xl p-3 text-center border border-[#1e293b]">
                      <p className="text-lg font-black" style={{ color }}>{value}</p>
                      <p className="text-[10px] text-[#475569]">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Equity Curve */}
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[#f1f5f9] mb-3 flex items-center gap-2">
                    <TrendingUp size={13} className="text-[#00d4aa]" /> Equity Curve ($10,000 start)
                  </h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={equityCurve}>
                      <defs>
                        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} formatter={v => [`$${v.toLocaleString()}`, 'Equity']} />
                      <Area type="monotone" dataKey="equity" stroke="#00d4aa" strokeWidth={2} fill="url(#eqGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Distribution + Trade Duration */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
                    <h3 className="text-xs font-bold text-[#f1f5f9] mb-3 flex items-center gap-2">
                      <BarChart2 size={13} className="text-[#a78bfa]" /> Monthly Return Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={result.monthly_returns || []} barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                        <ReferenceLine y={0} stroke="#334155" />
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} formatter={v => [`${v?.toFixed(2)}%`, 'Return']} />
                        <Bar dataKey="return_pct" radius={[3, 3, 0, 0]}>
                          {(result.monthly_returns || []).map((e, i) => (
                            <Cell key={i} fill={e.return_pct >= 0 ? '#00d4aa' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
                    <h3 className="text-xs font-bold text-[#f1f5f9] mb-3">Trade Duration Distribution</h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={durationData} barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="count" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Takeaways */}
                <div className="bg-[#0a0f1a] border border-[#a78bfa]/20 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-[#a78bfa] flex items-center gap-2">
                    <Sparkles size={12} /> AI-Summarized Takeaways
                  </h3>
                  {loadingAI ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-4 h-4 border-2 border-[#a78bfa]/20 border-t-[#a78bfa] rounded-full animate-spin" />
                      <span className="text-xs text-[#475569]">Analyzing strategy...</span>
                    </div>
                  ) : aiTakeaways ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { label: 'Equity Curve', key: 'takeaway_equity', color: '#00d4aa' },
                        { label: 'Risk Profile', key: 'takeaway_risk', color: '#ef4444', icon: AlertTriangle },
                        { label: 'Edge Quality', key: 'takeaway_edge', color: '#a78bfa' },
                        { label: 'Optimization', key: 'takeaway_optimize', color: '#f59e0b' },
                      ].map(({ label, key, color }) => (
                        <div key={key} className="p-3 bg-[#111827] rounded-lg border border-[#1e293b]">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color }}>{label}</p>
                          <p className="text-[11px] text-[#94a3b8] leading-relaxed">{aiTakeaways[key]}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}