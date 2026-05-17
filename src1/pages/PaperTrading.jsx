import React, { useState, useEffect } from 'react';
import { PlayCircle, Plus, X, BookOpen, Users, SlidersHorizontal, Film, BookMarked } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import TradeJournalModal from '@/components/journal/TradeJournalModal';
import PDFExportButton from '@/components/reports/PDFExportButton';
import QuickTradeJournal from '@/components/journal/QuickTradeJournal';
import NotebookDrawer from '@/components/notebook/NotebookDrawer';
import TradeSocialFeed from '@/components/trading/TradeSocialFeed';
import MarketScreener from '@/components/trading/MarketScreener';
import TradeReplay from '@/components/trading/TradeReplay';

const mockPositions = [
  { id: '1', ticker: 'BTC/USD', trade_type: 'buy', quantity: 0.5, entry_price: 65000, exit_price: null, status: 'open', pnl: 1120, pnl_percent: 3.45 },
  { id: '2', ticker: 'AAPL', trade_type: 'buy', quantity: 10, entry_price: 186.40, exit_price: null, status: 'open', pnl: 28, pnl_percent: 1.50 },
  { id: '3', ticker: 'NVDA', trade_type: 'buy', quantity: 2, entry_price: 860.00, exit_price: 892.00, status: 'closed', pnl: 64, pnl_percent: 3.72 },
];

