// Sound controller supporting public/sounds/pop.mp3 + Web Audio gremlin/kitten grumbles & squeaks
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.popAudio = null;
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
    if (!this.muted) this.playPop();
    return this.muted;
  }

  // Plays /sounds/pop.mp3 (or /pop.mp3) when the mascot disappears
  playDisappearPopMp3() {
    if (this.muted) return;
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/pop.mp3');
      audio.volume = 0.75;
      audio.play().catch(() => {
        // Fallback if placed directly in /pop.mp3 or blocked by autoplay
        const fallbackAudio = new Audio('/pop.mp3');
        fallbackAudio.volume = 0.75;
        fallbackAudio.play().catch(() => this.playPop());
      });
    }
  }

  // Cute high-pitched kitten/gremlin squeak
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

  // Sleepy gremlin/kitten grumble & purr-rumble when tapped while sleeping (Tap 1 & Tap 2)
  playGremlinGrumble(intensity = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    // Low saw/triangle rumble modulated by a 28Hz purr/grumble LFO
    osc.type = 'sawtooth';
    const baseFreq = intensity === 1 ? 115 : 155;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.34);

    lfo.frequency.setValueAtTime(28, now);
    lfoGain.gain.setValueAtTime(35, now);
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

  // Full wake-up shake-off rumble + excited kitten/gremlin squeaks + flight whoosh (Tap 3)
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
