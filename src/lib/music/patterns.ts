export type PatternId =
  | "block"
  | "sustain"
  | "down"
  | "downup"
  | "folk"
  | "waltz"
  | "bass-chord"
  | "arp-up"
  | "arp-down"
  | "arp-ud"
  | "alberti"
  | "roll";

export type VoiceId = "piano" | "nylon" | "pad";

export type PatternEvent = {
  beat: number;
  duration: number;
  midis: number[];
  stagger: number;
  velocity: number;
};

export type PatternMeta = {
  id: PatternId;
  label: string;
  hint: string;
  kind: "strum" | "arp" | "block";
  meter: 3 | 4;
};

export const PATTERNS: PatternMeta[] = [
  { id: "block", label: "Block", hint: "All notes together", kind: "block", meter: 4 },
  { id: "sustain", label: "Pad hold", hint: "Long overlapping voicing", kind: "block", meter: 4 },
  { id: "down", label: "Downstrum", hint: "Rolled attacks on the beat", kind: "strum", meter: 4 },
  { id: "downup", label: "Down-up", hint: "Quarter down, up, down, up", kind: "strum", meter: 4 },
  { id: "folk", label: "Folk", hint: "Bass–strum–bass–strum", kind: "strum", meter: 4 },
  { id: "bass-chord", label: "Bass & chord", hint: "Root on 1 & 3, stab on 2 & 4", kind: "strum", meter: 4 },
  { id: "waltz", label: "Waltz", hint: "Oom-pah-pah in 3", kind: "strum", meter: 3 },
  { id: "arp-up", label: "Arp up", hint: "Rising eighths", kind: "arp", meter: 4 },
  { id: "arp-down", label: "Arp down", hint: "Falling eighths", kind: "arp", meter: 4 },
  { id: "arp-ud", label: "Arp wave", hint: "Up then down", kind: "arp", meter: 4 },
  { id: "alberti", label: "Alberti", hint: "Low–high–mid–high", kind: "arp", meter: 4 },
  { id: "roll", label: "Finger roll", hint: "Sixteenth cascade, then hold", kind: "arp", meter: 4 },
];

export const PATTERN_BY_ID: Record<PatternId, PatternMeta> = Object.fromEntries(
  PATTERNS.map((p) => [p.id, p]),
) as Record<PatternId, PatternMeta>;

export const VOICES: { id: VoiceId; label: string; hint: string }[] = [
  { id: "piano", label: "Piano", hint: "Felt upright" },
  { id: "nylon", label: "Nylon", hint: "Plucked guitar" },
  { id: "pad", label: "Pad", hint: "Warm keys" },
];

function uniq(midis: number[]): number[] {
  return Array.from(new Set(midis)).sort((a, b) => a - b);
}

export function compilePattern(
  patternId: PatternId,
  beats: number,
  bass: number,
  tones: number[],
): PatternEvent[] {
  const chord = uniq([bass, ...tones]);
  const treble = tones.length ? tones : chord.slice(-3);
  const fifth = treble[2] ?? treble[treble.length - 1] ?? bass + 7;
  const hold = Math.max(0.18, beats * 0.92);

  switch (patternId) {
    case "block":
      return [{ beat: 0, duration: hold, midis: chord, stagger: 0, velocity: 0.86 }];
    case "sustain":
      return [{ beat: 0, duration: Math.max(beats, 0.5), midis: chord, stagger: 0.006, velocity: 0.7 }];
    case "down": {
      const events: PatternEvent[] = [
        { beat: 0, duration: Math.min(1.85, hold), midis: chord, stagger: 0.016, velocity: 0.88 },
      ];
      if (beats >= 4) {
        events.push({
          beat: 2,
          duration: 1.7,
          midis: chord,
          stagger: 0.014,
          velocity: 0.72,
        });
      }
      return events;
    }
    case "downup": {
      const events: PatternEvent[] = [];
      for (let b = 0; b < beats; b += 1) {
        const up = b % 2 === 1;
        events.push({
          beat: b,
          duration: 0.92,
          midis: up ? treble : chord,
          stagger: up ? -0.012 : 0.014,
          velocity: up ? 0.62 : 0.84,
        });
      }
      return events;
    }
    case "folk": {
      const events: PatternEvent[] = [];
      for (let b = 0; b < beats; b += 1) {
        if (b % 2 === 0) {
          events.push({
            beat: b,
            duration: 0.95,
            midis: [b % 4 === 2 ? fifth - 12 < 36 ? bass : wrapBass(fifth) : bass],
            stagger: 0,
            velocity: 0.9,
          });
        } else {
          events.push({
            beat: b,
            duration: 0.9,
            midis: treble,
            stagger: 0.01,
            velocity: 0.7,
          });
        }
      }
      return events;
    }
    case "bass-chord": {
      const events: PatternEvent[] = [];
      for (let b = 0; b < beats; b += 1) {
        if (b % 2 === 0) {
          events.push({ beat: b, duration: 0.95, midis: [bass], stagger: 0, velocity: 0.92 });
        } else {
          events.push({ beat: b, duration: 0.7, midis: treble, stagger: 0.008, velocity: 0.68 });
        }
      }
      return events;
    }
    case "waltz": {
      const span = beats < 3 ? beats : 3;
      const events: PatternEvent[] = [
        { beat: 0, duration: 0.95, midis: [bass], stagger: 0, velocity: 0.9 },
      ];
      if (span > 1) {
        events.push({ beat: 1, duration: 0.88, midis: treble, stagger: 0.01, velocity: 0.66 });
      }
      if (span > 2) {
        events.push({ beat: 2, duration: 0.88, midis: treble, stagger: 0.01, velocity: 0.6 });
      }
      if (beats > 3) {
        events.push({ beat: 3, duration: 0.8, midis: [bass], stagger: 0, velocity: 0.7 });
      }
      return events;
    }
    case "arp-up":
      return arpEvents(beats, treble, 1);
    case "arp-down":
      return arpEvents(beats, [...treble].reverse(), 1);
    case "arp-ud": {
      const wave = [...treble, ...[...treble].reverse().slice(1, -1)];
      return arpEvents(beats, wave.length ? wave : treble, 1);
    }
    case "alberti": {
      const low = treble[0] ?? bass;
      const mid = treble[1] ?? low + 4;
      const high = treble[2] ?? treble[treble.length - 1] ?? mid + 3;
      const seq = [bass, high, mid, high];
      return arpEvents(beats, seq, 1);
    }
    case "roll": {
      const cascade = uniq([bass, ...treble]);
      const step = 0.25;
      const events: PatternEvent[] = cascade.map((midi, i) => ({
        beat: i * step,
        duration: Math.max(0.9, beats - i * step),
        midis: [midi],
        stagger: 0,
        velocity: 0.62 + i * 0.05,
      }));
      return events;
    }
  }
}

function wrapBass(midi: number): number {
  let n = midi;
  while (n > 52) n -= 12;
  while (n < 36) n += 12;
  return n;
}

function arpEvents(beats: number, seq: number[], subdiv: number): PatternEvent[] {
  const notes = seq.length ? seq : [60];
  const steps = Math.max(1, Math.round(beats * (subdiv === 1 ? 2 : 4)));
  const dur = beats / steps;
  const events: PatternEvent[] = [];
  for (let i = 0; i < steps; i += 1) {
    events.push({
      beat: i * dur,
      duration: dur * 0.92,
      midis: [notes[i % notes.length] ?? 60],
      stagger: 0,
      velocity: i % 4 === 0 ? 0.82 : 0.64,
    });
  }
  return events;
}
