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
 * A spectral peak extracted from the dB spectrum: one candidate partial,
 * with its frequency refined by parabolic interpolation on the log-magnitude
 * (the standard estimator for a windowed sinusoid) and its linear amplitude.
 */
type Partial = { freq: number; amp: number };

const CHROMA_LO_HZ = 55; // A1
const CHROMA_HI_HZ = 2093; // C7
/** Peaks weaker than this (relative to the strongest) are window artefacts
 *  (Blackman sidelobe maxima sit ~58 dB down) or inaudible partials. */
const PEAK_REL_FLOOR_DB = -50;

/**
 * Find local maxima in the dB spectrum and refine each by parabolic
 * interpolation. Binning every FFT bin straight into a pitch class (the old
 * approach) smears one low partial across ~5 pitch classes: at fftSize 4096 /
 * 48 kHz a bin is 11.7 Hz wide while a semitone at C3 is 7.8 Hz, and the
 * Blackman main lobe spans ~6 bins. A peak list keeps each partial's energy
 * in the single pitch class its interpolated frequency belongs to.
 */
function findPartials(
  db: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  floorDb: number,
): Partial[] {
  const binHz = sampleRate / fftSize;
  const partials: Partial[] = [];
  for (let i = 1; i < db.length - 1; i += 1) {
    const d0 = db[i] ?? -Infinity;
    if (!(d0 > floorDb)) continue;
    const dm = db[i - 1] ?? -Infinity;
    const dp = db[i + 1] ?? -Infinity;
    if (!(d0 > dm && d0 >= dp)) continue;
    let offset = 0;
    let peakDb = d0;
    if (Number.isFinite(dm) && Number.isFinite(dp)) {
      const denom = dm - 2 * d0 + dp;
      if (denom < 0) {
        offset = Math.max(-0.5, Math.min(0.5, (0.5 * (dm - dp)) / denom));
        peakDb = d0 - 0.25 * (dm - dp) * offset;
      }
    }
    const freq = (i + offset) * binHz;
    if (freq < CHROMA_LO_HZ || freq > CHROMA_HI_HZ) continue;
    partials.push({ freq, amp: 10 ** (peakDb / 20) });
  }
  if (partials.length === 0) return partials;
  const maxAmp = Math.max(...partials.map((p) => p.amp));
  const relFloor = maxAmp * 10 ** (PEAK_REL_FLOOR_DB / 20);
  return partials.filter((p) => p.amp >= relFloor);
}

/**
 * Highest harmonic order whose predicted energy is discounted. Beyond this
 * a partial's expected amplitude (< 1/12 of its fundamental) is down in the
 * noise the peak floor already rejects.
 */
const HARMONIC_MAX_ORDER = 12;
/**
 * How far a partial's ratio to a lower partial may drift from an exact
 * integer before it stops counting as that partial's harmonic. Parabolic
 * interpolation locates isolated peaks to a fraction of a bin, but at low
 * frequencies neighbouring chord-tone lobes overlap and bias positions by up
 * to ~a quarter semitone; 30 cents covers that while staying well clear of
 * the 100-cent spacing between real fundamentals.
 */
const HARMONIC_TOLERANCE_CENTS = 30;

/**
 * Discount the energy in each partial that a lower partial's harmonic series
 * already explains, so overtones stop voting as if they were independent
 * notes. A harmonic series radiates its k-th partial at roughly 1/k of the
 * fundamental's amplitude (the sawtooth / vibrating-string law), so a peak
 * at k·f is predicted to carry amp(f)/k from the note at f alone. Whatever
 * energy remains above that prediction is real evidence for a note at the
 * peak's own frequency (a chord tone a twelfth up still votes with the
 * excess); whatever does not remain was never a note — it was the lower
 * note's timbre. This is what stops a minor triad's overtones from spelling
 * a major-seventh chord a third up for the template matcher.
 */
function discountHarmonics(partials: Partial[]): Partial[] {
  const sorted = [...partials].sort((a, b) => a.freq - b.freq);
  const out: Partial[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const p = sorted[i] as Partial;
    let residual = p.amp;
    for (let j = 0; j < i; j += 1) {
      const lower = sorted[j] as Partial;
      const ratio = p.freq / lower.freq;
      const k = Math.round(ratio);
      if (k < 2 || k > HARMONIC_MAX_ORDER) continue;
      const centsOff = Math.abs(1200 * Math.log2(ratio / k));
      if (centsOff > HARMONIC_TOLERANCE_CENTS) continue;
      residual -= lower.amp / k;
    }
    if (residual > 0) out.push({ freq: p.freq, amp: residual });
  }
  return out;
}

/**
 * Fold an FFT magnitude spectrum (dB, as from AnalyserNode.getFloatFrequencyData)
 * into a 12-bin chromagram. Bins below `floorDb` are treated as silence.
 * Returns a max-normalized vector (all zeros when nothing is above the floor).
 *
 * The spectrum is first reduced to interpolated spectral peaks (see
 * findPartials), harmonic energy explained by lower partials is discounted
 * (see discountHarmonics), and each remaining partial votes for its pitch
 * class with amplitude-compressed weight (sqrt), the usual dynamic-range
 * compression for chroma so one loud note does not swamp the others.
 */
