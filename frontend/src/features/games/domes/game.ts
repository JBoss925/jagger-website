export const DOMES_BOARD_SIZE = 5;

export type DomesPlayerId = "sun" | "sea";
export type DomesPhase = "setup" | "select" | "move" | "build" | "gameOver";
export type DomesWorkerId = "sun-1" | "sun-2" | "sea-1" | "sea-2";

export type DomesCoordinate = {
  row: number;
  col: number;
};

export type DomesWorker = DomesCoordinate & {
  id: DomesWorkerId;
  player: DomesPlayerId;
};

export type DomesState = {
  towers: number[][];
  workers: DomesWorker[];
  currentPlayer: DomesPlayerId;
  phase: DomesPhase;
  selectedWorkerId: DomesWorkerId | null;
  winner: DomesPlayerId | null;
  winningReason: "level-three" | "trapped" | null;
  setupTurn: number;
  turn: number;
};

const SETUP_ORDER: DomesPlayerId[] = ["sun", "sun", "sea", "sea"];

const PLAYER_WORKERS: Record<DomesPlayerId, DomesWorkerId[]> = {
  sun: ["sun-1", "sun-2"],
  sea: ["sea-1", "sea-2"]
};

function createEmptyTowers() {
  return Array.from({ length: DOMES_BOARD_SIZE }, () =>
    Array.from({ length: DOMES_BOARD_SIZE }, () => 0)
  );
}

function isInsideBoard(row: number, col: number) {
  return row >= 0 && row < DOMES_BOARD_SIZE && col >= 0 && col < DOMES_BOARD_SIZE;
}

function getNeighbors(row: number, col: number) {
  const neighbors: DomesCoordinate[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (isInsideBoard(nextRow, nextCol)) {
        neighbors.push({ row: nextRow, col: nextCol });
      }
    }
  }

  return neighbors;
}

export function createInitialDomesState(): DomesState {
  return {
    towers: createEmptyTowers(),
    workers: [],
    currentPlayer: SETUP_ORDER[0],
    phase: "setup",
    selectedWorkerId: null,
    winner: null,
    winningReason: null,
    setupTurn: 0,
    turn: 1
  };
}

export function getWorkerAt(state: DomesState, row: number, col: number) {
  return state.workers.find((worker) => worker.row === row && worker.col === col) ?? null;
}

function getWorkerById(state: DomesState, workerId: DomesWorkerId) {
  return state.workers.find((worker) => worker.id === workerId) ?? null;
}

function getNextWorkerId(player: DomesPlayerId, existingWorkers: DomesWorker[]) {
  const ids = PLAYER_WORKERS[player];
  return ids.find((id) => !existingWorkers.some((worker) => worker.id === id)) ?? ids[0];
}

