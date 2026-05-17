import React from 'react';
import { motion } from 'framer-motion';

/**
 * ZapBeam — Electric node spark that arcs from the Robot's chest panel
 * toward a target character, transforming them into their real skin.
 */
export default function ZapBeam({ from, to }) {
  // Simple centered arc — the actual characters are positioned by parent
  // so we just show a dramatic full-width flash + spark nodes
  const nodes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: 40 + Math.random() * 40,
    delay: i * 0.07,
    color: i % 3 === 0 ? '#00d4aa' : i % 3 === 1 ? '#fbbf24' : '#a78bfa',
  }));

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.2, times: [0, 0.1, 0.7, 1] }}
    >
      {/* Wide arc flash */}
      <motion.div
        className="absolute inset-x-0 bottom-20 h-1"
        style={{ background: 'linear-gradient(90deg, transparent 10%, #00d4aa 40%, #fbbf24 60%, transparent 90%)' }}
        animate={{ scaleY: [1, 3, 1, 3, 1], opacity: [0.8, 0.3, 0.8, 0.2, 0] }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />

      {/* Spark nodes */}
      {nodes.map(node => (
        <motion.div
          key={node.id}
          className="absolute rounded-full"
          style={{
            width: 6, height: 6,
            background: node.color,
            left: `${node.x}%`,
            bottom: `${node.y}%`,
            boxShadow: `0 0 8px ${node.color}`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.8, 0],
            opacity: [1, 1, 0],
            x: [(Math.random() - 0.5) * 40],
            y: [(Math.random() - 0.5) * 40],
          }}
          transition={{ duration: 0.7, delay: node.delay, ease: 'easeOut' }}
        />
      ))}

      {/* Central ring burst */}
      <motion.div
        className="absolute left-1/2 bottom-1/4 rounded-full border-2 border-[#00d4aa]"
        style={{ width: 40, height: 40, marginLeft: -20, marginBottom: -20 }}
        animate={{ scale: [0, 4], opacity: [1, 0] }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </motion.div>
  );
}