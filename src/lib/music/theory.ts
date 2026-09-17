export type ModeId =
  | "major"
  | "minor"
  | "dorian"
  | "mixolydian"
  | "harmonic-minor";

export type Quality =
  | "auto"
  | "maj"
  | "min"
  | "dim"
  | "aug"
  | "7"
  | "maj7"
  | "min7"
  | "m7b5"
  | "dim7"
  | "sus2"
  | "sus4"
  | "add9"
  | "6"
  | "m6"
  | "power";

export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Accidental = -1 | 0 | 1;
export type Inversion = 0 | 1 | 2;
export type Beats = 1 | 2 | 3 | 4 | 8;

export type Slot = {
  id: string;
  degree: Degree;
  accidental: Accidental;
  quality: Quality;
  inversion: Inversion;
  beats: Beats;
};

export type KeyInfo = {
  id: string;
  pc: number;
  label: string;
  flats: boolean;
};

/** Circle-of-fifths order, twelve unique pitch classes. */
export const KEYS: KeyInfo[] = [
  { id: "C", pc: 0, label: "C", flats: false },
  { id: "G", pc: 7, label: "G", flats: false },
  { id: "D", pc: 2, label: "D", flats: false },
  { id: "A", pc: 9, label: "A", flats: false },
  { id: "E", pc: 4, label: "E", flats: false },
  { id: "B", pc: 11, label: "B", flats: false },
  { id: "F#", pc: 6, label: "F♯", flats: false },
  { id: "Db", pc: 1, label: "D♭", flats: true },
  { id: "Ab", pc: 8, label: "A♭", flats: true },
  { id: "Eb", pc: 3, label: "E♭", flats: true },
  { id: "Bb", pc: 10, label: "B♭", flats: true },
  { id: "F", pc: 5, label: "F", flats: true },
];

export const KEY_BY_ID: Record<string, KeyInfo> = Object.fromEntries(
  KEYS.map((k) => [k.id, k]),
);

export const MODES: Record<
  ModeId,
  { label: string; short: string; steps: number[]; qualities: Quality[] }
> = {
  major: {
    label: "Major",
    short: "maj",
    steps: [0, 2, 4, 5, 7, 9, 11],
    qualities: ["maj", "min", "min", "maj", "maj", "min", "dim"],
  },
  minor: {
    label: "Minor",
    short: "min",
    steps: [0, 2, 3, 5, 7, 8, 10],
    qualities: ["min", "dim", "maj", "min", "min", "maj", "maj"],
  },
  dorian: {
    label: "Dorian",
    short: "dor",
    steps: [0, 2, 3, 5, 7, 9, 10],
    qualities: ["min", "min", "maj", "maj", "min", "dim", "maj"],
  },
  mixolydian: {
    label: "Mixolydian",
    short: "mix",
    steps: [0, 2, 4, 5, 7, 9, 10],
    qualities: ["maj", "min", "dim", "maj", "min", "min", "maj"],
  },
  "harmonic-minor": {
    label: "Harmonic minor",
    short: "h.min",
    steps: [0, 2, 3, 5, 7, 8, 11],
    qualities: ["min", "dim", "aug", "min", "maj", "maj", "dim"],
  },
};

export const MODE_LIST = Object.entries(MODES).map(([id, meta]) => ({
  id: id as ModeId,
  ...meta,
}));

export const QUALITY_INTERVALS: Record<Exclude<Quality, "auto">, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  power: [0, 7],
};

export const QUALITY_OPTIONS: { id: Quality; label: string }[] = [
  { id: "auto", label: "diatonic" },
  { id: "maj", label: "maj" },
  { id: "min", label: "min" },
  { id: "dim", label: "dim" },
  { id: "aug", label: "aug" },
  { id: "7", label: "7" },
  { id: "maj7", label: "maj7" },
  { id: "min7", label: "min7" },
  { id: "m7b5", label: "m7♭5" },
  { id: "dim7", label: "dim7" },
  { id: "sus2", label: "sus2" },
  { id: "sus4", label: "sus4" },
  { id: "add9", label: "add9" },
  { id: "6", label: "6" },
  { id: "m6", label: "m6" },
  { id: "power", label: "5" },
];

