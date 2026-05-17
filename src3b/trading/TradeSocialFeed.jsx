import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Copy, Heart, MessageCircle, Share2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const mockFeed = [
  {
    id: 'f1', author: 'AlphaTrader_92', ticker: 'BTC/USD', trade_type: 'buy',
    entry_price: 61200, pnl: 2340, pnl_percent: 3.82,
    rationale: 'RSI oversold + MACD bullish crossover on 4H. Strong support at 61k. Risk:Reward 1:3.',
    copies: 14, likes: 28, created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'f2', author: 'QuantMind_X', ticker: 'NVDA', trade_type: 'buy',
    entry_price: 872, pnl: 156, pnl_percent: 1.79,
    rationale: 'Bollinger Band squeeze + volume surge. AI sector momentum intact. Targeting $920.',
    copies: 9, likes: 41, created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'f3', author: 'IronBear_Pro', ticker: 'SPY', trade_type: 'sell',
    entry_price: 528.5, pnl: -88, pnl_percent: -0.17,
    rationale: 'Bearish engulfing on daily. Fed meeting uncertainty. Hedging longs with short SPY.',
    copies: 5, likes: 19, created_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TradeSocialFeed({ user, positions, onCopyTrade }) {
  const [feed, setFeed] = useState(mockFeed);
  const [likedIds, setLikedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('iint_liked_feed') || '[]'); } catch { return []; }
  });
  const [copiedIds, setCopiedIds] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [shareForm, setShareForm] = useState({ ticker: '', rationale: '' });
  const [loading, setLoading] = useState(false);

  const handleLike = (id) => {
    const newLiked = likedIds.includes(id) ? likedIds.filter(l => l !== id) : [...likedIds, id];
    setLikedIds(newLiked);
    localStorage.setItem('iint_liked_feed', JSON.stringify(newLiked));
    setFeed(f => f.map(p => p.id === id ? { ...p, likes: p.likes + (likedIds.includes(id) ? -1 : 1) } : p));
  };

  const handleCopy = (post) => {
    if (copiedIds.includes(post.id)) return;
    setCopiedIds(ids => [...ids, post.id]);
    setFeed(f => f.map(p => p.id === post.id ? { ...p, copies: p.copies + 1 } : p));
    onCopyTrade?.({
      ticker: post.ticker,
      trade_type: post.trade_type,
      entry_price: post.entry_price,
    });
  };

  const handleShare = () => {
    if (!shareForm.ticker || !shareForm.rationale) return;
    const myPos = positions.find(p => p.ticker === shareForm.ticker.toUpperCase());
    const newPost = {
      id: `u_${Date.now()}`,
      author: user?.full_name || 'You',
      ticker: shareForm.ticker.toUpperCase(),
      trade_type: myPos?.trade_type || 'buy',
      entry_price: myPos?.entry_price || 0,
      pnl: myPos?.pnl || 0,
      pnl_percent: myPos?.pnl_percent || 0,
      rationale: shareForm.rationale,
      copies: 0, likes: 0,
      created_at: new Date().toISOString(),
      isMe: true,
    };
    setFeed(f => [newPost, ...f]);
    setShareForm({ ticker: '', rationale: '' });
    setShowShare(false);
  };

  return (
    <div className="space-y-4">
      {/* Share button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#64748b]">Community trade signals & copy-trading feed</p>
        <button
          onClick={() => setShowShare(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00d4aa] text-[#070b14] hover:bg-[#00d4aa]/90 transition-colors"
        >
          <Share2 size={11} /> Share Signal
        </button>
      </div>

      {/* Share form */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[#0f172a] border border-[#00d4aa]/30 rounded-xl p-4 space-y-3"
          >
            <p className="text-sm font-semibold text-[#f1f5f9]">Share Your Trade Signal</p>
            <input
              value={shareForm.ticker}
              onChange={e => setShareForm(f => ({ ...f, ticker: e.target.value }))}
              placeholder="Ticker (e.g. AAPL, BTC/USD)"
              className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa]"
            />
            <textarea
              value={shareForm.rationale}
              onChange={e => setShareForm(f => ({ ...f, rationale: e.target.value }))}
              placeholder="Your trade rationale, entry logic, target..."
              rows={2}
              className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#00d4aa] resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowShare(false)} className="flex-1 py-2 border border-[#1e293b] text-[#64748b] rounded-lg text-xs hover:text-[#f1f5f9]">Cancel</button>
              <button onClick={handleShare} disabled={!shareForm.ticker || !shareForm.rationale} className="flex-1 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-xs font-bold disabled:opacity-40">Post Signal</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="space-y-3">
        {feed.map((post, idx) => {
          const isLiked = likedIds.includes(post.id);
          const isCopied = copiedIds.includes(post.id);
          const pnlPos = (post.pnl || 0) >= 0;
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-[#111827] border rounded-xl p-4 space-y-3 ${post.isMe ? 'border-[#00d4aa]/30' : 'border-[#1e293b]'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-sm font-bold text-[#64748b]">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#f1f5f9]">{post.author} {post.isMe && <span className="text-[#00d4aa]">· You</span>}</p>
                    <p className="text-[10px] text-[#475569]">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${post.trade_type === 'buy' ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'bg-red-500/10 text-red-400'}`}>
                    {post.trade_type?.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-[#f1f5f9]">{post.ticker}</span>
                </div>
              </div>

              {/* Rationale */}
              <p className="text-xs text-[#94a3b8] leading-relaxed">{post.rationale}</p>

              {/* Metrics */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-[#475569]">Entry</p>
                  <p className="text-xs font-semibold text-[#f1f5f9]">${post.entry_price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#475569]">P&L</p>
                  <p className={`text-xs font-bold ${pnlPos ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                    {pnlPos ? '+' : ''}${(post.pnl || 0).toFixed(2)} ({pnlPos ? '+' : ''}{(post.pnl_percent || 0).toFixed(2)}%)
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-400' : 'text-[#475569] hover:text-red-400'}`}>
                    <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} /> {post.likes}
                  </button>
                  <span className="flex items-center gap-1 text-xs text-[#475569]">
                    <Copy size={11} /> {post.copies}
                  </span>
                  {!post.isMe && (
                    <button
                      onClick={() => handleCopy(post)}
                      disabled={isCopied}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isCopied
                          ? 'bg-[#1e293b] text-[#64748b]'
                          : 'bg-[#a78bfa] text-[#070b14] hover:bg-[#a78bfa]/90'
                      }`}
                    >
                      <Copy size={10} /> {isCopied ? 'Copied!' : 'Copy Trade'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}