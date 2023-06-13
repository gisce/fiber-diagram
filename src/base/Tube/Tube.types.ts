import { FiberData } from "@/base/Fiber";
import { PositionSize } from "@/base/Grid";

export type TubeData = {
  id: number;
  name: string;
  color: string;
  fibers?: FiberData[];
  index?: number;
  attr?: PositionSize;
  expanded?: boolean;
};
