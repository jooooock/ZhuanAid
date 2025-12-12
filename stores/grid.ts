import { defineStore } from 'pinia';
import toastFactory from '~/composables/toast';
import { SUPPORTED_MODELS } from '~/config';
import { useSettingStore } from '~/stores/setting';
import type { EffectiveMove, EliminateBlock } from '~/types/board';
import { Board } from '~/utils/Board';
import { BoardParser } from '~/utils/BoardParser';
import { cropImage, gridIsValid, highlight } from '~/utils/helper';

// 生成 14x10 的空棋盘
// Array.from({ length: 14 }).map((_, i) => Array.from({ length: 10 }).fill(0));

interface GridState {
  loading: boolean;
  phase: string;
  grid: number[][];
  eliminating: boolean;
  autoRunning: boolean;
  isStop: boolean;
}

export const useGridStore = defineStore('grid', {
  state: (): GridState => ({
    loading: false,
    phase: '',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    eliminating: false,
    autoRunning: false,
    isStop: false,
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
    // 加载棋盘
    async load(file: File) {
      const toast = toastFactory();
      const settingStore = useSettingStore();

      const targetModel = SUPPORTED_MODELS.find(model => model.id === settingStore.model);
      if (!targetModel) {
        console.warn(`未找到指定的手机型号: ${settingStore.model}`);
        toast.warning('棋盘加载失败', `未找到指定的手机型号: ${settingStore.model}`);
        return;
      }

      this.phase = '';
      const parser = new BoardParser(status => {
        this.phase = status;
      });

      try {
        this.loading = true;
        this.grid = Array.from({ length: settingStore.rows }).map(
          () => Array.from({ length: settingStore.cols }).fill(0) as number[]
        );

        // 裁剪图片
        const boardAreaFile = await cropImage(file, targetModel.x1, targetModel.y1, targetModel.x2, targetModel.y2);
        const grid = await parser.parse(boardAreaFile, settingStore.rows, settingStore.cols);
        console.log('提取的棋盘数据为:', grid);
        if (gridIsValid(grid)) {
          toast.success('棋盘加载成功', '现在可以开始验证了');
          this.grid = grid;
        } else {
          toast.error('棋盘加载失败', '部分图标无法匹配，请确认素材库是否包含全部图标。');
        }
      } catch (error: any) {
        toast.error('棋盘加载失败', error.message);
      } finally {
        this.loading = false;
      }
    },

    // 执行【移动】操作
    async execMove(move: EffectiveMove): Promise<void> {
      const settingStore = useSettingStore();

      return new Promise(async resolve => {
        await highlight({ point1: move.tileVector.start, point2: move.tileVector.end }, settingStore.autoPlayDuration);

        const board = new Board(this.grid);
        const [grid, movedTileVector] = board.execMove(move);
        this.grid = grid;

        setTimeout(async () => {
          await highlight(
            { point1: movedTileVector.start, point2: movedTileVector.end },
            settingStore.autoPlayDuration
          );
          resolve();
        }, 0);
      });
    },

    // 执行【消除】操作
    async execEliminate(eliminate: EliminateBlock) {
      const settingStore = useSettingStore();

      await highlight(eliminate, settingStore.autoPlayDuration);

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

    // 自动执行
    async magic() {
      const toast = toastFactory();
      this.autoRunning = true;

      while (true) {
        if (this.isStop) {
          break;
        }

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

      this.autoRunning = false;
      this.isStop = false;
    },

    stop() {
      this.isStop = true;
    },
  },
});
