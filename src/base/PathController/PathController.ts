import { AngleRow, MiddleFusionColumn } from "base/Grid";
import { ColumnController } from "./ColumnController/ColumnController";
import { RowController } from "./RowController/RowController";

export class PathController {
  // Middle column controller which is the point where mostly all fibers are connected to each other
  // We will store here the index of the *Y* positions as the keys and *FiberConnection* or *TubeConnection* as the value
  tubeFusionColumnController: ColumnController;
  splitterFusionColumnController: ColumnController;

  // Horizontal index where we will save where the angles of the connections are placed in the left side
  // We will store here the index of the *X* positions as the keys and *Fiber* or *Tube* as the value
  leftAngleRowController: RowController;
  rightAngleRowController: RowController;

  constructor() {
    this.tubeFusionColumnController = new ColumnController();
    this.splitterFusionColumnController = new ColumnController();
    this.leftAngleRowController = new RowController();
    this.rightAngleRowController = new RowController();
  }
}
