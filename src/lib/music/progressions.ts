import { makeSlot, type Beats, type Quality, type Slot } from "./theory";

export type RecipeStep = {
  degree: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  accidental?: -1 | 0 | 1;
  quality?: Quality;
  beats?: Beats;
};

export type Preset = {
  id: string;
  name: string;
  hint: string;
  genre: string;
  recipe: RecipeStep[];
};

export const PRESETS: Preset[] = [
  {
    id: "pop",
    name: "Pop axis",
    hint: "I–V–vi–IV",
    genre: "Pop",
    recipe: [
      { degree: 1 },
      { degree: 5 },
      { degree: 6 },
      { degree: 4 },
    ],
  },
  {
    id: "sensitive",
    name: "Sensitive",
    hint: "vi–IV–I–V",
    genre: "Pop",
    recipe: [
      { degree: 6 },
      { degree: 4 },
      { degree: 1 },
      { degree: 5 },
    ],
  },
  {
    id: "doo-wop",
    name: "Doo-wop",
    hint: "I–vi–IV–V",
    genre: "Pop",
    recipe: [
      { degree: 1 },
      { degree: 6 },
      { degree: 4 },
      { degree: 5 },
    ],
  },
  {
    id: "deceptive",
    name: "Deceptive",
    hint: "I–V–vi–iii",
    genre: "Pop",
    recipe: [
      { degree: 1 },
      { degree: 5 },
      { degree: 6 },
      { degree: 3 },
    ],
  },
  {
    id: "classic",
    name: "Classic",
    hint: "I–IV–V–I",
    genre: "Folk",
    recipe: [
      { degree: 1 },
      { degree: 4 },
      { degree: 5 },
      { degree: 1 },
    ],
  },
  {
    id: "country",
    name: "Country",
    hint: "I–IV–V–IV",
    genre: "Country",
    recipe: [
      { degree: 1 },
      { degree: 4 },
      { degree: 5 },
      { degree: 4 },
    ],
  },
  {
    id: "folk-walk",
    name: "Folk walk",
    hint: "I–vi–ii–V",
    genre: "Folk",
    recipe: [
      { degree: 1 },
      { degree: 6 },
      { degree: 2 },
      { degree: 5 },
    ],
  },
  {
    id: "canon",
    name: "Canon",
    hint: "I–V–vi–iii–IV–I–IV–V",
    genre: "Classical",
    recipe: [
      { degree: 1 },
      { degree: 5 },
      { degree: 6 },
      { degree: 3 },
      { degree: 4 },
      { degree: 1 },
      { degree: 4 },
      { degree: 5 },
    ],
  },
  {
    id: "jazz-251",
    name: "ii–V–I",
    hint: "ii⁷–V⁷–IΔ",
    genre: "Jazz",
    recipe: [
      { degree: 2, quality: "min7", beats: 2 },
      { degree: 5, quality: "7", beats: 2 },
      { degree: 1, quality: "maj7", beats: 4 },
    ],
  },
  {
    id: "rhythm",
    name: "Rhythm A",
    hint: "I–vi–ii–V",
    genre: "Jazz",
    recipe: [
      { degree: 1, quality: "maj7", beats: 2 },
      { degree: 6, quality: "min7", beats: 2 },
      { degree: 2, quality: "min7", beats: 2 },
      { degree: 5, quality: "7", beats: 2 },
    ],
  },
  {
    id: "turnaround",
    name: "Turnaround",
    hint: "I–VI–II–V",
    genre: "Jazz",
    recipe: [
      { degree: 1, quality: "maj7", beats: 2 },
      { degree: 6, quality: "7", beats: 2 },
      { degree: 2, quality: "7", beats: 2 },
      { degree: 5, quality: "7", beats: 2 },
    ],
  },
  {
    id: "blues",
    name: "12-bar blues",
    hint: "I⁷–IV⁷–V⁷",
    genre: "Blues",
    recipe: [
      { degree: 1, quality: "7" },
      { degree: 1, quality: "7" },
      { degree: 1, quality: "7" },
      { degree: 1, quality: "7" },
      { degree: 4, quality: "7" },
      { degree: 4, quality: "7" },
      { degree: 1, quality: "7" },
      { degree: 1, quality: "7" },
      { degree: 5, quality: "7" },
      { degree: 4, quality: "7" },
      { degree: 1, quality: "7" },
      { degree: 5, quality: "7" },
    ],
  },
  {
    id: "rock",
    name: "Mixo rock",
    hint: "I–♭VII–IV",
    genre: "Rock",
    recipe: [
      { degree: 1, quality: "maj" },
      { degree: 7, accidental: -1, quality: "maj" },
      { degree: 4, quality: "maj" },
      { degree: 1, quality: "maj" },
    ],
  },
  {
    id: "andalusian",
    name: "Andalusian",
    hint: "i–♭VII–♭VI–V",
    genre: "Minor",
    recipe: [
      { degree: 1, quality: "min" },
      { degree: 7, accidental: -1, quality: "maj" },
      { degree: 6, accidental: -1, quality: "maj" },
      { degree: 5, quality: "maj" },
    ],
  },
  {
    id: "lament",
    name: "Lament",
    hint: "i–VII–VI–V",
    genre: "Minor",
    recipe: [
      { degree: 1 },
      { degree: 7 },
      { degree: 6 },
      { degree: 5, quality: "maj" },
    ],
  },
  {
    id: "creep",
    name: "Creep",
    hint: "I–III–IV–iv",
    genre: "Alt",
    recipe: [
      { degree: 1, quality: "maj" },
      { degree: 3, quality: "maj" },
      { degree: 4, quality: "maj" },
      { degree: 4, quality: "min" },
    ],
  },
  {
    id: "amen",
    name: "Amen",
    hint: "IV–I",
    genre: "Gospel",
    recipe: [
      { degree: 4, beats: 4 },
      { degree: 1, beats: 4 },
    ],
  },
  {
    id: "pop-minor",
    name: "Pop minor",
    hint: "i–VI–III–VII",
    genre: "Pop",
    recipe: [
      { degree: 1 },
      { degree: 6 },
      { degree: 3 },
      { degree: 7 },
    ],
  },
];

export const GENRES = ["All", ...Array.from(new Set(PRESETS.map((p) => p.genre)))];

export function slotsFromRecipe(recipe: RecipeStep[]): Slot[] {
  return recipe.map((step) =>
    makeSlot({
      degree: step.degree,
      accidental: step.accidental ?? 0,
      quality: step.quality ?? "auto",
      beats: step.beats ?? 4,
    }),
  );
}
