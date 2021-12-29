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
  initialized: boolean = false;
  tubesSized: { [key: number]: boolean } = {};
  tubesPositioned: { [key: number]: boolean } = {};
  onSizingDone: (wire: Wire) => void;
  onPositioningDone: (wire: Wire) => void;

  constructor({
    data,
    parentGrid,
    index,
    onSizingDone,
    onPositioningDone,
  }: {
    data?: WireDataType;
    parentGrid: Grid;
    index: number;
    onSizingDone?: (wire: Wire) => void;
    onPositioningDone?: (wire: Wire) => void;
  }) {
    this.attr = { ...InitialPositionSize };
    this.index = index;
    this.parentGrid = parentGrid;
    this.onSizingDone = onSizingDone;
    this.onPositioningDone = onPositioningDone;

    if (!data) {
      this.initialized = true;
      return;
    }

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

    // We add our fibers and expect each one to call onSizingDone to start sizing ourselves later.
    tubesData.forEach((tubeData: TubeDataType) => this.addTube(tubeData));
  }

  addTube(tubeData: TubeDataType) {
    const tube = new Tube({
      data: tubeData,
      parentWire: this,
      index: this.tubes.length,
      onSizingDone: this.onTubeSizedDone.bind(this),
      onPositioningDone: this.onTubePositionDone.bind(this),
    });
    this.tubes.push(tube);
    this.onChangeIfNeeded();
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

    this.onSizingDone?.(this);
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
      usedHeight + sibilingsHigherThanMe.length * Config.separation;

    this.attr.position = {
      x:
        this.disposition === "LEFT"
          ? 0
          : this.parentGrid.size.width - Config.baseUnits.wire.width,
      y: usedHeightPlusSeparation,
    };

    if (this.tubes.length === 0 || this.expanded === false) {
      this.initialized = true;
      this.onPositioningDone?.(this);
      return;
    }

    this.tubes.forEach((tube) => tube.calculatePosition());
  }

  onTubeSizedDone(tube: Tube) {
    if (Object.keys(this.tubesSized).length === this.tubes.length) {
      return;
    }

    this.tubesSized[tube.id] = true;
    if (Object.keys(this.tubesSized).length === this.tubes.length) {
      this.calculateSize();
    }
  }

  onTubePositionDone(tube: Tube) {
    if (Object.keys(this.tubesPositioned).length === this.tubes.length) {
      return;
    }

    this.tubesPositioned[tube.id] = true;
    if (Object.keys(this.tubesPositioned).length === this.tubes.length) {
      this.initialized = true;
      this.onPositioningDone?.(this);
    }
  }

  beginSizing() {
    if (this.tubes.length === 0 || this.expanded === false) {
      this.calculateSize();
      return;
    }

    this.tubes.forEach(function (tube) {
      tube.beginSizing();
    });
  }

  onChangeIfNeeded() {
    if (!this.initialized) {
      return;
    }

    this.parentGrid.onChangeIfNeeded();
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

  expand() {
    if (this.expanded) {
      return;
    }

    this.expanded = true;
    this.onChangeIfNeeded();
  }

  collapse() {
    if (!this.expanded) {
      return;
    }

    this.expanded = false;
    this.onChangeIfNeeded();
  }

  getExpandedValue() {
    const anyTubeExpanded =
      this.tubes.filter((tube: Tube) => {
        return !tube.expanded;
      }).length > 0;

    return !anyTubeExpanded;
  }
}
