import { describe, expect, it } from "vitest";
import { formatGameDateLabel } from "./dateLabel";

describe("formatGameDateLabel", () => {
  it("keeps UTC-based puzzle dates on the intended calendar day", () => {
    expect(formatGameDateLabel(new Date(Date.UTC(2026, 3, 10)))).toBe("Apr 10, 2026");
  });
});
