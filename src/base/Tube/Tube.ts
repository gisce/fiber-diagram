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
  initialized: boolean = false;
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

    if (!data) {
      this.initialized = true;
      return;
    }

    const { id, name, color, expanded, fibers: fibersData = [] } = data;

    this.id = id;
    this.name = name;
    this.color = color;
    this.expanded = expanded;

    // We add our fibers and expect each one to call onSizingDone to start sizing ourselves later.
    fibersData.forEach((fiberData) => this.addFiber(fiberData));
  }

  addFiber(fiberData: FiberDataType) {
    this.fibers.push(
      new Fiber({
        data: fiberData,
        parentTube: this,
        index: this.fibers.length,
      })
    );
    this.onChangeIfNeeded();
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

    if (this.fibers.length === 0 || this.expanded === false) {
      this.initialized = true;
      return;
    }

    this.fibers.forEach(function (fiber) {
      fiber.calculatePosition();
    });

    this.initialized = true;
  }

  beginSizing() {
    if (this.expanded === undefined) {
      this.expanded = !this.canWeCollapse();
    }

    if (this.fibers.length === 0 || this.expanded === false) {
      this.calculateSize();
      return;
    }

    this.fibers.forEach(function (fiber) {
      fiber.calculateSize();
    });

    this.calculateSize();
  }

  onChangeIfNeeded() {
    if (!this.initialized) {
      return;
    }

    this.parentWire.parentGrid.onChangeIfNeeded();
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

  expand() {
    if (!this.initialized) {
      return;
    }

    if (this.expanded) {
      return;
    }

    this.expanded = true;

    const tubeConnectedTo = this.getTubeConnectedTo();
    if (tubeConnectedTo) {
      tubeConnectedTo.expand();
    }

    this.onChangeIfNeeded();
  }

  collapse({ mustCollapseLinkedTubes }: { mustCollapseLinkedTubes: boolean }) {
    if (!this.initialized) {
      return;
    }

    if (!this.expanded || !this.canWeCollapse()) {
      return;
    }

    this.expanded = false;

    const tubeConnectedTo = this.getTubeConnectedTo();
    if (tubeConnectedTo && mustCollapseLinkedTubes) {
      tubeConnectedTo.collapse({ mustCollapseLinkedTubes: false });
    }

    this.parentWire.parentGrid.collapseConnectionsForTube(this);

    this.onChangeIfNeeded();
  }

  canWeCollapse() {
    if (this.getTubeConnectedTo() !== undefined) {
      return true;
    } else {
      return false;
    }
  }

  getTubeConnectedTo() {
    if (
      this.parentWire.parentGrid.checkFibersAreConnectedInSameOrder(this.fibers)
    ) {
      const connection = this.parentWire.parentGrid.getConnectionForFiberId(
        this.fibers[0].id
      );
      if (!connection) {
        // Fiber is not connected to anywhere
        return undefined;
      }

      const otherEndFiberId =
        connection.fiber_in === this.fibers[0].id
          ? connection.fiber_out
          : connection.fiber_in;
      const otherEndFiber =
        this.parentWire.parentGrid.getFiberById(otherEndFiberId);

      if (!otherEndFiber) {
        return undefined;
      }

      return otherEndFiber.parentTube;
    } else {
      return undefined;
    }
  }
}