export function dbToChroma(
  db: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  floorDb = -85,
): number[] {
  const chroma = new Array<number>(12).fill(0);
  for (const p of discountHarmonics(findPartials(db, sampleRate, fftSize, floorDb))) {
    const midi = 69 + 12 * Math.log2(p.freq / 440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] = (chroma[pc] ?? 0) + Math.sqrt(p.amp);
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
  /**
   * Winning score minus the best score among templates spelling a different
   * pitch-class set. Templates that spell the same set as the winner (the
   * sus2/sus4 inversion pair, the three augmented rotations) are one
   * sonority, not rivals; the margin measures how decisively the chroma
   * prefers this sonority over every other one.
   */
  margin: number;
};

export type DetectChordOptions = {
  /** Minimum winning cosine score. */
  minScore?: number;
  /**
   * Pitch class of the bass note (see bassPitchClass). Consulted only to
   * spell a genuine tie, never to override a real score gap.
   */
  bassPc?: number | null;
};

/**
 * Two templates genuinely tie when they spell the same pitch-class set
 * from different roots: a sus2 and the sus4 a fifth above it share one
 * set, and an augmented triad's three rotations are one set. Their
 * template vectors are identical, so their scores agree to floating-point
 * summation dust (exactly 0 across the measurement corpus); 1e-9 sits far
 * above that dust and far below any real score gap.
 */
const SCORE_TIE_EPSILON = 1e-9;

/**
 * Match the chromagram against triad/seventh templates. Returns null when
 * nothing matches convincingly (thin or noisy input).
 */
export function detectChord(chroma: number[], options: DetectChordOptions = {}): DetectedChord | null {
  const minScore = options.minScore ?? 0.6;
  const norm = Math.sqrt(chroma.reduce((s, v) => s + v * v, 0));
  if (norm <= 0) return null;
  const unit = chroma.map((v) => v / norm);
  const scored: (DetectedChord & { setKey: string })[] = [];
  for (let root = 0; root < 12; root += 1) {
    for (const t of CHORD_TEMPLATES) {
      const template = new Array<number>(12).fill(0.08);
      for (const iv of t.intervals) template[(root + iv) % 12] = 1;
      const tNorm = Math.sqrt(template.reduce((s, v) => s + v * v, 0));
      let dot = 0;
      for (let i = 0; i < 12; i += 1) dot += (unit[i] ?? 0) * ((template[i] ?? 0) / tNorm);
      const setKey = t.intervals
        .map((iv) => (root + iv) % 12)
        .sort((a, b) => a - b)
        .join(",");
      scored.push({ rootPc: root, quality: t.quality, score: dot, margin: 0, setKey });
    }
  }
  let best = scored[0] as DetectedChord & { setKey: string };
  for (const c of scored) if (c.score > best.score) best = c;
  if (best.score < minScore) return null;
  // Genuine tie: the tied templates spell one sonority, so the chroma
  // alone cannot choose between them — the bass note can, because a sus2
  // and its inverted sus4 differ exactly by which note is lowest. If a
  // tied candidate's root is the bass pitch class, it wins; a bass that
  // matches no tied root leaves the iteration-order winner in place.
  let winner = best;
  if (options.bassPc != null) {
    const tied = scored.find(
      (c) =>
        c.setKey === best.setKey &&
        best.score - c.score <= SCORE_TIE_EPSILON &&
        c.rootPc === options.bassPc,
    );
    if (tied) winner = tied;
  }
  let runnerUp = 0;
  for (const c of scored) {
    if (c.setKey !== winner.setKey && c.score > runnerUp) runnerUp = c.score;
  }
  return {
    rootPc: winner.rootPc,
    quality: winner.quality,
    score: winner.score,
    margin: winner.score - runnerUp,
  };
}

/**
 * How far the winning sonority must beat every rival sonority before the
 * chord readout shows it. A flat or ambiguous chroma (steady noise, a bare
 * fifth) gives several sonorities the same score, so its margin sits at
 * ~0; real chords in the corpus clear 0.11, and synthetic noise spectra
 * stay under 0.04 — 0.05 sits in the empty band between them.
 */
export const CHORD_MIN_MARGIN = 0.05;

/**
 * The chord readout's own gate, deliberately independent of the key
 * detector: an augmented triad's symmetric chroma can never establish a
 * key (its key confidence sits near 0.1), yet it matches its own template
 * decisively. What the readout answers to is the chord match's evidence —
 * its score cleared detectChord's floor, and its margin over every other
 * sonority clears CHORD_MIN_MARGIN — so ambiguous or noisy input, whose
 * margin collapses, still shows nothing.
 */
export function chordReadout(chord: DetectedChord | null): DetectedChord | null {
  return chord && chord.margin >= CHORD_MIN_MARGIN ? chord : null;
}

/**
 * Pitch class of the bass note: the lowest strong fundamental in the
 * spectrum, read off the same peak list the chroma is built from, so it
 * inherits the peak floors (window sidelobes and sub-55 Hz rumble never
 * qualify). The lowest peak is always a fundamental — nothing below it
 * exists whose harmonic it could be. Returns null when the spectrum has
 * no usable peak.
 */
export function bassPitchClass(
  db: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  floorDb = -85,
): number | null {
  const partials = findPartials(db, sampleRate, fftSize, floorDb);
  if (partials.length === 0) return null;
  let lowest = partials[0] as Partial;
  for (const p of partials) if (p.freq < lowest.freq) lowest = p;
  const midi = Math.round(69 + 12 * Math.log2(lowest.freq / 440));
  return ((midi % 12) + 12) % 12;
}

/** True when the spectrum carries almost no energy above the noise floor. */
export function isQuiet(db: ArrayLike<number>, floorDb = -85): boolean {
  for (let i = 0; i < db.length; i += 1) {
    if ((db[i] ?? -Infinity) > floorDb + 6) return false;
  }
  return true;
}
