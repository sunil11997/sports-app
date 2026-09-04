/**
 * Realistic Sports Audio Synthesizer (Zero External Dependencies)
 * Generates authentic referee whistle, countdown beeps, and match buzzers using Web Audio API.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * 📢 Realistic Dual-Frequency Referee Whistle (with Pea Trill modulation)
   */
  playWhistle(duration = 0.8) {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.7, now + 0.05);
    masterGain.gain.setValueAtTime(0.7, now + duration - 0.1);
    masterGain.gain.linearRampToValueAtTime(0, now + duration);
    masterGain.connect(ctx.destination);

    // Primary Whistle Frequency (around 2600 Hz - 2800 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2600, now);

    // Secondary Harmonics (around 2850 Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2850, now);

    // Trill Modulation (Whistle Pea Vibrato ~ 30 Hz)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(32, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(150, now);

    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    // Bandpass Filter for Metallic Body Resonant Tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2725, now);
    filter.Q.setValueAtTime(4.5, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    lfo.stop(now + duration);
  }

  /**
   * ⏱️ Countdown Tick (3... 2... 1...)
   */
  playCountdownTick(isFinal = false) {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, now); // 880Hz for final GO, 440Hz for 3,2,1

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.4 : 0.15));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.4 : 0.15));
  }

  /**
   * 🚨 Match Buzzer / End of Half Horn
   */
  playBuzzer(duration = 1.2) {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(160, now);
    osc2.frequency.setValueAtTime(164, now); // Slight detune for harsh buzzer texture

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.setValueAtTime(0.6, now + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * ⚡ Authentic Pro Kabaddi Style Do-Or-Die Arena Siren
   * Plays a pulsing, urgent stadium siren alert when a team is on their 3rd (Do-Or-Die) raid.
   */
  playDoOrDie(duration = 2.4) {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.75, now + 0.1);
    masterGain.gain.setValueAtTime(0.75, now + duration - 0.3);
    masterGain.gain.linearRampToValueAtTime(0, now + duration);
    masterGain.connect(ctx.destination);

    // Resonant bandpass filter for stadium horn acoustics
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.Q.setValueAtTime(3.0, now);
    filter.connect(masterGain);

    // High urgent siren oscillator (sawtooth)
    const siren1 = ctx.createOscillator();
    siren1.type = 'sawtooth';

    // Harmonic siren oscillator (triangle)
    const siren2 = ctx.createOscillator();
    siren2.type = 'triangle';

    // Sub-bass stadium rumble oscillator
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);

    // Siren frequency sweep points: rapid rising and falling pitches (580Hz <-> 1080Hz)
    const pitchPivots = [
      { t: 0.0, f: 580 },
      { t: 0.25, f: 1040 },
      { t: 0.5, f: 600 },
      { t: 0.75, f: 1080 },
      { t: 1.0, f: 620 },
      { t: 1.25, f: 1100 },
      { t: 1.5, f: 640 },
      { t: 1.75, f: 1120 },
      { t: 2.0, f: 560 },
      { t: 2.4, f: 480 },
    ];

    pitchPivots.forEach(({ t, f }) => {
      siren1.frequency.linearRampToValueAtTime(f, now + t);
      siren2.frequency.linearRampToValueAtTime(f * 1.02, now + t); // micro-detune for thickness
    });

    siren1.connect(filter);
    siren2.connect(filter);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.4, now);
    subOsc.connect(subGain);
    subGain.connect(masterGain);

    siren1.start(now);
    siren2.start(now);
    subOsc.start(now);

    siren1.stop(now + duration);
    siren2.stop(now + duration);
    subOsc.stop(now + duration);
  }
}

export const sounds = new SoundEngine();
