import { Grid, PathUnit, Position } from "@/base/Grid";
import LeftTFiber2RightTFiber from "@/base/Path/LeftTFiber2RightTFiber";
import SameSideTubeFiber from "@/base/Path/SameSideTubeFiber";
import { TubeConnectionData } from ".";

export class TubeConnection {
  tube_in: number;
  tube_out: number;
  parentGrid: Grid;
  path: PathUnit[] = [];
  fusionPoint: Position = {
    x: 0,
    y: 0,
  };

  constructor({
    data,
    parentGrid,
  }: {
    data: TubeConnectionData;
    parentGrid: Grid;
  }) {
    const { tube_in, tube_out } = data;
    this.tube_in = tube_in;
    this.tube_out = tube_out;
    this.parentGrid = parentGrid;
  }

  tubeIdBelongsToConnection(tube_id: number) {
    const { tube_in, tube_out } = this;
    return tube_id === tube_in || tube_id === tube_out;
  }

  getOtherTubeId(id: number) {
    const { tube_in, tube_out } = this;
    return id === tube_in ? tube_out : tube_in;
  }

  getJson(): TubeConnectionData {
    const { tube_in, tube_out } = this;
    return {
      tube_in,
      tube_out,
    };
  }

  remove() {
    this.parentGrid.removeTubeConnection({
      tube_in: this.tube_in,
      tube_out: this.tube_out,
    });
  }

  calculate() {
    const tubeIn = this.parentGrid.getTubeById(this.tube_in);
    const tubeOut = this.parentGrid.getTubeById(this.tube_out);

    if (tubeIn.parentWire.disposition !== tubeOut.parentWire.disposition) {
      const { path, fusionPoint } = LeftTFiber2RightTFiber({
        elementIn: tubeIn,
        elementOut: tubeOut,
        columnController:
          this.parentGrid.pathController.tubeFusionColumnController,
        leftAngleRowController:
          this.parentGrid.pathController.leftAngleRowController,
        rightAngleRowController:
          this.parentGrid.pathController.rightAngleRowController,
      });
      this.path = path;
      this.fusionPoint = fusionPoint;
    } else {
      // Check if it's a same side connection
      const { path, fusionPoint } = SameSideTubeFiber({
        elementIn: tubeIn,
        elementOut: tubeOut,
        columnController:
          this.parentGrid.pathController.tubeFusionColumnController,
        leftAngleRowController:
          this.parentGrid.pathController.leftAngleRowController,
        rightAngleRowController:
          this.parentGrid.pathController.rightAngleRowController,
      });
      this.path = path;
      this.fusionPoint = fusionPoint;
    }
  }
}
