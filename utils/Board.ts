import type {
  Coordinate,
  Direction,
  DirectionName,
  EffectiveMove,
  EliminateBlock,
  EliminatePointPosition,
  MaximumMove,
  TileVector,
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

  // 复制棋盘状态
  clone() {
    return new Board(this.grid);
  }

  // 棋盘是否全部消除
  isSuccess(): boolean {
    for (const row of this.grid) {
      for (const cell of row) {
        if (cell !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  // 格式化坐标
  formatCoordinate(coordinate: Coordinate): string {
    return `(R${coordinate.r + 1},C${coordinate.c + 1})`;
  }

  // 格式化格子的信息
  formatTileInfo(point: Coordinate, includeValue = true): string {
    let msg = `坐标:(R${point.r + 1},C${point.c + 1})`;
    if (includeValue) {
      msg += `,值:${this.getTileValue(point)}`;
    }
    return msg;
  }

  // 获取格子的值
  getTileValue(point: Coordinate): number {
    if (!this.inBoard(point)) {
      throw new Error(`格子${this.formatTileInfo(point, false)}不在棋盘内`);
    }
    return this.grid[point.r][point.c];
  }

  // 设置格子的值
  setTileValue(point: Coordinate, value: number) {
    if (!this.inBoard(point)) {
      throw new Error(`格子${this.formatTileInfo(point, false)}不在棋盘内`);
    }
    this.grid[point.r][point.c] = value;
  }

  // 查询指定坐标是否在棋盘内
  inBoard(point: Coordinate) {
    return point.r >= 0 && point.r < this.rows && point.c >= 0 && point.c < this.cols;
  }

  // 格子是否为空
  isHoleTile(point: Coordinate) {
    if (!this.inBoard(point)) {
      throw new Error(`${this.formatTileInfo(point, false)}不在棋盘内`);
    }
    return this.grid[point.r][point.c] === 0;
  }

  // 计算两个格子的距离（必须位于同一行/同一列）
  distance(p1: Coordinate, p2: Coordinate) {
    if (p1.r !== p2.r && p1.c !== p2.c) {
      throw new Error(
        `p1${this.formatTileInfo(p1, false)} 和 p2${this.formatTileInfo(p2)} 不在同一行/同一列，无法计算距离。`
      );
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
        throw new Error(`无效的方向: <${direction.name}>`);
    }
  }

  // 格子的值是否相等
  isEqual(p1: Coordinate, p2: Coordinate): boolean {
    if (!this.inBoard(p1) || !this.inBoard(p2)) {
      throw new Error(`p1${this.formatTileInfo(p1, false)} 或 p2${this.formatTileInfo(p2, false)} 不在棋盘内`);
    }

    return this.grid[p1.r][p1.c] === this.grid[p2.r][p2.c];
  }

  tick(point: Coordinate, direction: Direction, distance: number): Coordinate | null {
    if (!this.inBoard(point)) {
      return null;
    }

    const p = { ...point };
    p.r += direction.dr * distance;
    p.c += direction.dc * distance;

    if (!this.inBoard(p)) {
      return null;
    }

    return p;
  }

  // 查找格子在指定方向上的邻居，返回邻居的坐标，skipHole=false表示不跳过 Hole 节点(空隙节点)
  findNeighborTile(point: Coordinate, direction: Direction, skipHole = false): Coordinate | null {
    if (!this.inBoard(point)) {
      return null;
    }

    const p = { ...point };
    p.r += direction.dr;
    p.c += direction.dc;
    if (!this.inBoard(p)) {
      return null;
    }

    if (!skipHole) {
      return p;
    }

    if (!this.isHoleTile(p)) {
      return p;
    }

    return this.findNeighborTile(p, direction, skipHole);
  }

  // 查找 hole 节点在指定方向上最近的最大可移动格子组
  findTileVector(hole: Coordinate, direction: Direction): TileVector | null {
    if (!this.inBoard(hole)) {
      throw new Error(`${this.formatTileInfo(hole, false)}不在棋盘内`);
    }
    if (!this.isHoleTile(hole)) {
      throw new Error(`参数错误: ${this.formatTileInfo(hole)}为非 hole 节点`);
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
      const nextTile = this.findNeighborTile(end, direction);
      if (nextTile && !this.isHoleTile(nextTile)) {
        end = nextTile;
      } else {
        break;
      }
    }

    return { start, end, direction };
  }

  // 查询 TileVector 上的所有坐标点(点的顺序与向量保持一致)
  getTileVectorPoints(tileVector: TileVector): Coordinate[] {
    const points: Coordinate[] = [];

    if (tileVector.direction.name === 'UP') {
      for (let r = tileVector.start.r; r >= tileVector.end.r; r--) {
        points.push({ r: r, c: tileVector.start.c });
      }
    } else if (tileVector.direction.name === 'DOWN') {
      for (let r = tileVector.start.r; r <= tileVector.end.r; r++) {
        points.push({ r: r, c: tileVector.start.c });
      }
    } else if (tileVector.direction.name === 'LEFT') {
      for (let c = tileVector.start.c; c >= tileVector.end.c; c--) {
        points.push({ r: tileVector.start.r, c: c });
      }
    } else if (tileVector.direction.name === 'RIGHT') {
      for (let c = tileVector.start.c; c <= tileVector.end.c; c++) {
        points.push({ r: tileVector.start.r, c: c });
      }
    }

    return points;
  }

  // 查找给定空隙的所有的 MaximumMove
  findMaximumMoveForHole(hole: Coordinate): MaximumMove[] {
    if (!this.inBoard(hole)) {
      throw new Error(`${this.formatTileInfo(hole, false)}不在棋盘内`);
    }
    if (!this.isHoleTile(hole)) {
      throw new Error(`参数错误: ${this.formatTileInfo(hole)}为非 hole 节点`);
    }

    const moves: MaximumMove[] = [];
    for (const direction of Object.values(DIRECTION)) {
      const tileVector = this.findTileVector(hole, direction);
      if (!tileVector) continue;

      const distance = this.distance(tileVector.start, hole);
      moves.push({
        direction: this.reverseDir(direction),
        distance: distance,
        tileVector: tileVector,
      });
    }

    return moves;
  }

  // 找出棋盘上的所有可消除块
  findAllEliminateBlock() {
    const board = this.grid;
    const rows = this.rows;
    const cols = this.cols;

    const blocks: EliminateBlock[] = [];

    // 只检查 DOWN 和 RIGHT 方向，避免重复
    const checkDirs = [DIRECTION.DOWN, DIRECTION.RIGHT];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const point: Coordinate = { r, c };

        if (this.isHoleTile(point)) continue;

        for (const direction of checkDirs) {
          const neighborTile = this.findNeighborTile(point, direction, true);
          if (neighborTile && this.isEqual(point, neighborTile)) {
            blocks.push({
              value: board[r][c],
              point1: point,
              point2: neighborTile,
            });
          }
        }
      }
    }

    return blocks;
  }

  // 找出棋盘中所有的空格坐标
  findHoleTiles(): Coordinate[] {
    const tiles: Coordinate[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const point: Coordinate = { r, c };
        if (this.isHoleTile(point)) {
          tiles.push({ ...point });
        }
      }
    }
    return tiles;
  }

  // 找出棋盘上的所有 MaximumMove
  private findAllMaximumMoves(): MaximumMove[] {
    const holes: Coordinate[] = this.findHoleTiles();
    const moves: MaximumMove[] = [];
    for (const hole of holes) {
      // 找出这个空格在四个方向上的 TileVector
      moves.push(...this.findMaximumMoveForHole(hole));
    }
    return moves;
  }

  // 将 TileVector 朝指定方向移动指定距离，返回新的棋盘状态和移动后的 vector
  private slide(tileVector: TileVector, direction: Direction, distance: number): [number[][], TileVector] {
    const board = this.clone();

    // 将 TileVector 上的所有点进行移动
    const points = this.getTileVectorPoints(tileVector);
    for (const point of points) {
      const value = board.getTileValue(point);
      point.r += direction.dr * distance;
      point.c += direction.dc * distance;
      board.setTileValue(point, value);
    }

    // 移动后留空的位置改为0
    // 注意：移动不会修改tileVector，因为 getTileVectorPoints 是拷贝复制
    const p = { ...tileVector.end };
    for (let i = 0; i < distance; i++) {
      board.setTileValue(p, 0);
      p.r += direction.dr;
      p.c += direction.dc;
    }

    const movedVector: TileVector = {
      start: points[0],
      end: points[points.length - 1],
      direction: tileVector.direction,
    };

    return [board.grid, movedVector];
  }

  // 点的坐标是否在 vector 上面
  private isPointInVector(point: Coordinate, vector: TileVector): boolean {
    if (vector.direction.name === 'UP') {
      return point.c === vector.start.c && point.r <= vector.start.r && point.r >= vector.end.r;
    } else if (vector.direction.name === 'DOWN') {
      return point.c === vector.start.c && point.r >= vector.start.r && point.r <= vector.end.r;
    } else if (vector.direction.name === 'LEFT') {
      return point.r === vector.start.r && point.c <= vector.start.c && point.c >= vector.end.c;
    } else if (vector.direction.name === 'RIGHT') {
      return point.r === vector.start.r && point.c >= vector.start.c && point.c <= vector.end.c;
    } else {
      throw new Error('');
    }
  }

  // 找出给定的消除发生在 vector 上面的哪个位置(坐标和偏移)
  private findEliminatePointInVector(eliminate: EliminateBlock, vector: TileVector): EliminatePointPosition | null {
    const { point1, point2 } = eliminate;
    if (this.isPointInVector(point1, vector)) {
      // p1 在向量上
      return {
        ...point1,
        offset: this.distance(point1, vector.start),
      };
    } else if (this.isPointInVector(point2, vector)) {
      // p2 在向量上
      return {
        ...point2,
        offset: this.distance(point2, vector.start),
      };
    }

    return null;
  }

  // 找出 MaximumMove 中存在的有效 Move (移动后能够消除的Move)
  private evaluate(maximumMove: MaximumMove): EffectiveMove[] {
    const { tileVector: maximumMoveTileVector, direction, distance } = maximumMove;

    const effectiveMoves: EffectiveMove[] = [];

    for (let step = 1; step <= distance; step++) {
      const [board, movedTileVector] = this.slide(maximumMoveTileVector, direction, step);
      const eliminates = new Board(board).findAllEliminateBlock();
      for (const eliminate of eliminates) {
        const position = this.findEliminatePointInVector(eliminate, movedTileVector);
        if (position) {
          // 需要计算精确范围
          const p = this.tick(maximumMoveTileVector.start, maximumMoveTileVector.direction, position.offset);
          if (p) {
            const vector: TileVector = {
              direction: movedTileVector.direction,
              start: maximumMoveTileVector.start,
              end: p,
            };
            effectiveMoves.push({
              direction: direction,
              distance: step,
              tileVector: vector,
              eliminate,
            });
          }
        }
      }
    }

    return effectiveMoves;
  }

  // 对 EffectiveMove 对象进行去重
  private deduplication(moves: EffectiveMove[]): EffectiveMove[] {
    const map = new Map<string, EffectiveMove>();
    for (const move of moves) {
      const key = `${this.formatCoordinate(move.tileVector.start)}:${this.formatCoordinate(move.tileVector.end)}:${move.direction.name}:${move.distance}`;
      map.set(key, move);
    }
    return Array.from(map.values());
  }

  // 找出棋盘上的所有 EffectiveMove
  findAllEffectiveMoves(): EffectiveMove[] {
    const maximumMoves = this.findAllMaximumMoves();

    let moves: EffectiveMove[] = [];
    for (const maximumMove of maximumMoves) {
      const effectiveMoves = this.evaluate(maximumMove);
      moves.push(...effectiveMoves);
    }
    return this.deduplication(moves);
  }

  // 消除
  private eliminate(point1: Coordinate, point2: Coordinate) {
    if (!this.isEqual(point1, point2)) {
      console.warn(
        `执行消除时发现格子内容并不相等, 分别是[${this.formatTileInfo(point1)}] 和 [${this.formatTileInfo(point2)}]`
      );
      return null;
    }

    if (point1.r === point2.r) {
      // 在同一行
      const start = Math.min(point1.c, point2.c);
      const end = Math.max(point1.c, point2.c);
      for (let c = start + 1; c < end; c++) {
        if (!this.isHoleTile({ r: point1.r, c: c })) {
          return null;
        }
      }
    } else if (point1.c === point2.c) {
      // 在同一列
      const start = Math.min(point1.r, point2.r);
      const end = Math.max(point1.r, point2.r);
      for (let r = start + 1; r < end; r++) {
        if (!this.isHoleTile({ r: r, c: point1.c })) {
          return null;
        }
      }
    } else {
      console.warn(
        `执行消除时发现格子不再一条直线上, 分别是[${this.formatTileInfo(point1, false)}] 和 [${this.formatTileInfo(point2)}]`
      );
      return null;
    }

    const board = this.clone();
    board.setTileValue(point1, 0);
    board.setTileValue(point2, 0);
    return board.grid;
  }

  // 执行【移动】操作
  execMove(move: EffectiveMove) {
    const { tileVector: effectiveMoveTileVector, direction, distance } = move;
    const [board] = this.slide(effectiveMoveTileVector, direction, distance);
    return board;
  }

  // 执行【消除】操作
  execEliminate(eliminate: EliminateBlock) {
    return this.eliminate(eliminate.point1, eliminate.point2);
  }
}
