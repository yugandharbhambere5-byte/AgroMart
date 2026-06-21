'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
}

interface GradientBlob {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  angle: number;
  angleSpeed: number;
  baseX: number;
  baseY: number;
  range: number;
}

export function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let blobs: GradientBlob[] = [];
    const particleCount = 45;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const isDark = resolvedTheme === 'dark';

    // Enhanced particle colors for visibility in light and dark mode
    const getParticleColor = (isDarkTheme: boolean) => {
      const colors = isDarkTheme
        ? [
            'rgba(52, 211, 153, 0.55)', // Glowing Mint
            'rgba(16, 185, 129, 0.45)', // Emerald
            'rgba(245, 158, 11, 0.45)',  // Amber
          ]
        : [
            'rgba(5, 150, 105, 0.35)',   // Rich Emerald
            'rgba(16, 185, 129, 0.35)',  // Medium Emerald
            'rgba(217, 119, 6, 0.35)',   // Rich Amber
            'rgba(13, 148, 136, 0.32)',  // Teal
          ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const createParticle = (): Particle => {
      // Light mode particles are slightly larger and have more solid opacities to stand out
      const sizeMultiplier = isDark ? 1.0 : 1.4;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: (Math.random() * 4.5 + 2) * sizeMultiplier,
        speedX: (Math.random() * 0.3 - 0.15),
        speedY: -(Math.random() * 0.45 + 0.15), // Gentle upward drift
        opacity: isDark ? (Math.random() * 0.6 + 0.15) : (Math.random() * 0.55 + 0.25),
        color: getParticleColor(isDark),
        wobble: Math.random() * Math.PI,
        wobbleSpeed: Math.random() * 0.015 + 0.005,
      };
    };

    // Initialize large shifting gradient background blobs
    const initBlobs = () => {
      const w = canvas.width;
      const h = canvas.height;

      blobs = [
        {
          x: w * 0.2,
          y: h * 0.2,
          baseX: w * 0.2,
          baseY: h * 0.2,
          radius: Math.min(w, h) * 0.35,
          color: isDark ? 'rgba(16, 185, 129, 0.04)' : 'rgba(16, 185, 129, 0.09)', // Mint/Green
          speedX: 0.15,
          speedY: 0.1,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: 0.001,
          range: 80,
        },
        {
          x: w * 0.8,
          y: h * 0.3,
          baseX: w * 0.8,
          baseY: h * 0.3,
          radius: Math.min(w, h) * 0.4,
          color: isDark ? 'rgba(245, 158, 11, 0.02)' : 'rgba(251, 191, 36, 0.08)', // Gold/Amber
          speedX: -0.1,
          speedY: 0.15,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: 0.0008,
          range: 100,
        },
        {
          x: w * 0.4,
          y: h * 0.7,
          baseX: w * 0.4,
          baseY: h * 0.7,
          radius: Math.min(w, h) * 0.38,
          color: isDark ? 'rgba(13, 148, 136, 0.03)' : 'rgba(45, 212, 191, 0.07)', // Teal
          speedX: 0.12,
          speedY: -0.12,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: 0.0012,
          range: 90,
        }
      ];
    };

    // Initialize particles & blobs
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
    initBlobs();

    const mouse = { x: -1000, y: -1000, radius: 140 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw and shift the large background gradient blobs
      blobs.forEach((b) => {
        b.angle += b.angleSpeed;
        b.x = b.baseX + Math.sin(b.angle) * b.range;
        b.y = b.baseY + Math.cos(b.angle) * b.range;

        // Draw radial gradient
        const grad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.1, b.x, b.y, b.radius);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // 2. Draw and move floating particles
      particles.forEach((p) => {
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.2;
        p.y += p.speedY;

        // Mouse repelling interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x -= Math.cos(angle) * force * 2.2;
          p.y -= Math.sin(angle) * force * 2.2;
        }

        // Loop boundaries
        if (p.y < -15) {
          p.y = canvas.height + 15;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -15) p.x = canvas.width + 15;
        if (p.x > canvas.width + 15) p.x = -15;

        // Render particle with soft glowing shadows
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        
        // Glow effect is more visible in dark mode, but subtle shadow in light mode helps stand out
        ctx.shadowBlur = isDark ? 10 : 4;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 select-none bg-transparent"
    />
  );
}
