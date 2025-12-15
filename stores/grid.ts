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
  backupGrid: number[][];
  path: number[];
  eliminating: boolean;
  autoRunning: boolean;
  isStop: boolean;
}

interface Trip {
  index: number;
  count: number;
  choose: number;
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
    backupGrid: [
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
    path: [],
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

    // 棋盘是否已全部消除
    isSuccess(): boolean {
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

      // 备份棋盘状态
      this.backupGrid = this.grid.map(row => [...row]);

      const path: Trip[] = [];
      let index = 0;
      while (true) {
        if (this.isStop) {
          break;
        }

        if (this.moves.length === 0 && this.eliminates.length === 0) {
          if (this.isSuccess) {
            console.log('成功');
            toast.success('执行结束', '已成功消除所有格子');
          }
          break;
        }

        // 执行【全部消除】
        await this.execEliminateAll();

        if (this.moves.length > 0) {
          // 执行第一个【移动】
          path.push({ index: index, count: this.moves.length, choose: 0 });
          const move = this.moves[0];
          await this.execMove(move);

          index += 1;
        }
      }

      if (!this.isStop && !this.isSuccess) {
        console.log('执行结束: 出现死局, 继续尝试其他可能');
        let max = 20;

        let lastIndex = path.at(-1)!.index;
        let lastChoose = path.at(-1)!.choose;
        while (true) {
          const nuxtIndexChoose = this.findNextIndexChoose(path, lastIndex, lastChoose)!;
          if (!nuxtIndexChoose) {
            break;
          }
          lastIndex = nuxtIndexChoose[0];
          lastChoose = nuxtIndexChoose[1];
          const success = await this.tryAgain(lastIndex, lastChoose);
          if (success || max-- === 0) {
            break;
          }
        }
      }

      this.autoRunning = false;
      this.isStop = false;
    },

    async tryAgain(targetIndex: number, targetChoose: number): Promise<boolean> {
      const toast = toastFactory();

      // 恢复棋盘状态
      this.grid = this.backupGrid.map(row => [...row]);

      let index = 0;
      while (true) {
        if (this.isStop) {
          break;
        }

        if (this.moves.length === 0 && this.eliminates.length === 0) {
          if (this.isSuccess) {
            console.log('成功');
            toast.success('执行结束', '已成功消除所有格子');
            console.log(`第${targetIndex}步选择序号${targetChoose + 1}`);
          }
          break;
        }

        // 执行【全部消除】
        await this.execEliminateAll();

        if (this.moves.length > 0) {
          // 执行第一个【移动】
          let choose = 0;
          if (index === targetIndex) {
            choose = targetChoose;
          }
          const move = this.moves[choose];
          await this.execMove(move);

          index += 1;
        }
      }

      return this.isSuccess;
    },

    findNextIndexChoose(path: Trip[], lastIndex: number, lastChoose: number): [number, number] | null {
      const lastTrip = path[lastIndex]!;
      if (lastChoose < lastTrip.count - 1) {
        return [lastIndex, lastChoose + 1];
      } else if (lastIndex > 0) {
        return this.findNextIndexChoose(path, --lastIndex, 0);
      } else {
        return null;
      }
    },

    stop() {
      this.isStop = true;
    },
  },
});
