import { PositionSize } from "base/Grid";
import { TubeData } from "base/Tube";

export type WireDisposition = "LEFT" | "RIGHT";

export type WireData = {
  id: number;
  name: string;
  disposition: WireDisposition;
  tubes?: TubeData[];
  attr?: PositionSize;
  expanded?: boolean;
};