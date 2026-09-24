import { Minus, Pause, Play, Plus, Repeat, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useCadence } from "@/lib/music/store";

export function Transport() {
  const playing = useCadence((s) => s.playing);
  const tempo = useCadence((s) => s.tempo);
  const volume = useCadence((s) => s.volume);
  const muted = useCadence((s) => s.muted);
  const loop = useCadence((s) => s.loop);
  const metronome = useCadence((s) => s.metronome);
  const slots = useCadence((s) => s.slots);
  const togglePlay = useCadence((s) => s.togglePlay);
  const setTempo = useCadence((s) => s.setTempo);
  const setVolume = useCadence((s) => s.setVolume);
  const toggleMute = useCadence((s) => s.toggleMute);
  const toggleLoop = useCadence((s) => s.toggleLoop);
  const toggleMetronome = useCadence((s) => s.toggleMetronome);

  return (
    <div className="border-t border-border bg-bg/90 shadow-[0_-20px_40px_color-mix(in_oklab,var(--color-bg)_70%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6 md:px-6">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <Button
            type="button"
            variant={loop ? "accent" : "subtle"}
            size="icon"
            aria-pressed={loop}
            aria-label={loop ? "Loop on" : "Loop off"}
            onClick={toggleLoop}
          >
            <Repeat className="size-4" />
          </Button>
          <Button
            type="button"
            variant="default"
            size="play"
            aria-label={playing ? "Pause" : "Play"}
            disabled={slots.length === 0}
            onClick={togglePlay}
            className={playing ? "ring-2 ring-accent ring-offset-2 ring-offset-bg" : undefined}
          >
            {playing ? <Pause className="size-6" /> : <Play className="ml-0.5 size-6" />}
          </Button>
          <Button
            type="button"
            variant={metronome ? "accent" : "subtle"}
            size="chip"
            aria-pressed={metronome}
            onClick={toggleMetronome}
          >
            Click
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Slower"
            className="size-11 shrink-0"
            onClick={() => setTempo(tempo - 1)}
          >
            <Minus className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-kicker tracking-wide text-subtle uppercase">Tempo</span>
              <span className="font-display text-lg leading-none tabular-nums">
                {tempo}
                <span className="ml-1 font-sans text-kicker tracking-wide text-subtle uppercase">bpm</span>
              </span>
            </div>
            <Slider
              min={48}
              max={180}
              step={1}
              value={[tempo]}
              onValueChange={([v]) => setTempo(v ?? tempo)}
              aria-label="Tempo"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Faster"
            className="size-11 shrink-0"
            onClick={() => setTempo(tempo + 1)}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="flex min-w-36 items-center gap-2 md:w-48">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={muted ? "Unmute" : "Mute"}
            className="size-11 shrink-0"
            onClick={toggleMute}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[muted ? 0 : volume]}
            onValueChange={([v]) => {
              setVolume(v ?? volume);
              if (muted && (v ?? 0) > 0) toggleMute();
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
