import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CHORD_MIN_MARGIN,
  bassPitchClass,
  chordReadout,
  dbToChroma,
  detectChord,
  detectKey,
  isQuiet,
  smoothChroma,
} from "./listen-dsp.ts";

const SAMPLE_RATE = 48000;
const FFT_SIZE = 4096;

/** Build a fake dB spectrum (as from getFloatFrequencyData) for MIDI notes. */
function synthSpectrum(midis: number[], floorDb = -100): Float32Array {
  const db = new Float32Array(FFT_SIZE / 2).fill(floorDb);
  const binHz = SAMPLE_RATE / FFT_SIZE;
  const put = (freq: number, levelDb: number) => {
    const bin = Math.round(freq / binHz);
    if (bin > 0 && bin < db.length && levelDb > (db[bin] ?? floorDb)) {
      db[bin] = levelDb;
    }
  };
  for (const midi of midis) {
    const f0 = 440 * 2 ** ((midi - 69) / 12);
    put(f0, -20); // fundamental
    put(f0 * 2, -32); // harmonics, quieter
    put(f0 * 3, -40);
  }
  return db;
}

function chromaOf(midis: number[]): number[] {
  return dbToChroma(synthSpectrum(midis), SAMPLE_RATE, FFT_SIZE);
}

describe("dbToChroma", () => {
  it("maps an A major triad onto pitch classes A/C#/E", () => {
    const c = chromaOf([69, 73, 76]); // A4 C#5 E5
    assert.ok((c[9] ?? 0) > 0.9, `A pc should dominate, got ${c[9]}`);
    assert.ok((c[1] ?? 0) > 0.5, `C# pc should be strong, got ${c[1]}`);
    assert.ok((c[4] ?? 0) > 0.5, `E pc should be strong, got ${c[4]}`);
    assert.ok((c[0] ?? 0) < 0.3, `C pc should be weak, got ${c[0]}`);
  });

  it("returns all zeros for a silent spectrum", () => {
    const db = new Float32Array(FFT_SIZE / 2).fill(-100);
    const c = dbToChroma(db, SAMPLE_RATE, FFT_SIZE);
    assert.deepEqual(c, new Array(12).fill(0));
  });
});

describe("detectKey", () => {
  it("finds C major from a C major scale run", () => {
    const c = chromaOf([60, 62, 64, 65, 67, 69, 71, 72]);
    const k = detectKey(c);
    assert.equal(k.tonicPc, 0);
    assert.equal(k.mode, "major");
    assert.ok(k.confidence > 0.5, `confidence ${k.confidence}`);
  });

  it("finds A minor from an A natural-minor run", () => {
    // The run sits an octave up from the original A3 version on purpose:
    // at FFT 4096 the point-mass B3/C4 fundamentals of the low run land in
    // adjacent bins, a shape no real AnalyserNode frame can take (a real
    // partial is a multi-bin lobe; two adjacent single-bin spikes are
    // indistinguishable from one partial between the bins). The peak-based
    // front end reads them as one event, so the low run's spectrum no
    // longer models anything physical. Same notes, same assertion.
    const c = chromaOf([69, 71, 72, 74, 76, 77, 79, 81]);
    const k = detectKey(c);
    assert.equal(k.tonicPc, 9);
    assert.equal(k.mode, "minor");
  });

  it("finds E flat major (pitch class 3)", () => {
    // Eb F G Ab Bb C D
    const c = chromaOf([63, 65, 67, 68, 70, 72, 74]);
    const k = detectKey(c);
    assert.equal(k.tonicPc, 3);
    assert.equal(k.mode, "major");
  });
});

describe("detectChord", () => {
  it("names a G major triad", () => {
    const chord = detectChord(chromaOf([55, 59, 62])); // G3 B3 D4
    assert.ok(chord, "should detect a chord");
    assert.equal(chord?.rootPc, 7);
    assert.equal(chord?.quality, "maj");
  });

  it("names an F# minor triad", () => {
    const chord = detectChord(chromaOf([54, 57, 61])); // F#3 A3 C#4
    assert.ok(chord, "should detect a chord");
    assert.equal(chord?.rootPc, 6);
    assert.equal(chord?.quality, "min");
  });

  it("returns null for silence", () => {
    const db = new Float32Array(FFT_SIZE / 2).fill(-100);
    assert.equal(detectChord(dbToChroma(db, SAMPLE_RATE, FFT_SIZE)), null);
  });
});

