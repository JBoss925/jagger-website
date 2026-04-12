import { describe, expect, it } from "vitest";
import {
  colorDistance,
  getJolorPuzzleById,
  getTodaysJolorPuzzle,
  hexToRgb,
  isSolvedGuess,
  normalizeHex,
  normalizeJolorPuzzleState,
  rgbToHex
} from "./game";

describe("jolor helpers", () => {
  it("picks a stable daily puzzle", () => {
    const first = getTodaysJolorPuzzle(new Date("2026-04-07T12:00:00Z"));
    const second = getTodaysJolorPuzzle(new Date("2026-04-07T21:00:00Z"));

    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.name).toBe(second.name);
    expect(first.hex).toBe(second.hex);
  });

  it("normalizes hex and rgb conversions", () => {
    expect(normalizeHex(" 00ff7a ")).toBe("#00FF7A");
    expect(hexToRgb("#00FF7A")).toEqual([0, 255, 122]);
    expect(rgbToHex(0, 255, 122)).toBe("#00FF7A");
  });

  it("uses rgb distance threshold for solved guesses", () => {
    expect(isSolvedGuess("#000000", "#000020")).toBe(true);
    expect(isSolvedGuess("#000000", "#000021")).toBe(false);
  });

  it("computes distance correctly", () => {
    expect(colorDistance([0, 0, 0], [0, 0, 24])).toBe(24);
  });

  it("normalizes saved puzzle state", () => {
    expect(
      normalizeJolorPuzzleState({
        guesses: ["#ffffff", "bad", "#000000"],
        hintUsed: 1
      })
    ).toEqual({
      guesses: ["#FFFFFF", "#000000"],
      hintUsed: true
    });
  });

  it("returns a color puzzle by id", () => {
    const puzzle = getJolorPuzzleById(12);
    expect(puzzle.puzzleId).toBe(12);
    expect(puzzle.hex).toMatch(/^#[0-9A-F]{6}$/);
    expect(puzzle.name.length).toBeGreaterThan(0);
  });
});
