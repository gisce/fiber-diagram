import { PathUnit, Position } from "base/Grid/Grid.types";
import { RowController } from "base/PathController/RowController/RowController";
export declare const getUnitsForPath: ({ pathCoords, color, unitSize, }: {
    pathCoords: number[][];
    unitSize: number;
    color: string;
}) => PathUnit[];
export declare const getNPointsBelowPoint: ({ point, unitSize, n, }: {
    point: number;
    unitSize: number;
    n: number;
}) => any[];
export declare const getNPointsAbovePoint: ({ point, unitSize, n, }: {
    point: number;
    unitSize: number;
    n: number;
}) => any[];
export declare const getNPoints: ({ point, unitSize, n, place, }: {
    point: number;
    unitSize: number;
    n: number;
    place: "ABOVE" | "BELOW";
}) => any[];
export declare const getLeftToPointPath: ({ source, point, angleRowController, fusionYPoint, unitSize, }: {
    source: Position;
    point: number;
    angleRowController: RowController;
    fusionYPoint: number;
    unitSize: number;
}) => {
    path: any[];
    usedXPoint?: undefined;
    usedYPoint?: undefined;
} | {
    path: any[];
    usedXPoint: number;
    usedYPoint: number;
};
export declare const getRightToPointPath: ({ source, point, angleRowController, fusionYPoint, unitSize, minAngle, }: {
    source: Position;
    point: number;
    angleRowController: RowController;
    fusionYPoint: number;
    unitSize: number;
    minAngle?: number;
}) => {
    path: any[];
    usedXPoint?: undefined;
    usedYPoint?: undefined;
} | {
    path: any[];
    usedXPoint: any;
    usedYPoint: number;
};
export declare const getLeftToPointFlatPath: ({ source, point, }: {
    source: Position;
    point: number;
}) => any[];
export declare const getRightToPointFlatPath: ({ target, point, }: {
    target: Position;
    point: number;
}) => any[];
