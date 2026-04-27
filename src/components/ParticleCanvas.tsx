import { useEffect, useRef } from 'react';

type BaseParticle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

type SparkleParticle = BaseParticle & {
  type: 'sparkle';
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleDir: number;
};

type OrbParticle = BaseParticle & {
  type: 'orb';
  baseOpacity: number;
};

type BurstParticle = BaseParticle & {
  type: 'burst';
  life: number;
  maxLife: number;
};

type Particle = SparkleParticle | OrbParticle | BurstParticle;

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = globalThis.innerWidth;
    let height = globalThis.innerHeight;

    // Pre-render orb to offscreen canvas for massive performance boost
    const orbCanvas = document.createElement('canvas');
    orbCanvas.width = 100;
    orbCanvas.height = 100;
    const orbCtx = orbCanvas.getContext('2d');
    if (orbCtx) {
      const gradient = orbCtx.createRadialGradient(50, 50, 0, 50, 50, 50);
      gradient.addColorStop(0, 'rgba(255, 209, 220, 1)');
      gradient.addColorStop(1, 'rgba(255, 209, 220, 0)');
      orbCtx.fillStyle = gradient;
      orbCtx.beginPath();
      orbCtx.arc(50, 50, 50, 0, Math.PI * 2);
      orbCtx.fill();
    }
    
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const initCanvas = () => {
      width = globalThis.innerWidth;
      height = globalThis.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(globalThis.innerWidth / 15, 80);
      
      for (let i = 0; i < particleCount; i++) {
        const isOrb = Math.random() > 0.6;
        particles.push(createParticle(isOrb ? 'orb' : 'sparkle'));
      }
    };

    const createParticle = (type: 'sparkle' | 'orb' | 'burst', x?: number, y?: number): Particle => {
      if (type === 'burst') {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        return {
          x: x ?? 0,
          y: y ?? 0,
          size: Math.random() * 2 + 1,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          opacity: 1,
          type: 'burst',
          life: 1,
          maxLife: Math.random() * 40 + 40
        };
      }

      if (type === 'orb') {
        return {
          x: x ?? Math.random() * width,
          y: y ?? Math.random() * height,
          size: Math.random() * 25 + 15,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2 - 0.1,
          opacity: Math.random() * 0.15 + 0.05,
          baseOpacity: Math.random() * 0.15 + 0.05,
          type: 'orb'
        };
      }

      return {
        x: x ?? Math.random() * width,
        y: y ?? Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.1,
        speedY: -Math.random() * 0.3 - 0.1,
        opacity: Math.random(),
        baseOpacity: Math.random(),
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        type: 'sparkle'
      };
    };

    const handlePointerDown = (e: PointerEvent) => {
      for (let i = 0; i < 16; i++) {
        particles.push(createParticle('burst', e.clientX, e.clientY));
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const updateBurst = (p: BurstParticle, i: number) => {
      p.life++;
      p.opacity = 1 - (p.life / p.maxLife);
      p.y += 0.5;
      
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        return false;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 192, 203, ${p.opacity})`;
      ctx.fill();
      return true;
    };

    const wrapEdges = (p: Particle) => {
      if (p.x < -50) p.x = width + 50;
      if (p.x > width + 50) p.x = -50;
      if (p.y < -50) p.y = height + 50;
      if (p.y > height + 50) p.y = -50;
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      const parallaxX = (mouseX - width / 2) * 0.02;
      const parallaxY = (mouseY - height / 2) * 0.02;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.type === 'burst') {
          updateBurst(p, i);
          continue;
        }

        wrapEdges(p);

        const px = p.x + (p.type === 'orb' ? parallaxX * 1.5 : parallaxX * 0.5);
        const py = p.y + (p.type === 'orb' ? parallaxY * 1.5 : parallaxY * 0.5);

        if (p.type === 'sparkle') {
          p.opacity += p.twinkleSpeed * p.twinkleDir;
          if (p.opacity >= 1) {
            p.opacity = 1;
            p.twinkleDir = -1;
          } else if (p.opacity <= 0.1) {
            p.opacity = 0.1;
            p.twinkleDir = 1;
          }
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
          ctx.fill();
        } else if (p.type === 'orb') {
          // Use pre-rendered offscreen canvas for massive performance boost
          ctx.globalAlpha = p.opacity;
          ctx.drawImage(
            orbCanvas,
            px - p.size,
            py - p.size,
            p.size * 2,
            p.size * 2
          );
          ctx.globalAlpha = 1;
        }
      }

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    globalThis.addEventListener('resize', initCanvas);
    globalThis.addEventListener('pointerdown', handlePointerDown);
    globalThis.addEventListener('pointermove', handlePointerMove);

    initCanvas();
    drawParticles();

    return () => {
      globalThis.removeEventListener('resize', initCanvas);
      globalThis.removeEventListener('pointerdown', handlePointerDown);
      globalThis.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default ParticleCanvas;
