import { PositionSize } from "base/Grid";

export type SplitterConnectionApiType = {
  fiber_in: number;
  fiber_out: number;
};

export type SplitterConnectionDataType = SplitterConnectionApiType & {
  legs?: PositionSize[];
  usedYpoints?: { [key: number]: boolean };
};
