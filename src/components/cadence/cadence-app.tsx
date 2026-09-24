import { useEffect } from "react";
import { Toaster } from "sonner";
import { ChordStage } from "@/components/cadence/chord-stage";
import { PianoStrip } from "@/components/cadence/piano-strip";
import { StudioSidebar } from "@/components/cadence/studio-sidebar";
import { Transport } from "@/components/cadence/transport";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCadence } from "@/lib/music/store";
import { KEY_BY_ID, KEYS, MODE_LIST, type Degree } from "@/lib/music/theory";
import { cn } from "@/lib/utils";

export function CadenceApp() {
  const tonicId = useCadence((s) => s.tonicId);
  const mode = useCadence((s) => s.mode);
  const showNumerals = useCadence((s) => s.showNumerals);
  const toggleNumerals = useCadence((s) => s.toggleNumerals);
  const playing = useCadence((s) => s.playing);

  const tonic = KEY_BY_ID[tonicId] ?? KEYS[0]!;
  const modeLabel = MODE_LIST.find((item) => item.id === mode)?.label ?? mode;

  useEffect(() => {
    void (async () => {
      await useCadence.persist.rehydrate();
      useCadence.getState().markHydrated();
    })();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const s = useCadence.getState();
      if (event.code === "Space") {
        event.preventDefault();
        s.togglePlay();
        return;
      }
      if (event.key >= "1" && event.key <= "7") {
        s.addChord({ degree: Number(event.key) as Degree });
        return;
      }
      if ((event.key === "Backspace" || event.key === "Delete") && s.selectedId) {
        event.preventDefault();
        s.removeSlot(s.selectedId);
        return;
      }
      if (event.key === "Escape") s.select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex min-h-dvh flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-4 pt-6 pb-4 md:px-6">
          <div>
            <p className="text-kicker font-medium tracking-mark text-accent uppercase">Play the changes</p>
            <h1 className="font-display mt-1 text-4xl leading-none font-medium tracking-tight italic md:text-5xl">
              Cadence
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="font-display text-2xl leading-none font-medium tracking-tight italic md:text-3xl">
                {tonic.label}
              </p>
              <p className="mt-1 text-sm text-muted">{modeLabel}</p>
            </div>
            <div className="flex rounded-full bg-surface p-1 hairline" role="group" aria-label="Chord labels">
              <button
                type="button"
                aria-pressed={showNumerals}
                onClick={() => {
                  if (!showNumerals) toggleNumerals();
                }}
                className={cn(
                  "press-scale h-8 rounded-full px-3 text-xs",
                  showNumerals ? "bg-elevated text-fg" : "text-subtle hover:text-muted",
                )}
              >
                Numerals
              </button>
              <button
                type="button"
                aria-pressed={!showNumerals}
                onClick={() => {
                  if (showNumerals) toggleNumerals();
                }}
                className={cn(
                  "press-scale h-8 rounded-full px-3 text-xs",
                  !showNumerals ? "bg-elevated text-fg" : "text-subtle hover:text-muted",
                )}
              >
                Names
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-start gap-8 px-4 pb-8 md:grid-cols-12 md:px-6 md:pb-10">
          <section className="flex min-w-0 flex-col gap-4 md:col-span-7 lg:col-span-8">
            <ChordStage />
            <PianoStrip />
            <p className="text-xs text-subtle">
              {playing ? "Looping the chart." : "Space plays."} Keys 1–7 add degrees.
            </p>
          </section>
          <div className="min-w-0 md:col-span-5 lg:col-span-4">
            <div className="studio-rail">
              <StudioSidebar />
            </div>
          </div>
        </main>

        <div className="sticky bottom-0 z-20 pb-[env(safe-area-inset-bottom)]">
          <Transport />
        </div>
        <Toaster theme="dark" position="bottom-center" />
      </div>
    </TooltipProvider>
  );
}
