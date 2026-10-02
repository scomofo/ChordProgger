import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
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
    const c = chromaOf([57, 59, 60, 62, 64, 65, 67, 69]);
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
