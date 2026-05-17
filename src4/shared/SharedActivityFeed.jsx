import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ImageIcon, TrendingUp, Award, BookOpen, Zap } from 'lucide-react';

/**
 * SharedActivityFeed — Bridges Academy & Trading platform
 * Displays concept visuals, achievements, insights, and community activity
 */

export default function SharedActivityFeed({ limit = 8, compact = false }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const [visuals, achievements, lessons] = await Promise.all([
          base44.entities.CollectibleNote.list('-created_date', limit).catch(() => []),
          base44.entities.UserAchievement.list('-earned_at', limit).catch(() => []),
          base44.entities.Lesson.list('-order_index', limit).catch(() => []),
        ]);

        // Build unified activity stream
        const merged = [
          ...visuals.map(v => ({
            id: `visual-${v.id}`,
            type: 'concept_visual',
            timestamp: v.created_date,
            data: v,
            title: v.title,
            icon: ImageIcon,
            color: v.faculty_color || '#00d4aa',
          })),
          ...achievements.map(a => ({
            id: `achievement-${a.id}`,
            type: 'badge',
            timestamp: a.earned_at,
            data: a,
            title: a.badge_name,
            icon: Award,
            color: '#f59e0b',
          })),
          ...lessons.map(l => ({
            id: `lesson-${l.id}`,
            type: 'lesson',
            timestamp: l.created_date,
            data: l,
            title: l.title,
            icon: BookOpen,
            color: '#a78bfa',
          })),
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

        setActivities(merged);
      } catch (err) {
        console.error('Activity feed error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-[#64748b]">
        <p className="text-sm">No activity yet. Start learning or trading to see updates here.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${compact ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
      <AnimatePresence>
        {activities.map((activity, idx) => {
          const Icon = activity.icon;
          const isVisual = activity.type === 'concept_visual';
          const isBadge = activity.type === 'badge';
          const isLesson = activity.type === 'lesson';

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#111827] border border-[#1e293b] rounded-lg p-4 hover:border-[#1e293b]/60 transition-all group"
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${activity.color}20` }}
                >
                  <Icon size={16} style={{ color: activity.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-[#f1f5f9] truncate">{activity.title}</h4>
                    <span className="text-[10px] text-[#475569] flex-shrink-0 whitespace-nowrap">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>

                  {/* Type badge + preview */}
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: `${activity.color}15`, color: activity.color }}
                    >
                      {isVisual ? 'Concept Visual' : isBadge ? 'Achievement' : 'Lesson'}
                    </span>

                    {isVisual && activity.data.rarity && (
                      <span className="text-[#94a3b8]">{activity.data.rarity} · {activity.data.faculty_name}</span>
                    )}
                    {isBadge && (
                      <span className="text-[#94a3b8]">{activity.data.badge_emoji} {activity.data.badge_rarity}</span>
                    )}
                    {isLesson && (
                      <span className="text-[#94a3b8]">{activity.data.faculty_name}</span>
                    )}
                  </div>

                  {/* Visual preview */}
                  {isVisual && activity.data.generated_image_url && (
                    <div className="mt-2 rounded overflow-hidden h-32 bg-[#070b14] border border-[#1e293b]">
                      <img
                        src={activity.data.generated_image_url}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function formatTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}