export type DirName = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface DirObj {
  dr: number;
  dc: number;
  name: DirName;
}

export const DIR: Record<DirName, DirObj> = {
  UP: { dr: -1, dc: 0, name: 'UP' },
  DOWN: { dr: 1, dc: 0, name: 'DOWN' },
  LEFT: { dr: 0, dc: -1, name: 'LEFT' },
  RIGHT: { dr: 0, dc: 1, name: 'RIGHT' },
};

interface Point {
  r: number;
  c: number;
}

interface Eliminate {
  point1: Point;
  point2: Point;
  value: number;
}

export interface PointGroup {
  start: Point;
  end: Point;
}

interface Move {
  dir: DirObj;
  distance: number;
  group: PointGroup;
}

export interface EffectiveMove extends Move, Eliminate {}

export class CheckerBoard {
  grid: number[][];
  rows: number;
  cols: number;

  constructor(grid: number[][]) {
    this.grid = grid.map((row: number[]) => [...row]);
    this.rows = grid.length;
    this.cols = grid[0].length;
  }

  // 复制棋盘
  clone() {
    return new CheckerBoard(this.grid);
  }

  // 坐标是否在棋盘内
  isValid(p: Point) {
    return p.r >= 0 && p.r < this.rows && p.c >= 0 && p.c < this.cols;
  }

  // 指定位置是否为空
  isBlank(p: Point) {
    return this.grid[p.r][p.c] === 0;
  }

  // 计算两点的距离
  distance(p1: Point, p2: Point) {
    if (p1.r !== p2.r && p1.c !== p2.c) {
      return -1;
    }
    const v1 = Math.abs(p2.r - p1.r);
    const v2 = Math.abs(p2.c - p1.c);
    return Math.max(v1, v2);
  }

  reverseDir(dir: DirObj) {
    switch (dir.name) {
      case 'UP':
        return DIR.DOWN;
      case 'DOWN':
        return DIR.UP;
      case 'LEFT':
        return DIR.RIGHT;
      case 'RIGHT':
        return DIR.LEFT;
      default:
        throw new Error(`Unrecognized dir "${dir.name}"`);
    }
  }

  // 格子内容是否相等
  isEqual(p1: Point, p2: Point): boolean {
    if (!this.isValid(p1) || !this.isValid(p2)) {
      return false;
    }

    return this.grid[p1.r][p1.c] === this.grid[p2.r][p2.c];
  }

  // 将格子朝指定方向移动一格
  move(point: Point, dir: DirObj): Point | null {
    if (!this.isValid(point)) {
      return null;
    }

    const p = { ...point };
    p.r += dir.dr;
    p.c += dir.dc;
    if (!this.isValid(p)) {
      return null;
    }
    return p;
  }

  // 查找格子在指定方向上的相邻格子，遇到空格跳过
  findCellSkipBlank(p: Point, dir: DirObj): Point | null {
    if (!this.isValid(p)) {
      return null;
    }

    const p2 = { ...p };
    p2.r += dir.dr;
    p2.c += dir.dc;
    if (!this.isValid(p2)) {
      return null;
    }
    if (!this.isBlank(p2)) {
      return p2;
    }

    return this.findCellSkipBlank(p2, dir);
  }

  // 查找格子在指定方向上的最大可移动格子组
  findCellGroup(blank: Point, dir: DirObj): PointGroup | null {
    if (!this.isBlank(blank)) {
      return null;
    }

    const point = { ...blank };
    // 跳过开始的空格
    do {
      point.r += dir.dr;
      point.c += dir.dc;
    } while (this.isValid(point) && this.isBlank(point));
    if (!this.isValid(point)) {
      return null;
    }

    const start = { ...point };
    let end = { ...point };
    while (true) {
      const target = this.move(end, dir);
      if (target && !this.isBlank(target)) {
        end = target;
      } else {
        break;
      }
    }

    return { start, end };
  }

  // 查找所有可移动
  findAllMoveForBlank(blank: Point): Move[] {
    if (!this.isBlank(blank)) return [];

    const moves: Move[] = [];
    for (const dir of Object.values(DIR)) {
      const group = this.findCellGroup(blank, dir);
      if (!group) continue;

      const distance = this.distance(group.start, blank);
      moves.push({
        dir: this.reverseDir(dir),
        distance: distance,
        group: group,
      });
    }

    return moves;
  }

