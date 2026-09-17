import { useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCadence } from "@/lib/music/store";
import {
  BEAT_OPTIONS,
  KEY_BY_ID,
  KEYS,
  QUALITY_OPTIONS,
  borrowedPalette,
  chordName,
  diatonicPalette,
  pcName,
  romanNumeral,
  slotLabel,
  voicingFor,
  type Inversion,
  type Quality,
} from "@/lib/music/theory";
import { cn } from "@/lib/utils";

export function ChordStage() {
  const tonicId = useCadence((s) => s.tonicId);
  const mode = useCadence((s) => s.mode);
  const slots = useCadence((s) => s.slots);
  const selectedId = useCadence((s) => s.selectedId);
  const showNumerals = useCadence((s) => s.showNumerals);
  const playing = useCadence((s) => s.playing);
  const playhead = useCadence((s) => s.playhead);
  const select = useCadence((s) => s.select);
  const addChord = useCadence((s) => s.addChord);

  const tonic = KEY_BY_ID[tonicId] ?? KEYS[0]!;
  const activeIndex =
    playing && playhead ? playhead.slotIndex : slots.findIndex((s) => s.id === selectedId);
  const active = slots[activeIndex] ?? slots[0];
  const next = slots.length ? slots[(Math.max(0, activeIndex) + 1) % slots.length] : null;
  const voice = active ? voicingFor(tonic, mode, active) : null;
  const progress = playing && playhead && slots[playhead.slotIndex]?.id === active?.id ? playhead.progress : 0;

  const diatonic = diatonicPalette(tonic, mode);
  const borrowed = borrowedPalette(tonic, mode);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-surface p-2 hairline">
        <div className="relative overflow-hidden rounded-2xl bg-elevated px-5 py-8 text-center md:px-8 md:py-10">
          <p className="text-kicker font-medium tracking-kicker text-muted uppercase">
            {active ? romanNumeral(mode, active) : "Add a chord"}
          </p>
          <h2 className="font-display mt-2 text-hero leading-none font-medium tracking-tight italic">
            {active ? chordName(tonic, mode, active) : "—"}
          </h2>
          {voice && (
            <p className="mt-4 font-mono text-sm text-subtle">
              {Array.from(new Set(voice.all.map((m) => pcName(m, tonic.flats)))).join("  ·  ")}
            </p>
          )}
          {next && active && (
            <p className="mt-3 text-sm text-muted">
              Next {slotLabel(tonic, mode, next, showNumerals).primary}
            </p>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-bg">
            <div
              className="progress-fill h-full bg-accent"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium text-muted">Progression</h3>
          <p className="font-mono text-xs text-subtle">
            {slots.map((s) => romanNumeral(mode, s)).join(" – ") || "empty"}
          </p>
        </div>
        <div className="rounded-3xl bg-surface p-2 hairline">
          {slots.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Pick a preset or add a scale degree to start writing.
            </p>
          ) : (
            <SequenceStrip
              slots={slots}
              selectedId={selectedId}
              showNumerals={showNumerals}
              tonicId={tonicId}
              mode={mode}
              playing={playing}
              playIndex={playhead?.slotIndex ?? -1}
              progress={playhead?.progress ?? 0}
              onSelect={select}
            />
          )}
        </div>
      </div>

      <Inspector />

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted">Scale degrees</h3>
        <div className="flex flex-wrap gap-2">
          {diatonic.map((item) => (
            <Button
              key={item.degree}
              type="button"
              variant="subtle"
              size="chip"
              onClick={() => addChord({ degree: item.degree, accidental: 0, quality: "auto" })}
              className="min-w-14 flex-col gap-0 py-2 h-auto"
            >
              <span className="font-display text-base leading-none">{item.roman}</span>
              <span className="text-kicker text-subtle">{item.name}</span>
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Add tonic"
            onClick={() => addChord({ degree: 1 })}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <h3 className="mt-4 mb-2 text-sm font-medium text-muted">Borrowed</h3>
        <div className="flex flex-wrap gap-2">
          {borrowed.map((item) => (
            <Button
              key={`${item.roman}-${item.name}`}
              type="button"
              variant="ghost"
              size="chip"
              onClick={() =>
                addChord({
                  degree: item.degree,
                  accidental: item.accidental,
                  quality: item.quality,
                })
              }
              className="h-auto min-w-14 flex-col gap-0 py-2"
            >
              <span className="font-display text-sm leading-none">{item.roman}</span>
              <span className="text-kicker text-subtle">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SequenceStrip({
  slots,
  selectedId,
  showNumerals,
  tonicId,
  mode,
  playing,
  playIndex,
  progress,
  onSelect,
}: {
  slots: ReturnType<typeof useCadence.getState>["slots"];
  selectedId: string | null;
  showNumerals: boolean;
  tonicId: string;
  mode: ReturnType<typeof useCadence.getState>["mode"];
  playing: boolean;
  playIndex: number;
  progress: number;
  onSelect: (id: string) => void;
}) {
  const tonic = KEY_BY_ID[tonicId] ?? KEYS[0]!;
  const scroller = useRef<HTMLDivElement>(null);
  const activeId = playing && playIndex >= 0 ? slots[playIndex]?.id : selectedId;

  useEffect(() => {
    if (!activeId || !scroller.current) return;
    const el = scroller.current.querySelector(`[data-slot="${activeId}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div
      ref={scroller}
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {slots.map((slot, i) => {
        const labels = slotLabel(tonic, mode, slot, showNumerals);
        const isPlay = playing && i === playIndex;
        const isSel = slot.id === selectedId;
        return (
          <button
            key={slot.id}
            type="button"
            data-slot={slot.id}
            onClick={() => onSelect(slot.id)}
            className={cn(
              "press-scale relative min-w-20 shrink-0 overflow-hidden rounded-xl px-3 py-3 text-left",
              isPlay ? "bg-accent text-accent-fg" : isSel ? "bg-primary text-primary-fg" : "bg-elevated text-fg",
            )}
          >
            <span className="block text-kicker tracking-wide uppercase opacity-70">{labels.secondary}</span>
            <span className="font-display mt-1 block text-xl leading-none">{labels.primary}</span>
            <span className="mt-2 block font-mono text-kicker opacity-70">{slot.beats} beats</span>
            {isPlay && (
              <span
                className="progress-fill absolute inset-x-0 bottom-0 h-0.5 bg-accent-fg"
                style={{ transform: `scaleX(${progress})` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Inspector() {
  const selectedId = useCadence((s) => s.selectedId);
  const slots = useCadence((s) => s.slots);
  const updateSlot = useCadence((s) => s.updateSlot);
  const removeSlot = useCadence((s) => s.removeSlot);
  const duplicateSlot = useCadence((s) => s.duplicateSlot);
  const moveSlot = useCadence((s) => s.moveSlot);
  const slot = slots.find((s) => s.id === selectedId);

  if (!slot) {
    return (
      <p className="text-sm text-subtle">Select a chord to edit quality, inversion, and length.</p>
    );
  }

  return (
    <div className="rounded-3xl bg-surface p-3 hairline">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-muted">Edit chord</h3>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" aria-label="Move left" className="size-9" onClick={() => moveSlot(slot.id, -1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Move right" className="size-9" onClick={() => moveSlot(slot.id, 1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Duplicate" className="size-9" onClick={() => duplicateSlot(slot.id)}>
            <Copy className="size-4" />
          </Button>
          <Button type="button" variant="danger" size="icon" aria-label="Remove" className="size-9" onClick={() => removeSlot(slot.id)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUALITY_OPTIONS.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => updateSlot(slot.id, { quality: q.id as Quality })}
            className={cn(
              "press-scale h-8 rounded-full px-3 text-xs",
              slot.quality === q.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg",
            )}
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div>
          <p className="text-kicker mb-1.5 text-subtle uppercase tracking-wide">Beats</p>
          <div className="flex gap-1">
            {BEAT_OPTIONS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => updateSlot(slot.id, { beats: b })}
                className={cn(
                  "press-scale size-9 rounded-md font-mono text-sm",
                  slot.beats === b ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-kicker mb-1.5 text-subtle uppercase tracking-wide">Inversion</p>
          <div className="flex gap-1">
            {([0, 1, 2] as Inversion[]).map((inv) => (
              <button
                key={inv}
                type="button"
                onClick={() => updateSlot(slot.id, { inversion: inv })}
                className={cn(
                  "press-scale h-9 rounded-md px-3 text-sm",
                  slot.inversion === inv ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
                )}
              >
                {inv === 0 ? "Root" : inv === 1 ? "1st" : "2nd"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
