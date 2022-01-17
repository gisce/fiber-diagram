import { Config } from "base/Config";
import { InitialPositionSize, PositionSize } from "base/Grid";
import { Tube } from "base/Tube";
import { FiberApiType, FiberDataType } from "./Fiber.types";

export class Fiber {
  id: number;
  name: string;
  color: string;
  attr?: PositionSize;
  parentTube?: Tube;
  parentSplitter?: Tube;
  index: number;
  initialized: boolean = false;
  onSizingDone?: (fiber: Fiber) => void;
  onPositioningDone?: (fiber: Fiber) => void;

  constructor({
    data,
    parentTube,
    parentSplitter,
    index,
    onSizingDone,
    onPositioningDone,
  }: {
    data: FiberDataType;
    parentTube: Tube;
    parentSplitter?: Tube;
    index: number;
    onSizingDone?: (fiber: Fiber) => void;
    onPositioningDone?: (fiber: Fiber) => void;
  }) {
    this.attr = { ...InitialPositionSize };
    this.parentTube = parentTube;
    this.parentSplitter = parentSplitter;
    this.index = index;
    this.onSizingDone = onSizingDone;
    this.onPositioningDone = onPositioningDone;

    if (!data) {
      this.initialized = true;
      return;
    }

    const { id, name, color } = data;

    this.id = id;
    this.name = name;
    this.color = color;
  }

  calculateSize() {
    this.attr.size = {
      width: Config.baseUnits.fiber.width,
      height: Config.baseUnits.fiber.height,
    };

    this.onSizingDone?.(this);
  }

  calculatePosition() {
    if (this.parentTube) {
      this.calculatePositionForParentTube();
    } else {
      this.calculatePositionForParentSplitter();
    }
  }

  calculatePositionForParentTube() {
    const parentPosition = this.parentTube.attr.position;
    const disposition = this.parentTube.parentWire.disposition;

    const sibilingsHigherThanMe = this.parentTube.fibers.filter((wire) => {
      return wire.index < this.index;
    });

    let usedHeightPlusSeparation: number;

    if (this.parentTube.fibers.length === 1) {
      usedHeightPlusSeparation =
        Config.baseUnits.tube.height / 2 - Config.baseUnits.fiber.height / 2;
    } else {
      usedHeightPlusSeparation =
        Config.separation +
        sibilingsHigherThanMe
          .map((wire) => wire.attr.size.height + Config.separation)
          .reduce((a, b) => a + b, 0);
    }

    const x =
      disposition === "LEFT"
        ? parentPosition.x + Config.baseUnits.tube.width
        : parentPosition.x - Config.baseUnits.fiber.width;

    this.attr.position = {
      x,
      y: parentPosition.y + usedHeightPlusSeparation,
    };

    this.initialized = true;
    this.onPositioningDone?.(this);
  }

  calculatePositionForParentSplitter() {}

  onChangeIfNeeded() {
    if (!this.initialized) {
      return;
    }

    this.parentTube.parentWire.parentGrid.onChangeIfNeeded();
  }

  getApiJson(): FiberApiType {
    const { id, name, color } = this;
    return {
      id,
      name,
      color,
    };
  }

  getJson(): FiberDataType {
    const { id, name, color, attr, index } = this;
    return {
      id,
      name,
      color,
      attr,
      index,
    };
  }

  getConnectedToFiber() {
    const connection =
      this.parentTube.parentWire.parentGrid.getConnectionForFiberId(this.id);
    if (!connection) {
      return undefined;
    }
    const fiberIdConnectedTo =
      connection.fiber_in === this.id
        ? connection.fiber_out
        : connection.fiber_in;
    return this.parentTube.parentWire.parentGrid.getFiberById(
      fiberIdConnectedTo
    );
  }
}
