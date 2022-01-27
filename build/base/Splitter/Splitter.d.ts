import { Fiber, FiberData } from "base/Fiber";
import { Grid, PositionSize } from "base/Grid";
import { SplitterData } from "./Splitter.types";
export declare class Splitter {
    id: number;
    attr?: PositionSize;
    parentGrid: Grid;
    fibers_in?: Fiber[];
    fibers_out?: Fiber[];
    index: number;
    constructor({ data, parentGrid, index, }: {
        data: SplitterData;
        parentGrid: Grid;
        index: number;
    });
    calculateSize(): void;
    calculatePosition(): void;
    getParsedFibers(fibersData: FiberData[]): Fiber[];
    isFiberInput(fiber: Fiber): boolean;
    getSibilingsForFiber(fiber: Fiber): Fiber[];
    getHeight(): number;
    getPreviousSibilingsHeight(): number;
    getSplittersConnectedInInput(): Splitter[];
    getSplitterConnectedInInput(fiber: Fiber): Splitter;
    getJson(): {
        id: number;
        fibers_in: FiberData[];
        fibers_out: FiberData[];
        index: number;
    };
    getParentGrid(): Grid;
}
