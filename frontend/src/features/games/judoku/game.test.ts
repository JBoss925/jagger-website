import { describe, expect, it } from "vitest";
import {
  getFilledCount,
  getJudokuHintCell,
  getJudokuPuzzleById,
  getTodaysJudokuPuzzle,
  hasDuplicate,
  isCellInvalid,
  normalizeJudokuState,
  setCellValue,
  toggleCellNote
} from "./game";

describe("judoku helpers", () => {
  it("picks a stable daily puzzle", () => {
    const first = getTodaysJudokuPuzzle(new Date("2026-04-07T12:00:00Z"));
    const second = getTodaysJudokuPuzzle(new Date("2026-04-07T21:00:00Z"));

    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.solution).toEqual(second.solution);
  });

  it("tracks notes separately from values", () => {
    const puzzle = getJudokuPuzzleById(0);
    const state = toggleCellNote(puzzle, normalizeJudokuState(puzzle, null), 0, 1, "3");
    expect(state.notes["0:1"]).toEqual(["3"]);
  });

  it("fills cells and detects solved boards", () => {
    const puzzle = getJudokuPuzzleById(0);
    let state = normalizeJudokuState(puzzle, null);

    for (let row = 0; row < 6; row += 1) {
      for (let column = 0; column < 6; column += 1) {
        if (puzzle.givens[row][column] === "0") {
          state = setCellValue(puzzle, state, row, column, puzzle.solution[row][column]);
        }
      }
    }

    expect(state.solved).toBe(true);
    expect(getFilledCount(state)).toBe(36);
  });

  it("highlights duplicates", () => {
    expect(hasDuplicate(["1", "2", "2", "0"])).toBe(true);
  });

  it("marks invalid cells when duplicates exist", () => {
    const puzzle = getJudokuPuzzleById(0);
    let state = normalizeJudokuState(puzzle, null);
    state = setCellValue(puzzle, state, 0, 1, "2");
    state = setCellValue(puzzle, state, 0, 4, "2");
    expect(isCellInvalid(state, 0, 1)).toBe(true);
  });

  it("returns a hint cell", () => {
    const puzzle = getJudokuPuzzleById(0);
    const hint = getJudokuHintCell(puzzle, normalizeJudokuState(puzzle, null));
    expect(hint).not.toBeNull();
  });
});