export const BEAT_OPTIONS: Beats[] = [1, 2, 3, 4, 8];

const SHARP_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const FLAT_NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

export function pcName(pc: number, flats: boolean): string {
  const n = ((pc % 12) + 12) % 12;
  return (flats ? FLAT_NAMES : SHARP_NAMES)[n] ?? "C";
}

export function resolveQuality(mode: ModeId, slot: Slot): Exclude<Quality, "auto"> {
  if (slot.quality !== "auto") return slot.quality;
  return MODES[mode].qualities[slot.degree - 1] as Exclude<Quality, "auto">;
}

export function slotRootPc(tonicPc: number, mode: ModeId, slot: Slot): number {
  const step = MODES[mode].steps[slot.degree - 1] ?? 0;
  return (tonicPc + step + slot.accidental + 120) % 12;
}

export function isMinorish(quality: Exclude<Quality, "auto">): boolean {
  return (
    quality === "min" ||
    quality === "min7" ||
    quality === "m6" ||
    quality === "dim" ||
    quality === "dim7" ||
    quality === "m7b5"
  );
}

export function isDim(quality: Exclude<Quality, "auto">): boolean {
  return quality === "dim" || quality === "dim7" || quality === "m7b5";
}

export function romanNumeral(mode: ModeId, slot: Slot): string {
  const quality = resolveQuality(mode, slot);
  const acc = slot.accidental === -1 ? "♭" : slot.accidental === 1 ? "♯" : "";
  let numeral: string = ROMAN[slot.degree - 1] ?? "I";
  if (isMinorish(quality)) numeral = numeral.toLowerCase();
  if (isDim(quality)) numeral += "°";
  else if (quality === "aug") numeral += "+";
  if (quality === "7" || quality === "min7" || quality === "m7b5") numeral += "⁷";
  else if (quality === "maj7") numeral += "Δ";
  else if (quality === "dim7") numeral += "⁷";
  else if (quality === "sus2") numeral += "sus2";
  else if (quality === "sus4") numeral += "sus4";
  else if (quality === "add9") numeral += "add9";
  else if (quality === "6" || quality === "m6") numeral += "⁶";
  else if (quality === "power") numeral += "⁵";
  return acc + numeral;
}

export function qualitySuffix(quality: Exclude<Quality, "auto">): string {
  switch (quality) {
    case "maj":
      return "";
    case "min":
      return "m";
    case "dim":
      return "dim";
    case "aug":
      return "aug";
    case "7":
      return "7";
    case "maj7":
      return "maj7";
    case "min7":
      return "m7";
    case "m7b5":
      return "m7♭5";
    case "dim7":
      return "dim7";
    case "sus2":
      return "sus2";
    case "sus4":
      return "sus4";
    case "add9":
      return "add9";
    case "6":
      return "6";
    case "m6":
      return "m6";
    case "power":
      return "5";
  }
}

export function chordName(tonic: KeyInfo, mode: ModeId, slot: Slot): string {
  const flats = slot.accidental < 0 ? true : slot.accidental > 0 ? false : tonic.flats;
  const root = pcName(slotRootPc(tonic.pc, mode, slot), flats);
  return root + qualitySuffix(resolveQuality(mode, slot));
}

export function slotLabel(tonic: KeyInfo, mode: ModeId, slot: Slot, numerals: boolean) {
  const name = chordName(tonic, mode, slot);
  const roman = romanNumeral(mode, slot);
  return numerals ? { primary: roman, secondary: name } : { primary: name, secondary: roman };
}

function wrapMidi(n: number, lo: number, hi: number): number {
  while (n > hi) n -= 12;
  while (n < lo) n += 12;
  return n;
}

export type Voicing = {
  bass: number;
  tones: number[];
  all: number[];
};

