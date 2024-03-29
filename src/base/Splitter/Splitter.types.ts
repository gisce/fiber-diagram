import { FiberData } from "@/base/Fiber";

export type SplitterData = {
  id: number;
  fibers_in: FiberData[];
  fibers_out: FiberData[];
  index?: number;
  type?: "SPLITTER" | "PATCH_PANEL";
};

export type SplitterOpts = {
  nInputs: number;
  nOutputs: number;
  type: "SPLITTER" | "PATCH_PANEL";
};
