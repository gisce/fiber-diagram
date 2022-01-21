import { Grid, InitialPositionSize, PositionSize } from "base/Grid";
import { Tube, TubeDataType } from "base/Tube";
import { WireApiType, WireDataType, WireDisposition } from "./Wire.types";

export class Wire {
  id: number;
  name: string;
  disposition: WireDisposition;
  attr: PositionSize;
  expanded: boolean = true;
  tubes?: Tube[] = [];
  parentGrid: Grid;
  index: number;
  tubesSized: { [key: number]: boolean } = {};
  tubesPositioned: { [key: number]: boolean } = {};

  constructor({
    data,
    parentGrid,
    index,
  }: {
    data?: WireDataType;
    parentGrid: Grid;
    index: number;
  }) {
    this.attr = { ...InitialPositionSize };
    this.index = index;
    this.parentGrid = parentGrid;

    const {
      id,
      name,
      tubes: tubesData = [],
      disposition,
      expanded = true,
    } = data;
    this.id = id;
    this.name = name;
    this.disposition = disposition;
    this.expanded = expanded;

    tubesData.forEach((tubeData: TubeDataType) => this.addTube(tubeData));
  }

  addTube(tubeData: TubeDataType) {
    const tube = new Tube({
      data: tubeData,
      parentWire: this,
      index: this.tubes.length,
    });
    this.tubes.push(tube);
  }

  getApiJson(): WireApiType {
    const { id, name, disposition, tubes } = this;
    return {
      id,
      name,
      disposition,
      tubes: tubes.map((tube) => tube.getApiJson()),
    };
  }

  getJson(): WireDataType {
    const { id, name, expanded, tubes, attr, disposition } = this;

    return {
      id,
      name,
      expanded,
      disposition,
      attr,
      tubes: tubes.map((tube) => tube.getJson()),
    };
  }
}
