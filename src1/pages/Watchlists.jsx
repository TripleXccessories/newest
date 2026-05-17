import React, { useState, useEffect } from 'react';
import { Star, Plus, X, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const defaultTickers = ['AAPL', 'MSFT', 'NVDA', 'BTC/USD', 'ETH/USD'];

export default function Watchlists() {
  const [watchlists, setWatchlists] = useState([]);
  const [active, setActive] = useState(null);
  const [newName, setNewName] = useState('');
  const [newTicker, setNewTicker] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.Watchlist.list().then((data) => {
      if (data.length > 0) {
        setWatchlists(data);
        setActive(data[0]);
      } else {
        const def = { id: 'default', name: 'My Watchlist', tickers: defaultTickers, is_default: true };
        setWatchlists([def]);
        setActive(def);
      }
    }).catch(() => {
      const def = { id: 'default', name: 'My Watchlist', tickers: defaultTickers, is_default: true };
      setWatchlists([def]);
      setActive(def);
    });
  }, []);

  const createWatchlist = async () => {
    if (!newName.trim()) return;
    const wl = await base44.entities.Watchlist.create({ user_id: user?.id || 'demo', name: newName, tickers: [] });
    setWatchlists([...watchlists, wl]);
    setActive(wl);
    setNewName('');
  };

  const addTicker = () => {
    if (!newTicker.trim() || !active) return;
    const ticker = newTicker.toUpperCase().trim();
    const updated = { ...active, tickers: [...(active.tickers || []), ticker] };
    if (active.id !== 'default') base44.entities.Watchlist.update(active.id, { tickers: updated.tickers });
    setWatchlists(watchlists.map((w) => w.id === active.id ? updated : w));
    setActive(updated);
    setNewTicker('');
  };

  const removeTicker = (ticker) => {
    const updated = { ...active, tickers: active.tickers.filter((t) => t !== ticker) };
    if (active.id !== 'default') base44.entities.Watchlist.update(active.id, { tickers: updated.tickers });
    setWatchlists(watchlists.map((w) => w.id === active.id ? updated : w));
    setActive(updated);
  };

  // Mock price data
  const mockPrices = { 'AAPL': { price: 189.20, change: 1.34, pct: 0.71 }, 'MSFT': { price: 415.80, change: -2.10, pct: -0.50 }, 'NVDA': { price: 875.40, change: 12.60, pct: 1.46 }, 'BTC/USD': { price: 67240, change: 840, pct: 1.27 }, 'ETH/USD': { price: 3241, change: -28, pct: -0.86 } };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <Star size={22} className="text-[#00d4aa]" /> Watchlists
        </h1>
        <p className="text-sm text-[#64748b] mt-1">Track your favorite tickers across all asset classes.</p>
      </div>

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-2">
          {watchlists.map((wl) => (
            <button
              key={wl.id}
              onClick={() => setActive(wl)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                active?.id === wl.id ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' : 'text-[#64748b] hover:bg-[#1e293b] hover:text-[#f1f5f9]'
              }`}
            >
              <Star size={12} className="inline mr-1.5" />
              {wl.name}
              <span className="ml-1 text-[10px] opacity-60">({wl.tickers?.length || 0})</span>
            </button>
          ))}
          <div className="flex gap-1 mt-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createWatchlist()}
              placeholder="New list..."
              className="flex-1 bg-[#070b14] border border-[#1e293b] rounded-lg px-2 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa]"
            />
            <button onClick={createWatchlist} className="p-1.5 bg-[#00d4aa] text-[#070b14] rounded-lg hover:bg-[#00d4aa]/90">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#f1f5f9]">{active?.name || 'Select a watchlist'}</h2>
            <div className="flex gap-2">
              <input
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTicker()}
                placeholder="Add ticker..."
                className="bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa] w-32"
              />
              <button onClick={addTicker} className="px-2 py-1.5 bg-[#00d4aa] text-[#070b14] rounded-lg text-xs font-bold hover:bg-[#00d4aa]/90">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="divide-y divide-[#1e293b]">
            {active?.tickers?.map((ticker) => {
              const data = mockPrices[ticker] || { price: (Math.random() * 1000 + 10).toFixed(2), change: (Math.random() * 10 - 5).toFixed(2), pct: (Math.random() * 4 - 2).toFixed(2) };
              return (
                <div key={ticker} className="flex items-center justify-between px-5 py-3 hover:bg-[#1e293b]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-xs font-bold text-[#00d4aa]">
                      {ticker.slice(0, 2)}
                    </div>
                    <span className="text-sm font-semibold text-[#f1f5f9]">{ticker}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#f1f5f9]">${Number(data.price).toLocaleString()}</p>
                      <p className={`text-xs font-medium ${Number(data.pct) >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                        {Number(data.pct) >= 0 ? '+' : ''}{Number(data.pct).toFixed(2)}%
                      </p>
                    </div>
                    <button onClick={() => removeTicker(ticker)} className="text-[#64748b] hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {(!active?.tickers || active.tickers.length === 0) && (
              <div className="py-12 text-center">
                <Star size={32} className="text-[#1e293b] mx-auto mb-2" />
                <p className="text-sm text-[#64748b]">Add tickers to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}