import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { PRESETS } from "./progressions.ts";
import { resolveQuality } from "./theory.ts";

// The store module evaluates zustand's persist middleware at import time,
// which reads `window.localStorage`. Stub it first, then import the store
// dynamically.
(globalThis as { window?: unknown }).window = {
  localStorage: (() => {
    const data = new Map<string, string>();
    return {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
    };
  })(),
};

const { useCadence } = await import("./store.ts");

function preset(id: string) {
  const found = PRESETS.find((p) => p.id === id);
  assert.ok(found, `preset "${id}" exists`);
  return found;
}

describe("preset mode metadata", () => {
  it("minor-hint presets declare mode minor", () => {
    for (const id of ["andalusian", "lament", "pop-minor"]) {
      assert.equal(preset(id).mode, "minor");
    }
  });

  it("presets without a minor hint don't force a mode", () => {
    for (const id of ["pop", "canon", "jazz-251", "blues"]) {
      assert.equal(preset(id).mode, undefined);
    }
  });
});

describe("loadPreset", () => {
  beforeEach(() => {
    useCadence.setState({ mode: "major" });
  });

  it("switches to minor for Lament", () => {
    useCadence.getState().loadPreset("lament");
    const s = useCadence.getState();
    assert.equal(s.mode, "minor");
    assert.equal(s.saveName, "Lament");
    assert.equal(s.slots.length, 4);
  });

  it("renders minor qualities for Lament (i-VII-VI-V), not major", () => {
    useCadence.getState().loadPreset("lament");
    const s = useCadence.getState();
    const [one, seven, six, five] = s.slots;
    assert.equal(resolveQuality(s.mode, one!), "min");
    assert.equal(resolveQuality(s.mode, seven!), "maj");
    assert.equal(resolveQuality(s.mode, six!), "maj");
    // V is explicitly major in the recipe (harmonic-minor color).
    assert.equal(five!.quality, "maj");
  });

  it("switches to minor for Pop minor (i-VI-III-VII)", () => {
    useCadence.getState().loadPreset("pop-minor");
    const s = useCadence.getState();
    assert.equal(s.mode, "minor");
    assert.equal(resolveQuality(s.mode, s.slots[0]!), "min");
  });

  it("switches to minor for Andalusian (i-bVII-bVI-V)", () => {
    useCadence.getState().loadPreset("andalusian");
    const s = useCadence.getState();
    assert.equal(s.mode, "minor");
    assert.equal(resolveQuality(s.mode, s.slots[0]!), "min");
  });

  it("leaves the current mode alone for presets without mode metadata", () => {
    useCadence.setState({ mode: "dorian" });
    useCadence.getState().loadPreset("pop");
    assert.equal(useCadence.getState().mode, "dorian");
  });

  it("ignores unknown preset ids", () => {
    const before = useCadence.getState();
    useCadence.getState().loadPreset("nope");
    const after = useCadence.getState();
    assert.equal(after.mode, before.mode);
    assert.equal(after.slots, before.slots);
  });
});
