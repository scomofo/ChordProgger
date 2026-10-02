/**
 * Pure DSP for live key / chord detection (the keyfinder.live concept).
 *
 * Pipeline: FFT magnitudes (dB) -> 12-bin chromagram -> Krumhansl key profiles
 * -> chord template matching. Everything here is DOM-free so it unit-tests
 * under node.
 */

/** Krumhansl-Kessler tonal profiles, indexed by pitch class relative to tonic. */
const MAJOR_PROFILE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
const MINOR_PROFILE = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

const CHORD_TEMPLATES: { quality: string; intervals: number[] }[] = [
  { quality: "maj", intervals: [0, 4, 7] },
  { quality: "min", intervals: [0, 3, 7] },
  { quality: "dim", intervals: [0, 3, 6] },
  { quality: "aug", intervals: [0, 4, 8] },
  { quality: "sus4", intervals: [0, 5, 7] },
  { quality: "sus2", intervals: [0, 2, 7] },
  { quality: "7", intervals: [0, 4, 7, 10] },
  { quality: "maj7", intervals: [0, 4, 7, 11] },
  { quality: "min7", intervals: [0, 3, 7, 10] },
];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Fold an FFT magnitude spectrum (dB, as from AnalyserNode.getFloatFrequencyData)
 * into a 12-bin chromagram. Bins below `floorDb` are treated as silence.
 * Returns a max-normalized vector (all zeros when nothing is above the floor).
 */
export function dbToChroma(
  db: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  floorDb = -85,
): number[] {
  const chroma = new Array<number>(12).fill(0);
  const binHz = sampleRate / fftSize;
  const loHz = 55; // A1
  const hiHz = 2093; // C7
  for (let i = 1; i < db.length; i += 1) {
    const v = db[i] ?? -Infinity;
    if (v <= floorDb) continue;
    const f = i * binHz;
    if (f < loHz || f > hiHz) continue;
    const linear = 10 ** ((v - floorDb) / 20); // 1..~large above the floor
    const midi = 69 + 12 * Math.log2(f / 440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] = (chroma[pc] ?? 0) + Math.sqrt(linear);
  }
  const peak = Math.max(...chroma);
  if (peak <= 0) return chroma;
  return chroma.map((c) => c / peak);
}

/** Exponential moving average between the previous and next chromagram. */
export function smoothChroma(prev: number[], next: number[], alpha = 0.35): number[] {
  return prev.map((p, i) => p * (1 - alpha) + (next[i] ?? 0) * alpha);
}

function rotate<T>(arr: T[], n: number): T[] {
  // Rotate so that index n carries the original index-0 weight
  // (i.e. rotated[i] = arr[(i - n) mod 12]).
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(arr.length - k), ...arr.slice(0, arr.length - k)];
}

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i += 1) {
    const xa = (a[i] ?? 0) - ma;
    const xb = (b[i] ?? 0) - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  if (da <= 0 || db <= 0) return 0;
  return num / Math.sqrt(da * db);
}

export type DetectedKey = {
  /** Pitch class of the tonic, 0 = C. */
  tonicPc: number;
  mode: "major" | "minor";
  /** Pearson correlation of the winning profile. */
  score: number;
  /** 0..1, derived from the correlation. */
  confidence: number;
};

/** Krumhansl-Schmuckler key detection: best-correlating major/minor profile. */
export function detectKey(chroma: number[]): DetectedKey {
  let best: DetectedKey = { tonicPc: 0, mode: "major", score: -2, confidence: 0 };
  for (let tonic = 0; tonic < 12; tonic += 1) {
    const entries = [
      { mode: "major" as const, profile: MAJOR_PROFILE },
      { mode: "minor" as const, profile: MINOR_PROFILE },
    ];
    for (const { mode, profile } of entries) {
      const score = pearson(chroma, rotate(profile, tonic));
      if (score > best.score) {
        best = { tonicPc: tonic, mode, score, confidence: clamp01((score - 0.35) / 0.55) };
      }
    }
  }
  return best;
}

export type DetectedChord = {
  rootPc: number;
  quality: string;
  /** Cosine similarity against the winning template, 0..1. */
  score: number;
};

/**
 * Match the chromagram against triad/seventh templates. Returns null when
 * nothing matches convincingly (thin or noisy input).
 */
export function detectChord(chroma: number[], minScore = 0.6): DetectedChord | null {
  const norm = Math.sqrt(chroma.reduce((s, v) => s + v * v, 0));
  if (norm <= 0) return null;
  const unit = chroma.map((v) => v / norm);
  let best: DetectedChord | null = null;
  for (let root = 0; root < 12; root += 1) {
    for (const t of CHORD_TEMPLATES) {
      const template = new Array<number>(12).fill(0.08);
      for (const iv of t.intervals) template[(root + iv) % 12] = 1;
      const tNorm = Math.sqrt(template.reduce((s, v) => s + v * v, 0));
      let dot = 0;
      for (let i = 0; i < 12; i += 1) dot += (unit[i] ?? 0) * ((template[i] ?? 0) / tNorm);
      if (!best || dot > best.score) best = { rootPc: root, quality: t.quality, score: dot };
    }
  }
  return best && best.score >= minScore ? best : null;
}

/** True when the spectrum carries almost no energy above the noise floor. */
export function isQuiet(db: ArrayLike<number>, floorDb = -85): boolean {
  for (let i = 0; i < db.length; i += 1) {
    if ((db[i] ?? -Infinity) > floorDb + 6) return false;
  }
  return true;
}
