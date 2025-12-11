import { defineStore } from 'pinia';
import toastFactory from '~/composables/toast';
import type { EffectiveMove, EliminateBlock, MaximumMove } from '~/types/board';
import { Board } from '~/utils/Board';
import { highlight } from '~/utils/helper';

/**
 * 生成 14x10 的空棋盘
 * Array.from({ length: 14 }).map((_, i) => Array.from({ length: 10 }).fill(0));
 */

interface GridState {
  grid: number[][];
  eliminating: boolean;
}

export const useGridStore = defineStore('grid', {
  state: (): GridState => ({
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
    eliminating: false,
  }),
  getters: {
    // 棋盘行数
    rows(): number {
      return this.grid.length;
    },
    // 棋盘列数
    cols(): number {
      return this.grid[0].length;
    },

    // 棋盘是否为空，为空表示全部格子已消除
    gridIsEmpty(): boolean {
      return new Board(this.grid).isSuccess();
    },

    // 所有可消除的块
    eliminates(): EliminateBlock[] {
      const board = new Board(this.grid);
      return board.findAllEliminateBlock();
    },

    // 所有可进行消除的移动操作
    moves(): EffectiveMove[] {
      const board = new Board(this.grid);
      return board.findAllEffectiveMoves();
    },
  },
  actions: {
    // 执行【移动】操作
    async execMove(move: EffectiveMove): Promise<void> {
      return new Promise(async resolve => {
        await highlight({ point1: move.tileVector.start, point2: move.tileVector.end }, 500);

        const board = new Board(this.grid);
        const [grid, movedTileVector] = board.execMove(move);
        this.grid = grid;

        setTimeout(async () => {
          await highlight({ point1: movedTileVector.start, point2: movedTileVector.end }, 200);
          resolve();
        }, 0);
      });
    },

    // 执行【消除】操作
    async execEliminate(eliminate: EliminateBlock) {
      await highlight(eliminate, 200);

      const board = new Board(this.grid);
      const grid = board.execEliminate(eliminate);
      if (grid) {
        this.grid = grid;
      }
    },

    // 执行【全部消除】操作
    async execEliminateAll() {
      this.eliminating = true;

      while (true) {
        for (const eliminate of this.eliminates) {
          await this.execEliminate(eliminate);
        }

        if (this.eliminates.length === 0) {
          break;
        }
      }
      this.eliminating = false;
    },

    async magic() {
      const toast = toastFactory();

      while (true) {
        if (this.moves.length === 0 && this.eliminates.length === 0) {
          if (this.gridIsEmpty) {
            console.log('成功');
            toast.success('执行结束', '已成功消除所有格子');
          } else {
            console.log('失败');
            toast.error('执行结束', '出现死局');
          }
          break;
        }

        // 执行【全部消除】
        await this.execEliminateAll();

        // 执行第一个【移动】
        const move = this.moves.shift();
        if (move) {
          await this.execMove(move);
        }
      }
    },
  },
});
