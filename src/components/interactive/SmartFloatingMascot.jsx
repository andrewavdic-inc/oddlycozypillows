import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Wand2, Tag, Check, Move, ArrowDown, Gamepad2 } from 'lucide-react';
import { getWakeupFrames, resolveLogoVariant } from '../../utils/publicManifest';
import { soundFX } from '../../utils/soundEffects';

const WAKEUP_FRAMES = getWakeupFrames();

const BUTTON_MENU_PITCH = {
  text: '🧭 Navigate with these buttons, or check out our featured items below!',
  ctaLabel: 'Featured Items',
  ctaType: 'scroll-featured',
};

const ANTSY_GAME_PITCH = {
  text: "⚡ Someone's a little antsy… do you want to play Puff's Cloud Dash?",
  ctaLabel: "Play Puff's Cloud Dash!",
  ctaType: 'open-sky-game',
};

const SECTION_PITCHES = {
  'category-bubbles-menu': BUTTON_MENU_PITCH,
  'winter-collection': {
    text: '🎄 Our Winter Collection is flying off the shelves! Click any photo to see it full-screen, or use code COZY15 for 15% off!',
    ctaLabel: 'Copy COZY15 (15% Off)',
    ctaType: 'copy-code',
  },
  'most-popular': {
    text: '🔥 These are our #1 customer favorites! The French Fries & Cookiemon pillows make unforgettable gifts!',
    ctaLabel: 'Customize a Pillow',
    ctaType: 'open-customizer',
  },
  'customizer-section': {
    text: '✨ Try Checkered or Chaotic mode below! You can even upload your own pet photo or artwork!',
    ctaLabel: 'Copy Promo COZY15',
    ctaType: 'copy-code',
  },
  'printed-pillows': {
    text: '🍟 Every Printed Pillow can be bought in 1 click OR customized in 6 sizes & 5 fun layouts!',
    ctaLabel: 'Open Pillow Studio',
    ctaType: 'open-customizer',
  },
  'oddly-cozy-pillows': {
    text: '🥐 Our Giant 3D Plushies are overstuffed for maximum couch naps! Stack 2 or 3 for the ultimate setup!',
    ctaLabel: 'Copy COZY15 (15% Off)',
    ctaType: 'copy-code',
  },
  'printed-blankets': {
    text: '🥤 Our Printed Blankets come in 3 snuggle-ready sizes—try customizing one in Checkered mode!',
    ctaLabel: 'Copy COZY15 (15% Off)',
    ctaType: 'copy-code',
  },
  'oddly-cozy-blankets': {
    text: '🍳 Wrap yourself inside a giant Sunny-Side Up Egg or Chunky Cloud Knit blanket!',
    ctaLabel: 'Copy COZY15 (15% Off)',
    ctaType: 'copy-code',
  },
  'matching-sets': {
    text: '🎁 Best Value Alert! Matching Sets give you 2 Printed Pillows + 1 Cozy Blanket and save you $18!',
    ctaLabel: 'Copy COZY15 (15% Off)',
    ctaType: 'copy-code',
  },
  rugs: {
    text: '🍕 Step out of bed onto a giant Pepperoni Pizza, Donut, or Chocolate Chip Cookie rug!',
    ctaLabel: 'Copy COZY15 (15% Off)',
    ctaType: 'copy-code',
  },
  toys: {
    text: '🥟 Need desk stress relief? Our slow-rising squishies are super satisfying to squeeze!',
    ctaLabel: 'Copy COZY15 (15% Off)',
    ctaType: 'copy-code',
  },
};

function getInitialMascotPosition() {
  if (typeof window === 'undefined') return { x: 900, y: 340 };
  return {
    x: Math.max(20, window.innerWidth - 145),
    y: Math.min(340, Math.max(240, window.innerHeight * 0.42)),
  };
}

