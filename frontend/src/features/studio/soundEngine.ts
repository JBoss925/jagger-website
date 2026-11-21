// GameCube & PS1-inspired spatial Web Audio synthesizer with independent Music & SFX controls:
// 1. Music: Peaceful, harmonious, lightly bit-crushed "digital realm" ambient pad:
//    - Warm open Cmaj9 <-> Fmaj9 lush sine/triangle pad (100% consonant, zero eerie dissonance)
//    - Subtle 26-step soft digital quantizer (WaveShaper) + warm 1.5kHz low-pass for authentic
//      early-2000s GameCube / PS1 ADPCM crushed-glass character
//    - Whisper-soft airy room texture & gentle crystalline pentatonic micro-sparkles in stereo reverb
// 2. SFX: Snappy PS1/GameCube portal entry swell + synchronized 120-cube tumbling marimba cascade
//    on first load, plus crystalline hover/select/tab/filter/theater sounds.
// 3. Independent bottom-left Music & SFX mute buttons (persisted in localStorage).

const PENTATONIC_RATIOS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2];

// Two serene, luminous GameCube/Wii-style open major-9th voicings (zero tritones!)
const AMBIENT_CHORDS: number[][] = [
  // Cmaj9: C3, G3, D4, E4, B4
  [130.81, 196.0, 293.66, 329.63, 493.88],
  // Fmaj9: F3, C4, G3, A3, E4
  [174.61, 261.63, 196.0, 220.0, 329.63],
];

// Wii / GameCube-style crystalline pentatonic droplet pools aligned to each chord
const SPARKLE_POOLS: number[][] = [
  [523.25, 587.33, 659.25, 783.99, 987.77, 1046.5, 1174.66], // Cmaj9 air
  [523.25, 587.33, 659.25, 698.46, 880.0, 1046.5, 1318.51],  // Fmaj9 air
];

const MUSIC_MUTE_KEY = "jagger:music-muted";
const SFX_MUTE_KEY = "jagger:sfx-muted";
const MASTER_TARGET_GAIN = 0.28;

export type AudioStateSnapshot = {
  musicMuted: boolean;
  sfxMuted: boolean;
  running: boolean;
  bootPlayed: boolean;
};

type AudioListener = (state: AudioStateSnapshot) => void;

class SpatialSoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private sparkleDelayIn: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private sfxReverbSend: GainNode | null = null;
  private ambientReverbSend: GainNode | null = null;

  private ambientStarted = false;
  private padOscillators: OscillatorNode[] = [];
  private ambientTimers: number[] = [];
  private chordIndex = 0;
  private sparkleIndex = 0;

  private musicMuted = false;
  private sfxMuted = false;
  private theaterDucked = false;
  private bootPlayed = false;
  private lastHoverAt = 0;
  private listeners = new Set<AudioListener>();
  private visibilityBound = false;

  constructor() {
    this.musicMuted = this.readFlag(MUSIC_MUTE_KEY);
    this.sfxMuted = this.readFlag(SFX_MUTE_KEY);
  }

  private readFlag(key: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage?.getItem(key) === "1";
    } catch {
      return false;
    }
  }

  private persistFlag(key: string, muted: boolean) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage?.setItem(key, muted ? "1" : "0");
    } catch {
      // Ignore storage quota or privacy-mode errors
    }
  }

  private isReducedMotion(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  public getState(): AudioStateSnapshot {
    const running = Boolean(this.ctx && this.ctx.state === "running");
    return {
      musicMuted: this.musicMuted,
      sfxMuted: this.sfxMuted,
      running,
      bootPlayed: this.bootPlayed,
    };
  }

  public isMusicMuted(): boolean {
    return this.musicMuted;
  }

  public isSfxMuted(): boolean {
    return this.sfxMuted;
  }

  public isMuted(): boolean {
    return this.musicMuted && this.sfxMuted;
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snap = this.getState();
    this.listeners.forEach((fn) => fn(snap));
  }

  private bindVisibilityHandler() {
    if (this.visibilityBound || typeof document === "undefined") return;
    this.visibilityBound = true;
    document.addEventListener("visibilitychange", () => {
      this.syncBusGains(false);
    });
  }

  /** Crisp digital bit-crush quantization transfer curve (tactile retro-console crunch, silky after LP). */
  private buildSoftCrushCurve(steps = 12, wet = 0.68): Float32Array<ArrayBuffer> {
    const n = 2048;
    const curve = new Float32Array(new ArrayBuffer(n * 4));
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      const quantized = Math.round(x * steps) / steps;
      curve[i] = x * (1 - wet) + quantized * wet;
    }
    return curve;
  }

  /** Lush 2.75s flowy stereo digital hall impulse response (silky Wii/GameCube console ambience). */
  private buildHallImpulse(ctx: AudioContext): AudioBuffer {
    const duration = 2.75;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.min(1, i / (sampleRate * 0.022)) * Math.pow(1 - t, 2.05);
        const white = Math.random() * 2 - 1;
        lp += (0.26 - t * 0.14) * (white - lp);
        data[i] = lp * env * 0.66;
      }
      const taps = ch === 0 ? [0.021, 0.053, 0.091] : [0.027, 0.064, 0.107];
      for (const sec of taps) {
        const idx = Math.floor(sec * sampleRate);
        if (idx < length) data[idx] += 0.2;
      }
    }
    return buffer;
  }

  /** Seamless 3-second soft airy pink-noise buffer for delicate digital-room breath. */
  private buildAirNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const duration = 3.0;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.035;
        b1 = 0.985 * b1 + white * 0.045;
        b2 = 0.95 * b2 + white * 0.055;
        data[i] = (b0 + b1 + b2) * 0.12;
      }
      const fadeSamples = Math.floor(sampleRate * 0.25);
      for (let i = 0; i < fadeSamples; i++) {
        const w = i / fadeSamples;
        const tailIdx = length - fadeSamples + i;
        data[tailIdx] = data[tailIdx] * (1 - w) + data[i] * w;
      }
    }
    return buffer;
  }

  private ensureContext(allowResume = true): AudioContext | null {
    if (
      typeof window === "undefined" ||
      this.isReducedMotion() ||
      (this.musicMuted && this.sfxMuted)
    ) {
      return null;
    }
    if (!this.ctx) {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtor) return null;
      try {
        const ctx = new AudioCtor();
        this.ctx = ctx;

        const master = ctx.createGain();
        master.gain.value = MASTER_TARGET_GAIN;

        const sfxBus = ctx.createGain();
        sfxBus.gain.value = this.sfxMuted ? 0.0001 : 1.25;

        const ambientBus = ctx.createGain();
        ambientBus.gain.value = 0.0001;

        const compressor =
          typeof ctx.createDynamicsCompressor === "function"
            ? ctx.createDynamicsCompressor()
            : null;
        if (compressor) {
          compressor.threshold.value = -15;
          compressor.knee.value = 20;
          compressor.ratio.value = 3.0;
          compressor.attack.value = 0.01;
          compressor.release.value = 0.2;
        }

        // Separate wet sends routed through each bus so muting Music NEVER leaves reverb tails
        // bleeding from music, and muting SFX never cuts music reverb!
        let reverb: ConvolverNode | null = null;
        let sfxReverbSend: GainNode | null = null;
        let ambientReverbSend: GainNode | null = null;
        if (typeof ctx.createConvolver === "function") {
          reverb = ctx.createConvolver();
          reverb.buffer = this.buildHallImpulse(ctx);

          sfxReverbSend = ctx.createGain();
          sfxReverbSend.gain.value = 0.42;
          sfxReverbSend.connect(reverb);

          ambientReverbSend = ctx.createGain();
          ambientReverbSend.gain.value = 0.95; // Extra lush, flowy reverb cloud for ambient music!
          ambientReverbSend.connect(reverb);

          reverb.connect(master);
        }

        sfxBus.connect(master);
        ambientBus.connect(master);
        if (ambientReverbSend) {
          ambientBus.connect(ambientReverbSend);
        }

        if (compressor) {
          master.connect(compressor);
          compressor.connect(ctx.destination);
        } else {
          master.connect(ctx.destination);
        }

        this.master = master;
        this.sfxBus = sfxBus;
        this.ambientBus = ambientBus;
        this.reverbNode = reverb;
        this.sfxReverbSend = sfxReverbSend;
        this.ambientReverbSend = ambientReverbSend;
        this.bindVisibilityHandler();
      } catch {
        return null;
      }
    }

    if (allowResume && this.ctx.state === "suspended") {
      void this.ctx
        .resume()
        .then(() => {
          this.onContextRunning();
        })
        .catch(() => {});
    }

    if (this.ctx.state === "running") {
      this.onContextRunning();
    }

    return this.ctx;
  }

  private onContextRunning() {
    if (!this.ctx || this.ctx.state !== "running") return;
    if (!this.musicMuted && !this.ambientStarted) {
      this.startAmbientBed();
    }
    this.syncBusGains(true);
    this.notify();
  }

  private syncBusGains(snappy = false) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const tabHidden = typeof document !== "undefined" && document.hidden;

    if (this.ambientBus) {
      // Tucked softly into the background (~45% of previous level) so UI blips pop clearly above it!
      const musicTarget =
        this.musicMuted || tabHidden
          ? 0.0001
          : this.theaterDucked
            ? 0.04
            : 0.16;
      this.ambientBus.gain.cancelScheduledValues(now);
      this.ambientBus.gain.setTargetAtTime(
        musicTarget,
        now,
        this.musicMuted ? 0.045 : snappy ? 0.22 : 0.35,
      );
    }

    if (this.sfxBus) {
      const sfxTarget = this.sfxMuted ? 0.0001 : 1.25;
      this.sfxBus.gain.cancelScheduledValues(now);
      this.sfxBus.gain.setTargetAtTime(sfxTarget, now, 0.03);
    }
    if (this.sfxReverbSend) {
      const wetTarget = this.sfxMuted ? 0.0001 : 0.42;
      this.sfxReverbSend.gain.cancelScheduledValues(now);
      this.sfxReverbSend.gain.setTargetAtTime(wetTarget, now, 0.03);
    }
  }

  /**
   * Build the peaceful, harmonious, lightly bit-crushed GameCube-inspired ambient digital pad:
   * - 5 warm consonant chord voices (Cmaj9 <-> Fmaj9 slow gentle morph)
   * - Subtle digital WaveShaper quantization + silky 1.5kHz low-pass filter
   * - Whisper-soft high-mid digital air texture + gentle crystalline sparkles
   */
  private startAmbientBed() {
    if (this.ambientStarted || !this.ctx || !this.ambientBus) return;
    this.ambientStarted = true;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const bus = this.ambientBus;

    const padMix = ctx.createGain();
    padMix.gain.value = 0.62;

    let padPreFilter: AudioNode = padMix;
    if (typeof ctx.createWaveShaper === "function") {
      const crusher = ctx.createWaveShaper();
      crusher.curve = this.buildSoftCrushCurve(12, 0.68); // More audible retro bit-crushed edge!
      crusher.oversample = "none";
      padMix.connect(crusher);
      padPreFilter = crusher;
    }

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.setValueAtTime(1620, now);
    padFilter.Q.setValueAtTime(1.1, now);

    // Flowy liquid filter breathing (920 Hz <-> 2320 Hz)
    const filterLfo = ctx.createOscillator();
    filterLfo.type = "sine";
    filterLfo.frequency.value = 0.095;
    const filterLfoDepth = ctx.createGain();
    filterLfoDepth.gain.value = 680;
    filterLfo.connect(filterLfoDepth);
    filterLfoDepth.connect(padFilter.frequency);
    filterLfo.start(now);

    padPreFilter.connect(padFilter);
    padFilter.connect(bus);

    // Flowy stereo ping-pong echo delay bus for the Nintendo/Wii-style background note droplets!
    const sparkleIn = ctx.createGain();
    sparkleIn.gain.value = 1.0;
    sparkleIn.connect(bus);
    if (typeof ctx.createDelay === "function") {
      const delayL = ctx.createDelay(1.0);
      const delayR = ctx.createDelay(1.0);
      delayL.delayTime.value = 0.36;
      delayR.delayTime.value = 0.51;
      const fbL = ctx.createGain();
      const fbR = ctx.createGain();
      fbL.gain.value = 0.34;
      fbR.gain.value = 0.34;
      const echoTone = ctx.createBiquadFilter();
      echoTone.type = "lowpass";
      echoTone.frequency.value = 1850;

      sparkleIn.connect(delayL);
      delayL.connect(echoTone);
      echoTone.connect(delayR);
      delayR.connect(fbR);
      fbR.connect(delayL);

      delayL.connect(fbL);
      if (typeof ctx.createStereoPanner === "function") {
        const panL = ctx.createStereoPanner();
        const panR = ctx.createStereoPanner();
        panL.pan.value = -0.55;
        panR.pan.value = 0.55;
        fbL.connect(panL);
        panL.connect(bus);
        delayR.connect(panR);
        panR.connect(bus);
      } else {
        fbL.connect(bus);
        delayR.connect(bus);
      }
    }
    this.sparkleDelayIn = sparkleIn;

    const initialChord = AMBIENT_CHORDS[0];
    const voiceSpecs: Array<{
      type: OscillatorType;
      gain: number;
      detune: number;
      pan: number;
    }> = [
      { type: "sine", gain: 0.22, detune: -3, pan: -0.18 },
      { type: "triangle", gain: 0.14, detune: 4, pan: 0.2 },
      { type: "sine", gain: 0.12, detune: -4, pan: -0.32 },
      { type: "triangle", gain: 0.1, detune: 3, pan: 0.34 },
      { type: "sine", gain: 0.065, detune: 2, pan: 0.0 },
    ];

    this.padOscillators = initialChord.map((freq, idx) => {
      const spec = voiceSpecs[idx % voiceSpecs.length];
      const osc = ctx.createOscillator();
      osc.type = spec.type;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(spec.detune, now);

      const vGain = ctx.createGain();
      vGain.gain.value = spec.gain;

      const ampLfo = ctx.createOscillator();
      ampLfo.type = "sine";
      ampLfo.frequency.value = 0.09 + idx * 0.023;
      const ampDepth = ctx.createGain();
      ampDepth.gain.value = spec.gain * 0.22;
      ampLfo.connect(ampDepth);
      ampDepth.connect(vGain.gain);
      ampLfo.start(now);

      osc.connect(vGain);
      if (typeof ctx.createStereoPanner === "function") {
        const panner = ctx.createStereoPanner();
        panner.pan.value = spec.pan;
        vGain.connect(panner);
        panner.connect(padMix);
      } else {
        vGain.connect(padMix);
      }

      osc.start(now);
      return osc;
    });

    // Very soft, clean airy room texture (like a bright glass hall — zero dark rumble!)
    const airSrc = ctx.createBufferSource();
    airSrc.buffer = this.buildAirNoiseBuffer(ctx);
    airSrc.loop = true;

    const airBand = ctx.createBiquadFilter();
    airBand.type = "bandpass";
    airBand.frequency.setValueAtTime(1650, now);
    airBand.Q.setValueAtTime(1.8, now);

    const airGain = ctx.createGain();
    airGain.gain.value = 0.085;

    airSrc.connect(airBand);
    airBand.connect(airGain);
    airGain.connect(bus);
    airSrc.start(now);

    if (typeof window !== "undefined") {
      const chordTimer = window.setInterval(() => {
        if (this.musicMuted || !this.ctx || this.ctx.state !== "running") return;
        this.chordIndex = (this.chordIndex + 1) % AMBIENT_CHORDS.length;
        const nextChord = AMBIENT_CHORDS[this.chordIndex];
        const t = this.ctx.currentTime;
        this.padOscillators.forEach((osc, i) => {
          const targetFreq = nextChord[i % nextChord.length];
          osc.frequency.cancelScheduledValues(t);
          osc.frequency.setValueAtTime(osc.frequency.value, t);
          osc.frequency.exponentialRampToValueAtTime(targetFreq, t + 3.6);
        });
      }, 11000);

      // Nintendo / Wii-style generative bit-crushed crystalline droplets flowing through delay + reverb!
      const sparkleTimer = window.setInterval(() => {
        this.triggerAmbientSparkle();
      }, 1950);

      this.ambientTimers.push(chordTimer, sparkleTimer);
    }
  }

  private triggerAmbientSparkle() {
    if (
      this.musicMuted ||
      !this.ctx ||
      this.ctx.state !== "running" ||
      !this.ambientBus ||
      (typeof document !== "undefined" && document.hidden)
    ) {
      return;
    }
    const ctx = this.ctx;
    const pool = SPARKLE_POOLS[this.chordIndex % SPARKLE_POOLS.length];
    const dest = this.sparkleDelayIn ?? this.ambientBus;

    // Alternate between gentle 1-note droplet and airy 2-note Wii-style rising motif
    const motifLen = this.sparkleIndex % 3 === 0 ? 2 : 1;
    for (let step = 0; step < motifLen; step++) {
      const idx = (this.sparkleIndex + step * 2) % pool.length;
      const freq = pool[idx];
      const now = ctx.currentTime + step * 0.24;
      const pan = (((this.sparkleIndex + step) % 5) - 2) * 0.26;

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2.0, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2600, now);
      filter.frequency.exponentialRampToValueAtTime(720, now + 1.55);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(step === 0 ? 0.135 : 0.105, now + 0.028);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.65);

      const osc2Gain = ctx.createGain();
      osc2Gain.gain.value = 0.28;
      osc.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);

      if (typeof ctx.createWaveShaper === "function") {
        const bitEdge = ctx.createWaveShaper();
        bitEdge.curve = this.buildSoftCrushCurve(10, 0.65);
        filter.connect(bitEdge);
        bitEdge.connect(gain);
      } else {
        filter.connect(gain);
      }

      if (typeof ctx.createStereoPanner === "function") {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, now);
        gain.connect(panner);
        panner.connect(dest);
      } else {
        gain.connect(dest);
      }

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 1.7);
      osc2.stop(now + 1.7);
    }
    this.sparkleIndex++;
  }

  /**
   * Explicitly called from the 1-click "Enter with sound" boot button!
   * Guarantees synchronous AudioContext creation/resume inside the click gesture,
   * clears any prior mute flags so audio works immediately, and plays the full
   * PS1/GameCube portal swell + 120-cube tumbling arrival cascade at t = 0ms.
   */
  public enterWithSound() {
    if (this.isReducedMotion()) {
      this.notify();
      return;
    }
    this.musicMuted = false;
    this.sfxMuted = false;
    this.persistFlag(MUSIC_MUTE_KEY, false);
    this.persistFlag(SFX_MUTE_KEY, false);
    this.bootPlayed = false;

    const ctx = this.ensureContext(true);
    if (!ctx) {
      this.notify();
      return;
    }

    const fireIntro = () => {
      if (!this.ctx || this.ctx.state !== "running") return;
      this.onContextRunning();
      this.playBootIntro(true);
      this.notify();
    };

    if (ctx.state === "running") {
      fireIntro();
    } else {
      void ctx.resume().then(fireIntro).catch(() => {
        this.notify();
      });
    }
  }

  /**
   * Immediately attempt to start audio on page load.
   * Fires boot swell (if Music unmuted) + cube drop-in cascade (if SFX unmuted) immediately
   * when autoplay is permitted, or within <20ms on first user gesture.
   */
  public startExperience(withCubeCascade = true) {
    if ((this.musicMuted && this.sfxMuted) || this.isReducedMotion()) {
      this.notify();
      return;
    }
    const ctx = this.ensureContext(true);
    if (!ctx) return;

    const triggerNow = () => {
      if ((this.musicMuted && this.sfxMuted) || !this.ctx || this.ctx.state !== "running") return;
      this.onContextRunning();
      if (!this.bootPlayed) {
        this.playBootIntro(withCubeCascade);
      }
      this.notify();
    };

    if (ctx.state === "running") {
      triggerNow();
    } else {
      void ctx.resume().then(triggerNow).catch(() => {
        this.notify();
      });
    }
  }

  /** Unlock synchronously inside a capture-phase gesture handler and trigger boot intro immediately! */
  public unlock(withCubeCascade = true) {
    if ((this.musicMuted && this.sfxMuted) || this.isReducedMotion()) return;
    const ctx = this.ensureContext(true);
    if (!ctx) return;

    const finishUnlock = () => {
      if ((this.musicMuted && this.sfxMuted) || !this.ctx || this.ctx.state !== "running") return;
      this.onContextRunning();
      if (!this.bootPlayed) {
        this.playBootIntro(withCubeCascade);
      }
      this.notify();
    };

    if (ctx.state === "running") {
      finishUnlock();
    } else {
      void ctx.resume().then(finishUnlock).catch(() => {});
    }
  }

  /**
   * Snappy, uplifting PS1 + GameCube Portal Entry Swell (Music) +
   * Synchronized 120-Cube Tumbling Arrival Cascade (SFX)!
   */
  public playBootIntro(withCubeCascade = true) {
    if ((this.musicMuted && this.sfxMuted) || this.isReducedMotion()) return;
    const ctx = this.ensureContext(true);
    if (!ctx || ctx.state !== "running") return;
    this.bootPlayed = true;

    const now = ctx.currentTime;

    // --- Layer 1 (Music): Luminous PS1/GameCube Cmaj9 Portal Swell (110ms bloom!) ---
    if (!this.musicMuted && this.ambientBus) {
      const swellMix = ctx.createGain();
      swellMix.gain.value = 0.85;

      let swellChain: AudioNode = swellMix;
      if (typeof ctx.createWaveShaper === "function") {
        const crush = ctx.createWaveShaper();
        crush.curve = this.buildSoftCrushCurve(14, 0.62);
        swellMix.connect(crush);
        swellChain = crush;
      }

      const swellFilter = ctx.createBiquadFilter();
      swellFilter.type = "lowpass";
      swellFilter.Q.setValueAtTime(1.8, now);
      swellFilter.frequency.setValueAtTime(340, now);
      swellFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.55);
      swellFilter.frequency.exponentialRampToValueAtTime(980, now + 2.1);

      const swellGain = ctx.createGain();
      swellGain.gain.setValueAtTime(0.0001, now);
      swellGain.gain.linearRampToValueAtTime(0.55, now + 0.14);
      swellGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.25);

      swellChain.connect(swellFilter);
      swellFilter.connect(swellGain);
      swellGain.connect(this.ambientBus);

      const chord: Array<{
        freq: number;
        type: OscillatorType;
        detune: number;
        amp: number;
      }> = [
        { freq: 130.81, type: "triangle", detune: -4, amp: 0.34 },
        { freq: 196.0, type: "sawtooth", detune: 3, amp: 0.16 },
        { freq: 293.66, type: "triangle", detune: -3, amp: 0.2 },
        { freq: 329.63, type: "sine", detune: 4, amp: 0.18 },
        { freq: 392.0, type: "triangle", detune: -2, amp: 0.14 },
        { freq: 493.88, type: "sine", detune: 5, amp: 0.1 },
      ];

      for (const v of chord) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = v.type;
        osc.frequency.setValueAtTime(v.freq, now);
        osc.detune.setValueAtTime(v.detune, now);
        g.gain.value = v.amp;
        osc.connect(g);
        g.connect(swellMix);
        osc.start(now);
        osc.stop(now + 2.35);
      }

      if (!this.ambientStarted) {
        this.startAmbientBed();
      }
    }

    // --- Layer 2 (SFX): Synchronized Cube Split-Apart & Main-Page Arrival Cascade ---
    if (withCubeCascade && !this.sfxMuted && this.sfxBus) {
      // Crisp crystal fracture pop right as the floating cube splits open (t = 0.01s)
      this.playGlassTone(523.25, 0.008, 0.24, 0.11, "triangle", -0.18, 0.34);
      this.playGlassTone(659.25, 0.022, 0.26, 0.095, "sine", 0.18, 0.36);

      // Rising crystalline mini-cube scatter across the burst & flight into the sculptures
      const cascadeNotes = [
        261.63, // C4
        329.63, // E4
        392.0,  // G4
        493.88, // B4
        523.25, // C5
        587.33, // D5
        659.25, // E5
        783.99, // G5
      ];
      cascadeNotes.forEach((freq, step) => {
        const offset = 0.08 + step * 0.088;
        const pan = -0.48 + (step / (cascadeNotes.length - 1)) * 0.96;
        const isLanding = step === cascadeNotes.length - 1;
        this.playGlassTone(
          freq,
          offset,
          isLanding ? 0.92 : 0.38,
          isLanding ? 0.14 : 0.095,
          step % 2 === 0 ? "triangle" : "sine",
          pan,
          0.38,
        );
      });
      // Warm harmonic resolution right as the 120 mini-cubes lock into the main page sculptures
      this.playGlassTone(196.0, 0.74, 0.85, 0.12, "triangle", 0, 0.34);
      this.playGlassTone(523.25, 0.78, 0.9, 0.095, "sine", -0.14, 0.4);
    }

    this.syncBusGains(true);
    this.notify();
  }

  public setMusicMuted(muted: boolean) {
    this.musicMuted = muted;
    this.persistFlag(MUSIC_MUTE_KEY, muted);

    if (!muted) {
      const ctx = this.ensureContext(true);
      if (ctx) {
        const onReady = () => {
          if (this.musicMuted || ctx.state !== "running") return;
          if (!this.ambientStarted) this.startAmbientBed();
          if (!this.bootPlayed) {
            this.playBootIntro(!this.sfxMuted);
          }
          this.syncBusGains(true);
          this.notify();
        };
        if (ctx.state === "running") onReady();
        else void ctx.resume().then(onReady).catch(() => {});
      }
    } else {
      this.syncBusGains(true);
    }

    this.notify();
  }

  public toggleMusicMute(): boolean {
    this.setMusicMuted(!this.musicMuted);
    return this.musicMuted;
  }

  public setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
    this.persistFlag(SFX_MUTE_KEY, muted);

    if (!muted) {
      const ctx = this.ensureContext(true);
      if (ctx) {
        const onReady = () => {
          if (this.sfxMuted || ctx.state !== "running") return;
          this.syncBusGains(true);
          // Crisp confirmation chime so user immediately hears SFX is back on
          this.playGlassTone(523.25, 0, 0.3, 0.095, "sine", -0.08, 0.28);
          this.playGlassTone(659.25, 0.045, 0.38, 0.08, "sine", 0.1, 0.28);
          this.notify();
        };
        if (ctx.state === "running") onReady();
        else void ctx.resume().then(onReady).catch(() => {});
      }
    } else {
      this.syncBusGains(true);
    }

    this.notify();
  }

  public toggleSfxMute(): boolean {
    this.setSfxMuted(!this.sfxMuted);
    return this.sfxMuted;
  }

  /** Convenience helper that mutes/unmutes both Music and SFX together. */
  public setMuted(muted: boolean) {
    this.setMusicMuted(muted);
    this.setSfxMuted(muted);
  }

  public toggleMute(): boolean {
    const next = !this.isMuted();
    this.setMuted(next);
    return next;
  }

  /** Gently duck ambient music pad while full-screen interactive demos/readers are open. */
  public setTheaterActive(active: boolean) {
    if (this.theaterDucked === active) return;
    this.theaterDucked = active;
    this.syncBusGains(false);
  }

  private playGlassTone(
    freq: number,
    startOffset: number,
    duration: number,
    peakGain: number,
    type: OscillatorType = "sine",
    pan = 0,
    reverbMix = 0.25,
  ) {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext(true);
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime + startOffset;

    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const overtoneGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = "sine";
    overtone.frequency.setValueAtTime(freq * 2.004, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(freq * 4.5, 4800), now);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(freq * 1.6, 520),
      now + duration,
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.linearRampToValueAtTime(peakGain * 0.22, now + 0.008);
    overtoneGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration * 0.52,
    );

    osc.connect(filter);
    overtone.connect(overtoneGain);
    overtoneGain.connect(filter);
    filter.connect(gain);

    if (typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-0.55, Math.min(0.55, pan)), now);
      gain.connect(panner);
      panner.connect(this.sfxBus);
      if (this.sfxReverbSend && reverbMix > 0) {
        const wet = ctx.createGain();
        wet.gain.value = reverbMix;
        panner.connect(wet);
        wet.connect(this.sfxReverbSend);
      }
    } else {
      gain.connect(this.sfxBus);
      if (this.sfxReverbSend && reverbMix > 0) {
        const wet = ctx.createGain();
        wet.gain.value = reverbMix;
        gain.connect(wet);
        wet.connect(this.sfxReverbSend);
      }
    }

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration + 0.05);
    overtone.stop(now + duration + 0.05);
  }

  /** Soft crystalline ping when hovering an object in 3D space or the dock. */
  public playHover(index: number) {
    if (this.sfxMuted || !this.ctx || this.ctx.state !== "running") return;
    const now = performance.now();
    if (now - this.lastHoverAt < 70) return;
    this.lastHoverAt = now;

    const base = 392; // G4
    const ratio = PENTATONIC_RATIOS[Math.abs(index) % PENTATONIC_RATIOS.length];
    const pan = ((index % 5) - 2) * 0.14;
    this.playGlassTone(base * ratio, 0, 0.22, 0.055, "sine", pan, 0.2);
  }

  /** Warm glass fifth chime when selecting an object into focus. */
  public playSelect(index: number) {
    if (this.sfxMuted) return;
    this.ensureContext(true);
    const root =
      293.66 * PENTATONIC_RATIOS[Math.abs(index) % 5]; // D4 pentatonic
    this.playGlassTone(root, 0, 0.42, 0.14, "triangle", -0.1, 0.3);
    this.playGlassTone(root * 1.5, 0.045, 0.52, 0.12, "sine", 0.12, 0.32);
    this.playGlassTone(root * 2, 0.095, 0.58, 0.075, "sine", 0, 0.35);
  }

  /** Signature GameCube-inspired cascading marimba/glass arpeggio on section switch. */
  public playSectionTransition(sectionIndex: number) {
    if (this.sfxMuted) return;
    this.ensureContext(true);
    const roots = [261.63, 293.66, 329.63, 349.23, 392.0]; // C4, D4, E4, F4, G4
    const base = roots[Math.abs(sectionIndex) % roots.length];
    const pattern = [1, 5 / 4, 3 / 2, 2];
    pattern.forEach((ratio, step) => {
      this.playGlassTone(
        base * ratio,
        step * 0.052,
        0.48 - step * 0.04,
        0.105 - step * 0.01,
        step === 0 ? "triangle" : "sine",
        (step - 1.5) * 0.16,
        0.32,
      );
    });
  }

  /** Crisp light glass ripple when filtering project categories. */
  public playCategoryFilter(categoryIndex: number) {
    if (this.sfxMuted) return;
    this.ensureContext(true);
    const base = 329.63 * PENTATONIC_RATIOS[categoryIndex % 5];
    this.playGlassTone(base, 0, 0.28, 0.09, "sine", -0.08, 0.22);
    this.playGlassTone(base * 1.25, 0.038, 0.34, 0.075, "sine", 0.08, 0.24);
  }

  /** Gentle descending glass note when dismissing a detail sheet. */
  public playClose() {
    if (this.sfxMuted || !this.ctx || this.ctx.state !== "running") return;
    this.playGlassTone(440, 0, 0.22, 0.07, "sine", 0.05, 0.22);
    this.playGlassTone(329.63, 0.04, 0.3, 0.065, "sine", -0.05, 0.25);
  }

  /** Airy ascending harmonic when expanding a live demo or full reader. */
  public playOpenTheater() {
    if (this.sfxMuted) return;
    this.ensureContext(true);
    this.playGlassTone(392, 0, 0.35, 0.09, "sine", -0.1, 0.3);
    this.playGlassTone(523.25, 0.05, 0.42, 0.095, "sine", 0.05, 0.32);
    this.playGlassTone(659.25, 0.1, 0.5, 0.08, "sine", 0.15, 0.35);
  }
}

export const soundEngine = new SpatialSoundEngine();
