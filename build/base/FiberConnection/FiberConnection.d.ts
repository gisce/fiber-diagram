import { Fiber } from "base/Fiber";
import { Grid, PathUnit, Position } from "base/Grid";
import { FiberConnectionData } from ".";
export declare class FiberConnection {
    fiber_in: number;
    fiber_out: number;
    parentGrid: Grid;
    path: PathUnit[];
    fusionPoint: Position;
    constructor({ data, parentGrid, }: {
        data: FiberConnectionData;
        parentGrid: Grid;
    });
    fiberIdBelongsToConnection(fiber_id: number): boolean;
    getOtherFiberId(id: number): number;
    getJson(): FiberConnectionData;
    remove(): void;
    calculate(): void;
    calculateTubeFiberConnection(fiberIn: Fiber, fiberOut: Fiber): void;
    isVisible(): boolean;
    someFiberIsFromSplitter(): boolean;
    calculateSplitterToTubeFiberConnection(splitterFiber: Fiber, tubeFiber: Fiber): void;
    calculateSplitterInputToTubeFiberConnection(splitterFiber: Fiber, tubeFiber: Fiber): void;
    calculateSplitterOutputToTubeFiberConnection(splitterFiber: Fiber, tubeFiber: Fiber): void;
    calculateSplitterToSplitterFiberConnection(fiberIn: Fiber, fiberOut: Fiber): void;
}
