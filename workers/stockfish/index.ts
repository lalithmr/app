export class StockfishEngine {
  private worker: Worker | null = null;
  private onMessage: ((message: string) => void) | null = null;

  init() {
    if (typeof window !== "undefined") {
      this.worker = new Worker("/stockfish.js");
      this.worker.onmessage = (event) => {
        if (this.onMessage) {
          this.onMessage(event.data);
        }
      };
      this.worker.postMessage("uci");
    }
  }

  evaluatePosition(fen: string, depth = 15, callback: (info: string) => void) {
    if (!this.worker) return;
    this.onMessage = callback;
    this.worker.postMessage("position fen " + fen);
    this.worker.postMessage("go depth " + depth);
  }

  quit() {
    if (this.worker) {
      this.worker.postMessage("quit");
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const engine = new StockfishEngine();
