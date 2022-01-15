import { FiberApiType } from "base/Fiber";
import { PositionSize } from "base/Grid";

export class SplitterApiType {
  id: number;
  fibers_in: FiberApiType[];
  fibers_out: FiberApiType[];
}

export class SplitterDataType {
  attr?: PositionSize;
  orientation?: "LEFT" | "RIGHT";
}

export type SplitterFiberDataType = FiberApiType & {
  attr?: PositionSize;
};
