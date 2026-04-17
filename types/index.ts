export type LeagueKey = "pawn" | "bishop" | "knight" | "rook" | "queen" | "king";

export type TaskKey = "play_1_game" | "win_1_game" | "solve_1_puzzle";

export interface LevelTaskState {
  play_1_game?: boolean;
  win_1_game?: boolean;
  solve_1_puzzle?: boolean;
  puzzleId?: string;
  updatedAt?: string;
}

export interface UserProfile {
  username: string;
  lichessUsername: string;
  league: LeagueKey;
  level: number;
  points: number;
  streak: number;
  lastGameId: string;
  taskProgress?: Record<string, LevelTaskState>;
  puzzleProgress?: PuzzleProgress;
  createdAt?: string;
  updatedAt?: string;
}

export interface PuzzleProgress {
  completedCount: number;
  streak: number;
  lastCompletedAt?: string;
  lastPuzzleId?: string;
  completedPuzzleIds?: string[];
}

export interface LevelConfig {
  id: string;
  league: LeagueKey;
  level: number;
  title: string;
  subtitle: string;
  tasks: TaskKey[];
  rewardPoints: number;
  locked: boolean;
}

export interface LichessPlayerUser {
  id?: string;
  name?: string;
}

export interface LichessPlayer {
  user?: LichessPlayerUser;
  rating?: number;
  ratingDiff?: number;
  result?: string;
}

export interface LichessGame {
  id: string;
  createdAt?: number;
  speed?: string;
  winner?: "white" | "black";
  status?: string;
  opening?: {
    eco?: string;
    name?: string;
  };
  players?: {
    white?: LichessPlayer;
    black?: LichessPlayer;
  };
}

export interface LichessPuzzleResponse {
  game?: {
    id?: string;
    pgn?: string;
    fen?: string;
    clock?: string;
    perf?: {
      name?: string;
    };
    players?: Array<{
      name?: string;
      color?: "white" | "black";
    }>;
  };
  puzzle?: {
    id?: string;
    rating?: number;
    plays?: number;
    solution?: string[];
    themes?: string[];
    initialPly?: number;
    fen?: string;
  };
  fen?: string;
}

export interface PuzzleData {
  id: string;
  rating?: number;
  plays?: number;
  themes: string[];
  solution: string[];
  initialFen: string;
  orientation: "white" | "black";
  sourceGameId?: string;
  perfName?: string;
  clock?: string;
}

export interface ApiErrorResponse {
  error: string;
}
