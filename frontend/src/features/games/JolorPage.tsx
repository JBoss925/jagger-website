import { useEffect, useMemo, useRef, useState } from "react";
import { usePageReveal } from "../../hooks/usePageReveal";
import GamesNavigation from "./GamesNavigation";
import { JolorIcon } from "./GameIcons";
import { formatGameDateLabel } from "./dateLabel";
import {
  clampRgbValue,
  getBestDistance,
  getGuessResult,
  getJolorPuzzleById,
  getTodaysJolorPuzzle,
  hexToRgb,
  JOLOR_MAX_GUESSES,
  JOLOR_STORAGE_KEY,
  normalizeHex,
  normalizeJolorPuzzleState,
  rgbToHex,
  type JolorArchiveState,
  type JolorPuzzleState
} from "./jolor/game";

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.25 9a2.75 2.75 0 1 1 4.73 1.91c-.82.8-1.48 1.37-1.48 2.59" />
      <path d="M12 17.2h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.75v3" />
      <path d="M16 3.75v3" />
      <path d="M4 9.5h16" />
      <path d="M8 13h8" />
    </svg>
  );
}

function readSavedArchive(): Record<string, JolorPuzzleState> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(JOLOR_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const saved = JSON.parse(raw) as JolorArchiveState;
    if (!saved || typeof saved !== "object" || typeof saved.puzzles !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(saved.puzzles).map(([puzzleId, value]) => [puzzleId, normalizeJolorPuzzleState(value)])
    );
  } catch {
    return {};
  }
}

