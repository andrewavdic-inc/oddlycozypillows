function buildAudioCandidates(customUrl, defaultList = []) {
  if (!customUrl) return defaultList;
  if (customUrl.startsWith('data:') || customUrl.startsWith('http') || customUrl.startsWith('blob:')) {
    return [customUrl, ...defaultList];
  }
  const fileName = customUrl.split('/').pop();
  const lowerFile = fileName.toLowerCase();
  const capFile = fileName.charAt(0).toUpperCase() + fileName.slice(1);

  return Array.from(
    new Set([
      customUrl,
      `/sounds/${fileName}`,
      `/sounds/${lowerFile}`,
      `/sounds/${capFile}`,
      `/${fileName}`,
      ...defaultList,
    ])
  );
}

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmAudio = null;
    this.introAudio = null;
    this.previewAudio = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.bgmAudio) {
      this.bgmAudio.muted = this.muted;
    }
    if (this.introAudio) {
      this.introAudio.muted = this.muted;
    }
    if (this.previewAudio) {
      this.previewAudio.muted = this.muted;
    }
    if (!this.muted) this.playPop();
    return this.muted;
  }

  playSoundFile(candidates = [], volume = 0.75, fallbackFn = null) {
    if (this.muted || typeof window === 'undefined') return;
    const clampedVol = Math.max(0.05, Math.min(1, Number(volume) || 0.75));

    const tryPlay = (index) => {
      if (index >= candidates.length) {
        if (fallbackFn) fallbackFn();
        return;
      }
      const audio = new Audio(candidates[index]);
      audio.volume = clampedVol;
      audio.play().catch(() => {
        tryPlay(index + 1);
      });
    };

    tryPlay(0);
  }

  // Starts looping Intro Video background music while on the "Tap to Start" screen
  startIntroMusic(customUrl = '', volume = 0.45) {
    if (typeof window === 'undefined') return;
    this.stopIntroMusic();
    this.stopGameMusic();

    if (!customUrl || !customUrl.trim()) return;

    const candidates = buildAudioCandidates(customUrl, []);
    const clampedVol = Math.max(0.05, Math.min(1, Number(volume) || 0.45));
    let idx = 0;

    const tryNextTrack = () => {
      if (idx >= candidates.length) return;
      const audio = new Audio(candidates[idx]);
      audio.loop = true;
      audio.volume = clampedVol;
      audio.muted = this.muted;
      this.introAudio = audio;

      audio.play().catch(() => {
        idx += 1;
        tryNextTrack();
      });
    };

    tryNextTrack();
  }

  stopIntroMusic() {
    if (this.introAudio) {
      this.introAudio.pause();
      this.introAudio.currentTime = 0;
      this.introAudio = null;
    }
  }

  // Starts looping gameplay background music for Puff's Cloud Dash
  startGameMusic(customUrl = '/sounds/bm.mp3', volume = 0.45) {
    if (typeof window === 'undefined') return;
    this.stopIntroMusic();
    this.stopGameMusic();

    const candidates = buildAudioCandidates(customUrl, [
      '/sounds/bm.mp3',
      '/sounds/Bm.mp3',
      '/bm.mp3',
      '/Bm.mp3',
    ]);
    const clampedVol = Math.max(0.05, Math.min(1, Number(volume) || 0.45));
    let idx = 0;

    const tryNextTrack = () => {
      if (idx >= candidates.length) return;
      const audio = new Audio(candidates[idx]);
      audio.loop = true;
      audio.volume = clampedVol;
      audio.muted = this.muted;
      this.bgmAudio = audio;

      audio.play().catch(() => {
        idx += 1;
        tryNextTrack();
      });
    };

    tryNextTrack();
  }

  stopGameMusic() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
  }

  stopAllGameAudio() {
    this.stopIntroMusic();
    this.stopGameMusic();
    this.stopPreviewAudio();
  }

  // Plays or stops a sound preview inside Admin HQ
  previewAudioUrl(customUrl, volume = 0.75) {
    if (typeof window === 'undefined' || !customUrl) return;
    this.stopPreviewAudio();

    const candidates = buildAudioCandidates(customUrl, []);
    const clampedVol = Math.max(0.05, Math.min(1, Number(volume) || 0.75));
    let idx = 0;

    const tryPlay = () => {
      if (idx >= candidates.length) return;
      const audio = new Audio(candidates[idx]);
      audio.volume = clampedVol;
      this.previewAudio = audio;
      audio.play().catch(() => {
        idx += 1;
        tryPlay();
      });
    };

    tryPlay();
  }

  stopPreviewAudio() {
    if (this.previewAudio) {
      this.previewAudio.pause();
      this.previewAudio.currentTime = 0;
      this.previewAudio = null;
    }
  }

  // Plays bonk.mp3 (or Admin custom sound) when Puff hits a hazard
  playBonkSound(customUrl = '/sounds/bonk.mp3', volume = 0.85) {
    const candidates = buildAudioCandidates(customUrl, [
      '/sounds/bonk.mp3',
      '/sounds/Bonk.mp3',
      '/bonk.mp3',
      '/Bonk.mp3',
    ]);
    this.playSoundFile(candidates, volume, () => this.playBoing());
  }

  // Plays powerup.mp3 (or Admin custom sound) when Puff catches a healing pillow
  playHealthPowerupSound(customUrl = '/sounds/powerup.mp3', volume = 0.85) {
    const candidates = buildAudioCandidates(customUrl, [
      '/sounds/powerup.mp3',
      '/sounds/Powerup.mp3',
      '/powerup.mp3',
    ]);
    this.playSoundFile(candidates, volume, () => this.playSparkleChime());
  }

  // Plays moonbeam.mp3 (or Admin custom sound) when Puff catches a Moonbeam Shield
  playMoonbeamSound(customUrl = '/sounds/moonbeam.mp3', volume = 0.85) {
    const candidates = buildAudioCandidates(customUrl, [
      '/sounds/moonbeam.mp3',
      '/sounds/Moonbeam.mp3',
      '/moonbeam.mp3',
      '/Moonbeam.mp3',
    ]);
    this.playSoundFile(candidates, volume, () => this.playSparkleChime());
  }

  // Plays pop.mp3 when the mascot disappears into his nap
  playDisappearPopMp3() {
    this.playSoundFile(
      ['/sounds/pop.mp3', '/sounds/Pop.mp3', '/pop.mp3'],
      0.75,
      () => this.playPop()
    );
  }

  playMascotSqueak() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(1220, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.19);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.21);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  playGremlinGrumble(intensity = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const baseFreq = intensity === 1 ? 115 : 155;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.34);

    lfo.frequency.setValueAtTime(28, now);
    lfoGain.setValueAtTime(35, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.36);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.36);
    lfo.stop(now + 0.36);

    if (intensity >= 2) {
      setTimeout(() => this.playMascotSqueak(), 180);
    }
  }

  playWakeupSequenceSound() {
    if (this.muted) return;
    this.playGremlinGrumble(2);
    setTimeout(() => this.playMascotSqueak(), 380);
    setTimeout(() => this.playSparkleChime(), 850);
  }

  playMascotBlink() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.045);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.07);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playBoing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(310, now + 0.25);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playSparkleChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.008, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    });
  }
}

export const soundFX = new SoundController();
