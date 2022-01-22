import { Config } from "base/Config";
import { Fiber, FiberDataType } from "base/Fiber";
import { InitialPositionSize, PositionSize } from "base/Grid";
import { Wire } from "base/Wire";
import { TubeApiType, TubeDataType } from "./Tube.types";

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
    data: TubeDataType;
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

  addFiber(fiberData: FiberDataType) {
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
      const fiberConnection = this.parentGrid().getFiberConnectionWithId(
        fiber.id
      );

      // Fiber is not connected anywhere
      if (!fiberConnection) {
        return false;
      }

      const otherFiberId = fiberConnection.getOtherFiberId(fiber.id);
      const otherFiber: Fiber = this.parentGrid().getFiberById(otherFiberId);

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
      sameOrder && Object.values(tubesConnectedTo).length === 1;

    if (connectedToSameTube) {
      return Object.values(tubesConnectedTo)[0];
    } else {
      return undefined;
    }
  }

  canWeCollapse() {
    if (this.getTubeConnectedTo() !== undefined) {
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

    this.parentGrid().onTubeExpand(this);
  }

  collapse() {
    if (!this.expanded || !this.canWeCollapse()) {
      return;
    }

    this.parentGrid().onTubeCollapse(this);
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

  parentGrid() {
    return this.parentWire.parentGrid;
  }

  getApiJson(): TubeApiType {
    const { id, name, color, fibers } = this;
    return {
      id,
      name,
      color,
      fibers: fibers.map((fiber) => fiber.getApiJson()),
    };
  }

  getJson(): TubeDataType {
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
