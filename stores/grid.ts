import { defineStore } from 'pinia';
import type { EffectiveMove, Eliminate, Move } from '~/types/board';
import { Board } from '~/utils/Board';

interface GridState {
  grid: number[][];
}

export const useGridStore = defineStore('grid', {
  state: (): GridState => ({
    /**
     * 生成 14x10 的空棋盘
     * Array.from({ length: 14 }).map((_, i) => Array.from({ length: 10 }).fill(0));
     */
    grid: [
      [31, 22, 0, 0, 10, 27, 0, 0, 0, 16],
      [26, 13, 0, 0, 0, 0, 0, 0, 0, 18],
      [33, 12, 17, 11, 0, 6, 0, 0, 11, 38],
      [7, 14, 0, 21, 0, 0, 0, 0, 23, 34],
      [8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [9, 29, 34, 0, 28, 31, 0, 0, 0, 0],
      [21, 10, 0, 0, 19, 0, 0, 0, 0, 29],
      [40, 0, 0, 35, 0, 0, 0, 0, 0, 30],
      [0, 0, 37, 0, 0, 0, 0, 26, 0, 0],
      [6, 13, 0, 0, 0, 0, 0, 32, 0, 12],
      [0, 0, 0, 0, 0, 18, 0, 0, 0, 30],
      [37, 29, 0, 7, 40, 33, 0, 28, 22, 32],
      [14, 8, 16, 0, 0, 0, 0, 38, 23, 0],
      [9, 35, 19, 29, 17, 0, 27, 0, 0, 0],
    ],
  }),
  getters: {
    rows(): number {
      return this.grid.length;
    },
    cols(): number {
      return this.grid[0].length;
    },
    gridIsEmpty(): boolean {
      for (const row of this.grid) {
        for (const cell of row) {
          if (cell !== 0) {
            return false;
          }
        }
      }
      return true;
    },
    eliminates(): Eliminate[] {
      const board = new Board(this.grid);
      return board.findAllEliminate();
    },
    moves(): EffectiveMove[] {
      const board = new Board(this.grid);
      const moves = board.findAllPossibleMoves();

      let result: EffectiveMove[] = [];
      for (const move of moves) {
        const p = board.evaluate(move);
        if (p.length > 0) {
          result.push(...p);
        }
      }
      return board.deduplication(result);
    },
  },
  actions: {
    execMove(move: Move) {
      const board = new Board(this.grid);
      this.grid = board.execMove(move);
    },
  },
});
