import { describe, expect, it } from "vitest";
import {
  getJigsawPuzzleById,
  getTodaysJigsawPuzzle,
  isSolvedOrder,
  normalizeJigsawState,
  swapTiles
} from "./game";

describe("jigsaw helpers", () => {
  it("picks a stable daily puzzle", () => {
    const first = getTodaysJigsawPuzzle(new Date("2026-04-07T12:00:00Z"));
    const second = getTodaysJigsawPuzzle(new Date("2026-04-07T21:00:00Z"));

    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.image).toBe(second.image);
    expect(first.order).toEqual(second.order);
  });

  it("normalizes saved state", () => {
    const puzzle = getJigsawPuzzleById(0);
    const state = normalizeJigsawState(puzzle, {
      order: puzzle.order,
      hintUsed: 1,
      moveCount: 4
    });

    expect(state.hintUsed).toBe(true);
    expect(state.moveCount).toBe(4);
  });

  it("swaps tiles and counts moves", () => {
    const puzzle = getJigsawPuzzleById(0);
    const initial = normalizeJigsawState(puzzle, null);
    const next = swapTiles(initial, 0, 1);

    expect(next.order[0]).toBe(initial.order[1]);
    expect(next.order[1]).toBe(initial.order[0]);
    expect(next.moveCount).toBe(1);
  });

  it("recognizes solved ordering", () => {
    expect(isSolvedOrder(Array.from({ length: 16 }, (_, index) => index))).toBe(true);
  });
});
