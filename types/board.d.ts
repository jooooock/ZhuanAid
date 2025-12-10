export type DirName = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface DirObj {
  dr: number;
  dc: number;
  name: DirName;
}

export interface Point {
  r: number;
  c: number;
}

export interface Eliminate {
  point1: Point;
  point2: Point;
  value: number;
}

export interface PointGroup {
  start: Point;
  end: Point;
}

export interface Move {
  dir: DirObj;
  distance: number;
  group: PointGroup;
}

export interface EffectiveMove extends Move, Eliminate {}