export default function SmartFloatingMascot({
  currentPage,
  onOpenCustomizer,
  onOpenSkyGame,
}) {
  // Lifecycle: 'awake' | 'goodbye' | 'poofing' | 'sleeping' | 'waking'
  const [phase, setPhase] = useState('awake');
  const [isBlinking, setIsBlinking] = useState(false);
  const [pitch, setPitch] = useState(SECTION_PITCHES['winter-collection']);
  const [copiedCode, setCopiedCode] = useState(false);

  // 10-Quick-Tap Secret Game Detector
  const quickTapTimestampsRef = useRef([]);
  const [antsyMode, setAntsyMode] = useState(false);

  // Draggable Position State
  const [position, setPosition] = useState(getInitialMascotPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    movedDistance: 0,
  });

  // Sleeping & 3-Tap Wake-Up States
  const [tapCount, setTapCount] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isLaunchingUp, setIsLaunchingUp] = useState(false);

  const openLogo = resolveLogoVariant({ theme: 'color', blink: false, withUrl: false });
  const blinkLogo = resolveLogoVariant({ theme: 'color', blink: true, withUrl: false });

  useEffect(() => {
    if (phase !== 'sleeping') return;
    WAKEUP_FRAMES.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [phase]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.max(16, Math.min(window.innerWidth - 130, prev.x)),
        y: Math.max(90, Math.min(window.innerHeight - 140, prev.y)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (phase !== 'awake') return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3200 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [phase]);

  const evaluateMascotContext = useCallback(
    (posX, posY) => {
      if (typeof document === 'undefined' || antsyMode) return;
      const mascotCenterX = posX + 52;
      const mascotCenterY = posY + 52;

      const menuEl = document.getElementById('category-bubbles-menu');
      if (menuEl) {
        const rect = menuEl.getBoundingClientRect();
        const isOverButtonMenu =
          mascotCenterY >= rect.top - 25 &&
          mascotCenterY <= rect.bottom + 25 &&
          mascotCenterX >= rect.left - 25 &&
          mascotCenterX <= rect.right + 25;

        if (isOverButtonMenu) {
          setPitch((prev) =>
            prev.text !== BUTTON_MENU_PITCH.text ? BUTTON_MENU_PITCH : prev
          );
          return;
        }
      }

      const sectionIds = Object.keys(SECTION_PITCHES);
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (mascotCenterY >= rect.top && mascotCenterY <= rect.bottom) {
            setPitch((prev) =>
              prev.text !== SECTION_PITCHES[id].text ? SECTION_PITCHES[id] : prev
            );
            return;
          }
        }
      }
    },
    [antsyMode]
  );

  useEffect(() => {
    if (phase !== 'awake') return;
    evaluateMascotContext(position.x, position.y);
  }, [position.x, position.y, phase, currentPage, evaluateMascotContext]);

  useEffect(() => {
    if (phase !== 'awake') return;

    const handleScroll = () => {
      evaluateMascotContext(position.x, position.y);
    };

    const handleMouseOver = (e) => {
      if (antsyMode) return;
      const catBtnEl = e.target.closest('[data-category-button]');
      if (catBtnEl) {
        setPitch(BUTTON_MENU_PITCH);
        return;
      }

      const cardTitleEl = e.target.closest('[data-product-title]');
      if (cardTitleEl) {
        const title = cardTitleEl.getAttribute('data-product-title');
        const price = cardTitleEl.getAttribute('data-product-price');
        const isCustom = cardTitleEl.getAttribute('data-product-custom') === 'true';
        if (title) {
          setPitch({
            text: isCustom
              ? `👀 Checking out the ${title} ($${price})? Click "Customize this" to preview it in Checkered or Chaotic mode!`
              : `😍 The ${title} ($${price}) is a total crowd-pleaser! Click its photo to see it full-screen!`,
            ctaLabel: isCustom ? 'Open Customizer' : 'Use Code COZY15',
            ctaType: isCustom ? 'open-customizer' : 'copy-code',
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [phase, currentPage, position.x, position.y, antsyMode, evaluateMascotContext]);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      dragRef.current.movedDistance = Math.hypot(dx, dy);

      const nextX = Math.max(16, Math.min(window.innerWidth - 125, dragRef.current.initialX + dx));
      const nextY = Math.max(85, Math.min(window.innerHeight - 135, dragRef.current.initialY + dy));

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  const handleMascotPointerDown = (e) => {
    if (phase !== 'awake') return;
    e.preventDefault();
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      movedDistance: 0,
    };
    setIsDragging(true);
  };

  // Detects 10 rapid taps to unlock Puff's Cloud Dash
  const handleMascotClick = () => {
    if (dragRef.current.movedDistance > 8) return;
    soundFX.playMascotSqueak();
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 240);

    const now = Date.now();
    const recentTaps = [
      ...quickTapTimestampsRef.current.filter((t) => now - t < 4500),
      now,
    ];
    quickTapTimestampsRef.current = recentTaps;

    if (recentTaps.length >= 10) {
      quickTapTimestampsRef.current = [];
      soundFX.playSparkleChime();
      setAntsyMode(true);
      setPitch(ANTSY_GAME_PITCH);
    }
  };

  const handleManualNap = (e) => {
    e.stopPropagation();
    if (phase !== 'awake') return;
    setAntsyMode(false);
    soundFX.playMascotSqueak();
    setPhase('goodbye');

    setTimeout(() => {
      soundFX.playDisappearPopMp3();
      setPhase('poofing');
      setTimeout(() => {
        setTapCount(0);
        setFrameIndex(0);
        setPhase('sleeping');
      }, 380);
    }, 2000);
  };

  const handlePromptAction = (e) => {
    e.stopPropagation();
    if (pitch.ctaType === 'open-sky-game') {
      soundFX.playSparkleChime();
      setAntsyMode(false);
      onOpenSkyGame?.();
    } else if (pitch.ctaType === 'scroll-featured') {
      soundFX.playPop();
      const targetEl =
        document.getElementById('winter-collection') ||
        document.getElementById('printed-pillows');
      targetEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (pitch.ctaType === 'open-customizer') {
      soundFX.playBoing();
      onOpenCustomizer?.();
    } else {
      soundFX.playSparkleChime();
      navigator.clipboard?.writeText('COZY15');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleSleepingTap = () => {
    if (phase !== 'sleeping') return;
    const nextTap = tapCount + 1;
    setTapCount(nextTap);

    if (nextTap < 3) {
      soundFX.playGremlinGrumble(nextTap);
    } else {
      soundFX.playWakeupSequenceSound();
      setPhase('waking');
      setFrameIndex(0);
      setIsLaunchingUp(false);

      const totalFrames = WAKEUP_FRAMES.length;
      let current = 0;

      const animInterval = setInterval(() => {
        current += 1;
        if (current === Math.floor(totalFrames * 0.6)) {
          setIsLaunchingUp(true);
          confetti({
            particleCount: 55,
            spread: 75,
            origin: { x: 0.12, y: 0.88 },
            colors: ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#FF6392'],
          });
        }

        if (current < totalFrames) {
          setFrameIndex(current);
        } else {
          clearInterval(animInterval);
          setIsLaunchingUp(false);
          setPhase('awake');
          evaluateMascotContext(position.x, position.y);
        }
      }, 45);
    }
  };

  if (phase === 'sleeping' || phase === 'waking') {
    const activeFrameSrc =
      phase === 'waking'
        ? WAKEUP_FRAMES[frameIndex] || WAKEUP_FRAMES[0]
        : WAKEUP_FRAMES[0];

    return (
      <div
        className={`fixed bottom-3 left-4 sm:left-6 z-40 select-none flex flex-col items-center transition-all duration-700 ${
          isLaunchingUp ? '-translate-y-72 scale-125 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {phase === 'sleeping' && (
          <div className="relative w-full h-10 pointer-events-none flex justify-center">
            <span className="absolute bottom-0 left-1/2 font-display font-extrabold text-sm text-indigo-500 animate-bounce opacity-80">
              z
            </span>
            <span
              style={{ animationDelay: '0.4s' }}
              className="absolute bottom-3 left-1/2 translate-x-3 font-display font-extrabold text-lg text-purple-600 animate-float"
            >
              Z
            </span>
            <span
              style={{ animationDelay: '0.9s' }}
              className="absolute bottom-6 left-1/2 -translate-x-4 font-display font-extrabold text-2xl text-sky-500 animate-float"
            >
              Zzz
            </span>
          </div>
        )}

        {phase === 'waking' && (
          <div className="absolute inset-0 rounded-full bg-amber-300/40 animate-ping pointer-events-none" />
        )}

        <button
          type="button"
          onClick={handleSleepingTap}
          title="Tap Puff 3 times to wake him up!"
          className={`relative bg-transparent border-0 outline-none focus:outline-none cursor-pointer group p-0 transition-transform ${
            phase === 'sleeping' && tapCount === 1
              ? 'rotate-6 scale-105'
              : phase === 'sleeping' && tapCount === 2
              ? '-rotate-12 scale-110 animate-wiggle'
              : 'hover:scale-105'
          }`}
        >
          <img
            src={activeFrameSrc}
            onError={(e) => {
              e.currentTarget.src = blinkLogo;
            }}
            alt="Sleeping Mascot"
            className={`w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-[0_10px_16px_rgba(15,23,42,0.28)] ${
              phase === 'sleeping' ? 'animate-pulse-glow' : ''
            }`}
          />
        </button>

        <div className="mt-1 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-extrabold shadow-lg flex items-center gap-1.5">
          {phase === 'waking' ? (
            <span className="text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" />
              *Grumble-Squeak!* Waking Up!
            </span>
          ) : tapCount === 0 ? (
            <span>💤 Puff is napping • Tap 3x to wake!</span>
          ) : tapCount === 1 ? (
            <span className="text-amber-300">*Grrr... mrrow?* (Tap 1/3)</span>
          ) : (
            <span className="text-rose-400">*Rumble-squeak!* 1 more tap! (2/3)</span>
          )}
        </div>
      </div>
    );
  }

  const isNearTop = position.y < 230;
  const isNearLeft = position.x < 260;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-[45] select-none transition-opacity duration-300 ${
        phase === 'poofing' ? 'scale-150 opacity-0' : 'opacity-100'
      }`}
    >
      {phase === 'poofing' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-28 rounded-full bg-white/80 animate-ping" />
        </div>
      )}

      {/* Intelligent Speech Bubble */}
      <div
        className={`absolute ${
          isNearTop ? 'top-full mt-3' : 'bottom-full mb-3'
        } ${
          isNearLeft ? 'left-0' : 'right-0'
        } w-[250px] sm:w-[275px] p-3.5 rounded-3xl bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold shadow-[0_12px_30px_rgba(15,23,42,0.22)] border-2 border-slate-900 ${
          isDragging ? '' : 'animate-float'
        }`}
      >
        {phase === 'goodbye' ? (
          <p className="text-rose-600 font-extrabold leading-snug">
            👋 Goodbye for now! I’ll be napping at the bottom of the screen!
          </p>
        ) : (
          <>
            <p className="leading-snug text-slate-800">{pitch.text}</p>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePromptAction}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold shadow transition-transform hover:scale-105 ${
                  pitch.ctaType === 'open-sky-game'
                    ? 'bg-[#8AC926] hover:bg-lime-400 text-slate-900 animate-pulse'
                    : 'bg-[#FF595E] hover:bg-[#e0484d] text-white'
                }`}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied COZY15!
                  </>
                ) : pitch.ctaType === 'open-sky-game' ? (
                  <>
                    <Gamepad2 className="w-3.5 h-3.5" />
                    {pitch.ctaLabel}
                  </>
                ) : pitch.ctaType === 'scroll-featured' ? (
                  <>
                    <ArrowDown className="w-3 h-3" />
                    {pitch.ctaLabel}
                  </>
                ) : pitch.ctaType === 'open-customizer' ? (
                  <>
                    <Wand2 className="w-3 h-3" />
                    {pitch.ctaLabel}
                  </>
                ) : (
                  <>
                    <Tag className="w-3 h-3" />
                    {pitch.ctaLabel}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleManualNap}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-extrabold text-slate-600 hover:text-slate-900 transition-colors"
              >
                💤 Nap now
              </button>
            </div>
          </>
        )}

        <div
          className={`w-3.5 h-3.5 bg-white border-slate-900 rotate-45 absolute ${
            isNearTop
              ? '-top-2 border-l-2 border-t-2'
              : '-bottom-2 border-r-2 border-b-2'
          } ${isNearLeft ? 'left-10' : 'right-10'}`}
        />
      </div>

      {/* Draggable Borderless Mascot Body */}
      <div
        onPointerDown={handleMascotPointerDown}
        onClick={handleMascotClick}
        role="button"
        tabIndex={0}
        title="Drag me around, or tap me 10 times quickly for a secret game!"
        className={`relative touch-none bg-transparent border-0 outline-none select-none group ${
          isDragging
            ? 'cursor-grabbing scale-110'
            : antsyMode
            ? 'cursor-pointer animate-wiggle'
            : 'cursor-grab animate-float-delayed'
        }`}
      >
        <img
          src={isBlinking ? blinkLogo : openLogo}
          onError={(e) => {
            e.currentTarget.src = '/logo-full-color.svg';
          }}
          draggable={false}
          alt="Puff the Moveable Pillow Stuffing Mascot"
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-[0_12px_18px_rgba(15,23,42,0.28)] group-hover:scale-105 transition-transform duration-200 pointer-events-none"
        />

        <span className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[9px] font-bold whitespace-nowrap flex items-center gap-1 shadow">
          <Move className="w-2.5 h-2.5 text-amber-300" />
          Drag or Tap 10x
        </span>
      </div>
    </div>
  );
}
