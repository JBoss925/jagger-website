import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { JinxIcon } from "./GameIcons";
import GamesNavigation from "./GamesNavigation";
import { usePageReveal } from "../../hooks/usePageReveal";
import { formatGameDateLabel } from "./dateLabel";
import {
  createInitialJinxPuzzleState,
  getAdjacentMineCount,
  getJinxArchiveKey,
  getJinxDifficultyFromArchiveKey,
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
  type JinxDifficulty,
  type JinxPuzzleState,
  JINX_DIFFICULTIES,
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
      Object.entries(saved.puzzles).map(([key, state]) => {
        const normalizedKey = key.includes(":") ? key : getJinxArchiveKey("easy", Number(key));
        const difficulty = getJinxDifficultyFromArchiveKey(normalizedKey);
        return [normalizedKey, normalizeJinxPuzzleState(state, difficulty)];
      })
    );
  } catch {
    return {};
  }
}

function cellEquals(first: JinxCell | null, second: JinxCell | null) {
  return Boolean(first && second && first[0] === second[0] && first[1] === second[1]);
}

function DifficultyIcon({ difficulty }: { difficulty: JinxDifficulty }) {
  return difficulty === "easy" ? "8×8" : "16×16";
}

function JinxPage() {
  const isPageReady = usePageReveal();
  const todaysPuzzleId = useMemo(() => getTodaysJinxPuzzle(new Date(), "easy").puzzleId, []);
  const [difficulty, setDifficulty] = useState<JinxDifficulty>("easy");
  const initialArchive = useMemo(() => {
    const savedArchive = readSavedArchive();
    const todayKey = getJinxArchiveKey("easy", todaysPuzzleId);
    if (savedArchive[todayKey]) {
      return savedArchive;
    }

    return {
      ...savedArchive,
      [todayKey]: createInitialJinxPuzzleState(getJinxPuzzleById(todaysPuzzleId, "easy"))
    };
  }, [todaysPuzzleId]);
  const initialTodayPuzzle = useMemo(() => getJinxPuzzleById(todaysPuzzleId, "easy"), [todaysPuzzleId]);
  const initialTodayState = initialArchive[getJinxArchiveKey("easy", todaysPuzzleId)] ?? normalizeJinxPuzzleState(null, "easy");
  const initialTodaySolved = isJinxSolved(initialTodayPuzzle, initialTodayState);
  const initialTodayFailed = initialTodayState.lost;
  const [activePuzzleId, setActivePuzzleId] = useState(todaysPuzzleId);
  const [archive, setArchive] = useState<Record<string, JinxPuzzleState>>(initialArchive);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(initialTodaySolved || initialTodayFailed);
  const [mode, setMode] = useState<"reveal" | "flag">("reveal");
  const [hintCell, setHintCell] = useState<JinxCell | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);

  const todaysPuzzle = useMemo(() => getJinxPuzzleById(todaysPuzzleId, difficulty), [difficulty, todaysPuzzleId]);
  const activePuzzleKey = useMemo(() => getJinxArchiveKey(difficulty, activePuzzleId), [activePuzzleId, difficulty]);
  const puzzle = useMemo(() => getJinxPuzzleById(activePuzzleId, difficulty), [activePuzzleId, difficulty]);
  const puzzleState = archive[activePuzzleKey] ?? normalizeJinxPuzzleState(null, difficulty);
  const solved = isJinxSolved(puzzle, puzzleState);
  const failed = puzzleState.lost;
  const puzzleNumber = puzzle.puzzleId + 1;
  const boardStyle = {
    "--jinx-board-gap": difficulty === "hard" ? "4px" : "8px",
    "--jinx-cell-font-size": difficulty === "hard" ? "clamp(0.5rem, 1.8vw, 0.72rem)" : "clamp(0.72rem, 2.8vw, 1.05rem)",
    "--jinx-columns": String(puzzle.columns)
  } as CSSProperties;
  const difficultyLabel = JINX_DIFFICULTIES[difficulty].label;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: JinxArchiveState = { puzzles: archive };
    window.localStorage.setItem(JINX_STORAGE_KEY, JSON.stringify(payload));
  }, [archive]);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current !== null) {
        window.clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const puzzleKey = getJinxArchiveKey(difficulty, activePuzzleId);
    if (archive[puzzleKey]) {
      return;
    }

    setArchive((current) => {
      if (current[puzzleKey]) {
        return current;
      }

      return {
        ...current,
        [puzzleKey]: createInitialJinxPuzzleState(puzzle)
      };
    });
  }, [activePuzzleId, archive, difficulty, puzzle]);

  function setPuzzleState(nextState: JinxPuzzleState) {
    setArchive((current) => ({
      ...current,
      [activePuzzleKey]: nextState
    }));
  }

  function clearHint() {
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }

    setHintCell(null);
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

  function handleCellRightClick(event: MouseEvent<HTMLButtonElement>, row: number, column: number) {
    if (mode !== "reveal" || solved || failed) {
      return;
    }

    event.preventDefault();

    const nextState = toggleFlag(puzzleState, row, column);
    setPuzzleState(nextState);

    if (isJinxSolved(puzzle, nextState)) {
      setIsSummaryOpen(true);
    }
  }

  function activateHint() {
    if (solved || failed) {
      return;
    }

    const nextHintCell = getSafeHintCell(puzzle, puzzleState);
    if (!nextHintCell) {
      return;
    }

    clearHint();
    setHintCell(nextHintCell);
    setPuzzleState({
      ...puzzleState,
      hintCount: puzzleState.hintCount + 1
    });

    hintTimeoutRef.current = window.setTimeout(() => {
      setHintCell(null);
      hintTimeoutRef.current = null;
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
    return Array.from({ length: todaysPuzzleId + 1 }, (_, puzzleId) => {
      const entryPuzzle = getJinxPuzzleById(puzzleId, difficulty);
      const entryState = archive[getJinxArchiveKey(difficulty, puzzleId)] ?? normalizeJinxPuzzleState(null, difficulty);
      const entrySolved = isJinxSolved(entryPuzzle, entryState);
      const entryFailed = entryState.lost;

      return {
        puzzleId,
        label: `${difficultyLabel} Puzzle #${puzzleId + 1}`,
        dateLabel: formatGameDateLabel(entryPuzzle.date),
        solved: entrySolved,
        failed: entryFailed,
        moves: entryState.moveCount,
        hintCount: entryState.hintCount
      };
    }).reverse();
  }, [archive, difficulty, difficultyLabel, todaysPuzzleId]);

  const summaryStats = {
    revealed: puzzleState.revealed.length,
    flags: puzzleState.flags.length,
    moves: puzzleState.moveCount,
    hints: puzzleState.hintCount
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
          <p>Pick the current 8×8 easy board or a 16×16 hard board with more mines. Both open with a safe region and allow unlimited hints.</p>
        </section>

        <section className="jinx-layout">
          <article className="glass-card jinx-board-card">
            <div className="jordle-board-card__header">
              <div className="jordle-board-card__title-row">
                <div>
                  <span className="section-heading__eyebrow">{difficultyLabel} · Puzzle #{puzzleNumber}</span>
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
                {formatGameDateLabel(puzzle.date)}
                <span className="jordle-board-card__meta-divider">·</span>
                {status}
              </p>
            </div>

            <div className="jinx-controls">
              <div className="jinx-difficulty-toggle" role="tablist" aria-label="Jinx difficulty">
                {(["easy", "hard"] as JinxDifficulty[]).map((entryDifficulty) => (
                  <button
                    key={entryDifficulty}
                    type="button"
                    className={difficulty === entryDifficulty ? "is-active" : ""}
                    onClick={() => {
                      setDifficulty(entryDifficulty);
                      clearHint();
                      setIsSummaryOpen(false);
                    }}
                  >
                    <span>{JINX_DIFFICULTIES[entryDifficulty].label}</span>
                    <span className="jinx-difficulty-toggle__meta">
                      <DifficultyIcon difficulty={entryDifficulty} /> · {JINX_DIFFICULTIES[entryDifficulty].mineCount} mines
                    </span>
                  </button>
                ))}
              </div>
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
                disabled={solved || failed}
              >
                Use hint
              </button>
            </div>

            <div className="jinx-board-scroll">
              <div className={`jinx-board ${difficulty === "hard" ? "jinx-board--hard" : ""}`} role="grid" aria-label={`${difficultyLabel} Jinx board`} style={boardStyle}>
                {Array.from({ length: puzzle.rows }, (_, row) => (
                <div key={row} className="jinx-board__row" role="row">
                  {Array.from({ length: puzzle.columns }, (_, column) => {
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
                        onContextMenu={(event) => handleCellRightClick(event, row, column)}
                        aria-label={`Row ${row + 1} column ${column + 1}`}
                      >
                        {isFlagged ? "!" : shouldShowMine ? "×" : adjacentCount > 0 ? adjacentCount : ""}
                      </button>
                    );
                  })}
                </div>
              ))}
              </div>
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
              <p>Easy uses the original 8×8 board. Hard doubles that to 16×16 and raises the mine count to 40.</p>
              <p>Each board opens with a safe region already revealed so you can start with real information.</p>
              <p>Numbers tell you how many mines touch that square. Use them to find safe cells and flag mines. Hints are unlimited and highlight one safe unrevealed cell for two seconds.</p>
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
                <h2 id="jinx-archive-title">{difficultyLabel} Jinx boards</h2>
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
                      clearHint();
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
                  ? `You cleared ${difficultyLabel} Puzzle #${puzzleNumber} in ${summaryStats.moves} ${summaryStats.moves === 1 ? "move" : "moves"}.`
                  : `You hit a mine on ${difficultyLabel} Puzzle #${puzzleNumber} after ${summaryStats.moves} moves.`}
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
                  <span>Hints used</span>
                  <strong>{summaryStats.hints}</strong>
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
