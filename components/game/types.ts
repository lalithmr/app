export type GameMode = "vs_ai" | "practice";

export interface GameState {
  fen: string;
  turn: "w" | "b";
  isGameOver: boolean;
  result: "win" | "lose" | "draw" | null;
  moves: string[];
}
