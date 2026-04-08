import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePageReveal } from "../../hooks/usePageReveal";
import { JordleIcon } from "./GameIcons";
import GamesNavigation from "./GamesNavigation";
import {
  evaluateGuess,
  getJordlePuzzleById,
  getTodaysJordlePuzzle,
  isValidJordleGuess,
  JORDLE_MAX_GUESSES,
  JORDLE_STORAGE_KEY,
  JORDLE_WORD_LENGTH,
  mergeKeyboardState,
  normalizeArchivedGuesses,
  normalizeGuess,
  type JordleArchiveState,
  type JordleSaveState,
  type LetterState
} from "./jordle/game";

function EnterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 5v10H8" />
      <path d="m12 11-4 4 4 4" />
    </svg>
  );
}

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7H10l-6 5 6 5h10z" />
      <path d="m12 10 4 4" />
      <path d="m16 10-4 4" />
    </svg>
  );
}

type JordleKeyProps = {
  label: string;
  state: LetterState;
  wide?: boolean;
  onPress: () => void;
  ariaLabel?: string;
  children?: ReactNode;
};

function JordleKey({
  label,
  state,
  wide = false,
  onPress,
  ariaLabel,
  children
}: JordleKeyProps) {
  const className = [
    "jordle-key",
    wide ? "is-wide" : "",
    state !== "empty" ? `is-${state}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={className} onClick={onPress} aria-label={ariaLabel ?? label}>
      {children ?? label}
    </button>
  );
}

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
    const raw = window.localStorage.getItem(JORDLE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const saved = JSON.parse(raw) as JordleArchiveState | JordleSaveState;
    if ("puzzles" in saved && saved.puzzles && typeof saved.puzzles === "object") {
      return Object.fromEntries(
        Object.entries(saved.puzzles).map(([key, guesses]) => [key, normalizeArchivedGuesses(guesses)])
      );
    }

    if ("puzzleId" in saved) {
      return {
        [String(saved.puzzleId)]: normalizeArchivedGuesses(saved.guesses)
      };
    }

    return {};
  } catch {
    return {};
  }
}

function JordlePage() {
  const isPageReady = usePageReveal();
  const todaysPuzzle = useMemo(() => getTodaysJordlePuzzle(), []);
  const [activePuzzleId, setActivePuzzleId] = useState(todaysPuzzle.puzzleId);
  const [archive, setArchive] = useState<Record<string, string[]>>(() => readSavedArchive());
  const [draft, setDraft] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const { answer, puzzleId, date } = useMemo(
    () => getJordlePuzzleById(activePuzzleId),
    [activePuzzleId]
  );
  const guesses = archive[String(activePuzzleId)] ?? [];

  const solved = guesses.at(-1) === answer;
  const failed = !solved && guesses.length >= JORDLE_MAX_GUESSES;
  const keyboard = useMemo(
    () =>
      guesses.reduce<Record<string, LetterState>>((nextKeyboard, guess) => {
        return mergeKeyboardState(nextKeyboard, evaluateGuess(guess, answer));
      }, {}),
    [answer, guesses]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: JordleArchiveState = {
      puzzles: archive
    };
    window.localStorage.setItem(JORDLE_STORAGE_KEY, JSON.stringify(payload));
  }, [archive]);

  useEffect(() => {
    setDraft("");
    setValidationMessage("");
    setIsHelpOpen(false);
    setIsSummaryOpen(false);
  }, [activePuzzleId]);

  function addLetter(letter: string) {
    if (solved || failed || draft.length >= JORDLE_WORD_LENGTH) {
      return;
    }
    setValidationMessage("");
    setDraft((current) => `${current}${letter.toLowerCase()}`);
  }

  function removeLetter() {
    if (solved || failed) {
      return;
    }
    setValidationMessage("");
    setDraft((current) => current.slice(0, -1));
  }

  function submitGuess() {
    if (solved || failed) {
      return;
    }

    const guess = normalizeGuess(draft);
    if (guess.length !== JORDLE_WORD_LENGTH) {
      setValidationMessage("Jordle uses six-letter words.");
      return;
    }

    if (!isValidJordleGuess(guess)) {
      setValidationMessage("That word is not in the Jordle list.");
      return;
    }

    const nextGuesses = [...guesses, guess];

    setArchive((current) => ({
      ...current,
      [String(activePuzzleId)]: nextGuesses
    }));
    setDraft("");
    setValidationMessage("");

    if (guess === answer || nextGuesses.length >= JORDLE_MAX_GUESSES) {
      setIsSummaryOpen(true);
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHelpOpen(false);
        setIsArchiveOpen(false);
        setIsSummaryOpen(false);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isHelpOpen || isArchiveOpen || isSummaryOpen) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        submitGuess();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        removeLetter();
        return;
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        addLetter(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [draft, failed, isArchiveOpen, isHelpOpen, isSummaryOpen, solved]);

  const rows = Array.from({ length: JORDLE_MAX_GUESSES }, (_, rowIndex) => {
    const committedGuess = guesses[rowIndex];
    if (committedGuess) {
      return evaluateGuess(committedGuess, answer);
    }

    if (rowIndex === guesses.length) {
      return Array.from({ length: JORDLE_WORD_LENGTH }, (_, index) => ({
        char: draft[index] ?? "",
        state: "empty" as LetterState
      }));
    }

    return Array.from({ length: JORDLE_WORD_LENGTH }, () => ({
      char: "",
      state: "empty" as LetterState
    }));
  });

  const puzzleNumber = puzzleId + 1;
  const puzzleDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(date),
    [date]
  );
  const status = useMemo(() => {
    if (solved) {
      return `Solved in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}.`;
    }

    if (failed) {
      return `Out of guesses. Today's word was ${answer.toUpperCase()}.`;
    }

    if (guesses.length > 0) {
      return `${JORDLE_MAX_GUESSES - guesses.length} guesses left.`;
    }

    if (validationMessage) {
      return validationMessage;
    }

    return "Find the six-letter word in six tries.";
  }, [answer, failed, guesses.length, solved, validationMessage]);
  const summaryStats = useMemo(() => {
    const answerLetters = new Set(answer.split(""));
    const discoveredLetters = new Set<string>();
    let bestCorrectCount = 0;

    for (const guess of guesses) {
      const evaluation = evaluateGuess(guess, answer);
      let correctCount = 0;

      for (const letter of evaluation) {
        if (letter.state === "present" || letter.state === "correct") {
          discoveredLetters.add(letter.char);
        }

        if (letter.state === "correct") {
          correctCount += 1;
        }
      }

      bestCorrectCount = Math.max(bestCorrectCount, correctCount);
    }

    const lettersFoundPercent =
      answerLetters.size === 0 ? 0 : Math.round((discoveredLetters.size / answerLetters.size) * 100);
    const bestRowPercent = Math.round((bestCorrectCount / JORDLE_WORD_LENGTH) * 100);

    return {
      attemptsUsed: guesses.length,
      guessesRemaining: Math.max(0, JORDLE_MAX_GUESSES - guesses.length),
      lettersFoundPercent,
      bestRowPercent
    };
  }, [answer, guesses]);

  const archiveEntries = useMemo(() => {
    const entries = [];
    for (let id = todaysPuzzle.puzzleId; id >= 0; id -= 1) {
      const puzzle = getJordlePuzzleById(id);
      const entryGuesses = archive[String(id)] ?? [];
      const entrySolved = entryGuesses.at(-1) === puzzle.answer;
      const entryFailed = !entrySolved && entryGuesses.length >= JORDLE_MAX_GUESSES;

      entries.push({
        puzzleId: id,
        label: `Puzzle #${id + 1}`,
        dateLabel: new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric"
        }).format(puzzle.date),
        guesses: entryGuesses.length,
        solved: entrySolved,
        failed: entryFailed
      });
    }
    return entries;
  }, [archive, todaysPuzzle.puzzleId]);

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
        <section className="games-hero jordle-hero">
          <span className="section-heading__eyebrow">Daily game</span>
          <div className="jordle-hero__title-row">
            <div className="games-card__icon games-card__icon--jordle jordle-hero__icon" aria-hidden="true">
              <JordleIcon />
            </div>
            <h1>Jordle</h1>
          </div>
          <p>A six-letter daily word game. Same family as Wordle, just slightly roomier.</p>
        </section>

        <section className="jordle-layout">
          <article className="glass-card jordle-board-card">
            <div className="jordle-board-card__header">
              <div className="jordle-board-card__title-row">
                <div>
                  <span className="section-heading__eyebrow">Puzzle #{puzzleNumber}</span>
                  <h2>{solved ? "Solved" : failed ? "Tough board" : "Today’s Jordle"}</h2>
                </div>
                <div className="jordle-board-card__actions">
                  <button
                    type="button"
                    className="jordle-help-button"
                    aria-label="Open Jordle archive"
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
                    aria-label="How to play Jordle"
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

            <div className="jordle-board" role="grid" aria-label="Jordle board">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="jordle-row" role="row">
                  {row.map((tile, tileIndex) => (
                    <div
                      key={`${rowIndex}-${tileIndex}`}
                      className={`jordle-tile is-${tile.state}`}
                      role="gridcell"
                      aria-label={tile.char ? `${tile.char} ${tile.state}` : "empty"}
                    >
                      {tile.char}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card jordle-keyboard-card">
            <div className="jordle-keyboard">
              <div className="jordle-keyboard__row">
                <JordleKey label="Q" state={keyboard.q ?? "empty"} onPress={() => addLetter("q")} />
                <JordleKey label="W" state={keyboard.w ?? "empty"} onPress={() => addLetter("w")} />
                <JordleKey label="E" state={keyboard.e ?? "empty"} onPress={() => addLetter("e")} />
                <JordleKey label="R" state={keyboard.r ?? "empty"} onPress={() => addLetter("r")} />
                <JordleKey label="T" state={keyboard.t ?? "empty"} onPress={() => addLetter("t")} />
                <JordleKey label="Y" state={keyboard.y ?? "empty"} onPress={() => addLetter("y")} />
                <JordleKey label="U" state={keyboard.u ?? "empty"} onPress={() => addLetter("u")} />
                <JordleKey label="I" state={keyboard.i ?? "empty"} onPress={() => addLetter("i")} />
                <JordleKey label="O" state={keyboard.o ?? "empty"} onPress={() => addLetter("o")} />
                <JordleKey label="P" state={keyboard.p ?? "empty"} onPress={() => addLetter("p")} />
              </div>

              <div className="jordle-keyboard__row jordle-keyboard__row--offset">
                <JordleKey label="A" state={keyboard.a ?? "empty"} onPress={() => addLetter("a")} />
                <JordleKey label="S" state={keyboard.s ?? "empty"} onPress={() => addLetter("s")} />
                <JordleKey label="D" state={keyboard.d ?? "empty"} onPress={() => addLetter("d")} />
                <JordleKey label="F" state={keyboard.f ?? "empty"} onPress={() => addLetter("f")} />
                <JordleKey label="G" state={keyboard.g ?? "empty"} onPress={() => addLetter("g")} />
                <JordleKey label="H" state={keyboard.h ?? "empty"} onPress={() => addLetter("h")} />
                <JordleKey label="J" state={keyboard.j ?? "empty"} onPress={() => addLetter("j")} />
                <JordleKey label="K" state={keyboard.k ?? "empty"} onPress={() => addLetter("k")} />
                <JordleKey label="L" state={keyboard.l ?? "empty"} onPress={() => addLetter("l")} />
              </div>

              <div className="jordle-keyboard__row">
                <JordleKey
                  label="Enter"
                  wide
                  state="empty"
                  onPress={submitGuess}
                  ariaLabel="Submit guess"
                >
                  <span className="jordle-key__icon">
                    <EnterIcon />
                  </span>
                </JordleKey>
                <JordleKey label="Z" state={keyboard.z ?? "empty"} onPress={() => addLetter("z")} />
                <JordleKey label="X" state={keyboard.x ?? "empty"} onPress={() => addLetter("x")} />
                <JordleKey label="C" state={keyboard.c ?? "empty"} onPress={() => addLetter("c")} />
                <JordleKey label="V" state={keyboard.v ?? "empty"} onPress={() => addLetter("v")} />
                <JordleKey label="B" state={keyboard.b ?? "empty"} onPress={() => addLetter("b")} />
                <JordleKey label="N" state={keyboard.n ?? "empty"} onPress={() => addLetter("n")} />
                <JordleKey label="M" state={keyboard.m ?? "empty"} onPress={() => addLetter("m")} />
                <JordleKey
                  label="Delete"
                  wide
                  state="empty"
                  onPress={removeLetter}
                  ariaLabel="Delete letter"
                >
                  <span className="jordle-key__icon">
                    <BackspaceIcon />
                  </span>
                </JordleKey>
              </div>
            </div>
          </article>
        </section>
      </main>

      {isHelpOpen ? (
        <div
          className="jordle-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jordle-help-title"
          onClick={() => setIsHelpOpen(false)}
        >
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">How to play</span>
                <h2 id="jordle-help-title">Jordle rules</h2>
              </div>
              <button
                type="button"
                className="jordle-modal__close"
                aria-label="Close Jordle help"
                onClick={() => setIsHelpOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="jordle-modal__body">
              <p>Guess the six-letter word in six tries.</p>
              <p>After each guess, the tile colors tell you how close you are.</p>

              <div className="jordle-modal__example">
                <div className="jordle-modal__example-row">
                  <div className="jordle-tile is-correct">P</div>
                  <div className="jordle-tile">L</div>
                  <div className="jordle-tile">A</div>
                  <div className="jordle-tile">N</div>
                  <div className="jordle-tile">E</div>
                  <div className="jordle-tile">T</div>
                </div>
                <p><strong>Green</strong> means the letter is in the word and in the correct spot.</p>
              </div>

              <div className="jordle-modal__example">
                <div className="jordle-modal__example-row">
                  <div className="jordle-tile">R</div>
                  <div className="jordle-tile is-present">O</div>
                  <div className="jordle-tile">C</div>
                  <div className="jordle-tile">K</div>
                  <div className="jordle-tile">E</div>
                  <div className="jordle-tile">T</div>
                </div>
                <p><strong>Amber</strong> means the letter is in the word, but in a different spot.</p>
              </div>

              <div className="jordle-modal__example">
                <div className="jordle-modal__example-row">
                  <div className="jordle-tile is-miss">S</div>
                  <div className="jordle-tile">I</div>
                  <div className="jordle-tile">L</div>
                  <div className="jordle-tile">V</div>
                  <div className="jordle-tile">E</div>
                  <div className="jordle-tile">R</div>
                </div>
                <p><strong>Dark</strong> means the letter is not in the word.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isArchiveOpen ? (
        <div
          className="jordle-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jordle-archive-title"
          onClick={() => setIsArchiveOpen(false)}
        >
          <div className="glass-card jordle-modal__card jordle-archive-modal" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">Archive</span>
                <h2 id="jordle-archive-title">Previous Jordles</h2>
              </div>
              <button
                type="button"
                className="jordle-modal__close"
                aria-label="Close Jordle archive"
                onClick={() => setIsArchiveOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="jordle-modal__body">
              <p>Open any previous puzzle to review it or keep playing where you left off.</p>

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
                    <div className="jordle-archive-item__meta">
                      {entry.solved ? (
                        <span className="jordle-archive-chip is-solved">Solved</span>
                      ) : entry.failed ? (
                        <span className="jordle-archive-chip is-failed">Finished</span>
                      ) : entry.guesses > 0 ? (
                        <span className="jordle-archive-chip is-progress">{entry.guesses}/6 guesses</span>
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
        <div
          className="jordle-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jordle-summary-title"
          onClick={() => setIsSummaryOpen(false)}
        >
          <div className="glass-card jordle-modal__card" onClick={(event) => event.stopPropagation()}>
            <div className="jordle-modal__header">
              <div>
                <span className="section-heading__eyebrow">{solved ? "Puzzle solved" : "Board complete"}</span>
                <h2 id="jordle-summary-title">{solved ? "Nice work." : "That one got away."}</h2>
              </div>
              <button
                type="button"
                className="jordle-modal__close"
                aria-label="Close Jordle summary"
                onClick={() => setIsSummaryOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="jordle-modal__body">
              <p>
                {solved
                  ? `You solved Puzzle #${puzzleNumber} in ${summaryStats.attemptsUsed} ${
                      summaryStats.attemptsUsed === 1 ? "guess" : "guesses"
                    }.`
                  : `You used all ${JORDLE_MAX_GUESSES} guesses on Puzzle #${puzzleNumber}.`}
              </p>

              <div className="jordle-summary-grid">
                <div className="jordle-summary-stat">
                  <span>Attempts used</span>
                  <strong>{summaryStats.attemptsUsed}</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Letters found</span>
                  <strong>{summaryStats.lettersFoundPercent}%</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>Best row</span>
                  <strong>{summaryStats.bestRowPercent}%</strong>
                </div>
                <div className="jordle-summary-stat">
                  <span>{solved ? "Guesses left" : "Word"}</span>
                  <strong>{solved ? summaryStats.guessesRemaining : answer.toUpperCase()}</strong>
                </div>
              </div>

              {!solved ? (
                <p>
                  The answer was <strong>{answer.toUpperCase()}</strong>. Tomorrow’s board will be a new six-letter
                  word.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default JordlePage;
