import React, { useState } from 'react';
import { Users, MessageCircle, ThumbsUp, Share2, Plus } from 'lucide-react';

const mockPosts = [
  { id: '1', author: 'NeuralTrader_X', avatar: 'NT', time: '2h ago', content: 'Just caught the BTC breakout at $67,240 using the IINT signal. Target at $72K looking very clean. This neural engine is something else 🔥', likes: 24, comments: 8, tag: 'Signal Discussion' },
  { id: '2', author: 'AlphaSeeker99', avatar: 'AS', time: '4h ago', content: 'Paper trading week 3 update: +18.4% return using mostly swing signals on NVDA and ETH. The AI confidence scores have been surprisingly accurate.', likes: 41, comments: 15, tag: 'Performance Update' },
  { id: '3', author: 'SignalHunter', avatar: 'SH', time: '6h ago', content: 'Question for the community: how are you sizing positions in paper trading? I\'m using 2% per trade max risk and it\'s been working well with the IINT stop loss levels.', likes: 17, comments: 23, tag: 'Strategy' },
  { id: '4', author: 'EdgeTrader22', avatar: 'ET', time: '1d ago', content: 'The EUR/USD short signal from yesterday hit target. 1.0720 achieved. R:R of 1:1.8 as indicated. Starting to really trust the AI reasoning on forex pairs.', likes: 33, comments: 11, tag: 'Trade Journal' },
];

const TAGS = ['All', 'Signal Discussion', 'Performance Update', 'Strategy', 'Trade Journal', 'Feedback'];

export default function Community() {
  const [tag, setTag] = useState('All');
  const [showPost, setShowPost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [liked, setLiked] = useState({});

  const filtered = tag === 'All' ? mockPosts : mockPosts.filter((p) => p.tag === tag);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Users size={22} className="text-[#00d4aa]" /> Community
          </h1>
          <p className="text-sm text-[#64748b] mt-1">Connect with fellow IINT beta traders. Share ideas, strategies, and results.</p>
        </div>
        <button
          onClick={() => setShowPost(!showPost)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold hover:bg-[#00d4aa]/90 transition-colors"
        >
          <Plus size={14} /> Post
        </button>
      </div>

      {/* New post */}
      {showPost && (
        <div className="bg-[#111827] border border-[#00d4aa]/30 rounded-xl p-4">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share a trade, signal insight, or strategy tip with the community..."
            className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa] resize-none h-24"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowPost(false)} className="px-3 py-1.5 text-xs text-[#64748b] hover:text-[#f1f5f9]">Cancel</button>
            <button className="px-4 py-1.5 bg-[#00d4aa] text-[#070b14] rounded-lg text-xs font-bold">Post</button>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              tag === t ? 'bg-[#00d4aa] text-[#070b14] border-[#00d4aa]' : 'border-[#1e293b] text-[#64748b] hover:border-[#00d4aa]/40 hover:text-[#f1f5f9]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <div key={post.id} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 hover:border-[#00d4aa]/20 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00d4aa]/20 border border-[#00d4aa]/30 flex items-center justify-center text-xs font-bold text-[#00d4aa]">
                  {post.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f1f5f9]">{post.author}</p>
                  <p className="text-xs text-[#64748b]">{post.time}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#1e293b] rounded text-[10px] text-[#64748b]">{post.tag}</span>
            </div>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">{post.content}</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLiked({ ...liked, [post.id]: !liked[post.id] })}
                className={`flex items-center gap-1.5 text-xs transition-colors ${liked[post.id] ? 'text-[#00d4aa]' : 'text-[#64748b] hover:text-[#f1f5f9]'}`}
              >
                <ThumbsUp size={13} /> {post.likes + (liked[post.id] ? 1 : 0)}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                <MessageCircle size={13} /> {post.comments}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#f1f5f9] transition-colors">
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}