  // 找出棋盘中所有可消除的格子坐标
  findAllEliminate() {
    const board = this.grid;
    const rows = this.rows;
    const cols = this.cols;

    const result: Eliminate[] = [];

    // 只检查 DOWN 和 RIGHT 方向，避免重复
    const checkDirs = [DIR.DOWN, DIR.RIGHT];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const point: Point = { r, c };

        if (this.isBlank(point)) continue;

        for (const dir of checkDirs) {
          const point2 = this.findCellSkipBlank(point, dir);
          if (point2 && this.isEqual(point, point2)) {
            result.push({
              value: board[r][c],
              point1: point,
              point2: point2,
            });
          }
        }
      }
    }

    return result;
  }

  // 找出棋盘中所有的空格坐标
  findBlankCells() {
    const blanks: Point[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const point: Point = { r, c };
        if (this.isBlank(point)) {
          blanks.push(point);
        }
      }
    }
    return blanks;
  }

  // 找出棋盘中所有可能的移动
  findAllPossibleMoves() {
    const blanks: Point[] = this.findBlankCells();
    const moves: Move[] = [];
    for (const point of blanks) {
      // 找出这个空格四个方向上的有效可移动格子组
      moves.push(...this.findAllMoveForBlank(point));
    }
    return moves;
  }

  // 评估移动的收益
  evaluate(move: Move) {
    const { group, dir, distance } = move;

    const effectiveMoves: EffectiveMove[] = [];

    for (let step = 1; step <= distance; step++) {
      const [board, range] = this.slide(group, dir, step);
      const eliminates = new CheckerBoard(board).findAllEliminate();
      for (const eliminate of eliminates) {
        if (this.inRange(eliminate, range)) {
          effectiveMoves.push({ ...move, distance: step, ...eliminate });
        }
      }
    }

    // 去重
    return this.deduplication(effectiveMoves);
  }

  deduplication(moves: EffectiveMove[]): EffectiveMove[] {
    const map = new Map<string, EffectiveMove>();
    for (const move of moves) {
      const key = `${move.dir.name}:${move.distance}:${move.value}:${move.point1.r}:${move.point1.c}:${move.point2.r}:${move.point2.r}`;
      map.set(key, move);
    }
    return Array.from(map.values());
  }

  // 滑动 group
  slide(group: PointGroup, dir: DirObj, distance: number): [number[][], PointGroup] {
    const board = this.clone();

    const points = this.getGroupPoints(group);

    for (const point of points) {
      const value = board.grid[point.r][point.c];
      point.r += dir.dr * distance;
      point.c += dir.dc * distance;

      board.grid[point.r][point.c] = value;
    }
    const range: PointGroup = {
      start: points[0],
      end: points[points.length - 1],
    };

    // 留空的位置改为0
    let endR = group.end.r;
    let endC = group.end.c;
    for (let i = 0; i < distance; i++) {
      board.grid[endR][endC] = 0;
      endR += dir.dr;
      endC += dir.dc;
    }

    return [board.grid, range];
  }

  getGroupPoints(group: PointGroup) {
    const points: Point[] = [];
    points.push({ ...group.start });
    if (group.start.r === group.end.r) {
      // 同一行
      if (group.start.c > group.end.c) {
        // 从右到左
        for (let c = group.start.c - 1; c >= group.end.c; c--) {
          points.push({ r: group.start.r, c: c });
        }
      } else {
        // 从左到右
        for (let c = group.start.c + 1; c <= group.end.c; c++) {
          points.push({ r: group.start.r, c: c });
        }
      }
    } else {
      // 同一列
      if (group.start.r > group.end.r) {
        // 从下到上
        for (let r = group.start.r - 1; r >= group.end.r; r--) {
          points.push({ r: r, c: group.start.c });
        }
      } else {
        // 从上到下
        for (let r = group.start.r + 1; r <= group.end.r; r++) {
          points.push({ r: r, c: group.start.c });
        }
      }
    }
    return points;
  }

  inRange(eliminate: Eliminate, range: PointGroup): boolean {
    const { point1, point2 } = eliminate;
    const isGroupHorizontal = range.start.r === range.end.r;
    if (isGroupHorizontal) {
      const cRange = [range.start.c, range.end.c].sort((a, b) => a - b);
      return (
        (point1.r === range.start.r && point1.c >= cRange[0] && point1.c <= cRange[1]) ||
        (point2.r === range.start.r && point2.c >= cRange[0] && point2.c <= cRange[1])
      );
    } else {
      const rRange = [range.start.r, range.end.r].sort((a, b) => a - b);
      return (
        (point1.c === range.start.c && point1.r >= rRange[0] && point1.r <= rRange[1]) ||
        (point2.c === range.start.c && point2.r >= rRange[0] && point2.r <= rRange[1])
      );
    }
  }

  formatEffectiveMove(move: EffectiveMove) {
    const { group: block, dir, distance, point1, point2, value } = move;

    const dirMap: Record<DirName, string> = {
      UP: '上滑',
      DOWN: '下滑',
      LEFT: '左滑',
      RIGHT: '右滑',
    };

    let target = '';
    const { start, end } = block;
    if (start.r === end.r && start.c === end.c) {
      target = `第 ${start.r + 1} 行 第 ${start.c + 1} 列`;
    } else if (start.r === end.r) {
      target = `第 ${start.r + 1} 行 从列 ${start.c + 1} 到 ${end.c + 1} 的连续块`;
    } else if (start.c === end.c) {
      target = `第 ${start.c + 1} 列 从行 ${start.r + 1} 到 ${end.r + 1} 的连续块`;
    }
    const eliminate = `(${point1.r}, ${point1.c}) - (${point2.r}, ${point2.c})`;
    console.log('描述:');
    console.log(`${target} ${dirMap[dir.name]} ${distance} 格，滑动后可消除 ${eliminate}(值为${value})`);
  }
}
