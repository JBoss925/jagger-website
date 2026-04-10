import { useEffect, useMemo, useState } from "react";
import { JinxIcon } from "./GameIcons";
import GamesNavigation from "./GamesNavigation";
import { usePageReveal } from "../../hooks/usePageReveal";
import {
  getAdjacentMineCount,
  getJinxPuzzleById,
  getSafeHintCell,
  getTodaysJinxPuzzle,
  isJinxSolved,
  isMine,
  normalizeJinxPuzzleState,
  revealFromCell,
  toggleFlag,
  type JinxArchiveState,
  type JinxCell,
  type JinxPuzzleState,
  JINX_COLUMNS,
  JINX_ROWS,
  JINX_STORAGE_KEY
} from "./jinx/game";

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

function readSavedArchive() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(JINX_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const saved = JSON.parse(raw) as JinxArchiveState;
    if (!saved.puzzles || typeof saved.puzzles !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(saved.puzzles).map(([key, state]) => [key, normalizeJinxPuzzleState(state)])
    );
  } catch {
    return {};
  }
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function cellEquals(first: JinxCell | null, second: JinxCell | null) {
  return Boolean(first && second && first[0] === second[0] && first[1] === second[1]);
}

function JinxPage() {
  const isPageReady = usePageReveal();
  const todaysPuzzle = useMemo(() => getTodaysJinxPuzzle(), []);
  const initialArchive = useMemo(() => readSavedArchive(), []);
  const initialTodayState = initialArchive[String(todaysPuzzle.puzzleId)] ?? normalizeJinxPuzzleState(null);
  const initialTodaySolved = isJinxSolved(todaysPuzzle, initialTodayState);
  const initialTodayFailed = initialTodayState.lost;
  const [activePuzzleId, setActivePuzzleId] = useState(todaysPuzzle.puzzleId);
  const [archive, setArchive] = useState<Record<string, JinxPuzzleState>>(initialArchive);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(initialTodaySolved || initialTodayFailed);
  const [mode, setMode] = useState<"reveal" | "flag">("reveal");
  const [hintCell, setHintCell] = useState<JinxCell | null>(null);

  const puzzle = useMemo(() => getJinxPuzzleById(activePuzzleId), [activePuzzleId]);
  const puzzleState = archive[String(activePuzzleId)] ?? normalizeJinxPuzzleState(null);
  const solved = isJinxSolved(puzzle, puzzleState);
  const failed = puzzleState.lost;
  const puzzleNumber = puzzle.puzzleId + 1;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: JinxArchiveState = { puzzles: archive };
    window.localStorage.setItem(JINX_STORAGE_KEY, JSON.stringify(payload));
  }, [archive]);

  function setPuzzleState(nextState: JinxPuzzleState) {
    setArchive((current) => ({
      ...current,
      [String(activePuzzleId)]: nextState
    }));
  }

  function handleCellPress(row: number, column: number) {
    if (solved || failed) {
      return;
    }

    const nextState =
      mode === "flag"
        ? toggleFlag(puzzleState, row, column)
        : revealFromCell(puzzle, puzzleState, row, column);

    setPuzzleState(nextState);

    if (nextState.lost || isJinxSolved(puzzle, nextState)) {
      setIsSummaryOpen(true);
    }
  }

  function activateHint() {
    if (puzzleState.hintUsed || solved || failed) {
      return;
    }

    const nextHintCell = getSafeHintCell(puzzle, puzzleState);
    if (!nextHintCell) {
      return;
    }

    setHintCell(nextHintCell);
    setPuzzleState({
      ...puzzleState,
      hintUsed: true
    });

    window.setTimeout(() => {
      setHintCell(null);
    }, 2000);
  }

  const status = solved
    ? "Board cleared."
    : failed
      ? "You hit a mine."
      : mode === "flag"
        ? "Flag mode on."
        : "Reveal mode on.";

  const archiveEntries = useMemo(() => {
    return Array.from({ length: todaysPuzzle.puzzleId + 1 }, (_, puzzleId) => {
      const entryPuzzle = getJinxPuzzleById(puzzleId);
      const entryState = archive[String(puzzleId)] ?? normalizeJinxPuzzleState(null);
      const entrySolved = isJinxSolved(entryPuzzle, entryState);
      const entryFailed = entryState.lost;

      return {
        puzzleId,
        label: `Puzzle #${puzzleId + 1}`,
        dateLabel: formatDateLabel(entryPuzzle.date),
        solved: entrySolved,
        failed: entryFailed,
        moves: entryState.moveCount,
        hintUsed: entryState.hintUsed
      };
    }).reverse();
  }, [archive, todaysPuzzle.puzzleId]);

  const summaryStats = {
    revealed: puzzleState.revealed.length,
    flags: puzzleState.flags.length,
    moves: puzzleState.moveCount,
    hint: puzzleState.hintUsed ? "Used" : "Unused"
  };

  return (
    <div
      className={
        isPageReady ? "page-shell page-shell--ready games-page" : "page-shell page-shell--entering games-page"
      }
    >
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>

      <GamesNavigation />

      <main className="content-shell games-shell">
        <section className="games-hero jordle-hero">
          <span className="section-heading__eyebrow">Daily game</span>
          <div className="jordle-hero__title-row">
            <div className="games-card__icon games-card__icon--jinx jordle-hero__icon" aria-hidden="true">
              <JinxIcon />
            </div>
            <h1>Jinx</h1>
          </div>
          <p>A daily minefield puzzle with no guessing if you read the board carefully.</p>
        </section>

        <section className="jinx-layout">
          <article className="glass-card jinx-board-card">
            <div className="jordle-board-card__header">
              <div className="jordle-board-card__title-row">
                <div>
                  <span className="section-heading__eyebrow">Puzzle #{puzzleNumber}</span>
                  <h2>{solved ? "Board cleared" : failed ? "Boom." : "Minefield"}</h2>
                </div>
                <div className="jordle-board-card__actions">
                  <button type="button" className="jordle-help-button" aria-label="Open Jinx archive" onClick={() => setIsArchiveOpen(true)}>
                    <span className="jordle-help-button__icon">
                      <ArchiveIcon />
                    </span>
                    <span className="jordle-help-button__tooltip" role="tooltip">
                      Archive
                    </span>
                  </button>
                  <button type="button" className="jordle-help-button" aria-label="How to play Jinx" onClick={() => setIsHelpOpen(true)}>
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
                {formatDateLabel(puzzle.date)}
                <span className="jordle-board-card__meta-divider">·</span>
                {status}
              </p>
            </div>

            <div className="jinx-controls">
              <div className="jinx-mode-toggle" role="tablist" aria-label="Jinx input mode">
                <button type="button" className={mode === "reveal" ? "is-active" : ""} onClick={() => setMode("reveal")}>
                  Reveal
                </button>
                <button type="button" className={mode === "flag" ? "is-active" : ""} onClick={() => setMode("flag")}>
                  Flag
                </button>
              </div>
              <button
                type="button"
                className="cta-button cta-button--secondary"
                onClick={activateHint}
                disabled={puzzleState.hintUsed || solved || failed}
              >
                {puzzleState.hintUsed ? "Hint used" : "Use hint"}
              </button>
            </div>

            <div className="jinx-board" role="grid" aria-label="Jinx board">
              {Array.from({ length: JINX_ROWS }, (_, row) => (
                <div key={row} className="jinx-board__row" role="row">
                  {Array.from({ length: JINX_COLUMNS }, (_, column) => {
                    const isRevealed = puzzleState.revealed.some(([r, c]) => r === row && c === column);
                    const isFlagged = puzzleState.flags.some(([r, c]) => r === row && c === column);
                    const isHinted = cellEquals(hintCell, [row, column]);
                    const mine = isMine(puzzle, row, column);
                    const shouldShowMine = failed && mine;
                    const adjacentCount = isRevealed && !mine ? getAdjacentMineCount(puzzle, row, column) : 0;
                    const className = [
                      "jinx-cell",
                      isRevealed ? "is-revealed" : "",
                      isFlagged ? "is-flagged" : "",
                      shouldShowMine ? "is-mine" : "",
                      isHinted ? "is-hinted" : ""
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={`${row}-${column}`}
                        type="button"
                        className={className}
                        onClick={() => handleCellPress(row, column)}
                        aria-label={`Row ${row + 1} column ${column + 1}`}
                      >
                        {isFlagged ? "!" : shouldShowMine ? "×" : adjacentCount > 0 ? adjacentCount : ""}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>

      {isHelpOpen ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jinx-help-title" onClick={() => setIsHelpOpen(false)}>
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">How to play</span>
                <h2 id="jinx-help-title">Jinx rules</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jinx help" onClick={() => setIsHelpOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>Reveal safe cells, flag the mines, and clear the whole board without detonating one.</p>
              <p>Numbers tell you how many mines touch that square. Read the clues and work outward.</p>
              <p>You get one hint per board. It highlights a safe unrevealed cell for two seconds.</p>
            </div>
          </div>
        </div>
      ) : null}

      {isArchiveOpen ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jinx-archive-title" onClick={() => setIsArchiveOpen(false)}>
          <div className="glass-card jordle-modal__card jordle-archive-modal" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">Archive</span>
                <h2 id="jinx-archive-title">Previous Jinx boards</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jinx archive" onClick={() => setIsArchiveOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>Open any previous minefield to review it or finish it later.</p>
              <div className="jordle-archive-list">
                {archiveEntries.map((entry) => (
                  <button
                    key={entry.puzzleId}
                    type="button"
                    className={`jordle-archive-item ${entry.puzzleId === activePuzzleId ? "is-active" : ""}`}
                    onClick={() => {
                      setIsHelpOpen(false);
                      setIsSummaryOpen(false);
                      setHintCell(null);
                      setActivePuzzleId(entry.puzzleId);
                      setIsArchiveOpen(false);
                    }}
                  >
                    <div>
                      <strong>{entry.label}</strong>
                      <span>{entry.dateLabel}</span>
                    </div>
                    <div className="jordle-archive-item__meta">
                      {entry.solved ? (
                        <span className="jordle-archive-chip is-solved">Solved</span>
                      ) : entry.failed ? (
                        <span className="jordle-archive-chip is-failed">Lost</span>
                      ) : entry.moves > 0 ? (
                        <span className="jordle-archive-chip is-progress">{entry.moves} moves</span>
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
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jinx-summary-title" onClick={() => setIsSummaryOpen(false)}>
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">{solved ? "Puzzle solved" : "Board complete"}</span>
                <h2 id="jinx-summary-title">{solved ? "All clear." : "That one blew up."}</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jinx summary" onClick={() => setIsSummaryOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>
                {solved
                  ? `You cleared Puzzle #${puzzleNumber} in ${summaryStats.moves} ${summaryStats.moves === 1 ? "move" : "moves"}.`
                  : `You hit a mine on Puzzle #${puzzleNumber} after ${summaryStats.moves} moves.`}
              </p>
              <div className="jordle-summary-grid">
                <div className="jordle-summary-stat">
                  <span>Cells revealed</span>
                  <strong>{summaryStats.revealed}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Flags placed</span>
                  <strong>{summaryStats.flags}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Moves</span>
                  <strong>{summaryStats.moves}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Hint</span>
                  <strong>{summaryStats.hint}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default JinxPage;
