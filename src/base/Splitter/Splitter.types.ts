import { FiberApiType, FiberDataType } from "base/Fiber";
import { PositionSize } from "base/Grid";

export type SplitterType<T> = {
  id: number;
  fibers_in: T[];
  fibers_out: T[];
};

export type SplitterApiType = SplitterType<FiberApiType>;

export type SplitterDataType = SplitterType<FiberDataType> & {
  attr?: PositionSize;
};
