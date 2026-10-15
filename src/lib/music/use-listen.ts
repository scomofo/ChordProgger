import { useCallback, useEffect, useRef, useState } from "react";
import {
  bassPitchClass,
  chordReadout,
  dbToChroma,
  detectChord,
  detectKey,
  isQuiet,
  smoothChroma,
  type DetectedChord,
  type DetectedKey,
} from "./listen-dsp";

export type ListenStatus = "idle" | "requesting" | "listening" | "denied" | "error";

export type ListenSnapshot = {
  status: ListenStatus;
  /** True while the mic is open but nothing audible is coming in. */
  quiet: boolean;
  key: DetectedKey | null;
  chord: DetectedChord | null;
  /** 0..1 input level for the meter. */
  level: number;
};

// 16384 samples ≈ 2.9 Hz bins at 48 kHz: a semitone at C3 is 7.8 Hz, so the
// smaller 4096 window (11.7 Hz bins) cannot separate adjacent low notes.
// The 120 ms tick still reads the trailing window; the chroma EMA in
// listen-dsp smooths on a comparable timescale, so the longer window costs
// no practical responsiveness for sustained chords.
const FFT_SIZE = 16384;
const TICK_MS = 120;

export function useListen() {
  const [snapshot, setSnapshot] = useState<ListenSnapshot>({
    status: "idle",
    quiet: true,
    key: null,
    chord: null,
    level: 0,
  });
  const rig = useRef<{
    ctx: AudioContext;
    stream: MediaStream;
    analyser: AnalyserNode;
    timer: number;
    chroma: number[];
    freq: Float32Array<ArrayBuffer>;
  } | null>(null);

  const stop = useCallback(() => {
    const r = rig.current;
    rig.current = null;
    if (r) {
      window.clearInterval(r.timer);
      r.stream.getTracks().forEach((t) => t.stop());
      void r.ctx.close().catch(() => {});
    }
    setSnapshot({ status: "idle", quiet: true, key: null, chord: null, level: 0 });
  }, []);

  const start = useCallback(async () => {
    if (rig.current) return;
    setSnapshot((s) => ({ ...s, status: "requesting" }));
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch {
      setSnapshot((s) => ({ ...s, status: "denied" }));
      return;
    }
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) throw new Error("no AudioContext");
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.75;
      src.connect(analyser);
      const freq = new Float32Array(
        new ArrayBuffer(analyser.frequencyBinCount * Float32Array.BYTES_PER_ELEMENT),
      );
      const state = {
        ctx,
        stream,
        analyser,
        timer: 0,
        chroma: new Array<number>(12).fill(0),
        freq,
      };
      state.timer = window.setInterval(() => {
        const live = rig.current;
        if (!live) return;
        live.analyser.getFloatFrequencyData(live.freq);
        // Input level from the strongest bin above the noise floor.
        let peak = -Infinity;
        for (let i = 0; i < live.freq.length; i += 1) {
          const v = live.freq[i] ?? -Infinity;
          if (v > peak) peak = v;
        }
        const level = Math.max(0, Math.min(1, (peak + 85) / 55));
        if (isQuiet(live.freq)) {
          setSnapshot((s) => ({ ...s, quiet: true, level: level * 0.4 }));
          return;
        }
        const fresh = dbToChroma(live.freq, live.ctx.sampleRate, FFT_SIZE);
        live.chroma = smoothChroma(live.chroma, fresh, 0.4);
        const key = detectKey(live.chroma);
        // The chord readout answers to the chord match's own evidence
        // (chordReadout), not to the key's confidence: an augmented triad
        // can never establish a key, but it matches its template outright.
        // The bass note spells genuine template ties (sus2 vs its
        // inverted sus4, augmented rotations) that chroma cannot split.
        const bassPc = bassPitchClass(live.freq, live.ctx.sampleRate, FFT_SIZE);
        const chord = chordReadout(detectChord(live.chroma, { bassPc }));
        setSnapshot((s) => ({ ...s, quiet: false, key, chord, level }));
      }, TICK_MS);
      rig.current = state;
      setSnapshot((s) => ({ ...s, status: "listening", quiet: true }));
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setSnapshot((s) => ({ ...s, status: "error" }));
    }
  }, []);

  useEffect(() => () => {
    const r = rig.current;
    rig.current = null;
    if (r) {
      window.clearInterval(r.timer);
      r.stream.getTracks().forEach((t) => t.stop());
      void r.ctx.close().catch(() => {});
    }
  }, []);

  return { snapshot, start, stop };
}
