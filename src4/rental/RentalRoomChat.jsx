import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Send, Loader, AlertCircle } from 'lucide-react';

/**
 * RentalRoomChat — Real-time bot conversation interface
 * Uses generateFacultyDialogue to create context-aware responses
 */

export default function RentalRoomChat({ bot, displayName, calledAs, greeting, aura, theme }) {
  const [messages, setMessages] = useState([
    {
      id: 'greeting',
      role: 'bot',
      content: greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Call generateFacultyDialogue to get contextual response
      const response = await base44.functions.invoke('generateFacultyDialogue', {
        bot_id: bot.id,
        bot_name: bot.name,
        bot_archetype: bot.archetype,
        bot_school: bot.school,
        faculty_traits: bot.traits || {},
        user_name: calledAs,
        user_message: input,
        conversation_context: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const botResponse = response.data?.dialogue || response.data || 'I appreciate that, but I need a moment to think.';

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'bot',
        content: botResponse,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setError('Connection lost. Please try again.');
      console.error('Dialogue error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-3 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg text-sm leading-relaxed transition-all ${
                  msg.role === 'user'
                    ? 'bg-[#1e293b] text-[#f1f5f9] rounded-br-none'
                    : 'rounded-bl-none'
                }`}
                style={
                  msg.role === 'bot'
                    ? {
                        background: `${aura}15`,
                        color: '#f1f5f9',
                        borderLeft: `3px solid ${aura}`,
                      }
                    : {}
                }
              >
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === 'bot' ? 'opacity-50' : 'text-[#475569]'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div
              className="px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2 text-sm"
              style={{
                background: `${aura}15`,
                color: '#f1f5f9',
              }}
            >
              <Loader className="w-4 h-4 animate-spin" />
              <span className="opacity-70">{displayName} is thinking...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="space-y-3 border-t" style={{ borderColor: `${aura}20` }}>
        <div className="flex gap-2 pt-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${displayName} something...`}
            className="flex-1 px-4 py-3 rounded-lg bg-[#111827] border text-[#f1f5f9] placeholder-[#475569] text-sm resize-none focus:outline-none transition-all"
            style={{
              borderColor: `${aura}30`,
              minHeight: '44px',
              maxHeight: '120px',
            }}
            rows="1"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: aura,
              color: '#070b14',
              boxShadow: !loading && input.trim() ? `0 0 20px ${aura}40` : 'none',
            }}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Tips */}
        <p className="text-[10px] text-[#334155] text-center">
          Shift+Enter for new line • Bot responses are AI-generated
        </p>
      </div>
    </div>
  );
}