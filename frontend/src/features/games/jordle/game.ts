import { JORDLE_ANSWERS, JORDLE_GUESSES } from "./words";

export const JORDLE_WORD_LENGTH = 6;
export const JORDLE_MAX_GUESSES = 6;
export const JORDLE_STORAGE_KEY = "jordle-state";
const JORDLE_EPOCH = Date.UTC(2026, 0, 1);

export type LetterState = "empty" | "miss" | "present" | "correct";

export type EvaluatedLetter = {
  char: string;
  state: LetterState;
};

export type JordleSaveState = {
  puzzleId: number;
  guesses: string[];
};

export type JordleArchiveState = {
  puzzles: Record<string, string[]>;
};

const guessSet = new Set<string>(JORDLE_GUESSES as readonly string[]);

export function normalizeGuess(value: string) {
  return value.trim().toLowerCase();
}

export function isValidJordleGuess(value: string) {
  const normalized = normalizeGuess(value);
  return (
    normalized.length === JORDLE_WORD_LENGTH &&
    /^[a-z]{6}$/.test(normalized) &&
    guessSet.has(normalized)
  );
}

export function getTodaysJordlePuzzle(date = new Date()) {
  const puzzleId = Math.max(
    0,
    Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - JORDLE_EPOCH) / 86400000)
  );

  return getJordlePuzzleById(puzzleId);
}

export function getJordlePuzzleById(puzzleId: number) {
  const safePuzzleId = Math.max(0, puzzleId);
  return {
    puzzleId: safePuzzleId,
    answer: JORDLE_ANSWERS[safePuzzleId % JORDLE_ANSWERS.length],
    date: new Date(JORDLE_EPOCH + safePuzzleId * 86400000)
  };
}

export function normalizeArchivedGuesses(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((guess) => normalizeGuess(String(guess)))
    .filter((guess) => guess.length === JORDLE_WORD_LENGTH)
    .slice(0, JORDLE_MAX_GUESSES);
}

export function evaluateGuess(guess: string, answer: string) {
  const normalizedGuess = normalizeGuess(guess);
  const normalizedAnswer = normalizeGuess(answer);
  const result = normalizedGuess.split("").map((char) => ({
    char,
    state: "miss" as LetterState
  }));
  const remaining = normalizedAnswer.split("");

  for (let index = 0; index < normalizedGuess.length; index += 1) {
    if (normalizedGuess[index] === normalizedAnswer[index]) {
      result[index].state = "correct";
      remaining[index] = "";
    }
  }

  for (let index = 0; index < normalizedGuess.length; index += 1) {
    if (result[index].state === "correct") {
      continue;
    }

    const matchIndex = remaining.indexOf(normalizedGuess[index]);
    if (matchIndex !== -1) {
      result[index].state = "present";
      remaining[matchIndex] = "";
    }
  }

  return result;
}

export function mergeKeyboardState(
  keyboard: Record<string, LetterState>,
  evaluation: EvaluatedLetter[]
) {
  const priority: Record<LetterState, number> = {
    empty: 0,
    miss: 1,
    present: 2,
    correct: 3
  };
  const next = { ...keyboard };

  for (const letter of evaluation) {
    const current = next[letter.char] ?? "empty";
    if (priority[letter.state] > priority[current]) {
      next[letter.char] = letter.state;
    }
  }

  return next;
}
