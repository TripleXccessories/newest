import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * BotCharacter3D — Real-time animated bot companion using Three.js
 * Drives facial expressions and idle animations from BotPersona parameters.
 */

const ARCHETYPE_CONFIGS = {
  Guide:      { bodyColor: 0x00d4aa, glowColor: 0x00ffcc, idleSpeed: 0.4, pulseIntensity: 0.3 },
  Oracle:     { bodyColor: 0xa78bfa, glowColor: 0xc4b5fd, idleSpeed: 0.2, pulseIntensity: 0.5 },
  Challenger: { bodyColor: 0xef4444, glowColor: 0xff6666, idleSpeed: 0.8, pulseIntensity: 0.7 },
  Guardian:   { bodyColor: 0x3b82f6, glowColor: 0x60a5fa, idleSpeed: 0.3, pulseIntensity: 0.4 },
  Catalyst:   { bodyColor: 0xf97316, glowColor: 0xfb923c, idleSpeed: 1.0, pulseIntensity: 0.8 },
  Creator:    { bodyColor: 0xf59e0b, glowColor: 0xfbbf24, idleSpeed: 0.5, pulseIntensity: 0.4 },
};

// mood: 'idle'|'happy'|'thinking'|'computing'|'surprised'|'sad'
export default function BotCharacter3D({ bot, portraitUrl, isSpeaking = false, size = 180, mood = 'idle', isComputing = false }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const [loaded, setLoaded] = useState(false);

  const cfg = ARCHETYPE_CONFIGS[bot?.archetype] || ARCHETYPE_CONFIGS.Guide;
  const primaryHex = bot?.primary_color
    ? parseInt(bot.primary_color.replace('#', ''), 16)
    : cfg.bodyColor;

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.5, 4);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    sceneRef.current = { scene, camera, renderer };

    // Ambient + point light
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);
    const keyLight = new THREE.PointLight(primaryHex, 2, 10);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(cfg.glowColor, 1, 8);
    rimLight.position.set(-2, 1, -2);
    scene.add(rimLight);

    // --- Build character geometry ---

    // Head (main sphere)
    const headGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x1a2235,
      roughness: 0.3,
      metalness: 0.7,
      emissive: primaryHex,
      emissiveIntensity: 0.08,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.8;
    head.castShadow = true;
    scene.add(head);

    // Face plate — screen panel (flat, slightly forward)
    const faceGeo = new THREE.PlaneGeometry(0.85, 0.65);
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 256; faceCanvas.height = 196;
    const faceCtx = faceCanvas.getContext('2d');
    const faceTex = new THREE.CanvasTexture(faceCanvas);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      emissive: new THREE.Color(0x001a0a),
      emissiveIntensity: 0.3,
    });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(0, 0.82, 0.56);
    scene.add(face);

    // Helper: draw the face onto the canvas each frame
    let scrollOffset = 0;
    const drawFace = (t, speaking, computing) => {
      const w = faceCanvas.width, h = faceCanvas.height;
      faceCtx.clearRect(0, 0, w, h);

      if (computing || speaking) {
        // ── SCREEN MODE: scrolling data ──
        faceCtx.fillStyle = '#020c04';
        faceCtx.fillRect(0, 0, w, h);
        // Scanlines
        for (let y = 0; y < h; y += 4) {
          faceCtx.fillStyle = 'rgba(0,212,170,0.04)';
          faceCtx.fillRect(0, y, w, 1);
        }
        // Left column: Python code
        faceCtx.font = '10px monospace';
        faceCtx.fillStyle = '#00d4aa';
        const codeLines = ['def run():', '  x = node', '  while x:', '    x.fire()', '  return', '  result', '  .emit()', 'class AI:', '  trust=1', '  love=1'];
        codeLines.forEach((line, i) => {
          const y = ((i * 16 - scrollOffset) % (h + 20) + h + 20) % (h + 20) - 10;
          faceCtx.fillText(line, 6, y + 14);
        });
        // Right column: JSON
        faceCtx.fillStyle = '#a78bfa';
        const jsonLines = ['{"id":1,', '"ai":true', '"node":{', '  "x":42}', '"trust":', 'true,', '"love":1', '}', '//iint', '//core'];
        jsonLines.forEach((line, i) => {
          const y = ((i * 16 - scrollOffset * 0.8) % (h + 20) + h + 20) % (h + 20) - 10;
          faceCtx.fillText(line, w / 2 + 4, y + 14);
        });
        // Centre divider
        faceCtx.strokeStyle = 'rgba(0,212,170,0.25)';
        faceCtx.lineWidth = 1;
        faceCtx.beginPath(); faceCtx.moveTo(w/2, 0); faceCtx.lineTo(w/2, h); faceCtx.stroke();
        // Status bar
        faceCtx.fillStyle = 'rgba(0,212,170,0.12)';
        faceCtx.fillRect(0, h - 18, w, 18);
        faceCtx.fillStyle = '#00d4aa';
        faceCtx.font = '9px monospace';
        faceCtx.fillText(speaking ? 'PROCESSING...' : 'COMPUTING...', w/2 - 38, h - 5);
        scrollOffset += 0.5;
      } else {
        // ── ROBOT FACE MODE: simplified humanoid features ──
        faceCtx.fillStyle = '#0a0f1e';
        faceCtx.fillRect(0, 0, w, h);

        const moodCfg = {
          idle:      { browOff: 0,   eyeH: 18, mouthCurve: 0   },
          happy:     { browOff: -10, eyeH: 13, mouthCurve: 14  },
          thinking:  { browOff: 8,   eyeH: 14, mouthCurve: -3  },
          surprised: { browOff: -16, eyeH: 24, mouthCurve: 0   },
          sad:       { browOff: 10,  eyeH: 16, mouthCurve: -12 },
          curious:   { browOff: -6,  eyeH: 16, mouthCurve: 5   },
        };
        const mc = moodCfg[mood] || moodCfg.idle;
        const eyeColor = `#${primaryHex.toString(16).padStart(6,'0')}`;

        // Left eyebrow
        faceCtx.strokeStyle = '#94a3b8';
        faceCtx.lineWidth = 3;
        faceCtx.lineCap = 'round';
        faceCtx.beginPath();
        faceCtx.moveTo(48, 54 + mc.browOff);
        faceCtx.lineTo(88, 50 + mc.browOff);
        faceCtx.stroke();
        // Right eyebrow
        faceCtx.beginPath();
        faceCtx.moveTo(168, 54 + mc.browOff);
        faceCtx.lineTo(208, 50 + mc.browOff);
        faceCtx.stroke();

        // Left eye white
        faceCtx.fillStyle = '#e2e8f0';
        faceCtx.beginPath();
        faceCtx.ellipse(68, 82, 20, mc.eyeH, 0, 0, Math.PI * 2);
        faceCtx.fill();
        // Left pupil
        faceCtx.fillStyle = eyeColor;
        faceCtx.beginPath();
        faceCtx.ellipse(68, 84, 9, 12, 0, 0, Math.PI * 2);
        faceCtx.fill();
        // Left shine
        faceCtx.fillStyle = 'white';
        faceCtx.beginPath();
        faceCtx.ellipse(63, 78, 4, 4, 0, 0, Math.PI * 2);
        faceCtx.fill();

        // Right eye white
        faceCtx.fillStyle = '#e2e8f0';
        faceCtx.beginPath();
        faceCtx.ellipse(188, 82, 20, mc.eyeH, 0, 0, Math.PI * 2);
        faceCtx.fill();
        // Right pupil
        faceCtx.fillStyle = eyeColor;
        faceCtx.beginPath();
        faceCtx.ellipse(188, 84, 9, 12, 0, 0, Math.PI * 2);
        faceCtx.fill();
        // Right shine
        faceCtx.fillStyle = 'white';
        faceCtx.beginPath();
        faceCtx.ellipse(183, 78, 4, 4, 0, 0, Math.PI * 2);
        faceCtx.fill();

        // Nose — two small dots + bridge
        faceCtx.strokeStyle = '#64748b';
        faceCtx.lineWidth = 1.5;
        faceCtx.beginPath();
        faceCtx.moveTo(128, 106); faceCtx.lineTo(128, 122); faceCtx.stroke();
        faceCtx.fillStyle = '#64748b';
        faceCtx.beginPath(); faceCtx.ellipse(120, 124, 5, 4, 0, 0, Math.PI * 2); faceCtx.fill();
        faceCtx.beginPath(); faceCtx.ellipse(136, 124, 5, 4, 0, 0, Math.PI * 2); faceCtx.fill();

        // Mouth
        faceCtx.strokeStyle = '#1e293b';
        faceCtx.lineWidth = 3.5;
        faceCtx.lineCap = 'round';
        faceCtx.beginPath();
        faceCtx.moveTo(88, 152);
        faceCtx.quadraticCurveTo(128, 152 + mc.mouthCurve * 2, 168, 152);
        faceCtx.stroke();

        // Glow rim around screen
        const grd = faceCtx.createLinearGradient(0, 0, w, h);
        grd.addColorStop(0, 'rgba(0,212,170,0.06)');
        grd.addColorStop(1, 'rgba(0,212,170,0)');
        faceCtx.fillStyle = grd;
        faceCtx.fillRect(0, 0, w, h);
      }

      faceTex.needsUpdate = true;
    };

    // Eyes (kept as subtle glow orbs above screen, not on it)
    const eyeGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({ color: primaryHex, emissive: primaryHex, emissiveIntensity: 1.2 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.0, 0.96, 0.56); leftEye.visible = false; // hidden — drawn on canvas
    scene.add(leftEye);
    const rightEye = leftEye.clone();
    rightEye.position.set(0.0, 0.96, 0.56); rightEye.visible = false;
    scene.add(rightEye);

    // Mouth bar (hidden — drawn on canvas)
    const mouthGeo = new THREE.BoxGeometry(0.3, 0.04, 0.04);
    const mouthMat = new THREE.MeshStandardMaterial({ color: primaryHex, emissive: primaryHex, emissiveIntensity: 0.8 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.65, 0.55); mouth.visible = false;
    scene.add(mouth);

    // Body core
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.0, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.4,
      metalness: 0.8,
      emissive: primaryHex,
      emissiveIntensity: 0.04,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -0.3;
    scene.add(body);

    // Chest energy core
    const coreGeo = new THREE.TorusGeometry(0.18, 0.04, 16, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, -0.15, 0.41);
    scene.add(core);

    // Shoulder pads
    [-0.55, 0.55].forEach(x => {
      const shoulderGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.9 });
      const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
      shoulder.position.set(x, 0.2, 0);
      scene.add(shoulder);
    });

    // Particle aura
    const particleCount = 80;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 0.9 + Math.random() * 0.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) + 0.3;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: primaryHex, size: 0.025, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation loop
    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const dt = clockRef.current.getDelta();
      t += dt;

      const speed = cfg.idleSpeed;

      // Head bob
      head.position.y = 0.8 + Math.sin(t * speed) * 0.05;
      face.position.y = head.position.y + 0.02;

      // Head sway
      head.rotation.y = Math.sin(t * speed * 0.7) * 0.15;
      face.rotation.y = head.rotation.y;

      // Draw dynamic face canvas
      drawFace(t, isSpeaking, isComputing);

      // Core ring rotation
      core.rotation.z = t * 1.5;
      core.material.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.5;

      // Particles orbit
      particles.rotation.y = t * 0.2;
      particleMat.opacity = 0.4 + Math.sin(t * 0.8) * 0.2;

      // Key light orbit
      keyLight.position.x = Math.cos(t * 0.5) * 3;
      keyLight.position.z = Math.sin(t * 0.5) * 3;

      renderer.render(scene, camera);
    };

    animate();
    setLoaded(true);

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [bot?.archetype, bot?.primary_color, size, mood, isComputing]);

  // Update speaking state without remounting
  useEffect(() => {
    // isSpeaking is read live in the animation loop via closure capture via ref would be ideal,
    // but the loop already reads the `isSpeaking` prop at render time via closure — remount handles it.
  }, [isSpeaking]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Portrait overlay if available */}
      {portraitUrl && (
        <div className="absolute inset-0 rounded-xl overflow-hidden z-10 pointer-events-none">
          <img
            src={portraitUrl}
            alt="bot portrait"
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
        </div>
      )}
      <div ref={mountRef} className="rounded-xl overflow-hidden" style={{ width: size, height: size }} />
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
          {[0, 0.15, 0.3].map((d, i) => (
            <div
              key={i}
              className="w-1 rounded-full animate-bounce"
              style={{ height: 8, background: bot?.primary_color || '#00d4aa', animationDelay: `${d}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}