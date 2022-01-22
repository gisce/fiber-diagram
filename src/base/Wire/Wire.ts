import { Config } from "base/Config";
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

  calculateSize() {
    const usedChildrenHeight = this.tubes.reduce(
      (a, b) => a + b.attr.size.height,
      0
    );

    const heightWithSeparation =
      this.expanded === false || this.tubes.length === 0
        ? Config.baseUnits.wire.height
        : usedChildrenHeight +
          this.tubes.length * Config.separation +
          Config.separation;

    this.attr.size = {
      width: Config.baseUnits.wire.width,
      height: heightWithSeparation,
    };
  }

  calculatePosition() {
    const wireSibilings =
      this.disposition === "LEFT"
        ? this.parentGrid.leftWires
        : this.parentGrid.rightWires;

    const sibilingsHigherThanMe = wireSibilings.filter((wire) => {
      return wire.index < this.index;
    });

    const usedHeight = sibilingsHigherThanMe
      .map((wire) => wire.attr.size.height)
      .reduce((a, b) => a + b, 0);

    const usedHeightPlusSeparation =
      usedHeight + sibilingsHigherThanMe.length * Config.wireSeparation;

    this.attr.position = {
      x:
        this.disposition === "LEFT"
          ? 0
          : this.parentGrid.size.width - Config.baseUnits.wire.width,
      y: usedHeightPlusSeparation,
    };
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
