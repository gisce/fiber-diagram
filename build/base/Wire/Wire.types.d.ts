import { PositionSize } from "base/Grid";
import { TubeData } from "base/Tube";
export declare type WireDisposition = "LEFT" | "RIGHT";
export declare type WireData = {
    id: number;
    name: string;
    disposition: WireDisposition;
    tubes?: TubeData[];
    attr?: PositionSize;
    expanded?: boolean;
};
