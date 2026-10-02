import { Mic, MicOff, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useListen } from "@/lib/music/use-listen";
import { useCadence } from "@/lib/music/store";
import { KEYS, pcName, qualitySuffix, type Quality } from "@/lib/music/theory";
import { cn } from "@/lib/utils";

function keyIdForPc(pc: number): string {
  return KEYS.find((k) => k.pc === pc)?.id ?? "C";
}

export function ListenPanel() {
  const { snapshot, start, stop } = useListen();
  const setTonic = useCadence((s) => s.setTonic);
  const setMode = useCadence((s) => s.setMode);
  const toasted = useRef(false);

  useEffect(() => {
    if (snapshot.status === "denied" && !toasted.current) {
      toasted.current = true;
      toast.error("Microphone blocked", {
        description: "Allow mic access in the browser to detect keys live.",
      });
    }
    if (snapshot.status === "idle") toasted.current = false;
  }, [snapshot.status]);

  const listening = snapshot.status === "listening" || snapshot.status === "requesting";
  const key = snapshot.key;
  const keyLabel = key
    ? `${pcName(key.tonicPc, key.tonicPc === 1 || key.tonicPc === 3 || key.tonicPc === 8 || key.tonicPc === 10)} ${key.mode}`
    : null;
  const chordLabel =
    snapshot.chord && key
      ? pcName(
          snapshot.chord.rootPc,
          key.tonicPc === 1 || key.tonicPc === 3 || key.tonicPc === 8 || key.tonicPc === 10,
        ) + qualitySuffix(snapshot.chord.quality as Exclude<Quality, "auto">)
      : null;

  const useDetectedKey = () => {
    if (!key) return;
    setTonic(keyIdForPc(key.tonicPc));
    setMode(key.mode);
    toast.success(`Key set to ${keyLabel}`, { description: "Chart rebuilt in the detected key." });
  };

  if (!listening) {
    return (
      <button
        type="button"
        onClick={() => void start()}
        title="Detect the key of whatever you play, live"
        className="press-scale flex h-8 items-center gap-1.5 rounded-full bg-elevated px-3 text-xs text-muted hover:text-fg"
      >
        <Mic className="h-3.5 w-3.5" />
        Listen
      </button>
    );
  }

  return (
    <div className="w-56 rounded-2xl bg-elevated p-3 hairline">
      <div className="flex items-center justify-between">
        <p className="text-kicker tracking-mark text-accent uppercase">
          {snapshot.status === "requesting" ? "Opening mic…" : "Listening"}
        </p>
        <button
          type="button"
          onClick={stop}
          aria-label="Stop listening"
          className="press-scale rounded-full p-1 text-subtle hover:text-fg"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p className="font-display text-2xl leading-none font-medium tracking-tight italic">
          {snapshot.quiet ? <span className="text-subtle">—</span> : (keyLabel ?? "—")}
        </p>
        {!snapshot.quiet && chordLabel && (
          <p className="rounded-full bg-surface px-2 py-0.5 font-display text-sm text-muted hairline">
            {chordLabel}
          </p>
        )}
      </div>

      {!snapshot.quiet && key && (
        <div className="mt-2">
          <div className="h-1 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${Math.round(key.confidence * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-subtle">
            {Math.round(key.confidence * 100)}% sure
          </p>
        </div>
      )}

      {snapshot.quiet && snapshot.status === "listening" && (
        <p className="mt-2 text-[11px] text-subtle">Play something…</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={useDetectedKey}
          disabled={!key || snapshot.quiet}
          className={cn(
            "press-scale h-8 flex-1 rounded-full px-3 text-xs",
            key && !snapshot.quiet
              ? "bg-primary text-primary-fg"
              : "cursor-not-allowed bg-surface text-subtle",
          )}
        >
          Use this key
        </button>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface hairline">
          {snapshot.status === "listening" ? (
            <Mic className="h-3.5 w-3.5 text-accent" />
          ) : (
            <MicOff className="h-3.5 w-3.5 text-subtle" />
          )}
        </span>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-fg/60 transition-[width]"
          style={{ width: `${Math.round(snapshot.level * 100)}%` }}
        />
      </div>
    </div>
  );
}
