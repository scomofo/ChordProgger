import { useCadence } from "@/lib/music/store";
import { KEY_BY_ID, KEYS, midiPc, voicingFor } from "@/lib/music/theory";
import { cn } from "@/lib/utils";

const START = 48;
const END = 72;
const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);

function isWhite(midi: number) {
  return WHITE_PCS.has(midiPc(midi));
}

const WHITE_MIDIS = Array.from({ length: END - START + 1 }, (_, i) => START + i).filter(isWhite);
const BLACK_MIDIS = Array.from({ length: END - START + 1 }, (_, i) => START + i).filter((m) => !isWhite(m));

export function PianoStrip() {
  const tonicId = useCadence((s) => s.tonicId);
  const mode = useCadence((s) => s.mode);
  const slots = useCadence((s) => s.slots);
  const selectedId = useCadence((s) => s.selectedId);
  const playing = useCadence((s) => s.playing);
  const slotIndex = useCadence((s) => s.playhead?.slotIndex ?? -1);

  const tonic = KEY_BY_ID[tonicId] ?? KEYS[0]!;
  const idx = playing && slotIndex >= 0 ? slotIndex : slots.findIndex((s) => s.id === selectedId);
  const slot = slots[idx] ?? slots[0];
  const tones = slot ? new Set(voicingFor(tonic, mode, slot).all) : new Set<number>();

  return (
    <div className="rounded-3xl bg-surface p-2 hairline">
      <div className="relative flex h-24 overflow-hidden rounded-2xl bg-bg">
        {WHITE_MIDIS.map((midi) => {
          const on = tones.has(midi) || tones.has(midi + 12) || tones.has(midi - 12);
          return (
            <div
              key={midi}
              className={cn(
                "relative h-full min-w-0 flex-1 border-r border-bg/70 last:border-r-0",
                on ? "key-white-on" : "key-white",
              )}
            />
          );
        })}
        {BLACK_MIDIS.map((midi) => {
          const whitesBefore = WHITE_MIDIS.filter((w) => w < midi).length;
          const whiteWidth = 100 / WHITE_MIDIS.length;
          const on = tones.has(midi) || tones.has(midi + 12) || tones.has(midi - 12);
          return (
            <div
              key={midi}
              className={cn(
                "absolute top-0 z-10 h-[58%] rounded-b-md",
                on ? "key-black-on" : "key-black",
              )}
              style={{
                left: `calc(${whitesBefore * whiteWidth}% - ${whiteWidth * 0.32}%)`,
                width: `${whiteWidth * 0.64}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
