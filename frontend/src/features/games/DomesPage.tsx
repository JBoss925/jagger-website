import { useMemo, useState } from "react";
import { usePageReveal } from "../../hooks/usePageReveal";
import GamesNavigation from "./GamesNavigation";
import { DomesIcon } from "./GameIcons";
import {
  buildAt,
  cancelSelection,
  createInitialDomesState,
  DOMES_BOARD_SIZE,
  getCurrentPrompt,
  getPlayerLabel,
  getWorkerAt,
  isCellSelectable,
  moveWorker,
  placeWorker,
  selectWorker,
  type DomesPlayerId,
  type DomesState
} from "./domes/game";

function DomesPage() {
  const isPageReady = usePageReveal();
  const [state, setState] = useState<DomesState>(() => createInitialDomesState());

  const prompt = useMemo(() => getCurrentPrompt(state), [state]);

  function handleCellPress(row: number, col: number) {
    if (state.phase === "gameOver") {
      return;
    }

    if (state.phase === "setup") {
      setState((current) => placeWorker(current, row, col));
      return;
    }

    const worker = getWorkerAt(state, row, col);

    if (state.phase === "select" && worker?.player === state.currentPlayer) {
      setState((current) => selectWorker(current, worker.id));
      return;
    }

    if (state.phase === "move") {
      if (worker?.id === state.selectedWorkerId) {
        setState((current) => cancelSelection(current));
        return;
      }

      setState((current) => moveWorker(current, row, col));
      return;
    }

    if (state.phase === "build") {
      setState((current) => buildAt(current, row, col));
    }
  }

  function handleReset() {
    setState(createInitialDomesState());
  }

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
        <section className="games-section-intro domes-hero" aria-labelledby="domes-title">
          <span className="section-heading__eyebrow">Board game</span>
          <div className="domes-hero__title-row">
            <span className="domes-hero__icon games-card__icon games-card__icon--domes" aria-hidden="true">
              <DomesIcon />
            </span>
            <h1 id="domes-title">Domes</h1>
          </div>
          <p>
            A clean two-player take on Santorini. Place your builders, climb one level at a time, and be the first to step onto the third level before the board closes up around you.
          </p>
        </section>

        <section className="domes-layout" aria-label="Domes game board and status">
          <div className="glass-card domes-board-card">
            <div className="domes-board-card__header">
              <div className="domes-board-card__copy">
                <span className="section-heading__eyebrow">Turn {state.turn}</span>
                <h2>{state.phase === "gameOver" && state.winner ? `${getPlayerLabel(state.winner)} wins` : `${getPlayerLabel(state.currentPlayer)} to play`}</h2>
                <p>{prompt}</p>
              </div>

              <div className="domes-board-card__actions">
                {state.phase === "move" ? (
                  <button type="button" className="button button-secondary" onClick={() => setState((current) => cancelSelection(current))}>
                    Change builder
                  </button>
                ) : null}
                <button type="button" className="button button-secondary" onClick={handleReset}>
                  New game
                </button>
              </div>
            </div>

            <div className="domes-board" role="grid" aria-label="Domes board">
              {Array.from({ length: DOMES_BOARD_SIZE }, (_, row) =>
                Array.from({ length: DOMES_BOARD_SIZE }, (_, col) => {
                  const towerHeight = state.towers[row][col];
                  const worker = getWorkerAt(state, row, col);
                  const isSelected = worker?.id === state.selectedWorkerId;
                  const isSelectable = isCellSelectable(state, row, col);
                  const className = [
                    "domes-cell",
                    worker ? `has-worker has-worker--${worker.player}` : "",
                    isSelectable ? "is-selectable" : "",
                    isSelected ? "is-selected" : "",
                    towerHeight >= 4 ? "has-dome" : "",
                    towerHeight > 0 && towerHeight < 4 ? `tower-${towerHeight}` : ""
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      role="gridcell"
                      className={className}
                      aria-label={`Row ${row + 1}, column ${col + 1}`}
                      onClick={() => handleCellPress(row, col)}
                    >
                      <span className="domes-cell__grid" aria-hidden="true" />
                      <span className="domes-cell__base" aria-hidden="true" />
                      {towerHeight >= 1 && towerHeight < 4 ? (
                        <span className="domes-cell__tower" aria-hidden="true">
                          {Array.from({ length: towerHeight }, (_, level) => (
                            <span key={level} className="domes-cell__tower-level" />
                          ))}
                        </span>
                      ) : null}
                      {towerHeight >= 4 ? (
                        <span className="domes-cell__dome" aria-hidden="true">
                          <span className="domes-cell__dome-cap" />
                        </span>
                      ) : null}
                      {worker ? (
                        <span className="domes-cell__worker" aria-hidden="true">
                          <span className="domes-cell__worker-body" />
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <aside className="glass-card domes-status-card">
            <div className="domes-status-card__section">
              <span className="section-heading__eyebrow">How a turn works</span>
              <ol className="domes-steps">
                <li>Pick one of your two builders.</li>
                <li>Move to any adjacent space, but climb at most one level.</li>
                <li>Build on an adjacent space. The fourth build becomes a dome.</li>
              </ol>
            </div>

            <div className="domes-status-card__section">
              <span className="section-heading__eyebrow">Win conditions</span>
              <ul className="domes-rules">
                <li>Move onto the third level.</li>
                <li>Or leave the other player with no legal move.</li>
              </ul>
            </div>

            <div className="domes-status-card__section">
              <span className="section-heading__eyebrow">Builders</span>
              <div className="domes-players">
                <DomesPlayerCard
                  label="Sun"
                  player="sun"
                  isActive={state.currentPlayer === "sun" && state.phase !== "gameOver"}
                  remaining={state.workers.filter((worker) => worker.player === "sun").length}
                />
                <DomesPlayerCard
                  label="Sea"
                  player="sea"
                  isActive={state.currentPlayer === "sea" && state.phase !== "gameOver"}
                  remaining={state.workers.filter((worker) => worker.player === "sea").length}
                />
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function DomesPlayerCard({
  label,
  player,
  isActive,
  remaining
}: {
  label: string;
  player: DomesPlayerId;
  isActive: boolean;
  remaining: number;
}) {
  return (
    <div className={isActive ? "domes-player-card is-active" : "domes-player-card"}>
      <div className={`domes-player-card__token domes-player-card__token--${player}`} aria-hidden="true" />
      <div className="domes-player-card__copy">
        <strong>{label}</strong>
        <span>{remaining}/2 placed</span>
      </div>
      <span className="domes-player-card__state">Human</span>
    </div>
  );
}

export default DomesPage;
