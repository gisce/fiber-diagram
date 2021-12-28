import { Config } from "base/Config";
import { InitialPositionSize, PositionSize } from "base/Grid";
import { Tube } from "base/Tube";
import { FiberApiType, FiberDataType } from "./Fiber.types";

export class Fiber {
  id: number;
  name: string;
  color: string;
  attr?: PositionSize;
  parentTube: Tube;
  index: number;
  initialized: boolean = false;
  onSizingDone?: (fiber: Fiber) => void;
  onPositioningDone?: (fiber: Fiber) => void;

  constructor({
    data,
    parentTube,
    index,
    onSizingDone,
    onPositioningDone,
  }: {
    data: FiberDataType;
    parentTube: Tube;
    index: number;
    onSizingDone?: (fiber: Fiber) => void;
    onPositioningDone?: (fiber: Fiber) => void;
  }) {
    this.attr = { ...InitialPositionSize };
    this.parentTube = parentTube;
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
    const parentPosition = this.parentTube.attr.position;
    const disposition = this.parentTube.parentWire.disposition;

    const sibilingsHigherThanMe = this.parentTube.fibers.filter((wire) => {
      return wire.index < this.index;
    });

    const usedHeight = sibilingsHigherThanMe
      .map((wire) => wire.attr.size.height)
      .reduce((a, b) => a + b, 0);

    const usedHeightPlusSeparation = Math.max(
      usedHeight + sibilingsHigherThanMe.length + 1 * Config.separation,
      Config.baseUnits.tube.height / 2 - Config.baseUnits.fiber.height / 2
    );

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
}
