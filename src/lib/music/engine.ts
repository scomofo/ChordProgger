import { compilePattern, type PatternId, type VoiceId } from "./patterns";
import {
  midiToFreq,
  slotStarts,
  totalBeats,
  voicingFor,
  type KeyInfo,
  type ModeId,
  type Slot,
} from "./theory";

export type EngineSnapshot = {
  tonic: KeyInfo;
  mode: ModeId;
  slots: Slot[];
  patternId: PatternId;
  voice: VoiceId;
  tempo: number;
  volume: number;
  muted: boolean;
  loop: boolean;
  metronome: boolean;
};

export type Playhead = {
  slotIndex: number;
  progress: number;
  beat: number;
};

type SchedEvent = {
  beat: number;
  duration: number;
  midis: number[];
  stagger: number;
  velocity: number;
  slotIndex: number;
  kind: "note" | "click";
};

type Compiled = {
  events: SchedEvent[];
  total: number;
  starts: number[];
};

function compile(snap: EngineSnapshot): Compiled {
  const starts = slotStarts(snap.slots);
  const total = totalBeats(snap.slots);
  const events: SchedEvent[] = [];

  snap.slots.forEach((slot, slotIndex) => {
    const { bass, tones } = voicingFor(snap.tonic, snap.mode, slot);
    const origin = starts[slotIndex] ?? 0;
    for (const ev of compilePattern(snap.patternId, slot.beats, bass, tones)) {
      events.push({
        beat: origin + ev.beat,
        duration: ev.duration,
        midis: ev.midis,
        stagger: ev.stagger,
        velocity: ev.velocity,
        slotIndex,
        kind: "note",
      });
    }
    if (snap.metronome) {
      for (let b = 0; b < slot.beats; b += 1) {
        const abs = origin + b;
        events.push({
          beat: abs,
          duration: 0.05,
          midis: [],
          stagger: 0,
          velocity: abs % 4 === 0 ? 1 : 0.45,
          slotIndex,
          kind: "click",
        });
      }
    }
  });

  events.sort((a, b) => a.beat - b.beat || (a.kind === "click" ? -1 : 1));
  return { events, total, starts };
}

function slotAt(starts: number[], slots: Slot[], beat: number): number {
  if (!slots.length) return 0;
  let idx = 0;
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i] ?? 0;
    const end = start + (slots[i]?.beats ?? 0);
    if (beat >= start && beat < end) return i;
    if (beat >= start) idx = i;
  }
  return idx;
}

class CadenceEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private raf = 0;
  private playing = false;
  private origin = 0;
  private spb = 0.5;
  private loopPass = 0;
  private eventIndex = -1;
  private compiled: Compiled | null = null;
  private getSnapshot: (() => EngineSnapshot) | null = null;
  private onPlayhead: ((ph: Playhead | null) => void) | null = null;
  private onStop: (() => void) | null = null;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -18;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 3;
      this.compressor.attack.value = 0.004;
      this.compressor.release.value = 0.18;
      this.master.gain.value = 0.0001;
      this.master.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") void this.ctx?.resume();
      });
    }
    return this.ctx;
  }

  unlock() {
    const ctx = this.ensure();
    if (ctx?.state === "suspended") void ctx.resume();
  }

  start(
    getSnapshot: () => EngineSnapshot,
    handlers: {
      onPlayhead: (ph: Playhead | null) => void;
      onStop: () => void;
    },
  ) {
    this.unlock();
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const snap = getSnapshot();
    if (!snap.slots.length) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.raf) cancelAnimationFrame(this.raf);

    this.getSnapshot = getSnapshot;
    this.onPlayhead = handlers.onPlayhead;
    this.onStop = handlers.onStop;
    this.playing = true;
    this.compiled = compile(snap);
    this.spb = 60 / clampTempo(snap.tempo);
    this.origin = ctx.currentTime + 0.05;
    this.loopPass = 0;
    this.eventIndex = -1;
    this.applyGain(snap, true);
    this.tick();
    this.paint();
  }

  stop() {
    const was = this.playing;
    this.playing = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0.0001, now, 0.025);
    }
    this.onPlayhead?.(null);
    if (was) this.onStop?.();
  }

  isPlaying() {
    return this.playing;
  }

  private applyGain(snap: EngineSnapshot, immediate = false) {
    if (!this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    const gain = snap.muted ? 0.0001 : Math.max(0.0001, snap.volume * snap.volume * 0.85);
    this.master.gain.cancelScheduledValues(now);
    if (immediate) this.master.gain.setValueAtTime(gain, now);
    else this.master.gain.setTargetAtTime(gain, now, 0.03);
  }

  private tick = () => {
    if (!this.playing || !this.ctx || !this.getSnapshot) return;
    const snap = this.getSnapshot();
    const compiled = compile(snap);
    this.compiled = compiled;
    this.spb = 60 / clampTempo(snap.tempo);
    this.applyGain(snap);

    const { events, total } = compiled;
    if (!total || !snap.slots.length || !events.length) {
      this.stop();
      return;
    }

    const now = this.ctx.currentTime;
    const horizon = (now + 0.14 - this.origin) / this.spb;
    let guard = 0;

    while (guard < 64) {
      guard += 1;
      let pass = this.loopPass;
      let index = this.eventIndex + 1;
      if (index >= events.length) {
        if (!snap.loop) {
          const endTime = this.origin + (pass * total + total) * this.spb;
          const wait = Math.max(0.03, endTime - now);
          this.timer = setTimeout(() => this.stop(), wait * 1000);
          return;
        }
        pass += 1;
        index = 0;
      }
      const ev = events[index];
      if (!ev) break;
      const abs = pass * total + ev.beat;
      if (abs > horizon) break;
      const when = this.origin + abs * this.spb;
      if (when >= now - 0.02) {
        if (ev.kind === "click") this.playClick(when, ev.velocity);
        else this.playChord(snap.voice, ev.midis, when, ev.duration * this.spb, ev.stagger, ev.velocity);
      }
      this.loopPass = pass;
      this.eventIndex = index;
    }

    this.timer = setTimeout(this.tick, 25);
  };

  private paint = () => {
    if (!this.playing || !this.ctx || !this.compiled || !this.getSnapshot) return;
    const snap = this.getSnapshot();
    const total = this.compiled.total;
    if (!total) return;
    const beats = (this.ctx.currentTime - this.origin) / this.spb;
    if (!snap.loop && beats >= total) {
      this.raf = requestAnimationFrame(this.paint);
      return;
    }
    const local = ((beats % total) + total) % total;
    const idx = slotAt(this.compiled.starts, snap.slots, local);
    const start = this.compiled.starts[idx] ?? 0;
    const dur = snap.slots[idx]?.beats ?? 1;
    this.onPlayhead?.({
      slotIndex: idx,
      progress: Math.min(1, Math.max(0, (local - start) / dur)),
      beat: local,
    });
    this.raf = requestAnimationFrame(this.paint);
  };

  private playClick(when: number, velocity: number) {
    const ctx = this.ctx;
    const dest = this.master;
    if (!ctx || !dest) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = velocity > 0.7 ? 1260 : 880;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.08 * velocity, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.04);
    osc.connect(g);
    g.connect(dest);
    osc.start(when);
    osc.stop(when + 0.05);
  }

  private playChord(
    voice: VoiceId,
    midis: number[],
    when: number,
    duration: number,
    stagger: number,
    velocity: number,
  ) {
    const abs = Math.abs(stagger);
    const ordered = stagger < 0 ? [...midis].reverse() : midis;
    ordered.forEach((midi, i) => {
      this.playNote(voice, midi, when + i * abs, duration, velocity * Math.max(0.45, 1 - i * 0.04));
    });
  }

  private playNote(voice: VoiceId, midi: number, when: number, duration: number, velocity: number) {
    const ctx = this.ctx;
    const dest = this.master;
    if (!ctx || !dest) return;
    const freq = midiToFreq(midi);
    const vel = Math.max(0.05, Math.min(1, velocity));
    if (voice === "nylon") this.pluck(ctx, dest, freq, when, duration, vel, midi);
    else if (voice === "pad") this.pad(ctx, dest, freq, when, duration, vel);
    else this.piano(ctx, dest, freq, when, duration, vel, midi);
  }

  private piano(
    ctx: AudioContext,
    dest: GainNode,
    freq: number,
    when: number,
    duration: number,
    vel: number,
    midi: number,
  ) {
    const out = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    const brightness = 1800 + vel * 2400 + (midi - 48) * 18;
    filter.frequency.setValueAtTime(brightness, when);
    filter.frequency.exponentialRampToValueAtTime(Math.max(420, brightness * 0.28), when + Math.min(duration, 1.4));
    filter.Q.value = 0.7;
    out.connect(filter);
    filter.connect(dest);

    const amp = Math.min(0.22, 0.12 + vel * 0.1) * (midi < 50 ? 1.15 : 1);
    out.gain.setValueAtTime(0.0001, when);
    out.gain.exponentialRampToValueAtTime(amp, when + 0.008);
    out.gain.exponentialRampToValueAtTime(amp * 0.38, when + Math.min(0.28, duration * 0.4));
    out.gain.exponentialRampToValueAtTime(0.0001, when + duration + 0.18);

    const stopAt = when + duration + 0.22;
    const partials: Array<{ n: number; g: number; type: OscillatorType }> = [
      { n: 1, g: 1, type: "triangle" },
      { n: 2, g: 0.42, type: "sine" },
      { n: 3, g: 0.18, type: "sine" },
      { n: 4, g: 0.1, type: "sine" },
      { n: 5, g: 0.06, type: "sine" },
      { n: 6, g: 0.03, type: "sine" },
    ];
    for (const p of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = p.type;
      osc.frequency.value = freq * p.n * Math.sqrt(1 + p.n * p.n * 0.00012);
      g.gain.value = p.g;
      osc.connect(g);
      g.connect(out);
      osc.start(when);
      osc.stop(stopAt);
    }

    const noise = ctx.createBufferSource();
    const nbuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
    const data = nbuf.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    noise.buffer = nbuf;
    const ng = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200;
    bp.Q.value = 1.1;
    ng.gain.setValueAtTime(0.0001, when);
    ng.gain.exponentialRampToValueAtTime(0.045 * vel, when + 0.003);
    ng.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(out);
    noise.start(when);
    noise.stop(when + 0.04);
  }

  private pluck(
    ctx: AudioContext,
    dest: GainNode,
    freq: number,
    when: number,
    duration: number,
    vel: number,
    midi: number,
  ) {
    const out = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = Math.min(5200, 900 + freq * 6);
    filter.Q.value = 1.4;
    out.connect(filter);
    filter.connect(dest);
    const amp = 0.16 * vel * (midi < 52 ? 1.2 : 0.9);
    out.gain.setValueAtTime(0.0001, when);
    out.gain.exponentialRampToValueAtTime(amp, when + 0.004);
    out.gain.exponentialRampToValueAtTime(amp * 0.2, when + 0.12);
    out.gain.exponentialRampToValueAtTime(0.0001, when + Math.min(duration + 0.3, 1.8));

    const stopAt = when + duration + 0.35;
    const specs: Array<{ n: number; g: number; type: OscillatorType }> = [
      { n: 1, g: 1, type: "triangle" },
      { n: 2, g: 0.55, type: "sine" },
      { n: 3, g: 0.22, type: "sine" },
      { n: 5, g: 0.08, type: "sine" },
    ];
    for (const p of specs) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = p.type;
      osc.frequency.value = freq * p.n;
      g.gain.value = p.g;
      osc.connect(g);
      g.connect(out);
      osc.start(when);
      osc.stop(stopAt);
    }

    const burst = ctx.createBufferSource();
    const len = Math.floor(ctx.sampleRate * 0.018);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    burst.buffer = buf;
    const bg = ctx.createGain();
    bg.gain.value = 0.08 * vel;
    burst.connect(bg);
    bg.connect(filter);
    burst.start(when);
    burst.stop(when + 0.02);
  }

  private pad(ctx: AudioContext, dest: GainNode, freq: number, when: number, duration: number, vel: number) {
    const out = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, when);
    filter.frequency.exponentialRampToValueAtTime(1100 + vel * 400, when + 0.12);
    filter.Q.value = 0.4;
    out.connect(filter);
    filter.connect(dest);
    const amp = 0.08 * vel;
    out.gain.setValueAtTime(0.0001, when);
    out.gain.linearRampToValueAtTime(amp, when + 0.08);
    out.gain.setValueAtTime(amp, when + Math.max(0.1, duration - 0.12));
    out.gain.linearRampToValueAtTime(0.0001, when + duration + 0.28);

    const stopAt = when + duration + 0.32;
    for (const c of [-8, 0, 9]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq * 2 ** (c / 1200);
      g.gain.value = 0.33;
      osc.connect(g);
      g.connect(out);
      osc.start(when);
      osc.stop(stopAt);
    }
  }
}

function clampTempo(tempo: number) {
  return Math.max(48, Math.min(180, tempo));
}

export const engine = new CadenceEngine();
