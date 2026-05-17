import React, { useEffect, useRef, useState } from 'react';

// Finds all elements with borders/cards on the page and traces their edges
export default function BorderTracer({ active = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    segments: [],
    segIndex: 0,
    progress: 0,
    fadeOut: false,
    fadeIn: false,
    alpha: 0,
    tail: [],
    pauseTimer: 0,
    pausing: false,
  });

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Collect card/panel border rectangles from the DOM
    const collectSegments = () => {
      const selectors = [
        '.rounded-2xl',
        '.rounded-xl',
        '[class*="border border-"]',
        'aside',
        'header',
      ];
      const seen = new Set();
      const rects = [];

      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (seen.has(el)) return;
          seen.add(el);
          const r = el.getBoundingClientRect();
          // Skip tiny, off-screen, or full-viewport elements
          if (r.width < 60 || r.height < 40) return;
          if (r.top > window.innerHeight || r.bottom < 0) return;
          if (r.width > window.innerWidth * 0.98 && r.height > window.innerHeight * 0.95) return;
          rects.push({ x: r.left, y: r.top, w: r.width, h: r.height });
        });
      });

      // Build segments: each rect becomes 4 edge lines
      const segments = [];
      rects.forEach(({ x, y, w, h }) => {
        const pad = 1;
        // top, right, bottom, left edges
        segments.push({ x1: x + pad, y1: y + pad, x2: x + w - pad, y2: y + pad });
        segments.push({ x1: x + w - pad, y1: y + pad, x2: x + w - pad, y2: y + h - pad });
        segments.push({ x1: x + w - pad, y1: y + h - pad, x2: x + pad, y2: y + h - pad });
        segments.push({ x1: x + pad, y1: y + h - pad, x2: x + pad, y2: y + pad });
      });

      // Shuffle to make it feel organic/random patrol
      for (let i = segments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [segments[i], segments[j]] = [segments[j], segments[i]];
      }

      return segments;
    };

    const SPEED = 0.008;       // progress per frame along each segment
    const TAIL_LENGTH = 28;    // number of tail points
    const PAUSE_CHANCE = 0.003; // chance to pause at any frame
    const PAUSE_DURATION = 60;  // frames to pause

    stateRef.current.segments = collectSegments();
    stateRef.current.segIndex = 0;
    stateRef.current.progress = 0;
    stateRef.current.tail = [];
    stateRef.current.alpha = 0;
    stateRef.current.fadeIn = true;

    // Recollect segments periodically (layout may shift)
    const collectInterval = setInterval(() => {
      const newSegs = collectSegments();
      if (newSegs.length > 0) {
        stateRef.current.segments = newSegs;
      }
    }, 5000);

    const draw = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!s.segments.length) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Fade in
      if (s.fadeIn) {
        s.alpha = Math.min(1, s.alpha + 0.02);
        if (s.alpha >= 1) s.fadeIn = false;
      }

      // Pause logic
      if (s.pausing) {
        s.pauseTimer--;
        if (s.pauseTimer <= 0) {
          s.pausing = false;
          // Fade out then jump to new segment
          s.fadeOut = true;
        }
      } else if (!s.fadeOut && Math.random() < PAUSE_CHANCE) {
        s.pausing = true;
        s.pauseTimer = PAUSE_DURATION;
      }

      // Fade out and jump
      if (s.fadeOut) {
        s.alpha = Math.max(0, s.alpha - 0.04);
        if (s.alpha <= 0) {
          s.fadeOut = false;
          s.fadeIn = true;
          // Jump to a random far segment
          s.segIndex = Math.floor(Math.random() * s.segments.length);
          s.progress = 0;
          s.tail = [];
        }
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      if (!s.pausing) {
        s.progress += SPEED;
      }

      // Move to next segment
      if (s.progress >= 1) {
        s.progress = 0;
        s.segIndex = (s.segIndex + 1) % s.segments.length;

        // Occasionally skip to a random segment (worm-out effect)
        if (Math.random() < 0.25) {
          s.fadeOut = true;
        }
      }

      const seg = s.segments[s.segIndex];
      if (!seg) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const cx = seg.x1 + (seg.x2 - seg.x1) * s.progress;
      const cy = seg.y1 + (seg.y2 - seg.y1) * s.progress;

      // Update tail
      s.tail.unshift({ x: cx, y: cy });
      if (s.tail.length > TAIL_LENGTH) s.tail.pop();

      // Draw tail
      s.tail.forEach((pt, i) => {
        const t = 1 - i / TAIL_LENGTH;
        const tailAlpha = s.alpha * t * t;
        const radius = 2.5 * t;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 160, ${tailAlpha * 0.6})`;
        ctx.fill();
      });

      // Draw head glow
      if (s.tail.length > 0) {
        const head = s.tail[0];

        // Outer glow
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12);
        glow.addColorStop(0, `rgba(0, 255, 180, ${s.alpha * 0.5})`);
        glow.addColorStop(1, 'rgba(0, 212, 160, 0)');
        ctx.beginPath();
        ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 230, ${s.alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(collectInterval);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}