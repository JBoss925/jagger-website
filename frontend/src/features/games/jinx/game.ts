import puzzles from "./puzzles.json";

export const JINX_STORAGE_KEY = "jinx-state";
export const JINX_EPOCH = Date.UTC(2026, 0, 1);

export type JinxCell = [number, number];
export type JinxDifficulty = "easy" | "hard";

export type JinxDifficultySettings = {
  columns: number;
  difficulty: JinxDifficulty;
  label: string;
  mineCount: number;
  rows: number;
};

export type JinxPuzzleData = JinxDifficultySettings & {
  puzzleId: number;
  mines: JinxCell[];
};

export type JinxPuzzle = JinxPuzzleData & {
  date: Date;
};

export type JinxPuzzleState = {
  flags: JinxCell[];
  hintCount: number;
  lastRevealed: JinxCell | null;
  lost: boolean;
  moveCount: number;
  revealed: JinxCell[];
};

export type JinxArchiveState = {
  puzzles: Record<string, JinxPuzzleState>;
};

export const JINX_DIFFICULTIES: Record<JinxDifficulty, JinxDifficultySettings> = {
  easy: {
    columns: 8,
    difficulty: "easy",
    label: "Easy",
    mineCount: 10,
    rows: 8
  },
  hard: {
    columns: 16,
    difficulty: "hard",
    label: "Hard",
    mineCount: 40,
    rows: 16
  }
};

export const JINX_ROWS = JINX_DIFFICULTIES.easy.rows;
export const JINX_COLUMNS = JINX_DIFFICULTIES.easy.columns;
export const JINX_MINE_COUNT = JINX_DIFFICULTIES.easy.mineCount;

const JINX_PUZZLES = puzzles as Array<{ mines: JinxCell[]; puzzleId: number }>;

function keyForCell(row: number, column: number) {
  return `${row}:${column}`;
}

function getDifficultySettings(difficulty: JinxDifficulty = "easy") {
  return JINX_DIFFICULTIES[difficulty];
}

function normalizeCells(value: unknown, settings: JinxDifficultySettings) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const cells: JinxCell[] = [];

  for (const item of value) {
    if (!Array.isArray(item) || item.length !== 2) {
      continue;
    }

    const row = Number(item[0]);
    const column = Number(item[1]);

    if (
      !Number.isInteger(row) ||
      !Number.isInteger(column) ||
      row < 0 ||
      row >= settings.rows ||
      column < 0 ||
      column >= settings.columns
    ) {
      continue;
    }

    const key = keyForCell(row, column);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    cells.push([row, column]);
  }

  return cells;
}

function normalizeCell(value: unknown, settings: JinxDifficultySettings) {
  return normalizeCells([value], settings)[0] ?? null;
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next ^= next + Math.imul(next ^ (next >>> 7), 61 | next);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function getHardPuzzleSeed(puzzleId: number) {
  return (puzzleId + 1) * 2654435761;
}

function getCenterOpeningCell(settings: JinxDifficultySettings): JinxCell {
  return [Math.floor((settings.rows - 1) / 2), Math.floor((settings.columns - 1) / 2)];
}

function createHardPuzzle(puzzleId: number): JinxPuzzleData {
  const settings = getDifficultySettings("hard");
  const [openingRow, openingColumn] = getCenterOpeningCell(settings);
  const reserved = new Set(getNeighborCells(settings, openingRow, openingColumn).map(([row, column]) => keyForCell(row, column)));
  reserved.add(keyForCell(openingRow, openingColumn));

  const candidates: JinxCell[] = [];
  for (let row = 0; row < settings.rows; row += 1) {
    for (let column = 0; column < settings.columns; column += 1) {
      if (!reserved.has(keyForCell(row, column))) {
        candidates.push([row, column]);
      }
    }
  }

  const random = createSeededRandom(getHardPuzzleSeed(puzzleId));
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }

  const mines = candidates
    .slice(0, settings.mineCount)
    .sort(([firstRow, firstColumn], [secondRow, secondColumn]) =>
      firstRow === secondRow ? firstColumn - secondColumn : firstRow - secondRow
    );

  return {
    ...settings,
    mines,
    puzzleId
  };
}

export function getJinxArchiveKey(difficulty: JinxDifficulty, puzzleId: number) {
  return `${difficulty}:${puzzleId}`;
}

