import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LightbulbGuy from '@/components/effects/LightbulbGuy';

/**
 * DancingCharacter — renders one character doing their signature dance move.
 * Each archetype has a distinct animation personality.
 */

// Per-character dance move definitions
const DANCE_MOVES = {
  bounce: {
    // Lightbulb — big happy bounces, waves both gloves
    animate: { y: [0, -30, 0, -18, 0], rotate: [-4, 4, -4, 4, 0] },
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
  },
  sway: {
    // Pathfinder — side to side confident sway
    animate: { x: [-20, 20, -20], rotate: [-8, 8, -8] },
    transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
  },
  spin: {
    // Weaver — joyful spin with a little jump
    animate: { rotate: [0, 360], y: [0, -15, 0] },
    transition: { duration: 1.0, repeat: Infinity, ease: 'linear' },
  },
  flap: {
    // Ember — phoenix flap: rise and fall
    animate: { y: [0, -40, -10, -35, 0], scaleX: [1, 1.1, 1, 0.95, 1] },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
  glitch: {
    // Analyst — data glitch: micro jitters
    animate: { x: [0, -4, 6, -2, 4, 0], skewX: [0, -4, 3, -2, 0] },
    transition: { duration: 0.4, repeat: Infinity, ease: 'steps(4)' },
  },
  conduct: {
    // Conductor — arms up conducting, rhythmic up-down
    animate: { y: [0, -20, 0], scaleY: [1, 1.05, 1], rotate: [0, -3, 3, 0] },
    transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
  },
  stomp: {
    // Dialectic — stomp/power bounce
    animate: { y: [0, -12, 0], scaleX: [1, 1.05, 1], scaleY: [1, 0.95, 1] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeOut' },
  },
  slither: {
    // Serpent — smooth wave motion
    animate: { x: [-15, 15, -15], y: [0, -8, 0, -8, 0], rotate: [-6, 6, -6] },
    transition: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' },
  },
  jolt: {
    // Storm — electric snap jolts
    animate: { x: [0, 8, -8, 6, -4, 0], y: [0, -6, 0, -10, 0], rotate: [0, 4, -4, 2, 0] },
    transition: { duration: 0.35, repeat: Infinity, ease: 'steps(5)' },
  },
};

// Glove config per dance mood
const DANCE_GLOVES = {
  bounce:   { left: 'wave',        right: 'wave' },
  sway:     { left: 'point_right', right: 'point_right' },
  spin:     { left: 'wave',        right: 'point_up' },
  flap:     { left: 'point_up',    right: 'point_up' },
  glitch:   { left: 'temple',      right: 'temple' },
  conduct:  { left: 'point_up',    right: 'point_up' },
  stomp:    { left: 'down',        right: 'cup' },
  slither:  { left: 'wave',        right: 'wave' },
  jolt:     { left: 'point_right', right: 'point_up' },
};

// For non-lightbulb characters — emoji + colored silhouette before zap
function CharSilhouette({ char, transformed, size = 80 }) {
  const emoji = getCharEmoji(char.id);
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className="flex items-center justify-center rounded-full text-3xl"
        style={{
          width: size, height: size,
          background: transformed
            ? `radial-gradient(circle, ${char.color}30, ${char.color}08)`
            : `radial-gradient(circle, ${char.color}18, transparent)`,
          border: transformed ? `2px solid ${char.color}` : `1px dashed ${char.color}60`,
          boxShadow: transformed ? `0 0 20px ${char.color}60` : 'none',
          fontSize: transformed ? 42 : 32,
        }}
        animate={transformed ? {
          boxShadow: [`0 0 20px ${char.color}40`, `0 0 40px ${char.color}80`, `0 0 20px ${char.color}40`],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {emoji}
      </motion.div>
      {transformed && (
        <motion.div
          className="text-[9px] font-bold text-center"
          style={{ color: char.color, maxWidth: 80 }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {char.label}
        </motion.div>
      )}
    </div>
  );
}

export default function DancingCharacter({ char, xPos, stage, isZapped, isTransformed, dancing }) {
  const danceMove = DANCE_MOVES[char.danceStyle] || DANCE_MOVES.bounce;
  const gloves = DANCE_GLOVES[char.danceStyle] || DANCE_GLOVES.bounce;
  const isLightbulb = char.id === 'lightbulb';

  // Entry: drop from top
  const entryVariants = {
    hidden: { y: -200, opacity: 0, scale: 0.5 },
    visible: { y: 0, opacity: 1, scale: 1,
      transition: { type: 'spring', stiffness: 180, damping: 14 } },
    exit: { y: 200, opacity: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="absolute bottom-20 flex flex-col items-center"
      style={{ left: `${xPos}%`, transform: 'translateX(-50%)' }}
      variants={entryVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Character label above */}
      <motion.div
        className="text-[9px] font-bold mb-1 px-2 py-0.5 rounded-full"
        style={{ color: char.color, background: `${char.color}18`, border: `1px solid ${char.color}30` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {char.label}
      </motion.div>

      {/* Dancing body */}
      <motion.div
        animate={dancing ? danceMove.animate : { y: 0 }}
        transition={dancing ? danceMove.transition : {}}
      >
        {isLightbulb ? (
          <LightbulbGuy
            mood={dancing ? 'excited' : 'happy'}
            gloveLeft={dancing ? gloves.left : 'down'}
            gloveRight={dancing ? gloves.right : 'down'}
            showSoundWaves={dancing}
            size={100}
          />
        ) : (
          <CharSilhouette char={char} transformed={isTransformed} size={72} />
        )}
      </motion.div>

      {/* Zap flash overlay */}
      {isZapped && !isTransformed && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${char.color}cc, transparent)` }}
          initial={{ opacity: 1, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.8 }}
        />
      )}
    </motion.div>
  );
}

function getCharEmoji(id) {
  const map = {
    lightbulb: '💡', pathfinder: '🗺️', weaver: '🧵', ember: '🔥',
    analyst: '🔮', conductor: '⚡', dialectic: '⚔️', serpent: '🐍', storm: '🌩️',
  };
  return map[id] || '✨';
}