import { FiberData } from "base/Fiber";

export type SplitterData = {
  id: number;
  fibers_in: FiberData[];
  fibers_out: FiberData[];
};
