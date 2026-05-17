import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Award, Zap, Bell, X } from 'lucide-react';

/**
 * NotificationCenter — Global notification system
 * Handles achievement toasts (120s with congrats), promo alerts, rental expiration warnings
 */

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  // Listen for achievement badges
  useEffect(() => {
    const unsubscribe = base44.entities.UserAchievement?.subscribe?.((event) => {
      if (event.type === 'create') {
        const badge = event.data;
        addNotification({
          id: `achievement-${badge.id}`,
          type: 'achievement',
          title: 'Achievement Unlocked',
          message: `Congratulations on receiving: ${badge.badge_name}! ${badge.badge_emoji}`,
          icon: Award,
          color: '#f59e0b',
          duration: 120000, // 120 seconds
          data: badge,
        });
      }
    });

    return () => unsubscribe?.();
  }, []);

  // Listen for new user rewards (promotions, gifts)
  useEffect(() => {
    const unsubscribe = base44.entities.UserReward?.subscribe?.((event) => {
      if (event.type === 'create') {
        const reward = event.data;
        addNotification({
          id: `reward-${reward.id}`,
          type: 'reward',
          title: reward.title,
          message: reward.notification_message || `You've received: ${reward.title}`,
          icon: Zap,
          color: '#00d4aa',
          duration: 15000, // 15 seconds for promos
          data: reward,
        });
      }
    });

    return () => unsubscribe?.();
  }, []);

  // Listen for bot rental expirations
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const rentals = await base44.entities.BotRental.list().catch(() => []);
        const now = new Date();

        rentals.forEach((rental) => {
          const expiresAt = new Date(rental.expires_at);
          const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

          // Show warning if expiring in 3 days or less (and we haven't already shown it)
          if (daysLeft <= 3 && daysLeft > 0 && !notifications.some(n => n.id === `rental-expiring-${rental.id}`)) {
            addNotification({
              id: `rental-expiring-${rental.id}`,
              type: 'rental_expiring',
              title: 'Bot Rental Expiring Soon',
              message: `Your mentor rental expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Renew now to continue.`,
              icon: Bell,
              color: '#f59e0b',
              duration: 10000,
              data: rental,
              action: { label: 'Renew', href: '/my-mentors' },
            });
          }
        });
      } catch (err) {
        console.error('Rental check error:', err);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [...prev, notif]);

    // Auto-remove after duration
    if (notif.duration) {
      setTimeout(() => {
        removeNotification(notif.id);
      }, notif.duration);
    }
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif, idx) => {
          const Icon = notif.icon;
          const isAchievement = notif.type === 'achievement';

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -10, x: 20 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto"
            >
              <div
                className="relative rounded-xl p-4 border backdrop-blur-sm shadow-2xl overflow-hidden group"
                style={{
                  background: `${notif.color}10`,
                  borderColor: `${notif.color}30`,
                  boxShadow: `0 0 30px ${notif.color}20`,
                }}
              >
                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${notif.color}10, transparent)`,
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Content */}
                <div className="relative flex gap-3 items-start">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <motion.div
                      animate={isAchievement ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : { scale: 1 }}
                      transition={{ duration: 0.6, repeat: isAchievement ? 2 : 0 }}
                    >
                      <Icon size={20} style={{ color: notif.color }} />
                    </motion.div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#f1f5f9]">{notif.title}</p>
                    <p className="text-xs text-[#d1d5db] mt-0.5 leading-snug">{notif.message}</p>

                    {/* Action button */}
                    {notif.action && (
                      <a
                        href={notif.action.href}
                        className="inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: notif.color,
                          color: '#070b14',
                          textDecoration: 'none',
                        }}
                      >
                        {notif.action.label} →
                      </a>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => removeNotification(notif.id)}
                    className="flex-shrink-0 text-[#64748b] hover:text-[#f1f5f9] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Progress bar for auto-dismiss */}
                {notif.duration && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5"
                    style={{ background: notif.color }}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: notif.duration / 1000, ease: 'linear' }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}