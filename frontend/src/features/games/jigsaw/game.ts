import puzzles from "./puzzles.json";

export const JIGSAW_STORAGE_KEY = "jigsaw-state";
export const JIGSAW_TILE_COUNT = 16;
export const JIGSAW_EPOCH = Date.UTC(2026, 0, 1);

export type JigsawPuzzleData = {
  puzzleId: number;
  image: string;
  title: string;
  order: number[];
};

export type JigsawPuzzle = JigsawPuzzleData & {
  date: Date;
};

export type JigsawPuzzleState = {
  order: number[];
  hintUsed: boolean;
  moveCount: number;
  solved: boolean;
};

export type JigsawArchiveState = {
  puzzles: Record<string, JigsawPuzzleState>;
};

const JIGSAW_PUZZLES = puzzles as JigsawPuzzleData[];

export function normalizeJigsawState(puzzle: JigsawPuzzleData, value: unknown): JigsawPuzzleState {
  if (!value || typeof value !== "object") {
    return {
      order: [...puzzle.order],
      hintUsed: false,
      moveCount: 0,
      solved: isSolvedOrder(puzzle.order)
    };
  }

  const maybeState = value as Partial<JigsawPuzzleState>;
  const order =
    Array.isArray(maybeState.order) && maybeState.order.length === JIGSAW_TILE_COUNT
      ? maybeState.order.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry) && entry >= 0 && entry < JIGSAW_TILE_COUNT)
      : [...puzzle.order];

  const normalizedOrder = order.length === JIGSAW_TILE_COUNT && new Set(order).size === JIGSAW_TILE_COUNT ? order : [...puzzle.order];

  return {
    order: normalizedOrder,
    hintUsed: Boolean(maybeState.hintUsed),
    moveCount: Math.max(0, Number(maybeState.moveCount) || 0),
    solved: isSolvedOrder(normalizedOrder)
  };
}

export function getTodaysJigsawPuzzle(date = new Date()) {
  const puzzleId = Math.max(0, Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - JIGSAW_EPOCH) / 86400000));
  return getJigsawPuzzleById(puzzleId);
}

export function getJigsawPuzzleById(puzzleId: number): JigsawPuzzle {
  const safePuzzleId = Math.max(0, puzzleId);
  const puzzle = JIGSAW_PUZZLES[safePuzzleId % JIGSAW_PUZZLES.length];

  return {
    ...puzzle,
    puzzleId: safePuzzleId,
    date: new Date(JIGSAW_EPOCH + safePuzzleId * 86400000)
  };
}

export function isSolvedOrder(order: number[]) {
  return order.every((value, index) => value === index);
}

export function swapTiles(state: JigsawPuzzleState, first: number, second: number): JigsawPuzzleState {
  if (first === second || state.solved) {
    return state;
  }

  const order = [...state.order];
  [order[first], order[second]] = [order[second], order[first]];

  return {
    ...state,
    order,
    moveCount: state.moveCount + 1,
    solved: isSolvedOrder(order)
  };
}
