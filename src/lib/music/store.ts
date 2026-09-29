import { create } from "zustand";
import { persist } from "zustand/middleware";
import { engine, type Playhead } from "./engine.ts";
import { PATTERNS, type PatternId, type VoiceId } from "./patterns.ts";
import { PRESETS, slotsFromRecipe } from "./progressions.ts";
import {
  DEFAULT_SLOTS,
  KEY_BY_ID,
  KEYS,
  makeSlot,
  type Beats,
  type Degree,
  type Inversion,
  type ModeId,
  type Quality,
  type Slot,
} from "./theory.ts";

export type SavedChart = {
  id: string;
  name: string;
  tonic: string;
  mode: ModeId;
  slots: Slot[];
  patternId: PatternId;
  voice: VoiceId;
  tempo: number;
  savedAt: number;
};

type CadenceState = {
  tonicId: string;
  mode: ModeId;
  slots: Slot[];
  selectedId: string | null;
  patternId: PatternId;
  voice: VoiceId;
  tempo: number;
  volume: number;
  muted: boolean;
  loop: boolean;
  metronome: boolean;
  showNumerals: boolean;
  playing: boolean;
  playhead: Playhead | null;
  saved: SavedChart[];
  saveName: string;
  hydrated: boolean;
  setTonic: (id: string) => void;
  setMode: (mode: ModeId) => void;
  setPattern: (id: PatternId) => void;
  setVoice: (voice: VoiceId) => void;
  setTempo: (tempo: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleMetronome: () => void;
  toggleNumerals: () => void;
  select: (id: string | null) => void;
  addChord: (partial: Partial<Slot> & Pick<Slot, "degree">) => void;
  updateSlot: (id: string, patch: Partial<Slot>) => void;
  removeSlot: (id: string) => void;
  duplicateSlot: (id: string) => void;
  moveSlot: (id: string, dir: -1 | 1) => void;
  clearSlots: () => void;
  loadPreset: (id: string) => void;
  setSaveName: (name: string) => void;
  saveChart: () => void;
  loadChart: (id: string) => void;
  deleteChart: (id: string) => void;
  play: () => void;
  stop: () => void;
  togglePlay: () => void;
  markHydrated: () => void;
};

function snapshot(s: CadenceState) {
  return {
    tonic: KEY_BY_ID[s.tonicId] ?? KEYS[0]!,
    mode: s.mode,
    slots: s.slots,
    patternId: s.patternId,
    voice: s.voice,
    tempo: s.tempo,
    volume: s.volume,
    muted: s.muted,
    loop: s.loop,
    metronome: s.metronome,
  };
}

function bindEngine() {
  engine.start(() => snapshot(useCadence.getState()), {
    onPlayhead: (playhead) => useCadence.setState({ playhead }),
    onStop: () => useCadence.setState({ playing: false, playhead: null }),
  });
}

export const useCadence = create<CadenceState>()(
  persist(
    (set, get) => ({
      tonicId: "C",
      mode: "major",
      slots: DEFAULT_SLOTS,
      selectedId: "s1",
      patternId: "folk",
      voice: "piano",
      tempo: 100,
      volume: 0.78,
      muted: false,
      loop: true,
      metronome: false,
      showNumerals: true,
      playing: false,
      playhead: null,
      saved: [],
      saveName: "Pop axis",
      hydrated: false,
      setTonic: (tonicId) => set({ tonicId }),
      setMode: (mode) => set({ mode }),
      setPattern: (patternId) => {
        const meter = PATTERNS.find((p) => p.id === patternId)?.meter ?? 4;
        set((s) => ({
          patternId,
          slots:
            meter === 3
              ? s.slots.map((slot) => ({ ...slot, beats: 3 as Beats }))
              : s.slots.map((slot) => (slot.beats === 3 ? { ...slot, beats: 4 as Beats } : slot)),
        }));
      },
      setVoice: (voice) => set({ voice }),
      setTempo: (tempo) => set({ tempo: Math.max(48, Math.min(180, Math.round(tempo))) }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      toggleLoop: () => set((s) => ({ loop: !s.loop })),
      toggleMetronome: () => set((s) => ({ metronome: !s.metronome })),
      toggleNumerals: () => set((s) => ({ showNumerals: !s.showNumerals })),
      select: (selectedId) => set({ selectedId }),
      addChord: (partial) => {
        const slot = makeSlot({
          ...partial,
          beats: partial.beats ?? (get().patternId === "waltz" ? 3 : 4),
        });
        set((s) => {
          const idx = s.slots.findIndex((x) => x.id === s.selectedId);
          const slots = [...s.slots];
          slots.splice(idx >= 0 ? idx + 1 : slots.length, 0, slot);
          return { slots, selectedId: slot.id };
        });
      },
      updateSlot: (id, patch) =>
        set((s) => ({
          slots: s.slots.map((slot) => (slot.id === id ? { ...slot, ...patch, id: slot.id } : slot)),
        })),
      removeSlot: (id) =>
        set((s) => {
          const slots = s.slots.filter((slot) => slot.id !== id);
          const selectedId = s.selectedId === id ? (slots[slots.length - 1]?.id ?? null) : s.selectedId;
          return { slots, selectedId };
        }),
      duplicateSlot: (id) =>
        set((s) => {
          const idx = s.slots.findIndex((slot) => slot.id === id);
          const src = s.slots[idx];
          if (!src) return s;
          const copy = makeSlot({
            degree: src.degree,
            accidental: src.accidental,
            quality: src.quality,
            inversion: src.inversion,
            beats: src.beats,
          });
          const slots = [...s.slots];
          slots.splice(idx + 1, 0, copy);
          return { slots, selectedId: copy.id };
        }),
      moveSlot: (id, dir) =>
        set((s) => {
          const idx = s.slots.findIndex((slot) => slot.id === id);
          const next = idx + dir;
          if (idx < 0 || next < 0 || next >= s.slots.length) return s;
          const slots = [...s.slots];
          const [item] = slots.splice(idx, 1);
          if (!item) return s;
          slots.splice(next, 0, item);
          return { slots };
        }),
      clearSlots: () => {
        get().stop();
        set({ slots: [], selectedId: null });
      },
      loadPreset: (id) => {
        const preset = PRESETS.find((p) => p.id === id);
        if (!preset) return;
        get().stop();
        const slots = slotsFromRecipe(preset.recipe);
        if (get().patternId === "waltz") {
          slots.forEach((slot) => {
            slot.beats = 3;
          });
        }
        set({
          slots,
          selectedId: slots[0]?.id ?? null,
          saveName: preset.name,
          // Minor-hint presets carry their own mode; the rest leave the
          // current mode untouched.
          mode: preset.mode ?? get().mode,
        });
      },
      setSaveName: (saveName) => set({ saveName }),
      saveChart: () => {
        const s = get();
        const name = s.saveName.trim() || "Untitled";
        const chart: SavedChart = {
          id: Math.random().toString(36).slice(2, 10),
          name,
          tonic: s.tonicId,
          mode: s.mode,
          slots: s.slots.map((slot) => ({ ...slot })),
          patternId: s.patternId,
          voice: s.voice,
          tempo: s.tempo,
          savedAt: Date.now(),
        };
        set({ saved: [chart, ...s.saved].slice(0, 24) });
      },
      loadChart: (id) => {
        const chart = get().saved.find((c) => c.id === id);
        if (!chart) return;
        get().stop();
        set({
          tonicId: chart.tonic,
          mode: chart.mode,
          slots: chart.slots.map((slot) => ({ ...slot })),
          patternId: chart.patternId,
          voice: chart.voice,
          tempo: chart.tempo,
          selectedId: chart.slots[0]?.id ?? null,
          saveName: chart.name,
        });
      },
      deleteChart: (id) => set((s) => ({ saved: s.saved.filter((c) => c.id !== id) })),
      play: () => {
        const s = get();
        if (!s.slots.length) return;
        set({ playing: true });
        bindEngine();
      },
      stop: () => {
        engine.stop();
        set({ playing: false, playhead: null });
      },
      togglePlay: () => {
        const s = get();
        if (s.playing) s.stop();
        else s.play();
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "cadence-v1",
      skipHydration: true,
      partialize: (s) => ({
        tonicId: s.tonicId,
        mode: s.mode,
        slots: s.slots,
        patternId: s.patternId,
        voice: s.voice,
        tempo: s.tempo,
        volume: s.volume,
        muted: s.muted,
        loop: s.loop,
        metronome: s.metronome,
        showNumerals: s.showNumerals,
        saved: s.saved,
        saveName: s.saveName,
        selectedId: s.selectedId,
      }),
    },
  ),
);

export function currentKey() {
  const id = useCadence.getState().tonicId;
  return KEY_BY_ID[id] ?? KEYS[0]!;
}

export type { Degree, Inversion, Quality };
