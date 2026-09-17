import { FolderOpen, Save, Trash2 } from "lucide-react";
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
        <h3 className="mb-2 text-sm font-medium text-muted">Key</h3>
        <div className="grid grid-cols-6 gap-1.5">
          {KEYS.map((key) => (
            <button
              key={key.id}
              type="button"
              onClick={() => setTonic(key.id)}
              className={cn(
                "press-scale h-11 rounded-lg font-display text-sm",
                tonicId === key.id ? "bg-primary text-primary-fg" : "bg-elevated text-fg hover:bg-surface",
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
        <h3 className="mb-2 text-sm font-medium text-muted">Presets</h3>
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
              className="press-scale flex h-11 items-center justify-between rounded-xl bg-elevated px-3 text-left hover:bg-surface"
            >
              <span className="text-sm text-fg">{preset.name}</span>
              <span className="font-mono text-xs text-subtle">{preset.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-muted">Pattern</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.hint}
              onClick={() => setPattern(p.id)}
              className={cn(
                "press-scale flex h-14 flex-col items-start justify-center rounded-xl px-3 text-left",
                patternId === p.id ? "bg-primary text-primary-fg" : "bg-elevated text-fg hover:bg-surface",
              )}
            >
              <span className="text-sm leading-none">{p.label}</span>
              <span className={cn("mt-1 text-kicker", patternId === p.id ? "opacity-70" : "text-subtle")}>
                {p.hint}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-muted">Voice</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVoice(v.id)}
              className={cn(
                "press-scale h-16 rounded-xl px-2 text-center",
                voice === v.id ? "bg-accent text-accent-fg" : "bg-elevated text-fg",
              )}
            >
              <span className="block text-sm">{v.label}</span>
              <span className={cn("text-kicker", voice === v.id ? "opacity-70" : "text-subtle")}>{v.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-muted">Save</h3>
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
                  className="press-scale flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-elevated px-3 text-left hover:bg-surface"
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
