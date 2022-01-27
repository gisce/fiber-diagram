import { Fiber } from "base/Fiber";
import { FiberConnectionData } from "base/FiberConnection";
import { SplitterData } from "base/Splitter/Splitter.types";
import { Tube } from "base/Tube";
import { WireData } from "base/Wire";
export declare type GridData = {
    res?: {
        id?: number;
        name?: string;
        elements?: {
            wires?: WireData[];
            splitters?: SplitterData[];
        };
        connections?: {
            fibers: FiberConnectionData[];
        };
        leftSideWidth?: number;
        rightSideWidth?: number;
    };
};
export declare type Size = {
    width: number;
    height: number;
};
export declare type Position = {
    x: number;
    y: number;
};
export declare type PositionSize = {
    size: Size;
    position: Position;
};
export declare const InitialPositionSize: {
    size: {
        width: number;
        height: number;
    };
    position: {
        x: number;
        y: number;
    };
};
export declare type PathUnit = PositionSize & {
    color: string;
};
export declare type MiddleFusionColumn = {
    [key: number]: Fiber | Tube;
};
export declare type AngleRow = {
    [key: number]: Fiber | Tube;
};
