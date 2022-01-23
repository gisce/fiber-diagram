import { MiddleFusionColumn } from "base/Grid";
import { IndexController } from "../IndexController/IndexController";

export class ColumnController {
  indexController: IndexController<MiddleFusionColumn>;

  constructor() {
    this.indexController = new IndexController();
  }
}
