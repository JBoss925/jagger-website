import { describe, expect, it } from "vitest";
import {
  createInitialJinxPuzzleState,
  getAdjacentMineCount,
  getInitialSafeRevealCell,
  getJinxPuzzleById,
  getSafeHintCell,
  getTodaysJinxPuzzle,
  isJinxSolved,
  normalizeJinxPuzzleState,
  revealFromCell,
  toggleFlag
} from "./game";

describe("jinx helpers", () => {
  it("picks a stable daily puzzle", () => {
    const first = getTodaysJinxPuzzle(new Date("2026-04-07T12:00:00Z"));
    const second = getTodaysJinxPuzzle(new Date("2026-04-07T21:00:00Z"));

    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.mines).toEqual(second.mines);
  });

  it("derives adjacent clue counts", () => {
    const puzzle = getJinxPuzzleById(3);
    const [row, column] = puzzle.mines[0];
    const neighbor = [Math.max(0, row - 1), column] as const;

    expect(getAdjacentMineCount(puzzle, neighbor[0], neighbor[1])).toBeGreaterThanOrEqual(1);
  });

  it("flags without revealing", () => {
    const state = toggleFlag(normalizeJinxPuzzleState(null), 2, 2);
    expect(state.flags).toContainEqual([2, 2]);
    expect(state.revealed).toEqual([]);
  });

  it("loses immediately on a mine reveal", () => {
    const puzzle = getJinxPuzzleById(5);
    const [row, column] = puzzle.mines[0];
    const state = revealFromCell(puzzle, normalizeJinxPuzzleState(null), row, column);

    expect(state.lost).toBe(true);
  });

  it("can identify a safe hint cell", () => {
    const puzzle = getJinxPuzzleById(0);
    const hint = getSafeHintCell(puzzle, normalizeJinxPuzzleState(null));
    expect(hint).not.toBeNull();
  });

  it("migrates legacy hint usage to a hint count", () => {
    const state = normalizeJinxPuzzleState({
      revealed: [],
      flags: [],
      hintUsed: true,
      moveCount: 3,
      lost: false
    });

    expect(state.hintCount).toBe(1);
  });

  it("finds a safe opening cell with no adjacent mines when available", () => {
    const puzzle = getJinxPuzzleById(0);
    const openingCell = getInitialSafeRevealCell(puzzle);

    expect(openingCell).not.toBeNull();
    expect(openingCell).not.toBeUndefined();
    expect(getAdjacentMineCount(puzzle, openingCell![0], openingCell![1])).toBe(0);
  });

  it("prefers zero-adjacent opening cells closest to the board center", () => {
    const puzzle = getJinxPuzzleById(0);
    const openingCell = getInitialSafeRevealCell(puzzle);
    const center = 3.5;

    const zeroCells = Array.from({ length: 8 * 8 }, (_, index) => [Math.floor(index / 8), index % 8] as const).filter(
      ([row, column]) =>
        !puzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column) &&
        getAdjacentMineCount(puzzle, row, column) === 0
    );

    const openingDistance = (openingCell![0] - center) ** 2 + (openingCell![1] - center) ** 2;
    const bestDistance = Math.min(...zeroCells.map(([row, column]) => (row - center) ** 2 + (column - center) ** 2));

    expect(openingDistance).toBe(bestDistance);
  });

  it("starts a puzzle with a revealed safe region without spending a move", () => {
    const puzzle = getJinxPuzzleById(0);
    const state = createInitialJinxPuzzleState(puzzle);

    expect(state.lost).toBe(false);
    expect(state.moveCount).toBe(0);
    expect(state.revealed.length).toBeGreaterThan(0);
    expect(state.revealed.every(([row, column]) => !puzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column))).toBe(true);
  });

  it("recognizes solved boards", () => {
    const puzzle = getJinxPuzzleById(0);
    const safeCells = [];
    for (let row = 0; row < 8; row += 1) {
      for (let column = 0; column < 8; column += 1) {
        if (!puzzle.mines.some(([mineRow, mineColumn]) => mineRow === row && mineColumn === column)) {
          safeCells.push([row, column] as [number, number]);
        }
      }
    }

    expect(
      isJinxSolved(puzzle, {
        revealed: safeCells,
        flags: [],
        hintCount: 0,
        moveCount: safeCells.length,
        lost: false
      })
    ).toBe(true);
  });
});
