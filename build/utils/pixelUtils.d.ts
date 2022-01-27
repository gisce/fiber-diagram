import { PositionSize } from "base/Grid";
export declare const convertAttrUnitsToPixels: (attr: PositionSize) => {
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
};