function JolorPage() {
  const isPageReady = usePageReveal();
  const todaysPuzzle = useMemo(() => getTodaysJolorPuzzle(), []);
  const hasHandledInitialSummary = useRef(false);
  const [activePuzzleId, setActivePuzzleId] = useState(todaysPuzzle.puzzleId);
  const [archive, setArchive] = useState<Record<string, JolorPuzzleState>>(() => readSavedArchive());
  const [draftHex, setDraftHex] = useState("#808080");
  const [hexInput, setHexInput] = useState("#808080");
  const [validationMessage, setValidationMessage] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [hintCountdown, setHintCountdown] = useState<number | null>(null);
  const [isHintVisible, setIsHintVisible] = useState(false);

  const puzzle = useMemo(() => getJolorPuzzleById(activePuzzleId), [activePuzzleId]);
  const puzzleState = archive[String(activePuzzleId)] ?? { guesses: [], hintUsed: false };
  const guesses = puzzleState.guesses;
  const solved = guesses.some((guess) => (getGuessResult(guess, puzzle.hex)?.solved ?? false));
  const failed = !solved && guesses.length >= JOLOR_MAX_GUESSES;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: JolorArchiveState = { puzzles: archive };
    window.localStorage.setItem(JOLOR_STORAGE_KEY, JSON.stringify(payload));
  }, [archive]);

  useEffect(() => {
    const initialHex = guesses.at(-1) ?? "#808080";
    setDraftHex(initialHex);
    setHexInput(initialHex);
    setValidationMessage("");
    setIsHelpOpen(false);
    setIsArchiveOpen(false);
    setHintCountdown(null);
    setIsHintVisible(false);
  }, [activePuzzleId]);

  useEffect(() => {
    if (hasHandledInitialSummary.current) {
      return;
    }

    hasHandledInitialSummary.current = true;

    if (activePuzzleId === todaysPuzzle.puzzleId && (solved || failed) && guesses.length > 0) {
      setIsSummaryOpen(true);
    }
  }, [activePuzzleId, failed, guesses.length, solved, todaysPuzzle.puzzleId]);

  useEffect(() => {
    if (hintCountdown === null) {
      return;
    }

    if (hintCountdown === 0) {
      setIsHintVisible(true);
      const timeoutId = window.setTimeout(() => {
        setIsHintVisible(false);
        setHintCountdown(null);
      }, 1000);
      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      setHintCountdown((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [hintCountdown]);

  const puzzleDateLabel = useMemo(() => formatGameDateLabel(puzzle.date), [puzzle.date]);

  const guessResults = useMemo(
    () =>
      guesses
        .map((guess) => {
          const result = getGuessResult(guess, puzzle.hex);
          if (!result) {
            return null;
          }

          return {
            guess,
            ...result
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [guesses, puzzle.hex]
  );

  const bestDistance = useMemo(() => getBestDistance(guesses, puzzle.hex), [guesses, puzzle.hex]);
  const latestDistance = guessResults.at(-1)?.distance ?? null;
  const normalizedDraftHex = normalizeHex(hexInput);
  const lastGuessHex = guesses.at(-1) ?? null;
  const isSameAsLastGuess = Boolean(normalizedDraftHex && lastGuessHex && normalizedDraftHex === lastGuessHex);
  const isComplete = solved || failed;
  const previewHex = isHintVisible || isComplete ? puzzle.hex : draftHex;
  const previewLabel = isHintVisible ? null : isComplete ? "Actual color" : "Current guess";
  const previewHeading = isHintVisible ? "Hint reveal" : isComplete ? puzzle.name : draftHex;
  const previewCopy = isHintVisible
    ? `${puzzle.name} · ${puzzle.hex}`
    : isComplete
      ? puzzle.hex
      : "Adjust the color visually, or fine-tune it with the numeric controls.";
  const status = useMemo(() => {
    if (solved) {
      return `Solved in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}.`;
    }

    if (failed) {
      return "Out of guesses.";
    }

    if (hintCountdown !== null && hintCountdown > 0) {
      return `Hint in ${hintCountdown}…`;
    }

    if (isHintVisible) {
      return "Hint live. Watch the target swatch.";
    }

    if (validationMessage) {
      return validationMessage;
    }

    if (latestDistance !== null) {
      return `Best distance so far: ${Math.round(bestDistance ?? latestDistance)}.`;
    }

    return "Dial in a color and get within 32 RGB points.";
  }, [bestDistance, failed, guesses.length, hintCountdown, isHintVisible, latestDistance, puzzle.name, solved, validationMessage]);

  const summaryStats = useMemo(() => {
    const solvedResult = guessResults.find((entry) => entry.solved);
    const finalDistance = solvedResult?.distance ?? latestDistance ?? null;
    const percentMatch = finalDistance === null ? 0 : Math.max(0, Math.round((1 - finalDistance / 441.673) * 100));

    return {
      attemptsUsed: guesses.length,
      bestDistance: bestDistance === null ? null : Math.round(bestDistance),
      finalDistance: finalDistance === null ? null : Math.round(finalDistance),
      percentMatch,
      guessesRemaining: Math.max(0, JOLOR_MAX_GUESSES - guesses.length)
    };
  }, [bestDistance, guessResults, guesses.length, latestDistance]);

  const archiveEntries = useMemo(() => {
    const entries = [];
    for (let id = todaysPuzzle.puzzleId; id >= 0; id -= 1) {
      const archiveEntry = archive[String(id)] ?? { guesses: [], hintUsed: false };
      const target = getJolorPuzzleById(id);
      const entrySolved = archiveEntry.guesses.some(
        (guess) => getGuessResult(guess, target.hex)?.solved ?? false
      );
      const entryFailed = !entrySolved && archiveEntry.guesses.length >= JOLOR_MAX_GUESSES;

      entries.push({
        puzzleId: id,
        label: `Puzzle #${id + 1}`,
        dateLabel: formatGameDateLabel(target.date),
        solved: entrySolved,
        failed: entryFailed,
        guesses: archiveEntry.guesses.length,
        targetName: target.name
      });
    }
    return entries;
  }, [archive, todaysPuzzle.puzzleId]);

  function updateDraftFromHex(nextHex: string) {
    const normalized = normalizeHex(nextHex);
    setHexInput(nextHex.toUpperCase());
    if (normalized) {
      setDraftHex(normalized);
    }
  }

  function updateDraftFromRgb(red: number, green: number, blue: number) {
    const nextHex = rgbToHex(red, green, blue);
    setDraftHex(nextHex);
    setHexInput(nextHex);
  }

  function submitGuess() {
    if (solved || failed || isSameAsLastGuess) {
      return;
    }

    const normalized = normalizeHex(hexInput);
    if (!normalized) {
      setValidationMessage("Use a full six-digit hex color.");
      return;
    }

    const nextGuesses = [...guesses, normalized];

    setArchive((current) => ({
      ...current,
      [String(activePuzzleId)]: {
        guesses: nextGuesses,
        hintUsed: puzzleState.hintUsed
      }
    }));
    setDraftHex(normalized);
    setHexInput(normalized);
    setValidationMessage("");

    const result = getGuessResult(normalized, puzzle.hex);
    if (result?.solved || nextGuesses.length >= JOLOR_MAX_GUESSES) {
      setIsSummaryOpen(true);
    }
  }

  function activateHint() {
    if (puzzleState.hintUsed || solved || failed || hintCountdown !== null || isHintVisible) {
      return;
    }

    setArchive((current) => ({
      ...current,
      [String(activePuzzleId)]: {
        guesses,
        hintUsed: true
      }
    }));
    setHintCountdown(3);
  }

  const draftRgb = hexToRgb(draftHex) ?? [128, 128, 128];

  return (
    <div
      className={
        isPageReady
          ? "page-shell page-shell--ready games-page"
          : "page-shell page-shell--entering games-page"
      }
    >
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>

      <GamesNavigation />

      <main className="content-shell games-shell">
        <section className="games-hero jolor-hero">
          <span className="section-heading__eyebrow">Daily game</span>
          <div className="jolor-hero__title-row">
            <div className="games-card__icon games-card__icon--jolor jolor-hero__icon" aria-hidden="true">
              <JolorIcon />
            </div>
            <h1>Jolor</h1>
          </div>
          <p>You get the color name, not the swatch, and eight guesses to find it.</p>
        </section>

        <section className="jolor-layout">
          <article className="glass-card jolor-board-card">
            <div className="jolor-board-card__header">
              <div className="jolor-board-card__title-row">
                <div>
                  <span className="section-heading__eyebrow">Puzzle #{puzzle.puzzleId + 1}</span>
                  <h2>{puzzle.name}</h2>
                </div>
                <div className="jordle-board-card__actions">
                  <button
                    type="button"
                    className="jordle-help-button"
                    aria-label="Open Jolor archive"
                    onClick={() => setIsArchiveOpen(true)}
                  >
                    <span className="jordle-help-button__icon">
                      <ArchiveIcon />
                    </span>
                    <span className="jordle-help-button__tooltip" role="tooltip">
                      Archive
                    </span>
                  </button>
                  <button
                    type="button"
                    className="jordle-help-button"
                    aria-label="How to play Jolor"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    <span className="jordle-help-button__icon">
                      <HelpIcon />
                    </span>
                    <span className="jordle-help-button__tooltip" role="tooltip">
                      How to play
                    </span>
                  </button>
                </div>
              </div>
              <p>
                {puzzleDateLabel}
                <span className="jordle-board-card__meta-divider">·</span>
                {status}
              </p>
            </div>

            <div className="jolor-preview">
              <div className="jolor-preview__surface" style={{ backgroundColor: previewHex }}>
                {hintCountdown !== null && hintCountdown > 0 ? (
                  <span className="jolor-preview__countdown">{hintCountdown}</span>
                ) : previewLabel ? (
                  <span className="jolor-preview__label">{previewLabel}</span>
                ) : null}
              </div>
              <div className="jolor-preview__meta">
                <strong>{previewHeading}</strong>
                <span>{previewCopy}</span>
              </div>
            </div>

            <div className="jolor-controls">
              <label className="jolor-control jolor-control--picker">
                <span>Color</span>
                <input
                  type="color"
                  value={draftHex}
                  onChange={(event) => updateDraftFromHex(event.target.value)}
                />
              </label>

              <label className="jolor-control">
                <span>R</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={draftRgb[0]}
                  onChange={(event) =>
                    updateDraftFromRgb(
                      clampRgbValue(Number(event.target.value || 0)),
                      draftRgb[1],
                      draftRgb[2]
                    )
                  }
                />
              </label>

              <label className="jolor-control">
                <span>G</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={draftRgb[1]}
                  onChange={(event) =>
                    updateDraftFromRgb(
                      draftRgb[0],
                      clampRgbValue(Number(event.target.value || 0)),
                      draftRgb[2]
                    )
                  }
                />
              </label>

              <label className="jolor-control">
                <span>B</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={draftRgb[2]}
                  onChange={(event) =>
                    updateDraftFromRgb(
                      draftRgb[0],
                      draftRgb[1],
                      clampRgbValue(Number(event.target.value || 0))
                    )
                  }
                />
              </label>

              <label className="jolor-control jolor-control--hex">
                <span>Hex</span>
                <input
                  type="text"
                  value={hexInput}
                  maxLength={7}
                  spellCheck={false}
                  onChange={(event) => updateDraftFromHex(event.target.value)}
                />
              </label>
            </div>

            <div className="jolor-actions">
              <button
                type="button"
                className="cta-button cta-button--secondary"
                onClick={activateHint}
                disabled={puzzleState.hintUsed || solved || failed || hintCountdown !== null || isHintVisible}
              >
                {puzzleState.hintUsed ? "Hint used" : "Use hint"}
              </button>
              <button
                type="button"
                className="cta-button"
                onClick={submitGuess}
                disabled={solved || failed || isSameAsLastGuess}
              >
                Submit guess
              </button>
            </div>

            <div className="jolor-guess-list" aria-label="Jolor guesses">
              {guessResults.map((entry, index) => {
                const previousDistance = index > 0 ? guessResults[index - 1]?.distance ?? null : null;
                const trend =
                  previousDistance === null
                    ? "First guess"
                    : entry.distance < previousDistance
                      ? "Warmer"
                      : entry.distance > previousDistance
                        ? "Colder"
                        : "Same";

                return (
                  <div key={`${entry.guess}-${index}`} className="jolor-guess-card">
                    <div className="jolor-guess-card__swatch" style={{ backgroundColor: entry.guess }} aria-hidden="true" />
                    <div className="jolor-guess-card__copy">
                      <strong>{entry.guess}</strong>
                      <span>
                        RGB {entry.guessRgb[0]}, {entry.guessRgb[1]}, {entry.guessRgb[2]}
                      </span>
                    </div>
                    <div className="jolor-guess-card__meta">
                      <strong>{Math.round(entry.distance)}</strong>
                      <span>{entry.solved ? "Solved" : trend}</span>
                    </div>
                  </div>
                );
              })}

              {guesses.length === 0 ? (
                <div className="jolor-empty-state">
                  No guesses yet. Use the target name as your only clue and start tuning.
                </div>
              ) : null}
            </div>
          </article>
        </section>
      </main>

      {isHelpOpen ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jolor-help-title" onClick={() => setIsHelpOpen(false)}>
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">How to play</span>
                <h2 id="jolor-help-title">Jolor rules</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jolor help" onClick={() => setIsHelpOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>You get the name of a color and eight guesses to match it closely enough.</p>
              <p>Use the color picker, RGB values, or hex field to build a guess, then submit it.</p>
              <p>A guess counts as solved when it lands within 32 RGB points of the target color.</p>
              <p>You can use one hint per puzzle. After a 3-second countdown, the true color flashes for one second.</p>
            </div>
          </div>
        </div>
      ) : null}

      {isArchiveOpen ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jolor-archive-title" onClick={() => setIsArchiveOpen(false)}>
          <div className="glass-card jordle-modal__card jordle-archive-modal" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">Archive</span>
                <h2 id="jolor-archive-title">Previous Jolors</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jolor archive" onClick={() => setIsArchiveOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>Open any earlier color to review it or keep guessing where you left off.</p>
              <div className="jordle-archive-list">
                {archiveEntries.map((entry) => (
                  <button
                    key={entry.puzzleId}
                    type="button"
                    className={`jordle-archive-item ${entry.puzzleId === activePuzzleId ? "is-active" : ""}`}
                    onClick={() => {
                      setActivePuzzleId(entry.puzzleId);
                      setIsArchiveOpen(false);
                    }}
                  >
                    <div>
                      <strong>{entry.label}</strong>
                      <span>{entry.dateLabel}</span>
                    </div>
                    <div className="jordle-archive-item__meta jolor-archive-item__meta">
                      <span>{entry.targetName}</span>
                      {entry.solved ? (
                        <span className="jordle-archive-chip is-solved">Solved</span>
                      ) : entry.failed ? (
                        <span className="jordle-archive-chip is-failed">Finished</span>
                      ) : entry.guesses > 0 ? (
                        <span className="jordle-archive-chip is-progress">{entry.guesses}/8 guesses</span>
                      ) : (
                        <span className="jordle-archive-chip">Unplayed</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isSummaryOpen && (solved || failed) ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jolor-summary-title" onClick={() => setIsSummaryOpen(false)}>
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">{solved ? "Puzzle solved" : "Puzzle complete"}</span>
                <h2 id="jolor-summary-title">{solved ? "You found it." : "Close, but not quite."}</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jolor summary" onClick={() => setIsSummaryOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>
                {solved
                  ? `You solved ${puzzle.name} in ${summaryStats.attemptsUsed} ${summaryStats.attemptsUsed === 1 ? "guess" : "guesses"}.`
                  : `You used all ${JOLOR_MAX_GUESSES} guesses on ${puzzle.name}.`}
              </p>
              <div className="jordle-summary-grid">
                <div className="jordle-summary-stat">
                  <span>Attempts used</span>
                  <strong>{summaryStats.attemptsUsed}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Best distance</span>
                  <strong>{summaryStats.bestDistance ?? "—"}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Match</span>
                  <strong>{summaryStats.percentMatch}%</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Hint</span>
                  <strong>{puzzleState.hintUsed ? "Used" : "Unused"}</strong>
                </div>
              </div>
              <div className="jolor-summary-answer">
                <div className="jolor-summary-answer__swatch" style={{ backgroundColor: puzzle.hex }} aria-hidden="true" />
                <div>
                  <strong>{puzzle.name}</strong>
                  <span>{puzzle.hex}</span>
                </div>
              </div>
              {!solved ? (
                <p>
                  The answer was <strong>{puzzle.name}</strong> at <strong>{puzzle.hex}</strong>.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default JolorPage;
