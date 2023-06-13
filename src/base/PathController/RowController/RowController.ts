import { AngleRow } from "@/base/Grid";
import { IndexController } from "../IndexController";

export class RowController {
  indexController: IndexController<AngleRow>;

  constructor() {
    this.indexController = new IndexController();
  }
}
