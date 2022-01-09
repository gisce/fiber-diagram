import { Config } from "base/Config";
import {
  FibberConnection,
  FiberConnectionApiType,
  FiberConnectionDataType,
} from "base/FibberConnection";
import { Wire, WireDataType } from "base/Wire";
import {
  FiberConnectionSegment,
  GridApiType,
  GridDataType,
  Size,
} from "./Grid.types";
import { isEqual, reduce } from "lodash";
import { Tube } from "base/Tube";

export class Grid {
  id: number;
  name: string;
  size: Size;
  leftSideWidth: number;
  rightSideWidth: number;
  leftWires: Wire[] = [];
  rightWires: Wire[] = [];
  onChange?: (grid: Grid) => void;
  wiresSized: { [key: number]: boolean } = {};
  wiresPositioned: { [key: number]: boolean } = {};
  fibberConnections?: FibberConnection[] = [];
  leftSideAngleSegments?: FiberConnectionSegment[] = [];
  rightSideAngleSegments?: FiberConnectionSegment[] = [];
  verticalUsedIndexes: { [key: number]: boolean } = {};
  fibberConnectionsInitialized: FiberConnectionApiType[] = [];
  initialData: GridDataType;

  constructor({
    input,
    onChange,
  }: {
    input?: GridDataType;
    onChange?: (grid: Grid) => void;
  }) {
    const { width, height } = { ...Config.gridSize };
    this.leftSideWidth = width / 2;
    this.rightSideWidth = width / 2;
    this.initialData = { ...input };

    if (
      input?.res?.leftSideAngleSegments &&
      input?.res?.leftSideAngleSegments.length >
        Config.angleThresholdGrowHorizontal
    ) {
      this.leftSideAngleSegments = input.res.leftSideAngleSegments;
      this.leftSideWidth +=
        (this.leftSideAngleSegments.length -
          (Config.angleThresholdGrowHorizontal - 1)) *
        (Config.baseUnits.fiber.height * 3);
    }

    if (
      input?.res?.rightSideAngleSegments &&
      input?.res?.rightSideAngleSegments.length >
        Config.angleThresholdGrowHorizontal
    ) {
      this.rightSideAngleSegments = input.res.rightSideAngleSegments;

      this.rightSideWidth =
        width / 2 +
        (this.rightSideAngleSegments.length -
          (Config.angleThresholdGrowHorizontal - 1)) *
          (Config.baseUnits.fiber.height * 3);
    }

    this.size = { width: this.leftSideWidth + this.rightSideWidth, height };

    this.onChange = onChange;

    this.id = input?.res?.id;
    this.name = input?.res?.name;

    if (!input?.res?.elements) {
      return;
    }

    const { wires: wiresData } = input.res.elements;
    if (!wiresData) {
      return;
    }

    const connectionsData = input.res.connections?.fibers;
    if (connectionsData) {
      // We add our connections
      connectionsData.forEach((connection) => {
        this.fibberConnections.push(
          new FibberConnection({
            data: connection,
            parentGrid: this,
            onInitializeDone: this.onConnectionInitialized.bind(this),
          })
        );
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
    if (this.fibberConnections.length > 0) {
      this.fibberConnections.forEach((connection) =>
        connection.calculatePositionSize()
      );
    }
  }

  onChangeIfNeeded() {
    const initialData = this.initialData;
    const thisJson = {
      ...this.getJson(),
    };

    const dataIsSync = isEqual(initialData, thisJson);

    if (!dataIsSync) {
      this.onChange?.(this);
    }
  }

  getApiJson(): GridApiType {
    return {
      res: {
        id: this.id,
        name: this.name,
        elements: {
          wires: this.leftWires
            .concat(this.rightWires)
            .map((wire) => wire.getApiJson()),
        },
        connections: {
          fibers: this.fibberConnections.map((connection) => connection.getApiJson()),
        },
      },
    };
  }

  getJson(): GridDataType {
    const output: GridDataType = {
      res: {
        id: this.id,
        name: this.name,
        elements: {
          wires: this.leftWires
            .concat(this.rightWires)
            .map((wire) => wire.getJson()),
        },
        connections: {
          fibers: this.fibberConnections.map((connection) => connection.getJson()),
        },
      },
    };

    if (this.leftSideAngleSegments.length > 0) {
      output.res.leftSideAngleSegments = this.leftSideAngleSegments;
    }
    if (this.rightSideAngleSegments.length > 0) {
      output.res.rightSideAngleSegments = this.rightSideAngleSegments;
    }

    return output;
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
    return this.fibberConnections.find((fiberConnection) => {
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

  addFibberConnection(connection: FiberConnectionApiType) {
    const newConnection = new FibberConnection({
      data: connection,
      parentGrid: this,
      onInitializeDone: (conn: FibberConnection) => {
        this.onConnectionInitialized(conn);
        this.onChangeIfNeeded();
      },
    });
    this.fibberConnections.push(newConnection);
    newConnection.calculatePositionSize();
  }

  onConnectionInitialized(connection: FibberConnection) {
    const exists = this.fibberConnectionsInitialized.find((conn) => {
      return (
        conn.fiber_in === connection.fiber_in &&
        conn.fiber_out === connection.fiber_out
      );
    });

    if (!exists) {
      this.fibberConnectionsInitialized.push({
        fiber_in: connection.fiber_in,
        fiber_out: connection.fiber_out,
      });
    }

    const height: number = this.getHeight();
    if (this.size.height < height) {
      this.size.height = height;
    }

    if (this.fibberConnectionsInitialized.length === this.fibberConnections.length) {
      this.onChangeIfNeeded();
    }
  }

  removeConnection(connection: FiberConnectionDataType) {
    Object.keys(connection.usedYpoints).forEach((yPoint) => {
      this.verticalUsedIndexes[yPoint] = false;
    });

    this.fibberConnections = this.fibberConnections.filter((conn) => {
      return (
        conn.fiber_in !== connection.fiber_in &&
        conn.fiber_out !== connection.fiber_out
      );
    });

    this.leftSideAngleSegments = this.leftSideAngleSegments.filter(
      (segment) => {
        return (
          segment.fiber_id !== connection.fiber_in &&
          segment.fiber_id !== connection.fiber_out
        );
      }
    );

    this.rightSideAngleSegments = this.rightSideAngleSegments.filter(
      (segment) => {
        return (
          segment.fiber_id !== connection.fiber_in &&
          segment.fiber_id !== connection.fiber_out
        );
      }
    );

    this.fibberConnectionsInitialized = this.fibberConnectionsInitialized.filter((conn) => {
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

  getFirstThreeFreeIndexesFromYpoint(yPoint: number) {
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
        freeBelowIndexes = [j, j - 1, j - 2];
        break;
      }
    }

    if (freeAboveIndexes === undefined && freeBelowIndexes === undefined) {
      this.size.height = this.size.height + 3;
      return [this.size.height + 2, this.size.height + 3, this.size.height + 4];
    }

    return freeAboveIndexes || freeBelowIndexes;
  }

  addLeftSideAngleSegment(segment: FiberConnectionSegment) {
    const exists = this.leftSideAngleSegments.find((sgm) => {
      return sgm.fiber_id === segment.fiber_id;
    });

    if (!exists) {
      this.leftSideAngleSegments.push(segment);
    }
  }

  addRightSideAngleSegment(segment: FiberConnectionSegment) {
    const exists = this.rightSideAngleSegments.find((sgm) => {
      return sgm.fiber_id === segment.fiber_id;
    });

    if (!exists) {
      this.rightSideAngleSegments.push(segment);
    }
  }

  getHeight() {
    return Math.max(
      this.getCurrentWiresHeight(),
      this.getVerticalConnectionsHeight()
    );
  }

  getCurrentWiresHeight() {
    const leftHeight = this.leftWires.reduce(
      (a, b) => a + b.attr.size.height + Config.separation * 2,
      0
    );
    const rightHeight = this.rightWires.reduce(
      (a, b) => a + b.attr.size.height + Config.separation * 2,
      0
    );
    return Math.max(leftHeight, rightHeight);
  }

  getVerticalConnectionsHeight() {
    const yPoints: number[] = Object.keys(this.verticalUsedIndexes)
      .filter((entry) => {
        return this.verticalUsedIndexes[entry] === true;
      })
      .map((pointKey: string) => {
        return parseInt(pointKey, 10);
      });
    return Math.max(...yPoints) + Config.baseUnits.fiber.height * 3;
  }

  collapseConnectionsForTube(tube: Tube) {
    tube.fibers.forEach((fiber) => {
      const fiberConnection = this.getConnectionForFiberId(fiber.id);

      Object.keys(fiberConnection.usedYpoints).forEach((yPoint) => {
        this.verticalUsedIndexes[yPoint] = false;
      });

      this.leftSideAngleSegments = this.leftSideAngleSegments.filter((sgm) => {
        return (
          sgm.fiber_id !== fiberConnection.fiber_in &&
          sgm.fiber_id !== fiberConnection.fiber_out
        );
      });

      this.rightSideAngleSegments = this.rightSideAngleSegments.filter(
        (sgm) => {
          return (
            sgm.fiber_id !== fiberConnection.fiber_in &&
            sgm.fiber_id !== fiberConnection.fiber_out
          );
        }
      );

      this.fibberConnectionsInitialized = this.fibberConnectionsInitialized.filter(
        (conn) => {
          return (
            conn.fiber_in !== fiberConnection.fiber_in &&
            conn.fiber_out !== fiberConnection.fiber_out
          );
        }
      );
    });
  }
}
