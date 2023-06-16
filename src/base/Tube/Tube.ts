import { Config } from "@/base/Config";
import { Fiber, FiberData } from "@/base/Fiber";
import { InitialPositionSize, PositionSize } from "@/base/Grid";
import { Wire } from "@/base/Wire";
import { TubeData } from ".";
import { arraysContainSameNumbers } from "@/utils/connectionUtils";

export class Tube {
  id: number;
  name: string;
  color: string;
  attr?: PositionSize;
  expanded?: boolean;
  parentWire: Wire;
  index: number;
  fibers?: Fiber[] = [];

  constructor({
    data,
    parentWire,
    index,
  }: {
    data: TubeData;
    parentWire: Wire;
    index: number;
  }) {
    this.attr = { ...InitialPositionSize };
    this.parentWire = parentWire;
    this.index = index;

    const { id, name, color, expanded, fibers: fibersData = [] } = data;

    this.id = id;
    this.name = name;
    this.color = color;
    this.expanded = expanded;

    fibersData.forEach((fiberData) => this.addFiber(fiberData));
  }

  addFiber(fiberData: FiberData) {
    this.fibers.push(
      new Fiber({
        data: fiberData,
        parent: this,
        index: this.fibers.length,
      })
    );
  }

  getTubeConnectedTo() {
    const tubesConnectedTo: { [key: number]: Tube } = {};

    const sameOrder = this.fibers.every((fiber) => {
      const fiberConnection = this.getParentGrid().getFiberConnectionWithId(
        fiber.id
      );

      // Fiber is not connected anywhere
      if (!fiberConnection) {
        return false;
      }

      const otherFiberId = fiberConnection.getOtherFiberId(fiber.id);
      const otherFiber: Fiber = this.getParentGrid().getFiberById(otherFiberId);

      // If the other fiber belongs to a splitter, tube is not connected to another tube
      if (otherFiber.parentType !== "TUBE") {
        return false;
      }

      tubesConnectedTo[otherFiber.parent.id] = otherFiber.parent as Tube;

      const indexOfFiber = (fiber.parent as Tube).fibers.indexOf(fiber);
      const indexOfOtherFiber = (otherFiber.parent as Tube).fibers.indexOf(
        otherFiber
      );
      return indexOfFiber === indexOfOtherFiber;
    });

    const connectedToSameTube =
      sameOrder &&
      Object.values(tubesConnectedTo).length === 1 &&
      Object.values(tubesConnectedTo)[0].fibers.length === this.fibers.length;

    if (connectedToSameTube) {
      return Object.values(tubesConnectedTo)[0];
    } else {
      return undefined;
    }
  }

  canWeCollapse() {
    const tubeConnectedTo = this.getTubeConnectedTo();

    if (tubeConnectedTo !== undefined) {
      return true;
    } else {
      return false;
    }
  }

  evaluateExpanded() {
    if (this.expanded === undefined) {
      this.expanded = !this.canWeCollapse();
    }
  }

  expand() {
    if (this.expanded) {
      return;
    }

    this.getParentGrid().onTubeExpand(this);
  }

  collapse() {
    if (!this.expanded || !this.canWeCollapse()) {
      return;
    }

    this.getParentGrid().onTubeCollapse(this);
  }

  calculateSize() {
    const usedChildrenHeight = this.fibers.reduce(
      (a, b) => a + b.attr.size.height,
      0
    );

    const heightWithSeparation =
      this.expanded === false || this.fibers.length === 0
        ? Config.baseUnits.tube.height
        : Math.max(
            usedChildrenHeight +
              this.fibers.length * Config.separation +
              Config.separation,
            Config.baseUnits.tube.height
          );

    this.attr.size = {
      width: Config.baseUnits.tube.width,
      height: heightWithSeparation,
    };
  }

  calculatePosition() {
    const parentPosition = this.parentWire.attr.position;

    const sibilingsHigherThanMe = this.parentWire.tubes.filter((wire) => {
      return wire.index < this.index;
    });

    const usedHeight = sibilingsHigherThanMe
      .map((wire) => wire.attr.size.height)
      .reduce((a, b) => a + b, 0);

    const usedHeightPlusSeparation =
      Config.separation +
      usedHeight +
      sibilingsHigherThanMe.length * Config.separation;

    const x =
      this.parentWire.disposition === "LEFT"
        ? parentPosition.x + Config.baseUnits.wire.width
        : parentPosition.x - Config.baseUnits.tube.width;

    this.attr.position = {
      x,
      y: parentPosition.y + usedHeightPlusSeparation,
    };
  }

  getParentGrid() {
    return this.parentWire.parentGrid;
  }

  getJson(): TubeData {
    const { id, name, color, attr, expanded, index, fibers } = this;
    return {
      id,
      name,
      color,
      attr,
      index,
      expanded,
      fibers: fibers.map((fiber) => fiber.getJson()),
    };
  }
}