export function getJinxDifficultyFromArchiveKey(key: string): JinxDifficulty {
  return key.startsWith("hard:") ? "hard" : "easy";
}

export function normalizeJinxPuzzleState(value: unknown, difficulty: JinxDifficulty = "easy"): JinxPuzzleState {
  const settings = getDifficultySettings(difficulty);

  if (!value || typeof value !== "object") {
    return {
      revealed: [],
      flags: [],
      hintCount: 0,
      lastRevealed: null,
      moveCount: 0,
      lost: false
    };
  }

  const maybeState = value as Partial<JinxPuzzleState> & { hintUsed?: unknown };
  const normalizedHintCount = Math.max(
    0,
    Number.isFinite(Number(maybeState.hintCount))
      ? Number(maybeState.hintCount)
      : maybeState.hintUsed
        ? 1
        : 0
  );

  return {
    revealed: normalizeCells(maybeState.revealed, settings),
    flags: normalizeCells(maybeState.flags, settings),
    hintCount: normalizedHintCount,
    lastRevealed: normalizeCell((maybeState as { lastRevealed?: unknown }).lastRevealed, settings),
    moveCount: Math.max(0, Number(maybeState.moveCount) || 0),
    lost: Boolean(maybeState.lost)
  };
}

export function getTodaysJinxPuzzle(date = new Date(), difficulty: JinxDifficulty = "easy") {
  const puzzleId = Math.max(0, Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - JINX_EPOCH) / 86400000));
  return getJinxPuzzleById(puzzleId, difficulty);
}

export function getJinxPuzzleById(puzzleId: number, difficulty: JinxDifficulty = "easy"): JinxPuzzle {
  const safePuzzleId = Math.max(0, puzzleId);
  const settings = getDifficultySettings(difficulty);
  const puzzle =
    difficulty === "easy"
      ? {
          ...settings,
          ...JINX_PUZZLES[safePuzzleId % JINX_PUZZLES.length]
        }
      : createHardPuzzle(safePuzzleId);

  return {
    ...puzzle,
    puzzleId: safePuzzleId,
    date: new Date(JINX_EPOCH + safePuzzleId * 86400000)
  };
}

export function isMine(puzzle: JinxPuzzleData, row: number, column: number) {
  return puzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column);
}

export function getNeighborCells(source: Pick<JinxDifficultySettings, "columns" | "rows">, row: number, column: number) {
  const neighbors: JinxCell[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;

      if (nextRow >= 0 && nextRow < source.rows && nextColumn >= 0 && nextColumn < source.columns) {
        neighbors.push([nextRow, nextColumn]);
      }
    }
  }

  return neighbors;
}

export function getAdjacentMineCount(puzzle: JinxPuzzleData, row: number, column: number) {
  return getNeighborCells(puzzle, row, column).filter(([neighborRow, neighborColumn]) => isMine(puzzle, neighborRow, neighborColumn)).length;
}

export function revealFromCell(puzzle: JinxPuzzleData, state: JinxPuzzleState, row: number, column: number) {
  const revealedSet = new Set(state.revealed.map(([r, c]) => keyForCell(r, c)));
  const flagSet = new Set(state.flags.map(([r, c]) => keyForCell(r, c)));

  if (revealedSet.has(keyForCell(row, column)) || flagSet.has(keyForCell(row, column)) || state.lost) {
    return state;
  }

  if (isMine(puzzle, row, column)) {
    return {
      ...state,
      revealed: [...state.revealed, [row, column] as JinxCell],
      lastRevealed: [row, column] as JinxCell,
      moveCount: state.moveCount + 1,
      lost: true
    };
  }

  const nextRevealed = [...state.revealed];
  const queue: JinxCell[] = [[row, column]];

  while (queue.length > 0) {
    const [currentRow, currentColumn] = queue.shift()!;
    const currentKey = keyForCell(currentRow, currentColumn);

    if (revealedSet.has(currentKey) || flagSet.has(currentKey)) {
      continue;
    }

    revealedSet.add(currentKey);
    nextRevealed.push([currentRow, currentColumn] as JinxCell);

    if (getAdjacentMineCount(puzzle, currentRow, currentColumn) === 0) {
      queue.push(...getNeighborCells(puzzle, currentRow, currentColumn));
    }
  }

  return {
    ...state,
    lastRevealed: [row, column] as JinxCell,
    revealed: nextRevealed,
    moveCount: state.moveCount + 1
  };
}

