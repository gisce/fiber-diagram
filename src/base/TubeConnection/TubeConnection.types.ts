import { PositionSize } from "base/Grid";

export type TubeConnectionApiType = {
  tube_in: number;
  tube_out: number;
};

export type TubeConnectionDataType = TubeConnectionApiType & {
  legs?: PositionSize[];
  usedYpoints?: { [key: number]: boolean };
};