export function voicingFor(tonic: KeyInfo, mode: ModeId, slot: Slot): Voicing {
  const quality = resolveQuality(mode, slot);
  const rootPc = slotRootPc(tonic.pc, mode, slot);
  const intervals = QUALITY_INTERVALS[quality];
  const bass = wrapMidi(36 + rootPc, 36, 51);
  let tones = intervals.map((iv) => 48 + rootPc + iv);
  const top = tones[tones.length - 1] ?? 60;
  if (top > 79) tones = tones.map((n) => n - 12);
  if ((tones[0] ?? 48) < 48) tones = tones.map((n) => n + 12);
  const voiced = [...tones];
  for (let i = 0; i < slot.inversion; i += 1) {
    const lowest = voiced.shift();
    if (lowest === undefined) break;
    voiced.push(lowest + 12);
  }
  const unique = Array.from(new Set([bass, ...voiced])).sort((a, b) => a - b);
  return { bass, tones: voiced, all: unique };
}

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function midiPc(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

export type PaletteItem = {
  degree: Degree;
  accidental: Accidental;
  quality: Quality;
  roman: string;
  name: string;
};

export function diatonicPalette(tonic: KeyInfo, mode: ModeId): PaletteItem[] {
  return ([1, 2, 3, 4, 5, 6, 7] as Degree[]).map((degree) => {
    const slot: Slot = {
      id: "p",
      degree,
      accidental: 0,
      quality: "auto",
      inversion: 0,
      beats: 4,
    };
    return {
      degree,
      accidental: 0 as Accidental,
      quality: "auto" as Quality,
      roman: romanNumeral(mode, slot),
      name: chordName(tonic, mode, slot),
    };
  });
}

export const BORROWED: Array<{
  degree: Degree;
  accidental: Accidental;
  quality: Quality;
  tag: string;
}> = [
  { degree: 7, accidental: -1, quality: "maj", tag: "♭VII" },
  { degree: 6, accidental: -1, quality: "maj", tag: "♭VI" },
  { degree: 3, accidental: -1, quality: "maj", tag: "♭III" },
  { degree: 2, accidental: -1, quality: "maj", tag: "♭II" },
  { degree: 2, accidental: 0, quality: "maj", tag: "II" },
  { degree: 4, accidental: 0, quality: "min", tag: "iv" },
];

export function borrowedPalette(tonic: KeyInfo, mode: ModeId): PaletteItem[] {
  return BORROWED.map((b) => {
    const slot: Slot = {
      id: "b",
      degree: b.degree,
      accidental: b.accidental,
      quality: b.quality,
      inversion: 0,
      beats: 4,
    };
    return {
      degree: b.degree,
      accidental: b.accidental,
      quality: b.quality,
      roman: b.tag,
      name: chordName(tonic, mode, slot),
    };
  });
}

export function totalBeats(slots: Slot[]): number {
  return slots.reduce((sum, s) => sum + s.beats, 0);
}

export function slotStarts(slots: Slot[]): number[] {
  const starts: number[] = [];
  let beat = 0;
  for (const slot of slots) {
    starts.push(beat);
    beat += slot.beats;
  }
  return starts;
}

export function makeSlot(
  partial: Partial<Slot> & Pick<Slot, "degree">,
): Slot {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2, 10),
    degree: partial.degree,
    accidental: partial.accidental ?? 0,
    quality: partial.quality ?? "auto",
    inversion: partial.inversion ?? 0,
    beats: partial.beats ?? 4,
  };
}

export const DEFAULT_SLOTS: Slot[] = [
  { id: "s1", degree: 1, accidental: 0, quality: "auto", inversion: 0, beats: 4 },
  { id: "s2", degree: 5, accidental: 0, quality: "auto", inversion: 0, beats: 4 },
  { id: "s3", degree: 6, accidental: 0, quality: "auto", inversion: 0, beats: 4 },
  { id: "s4", degree: 4, accidental: 0, quality: "auto", inversion: 0, beats: 4 },
];
