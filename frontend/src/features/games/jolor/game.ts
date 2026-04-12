import allColors from "./all_colors.json";
import shuffledColors from "./shuffled_colors.json";

export const JOLOR_STORAGE_KEY = "jolor-state";
export const JOLOR_MAX_GUESSES = 8;
export const JOLOR_RGB_THRESHOLD = 32;
const JOLOR_EPOCH = Date.UTC(2026, 0, 1);

export type JolorColor = {
  name: string;
  hex: string;
  rgb: [number, number, number];
};

export type JolorPuzzle = JolorColor & {
  puzzleId: number;
  date: Date;
};

export type JolorPuzzleState = {
  guesses: string[];
  hintUsed: boolean;
};

export type JolorArchiveState = {
  puzzles: Record<string, JolorPuzzleState>;
};

const ALL_COLORS = allColors as JolorColor[];
const SHUFFLED_COLORS = shuffledColors as JolorColor[];

export function getAllJolorColors() {
  return ALL_COLORS;
}

export function getShuffledJolorColors() {
  return SHUFFLED_COLORS;
}

export function normalizeHex(value: string) {
  const stripped = value.trim().replace(/^#/, "").toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(stripped)) {
    return null;
  }
  return `#${stripped}`;
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }

  return [
    Number.parseInt(normalized.slice(1, 3), 16),
    Number.parseInt(normalized.slice(3, 5), 16),
    Number.parseInt(normalized.slice(5, 7), 16)
  ];
}

export function rgbToHex(red: number, green: number, blue: number) {
  const values = [red, green, blue].map((value) =>
    Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0").toUpperCase()
  );

  return `#${values.join("")}`;
}

export function clampRgbValue(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function colorDistance(first: [number, number, number], second: [number, number, number]) {
  const [r1, g1, b1] = first;
  const [r2, g2, b2] = second;
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function isSolvedGuess(guessHex: string, targetHex: string) {
  const guessRgb = hexToRgb(guessHex);
  const targetRgb = hexToRgb(targetHex);

  if (!guessRgb || !targetRgb) {
    return false;
  }

  return colorDistance(guessRgb, targetRgb) <= JOLOR_RGB_THRESHOLD;
}

export function normalizeJolorGuesses(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((guess) => normalizeHex(String(guess)))
    .filter((guess): guess is string => Boolean(guess))
    .slice(0, JOLOR_MAX_GUESSES);
}

export function normalizeJolorPuzzleState(value: unknown): JolorPuzzleState {
  if (!value || typeof value !== "object") {
    return { guesses: [], hintUsed: false };
  }

  const maybeState = value as Partial<JolorPuzzleState>;
  return {
    guesses: normalizeJolorGuesses(maybeState.guesses),
    hintUsed: Boolean(maybeState.hintUsed)
  };
}

export function getTodaysJolorPuzzle(date = new Date()) {
  const puzzleId = Math.max(
    0,
    Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - JOLOR_EPOCH) / 86400000)
  );

  return getJolorPuzzleById(puzzleId);
}

export function getJolorPuzzleById(puzzleId: number): JolorPuzzle {
  const safePuzzleId = Math.max(0, puzzleId);
  const target = SHUFFLED_COLORS[safePuzzleId % SHUFFLED_COLORS.length];

  return {
    ...target,
    puzzleId: safePuzzleId,
    date: new Date(JOLOR_EPOCH + safePuzzleId * 86400000)
  };
}

export function getGuessResult(guessHex: string, targetHex: string) {
  const guessRgb = hexToRgb(guessHex);
  const targetRgb = hexToRgb(targetHex);

  if (!guessRgb || !targetRgb) {
    return null;
  }

  const distance = colorDistance(guessRgb, targetRgb);
  return {
    guessRgb,
    targetRgb,
    distance,
    solved: distance <= JOLOR_RGB_THRESHOLD
  };
}

export function getBestDistance(guesses: string[], targetHex: string) {
  return guesses.reduce<number | null>((best, guess) => {
    const result = getGuessResult(guess, targetHex);
    if (!result) {
      return best;
    }
    if (best === null || result.distance < best) {
      return result.distance;
    }
    return best;
  }, null);
}
