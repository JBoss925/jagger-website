import { useEffect, useMemo, useState } from "react";
import { JigsawIcon } from "./GameIcons";
import GamesNavigation from "./GamesNavigation";
import { usePageReveal } from "../../hooks/usePageReveal";
import {
  getJigsawPuzzleById,
  getTodaysJigsawPuzzle,
  normalizeJigsawState,
  swapTiles,
  type JigsawArchiveState,
  type JigsawPuzzleState,
  JIGSAW_STORAGE_KEY,
  JIGSAW_TILE_COUNT
} from "./jigsaw/game";

const jigsawImages = import.meta.glob("./jigsaw/images/*.svg", {
  eager: true,
  import: "default",
  query: "?url"
}) as Record<string, string | { default?: string }>;

const imageLookup = Object.fromEntries(
  Object.entries(jigsawImages).map(([path, value]) => {
    const fileName = (path.split("/").pop() ?? path).replace(/\?.*$/, "");
    const url =
      typeof value === "string"
        ? value
        : typeof value?.default === "string"
          ? value.default
          : "";

    return [fileName, url];
  })
);

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
    const raw = window.localStorage.getItem(JIGSAW_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const saved = JSON.parse(raw) as JigsawArchiveState;
    if (!saved.puzzles || typeof saved.puzzles !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(saved.puzzles).map(([key, state]) => [
        key,
        normalizeJigsawState(getJigsawPuzzleById(Number(key)), state)
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

function JigsawPage() {
  const isPageReady = usePageReveal();
  const todaysPuzzle = useMemo(() => getTodaysJigsawPuzzle(), []);
  const initialArchive = useMemo(() => readSavedArchive(), []);
  const initialTodayState =
    initialArchive[String(todaysPuzzle.puzzleId)] ?? normalizeJigsawState(todaysPuzzle, null);
  const [activePuzzleId, setActivePuzzleId] = useState(todaysPuzzle.puzzleId);
  const [archive, setArchive] = useState<Record<string, JigsawPuzzleState>>(initialArchive);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(initialTodayState.solved);

  const puzzle = useMemo(() => getJigsawPuzzleById(activePuzzleId), [activePuzzleId]);
  const puzzleState = archive[String(activePuzzleId)] ?? normalizeJigsawState(puzzle, null);
  const solved = puzzleState.solved;
  const imageUrl = imageLookup[puzzle.image];
  const puzzleNumber = puzzle.puzzleId + 1;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: JigsawArchiveState = { puzzles: archive };
    window.localStorage.setItem(JIGSAW_STORAGE_KEY, JSON.stringify(payload));
  }, [archive]);

  function setPuzzleState(nextState: JigsawPuzzleState) {
    setArchive((current) => ({
      ...current,
      [String(activePuzzleId)]: nextState
    }));
  }

  function handleTilePress(index: number) {
    if (solved) {
      return;
    }

    if (selectedTile === null) {
      setSelectedTile(index);
      return;
    }

    if (selectedTile === index) {
      setSelectedTile(null);
      return;
    }

    const nextState = swapTiles(puzzleState, selectedTile, index);
    setSelectedTile(null);
    setPuzzleState(nextState);

    if (nextState.solved) {
      setIsSummaryOpen(true);
    }
  }

  function activateHint() {
    if (puzzleState.hintUsed || isHintVisible) {
      return;
    }

    setPuzzleState({
      ...puzzleState,
      hintUsed: true
    });
    setIsHintVisible(true);
    window.setTimeout(() => setIsHintVisible(false), 2000);
  }

  const archiveEntries = useMemo(() => {
    return Array.from({ length: todaysPuzzle.puzzleId + 1 }, (_, puzzleId) => {
      const entryPuzzle = getJigsawPuzzleById(puzzleId);
      const entryState =
        archive[String(puzzleId)] ?? normalizeJigsawState(entryPuzzle, null);

      return {
        puzzleId,
        label: `Puzzle #${puzzleId + 1}`,
        dateLabel: formatDateLabel(entryPuzzle.date),
        title: entryPuzzle.title,
        solved: entryState.solved,
        moveCount: entryState.moveCount
      };
    }).reverse();
  }, [archive, todaysPuzzle.puzzleId]);

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
            <div className="games-card__icon games-card__icon--jigsaw jordle-hero__icon" aria-hidden="true">
              <JigsawIcon />
            </div>
            <h1>Jigsaw</h1>
          </div>
          <p>Rebuild the daily picture tile by tile.</p>
        </section>

        <section className="jigsaw-layout">
          <article className="glass-card jigsaw-board-card">
            <div className="jordle-board-card__header">
              <div className="jordle-board-card__title-row">
                <div>
                  <span className="section-heading__eyebrow">Puzzle #{puzzleNumber}</span>
                  <h2>{solved ? "Picture rebuilt" : puzzle.title}</h2>
                </div>
                <div className="jordle-board-card__actions">
                  <button type="button" className="jordle-help-button" aria-label="Open Jigsaw archive" onClick={() => setIsArchiveOpen(true)}>
                    <span className="jordle-help-button__icon">
                      <ArchiveIcon />
                    </span>
                    <span className="jordle-help-button__tooltip" role="tooltip">
                      Archive
                    </span>
                  </button>
                  <button type="button" className="jordle-help-button" aria-label="How to play Jigsaw" onClick={() => setIsHelpOpen(true)}>
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
                {solved ? "Solved." : `${puzzleState.moveCount} moves`}
              </p>
            </div>

            <div className="jigsaw-actions">
              <button
                type="button"
                className="cta-button cta-button--secondary"
                onClick={activateHint}
                disabled={puzzleState.hintUsed || isHintVisible}
              >
                {puzzleState.hintUsed ? "Hint used" : "Preview solved image"}
              </button>
            </div>

            <div className="jigsaw-stage">
              <div className={`jigsaw-board ${solved ? "is-solved" : ""}`} role="grid" aria-label="Jigsaw board">
                {Array.from({ length: JIGSAW_TILE_COUNT }, (_, index) => {
                  const tile = puzzleState.order[index];
                  const row = Math.floor(tile / 4);
                  const column = tile % 4;
                  return (
                    <button
                      key={`${index}-${tile}`}
                      type="button"
                      className={`jigsaw-tile ${selectedTile === index ? "is-selected" : ""}`}
                      onClick={() => handleTilePress(index)}
                      aria-label={`Tile ${index + 1}`}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          aria-hidden="true"
                          className="jigsaw-tile__image"
                          style={{
                            left: `${column * -100}%`,
                            top: `${row * -100}%`
                          }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {isHintVisible ? (
                <div className="jigsaw-preview-overlay" aria-live="polite">
                  <div className="jigsaw-preview-overlay__frame">
                    {imageUrl ? <img src={imageUrl} alt="" aria-hidden="true" className="jigsaw-preview-overlay__image" /> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        </section>
      </main>

      {isHelpOpen ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jigsaw-help-title" onClick={() => setIsHelpOpen(false)}>
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">How to play</span>
                <h2 id="jigsaw-help-title">Jigsaw rules</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jigsaw help" onClick={() => setIsHelpOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>Swap two tiles at a time until the picture is back in the right order.</p>
              <p>There is no fail state. The board is done when all 16 tiles return to their original positions.</p>
              <p>You get one preview per puzzle. It shows the solved image for two seconds.</p>
            </div>
          </div>
        </div>
      ) : null}

      {isArchiveOpen ? (
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jigsaw-archive-title" onClick={() => setIsArchiveOpen(false)}>
          <div className="glass-card jordle-modal__card jordle-archive-modal" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">Archive</span>
                <h2 id="jigsaw-archive-title">Previous Jigsaws</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jigsaw archive" onClick={() => setIsArchiveOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>Open any earlier picture to review it or keep swapping where you left off.</p>
              <div className="jordle-archive-list">
                {archiveEntries.map((entry) => (
                  <button
                    key={entry.puzzleId}
                    type="button"
                    className={`jordle-archive-item ${entry.puzzleId === activePuzzleId ? "is-active" : ""}`}
                    onClick={() => {
                      setIsHelpOpen(false);
                      setIsSummaryOpen(false);
                      setSelectedTile(null);
                      setActivePuzzleId(entry.puzzleId);
                      setIsArchiveOpen(false);
                    }}
                  >
                    <div>
                      <strong>{entry.label}</strong>
                      <span>{entry.dateLabel}</span>
                    </div>
                    <div className="jordle-archive-item__meta jigsaw-archive-item__meta">
                      <span>{entry.title}</span>
                      {entry.solved ? (
                        <span className="jordle-archive-chip is-solved">Solved</span>
                      ) : entry.moveCount > 0 ? (
                        <span className="jordle-archive-chip is-progress">{entry.moveCount} moves</span>
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
        <div className="jordle-modal" role="dialog" aria-modal="true" aria-labelledby="jigsaw-summary-title" onClick={() => setIsSummaryOpen(false)}>
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">Puzzle solved</span>
                <h2 id="jigsaw-summary-title">Picture rebuilt.</h2>
              </div>
              <button type="button" className="jordle-modal__close" aria-label="Close Jigsaw summary" onClick={() => setIsSummaryOpen(false)}>
                ×
              </button>
            </div>
            <div className="jordle-modal__body">
              <p>You solved Puzzle #{puzzleNumber} in {puzzleState.moveCount} moves.</p>
              <div className="jordle-summary-grid">
                <div className="jordle-summary-stat">
                  <span>Moves</span>
                  <strong>{puzzleState.moveCount}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Hint</span>
                  <strong>{puzzleState.hintUsed ? "Used" : "Unused"}</strong>
                </div>
                <div className="jordle-summary-stat jordle-summary-stat--wide">
                  <span>Image</span>
                  <strong>{puzzle.title}</strong>
                </div>
              </div>
              {imageUrl ? (
                <div className="jigsaw-summary-image">
                  <img src={imageUrl} alt="" aria-hidden="true" className="jigsaw-preview-overlay__image" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default JigsawPage;
