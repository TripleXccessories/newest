import React, { useEffect, useRef, useState } from 'react';

/**
 * LivingLight — Global ambient light pulse that travels through the UI's crevices.
 * A single canvas overlay renders long-tailed photon trails that drift along
 * the edges and grooves of the viewport, faint but profound.
 */

const COLORS = [
  'rgba(0, 212, 170,', // teal
  'rgba(167, 139, 250,', // violet
  'rgba(251, 191, 36,',  // amber
  'rgba(96, 165, 250,',  // blue
  'rgba(0, 212, 170,',   // teal again (weighted)
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

class Photon {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Start from a random edge or groove (sides, top, bottom, or a horizontal/vertical crease)
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) { this.x = 0; this.y = randomBetween(0, h); this.vx = randomBetween(0.3, 1.2); this.vy = randomBetween(-0.3, 0.3); }
    else if (edge === 1) { this.x = w; this.y = randomBetween(0, h); this.vx = -randomBetween(0.3, 1.2); this.vy = randomBetween(-0.3, 0.3); }
    else if (edge === 2) { this.x = randomBetween(0, w); this.y = 0; this.vx = randomBetween(-0.3, 0.3); this.vy = randomBetween(0.3, 1.2); }
    else { this.x = randomBetween(0, w); this.y = h; this.vx = randomBetween(-0.3, 0.3); this.vy = -randomBetween(0.3, 1.2); }

    // Occasionally snap to a "groove" — a fixed horizontal or vertical seam
    const useGroove = Math.random() < 0.5;
    if (useGroove) {
      // Horizontal grooves approximate where card/panel edges sit
      const grooveY = [56, 112, 180, 250, 360, 480, 600, h * 0.3, h * 0.5, h * 0.7, h - 80];
      const grooveX = [0, w * 0.25, w * 0.5, w * 0.75, w];
      if (Math.random() < 0.6) {
        this.y = grooveY[Math.floor(Math.random() * grooveY.length)];
        this.vy = 0;
        this.vx = (Math.random() < 0.5 ? 1 : -1) * randomBetween(0.5, 1.5);
      } else {
        this.x = grooveX[Math.floor(Math.random() * grooveX.length)];
        this.vx = 0;
        this.vy = (Math.random() < 0.5 ? 1 : -1) * randomBetween(0.5, 1.5);
      }
    }

    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = randomBetween(0.04, 0.13);
    this.life = 0;
    this.maxLife = randomBetween(180, 480);
    this.radius = randomBetween(1.5, 3.5);
    this.tail = [];
    this.tailLength = Math.floor(randomBetween(40, 120));
    // Slight curve
    this.curve = randomBetween(-0.008, 0.008);
  }

  update() {
    this.tail.push({ x: this.x, y: this.y });
    if (this.tail.length > this.tailLength) this.tail.shift();

    // Apply gentle curve
    this.vx += this.curve;
    this.vy += this.curve * 0.5;

    this.x += this.vx;
    this.y += this.vy;
    this.life++;

    if (
      this.life > this.maxLife ||
      this.x < -50 || this.x > this.canvas.width + 50 ||
      this.y < -50 || this.y > this.canvas.height + 50
    ) {
      this.reset();
    }
  }

  draw(ctx) {
    if (this.tail.length < 2) return;

    // Fade in / fade out based on life
    const lifePct = this.life / this.maxLife;
    const fadeAlpha = lifePct < 0.1
      ? this.alpha * (lifePct / 0.1)
      : lifePct > 0.8
      ? this.alpha * (1 - (lifePct - 0.8) / 0.2)
      : this.alpha;

    for (let i = 1; i < this.tail.length; i++) {
      const t = i / this.tail.length;
      const a = fadeAlpha * t * t; // squared — bright at head, dim at tail
      ctx.beginPath();
      ctx.moveTo(this.tail[i - 1].x, this.tail[i - 1].y);
      ctx.lineTo(this.tail[i].x, this.tail[i].y);
      ctx.strokeStyle = `${this.color}${a})`;
      ctx.lineWidth = this.radius * t;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Head glow
    const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4);
    grd.addColorStop(0, `${this.color}${fadeAlpha * 0.8})`);
    grd.addColorStop(1, `${this.color}0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }
}

export default function LivingLight({ active = true, count = 7 }) {
  const canvasRef = useRef(null);
  const photonsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    photonsRef.current = Array.from({ length: count }, () => new Photon(canvas));

    // Stagger starts so they don't all appear at once
    photonsRef.current.forEach((p, i) => {
      p.life = Math.floor((i / count) * p.maxLife);
    });

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      photonsRef.current.forEach(p => { p.update(); p.draw(ctx); });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active, count]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}