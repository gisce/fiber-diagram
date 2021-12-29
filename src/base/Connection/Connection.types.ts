import { PositionSize } from "base/Grid";

export type FiberConnectionApiType = {
  fiber_in: number;
  fiber_out: number;
};

export type FiberConnectionDataType = FiberConnectionApiType & {
  legs?: PositionSize[];
};

export type LegType = PositionSize & {
  color: string;
};
