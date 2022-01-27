import { PositionSize } from "base/Grid";
import { Splitter } from "base/Splitter";
import { Tube } from "base/Tube";
import { FiberData } from ".";
export declare class Fiber {
    id: number;
    name: string;
    color: string;
    index: number;
    attr?: PositionSize;
    parent?: Tube | Splitter;
    parentType: "TUBE" | "SPLITTER";
    constructor({ data, parent, index, }: {
        data: FiberData;
        parent?: Tube | Splitter;
        index: number;
    });
    calculateSize(): void;
    calculatePosition(): void;
    calculatePositionForParentTube(): void;
    calculatePositionForParentSplitter(): void;
    getJson(): FiberData;
}
