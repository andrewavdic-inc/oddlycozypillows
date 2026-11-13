import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trophy,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  Maximize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import {
  getStarHealthImages,
  resolveLogoVariant,
  resolveButtonImage,
} from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

const STAR_IMAGES = getStarHealthImages(); // [Star1, Star2, Star3, Star4, Star5, Star6]
const CANVAS_W = 1000;
const CANVAS_H = 450; // Exact 20:9 Aspect Ratio

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export default function PuffSkyGameModal({ isOpen, onClose }) {
  const { highScores, addHighScore } = useStore();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 'ready' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState('ready');
  const [health, setHealth] = useState(5); // 5 = Star1.png ... 0 = Star6.png
  const [score, setScore] = useState(0);
  const [survivalSec, setSurvivalSec] = useState(0);
  const [moonbeamActive, setMoonbeamActive] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFX.muted);

  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [copiedReward, setCopiedReward] = useState(false);

  const spritesRef = useRef({
    puffOpen: null,
    puffBlink: null,
    cozyItems: [],
  });

  const gameRef = useRef({
    running: false,
    rafId: null,
    puff: { x: 155, y: 225, targetY: 225, targetX: 155, vy: 0, radius: 34, invulnTimer: 0, moonbeamTimer: 0 },
    keys: { up: false, down: false, left: false, right: false },
    pointerActive: false,
    clouds: [],
    bgStars: [],
    entities: [],
    particles: [],
    floatingTexts: [],
    score: 0,
    health: 5,
    elapsed: 0,
    spawnTimer: 0,
    itemTimer: 0,
    moonbeamSpawnTimer: 0,
    screenShake: 0,
  });

  // Load game sprites once
  useEffect(() => {
    const openImg = new Image();
    openImg.src = resolveLogoVariant({ theme: 'color', blink: false, withUrl: false });
    const blinkImg = new Image();
    blinkImg.src = resolveLogoVariant({ theme: 'color', blink: true, withUrl: false });

    const itemUrls = [
      resolveButtonImage('printedpillow_button', '/printedpillow_button.png'),
      resolveButtonImage('oddlycozypillow_button', '/oddlycozypillow_button.png'),
      resolveButtonImage('toys_button', '/toys_button.png'),
    ];
    const loadedItems = itemUrls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });

    spritesRef.current = {
      puffOpen: openImg,
      puffBlink: blinkImg,
      cozyItems: loadedItems,
    };

    // Preload Star1 - Star6 health icons
    STAR_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Stop music when modal closes
  useEffect(() => {
    if (!isOpen) {
      soundFX.stopGameMusic();
      gameRef.current.running = false;
      if (gameRef.current.rafId) cancelAnimationFrame(gameRef.current.rafId);
    }
  }, [isOpen]);

  // Keyboard listeners for Arrow / WASD flight
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        gameRef.current.keys.up = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        gameRef.current.keys.down = true;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = true;
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        gameRef.current.keys.up = false;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        gameRef.current.keys.down = false;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, onClose]);

  const initCloudsAndStars = () => {
    const clouds = [];
    for (let i = 0; i < 16; i++) {
      clouds.push({
        x: Math.random() * CANVAS_W,
        y: 35 + Math.random() * (CANVAS_H - 70),
        scale: 0.45 + Math.random() * 0.95,
        speed: 0.6 + Math.random() * 1.8,
        alpha: 0.35 + Math.random() * 0.45,
      });
    }
    const bgStars = [];
    for (let i = 0; i < 45; i++) {
      bgStars.push({
        x: Math.random() * CANVAS_W,
        y: Math.random() * (CANVAS_H * 0.75),
        r: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }
    gameRef.current.clouds = clouds;
    gameRef.current.bgStars = bgStars;
  };

  const startNewGame = () => {
    initCloudsAndStars();
    gameRef.current = {
      ...gameRef.current,
      running: true,
      puff: {
        x: 160,
        y: CANVAS_H / 2,
        targetX: 160,
        targetY: CANVAS_H / 2,
        vy: 0,
        radius: 32,
        invulnTimer: 0,
        moonbeamTimer: 0,
      },
      entities: [],
      particles: [],
      floatingTexts: [],
      score: 0,
      health: 5,
      elapsed: 0,
      spawnTimer: 0.8,
      itemTimer: 3.2,
      moonbeamSpawnTimer: 11.5,
      screenShake: 0,
    };

    setHealth(5);
    setScore(0);
    setSurvivalSec(0);
    setMoonbeamActive(false);
    setScoreSaved(false);
    setGameState('playing');

    soundFX.startGameMusic();
  };

  // Main 60FPS Canvas Loop
  useEffect(() => {
    if (!isOpen || gameState !== 'playing') return;

    let lastTime = performance.now();

    const spawnParticles = (x, y, color, count = 14) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 190;
        gameRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 3 + Math.random() * 5,
          color,
          life: 0.55 + Math.random() * 0.35,
          maxLife: 0.8,
        });
      }
    };

    const addFloatingText = (x, y, text, color = '#FFCA3A') => {
      gameRef.current.floatingTexts.push({
        x,
        y,
        text,
        color,
        life: 0.95,
      });
    };

    const drawFluffyCloud = (ctx, x, y, scale, alpha, isStorm = false) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = isStorm ? '#334155' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.arc(-24, 6, 20, 0, Math.PI * 2);
      ctx.arc(24, 6, 22, 0, Math.PI * 2);
      ctx.arc(-10, -14, 18, 0, Math.PI * 2);
      ctx.arc(12, -12, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const step = (now) => {
      const g = gameRef.current;
      if (!g.running) return;

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      g.elapsed += dt;
      const difficulty = 1 + Math.min(1.6, g.elapsed / 42);
      const isMoonbeam = g.puff.moonbeamTimer > 0;

      // Score ticks up faster during Moonbeam mode
      g.score += dt * (isMoonbeam ? 28 : 14) * difficulty;
      setScore(Math.floor(g.score));
      setSurvivalSec(Math.floor(g.elapsed));

      if (g.puff.invulnTimer > 0) g.puff.invulnTimer -= dt;
      if (g.puff.moonbeamTimer > 0) {
        g.puff.moonbeamTimer -= dt;
        if (g.puff.moonbeamTimer <= 0) {
          setMoonbeamActive(false);
        }
      }
      if (g.screenShake > 0) g.screenShake = Math.max(0, g.screenShake - dt * 25);

      // Update Puff Position (Keyboard or Pointer)
      const moveSpeed = 310;
      if (g.keys.up) g.puff.targetY -= moveSpeed * dt;
      if (g.keys.down) g.puff.targetY += moveSpeed * dt;
      if (g.keys.left) g.puff.targetX -= moveSpeed * dt;
      if (g.keys.right) g.puff.targetX += moveSpeed * dt;

      g.puff.targetX = Math.max(55, Math.min(CANVAS_W * 0.48, g.puff.targetX));
      g.puff.targetY = Math.max(48, Math.min(CANVAS_H - 48, g.puff.targetY));

      g.puff.x += (g.puff.targetX - g.puff.x) * Math.min(1, dt * 12);
      g.puff.y += (g.puff.targetY - g.puff.y) * Math.min(1, dt * 12);

      // Rainbow trail particles when Moonbeam is active
      if (isMoonbeam && Math.random() < 0.65) {
        const colors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#FF6392'];
        g.particles.push({
          x: g.puff.x - 24,
          y: g.puff.y + (Math.random() - 0.5) * 32,
          vx: -140 - Math.random() * 80,
          vy: (Math.random() - 0.5) * 30,
          r: 4 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0.45,
          maxLife: 0.45,
        });
      }

      // Spawn Anti-Cozy Hazards (Storm Clouds & Buzzing Alarm Clocks)
      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0) {
        g.spawnTimer = Math.max(0.42, (1.18 - g.elapsed * 0.008) / (isMoonbeam ? 1.15 : 1));
        const hazardTypes = ['storm', 'alarm', 'icicle'];
        const kind = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
        g.entities.push({
          type: 'hazard',
          kind,
          x: CANVAS_W + 60,
          y: 50 + Math.random() * (CANVAS_H - 100),
          vx: -(255 + Math.random() * 115) * difficulty,
          vy: kind === 'alarm' ? (Math.random() - 0.5) * 95 : 0,
          radius: kind === 'storm' ? 32 : 26,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Spawn Cozy Pillows / Squishies to Regain Health (powerup.mp3)
      g.itemTimer -= dt;
      if (g.itemTimer <= 0) {
        g.itemTimer = 4.2 + Math.random() * 2.5;
        const cozySprites = spritesRef.current.cozyItems;
        const sprite =
          cozySprites.length > 0
            ? cozySprites[Math.floor(Math.random() * cozySprites.length)]
            : null;
        g.entities.push({
          type: 'heal',
          sprite,
          x: CANVAS_W + 50,
          y: 60 + Math.random() * (CANVAS_H - 120),
          vx: -210 * difficulty,
          vy: 0,
          radius: 28,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Spawn Moonbeam Orb Powerup (moonbeam.mp3)
      g.moonbeamSpawnTimer -= dt;
      if (g.moonbeamSpawnTimer <= 0) {
        g.moonbeamSpawnTimer = 15 + Math.random() * 6;
        g.entities.push({
          type: 'moonbeam',
          x: CANVAS_W + 50,
          y: 75 + Math.random() * (CANVAS_H - 150),
          vx: -240 * difficulty,
          vy: 0,
          radius: 26,
          phase: 0,
        });
      }

      // Update Entities & Check Collisions
      for (let i = g.entities.length - 1; i >= 0; i--) {
        const ent = g.entities[i];
        ent.x += ent.vx * dt;
        ent.phase += dt * 5;
        if (ent.type === 'heal' || ent.type === 'moonbeam') {
          ent.y += Math.sin(ent.phase) * 38 * dt;
        } else if (ent.kind === 'alarm') {
          ent.y += ent.vy * dt;
          if (ent.y < 45 || ent.y > CANVAS_H - 45) ent.vy *= -1;
        }

        // Check collision with Puff
        const dist = Math.hypot(ent.x - g.puff.x, ent.y - g.puff.y);
        if (dist < ent.radius + g.puff.radius - 6) {
          if (ent.type === 'heal') {
            soundFX.playHealthPowerupSound();
            const nextHp = Math.min(5, g.health + 1);
            const healed = nextHp > g.health;
            g.health = nextHp;
            setHealth(nextHp);
            g.score += 50;
            spawnParticles(ent.x, ent.y, '#8AC926', 18);
            addFloatingText(
              ent.x,
              ent.y - 15,
              healed ? '+1 STAR HEALTH! (+50)' : 'COZY BONUS +50!',
              '#8AC926'
            );
            g.entities.splice(i, 1);
            continue;
          }

          if (ent.type === 'moonbeam') {
            soundFX.playMoonbeamSound();
            g.puff.moonbeamTimer = 6.5;
            setMoonbeamActive(true);
            g.score += 100;
            spawnParticles(ent.x, ent.y, '#FFCA3A', 26);
            addFloatingText(ent.x, ent.y - 15, '🌙 MOONBEAM SHIELD! (2x PTS)', '#FFCA3A');
            g.entities.splice(i, 1);
            continue;
          }

          if (ent.type === 'hazard') {
            if (isMoonbeam) {
              // Moonbeam Shield blasts hazards into bonus points!
              soundFX.playPop();
              g.score += 35;
              spawnParticles(ent.x, ent.y, '#FFCA3A', 16);
              addFloatingText(ent.x, ent.y, 'ZAPPED +35!', '#FFCA3A');
              g.entities.splice(i, 1);
              continue;
            } else if (g.puff.invulnTimer <= 0) {
              soundFX.playBonkSound();
              g.health = Math.max(0, g.health - 1);
              setHealth(g.health);
              g.puff.invulnTimer = 1.25;
              g.screenShake = 10;
              spawnParticles(g.puff.x, g.puff.y, '#FF595E', 22);
              addFloatingText(g.puff.x, g.puff.y - 25, 'BONK! -1 STAR', '#FF595E');
              g.entities.splice(i, 1);

              if (g.health <= 0) {
                g.running = false;
                soundFX.stopGameMusic();
                setGameState('gameover');
                if (g.score >= 500 || g.elapsed >= 45) {
                  confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
                }
                return;
              }
              continue;
            }
          }
        }

        if (ent.x < -90) {
          g.entities.splice(i, 1);
        }
      }

      // ================= RENDER 20:9 CANVAS =================
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      ctx.save();
      if (g.screenShake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * g.screenShake,
          (Math.random() - 0.5) * g.screenShake
        );
      }

      // Dynamic Sky Gradient (Day -> Sunset -> Starry Moonbeam Night)
      const cycle = (g.elapsed % 75) / 75;
      let topColor = '#38BDF8';
      let botColor = '#BAE6FD';
      let nightAlpha = 0;

      if (cycle < 0.38) {
        topColor = '#0284C7';
        botColor = '#BAE6FD';
      } else if (cycle < 0.68) {
        topColor = '#7C3AED';
        botColor = '#FB923C';
        nightAlpha = 0.35;
      } else {
        topColor = '#0F172A';
        botColor = '#312E81';
        nightAlpha = 0.9;
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      skyGrad.addColorStop(0, topColor);
      skyGrad.addColorStop(1, botColor);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Twinkling Background Stars during Sunset/Night
      if (nightAlpha > 0) {
        ctx.fillStyle = '#FEF08A';
        g.bgStars.forEach((st) => {
          const twinkle = 0.4 + 0.6 * Math.sin(g.elapsed * 3 + st.phase);
          ctx.globalAlpha = nightAlpha * twinkle;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Parallax Fluffy Clouds
      g.clouds.forEach((cl) => {
        cl.x -= cl.speed * difficulty * 60 * dt;
        if (cl.x < -110) {
          cl.x = CANVAS_W + 100;
          cl.y = 35 + Math.random() * (CANVAS_H - 70);
        }
        drawFluffyCloud(ctx, cl.x, cl.y, cl.scale, cl.alpha, false);
      });

      // Draw Collectibles & Hazards
      g.entities.forEach((ent) => {
        ctx.save();
        ctx.translate(ent.x, ent.y);

        if (ent.type === 'heal') {
          // Glowing Cozy Healing Bubble
          ctx.fillStyle = 'rgba(138, 201, 38, 0.28)';
          ctx.strokeStyle = '#8AC926';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, ent.radius + 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          if (ent.sprite && ent.sprite.complete && ent.sprite.naturalWidth > 0) {
            ctx.drawImage(ent.sprite, -24, -24, 48, 48);
          } else {
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🍟', 0, 2);
          }
        } else if (ent.type === 'moonbeam') {
          // Glowing Moonbeam Starlight Orb
          const pulse = 1 + Math.sin(ent.phase * 2) * 0.12;
          ctx.scale(pulse, pulse);
          const radGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 32);
          radGrad.addColorStop(0, '#FFFBEB');
          radGrad.addColorStop(0.5, '#FDE047');
          radGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌙', 0, 2);
        } else if (ent.type === 'hazard') {
          if (ent.kind === 'storm') {
            drawFluffyCloud(ctx, 0, 0, 0.95, 0.96, true);
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', 0, 14);
          } else if (ent.kind === 'alarm') {
            ctx.rotate(Math.sin(ent.phase * 4) * 0.22);
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = '26px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⏰', 0, 2);
          } else {
            ctx.fillStyle = '#38BDF8';
            ctx.beginPath();
            ctx.arc(0, 0, 23, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = '25px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❄️', 0, 2);
          }
        }
        ctx.restore();
      });

      // Draw Puff the Flying Mascot
      ctx.save();
      ctx.translate(g.puff.x, g.puff.y);
      const tilt = Math.max(-0.35, Math.min(0.35, (g.puff.targetY - g.puff.y) * 0.008));
      ctx.rotate(tilt);

      if (isMoonbeam) {
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, g.puff.radius + 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (g.puff.invulnTimer > 0 && Math.floor(g.puff.invulnTimer * 12) % 2 === 0) {
        ctx.globalAlpha = 0.45;
      }

      const puffSprite =
        g.puff.invulnTimer > 0
          ? spritesRef.current.puffBlink
          : spritesRef.current.puffOpen;

      if (puffSprite && puffSprite.complete && puffSprite.naturalWidth > 0) {
        ctx.drawImage(puffSprite, -42, -42, 84, 84);
      } else {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Update & Draw Burst Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) {
          g.particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Update & Draw Floating Combat/Heal Texts
      for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
        const ft = g.floatingTexts[i];
        ft.y -= 38 * dt;
        ft.life -= dt;
        if (ft.life <= 0) {
          g.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.font = 'bold 16px "Fredoka", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x - 40, ft.y);
        ctx.fillText(ft.text, ft.x - 40, ft.y);
        ctx.restore();
      }

      ctx.restore();
      g.rafId = requestAnimationFrame(step);
    };

    gameRef.current.rafId = requestAnimationFrame(step);
    return () => {
      if (gameRef.current.rafId) cancelAnimationFrame(gameRef.current.rafId);
    };
  }, [isOpen, gameState]);

  // Pointer Move Handler inside 20:9 Canvas (Smooth Touch & Mouse Flight)
  const handleCanvasPointer = (e) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    gameRef.current.puff.targetX = Math.max(55, Math.min(CANVAS_W * 0.55, canvasX));
    gameRef.current.puff.targetY = Math.max(45, Math.min(CANVAS_H - 45, canvasY));
  };

  const handleSaveScore = (e) => {
    e.preventDefault();
    if (scoreSaved) return;
    soundFX.playSparkleChime();
    addHighScore({
      name: playerName || 'COZY_HERO',
      score,
      survivalSec,
    });
    setScoreSaved(true);
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (!isOpen) return null;

  // Map health (5 down to 0) to Star1.png (index 0) through Star6.png (index 5)
  const starImgIndex = Math.max(0, Math.min(5, 5 - health));
  const currentStarSrc = STAR_IMAGES[starImgIndex];
  const unlockedDiscount = score >= 500 || survivalSec >= 45;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-2 sm:p-6 select-none"
    >
      {/* Borderless 20:9 Phone-Formatted Widescreen Window */}
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl aspect-[20/9] rounded-[2rem] overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.85)] bg-slate-900 border-0"
      >
        {/* 20:9 HTML5 Game Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={handleCanvasPointer}
          onPointerMove={(e) => {
            if (e.buttons > 0 || e.pointerType === 'touch') {
              handleCanvasPointer(e);
            }
          }}
          onMouseMove={handleCanvasPointer}
          onTouchMove={handleCanvasPointer}
          className="w-full h-full object-cover block touch-none cursor-crosshair"
        />

        {/* Top Frameless HUD Overlay: Star1-Star6 Health Meter, Score & Audio Controls */}
        <div className="absolute top-2.5 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Star1.png - Star6.png Health Meter */}
          <div className="flex items-center gap-2.5 bg-slate-950/65 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg">
            <img
              src={currentStarSrc}
              alt={`Health Star ${health}/5`}
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-[0_2px_8px_rgba(250,204,21,0.65)] transition-transform duration-200 scale-105"
            />
            <div className="pr-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block leading-none">
                Star Health ({health}/5)
              </span>
              <div className="w-20 sm:w-24 h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
                <div
                  style={{ width: `${(health / 5) * 100}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
                />
              </div>
            </div>

            {moonbeamActive && (
              <span className="ml-1 px-2.5 py-0.5 rounded-full bg-purple-600 text-amber-200 text-[10px] font-extrabold animate-pulse">
                🌙 MOONBEAM 2X
              </span>
            )}
          </div>

          {/* Live Score & Survival Timer */}
          <div className="flex items-center gap-3 bg-slate-950/65 backdrop-blur-md px-4 py-1.5 rounded-full text-white shadow-lg">
            <div className="text-center">
              <span className="text-[9px] uppercase font-extrabold text-sky-300 block">
                Score
              </span>
              <span className="font-display text-sm sm:text-lg font-bold text-amber-300">
                {score}
              </span>
            </div>
            <div className="h-5 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-extrabold text-sky-300 block">
                Time
              </span>
              <span className="font-display text-sm sm:text-lg font-bold">
                {survivalSec}s
              </span>
            </div>
          </div>

          {/* Right Action Controls (Mute, Fullscreen, Exit) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsMuted(soundFX.toggleMute())}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/65 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
              title="Mute / Unmute Game Audio"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={handleFullscreenToggle}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/65 hover:bg-slate-800 text-white hidden sm:flex items-center justify-center transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.stopGameMusic();
                onClose();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
              title="Close Game"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= OVERLAY 1: START SCREEN & HIGH SCORES ================= */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 z-10 bg-slate-950/70 backdrop-blur-md flex items-center justify-between px-6 sm:px-12 py-4 text-white">
            <div className="max-w-md space-y-2 sm:space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold uppercase">
                <Sparkles className="w-3 h-3" />
                Secret 20:9 Arcade Mode
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight">
                Puff’s <span className="text-amber-300">Cloud Dash</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed">
                Slide your finger or cursor to fly Puff through the clouds! Dodge{' '}
                <strong>Storm Clouds ⚡</strong> & <strong>Alarm Clocks ⏰</strong>, grab{' '}
                <strong>Cozy Pillows 🍟</strong> to refill your Star Health, and catch{' '}
                <strong>Moonbeams 🌙</strong> for Starlight Invincibility!
              </p>

              <button
                type="button"
                onClick={startNewGame}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8AC926] hover:bg-lime-400 text-slate-900 font-display text-sm sm:text-base font-bold shadow-lg transition-transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-slate-900" />
                Take Off & Fly!
              </button>
            </div>

            {/* Live High Score Leaderboard */}
            <div className="hidden md:block w-72 bg-slate-900/90 rounded-3xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-amber-300 font-display font-bold text-sm mb-2">
                <Trophy className="w-4 h-4" />
                <span>Top Cloud Flyers (Hi-Scores)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {highScores.slice(0, 5).map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white/5"
                  >
                    <span className="font-bold text-slate-200">
                      {idx + 1}. {entry.name}
                    </span>
                    <span className="font-extrabold text-amber-300">
                      {entry.score} pts ({entry.survivalSec}s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= OVERLAY 2: GAME OVER, REWARD & HI-SCORE SUBMIT ================= */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sm:px-12 py-4 text-white overflow-y-auto">
            <div className="max-w-md space-y-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={STAR_IMAGES[5]}
                  alt="Empty Star"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-rose-400 block">
                    Star Health Depleted!
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold">
                    Flight Complete: {score} Pts ({survivalSec}s)
                  </h3>
                </div>
              </div>

              {/* Secret Promo Code Reward if Player Scored 500+ or Survived 45s+ */}
              {unlockedDiscount ? (
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-emerald-300 block">
                      🎉 Pro Flyer Reward Unlocked: 20% OFF!
                    </span>
                    <span className="text-[11px] text-slate-200">
                      Use secret code <strong>SKYDASH20</strong> at checkout!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('SKYDASH20');
                      setCopiedReward(true);
                      setTimeout(() => setCopiedReward(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-full bg-emerald-400 text-slate-900 font-extrabold text-[11px] shrink-0"
                  >
                    {copiedReward ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  Tip: Score <strong>500+ pts</strong> (or survive 45s) to unlock a secret 20% OFF store promo code!
                </p>
              )}

              {/* Submit to High Score Board */}
              {!scoreSaved ? (
                <form onSubmit={handleSaveScore} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    maxLength={12}
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter Your Name / Initials"
                    className="px-3.5 py-2 rounded-full bg-slate-800 border border-white/25 text-white text-xs font-bold outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs"
                  >
                    Post Hi-Score
                  </button>
                </form>
              ) : (
                <p className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Score saved to the live Leaderboard!
                </p>
              )}

              <div className="pt-1 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={startNewGame}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-xs shadow-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Fly Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Back to Store
                </button>
              </div>
            </div>

            {/* Live High Score Leaderboard */}
            <div className="hidden md:block w-72 bg-slate-900/90 rounded-3xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-amber-300 font-display font-bold text-sm mb-2">
                <Trophy className="w-4 h-4" />
                <span>High Score Board</span>
              </div>
              <div className="space-y-1.5 text-xs max-h-44 overflow-y-auto">
                {highScores.slice(0, 6).map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white/5"
                  >
                    <span className="font-bold text-slate-200">
                      {idx + 1}. {entry.name}
                    </span>
                    <span className="font-extrabold text-amber-300">
                      {entry.score} pts ({entry.survivalSec}s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
