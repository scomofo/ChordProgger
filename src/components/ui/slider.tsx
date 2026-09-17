import { cn } from "@/lib/utils";

type SliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
  "aria-label"?: string;
};

export function Slider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  const current = value[0] ?? min;
  const pct = max === min ? 0 : ((current - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={current}
      aria-label={ariaLabel}
      onChange={(event) => onValueChange([Number(event.target.value)])}
      className={cn("range-input", className)}
      style={{ ["--range-pct" as string]: `${pct}%` }}
    />
  );
}
