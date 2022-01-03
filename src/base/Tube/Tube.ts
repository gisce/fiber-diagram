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
  fibersSized: { [key: string]: boolean } = {};
  fibersPositioned: { [key: string]: boolean } = {};
  onSizingDone?: (tube: Tube) => void;
  onPositioningDone?: (tube: Tube) => void;

  constructor({
    data,
    parentWire,
    index,
    onSizingDone,
    onPositioningDone,
  }: {
    data: TubeDataType;
    parentWire: Wire;
    index: number;
    onSizingDone?: (tube: Tube) => void;
    onPositioningDone?: (tube: Tube) => void;
  }) {
    this.attr = { ...InitialPositionSize };
    this.parentWire = parentWire;
    this.index = index;
    this.onSizingDone = onSizingDone;
    this.onPositioningDone = onPositioningDone;

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
        onSizingDone: this.onFiberSizedDone.bind(this),
        onPositioningDone: this.onFiberPositionedDone.bind(this),
      })
    );
    this.onChangeIfNeeded();
  }

  onFiberSizedDone(fiber: Fiber) {
    if (Object.keys(this.fibersSized).length === this.fibers.length) {
      return;
    }

    this.fibersSized[fiber.id] = true;

    if (Object.keys(this.fibersSized).length === this.fibers.length) {
      this.calculateSize();
    }
  }

  onFiberPositionedDone(fiber: Fiber) {
    if (Object.keys(this.fibersPositioned).length === this.fibers.length) {
      return;
    }

    this.fibersPositioned[fiber.id] = true;

    if (Object.keys(this.fibersPositioned).length === this.fibers.length) {
      this.initialized = true;
      this.onPositioningDone?.(this);
    }
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

    this.onSizingDone?.(this);
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
      this.onPositioningDone?.(this);
      return;
    }

    this.fibers.forEach(function (fiber) {
      fiber.calculatePosition();
    });
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
    let value = true;
    const tubesConnectedTo: { [key: number]: Tube } = {};

    this.fibers.forEach((fiber) => {
      const fiberConnection =
        this.parentWire.parentGrid.getConnectionForFiberId(fiber.id);

      if (fiberConnection) {
        const destinationFiberId =
          fiberConnection.fiber_in === fiber.id
            ? fiberConnection.fiber_out
            : fiberConnection.fiber_in;
        const destinationFiber =
          this.parentWire.parentGrid.getFiberById(destinationFiberId);

        if (!destinationFiber) {
          // Destination fiber with id not found, fiber not connected.
          console.error(`Fiber with id ${destinationFiberId} not found`);
          // TODO: throw error when splitters are implemented.
          // throw `Fiber with id ${destinationFiberId} not found`;
          value = false;
          return;
        }

        const destinationTube = destinationFiber.parentTube;
        tubesConnectedTo[destinationTube.id] = destinationTube;

        // If our fibbers are all connected to the same tube, we can collapse.
        // If not, we can't collapse.
        if (Object.values(tubesConnectedTo).length > 1) {
          value = false;
          return;
        }
      } else {
        // Fiber is not connected to anything
        value = false;
      }
    });

    if (value) {
      return Object.values(tubesConnectedTo)[0];
    } else {
      return undefined;
    }
  }
}