export default function PaperTrading() {
  const [positions, setPositions] = useState([]);
  const [showNewTrade, setShowNewTrade] = useState(false);
  const [form, setForm] = useState({ ticker: '', trade_type: 'buy', quantity: '', entry_price: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [journalTrade, setJournalTrade] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('positions');
  const [screenerIndicators, setScreenerIndicators] = useState([]);
  const [replayTrade, setReplayTrade] = useState(null);
  const [showJournal, setShowJournal] = useState(false);
  const [quickJournalTrade, setQuickJournalTrade] = useState(null);
  const [showNotebook, setShowNotebook] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.TradeJournal.list('-created_date', 100).then(setJournalEntries).catch(() => {});
    base44.entities.Trade.list('-created_date', 50)
      .then((data) => setPositions(data.length > 0 ? data : mockPositions))
      .catch(() => setPositions(mockPositions))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyTrade = ({ ticker, trade_type, entry_price }) => {
    setForm({ ticker, trade_type, quantity: '1', entry_price: String(entry_price), notes: 'Copy trade' });
    setShowNewTrade(true);
    setActiveTab('positions');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trade = {
      user_id: user?.id || 'demo',
      ticker: form.ticker.toUpperCase(),
      trade_type: form.trade_type,
      quantity: parseFloat(form.quantity),
      entry_price: parseFloat(form.entry_price),
      is_paper: true,
      status: 'open',
      notes: form.notes,
    };
    const created = await base44.entities.Trade.create(trade);
    const newTrade = { ...trade, id: created.id, pnl: 0, pnl_percent: 0 };
    setPositions([newTrade, ...positions]);
    setForm({ ticker: '', trade_type: 'buy', quantity: '', entry_price: '', notes: '' });
    setShowNewTrade(false);
    setJournalTrade(newTrade);
  };

  const openPositions = positions.filter((p) => p.status === 'open');
  const closedPositions = positions.filter((p) => p.status === 'closed');
  const totalPnl = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AnimatePresence>
        {journalTrade && (
          <TradeJournalModal
            trade={journalTrade}
            user={user}
            onClose={() => setJournalTrade(null)}
            onSaved={() => setJournalTrade(null)}
          />
        )}
        {replayTrade && (
          <TradeReplay trade={replayTrade} onClose={() => setReplayTrade(null)} />
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <PlayCircle size={22} className="text-[#00d4aa]" /> Paper Trading Terminal
          </h1>
          <p className="text-sm text-[#64748b] mt-1">Practice trading with your $100,000 virtual balance — zero risk.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotebook(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-[#1e293b] text-[#475569] hover:text-[#f1f5f9] hover:border-[#334155] transition-colors">
            <BookMarked size={13} /> Notebook
          </button>
          <button onClick={() => { setQuickJournalTrade(null); setShowJournal(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors">
            <BookOpen size={13} /> Journal
          </button>
          <PDFExportButton type="portfolio" positions={positions} journalEntries={journalEntries} />
          <button
            onClick={() => { setActiveTab('positions'); setShowNewTrade(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold hover:bg-[#00d4aa]/90 transition-colors"
          >
            <Plus size={16} /> New Trade
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1">
        {[
          { id: 'positions', label: 'My Positions', icon: PlayCircle },
          { id: 'feed', label: 'Social Feed', icon: Users },
          { id: 'screener', label: 'Market Screener', icon: SlidersHorizontal },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === id ? 'bg-[#00d4aa] text-[#070b14]' : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Social Feed tab */}
      {activeTab === 'feed' && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
          <TradeSocialFeed user={user} positions={positions} onCopyTrade={handleCopyTrade} />
        </div>
      )}

      {/* Screener tab */}
      {activeTab === 'screener' && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5">
          <MarketScreener indicators={screenerIndicators} logic="AND" />
        </div>
      )}

      {/* Positions tab content */}
      {activeTab === 'positions' && <>

      {/* Portfolio summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#64748b] mb-1">Virtual Balance</p>
          <p className="text-xl font-bold text-[#f1f5f9]">$100,000</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#64748b] mb-1">Total P&L</p>
          <p className={`text-xl font-bold ${totalPnl >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#64748b] mb-1">Open Positions</p>
          <p className="text-xl font-bold text-[#f1f5f9]">{openPositions.length}</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#64748b] mb-1">Closed Trades</p>
          <p className="text-xl font-bold text-[#f1f5f9]">{closedPositions.length}</p>
        </div>
      </div>

      {/* New trade form */}
      {showNewTrade && (
        <div className="bg-[#111827] border border-[#00d4aa]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#f1f5f9]">Open New Paper Trade</h2>
            <button onClick={() => setShowNewTrade(false)} className="text-[#64748b] hover:text-[#f1f5f9]">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Ticker Symbol</label>
              <input
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value })}
                placeholder="e.g. AAPL, BTC/USD"
                required
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa]"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Direction</label>
              <select
                value={form.trade_type}
                onChange={(e) => setForm({ ...form, trade_type: e.target.value })}
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]"
              >
                <option value="buy">Buy / Long</option>
                <option value="sell">Sell / Short</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="0"
                required
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa]"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Entry Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.entry_price}
                onChange={(e) => setForm({ ...form, entry_price: e.target.value })}
                placeholder="0.00"
                required
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa]"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Notes (optional)</label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Trade rationale..."
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa]"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold hover:bg-[#00d4aa]/90 transition-colors">
                Open Trade
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Positions table */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e293b]">
          <h2 className="text-base font-semibold text-[#f1f5f9]">Positions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[#64748b] uppercase tracking-wider border-b border-[#1e293b]">
                <th className="text-left px-5 py-3">Ticker</th>
                <th className="text-left px-5 py-3">Direction</th>
                <th className="text-right px-5 py-3">Qty</th>
                <th className="text-right px-5 py-3">Entry</th>
                <th className="text-right px-5 py-3">P&L</th>
                <th className="text-center px-5 py-3">Status</th>
                <th className="text-center px-5 py-3">Journal</th>
                <th className="text-center px-5 py-3">Replay</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} className="border-b border-[#1e293b] hover:bg-[#1e293b]/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-semibold text-[#f1f5f9]">{p.ticker}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold ${p.trade_type === 'buy' ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                      {p.trade_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#f1f5f9] text-right">{p.quantity}</td>
                  <td className="px-5 py-3 text-sm text-[#f1f5f9] text-right">${p.entry_price?.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-sm font-bold ${(p.pnl || 0) >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                      {(p.pnl || 0) >= 0 ? '+' : ''}${(p.pnl || 0).toFixed(2)}
                      <span className="text-xs ml-1 opacity-70">({(p.pnl_percent || 0).toFixed(2)}%)</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'open' ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'bg-[#1e293b] text-[#64748b]'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <button
                        onClick={() => setJournalTrade(p)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border border-[#1e293b] text-[#64748b] hover:border-[#00d4aa]/40 hover:text-[#00d4aa] transition-colors"
                      >
                        <BookOpen size={11} /> Log
                      </button>
                      {journalEntries.find(j => j.trade_id === p.id) && (
                        <PDFExportButton
                          type="journal"
                          entry={journalEntries.find(j => j.trade_id === p.id)}
                          className="px-2 py-1 text-[10px]"
                        />
                      )}
                      </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                      <button
                      onClick={() => setReplayTrade(p)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border border-[#1e293b] text-[#64748b] hover:border-[#a78bfa]/40 hover:text-[#a78bfa] transition-colors"
                      title="Replay this trade"
                      >
                      <Film size={11} /> Replay
                      </button>
                      </td>
                      </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>}
      <QuickTradeJournal open={showJournal} onClose={() => setShowJournal(false)} trade={quickJournalTrade} />
      <NotebookDrawer open={showNotebook} onClose={() => setShowNotebook(false)} context="trading" />
    </div>
  );
}