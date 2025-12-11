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

export interface EliminateBlock {
  point1: Coordinate;
  point2: Coordinate;
  value: number;
}

export interface TileVector {
  start: Coordinate;
  end: Coordinate;
  direction: Direction;
}

export interface MaximumMove {
  direction: Direction;
  distance: number;
  tileVector: TileVector;
}

export interface EffectiveMove extends MaximumMove {
  eliminate: EliminateBlock;
}

export interface EliminatePointPosition extends Coordinate {
  offset: number;
}

export interface HighLightArea {
  point1: Coordinate;
  point2: Coordinate;
}
