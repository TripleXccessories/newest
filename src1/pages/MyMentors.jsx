import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Bot, Clock, MessageSquare, Bell, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * MyMentors — Central dashboard for managing active bot rentals,
 * viewing chat history, rental status, and expiration alerts
 */

export default function MyMentors() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [botPersonas, setBotPersonas] = useState([]);
  const [userBotProfiles, setUserBotProfiles] = useState([]);
  const [botRentals, setBotRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.BotPersona.list(),
      base44.entities.UserBotProfile.list(),
      base44.entities.BotRental.list().catch(() => []),
    ])
      .then(([u, bots, profiles, rentals]) => {
        setUser(u);
        setBotPersonas(bots);
        setUserBotProfiles(profiles);
        setBotRentals(rentals);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeBots = userBotProfiles.filter(ubp => ubp.is_active_rental);

  const getBotDetails = (botId) => botPersonas.find(b => b.id === botId);

  const getRentalStatus = (ubp) => {
    const rental = botRentals.find(r => r.user_bot_profile_id === ubp.id);
    if (!rental) return null;

    const expiresAt = new Date(rental.expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysLeft <= 3;

    return {
      rental,
      daysLeft,
      isExpiringSoon,
      status: daysLeft > 0 ? 'active' : 'expired',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-[#64748b]">Loading your mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#f1f5f9] flex items-center gap-3">
          <Bot size={28} className="text-[#00d4aa]" />
          My Mentors
        </h1>
        <p className="text-sm text-[#64748b] mt-1">Manage active bot rentals, view chat history, and track expiration dates.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#475569] uppercase tracking-wider mb-2">Active Mentors</p>
          <p className="text-3xl font-bold text-[#f1f5f9]">{activeBots.length}</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#475569] uppercase tracking-wider mb-2">Total Conversations</p>
          <p className="text-3xl font-bold text-[#00d4aa]">
            {activeBots.reduce((sum, ubp) => sum + (ubp.interaction_count || 0), 0)}
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-[#475569] uppercase tracking-wider mb-2">Expiring Soon</p>
          <p className="text-3xl font-bold text-[#f59e0b]">
            {activeBots.filter(ubp => getRentalStatus(ubp)?.isExpiringSoon).length}
          </p>
        </div>
      </div>

      {/* Active Rentals */}
      {activeBots.length === 0 ? (
        <div className="text-center py-16 bg-[#111827] border border-[#1e293b] rounded-2xl">
          <Bot size={32} className="text-[#64748b] mx-auto mb-3" />
          <p className="text-[#64748b] mb-4">No active bot rentals yet.</p>
          <button
            onClick={() => navigate('/bot-rental')}
            className="px-4 py-2 bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-[#070b14] rounded-lg text-sm font-bold transition-colors"
          >
            Browse Mentors →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeBots.map((ubp, idx) => {
            const bot = getBotDetails(ubp.bot_persona_id);
            const rentalStatus = getRentalStatus(ubp);

            if (!bot) return null;

            return (
              <motion.div
                key={ubp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 hover:border-[#1e293b]/60 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Bot Aura dot */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${bot.primary_color}20`, border: `2px solid ${bot.primary_color}40` }}
                    >
                      <Bot size={20} style={{ color: bot.primary_color }} />
                    </div>

                    {/* Bot info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-[#f1f5f9]">{ubp.user_given_name || bot.name}</h3>
                        {rentalStatus?.isExpiringSoon && (
                          <span className="px-2 py-0.5 bg-[#f59e0b]/10 text-[#f59e0b] text-[10px] font-bold rounded">EXPIRING SOON</span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748b]">{bot.role_title}</p>
                      <p className="text-xs text-[#94a3b8] mt-1">{bot.archetype} · {bot.school}</p>
                    </div>
                  </div>

                  {/* Rental status badge */}
                  {rentalStatus && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-2">
                        <Clock size={14} style={{ color: rentalStatus.isExpiringSoon ? '#f59e0b' : '#00d4aa' }} />
                        <span className={`text-sm font-bold ${rentalStatus.isExpiringSoon ? 'text-[#f59e0b]' : 'text-[#00d4aa]'}`}>
                          {rentalStatus.daysLeft} day{rentalStatus.daysLeft !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#64748b]">expires {new Date(rentalStatus.rental.expires_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-[#1e293b]">
                  <div>
                    <p className="text-[10px] text-[#475569] uppercase tracking-wider mb-1">Conversations</p>
                    <p className="text-lg font-bold text-[#f1f5f9]">{ubp.interaction_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#475569] uppercase tracking-wider mb-1">Called</p>
                    <p className="text-sm text-[#94a3b8] font-medium">{ubp.call_me_as || 'Trader'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#475569] uppercase tracking-wider mb-1">Active</p>
                    <p className="text-sm font-bold text-[#00d4aa]">{ubp.is_active_rental ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/rental-room?bot=${bot.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b] hover:bg-[#1e293b]/60 text-[#f1f5f9] text-sm font-medium transition-colors"
                  >
                    <MessageSquare size={14} /> Enter Room
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border border-[#1e293b] hover:border-[#00d4aa]/40 text-[#64748b] hover:text-[#f1f5f9] text-sm font-medium transition-colors"
                  >
                    <Zap size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}