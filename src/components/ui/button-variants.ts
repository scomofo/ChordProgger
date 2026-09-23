import { cva } from "class-variance-authority";

/**
 * Button variant classes, kept in a separate module so
 * `ui/button.tsx` only exports components (react-refresh rule).
 */
export const buttonVariants = cva(
  "press-scale inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-fg shadow-[var(--shadow-play)] hover:opacity-95",
        accent: "bg-accent text-accent-fg hover:opacity-95",
        outline: "hairline bg-transparent text-fg hover:bg-elevated",
        ghost: "text-muted hover:bg-elevated hover:text-fg",
        subtle: "bg-elevated text-fg hover:bg-surface",
        danger: "text-danger hover:bg-elevated",
      },
      size: {
        default: "h-11 rounded-lg px-4 text-sm",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-14 rounded-xl px-6 text-base",
        chip: "h-9 rounded-full px-3.5 text-sm",
        icon: "size-11 rounded-lg",
        play: "size-16 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
