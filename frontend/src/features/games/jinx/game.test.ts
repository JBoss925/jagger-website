import { describe, expect, it } from "vitest";
import {
  getAdjacentMineCount,
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
        hintUsed: false,
        moveCount: safeCells.length,
        lost: false
      })
    ).toBe(true);
  });
});
