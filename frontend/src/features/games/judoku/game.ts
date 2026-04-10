import puzzles from "./puzzles.json";

export const JUDOKU_STORAGE_KEY = "judoku-state";
export const JUDOKU_SIZE = 6;
export const JUDOKU_EPOCH = Date.UTC(2026, 0, 1);

export type JudokuPuzzleData = {
  puzzleId: number;
  givens: string[];
  solution: string[];
};

export type JudokuPuzzle = JudokuPuzzleData & {
  date: Date;
};

export type JudokuCellNotes = string[];

export type JudokuPuzzleState = {
  values: string[];
  notes: Record<string, JudokuCellNotes>;
  hintUsed: boolean;
  solved: boolean;
  corrections: number;
  notesUsed: boolean;
};

export type JudokuArchiveState = {
  puzzles: Record<string, JudokuPuzzleState>;
};

const JUDOKU_PUZZLES = puzzles as JudokuPuzzleData[];

function cellKey(row: number, column: number) {
  return `${row}:${column}`;
}

export function normalizeJudokuState(puzzle: JudokuPuzzleData, value: unknown): JudokuPuzzleState {
  const blankValues = puzzle.givens.join("");

  if (!value || typeof value !== "object") {
    return {
      values: blankValues.split(""),
      notes: {},
      hintUsed: false,
      solved: false,
      corrections: 0,
      notesUsed: false
    };
  }

  const maybeState = value as Partial<JudokuPuzzleState>;
  const nextValues =
    Array.isArray(maybeState.values) && maybeState.values.length === JUDOKU_SIZE * JUDOKU_SIZE
      ? maybeState.values.map((entry) => {
          const valueText = String(entry);
          return /^[0-6]$/.test(valueText) ? valueText : "0";
        })
      : blankValues.split("");

  const nextNotes: Record<string, string[]> = {};
  if (maybeState.notes && typeof maybeState.notes === "object") {
    for (const [key, notes] of Object.entries(maybeState.notes)) {
      if (!Array.isArray(notes)) {
        continue;
      }

      const normalized = Array.from(new Set(notes.map((note) => String(note)).filter((note) => /^[1-6]$/.test(note)).sort()));
      if (normalized.length > 0) {
        nextNotes[key] = normalized;
      }
    }
  }

  return {
    values: nextValues,
    notes: nextNotes,
    hintUsed: Boolean(maybeState.hintUsed),
    solved: Boolean(maybeState.solved),
    corrections: Math.max(0, Number(maybeState.corrections) || 0),
    notesUsed: Boolean(maybeState.notesUsed)
  };
}

export function getTodaysJudokuPuzzle(date = new Date()) {
  const puzzleId = Math.max(0, Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - JUDOKU_EPOCH) / 86400000));
  return getJudokuPuzzleById(puzzleId);
}

export function getJudokuPuzzleById(puzzleId: number): JudokuPuzzle {
  const safePuzzleId = Math.max(0, puzzleId);
  const puzzle = JUDOKU_PUZZLES[safePuzzleId % JUDOKU_PUZZLES.length];

  return {
    ...puzzle,
    puzzleId: safePuzzleId,
    date: new Date(JUDOKU_EPOCH + safePuzzleId * 86400000)
  };
}

export function getCellValue(state: JudokuPuzzleState, row: number, column: number) {
  return state.values[row * JUDOKU_SIZE + column];
}

export function isGiven(puzzle: JudokuPuzzleData, row: number, column: number) {
  return puzzle.givens[row][column] !== "0";
}

export function setCellValue(puzzle: JudokuPuzzleData, state: JudokuPuzzleState, row: number, column: number, value: string) {
  if (isGiven(puzzle, row, column) || state.solved) {
    return state;
  }

  const index = row * JUDOKU_SIZE + column;
  const nextValues = [...state.values];
  const previous = nextValues[index];
  nextValues[index] = value;
  const nextNotes = { ...state.notes };
  delete nextNotes[cellKey(row, column)];

  const solutionValue = puzzle.solution[row][column];
  const corrections = value !== "0" && value !== solutionValue && previous !== value ? state.corrections + 1 : state.corrections;
  const solved = nextValues.join("") === puzzle.solution.join("");

  return {
    ...state,
    values: nextValues,
    notes: nextNotes,
    corrections,
    solved
  };
}

export function toggleCellNote(puzzle: JudokuPuzzleData, state: JudokuPuzzleState, row: number, column: number, value: string) {
  if (isGiven(puzzle, row, column) || state.solved || getCellValue(state, row, column) !== "0") {
    return state;
  }

  const key = cellKey(row, column);
  const current = state.notes[key] ?? [];
  const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value].sort();

  const notes = { ...state.notes };
  if (next.length === 0) {
    delete notes[key];
  } else {
    notes[key] = next;
  }

  return {
    ...state,
    notes,
    notesUsed: true
  };
}

export function getRowValues(values: string[], row: number) {
  return values.slice(row * JUDOKU_SIZE, row * JUDOKU_SIZE + JUDOKU_SIZE);
}

export function getColumnValues(values: string[], column: number) {
  return Array.from({ length: JUDOKU_SIZE }, (_, row) => values[row * JUDOKU_SIZE + column]);
}

export function getRegionValues(values: string[], row: number, column: number) {
  const startRow = Math.floor(row / 2) * 2;
  const startColumn = Math.floor(column / 3) * 3;
  const region: string[] = [];

  for (let rowIndex = startRow; rowIndex < startRow + 2; rowIndex += 1) {
    for (let columnIndex = startColumn; columnIndex < startColumn + 3; columnIndex += 1) {
      region.push(values[rowIndex * JUDOKU_SIZE + columnIndex]);
    }
  }

  return region;
}

export function hasDuplicate(values: string[]) {
  const filtered = values.filter((value) => value !== "0");
  return new Set(filtered).size !== filtered.length;
}

export function isCellInvalid(state: JudokuPuzzleState, row: number, column: number) {
  const value = getCellValue(state, row, column);
  if (value === "0") {
    return false;
  }

  return hasDuplicate(getRowValues(state.values, row)) || hasDuplicate(getColumnValues(state.values, column)) || hasDuplicate(getRegionValues(state.values, row, column));
}

export function getJudokuHintCell(puzzle: JudokuPuzzleData, state: JudokuPuzzleState) {
  for (let row = 0; row < JUDOKU_SIZE; row += 1) {
    for (let column = 0; column < JUDOKU_SIZE; column += 1) {
      if (getCellValue(state, row, column) === "0") {
        return {
          row,
          column,
          value: puzzle.solution[row][column]
        };
      }
    }
  }

  return null;
}

export function getFilledCount(state: JudokuPuzzleState) {
  return state.values.filter((value) => value !== "0").length;
}
