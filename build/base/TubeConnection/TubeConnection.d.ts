import { Grid, PathUnit, Position } from "base/Grid";
import { TubeConnectionData } from ".";
export declare class TubeConnection {
    tube_in: number;
    tube_out: number;
    parentGrid: Grid;
    path: PathUnit[];
    fusionPoint: Position;
    constructor({ data, parentGrid, }: {
        data: TubeConnectionData;
        parentGrid: Grid;
    });
    tubeIdBelongsToConnection(tube_id: number): boolean;
    getOtherTubeId(id: number): number;
    getJson(): TubeConnectionData;
    remove(): void;
    calculate(): void;
}
