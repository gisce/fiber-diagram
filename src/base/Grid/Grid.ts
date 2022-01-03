import { Config } from "base/Config";
import {
  Connection,
  FiberConnectionApiType,
  FiberConnectionDataType,
} from "base/Connection";
import { Wire, WireDataType } from "base/Wire";
import { GridApiType, GridDataType, Size } from "./Grid.types";

export class Grid {
  size: Size;
  leftSideWidth: number;
  rightSideWidth: number;
  leftWires: Wire[] = [];
  rightWires: Wire[] = [];
  onChange?: (grid: Grid) => void;
  initialized: boolean = false;
  wiresSized: { [key: number]: boolean } = {};
  wiresPositioned: { [key: number]: boolean } = {};
  connections?: Connection[] = [];
  leftSideComplexConnections?: Connection[] = [];
  rightSideComplexConnections?: Connection[] = [];
  verticalUsedIndexes: { [key: number]: boolean } = {};

  constructor({
    input,
    onChange,
  }: {
    input?: GridDataType;
    onChange?: (grid: Grid) => void;
  }) {
    const { width, height } = { ...Config.gridSize };
    this.size = { width, height };
    this.leftSideWidth = width / 2;
    this.rightSideWidth = width / 2;

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

    const connectionsData = input.res.connections?.fibers;
    if (connectionsData) {
      // We add our connections
      connectionsData.forEach((connection) => {
        this.addConnection(connection);
      });
    }

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
      this.drawConnections();
    }
  }

  drawConnections() {
    this.connections.forEach((connection) =>
      connection.calculatePositionSize()
    );
    this.initialized = true;
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
        connections: {
          fibers: this.connections.map((connection) => connection.getApiJson()),
        },
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
        connections: {
          fibers: this.connections.map((connection) => connection.getJson()),
        },
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
    return this.connections.find((fiberConnection) => {
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

  addConnection(connection: FiberConnectionApiType) {
    this.connections.push(
      new Connection({ data: connection, parentGrid: this })
    );
  }

  removeConnection(connection: FiberConnectionDataType) {
    Object.keys(connection.usedYpoints).forEach((yPoint) => {
      this.verticalUsedIndexes[yPoint] = false;
    });

    this.connections = this.connections.filter((conn) => {
      return (
        conn.fiber_in !== connection.fiber_in &&
        conn.fiber_out !== connection.fiber_out
      );
    });
    this.onChangeIfNeeded();
  }

  setVerticalUsedIndex(yPoint: number) {
    this.verticalUsedIndexes[yPoint] = true;
    this.verticalUsedIndexes[yPoint + 1] = true;
    this.verticalUsedIndexes[yPoint - 1] = true;
  }

  getFirstFreeIndexFromYpoint(yPoint: number) {
    let i = yPoint;
    while (this.verticalUsedIndexes[i] === true) {
      i++;
    }
    let j = yPoint;
    while (this.verticalUsedIndexes[j] === true) {
      j--;
    }

    if (i > this.size.height) {
      return j;
    }

    if (j < 0) {
      return i;
    }

    if (i - yPoint < j - yPoint) {
      return i;
    } else {
      return j;
    }
  }

  getFirstTwoFreeIndexesFromYpoint(yPoint: number) {
    let freeAboveIndexes: number[];
    let freeBelowIndexes: number[];

    for (let i = yPoint; i < this.size.height; i++) {
      if (
        (this.verticalUsedIndexes[i] === false ||
          this.verticalUsedIndexes[i] === undefined) &&
        i + 1 < this.size.height &&
        (this.verticalUsedIndexes[i + 1] === false ||
          (this.verticalUsedIndexes[i + 1] === undefined &&
            i + 2 < this.size.height &&
            (this.verticalUsedIndexes[i + 2] === false ||
              this.verticalUsedIndexes[i + 2] === undefined)))
      ) {
        freeAboveIndexes = [i, i + 1, i + 2];
        break;
      }
    }

    for (let j = yPoint; j >= 0; j--) {
      if (
        (this.verticalUsedIndexes[j] === false ||
          this.verticalUsedIndexes[j] === undefined) &&
        j - 1 >= 0 &&
        (this.verticalUsedIndexes[j - 1] === false ||
          this.verticalUsedIndexes[j - 1] === undefined) &&
        j - 2 >= 0 &&
        (this.verticalUsedIndexes[j - 2] === false ||
          this.verticalUsedIndexes[j - 2] === undefined)
      ) {
        (freeBelowIndexes = [j, j + 1]), j + 2;
        break;
      }
    }

    if (freeAboveIndexes === undefined && freeBelowIndexes === undefined) {
      this.size.height = this.size.height + 3;
      return [this.size.height + 2, this.size.height + 3, this.size.height + 4];
    }

    return freeAboveIndexes || freeBelowIndexes;
  }

  addLeftSideComplexConnection(connection: Connection) {
    this.leftSideComplexConnections.push(connection);
    // this.leftSideWidth =
    //   Config.gridSize.width -
    //   this.rightSideWidth +
    //   this.leftSideComplexConnections.length * 3;

    // this.onChangeIfNeeded();
  }

  addRightSideComplexConnection(connection: Connection) {
    this.rightSideComplexConnections.push(connection);
    // this.rightSideWidth =
    //   Config.gridSize.width -
    //   this.leftSideWidth +
    //   this.rightSideComplexConnections.length * 3;
    // this.onChangeIfNeeded();
  }
}
