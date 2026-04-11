import { describe, expect, it } from "vitest";
import { evaluateGuess, getTodaysJordlePuzzle, isValidJordleGuess, mergeKeyboardState } from "./game";

describe("jordle helpers", () => {
  it("picks a stable daily puzzle", () => {
    const first = getTodaysJordlePuzzle(new Date("2026-04-07T12:00:00Z"));
    const second = getTodaysJordlePuzzle(new Date("2026-04-07T21:00:00Z"));

    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.answer).toBe(second.answer);
  });

  it("requires guesses to be valid six-letter dictionary words", () => {
    expect(isValidJordleGuess("planet")).toBe(true);
    expect(isValidJordleGuess("abc")).toBe(false);
    expect(isValidJordleGuess("zzzzzz")).toBe(false);
  });

  it("evaluates repeated letters correctly", () => {
    expect(evaluateGuess("little", "linear").map((entry) => entry.state)).toEqual([
      "correct",
      "correct",
      "miss",
      "miss",
      "miss",
      "present"
    ]);
  });

  it("merges keyboard state by priority", () => {
    const merged = mergeKeyboardState(
      { l: "miss" },
      [
        { char: "l", state: "present" },
        { char: "i", state: "correct" }
      ]
    );

    expect(merged.l).toBe("present");
    expect(merged.i).toBe("correct");
  });
});
