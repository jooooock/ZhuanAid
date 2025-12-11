import type {
  Coordinate,
  DirectedTileGroup,
  Direction,
  DirectionName,
  EffectiveMove,
  Eliminate,
  Move,
} from '~/types/board';

export const DIRECTION: Record<DirectionName, Direction> = {
  UP: { dr: -1, dc: 0, name: 'UP' },
  DOWN: { dr: 1, dc: 0, name: 'DOWN' },
  LEFT: { dr: 0, dc: -1, name: 'LEFT' },
  RIGHT: { dr: 0, dc: 1, name: 'RIGHT' },
};

export class Board {
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
    return new Board(this.grid);
  }

  // 查询指定坐标是否在棋盘内
  inBoard(point: Coordinate) {
    return point.r >= 0 && point.r < this.rows && point.c >= 0 && point.c < this.cols;
  }

  // 查询指定坐标是否为空
  isHoleTile(point: Coordinate) {
    if (!this.inBoard(point)) {
      throw new Error(`坐标(${point.r}, ${point.c})不在棋盘内`);
    }
    return this.grid[point.r][point.c] === 0;
  }

  // 计算两个格子的距离（必须位于同一行/同一列）
  distance(p1: Coordinate, p2: Coordinate) {
    if (p1.r !== p2.r && p1.c !== p2.c) {
      throw new Error(`p1(${p1.r}, ${p1.c}) 和 p2(${p2.r}, ${p2.c}) 不在同一行/同一列，无法计算距离。`);
    }

    const v1 = Math.abs(p2.r - p1.r);
    const v2 = Math.abs(p2.c - p1.c);
    return Math.max(v1, v2);
  }

  // 取反方向
  reverseDir(direction: Direction) {
    switch (direction.name) {
      case 'UP':
        return DIRECTION.DOWN;
      case 'DOWN':
        return DIRECTION.UP;
      case 'LEFT':
        return DIRECTION.RIGHT;
      case 'RIGHT':
        return DIRECTION.LEFT;
      default:
        throw new Error(`无效的Direction name: <${direction.name}>`);
    }
  }

  // 格子内容是否相等
  isEqual(p1: Coordinate, p2: Coordinate): boolean {
    if (!this.inBoard(p1) || !this.inBoard(p2)) {
      return false;
    }

    return this.grid[p1.r][p1.c] === this.grid[p2.r][p2.c];
  }

  // 将格子朝指定方向移动一格
  moveTick(point: Coordinate, dir: Direction): Coordinate | null {
    if (!this.inBoard(point)) {
      return null;
    }

    const p = { ...point };
    p.r += dir.dr;
    p.c += dir.dc;
    if (!this.inBoard(p)) {
      return null;
    }
    return p;
  }

  // 查找格子在指定方向上的相邻格子，遇到空格跳过
  findNeighborTileSkipBlank(point: Coordinate, dir: Direction): Coordinate | null {
    if (!this.inBoard(point)) {
      return null;
    }

    const p = { ...point };
    p.r += dir.dr;
    p.c += dir.dc;
    if (!this.inBoard(p)) {
      return null;
    }
    if (!this.isHoleTile(p)) {
      return p;
    }

    return this.findNeighborTileSkipBlank(p, dir);
  }

  // 查找hole格子在指定方向上最近的最大可移动格子组
  findTileGroup(hole: Coordinate, direction: Direction): DirectedTileGroup | null {
    if (!this.isHoleTile(hole)) {
      throw new Error('参数错误: 该坐标为非 hole 节点');
    }

    const point = { ...hole };

    // 跳过开始的空格
    do {
      point.r += direction.dr;
      point.c += direction.dc;
    } while (this.inBoard(point) && this.isHoleTile(point));

    if (!this.inBoard(point)) {
      return null;
    }

    const start = { ...point };
    let end = { ...point };
    while (true) {
      const target = this.moveTick(end, direction);
      if (target && !this.isHoleTile(target)) {
        end = target;
      } else {
        break;
      }
    }

    return { start, end, direction };
  }

  // 查找所有可移动
  findAllMoveForHole(hole: Coordinate): Move[] {
    if (!this.isHoleTile(hole)) {
      throw new Error('参数错误: 该坐标为非 hole 节点');
    }

    const moves: Move[] = [];
    for (const direction of Object.values(DIRECTION)) {
      const tileGroup = this.findTileGroup(hole, direction);
      if (!tileGroup) continue;

      const distance = this.distance(tileGroup.start, hole);
      moves.push({
        direction: this.reverseDir(direction),
        distance: distance,
        target: tileGroup,
      });
    }

    return moves;
  }

  // 找出当前棋盘状态下存在的所有可消除的格子坐标对
  findAllEliminate() {
    const board = this.grid;
    const rows = this.rows;
    const cols = this.cols;

    const result: Eliminate[] = [];

    // 只检查 DOWN 和 RIGHT 方向，避免重复
    const checkDirs = [DIRECTION.DOWN, DIRECTION.RIGHT];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const point: Coordinate = { r, c };

        if (this.isHoleTile(point)) continue;

        for (const direction of checkDirs) {
          const point2 = this.findNeighborTileSkipBlank(point, direction);
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
  findHoleTiles() {
    const tiles: Coordinate[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const point: Coordinate = { r, c };
        if (this.isHoleTile(point)) {
          tiles.push(point);
        }
      }
    }
    return tiles;
  }

  // 找出棋盘中所有可能的移动
  findAllPossibleMoves() {
    const holes: Coordinate[] = this.findHoleTiles();
    const moves: Move[] = [];
    for (const point of holes) {
      // 找出这个空格四个方向上的有效可移动格子组
      moves.push(...this.findAllMoveForHole(point));
    }
    return moves;
  }

  // 评估移动的收益
  evaluate(move: Move) {
    const { target, direction, distance } = move;

    const effectiveMoves: EffectiveMove[] = [];

    for (let step = 1; step <= distance; step++) {
      const [board, range] = this.slide(target, direction, step);
      const eliminates = new Board(board).findAllEliminate();
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
      const key = `${move.direction.name}:${move.distance}:${move.value}:${move.point1.r}:${move.point1.c}:${move.point2.r}:${move.point2.r}`;
      map.set(key, move);
    }
    return Array.from(map.values());
  }

  // 滑动 group
  slide(group: DirectedTileGroup, dir: Direction, distance: number): [number[][], DirectedTileGroup] {
    const board = this.clone();

    const points = this.getGroupPoints(group);

    for (const point of points) {
      const value = board.grid[point.r][point.c];
      point.r += dir.dr * distance;
      point.c += dir.dc * distance;

      board.grid[point.r][point.c] = value;
    }
    const range: DirectedTileGroup = {
      start: points[0],
      end: points[points.length - 1],
      direction: dir,
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

  execMove(move: Move) {
    const { target, direction, distance } = move;
    const [board] = this.slide(target, direction, distance);
    return board;
  }

  getGroupPoints(group: DirectedTileGroup) {
    const points: Coordinate[] = [];
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

  inRange(eliminate: Eliminate, range: DirectedTileGroup): boolean {
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
}
