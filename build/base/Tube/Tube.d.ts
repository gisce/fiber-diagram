import { Fiber, FiberData } from "base/Fiber";
import { PositionSize } from "base/Grid";
import { Wire } from "base/Wire";
import { TubeData } from ".";
export declare class Tube {
    id: number;
    name: string;
    color: string;
    attr?: PositionSize;
    expanded?: boolean;
    parentWire: Wire;
    index: number;
    fibers?: Fiber[];
    constructor({ data, parentWire, index, }: {
        data: TubeData;
        parentWire: Wire;
        index: number;
    });
    addFiber(fiberData: FiberData): void;
    getTubeConnectedTo(): Tube;
    canWeCollapse(): boolean;
    evaluateExpanded(): void;
    expand(): void;
    collapse(): void;
    calculateSize(): void;
    calculatePosition(): void;
    getParentGrid(): import("base/Grid").Grid;
    getJson(): TubeData;
}
