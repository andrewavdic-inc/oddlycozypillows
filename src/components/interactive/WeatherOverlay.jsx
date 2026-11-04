import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function WeatherOverlay({ activeWeather }) {
  const canvasRef = useRef(null);

  // Trigger extra confetti burst when 'confetti' mode is selected
  useEffect(() => {
    if (activeWeather === 'confetti') {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.25 },
        colors: ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF6392'],
      });
    }
  }, [activeWeather]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeWeather === 'none') return;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles based on weather mode
    const count =
      activeWeather === 'rain'
        ? 95
        : activeWeather === 'snow'
        ? 70
        : activeWeather === 'birds'
        ? 14
        : activeWeather === 'sunshine'
        ? 35
        : 55;

    const colors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF6392'];

    const particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size:
        activeWeather === 'birds'
          ? 14 + Math.random() * 10
          : activeWeather === 'sunshine'
          ? 8 + Math.random() * 20
          : 4 + Math.random() * 6,
      speedX:
        activeWeather === 'birds'
          ? 1.8 + Math.random() * 2.2
          : (Math.random() - 0.5) * 1.5,
      speedY:
        activeWeather === 'rain'
          ? 9 + Math.random() * 6
          : activeWeather === 'snow'
          ? 1.2 + Math.random() * 1.8
          : activeWeather === 'birds'
          ? Math.sin(i) * 0.4
          : 1.5 + Math.random() * 2,
      color: colors[i % colors.length],
      phase: Math.random() * Math.PI * 2,
    }));

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw warm sunbeams in top-right when 'sunshine' is active
      if (activeWeather === 'sunshine') {
        const sunGrad = ctx.createRadialGradient(
          canvas.width * 0.85,
          80,
          10,
          canvas.width * 0.85,
          80,
          380
        );
        sunGrad.addColorStop(0, 'rgba(255, 202, 58, 0.55)');
        sunGrad.addColorStop(0.5, 'rgba(255, 146, 76, 0.22)');
        sunGrad.addColorStop(1, 'rgba(255, 202, 58, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rotating sun rays
        ctx.save();
        ctx.translate(canvas.width * 0.85, 80);
        ctx.rotate(time * 0.0003);
        for (let r = 0; r < 12; r++) {
          ctx.rotate((Math.PI * 2) / 12);
          ctx.fillStyle = 'rgba(255, 220, 100, 0.12)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(420, -25);
          ctx.lineTo(420, 25);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      particles.forEach((p) => {
        if (activeWeather === 'rain') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + 16);
          ctx.stroke();
          p.y += p.speedY;
          p.x -= 0.8;
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        } else if (activeWeather === 'snow') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          p.y += p.speedY;
          p.x += Math.sin(time * 0.002 + p.phase) * 0.8;
          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        } else if (activeWeather === 'birds') {
          // Animated flapping V-wing bird
          const flap = Math.sin(time * 0.009 + p.phase) * 9;
          ctx.strokeStyle = '#1E1E24';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size, p.y - flap);
          ctx.quadraticCurveTo(p.x - p.size * 0.4, p.y - 6, p.x, p.y);
          ctx.quadraticCurveTo(p.x + p.size * 0.4, p.y - 6, p.x + p.size, p.y - flap);
          ctx.stroke();

          p.x += p.speedX;
          p.y += Math.sin(time * 0.003 + p.phase) * 0.5;
          if (p.x > canvas.width + 40) {
            p.x = -40;
            p.y = 50 + Math.random() * (canvas.height * 0.5);
          }
        } else if (activeWeather === 'sunshine') {
          // Golden floating sun sparkles
          ctx.fillStyle = 'rgba(255, 202, 58, 0.55)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
          p.y -= p.speedY * 0.35;
          p.x += Math.sin(time * 0.002 + p.phase) * 0.5;
          if (p.y < -20) p.y = canvas.height + 10;
        } else if (activeWeather === 'confetti') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(time * 0.004 + p.phase);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
          ctx.restore();
          p.y += p.speedY;
          p.x += Math.sin(time * 0.003 + p.phase) * 1.2;
          if (p.y > canvas.height) {
            p.y = -15;
            p.x = Math.random() * canvas.width;
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeWeather]);

  if (activeWeather === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  );
}
