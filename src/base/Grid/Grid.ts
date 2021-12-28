import { Config } from "base/Config";
import { Wire, WireDataType } from "base/Wire";
import {
  GridApiType,
  GridDataType,
  Size,
  ConnectionsApiType,
} from "./Grid.types";

export class Grid {
  size: Size;
  leftWires: Wire[] = [];
  rightWires: Wire[] = [];
  onChange?: (grid: Grid) => void;
  initialized: boolean = false;
  wiresSized: { [key: number]: boolean } = {};
  wiresPositioned: { [key: number]: boolean } = {};
  connections?: ConnectionsApiType;

  constructor({
    input,
    onChange,
  }: {
    input?: GridDataType;
    onChange?: (grid: Grid) => void;
  }) {
    const { width, height } = Config.gridSize;
    this.size = { width, height };
    this.onChange = onChange;

    if (!input?.res?.elements) {
      this.initialized = true;
      return;
    }

    const { wires: wiresData } = input.res.elements;
    if (!wiresData) {
      this.initialized = true;
      return;
    }

    this.connections = input.res.connections;

    // We add our wires
    wiresData.forEach((wire: WireDataType) => this.addWire(wire));

    // And begin sizing them, expect each one to call onSizingDone to start sizing ourselves later.
    this.leftWires.concat(this.rightWires).forEach(function (wire: Wire) {
      wire.beginSizing();
    });
  }

  addWire(wireData: WireDataType) {
    const { disposition } = wireData;
    const wires = disposition === "LEFT" ? this.leftWires : this.rightWires;
    wires.push(
      new Wire({
        data: wireData,
        parentGrid: this,
        index: wires.length,
        onSizingDone: this.onWireSizedDone.bind(this),
        onPositioningDone: this.onWirePositionedDone.bind(this),
      })
    );
    this.onChangeIfNeeded();
  }

  allWiresAreSized() {
    this.leftWires.concat(this.rightWires).forEach(function (wire: Wire) {
      wire.calculatePosition();
    });
  }

  onWireSizedDone(wire: Wire) {
    if (
      Object.keys(this.wiresSized).length ===
      this.leftWires.concat(this.rightWires).length
    ) {
      return;
    }

    this.wiresSized[wire.id] = true;

    if (
      Object.keys(this.wiresSized).length ===
      this.leftWires.concat(this.rightWires).length
    ) {
      this.allWiresAreSized();
    }
  }

  onWirePositionedDone(wire: Wire) {
    if (
      Object.keys(this.wiresPositioned).length ===
      this.leftWires.concat(this.rightWires).length
    ) {
      return;
    }

    this.wiresPositioned[wire.id] = true;

    if (
      Object.keys(this.wiresPositioned).length ===
      this.leftWires.concat(this.rightWires).length
    ) {
      this.initialized = true;
    }
  }

  onChangeIfNeeded() {
    if (this.initialized) {
      this.onChange?.(this);
    }
  }

  getApiJson(): GridApiType {
    return {
      res: {
        elements: {
          wires: this.leftWires
            .concat(this.rightWires)
            .map((wire) => wire.getApiJson()),
        },
        connections: this.connections,
      },
    };
  }

  getJson(): GridDataType {
    return {
      res: {
        elements: {
          wires: this.leftWires
            .concat(this.rightWires)
            .map((wire) => wire.getJson()),
        },
        connections: this.connections,
      },
    };
  }

  getAllFibers() {
    const allWires = this.leftWires.concat(this.rightWires);
    let allFibers = [];

    for (let i = 0; i < allWires.length; i++) {
      const tubesForWire = allWires[i].tubes;
      for (let j = 0; j < tubesForWire.length; j++) {
        allFibers = [...allFibers, ...tubesForWire[j].fibers];
      }
    }

    return allFibers;
  }

  getFiberById(id: number) {
    const allFibers = this.getAllFibers();
    return allFibers.find((fiber) => fiber.id === id);
  }

  getConnectionForFiberId(id: number) {
    return this.connections.fibers.find((fiberConnection) => {
      return (
        fiberConnection.fiber_in === id || fiberConnection.fiber_out === id
      );
    });
  }

  getAllTubes() {
    const allWires = this.leftWires.concat(this.rightWires);
    let allTubes = [];

    for (let i = 0; i < allWires.length; i++) {
      const tubesForWire = allWires[i].tubes;
      allTubes = [...allTubes, ...tubesForWire];
    }

    return allTubes;
  }

  getTubeById(id: number) {
    return this.getAllTubes().find((tube) => tube.id === id);
  }
}
