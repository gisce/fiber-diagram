import { Connection, FiberConnectionApiType } from "base/FibberConnection";
import { WireApiType, WireDataType } from "base/Wire";

export type GridType<T> = {
  res?: {
    id?: number;
    name?: string;
    elements?: {
      wires?: T;
    };
    connections?: ConnectionsApiType;
    leftSideAngleSegments?: FiberConnectionSegment[];
    rightSideAngleSegments?: FiberConnectionSegment[];
  };
};

export type GridApiType = GridType<WireApiType[]>;
export type GridDataType = GridType<WireDataType[]>;

export type Size = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export type PositionSize = {
  size: Size;
  position: Position;
};

export const InitialPositionSize = {
  size: { width: 0, height: 0 },
  position: { x: 0, y: 0 },
};

export type ConnectionsApiType = {
  fibers?: FiberConnectionApiType[];
};

export type FiberConnectionSegment = {
  fiber_id: number;
  toY: number;
};