export function getLegalPlacements(state: DomesState) {
  if (state.phase !== "setup") {
    return [];
  }

  const cells: DomesCoordinate[] = [];

  for (let row = 0; row < DOMES_BOARD_SIZE; row += 1) {
    for (let col = 0; col < DOMES_BOARD_SIZE; col += 1) {
      if (!getWorkerAt(state, row, col)) {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}

export function getLegalMoves(state: DomesState, workerId: DomesWorkerId) {
  if (state.phase !== "select" && state.phase !== "move") {
    return [];
  }

  const worker = getWorkerById(state, workerId);
  if (!worker || worker.player !== state.currentPlayer) {
    return [];
  }

  const currentHeight = state.towers[worker.row][worker.col];

  return getNeighbors(worker.row, worker.col).filter(({ row, col }) => {
    const occupant = getWorkerAt(state, row, col);
    const targetHeight = state.towers[row][col];

    if (occupant) {
      return false;
    }

    if (targetHeight >= 4) {
      return false;
    }

    return targetHeight - currentHeight <= 1;
  });
}

export function getLegalBuilds(state: DomesState, workerId: DomesWorkerId) {
  if (state.phase !== "build") {
    return [];
  }

  const worker = getWorkerById(state, workerId);
  if (!worker || worker.player !== state.currentPlayer) {
    return [];
  }

  return getNeighbors(worker.row, worker.col).filter(({ row, col }) => {
    const occupant = getWorkerAt(state, row, col);
    const targetHeight = state.towers[row][col];

    if (occupant) {
      return false;
    }

    return targetHeight < 4;
  });
}

export function hasLegalTurn(state: DomesState, player: DomesPlayerId) {
  return state.workers.some(
    (worker) => worker.player === player && getLegalMoves({ ...state, currentPlayer: player, phase: "select" }, worker.id).length > 0
  );
}

export function getSelectableWorkers(state: DomesState) {
  if (state.phase !== "select") {
    return [];
  }

  return state.workers.filter(
    (worker) => worker.player === state.currentPlayer && getLegalMoves(state, worker.id).length > 0
  );
}

export function placeWorker(state: DomesState, row: number, col: number): DomesState {
  if (state.phase !== "setup" || getWorkerAt(state, row, col)) {
    return state;
  }

  const player = SETUP_ORDER[state.setupTurn];
  if (!player) {
    return state;
  }

  const nextWorkers = [
    ...state.workers,
    {
      id: getNextWorkerId(player, state.workers),
      player,
      row,
      col
    }
  ];

  const nextSetupTurn = state.setupTurn + 1;
  if (nextSetupTurn >= SETUP_ORDER.length) {
    return {
      ...state,
      workers: nextWorkers,
      phase: "select",
      currentPlayer: "sun",
      setupTurn: nextSetupTurn
    };
  }

  return {
    ...state,
    workers: nextWorkers,
    currentPlayer: SETUP_ORDER[nextSetupTurn],
    setupTurn: nextSetupTurn
  };
}

export function selectWorker(state: DomesState, workerId: DomesWorkerId): DomesState {
  if (state.phase !== "select") {
    return state;
  }

  const worker = getWorkerById(state, workerId);
  if (!worker || worker.player !== state.currentPlayer) {
    return state;
  }

  if (getLegalMoves(state, workerId).length === 0) {
    return state;
  }

  return {
    ...state,
    selectedWorkerId: workerId,
    phase: "move"
  };
}

export function moveWorker(state: DomesState, row: number, col: number): DomesState {
  if (state.phase !== "move" || !state.selectedWorkerId) {
    return state;
  }

  const legalMoves = getLegalMoves(state, state.selectedWorkerId);
  const isLegalMove = legalMoves.some((cell) => cell.row === row && cell.col === col);

  if (!isLegalMove) {
    return state;
  }

  const worker = getWorkerById(state, state.selectedWorkerId);
  if (!worker) {
    return state;
  }

  const nextWorkers = state.workers.map((currentWorker) =>
    currentWorker.id === worker.id ? { ...currentWorker, row, col } : currentWorker
  );

  const nextHeight = state.towers[row][col];
  if (nextHeight === 3) {
    return {
      ...state,
      workers: nextWorkers,
      phase: "gameOver",
      selectedWorkerId: null,
      winner: state.currentPlayer,
      winningReason: "level-three"
    };
  }

  return {
    ...state,
    workers: nextWorkers,
    phase: "build"
  };
}

export function buildAt(state: DomesState, row: number, col: number): DomesState {
  if (state.phase !== "build" || !state.selectedWorkerId) {
    return state;
  }

  const legalBuilds = getLegalBuilds(state, state.selectedWorkerId);
  const isLegalBuild = legalBuilds.some((cell) => cell.row === row && cell.col === col);

  if (!isLegalBuild) {
    return state;
  }

  const nextTowers = state.towers.map((towerRow) => [...towerRow]);
  nextTowers[row][col] = Math.min(nextTowers[row][col] + 1, 4);

  const nextPlayer: DomesPlayerId = state.currentPlayer === "sun" ? "sea" : "sun";

  if (!hasLegalTurn({ ...state, towers: nextTowers, currentPlayer: nextPlayer, phase: "select" }, nextPlayer)) {
    return {
      ...state,
      towers: nextTowers,
      phase: "gameOver",
      selectedWorkerId: null,
      winner: state.currentPlayer,
      winningReason: "trapped"
    };
  }

  return {
    ...state,
    towers: nextTowers,
    currentPlayer: nextPlayer,
    phase: "select",
    selectedWorkerId: null,
    turn: state.turn + 1
  };
}

export function cancelSelection(state: DomesState): DomesState {
  if (state.phase !== "move") {
    return state;
  }

  return {
    ...state,
    phase: "select",
    selectedWorkerId: null
  };
}

export function getCurrentPrompt(state: DomesState) {
  if (state.phase === "setup") {
    const placements = state.workers.filter((worker) => worker.player === state.currentPlayer).length;
    return placements === 0
      ? `${getPlayerLabel(state.currentPlayer)}: place your first builder.`
      : `${getPlayerLabel(state.currentPlayer)}: place your second builder.`;
  }

  if (state.phase === "select") {
    return `${getPlayerLabel(state.currentPlayer)}: choose a builder to move.`;
  }

  if (state.phase === "move") {
    return `${getPlayerLabel(state.currentPlayer)}: move to an adjacent space.`;
  }

  if (state.phase === "build") {
    return `${getPlayerLabel(state.currentPlayer)}: build next to that builder.`;
  }

  if (state.winner && state.winningReason === "level-three") {
    return `${getPlayerLabel(state.winner)} reached the third level and wins.`;
  }

  if (state.winner && state.winningReason === "trapped") {
    return `${getPlayerLabel(state.winner)} wins by trapping the other side.`;
  }

  return "Game over.";
}

export function getPlayerLabel(player: DomesPlayerId) {
  return player === "sun" ? "Sun" : "Sea";
}

export function isCellSelectable(state: DomesState, row: number, col: number) {
  if (state.phase === "setup") {
    return getLegalPlacements(state).some((cell) => cell.row === row && cell.col === col);
  }

  if (state.phase === "select") {
    return getSelectableWorkers(state).some((worker) => worker.row === row && worker.col === col);
  }

  if (state.phase === "move" && state.selectedWorkerId) {
    return getLegalMoves(state, state.selectedWorkerId).some((cell) => cell.row === row && cell.col === col);
  }

  if (state.phase === "build" && state.selectedWorkerId) {
    return getLegalBuilds(state, state.selectedWorkerId).some((cell) => cell.row === row && cell.col === col);
  }

  return false;
}
