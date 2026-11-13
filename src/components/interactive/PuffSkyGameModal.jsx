import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import {
  getStarHealthImages,
  resolveLogoVariant,
  resolveButtonImage,
  resolveIntroVideo,
} from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

const STAR_IMAGES = getStarHealthImages(); // [Star1, Star2, Star3, Star4, Star5, Star6]
const INTRO_VIDEO_URL = resolveIntroVideo();
const CANVAS_W = 450;
const CANVAS_H = 1000; // Vertical 9:20 Portrait Aspect Ratio

export default function PuffSkyGameModal({ isOpen, onClose }) {
  const { highScores, addHighScore } = useStore();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 'ready' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState('ready');
  const [showIntroScores, setShowIntroScores] = useState(false);
  const [videoSrc, setVideoSrc] = useState(INTRO_VIDEO_URL);

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
    puff: {
      x: CANVAS_W / 2,
      y: CANVAS_H * 0.76,
      targetX: CANVAS_W / 2,
      targetY: CANVAS_H * 0.76,
      radius: 34,
      invulnTimer: 0,
      moonbeamTimer: 0,
    },
    keys: { up: false, down: false, left: false, right: false },
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

  // Preload game sprites and Star1-Star6 images
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

    STAR_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Reset to looping intro video when modal opens; stop music when modal closes
  useEffect(() => {
    if (isOpen) {
      setGameState('ready');
      setShowIntroScores(false);
    } else {
      soundFX.stopGameMusic();
      gameRef.current.running = false;
      if (gameRef.current.rafId) cancelAnimationFrame(gameRef.current.rafId);
    }
  }, [isOpen]);

  // Keyboard listeners for Arrow / WASD flight
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
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
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
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
    for (let i = 0; i < 18; i++) {
      clouds.push({
        x: 30 + Math.random() * (CANVAS_W - 60),
        y: Math.random() * CANVAS_H,
        scale: 0.45 + Math.random() * 0.9,
        speed: 0.8 + Math.random() * 1.9,
        alpha: 0.32 + Math.random() * 0.45,
      });
    }
    const bgStars = [];
    for (let i = 0; i < 50; i++) {
      bgStars.push({
        x: Math.random() * CANVAS_W,
        y: Math.random() * CANVAS_H,
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
        x: CANVAS_W / 2,
        y: CANVAS_H * 0.76,
        targetX: CANVAS_W / 2,
        targetY: CANVAS_H * 0.76,
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
      spawnTimer: 0.7,
      itemTimer: 3.0,
      moonbeamSpawnTimer: 11.0,
      screenShake: 0,
    };

    setHealth(5);
    setScore(0);
    setSurvivalSec(0);
    setMoonbeamActive(false);
    setScoreSaved(false);
    setShowIntroScores(false);
    setGameState('playing');

    soundFX.startGameMusic();
  };

  // Main 60FPS Vertical Flight Loop
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
        x: Math.max(75, Math.min(CANVAS_W - 75, x)),
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
      const difficulty = 1 + Math.min(1.7, g.elapsed / 42);
      const isMoonbeam = g.puff.moonbeamTimer > 0;

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

      const moveSpeed = 340;
      if (g.keys.up) g.puff.targetY -= moveSpeed * dt;
      if (g.keys.down) g.puff.targetY += moveSpeed * dt;
      if (g.keys.left) g.puff.targetX -= moveSpeed * dt;
      if (g.keys.right) g.puff.targetX += moveSpeed * dt;

      g.puff.targetX = Math.max(46, Math.min(CANVAS_W - 46, g.puff.targetX));
      g.puff.targetY = Math.max(180, Math.min(CANVAS_H - 75, g.puff.targetY));

      g.puff.x += (g.puff.targetX - g.puff.x) * Math.min(1, dt * 13);
      g.puff.y += (g.puff.targetY - g.puff.y) * Math.min(1, dt * 13);

      if (isMoonbeam && Math.random() < 0.7) {
        const colors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#FF6392'];
        g.particles.push({
          x: g.puff.x + (Math.random() - 0.5) * 34,
          y: g.puff.y + 26,
          vx: (Math.random() - 0.5) * 35,
          vy: 150 + Math.random() * 90,
          r: 4 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0.45,
          maxLife: 0.45,
        });
      }

      // Spawn Anti-Cozy Hazards from Top of Screen Falling Downward
      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0) {
        g.spawnTimer = Math.max(0.38, (1.05 - g.elapsed * 0.008) / (isMoonbeam ? 1.15 : 1));
        const hazardTypes = ['storm', 'alarm', 'icicle'];
        const kind = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
        g.entities.push({
          type: 'hazard',
          kind,
          x: 48 + Math.random() * (CANVAS_W - 96),
          y: -60,
          vx: kind === 'alarm' ? (Math.random() > 0.5 ? 110 : -110) : 0,
          vy: (265 + Math.random() * 125) * difficulty,
          radius: kind === 'storm' ? 32 : 26,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Spawn Cozy Pillows / Squishies from Top to Regain Health
      g.itemTimer -= dt;
      if (g.itemTimer <= 0) {
        g.itemTimer = 4.0 + Math.random() * 2.4;
        const cozySprites = spritesRef.current.cozyItems;
        const sprite =
          cozySprites.length > 0
            ? cozySprites[Math.floor(Math.random() * cozySprites.length)]
            : null;
        g.entities.push({
          type: 'heal',
          sprite,
          x: 55 + Math.random() * (CANVAS_W - 110),
          y: -55,
          vx: 0,
          vy: 220 * difficulty,
          radius: 28,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Spawn Moonbeam Orb Powerup from Top
      g.moonbeamSpawnTimer -= dt;
      if (g.moonbeamSpawnTimer <= 0) {
        g.moonbeamSpawnTimer = 14.5 + Math.random() * 6;
        g.entities.push({
          type: 'moonbeam',
          x: 60 + Math.random() * (CANVAS_W - 120),
          y: -55,
          vx: 0,
          vy: 250 * difficulty,
          radius: 26,
          phase: 0,
        });
      }

      // Update Entities & Check Collisions
      for (let i = g.entities.length - 1; i >= 0; i--) {
        const ent = g.entities[i];
        ent.y += ent.vy * dt;
        ent.phase += dt * 5;

        if (ent.type === 'heal' || ent.type === 'moonbeam') {
          ent.x += Math.sin(ent.phase) * 42 * dt;
        } else if (ent.kind === 'alarm') {
          ent.x += ent.vx * dt;
          if (ent.x < 42 || ent.x > CANVAS_W - 42) ent.vx *= -1;
        }

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
              healed ? '+1 STAR HEALTH!' : 'COZY BONUS +50!',
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
            addFloatingText(ent.x, ent.y - 15, '🌙 MOONBEAM SHIELD!', '#FFCA3A');
            g.entities.splice(i, 1);
            continue;
          }

          if (ent.type === 'hazard') {
            if (isMoonbeam) {
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

        if (ent.y > CANVAS_H + 90) {
          g.entities.splice(i, 1);
        }
      }

      // ================= RENDER 9:20 VERTICAL CANVAS =================
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

      const cycle = (g.elapsed % 75) / 75;
      let topColor = '#0284C7';
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

      g.clouds.forEach((cl) => {
        cl.y += cl.speed * difficulty * 65 * dt;
        if (cl.y > CANVAS_H + 80) {
          cl.y = -80;
          cl.x = 30 + Math.random() * (CANVAS_W - 60);
        }
        drawFluffyCloud(ctx, cl.x, cl.y, cl.scale, cl.alpha, false);
      });

      g.entities.forEach((ent) => {
        ctx.save();
        ctx.translate(ent.x, ent.y);

        if (ent.type === 'heal') {
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

      // Draw Puff Banking Left/Right as He Flies Upward
      ctx.save();
      ctx.translate(g.puff.x, g.puff.y);
      const bankAngle = Math.max(-0.35, Math.min(0.35, (g.puff.targetX - g.puff.x) * 0.009));
      ctx.rotate(bankAngle);

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

      for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
        const ft = g.floatingTexts[i];
        ft.y -= 42 * dt;
        ft.life -= dt;
        if (ft.life <= 0) {
          g.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.font = 'bold 17px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3.5;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
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

  const handleCanvasPointer = (e) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    gameRef.current.puff.targetX = Math.max(46, Math.min(CANVAS_W - 46, canvasX));
    const touchOffsetY = e.touches ? -55 : 0;
    gameRef.current.puff.targetY = Math.max(
      160,
      Math.min(CANVAS_H - 70, canvasY + touchOffsetY)
    );
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

  if (!isOpen) return null;

  const starImgIndex = Math.max(0, Math.min(5, 5 - health));
  const currentStarSrc = STAR_IMAGES[starImgIndex];
  const unlockedDiscount = score >= 500 || survivalSec >= 45;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 select-none"
    >
      {/* Borderless Vertical 9:20 Portrait Phone Window */}
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative h-[92vh] max-h-[920px] aspect-[9/20] w-auto max-w-[96vw] rounded-[2.4rem] overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.85)] bg-slate-900 border-0 flex flex-col"
      >
        {/* 9:20 Portrait HTML5 Game Canvas */}
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

        {/* Top Portrait HUD Overlay (Shown During Active Gameplay & Game Over) */}
        {gameState !== 'ready' && (
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
              <img
                src={currentStarSrc}
                alt={`Health Star ${health}/5`}
                className="w-8 h-8 object-contain drop-shadow-[0_2px_8px_rgba(250,204,21,0.65)]"
              />
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 block leading-none">
                  HP {health}/5
                </span>
                <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                  <div
                    style={{ width: `${(health / 5) * 100}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white shadow-lg">
              <div className="text-center">
                <span className="text-[8px] uppercase font-extrabold text-sky-300 block leading-none">
                  Score
                </span>
                <span className="font-display text-sm font-bold text-amber-300">
                  {score}
                </span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="text-center">
                <span className="text-[8px] uppercase font-extrabold text-sky-300 block leading-none">
                  Time
                </span>
                <span className="font-display text-sm font-bold">{survivalSec}s</span>
              </div>
            </div>

            <div className="flex items-center gap-1 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsMuted(soundFX.toggleMute())}
                className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
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
                onClick={() => {
                  soundFX.stopGameMusic();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                title="Close Game"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Moonbeam Active Banner */}
        {moonbeamActive && (
          <div className="absolute top-16 inset-x-0 z-20 flex justify-center pointer-events-none">
            <span className="px-3.5 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-amber-200 text-[11px] font-extrabold shadow-lg animate-bounce">
              🌙 MOONBEAM SHIELD ACTIVE • 2X POINTS!
            </span>
          </div>
        )}

        {/* ================= OVERLAY 1: LOOPING INTRO VIDEO & "TAP TO START" ================= */}
        {gameState === 'ready' && (
          <div
            onClick={startNewGame}
            role="button"
            tabIndex={0}
            className="absolute inset-0 z-10 cursor-pointer flex flex-col justify-between p-5 select-none overflow-hidden"
          >
            {/* Looping Portrait Intro Video */}
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              onError={() => {
                if (videoSrc !== '/video_1.mp4') {
                  setVideoSrc('/video_1.mp4');
                } else {
                  setVideoSrc('/intro.mp4');
                }
              }}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Top Bar: Game Title & Top-Right Close / Hi-Score Toggle */}
            <div className="relative z-10 flex items-start justify-between gap-2 pt-1">
              <div className="pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/55 backdrop-blur-md text-amber-300 text-[10px] font-extrabold uppercase tracking-wider shadow">
                  <Sparkles className="w-3 h-3" />
                  Oddly Cozy Arcade
                </span>
                <h2 className="font-display text-3xl font-bold text-white mt-1 [text-shadow:_0_3px_12px_rgba(0,0,0,0.85)]">
                  Puff’s <span className="text-amber-300">Cloud Dash</span>
                </h2>
              </div>

              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setShowIntroScores((prev) => !prev);
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-950/65 hover:bg-slate-900 text-amber-300 text-xs font-extrabold backdrop-blur-md flex items-center gap-1 shadow-lg transition-transform hover:scale-105"
                  title="View High Scores"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Hi-Scores</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.stopGameMusic();
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full bg-slate-950/65 hover:bg-rose-500 text-white backdrop-blur-md flex items-center justify-center transition-colors shadow-lg"
                  title="Close Game"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Optional Collapsible High Score Drawer if Toggled */}
            {showIntroScores && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full bg-slate-950/80 backdrop-blur-md rounded-3xl p-4 border border-white/20 text-left text-white my-auto"
              >
                <div className="flex items-center justify-between text-amber-300 font-display font-bold text-sm mb-2">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    Top Cloud Flyers
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowIntroScores(false)}
                    className="text-[11px] text-slate-300 hover:text-white underline"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  {highScores.slice(0, 5).map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/10"
                    >
                      <span className="font-bold text-slate-100">
                        {idx + 1}. {entry.name}
                      </span>
                      <span className="font-extrabold text-amber-300">
                        {entry.score} pts ({entry.survivalSec}s)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Floating "TAP TO START" Prompt (Positioned Over Lower Clouds) */}
            <div className="relative z-10 pb-5 text-center pointer-events-none flex flex-col items-center gap-2">
              <div className="px-8 py-3.5 rounded-full bg-slate-950/60 backdrop-blur-md border-2 border-amber-300/90 shadow-[0_10px_30px_rgba(0,0,0,0.65)] animate-bounce">
                <span className="font-display text-2xl sm:text-3xl font-bold tracking-wider uppercase text-amber-300 [text-shadow:_0_2px_8px_rgba(0,0,0,0.95)]">
                  Tap to Start
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-white [text-shadow:_0_2px_6px_rgba(0,0,0,0.95)]">
                Catch Pillows & Gold Orbs • Dodge Storm Clouds!
              </span>
            </div>
          </div>
        )}

        {/* ================= OVERLAY 2: VERTICAL GAME OVER, REWARD & HI-SCORES ================= */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-10 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-5 pt-16 text-white text-center overflow-y-auto">
            <div className="w-full space-y-3">
              <img
                src={STAR_IMAGES[5]}
                alt="Empty Star"
                className="w-12 h-12 mx-auto object-contain"
              />
              <div>
                <span className="text-[10px] font-extrabold uppercase text-rose-400 block">
                  Star Health Depleted!
                </span>
                <h3 className="font-display text-2xl font-bold mt-0.5">
                  {score} Pts ({survivalSec}s)
                </h3>
              </div>

              {unlockedDiscount ? (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-left space-y-1.5">
                  <span className="font-extrabold text-emerald-300 text-xs block">
                    🎉 Pro Flyer Reward Unlocked: 20% OFF!
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-200">
                      Code: <strong>SKYDASH20</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText('SKYDASH20');
                        setCopiedReward(true);
                        setTimeout(() => setCopiedReward(false), 2500);
                      }}
                      className="px-3 py-1 rounded-full bg-emerald-400 text-slate-900 font-extrabold text-[11px]"
                    >
                      {copiedReward ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-300">
                  Score <strong>500+ pts</strong> (or survive 45s) to unlock a secret 20% OFF store code!
                </p>
              )}

              {!scoreSaved ? (
                <form onSubmit={handleSaveScore} className="flex flex-col gap-2 pt-1">
                  <input
                    type="text"
                    maxLength={12}
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter Your Name / Initials"
                    className="w-full px-4 py-2.5 rounded-full bg-slate-800 border border-white/25 text-white text-xs font-bold text-center outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs"
                  >
                    Post to Hi-Score Board
                  </button>
                </form>
              ) : (
                <p className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" /> Saved to Leaderboard!
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={startNewGame}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-xs shadow-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Fly Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Live High Score Leaderboard */}
            <div className="w-full bg-slate-900/90 rounded-3xl p-3.5 border border-white/15 text-left mt-3">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-display font-bold text-xs mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>High Score Board</span>
              </div>
              <div className="space-y-1 text-[11px] max-h-36 overflow-y-auto">
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
      </div>
    </div>
  );
}
