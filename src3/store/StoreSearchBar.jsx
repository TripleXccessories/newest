import React, { useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';

const QUESTION_WORDS = ['what', 'how', 'why', 'when', 'which', 'can', 'do', 'does', 'is', 'are', 'tell', 'explain', '?'];

export function isQuestion(text) {
  const lower = text.toLowerCase().trim();
  return QUESTION_WORDS.some(w => lower.startsWith(w) || lower.endsWith('?'));
}

/**
 * StoreSearchBar — handles both product search and question detection.
 * If the input looks like a question, fires onQuestion instead of onSearch.
 */
export default function StoreSearchBar({ onSearch, onQuestion }) {
  const [value, setValue] = useState('');
  const [hint, setHint] = useState(false);

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    setHint(isQuestion(v));
    onSearch(isQuestion(v) ? '' : v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    if (isQuestion(value)) {
      onQuestion(value.trim());
      setValue('');
      setHint(false);
    } else {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        {hint
          ? <MessageCircle size={15} className="absolute left-3.5 text-[#a78bfa]" />
          : <Search size={15} className="absolute left-3.5 text-[#475569]" />
        }
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search products — or ask a question and a staff member will answer…"
          className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#0a0f1e] border text-sm text-[#f1f5f9] placeholder-[#334155] outline-none transition-colors"
          style={{ borderColor: hint ? '#a78bfa55' : '#1e293b', boxShadow: hint ? '0 0 0 1px #a78bfa30' : 'none' }}
        />
        <button
          type="submit"
          className="absolute right-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
          style={{
            background: hint ? 'rgba(167,139,250,0.15)' : 'rgba(0,212,170,0.1)',
            color: hint ? '#a78bfa' : '#00d4aa',
            border: `1px solid ${hint ? '#a78bfa40' : '#00d4aa30'}`,
          }}
        >
          {hint ? 'Ask 💬' : 'Search'}
        </button>
      </div>
      {hint && (
        <p className="text-[9px] text-[#a78bfa] mt-1 ml-1">Press Enter or click Ask — a staff member behind the counter will answer</p>
      )}
    </form>
  );
}