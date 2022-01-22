import { Config } from "base/Config";
import { Tube } from "base/Tube";
import { Grid, LegType, Position, VerticalIndexElement } from "base/Grid";
import { TubeConnectionApiType, TubeConnectionDataType } from ".";

export class TubeConnection {
  tube_in: number;
  tube_out: number;
  parentGrid: Grid;

  constructor({
    data,
    parentGrid,
  }: {
    data: TubeConnectionDataType;
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

  getApiJson(): TubeConnectionApiType {
    const { tube_in, tube_out } = this;
    return {
      tube_in,
      tube_out,
    };
  }

  getJson(): TubeConnectionDataType {
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
}
