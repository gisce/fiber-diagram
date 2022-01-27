import { MiddleFusionColumn } from "base/Grid";
import { IndexController } from "../IndexController/IndexController";
export declare class ColumnController {
    indexController: IndexController<MiddleFusionColumn>;
    middlePoint: number;
    constructor({ middlePoint }: {
        middlePoint: number;
    });
}
