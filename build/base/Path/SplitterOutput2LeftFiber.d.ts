import { Fiber } from "base/Fiber";
import { ColumnController } from "base/PathController/ColumnController/ColumnController";
import { RowController } from "base/PathController/RowController/RowController";
declare const _default: ({ elementIn, elementOut, columnController, leftAngleRowController, rightAngleRowController, }: {
    elementIn: Fiber;
    elementOut: Fiber;
    columnController: ColumnController;
    leftAngleRowController: RowController;
    rightAngleRowController: RowController;
}) => {
    fusionPoint: {
        x: number;
        y: any;
    };
    path: import("../Grid").PathUnit[];
};
export default _default;