export function toggleFlag(state: JinxPuzzleState, row: number, column: number) {
  if (state.lost) {
    return state;
  }

  const cellKey = keyForCell(row, column);
  const revealedSet = new Set(state.revealed.map(([r, c]) => keyForCell(r, c)));
  if (revealedSet.has(cellKey)) {
    return state;
  }

  const existingIndex = state.flags.findIndex(([r, c]) => r === row && c === column);
  if (existingIndex >= 0) {
    return {
      ...state,
      flags: state.flags.filter((_, index) => index !== existingIndex),
      moveCount: state.moveCount + 1
    };
  }

  return {
    ...state,
    flags: [...state.flags, [row, column] as JinxCell],
    moveCount: state.moveCount + 1
  };
}

export function getSafeHintCell(puzzle: JinxPuzzleData, state: JinxPuzzleState) {
  const revealed = new Set(state.revealed.map(([r, c]) => keyForCell(r, c)));
  const flags = new Set(state.flags.map(([r, c]) => keyForCell(r, c)));
  const candidates: JinxCell[] = [];
  const zeroCandidates: JinxCell[] = [];

  for (let row = 0; row < puzzle.rows; row += 1) {
    for (let column = 0; column < puzzle.columns; column += 1) {
      const key = keyForCell(row, column);
      if (!revealed.has(key) && !flags.has(key) && !isMine(puzzle, row, column)) {
        const candidate = [row, column] as JinxCell;
        candidates.push(candidate);

        if (getAdjacentMineCount(puzzle, row, column) === 0) {
          zeroCandidates.push(candidate);
        }
      }
    }
  }

  const prioritizedCandidates = zeroCandidates.length > 0 ? zeroCandidates : candidates;

  if (prioritizedCandidates.length === 0) {
    return null;
  }

  if (!state.lastRevealed) {
    return prioritizedCandidates[0] ?? null;
  }

  const [lastRow, lastColumn] = state.lastRevealed;
  return prioritizedCandidates.reduce((best, candidate) => {
    const bestDistance = Math.hypot(best[0] - lastRow, best[1] - lastColumn);
    const candidateDistance = Math.hypot(candidate[0] - lastRow, candidate[1] - lastColumn);

    if (candidateDistance !== bestDistance) {
      return candidateDistance < bestDistance ? candidate : best;
    }

    if (candidate[0] !== best[0]) {
      return candidate[0] < best[0] ? candidate : best;
    }

    return candidate[1] < best[1] ? candidate : best;
  });
}

export function getInitialSafeRevealCell(puzzle: JinxPuzzleData) {
  const centerRow = (puzzle.rows - 1) / 2;
  const centerColumn = (puzzle.columns - 1) / 2;
  const cells = Array.from({ length: puzzle.rows * puzzle.columns }, (_, index) => {
    const row = Math.floor(index / puzzle.columns);
    const column = index % puzzle.columns;
    const rowDistance = row - centerRow;
    const columnDistance = column - centerColumn;

    return {
      row,
      column,
      distance: rowDistance * rowDistance + columnDistance * columnDistance
    };
  }).sort((first, second) => {
    if (first.distance !== second.distance) {
      return first.distance - second.distance;
    }

    if (first.row !== second.row) {
      return first.row - second.row;
    }

    return first.column - second.column;
  });

  for (const { row, column } of cells) {
    if (!isMine(puzzle, row, column) && getAdjacentMineCount(puzzle, row, column) === 0) {
      return [row, column] as JinxCell;
    }
  }

  return getSafeHintCell(puzzle, normalizeJinxPuzzleState(null, puzzle.difficulty));
}

export function createInitialJinxPuzzleState(puzzle: JinxPuzzleData) {
  const openingCell = getInitialSafeRevealCell(puzzle);
  if (!openingCell) {
    return normalizeJinxPuzzleState(null, puzzle.difficulty);
  }

  const openedState = revealFromCell(puzzle, normalizeJinxPuzzleState(null, puzzle.difficulty), openingCell[0], openingCell[1]);
  return {
    ...openedState,
    lastRevealed: null,
    moveCount: 0
  };
}

export function isJinxSolved(puzzle: JinxPuzzleData, state: JinxPuzzleState) {
  return !state.lost && state.revealed.length >= puzzle.rows * puzzle.columns - puzzle.mineCount;
}
