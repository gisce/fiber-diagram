import { PositionSize } from "base/Grid";

export type FiberApiType = {
  id: number;
  name: string;
  color: string;
};

export type FiberDataType = FiberApiType & {
  index?: number;
  attr?: PositionSize;
};
