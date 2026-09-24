import { AudioLines, FolderOpen, Guitar, Piano, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PATTERNS, VOICES } from "@/lib/music/patterns";
import { GENRES, PRESETS } from "@/lib/music/progressions";
import { useCadence } from "@/lib/music/store";
import { KEYS, MODE_LIST } from "@/lib/music/theory";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

export function StudioSidebar() {
  const tonicId = useCadence((s) => s.tonicId);
  const mode = useCadence((s) => s.mode);
  const patternId = useCadence((s) => s.patternId);
  const voice = useCadence((s) => s.voice);
  const saveName = useCadence((s) => s.saveName);
  const saved = useCadence((s) => s.saved);
  const setTonic = useCadence((s) => s.setTonic);
  const setMode = useCadence((s) => s.setMode);
  const setPattern = useCadence((s) => s.setPattern);
  const setVoice = useCadence((s) => s.setVoice);
  const loadPreset = useCadence((s) => s.loadPreset);
  const setSaveName = useCadence((s) => s.setSaveName);
  const saveChart = useCadence((s) => s.saveChart);
  const loadChart = useCadence((s) => s.loadChart);
  const deleteChart = useCadence((s) => s.deleteChart);
  const [genre, setGenre] = useState("All");

  const presets = genre === "All" ? PRESETS : PRESETS.filter((p) => p.genre === genre);

  return (
    <aside className="flex flex-col gap-6 rounded-3xl bg-surface p-3 hairline md:p-4">
      <section>
        <SectionLabel>Key</SectionLabel>
        <div className="grid grid-cols-6 gap-1.5">
          {KEYS.map((key) => (
            <button
              key={key.id}
              type="button"
              onClick={() => setTonic(key.id)}
              className={cn(
                "press-scale h-11 rounded-lg font-display text-sm",
                tonicId === key.id ? "bg-primary text-primary-fg" : "bg-elevated text-fg hover:bg-bg",
              )}
            >
              {key.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {MODE_LIST.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "press-scale h-9 rounded-full px-3 text-sm",
                mode === m.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Presets</SectionLabel>
        <div className="mb-2 flex flex-wrap gap-1">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={cn(
                "press-scale h-8 rounded-full px-2.5 text-xs",
                genre === g ? "bg-elevated text-fg" : "text-subtle hover:text-muted",
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset.id)}
              className="press-scale flex h-12 items-center justify-between gap-3 rounded-xl bg-elevated px-3 text-left hover:bg-bg"
            >
              <span className="text-sm text-fg">{preset.name}</span>
              <span className="shrink-0 font-mono text-xs text-subtle">{preset.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Pattern</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.hint}
              onClick={() => setPattern(p.id)}
              className={cn(
                "press-scale flex min-h-16 flex-col items-start justify-center rounded-xl px-3 py-2.5 text-left",
                patternId === p.id ? "bg-primary text-primary-fg" : "bg-elevated text-fg hover:bg-bg",
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="text-sm leading-none">{p.label}</span>
                <RhythmMark kind={p.kind} meter={p.meter} active={patternId === p.id} />
              </span>
              <span
                className={cn(
                  "mt-1.5 line-clamp-2 text-kicker leading-snug",
                  patternId === p.id ? "opacity-70" : "text-subtle",
                )}
              >
                {p.hint}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Voice</SectionLabel>
        <div className="grid grid-cols-3 gap-1.5">
          {VOICES.map((v) => {
            const Icon = v.id === "piano" ? Piano : v.id === "nylon" ? Guitar : AudioLines;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVoice(v.id)}
                className={cn(
                  "press-scale flex h-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl px-2 text-center",
                  voice === v.id ? "bg-accent text-accent-fg" : "bg-elevated text-fg",
                )}
              >
                <Icon className="size-4" />
                <span className="block text-sm leading-none">{v.label}</span>
                <span className={cn("text-kicker", voice === v.id ? "opacity-70" : "text-subtle")}>{v.hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-kicker font-medium tracking-kicker text-subtle uppercase">Save</h3>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveChart();
            toast("Saved on this device");
          }}
        >
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Name this chart"
            className="h-11 min-w-0 flex-1 rounded-lg bg-elevated px-3 text-sm text-fg placeholder:text-subtle"
          />
          <Button type="submit" variant="subtle" size="icon" aria-label="Save chart">
            <Save className="size-4" />
          </Button>
        </form>
        {saved.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">Charts stay in this browser.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1.5">
            {saved.map((chart) => (
              <li key={chart.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => loadChart(chart.id)}
                  className="press-scale flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-elevated px-3 text-left hover:bg-bg"
                >
                  <FolderOpen className="size-3.5 shrink-0 text-subtle" />
                  <span className="truncate text-sm">{chart.name}</span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${chart.name}`}
                  className="size-11"
                  onClick={() => deleteChart(chart.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="mb-2 text-kicker font-medium tracking-kicker text-subtle uppercase">{children}</h3>
  );
}

function RhythmMark({
  kind,
  meter,
  active,
}: {
  kind: "strum" | "arp" | "block";
  meter: 3 | 4;
  active: boolean;
}) {
  const count = kind === "block" ? 1 : kind === "arp" ? meter * 2 : meter;
  return (
    <span className="flex h-2 items-end gap-0.5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn("rounded-full", active ? "bg-primary-fg/75" : "bg-accent")}
          style={{
            width: kind === "block" ? "1.1rem" : "0.22rem",
            height: kind === "arp" && i % 2 === 1 ? "0.28rem" : kind === "block" ? "0.32rem" : "0.5rem",
          }}
        />
      ))}
    </span>
  );
}
