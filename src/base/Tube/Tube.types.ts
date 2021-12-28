import { FiberApiType, FiberDataType } from "base/Fiber";
import { PositionSize } from "base/Grid";

export type TubeType<T> = {
  id: number;
  name: string;
  color: string;
  fibers?: T;
};

export type TubeApiType = TubeType<FiberApiType[]>;

export type TubeDataType = TubeType<FiberDataType[]> & {
  index?: number;
  attr?: PositionSize;
  expanded?: boolean;
};
