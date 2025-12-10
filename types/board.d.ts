export type DirectionName = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Direction {
  dr: number;
  dc: number;
  name: DirectionName;
}

export interface Coordinate {
  r: number;
  c: number;
}

export interface Eliminate {
  point1: Coordinate;
  point2: Coordinate;
  value: number;
}

export interface TileGroup {
  start: Coordinate;
  end: Coordinate;
}

export interface DirectedTileGroup extends TileGroup {
  direction: Direction;
}

export interface Move {
  direction: Direction;
  distance: number;
  target: DirectedTileGroup;
}

export interface EffectiveMove extends Move, Eliminate {}

export interface TileArea {
  start: Coordinate;
  end: Coordinate;
}
