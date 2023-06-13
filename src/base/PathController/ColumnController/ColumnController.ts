import { MiddleFusionColumn } from "@/base/Grid";
import { IndexController } from "../IndexController/IndexController";

export class ColumnController {
  indexController: IndexController<MiddleFusionColumn>;
  middlePoint: number;

  constructor({ middlePoint }: { middlePoint: number }) {
    this.indexController = new IndexController();
    this.middlePoint = middlePoint;
  }
}
