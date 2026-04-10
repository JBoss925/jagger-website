import puzzles from "./puzzles.json";

export const JINX_STORAGE_KEY = "jinx-state";
export const JINX_ROWS = 8;
export const JINX_COLUMNS = 8;
export const JINX_MINE_COUNT = 10;
export const JINX_EPOCH = Date.UTC(2026, 0, 1);

export type JinxCell = [number, number];

export type JinxPuzzleData = {
  puzzleId: number;
  mines: JinxCell[];
};

export type JinxPuzzle = JinxPuzzleData & {
  date: Date;
};

export type JinxPuzzleState = {
  revealed: JinxCell[];
  flags: JinxCell[];
  hintCount: number;
  moveCount: number;
  lost: boolean;
};

export type JinxArchiveState = {
  puzzles: Record<string, JinxPuzzleState>;
};

const JINX_PUZZLES = puzzles as JinxPuzzleData[];

function keyForCell(row: number, column: number) {
  return `${row}:${column}`;
}

function normalizeCells(value: unknown) {
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

    if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || row >= JINX_ROWS || column < 0 || column >= JINX_COLUMNS) {
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

export function normalizeJinxPuzzleState(value: unknown): JinxPuzzleState {
  if (!value || typeof value !== "object") {
    return {
      revealed: [],
      flags: [],
      hintCount: 0,
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
    revealed: normalizeCells(maybeState.revealed),
    flags: normalizeCells(maybeState.flags),
    hintCount: normalizedHintCount,
    moveCount: Math.max(0, Number(maybeState.moveCount) || 0),
    lost: Boolean(maybeState.lost)
  };
}

export function getTodaysJinxPuzzle(date = new Date()) {
  const puzzleId = Math.max(0, Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - JINX_EPOCH) / 86400000));
  return getJinxPuzzleById(puzzleId);
}

export function getJinxPuzzleById(puzzleId: number): JinxPuzzle {
  const safePuzzleId = Math.max(0, puzzleId);
  const puzzle = JINX_PUZZLES[safePuzzleId % JINX_PUZZLES.length];

  return {
    ...puzzle,
    puzzleId: safePuzzleId,
    date: new Date(JINX_EPOCH + safePuzzleId * 86400000)
  };
}

export function isMine(puzzle: JinxPuzzleData, row: number, column: number) {
  return puzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column);
}

export function getNeighborCells(row: number, column: number) {
  const neighbors: JinxCell[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;

      if (nextRow >= 0 && nextRow < JINX_ROWS && nextColumn >= 0 && nextColumn < JINX_COLUMNS) {
        neighbors.push([nextRow, nextColumn]);
      }
    }
  }

  return neighbors;
}

export function getAdjacentMineCount(puzzle: JinxPuzzleData, row: number, column: number) {
  return getNeighborCells(row, column).filter(([neighborRow, neighborColumn]) => isMine(puzzle, neighborRow, neighborColumn)).length;
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
      queue.push(...getNeighborCells(currentRow, currentColumn));
    }
  }

  return {
    ...state,
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

  for (let row = 0; row < JINX_ROWS; row += 1) {
    for (let column = 0; column < JINX_COLUMNS; column += 1) {
      const key = keyForCell(row, column);
      if (!revealed.has(key) && !flags.has(key) && !isMine(puzzle, row, column)) {
        return [row, column] as JinxCell;
      }
    }
  }

  return null;
}

export function getInitialSafeRevealCell(puzzle: JinxPuzzleData) {
  const centerRow = (JINX_ROWS - 1) / 2;
  const centerColumn = (JINX_COLUMNS - 1) / 2;
  const cells = Array.from({ length: JINX_ROWS * JINX_COLUMNS }, (_, index) => {
    const row = Math.floor(index / JINX_COLUMNS);
    const column = index % JINX_COLUMNS;
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

  return getSafeHintCell(puzzle, normalizeJinxPuzzleState(null));
}

export function createInitialJinxPuzzleState(puzzle: JinxPuzzleData) {
  const openingCell = getInitialSafeRevealCell(puzzle);
  if (!openingCell) {
    return normalizeJinxPuzzleState(null);
  }

  const openedState = revealFromCell(puzzle, normalizeJinxPuzzleState(null), openingCell[0], openingCell[1]);
  return {
    ...openedState,
    moveCount: 0
  };
}

export function isJinxSolved(_puzzle: JinxPuzzleData, state: JinxPuzzleState) {
  return !state.lost && state.revealed.length >= JINX_ROWS * JINX_COLUMNS - JINX_MINE_COUNT;
}
