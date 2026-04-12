import { describe, expect, it } from "vitest";
import {
  createInitialJinxPuzzleState,
  getAdjacentMineCount,
  getInitialSafeRevealCell,
  getJinxArchiveKey,
  getJinxDifficultyFromArchiveKey,
  getJinxPuzzleById,
  getSafeHintCell,
  getTodaysJinxPuzzle,
  isJinxSolved,
  normalizeJinxPuzzleState,
  revealFromCell,
  toggleFlag
} from "./game";

describe("jinx helpers", () => {
  it("picks a stable daily easy puzzle", () => {
    const first = getTodaysJinxPuzzle(new Date("2026-04-07T12:00:00Z"), "easy");
    const second = getTodaysJinxPuzzle(new Date("2026-04-07T21:00:00Z"), "easy");

    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.mines).toEqual(second.mines);
  });

  it("builds a stable daily hard puzzle", () => {
    const first = getTodaysJinxPuzzle(new Date("2026-04-07T12:00:00Z"), "hard");
    const second = getTodaysJinxPuzzle(new Date("2026-04-07T21:00:00Z"), "hard");

    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.mines).toEqual(second.mines);
    expect(first.rows).toBe(16);
    expect(first.columns).toBe(16);
    expect(first.mineCount).toBe(40);
  });

  it("derives adjacent clue counts", () => {
    const puzzle = getJinxPuzzleById(3, "easy");
    const [row, column] = puzzle.mines[0];
    const neighbor = [Math.max(0, row - 1), column] as const;

    expect(getAdjacentMineCount(puzzle, neighbor[0], neighbor[1])).toBeGreaterThanOrEqual(1);
  });

  it("flags without revealing", () => {
    const state = toggleFlag(normalizeJinxPuzzleState(null, "easy"), 2, 2);
    expect(state.flags).toContainEqual([2, 2]);
    expect(state.revealed).toEqual([]);
  });

  it("loses immediately on a mine reveal", () => {
    const puzzle = getJinxPuzzleById(5, "easy");
    const [row, column] = puzzle.mines[0];
    const state = revealFromCell(puzzle, normalizeJinxPuzzleState(null, "easy"), row, column);

    expect(state.lost).toBe(true);
  });

  it("can identify a safe hint cell on both difficulties", () => {
    const easyPuzzle = getJinxPuzzleById(0, "easy");
    const hardPuzzle = getJinxPuzzleById(0, "hard");

    expect(getSafeHintCell(easyPuzzle, normalizeJinxPuzzleState(null, "easy"))).not.toBeNull();
    expect(getSafeHintCell(hardPuzzle, normalizeJinxPuzzleState(null, "hard"))).not.toBeNull();
  });

  it("chooses hint cells from the full safe pool instead of scanning top left first", () => {
    const puzzle = getJinxPuzzleById(0, "easy");
    const state = normalizeJinxPuzzleState(
      {
        revealed: [[0, 0]],
        flags: [[0, 1]],
        hintCount: 0,
        moveCount: 0,
        lost: false
      },
      "easy"
    );
    const safeCells = Array.from({ length: puzzle.rows * puzzle.columns }, (_, index) => {
      const row = Math.floor(index / puzzle.columns);
      const column = index % puzzle.columns;
      return [row, column] as const;
    }).filter(([row, column]) => {
      return (
        !state.revealed.some(([revealedRow, revealedColumn]) => revealedRow === row && revealedColumn === column) &&
        !state.flags.some(([flagRow, flagColumn]) => flagRow === row && flagColumn === column) &&
        !puzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column)
      );
    });

    const originalRandom = Math.random;
    Math.random = () => 0.999999;

    try {
      const hintCell = getSafeHintCell(puzzle, state);
      expect(hintCell).not.toBeNull();
      expect(hintCell).toEqual(safeCells[safeCells.length - 1]);
    } finally {
      Math.random = originalRandom;
    }
  });

  it("migrates legacy hint usage to a hint count", () => {
    const state = normalizeJinxPuzzleState(
      {
        revealed: [],
        flags: [],
        hintUsed: true,
        moveCount: 3,
        lost: false
      },
      "easy"
    );

    expect(state.hintCount).toBe(1);
  });

  it("encodes archive keys by difficulty", () => {
    expect(getJinxArchiveKey("easy", 12)).toBe("easy:12");
    expect(getJinxArchiveKey("hard", 12)).toBe("hard:12");
    expect(getJinxDifficultyFromArchiveKey("17")).toBe("easy");
    expect(getJinxDifficultyFromArchiveKey("hard:17")).toBe("hard");
  });

  it("finds a central safe opening cell with no adjacent mines when available", () => {
    const puzzle = getJinxPuzzleById(0, "easy");
    const openingCell = getInitialSafeRevealCell(puzzle);
    const center = (puzzle.rows - 1) / 2;
    const zeroCells = Array.from({ length: puzzle.rows * puzzle.columns }, (_, index) => [Math.floor(index / puzzle.columns), index % puzzle.columns] as const).filter(
      ([row, column]) =>
        !puzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column) &&
        getAdjacentMineCount(puzzle, row, column) === 0
    );

    expect(openingCell).not.toBeNull();
    expect(getAdjacentMineCount(puzzle, openingCell![0], openingCell![1])).toBe(0);

    const openingDistance = (openingCell![0] - center) ** 2 + (openingCell![1] - center) ** 2;
    const bestDistance = Math.min(...zeroCells.map(([row, column]) => (row - center) ** 2 + (column - center) ** 2));

    expect(openingDistance).toBe(bestDistance);
  });

  it("starts both difficulties with a revealed safe region without spending a move", () => {
    const easyPuzzle = getJinxPuzzleById(0, "easy");
    const hardPuzzle = getJinxPuzzleById(0, "hard");
    const easyState = createInitialJinxPuzzleState(easyPuzzle);
    const hardState = createInitialJinxPuzzleState(hardPuzzle);

    expect(easyState.lost).toBe(false);
    expect(easyState.moveCount).toBe(0);
    expect(easyState.revealed.length).toBeGreaterThan(0);
    expect(easyState.revealed.every(([row, column]) => !easyPuzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column))).toBe(true);

    expect(hardState.lost).toBe(false);
    expect(hardState.moveCount).toBe(0);
    expect(hardState.revealed.length).toBeGreaterThan(0);
    expect(hardState.revealed.every(([row, column]) => !hardPuzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column))).toBe(true);
  });

  it("recognizes solved boards for each difficulty", () => {
    const easyPuzzle = getJinxPuzzleById(0, "easy");
    const hardPuzzle = getJinxPuzzleById(0, "hard");
    const easySafeCells = [];
    const hardSafeCells = [];

    for (let row = 0; row < easyPuzzle.rows; row += 1) {
      for (let column = 0; column < easyPuzzle.columns; column += 1) {
        if (!easyPuzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column)) {
          easySafeCells.push([row, column] as [number, number]);
        }
      }
    }

    for (let row = 0; row < hardPuzzle.rows; row += 1) {
      for (let column = 0; column < hardPuzzle.columns; column += 1) {
        if (!hardPuzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column)) {
          hardSafeCells.push([row, column] as [number, number]);
        }
      }
    }

    expect(
      isJinxSolved(easyPuzzle, {
        revealed: easySafeCells,
        flags: [],
        hintCount: 0,
        moveCount: easySafeCells.length,
        lost: false
      })
    ).toBe(true);

    expect(
      isJinxSolved(hardPuzzle, {
        revealed: hardSafeCells,
        flags: [],
        hintCount: 0,
        moveCount: hardSafeCells.length,
        lost: false
      })
    ).toBe(true);
  });
});
