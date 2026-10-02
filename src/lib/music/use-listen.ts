import { useCallback, useEffect, useRef, useState } from "react";
import {
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

const FFT_SIZE = 4096;
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
        const chord = key.confidence > 0.25 ? detectChord(live.chroma) : null;
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
