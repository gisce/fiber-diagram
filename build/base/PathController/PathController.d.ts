import { ColumnController } from "./ColumnController/ColumnController";
import { RowController } from "./RowController/RowController";
export declare class PathController {
    tubeFusionColumnController: ColumnController;
    splitterFusionColumnController: ColumnController;
    leftAngleRowController: RowController;
    rightAngleRowController: RowController;
    constructor({ middlePoint }: {
        middlePoint: number;
    });
    setMiddlePoint(middlePoint: number): void;
}
