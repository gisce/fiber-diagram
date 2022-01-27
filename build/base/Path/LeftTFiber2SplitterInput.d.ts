import { Fiber } from "base/Fiber";
import { ColumnController } from "base/PathController/ColumnController/ColumnController";
import { RowController } from "base/PathController/RowController/RowController";
import { Tube } from "base/Tube";
declare const _default: ({ elementIn, elementOut, columnController, leftAngleRowController, rightAngleRowController, }: {
    elementIn: Fiber | Tube;
    elementOut: Fiber | Tube;
    columnController: ColumnController;
    leftAngleRowController: RowController;
    rightAngleRowController: RowController;
}) => {
    fusionPoint: {
        x: number;
        y: number;
    };
    path: any[];
};
export default _default;
