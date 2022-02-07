import { FiberData } from "base/Fiber";
export declare type SplitterData = {
    id: number;
    fibers_in: FiberData[];
    fibers_out: FiberData[];
    index?: number;
};
export declare type SplitterOpts = {
    nInputs: number;
    nOutputs: number;
};
