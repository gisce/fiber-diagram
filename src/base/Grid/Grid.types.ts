import { Fiber } from "@/base/Fiber";
import { FiberConnectionData } from "@/base/FiberConnection";
import { SplitterData } from "@/base/Splitter/Splitter.types";
import { Tube } from "@/base/Tube";
import { WireData } from "@/base/Wire";

export type GridData = {
  res?: {
    id?: number;
    name?: string;
    elements?: {
      wires?: WireData[];
      splitters?: SplitterData[];
      patch_panels?: SplitterData[];
    };
    connections?: {
      fibers: FiberConnectionData[];
    };
    leftSideWidth?: number;
    rightSideWidth?: number;
  };
};

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

export type PathUnit = PositionSize & {
  color: string;
};

export type MiddleFusionColumn = {
  [key: number]: Fiber | Tube;
};

export type AngleRow = { [key: number]: Fiber | Tube };