describe("chordReadout", () => {
  it("shows an augmented chord whose key confidence never clears the old key gate", () => {
    // A pure augmented chroma is symmetric, so no key profile fits it —
    // under the old wiring (chord shown only when key confidence > 0.25)
    // this readout was blank even though the chord match is decisive.
    const chroma = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    const key = detectKey(chroma);
    assert.ok(key.confidence <= 0.25, `key confidence ${key.confidence}`);
    const readout = chordReadout(detectChord(chroma));
    assert.equal(readout?.rootPc, 0);
    assert.equal(readout?.quality, "aug");
  });

  it("shows an augmented triad read from a spectrum", () => {
    const readout = chordReadout(detectChord(chromaOf([48, 52, 56]))); // C3 E3 G#3
    assert.equal(readout?.rootPc, 0);
    assert.equal(readout?.quality, "aug");
  });

  it("passes an ordinary triad through", () => {
    const readout = chordReadout(detectChord(chromaOf([55, 59, 62]))); // G3 B3 D4
    assert.equal(readout?.rootPc, 7);
    assert.equal(readout?.quality, "maj");
  });

  it("shows nothing for broadband noise that fools the score floor", () => {
    // A deterministic jagged spectrum: peaks everywhere above the quiet
    // floor, so detectChord's score alone returns a spurious chord — but
    // no sonority wins decisively, the margin collapses, and the readout
    // stays blank. Decoupling from the key gate must not mean hallucinating.
    const db = new Float32Array(FFT_SIZE / 2).fill(-100);
    for (let i = 2; i < db.length; i += 1) db[i] = -74 + ((i * 7919) % 23);
    const chord = detectChord(dbToChroma(db, SAMPLE_RATE, FFT_SIZE));
    assert.ok(chord, "the score floor alone would hallucinate a chord here");
    assert.ok((chord?.margin ?? 1) < CHORD_MIN_MARGIN, `margin ${chord?.margin}`);
    assert.equal(chordReadout(chord), null);
  });

  it("shows nothing for an inharmonic partial cluster", () => {
    const db = new Float32Array(FFT_SIZE / 2).fill(-100);
    const binHz = SAMPLE_RATE / FFT_SIZE;
    let s = 1234567;
    const rnd = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    for (let n = 0; n < 40; n += 1) {
      const bin = Math.round((60 + rnd() * 1800) / binHz);
      db[bin] = -48 - rnd() * 18;
    }
    const chord = detectChord(dbToChroma(db, SAMPLE_RATE, FFT_SIZE));
    assert.equal(chordReadout(chord), null);
  });

  it("shows nothing for a flat, empty spectrum", () => {
    const db = new Float32Array(FFT_SIZE / 2).fill(-70);
    assert.equal(chordReadout(detectChord(dbToChroma(db, SAMPLE_RATE, FFT_SIZE))), null);
  });
});

describe("bassPitchClass", () => {
  it("names the lowest note of a chord", () => {
    assert.equal(bassPitchClass(synthSpectrum([53, 57, 61]), SAMPLE_RATE, FFT_SIZE), 5); // F3 lowest
    assert.equal(bassPitchClass(synthSpectrum([55, 60, 62]), SAMPLE_RATE, FFT_SIZE), 7); // G3 lowest
    assert.equal(bassPitchClass(synthSpectrum([69]), SAMPLE_RATE, FFT_SIZE), 9); // A4 alone
  });

  it("returns null for silence", () => {
    const db = new Float32Array(FFT_SIZE / 2).fill(-100);
    assert.equal(bassPitchClass(db, SAMPLE_RATE, FFT_SIZE), null);
  });
});

describe("detectChord bass tie-break", () => {
  // A sus2 and the sus4 a fifth above it spell the same pitch-class set,
  // so their template scores tie exactly and iteration order alone used
  // to pick the spelling — wrong whenever the tied partner's root was
  // numerically smaller. The bass note is the only evidence that splits
  // them, and it must only ever split a genuine tie.
  it("reads F sus2 as sus2 when F is in the bass", () => {
    const chroma = chromaOf([53, 55, 60]); // F3 G3 C4
    assert.equal(detectChord(chroma)?.quality, "sus4"); // the tie, unbroken
    const chord = detectChord(chroma, { bassPc: 5 });
    assert.equal(chord?.rootPc, 5);
    assert.equal(chord?.quality, "sus2");
  });

  it("reads G sus4 as sus4 when G is in the bass", () => {
    const chroma = chromaOf([55, 60, 62]); // G3 C4 D4
    assert.equal(detectChord(chroma)?.quality, "sus2"); // the tie, unbroken
    const chord = detectChord(chroma, { bassPc: 7 });
    assert.equal(chord?.rootPc, 7);
    assert.equal(chord?.quality, "sus4");
  });

  it("reads A sus2 as sus2 when A is in the bass", () => {
    const chroma = chromaOf([57, 59, 64]); // A3 B3 E4
    const chord = detectChord(chroma, { bassPc: 9 });
    assert.equal(chord?.rootPc, 9);
    assert.equal(chord?.quality, "sus2");
  });

  it("spells an augmented triad from its bass note", () => {
    const chroma = chromaOf([53, 57, 61]); // F3 A3 C#4: rotations tie too
    assert.equal(detectChord(chroma)?.rootPc, 1);
    const chord = detectChord(chroma, { bassPc: 5 });
    assert.equal(chord?.rootPc, 5);
    assert.equal(chord?.quality, "aug");
  });

  it("never lets the bass override a real score gap", () => {
    const chord = detectChord(chromaOf([55, 59, 62]), { bassPc: 0 }); // G major, wrong bass
    assert.equal(chord?.rootPc, 7);
    assert.equal(chord?.quality, "maj");
  });

  it("ignores a bass that matches no tied root", () => {
    const chord = detectChord(chromaOf([53, 55, 60]), { bassPc: 2 });
    assert.equal(chord?.rootPc, 0);
    assert.equal(chord?.quality, "sus4");
  });

  it("end to end: spectrum bass spells the readout", () => {
    const db = synthSpectrum([53, 55, 60]); // F sus2, root position
    const readout = chordReadout(
      detectChord(dbToChroma(db, SAMPLE_RATE, FFT_SIZE), {
        bassPc: bassPitchClass(db, SAMPLE_RATE, FFT_SIZE),
      }),
    );
    assert.equal(readout?.rootPc, 5);
    assert.equal(readout?.quality, "sus2");
  });
});

describe("helpers", () => {
  it("isQuiet flags an empty spectrum", () => {
    const db = new Float32Array(FFT_SIZE / 2).fill(-100);
    assert.equal(isQuiet(db), true);
    assert.equal(isQuiet(synthSpectrum([60])), false);
  });

  it("smoothChroma blends toward the new frame", () => {
    const prev = new Array(12).fill(0);
    const next = new Array(12).fill(0);
    next[0] = 1;
    const s = smoothChroma(prev, next, 0.5);
    assert.equal(s[0], 0.5);
    assert.equal(s[1], 0);
  });
});
