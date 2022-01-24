import { Config } from "base/Config";
import { InitialPositionSize, PositionSize } from "base/Grid";
import { Splitter } from "base/Splitter";
import { Tube } from "base/Tube";
import { FiberData } from ".";

export class Fiber {
  id: number;
  name: string;
  color: string;
  index: number;
  attr?: PositionSize;
  parent?: Tube | Splitter;
  parentType: "TUBE" | "SPLITTER";

  constructor({
    data,
    parent,
    index,
  }: {
    data: FiberData;
    parent?: Tube | Splitter;
    index: number;
  }) {
    const { id, name, color } = data;

    this.id = id;
    this.name = name;
    this.color = color;

    this.index = index;
    this.parent = parent;

    if (parent instanceof Tube) {
      this.parentType = "TUBE";
    } else if (parent instanceof Splitter) {
      this.parentType = "SPLITTER";
    }

    this.attr = { ...InitialPositionSize };
  }

  calculateSize() {
    this.attr.size = {
      width: Config.baseUnits.fiber.width,
      height: Config.baseUnits.fiber.height,
    };
  }

  calculatePosition() {
    if (this.parentType === "TUBE") {
      this.calculatePositionForParentTube();
    } else {
      this.calculatePositionForParentSplitter();
    }
  }

  calculatePositionForParentTube() {
    const parentTube = this.parent as Tube;

    const parentPosition = parentTube.attr.position;
    const disposition = parentTube.parentWire.disposition;

    const sibilingsHigherThanMe = parentTube.fibers.filter((wire) => {
      return wire.index < this.index;
    });

    let usedHeightPlusSeparation: number;

    if (parentTube.fibers.length === 1) {
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
  }

  calculatePositionForParentSplitter() {
    const parentSplitter = this.parent as Splitter;
    const splitterSibilings = parentSplitter.getSibilingsForFiber(this);

    const vUnitSpace =
      parentSplitter?.attr.size.height /
      (splitterSibilings.length + splitterSibilings.length + 1);

    let y: number, x: number;
    if (splitterSibilings.length === 1) {
      y =
        parentSplitter?.attr.size.height / 2 -
        Config.baseUnits.fiber.height / 2;
    } else {
      y = vUnitSpace + vUnitSpace * this.index * 2;
    }

    if (parentSplitter.isFiberInput(this)) {
      x = parentSplitter?.attr.position.x;
    } else {
      x =
        parentSplitter?.attr.position.x +
        (parentSplitter?.attr.size.width - Config.baseUnits.fiber.width);
    }

    this.attr = {
      position: {
        x: x,
        y: y + parentSplitter.attr.position.y,
      },
      size: {
        width: Config.baseUnits.fiber.width,
        height: Config.baseUnits.fiber.height,
      },
    };
  }

  getJson(): FiberData {
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
