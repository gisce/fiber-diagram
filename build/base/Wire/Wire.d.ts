import { Grid, PositionSize } from "base/Grid";
import { Tube, TubeData } from "base/Tube";
import { WireData, WireDisposition } from "./Wire.types";
export declare class Wire {
    id: number;
    name: string;
    disposition: WireDisposition;
    attr: PositionSize;
    expanded: boolean;
    tubes?: Tube[];
    parentGrid: Grid;
    index: number;
    tubesSized: {
        [key: number]: boolean;
    };
    tubesPositioned: {
        [key: number]: boolean;
    };
    constructor({ data, parentGrid, index, }: {
        data?: WireData;
        parentGrid: Grid;
        index: number;
    });
    addTube(tubeData: TubeData): void;
    calculateSize(): void;
    calculatePosition(): void;
    getJson(): WireData;
}
