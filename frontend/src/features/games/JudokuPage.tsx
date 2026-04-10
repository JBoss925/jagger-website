import { useEffect, useMemo, useState } from "react";
import { JudokuIcon } from "./GameIcons";
import GamesNavigation from "./GamesNavigation";
import { usePageReveal } from "../../hooks/usePageReveal";
import {
  getCellValue,
  getFilledCount,
  getJudokuHintCell,
  getJudokuPuzzleById,
  getTodaysJudokuPuzzle,
  isCellInvalid,
  isGiven,
  normalizeJudokuState,
  setCellValue,
  toggleCellNote,
  type JudokuArchiveState,
  type JudokuPuzzleState,
  JUDOKU_SIZE,
  JUDOKU_STORAGE_KEY
} from "./judoku/game";

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
    const raw = window.localStorage.getItem(JUDOKU_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const saved = JSON.parse(raw) as JudokuArchiveState;
    if (!saved.puzzles || typeof saved.puzzles !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(saved.puzzles).map(([key, state]) => [
        key,
        normalizeJudokuState(getJudokuPuzzleById(Number(key)), state)
      ])
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

function cellKey(row: number, column: number) {
  return `${row}:${column}`;
}

function JudokuPage() {
  const isPageReady = usePageReveal();
  const todaysPuzzle = useMemo(() => getTodaysJudokuPuzzle(), []);
  const initialArchive = useMemo(() => readSavedArchive(), []);
  const initialTodayState =
    initialArchive[String(todaysPuzzle.puzzleId)] ?? normalizeJudokuState(todaysPuzzle, null);
  const [activePuzzleId, setActivePuzzleId] = useState(todaysPuzzle.puzzleId);
  const [archive, setArchive] = useState<Record<string, JudokuPuzzleState>>(initialArchive);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(initialTodayState.solved);

  const puzzle = useMemo(() => getJudokuPuzzleById(activePuzzleId), [activePuzzleId]);
  const puzzleState = archive[String(activePuzzleId)] ?? normalizeJudokuState(puzzle, null);
  const solved = puzzleState.solved;
  const puzzleNumber = puzzle.puzzleId + 1;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: JudokuArchiveState = { puzzles: archive };
    window.localStorage.setItem(JUDOKU_STORAGE_KEY, JSON.stringify(payload));
  }, [archive]);

  function setPuzzleState(nextState: JudokuPuzzleState) {
    setArchive((current) => ({
      ...current,
      [String(activePuzzleId)]: nextState
    }));
  }

  function writeValue(value: string) {
    if (!selectedCell || solved) {
      return;
    }

    const [row, column] = selectedCell;
    const nextState = isNotesMode
      ? toggleCellNote(puzzle, puzzleState, row, column, value)
      : setCellValue(puzzle, puzzleState, row, column, value);

    setPuzzleState(nextState);
    if (nextState.solved) {
      setIsSummaryOpen(true);
    }
  }

  function eraseValue() {
    if (!selectedCell || solved) {
      return;
    }

    const [row, column] = selectedCell;
    if (isNotesMode) {
      const key = cellKey(row, column);
      if (!puzzleState.notes[key]) {
        return;
      }

      const nextState = {
        ...puzzleState,
        notes: Object.fromEntries(Object.entries(puzzleState.notes).filter(([entryKey]) => entryKey !== key))
      };
      setPuzzleState(nextState);
      return;
    }

    setPuzzleState(setCellValue(puzzle, puzzleState, row, column, "0"));
  }

  function activateHint() {
    if (puzzleState.hintUsed || solved) {
      return;
    }

    const hint = getJudokuHintCell(puzzle, puzzleState);
    if (!hint) {
      return;
    }

    const nextState = setCellValue(
      puzzle,
      {
        ...puzzleState,
        hintUsed: true
      },
      hint.row,
      hint.column,
      hint.value
    );
    setPuzzleState({
      ...nextState,
      hintUsed: true
    });

    if (nextState.solved) {
      setIsSummaryOpen(true);
    }
  }

  const archiveEntries = useMemo(() => {
    return Array.from({ length: todaysPuzzle.puzzleId + 1 }, (_, puzzleId) => {
      const entryPuzzle = getJudokuPuzzleById(puzzleId);
      const entryState =
        archive[String(puzzleId)] ?? normalizeJudokuState(entryPuzzle, null);

      return {
        puzzleId,
        label: `Puzzle #${puzzleId + 1}`,
        dateLabel: formatDateLabel(entryPuzzle.date),
        solved: entryState.solved,
        filled: getFilledCount(entryState)
      };
    }).reverse();
  }, [archive, todaysPuzzle.puzzleId]);

  const status = solved
    ? "Solved."
    : isNotesMode
      ? "Notes mode on."
      : "Fill the grid.";

  const summaryStats = {
    filled: getFilledCount(puzzleState),
    hint: puzzleState.hintUsed ? "Used" : "Unused",
    notes: puzzleState.notesUsed ? "Used" : "Unused",
    corrections: puzzleState.corrections
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
            <div className="games-card__icon games-card__icon--judoku jordle-hero__icon" aria-hidden="true">
              <JudokuIcon />
            </div>
            <h1>Judoku</h1>
          </div>
          <p>A smaller daily sudoku you can finish without needing half an afternoon.</p>
        </section>

        <section className="judoku-layout">
          <article className="glass-card judoku-board-card">
            <div className="jordle-board-card__header">
              <div className="jordle-board-card__title-row">
                <div>
                  <span className="section-heading__eyebrow">Puzzle #{puzzleNumber}</span>
                  <h2>{solved ? "Solved" : "Number grid"}</h2>
                </div>
                <div className="jordle-board-card__actions">
                  <button type="button" className="jordle-help-button" aria-label="Open Judoku archive" onClick={() => setIsArchiveOpen(true)}>
                    <span className="jordle-help-button__icon">
                      <ArchiveIcon />
                    </span>
                    <span className="jordle-help-button__tooltip" role="tooltip">
                      Archive
                    </span>
                  </button>
                  <button type="button" className="jordle-help-button" aria-label="How to play Judoku" onClick={() => setIsHelpOpen(true)}>
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

            <div className="judoku-grid" role="grid" aria-label="Judoku board">
              {Array.from({ length: JUDOKU_SIZE }, (_, row) => (
                <div key={row} className="judoku-grid__row" role="row">
                  {Array.from({ length: JUDOKU_SIZE }, (_, column) => {
                    const key = cellKey(row, column);
                    const value = getCellValue(puzzleState, row, column);
                    const notes = puzzleState.notes[key] ?? [];
                    const given = isGiven(puzzle, row, column);
                    const invalid = isCellInvalid(puzzleState, row, column);
                    const selected = selectedCell?.[0] === row && selectedCell?.[1] === column;
                    const related =
                      selectedCell &&
                      (selectedCell[0] === row ||
                        selectedCell[1] === column ||
                        (Math.floor(selectedCell[0] / 2) === Math.floor(row / 2) &&
                          Math.floor(selectedCell[1] / 3) === Math.floor(column / 3)));

                    const className = [
                      "judoku-cell",
                      given ? "is-given" : "",
                      invalid ? "is-invalid" : "",
                      selected ? "is-selected" : "",
                      related && !selected ? "is-related" : ""
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={key}
                        type="button"
                        className={className}
                        onClick={() => setSelectedCell([row, column])}
                      >
                        {value !== "0" ? (
                          <strong>{value}</strong>
                        ) : (
                          <span className="judoku-cell__notes">
                            {Array.from({ length: 6 }, (_, index) => `${index + 1}`).map((note) => (
                              <span key={note}>{notes.includes(note) ? note : ""}</span>
                            ))}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="judoku-controls">
              <div className="jinx-mode-toggle" role="tablist" aria-label="Judoku entry mode">
                <button type="button" className={!isNotesMode ? "is-active" : ""} onClick={() => setIsNotesMode(false)}>
                  Fill
                </button>
                <button type="button" className={isNotesMode ? "is-active" : ""} onClick={() => setIsNotesMode(true)}>
                  Notes
                </button>
              </div>
              <button
                type="button"
                className="cta-button cta-button--secondary"
                onClick={activateHint}
                disabled={puzzleState.hintUsed || solved}
              >
                {puzzleState.hintUsed ? "Hint used" : "Use hint"}
              </button>
            </div>

            <div className="judoku-pad">
              {Array.from({ length: 6 }, (_, index) => (
                <button key={index + 1} type="button" className="judoku-pad__button" onClick={() => writeValue(String(index + 1))}>
                  {index + 1}
                </button>
              ))}
              <button type="button" className="judoku-pad__button is-erase" onClick={eraseValue}>
                Erase
              </button>
            </div>
          </article>
        </section>
      </main>

      {isHelpOpen ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="judoku-help-title" onClick={() => setIsHelpOpen(false)}>
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">How to play</span>
                <h2 id="judoku-help-title">Judoku rules</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Judoku help" onClick={() => setIsHelpOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>Fill the 6x6 grid so each row, column, and 2x3 box uses the numbers 1 through 6 exactly once.</p>
              <p>Use notes if you want to pencil in candidates. Red cells mean a row, column, or box has a duplicate.</p>
              <p>You get one hint per puzzle. It reveals one correct empty cell.</p>
            </div>
          </div>
        </div>
      ) : null}

      {isArchiveOpen ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="judoku-archive-title" onClick={() => setIsArchiveOpen(false)}>
          <div className="glass-card jordle-modal__card jordle-archive-modal" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">Archive</span>
                <h2 id="judoku-archive-title">Previous Judokus</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Judoku archive" onClick={() => setIsArchiveOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>Open any earlier grid to review it or pick up where you left off.</p>
              <div className="jordle-archive-list">
                {archiveEntries.map((entry) => (
                  <button
                    key={entry.puzzleId}
                    type="button"
                    className={`jordle-archive-item ${entry.puzzleId === activePuzzleId ? "is-active" : ""}`}
                    onClick={() => {
                      setIsSummaryOpen(false);
                      setIsHelpOpen(false);
                      setSelectedCell(null);
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
                      ) : entry.filled > 0 ? (
                        <span className="jordle-archive-chip is-progress">{entry.filled}/36 filled</span>
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

      {isSummaryOpen && solved ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="judoku-summary-title" onClick={() => setIsSummaryOpen(false)}>
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">Puzzle solved</span>
                <h2 id="judoku-summary-title">Grid complete.</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Judoku summary" onClick={() => setIsSummaryOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>You finished Puzzle #{puzzleNumber}.</p>
              <div className="jordle-summary-grid">
                <div className="jordle-summary-stat">
                  <span>Filled cells</span>
                  <strong>{summaryStats.filled}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Hint</span>
                  <strong>{summaryStats.hint}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Notes</span>
                  <strong>{summaryStats.notes}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Corrections</span>
                  <strong>{summaryStats.corrections}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default JudokuPage;
