import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, ThumbsUp, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['bug', 'feature_request', 'ui_ux', 'signal_quality', 'general', 'other'];

export default function Feedback() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'general', title: '', description: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.Feedback.filter({ is_public: true }, '-created_date', 20).then(setItems).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.Feedback.create({ ...form, user_id: user?.id || 'anon', is_public: true });
    const updated = await base44.entities.Feedback.filter({ is_public: true }, '-created_date', 20);
    setItems(updated);
    setForm({ category: 'general', title: '', description: '', priority: 'medium' });
    setShowForm(false);
    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => setSuccess(false), 4000);
  };

  const statusColor = (status) => {
    if (status === 'resolved') return 'text-[#00d4aa] bg-[#00d4aa]/10';
    if (status === 'in_review') return 'text-[#f59e0b] bg-[#f59e0b]/10';
    return 'text-[#64748b] bg-[#1e293b]';
  };

  const catLabel = (c) => c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <MessageSquare size={22} className="text-[#00d4aa]" /> Beta Feedback
          </h1>
          <p className="text-sm text-[#64748b] mt-1">Your feedback shapes the platform. Every report matters.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold hover:bg-[#00d4aa]/90 transition-colors"
        >
          <Plus size={14} /> Submit Feedback
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-[#00d4aa]/10 border border-[#00d4aa]/30 rounded-xl">
          <CheckCircle size={18} className="text-[#00d4aa]" />
          <p className="text-sm text-[#00d4aa] font-medium">Feedback submitted! Thank you — we'll review it shortly.</p>
        </div>
      )}

      {showForm && (
        <div className="bg-[#111827] border border-[#00d4aa]/30 rounded-xl p-6">
          <h2 className="text-base font-semibold text-[#f1f5f9] mb-4">Submit New Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#64748b] mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748b] mb-1 block">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#00d4aa]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Brief summary of your feedback"
                required
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa]"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b] mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue or feature request in detail..."
                required
                rows={4}
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa] resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[#64748b] hover:text-[#f1f5f9]">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#00d4aa] text-[#070b14] rounded-lg text-sm font-bold disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback list */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-[#111827] border border-[#1e293b] rounded-xl">
            <MessageSquare size={32} className="text-[#1e293b] mx-auto mb-2" />
            <p className="text-sm text-[#64748b]">No feedback yet. Be the first to submit!</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-[#00d4aa]/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#1e293b] rounded text-xs text-[#64748b]">{catLabel(item.category)}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status?.replace('_', ' ')}</span>
              </div>
              <button className="flex items-center gap-1 text-xs text-[#64748b] hover:text-[#00d4aa] transition-colors">
                <ThumbsUp size={12} /> {item.upvotes || 0}
              </button>
            </div>
            <p className="text-sm font-semibold text-[#f1f5f9] mb-1">{item.title}</p>
            <p className="text-xs text-[#64748b] leading-relaxed">{item.description}</p>
            {item.admin_response && (
              <div className="mt-3 p-3 bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-lg">
                <p className="text-xs text-[#00d4aa] font-medium mb-1">IINT Team Response:</p>
                <p className="text-xs text-[#94a3b8]">{item.admin_response}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}