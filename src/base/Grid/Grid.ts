import { Config } from "base/Config";
import {
  FiberConnection,
  FiberConnectionApiType,
  FiberConnectionDataType,
} from "base/FiberConnection";
import { Wire, WireDataType } from "base/Wire";
import {
  GridApiType,
  GridDataType,
  Size,
  VerticalIndexElement,
} from "./Grid.types";
import { isEqual } from "lodash";
import { Tube } from "base/Tube";
import { TubeConnection, TubeConnectionApiType } from "base/TubeConnection";
import {
  Columns,
  getNFreeIndexesFromYpoint,
  getClearedVerticalIndexesForElement,
} from "utils/pathUtils";
import { Fiber } from "base/Fiber";
import { Splitter } from "base/Splitter";

export class Grid {
  id: number;
  name: string;
  size: Size;
  leftSideWidth: number;
  rightSideWidth: number;
  leftWires: Wire[] = [];
  rightWires: Wire[] = [];
  onChange?: (grid: Grid) => void;
  fiberConnections?: FiberConnection[] = [];
  verticalUsedIndexes: Columns = {};
  initialData: GridDataType;
  tubeConnections?: TubeConnection[] = [];
  leftUsedSpace: number = 0;
  rightUsedSpace: number = 0;
  splitters: Splitter[] = [];

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

    if (input?.res?.leftUsedSpace) {
      if (
        input?.res?.leftUsedSpace >
        this.leftSideWidth * Config.growHorizontalFactor
      ) {
        this.leftSideWidth +=
          input?.res?.leftUsedSpace -
          this.leftSideWidth * Config.growHorizontalFactor;
      }
    }

    if (input?.res?.rightUsedSpace) {
      if (
        input?.res?.rightUsedSpace >
        this.rightSideWidth * Config.growHorizontalFactor
      ) {
        this.rightSideWidth +=
          input?.res?.rightUsedSpace -
          this.rightSideWidth * Config.growHorizontalFactor;
      }
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

    // First, we add the connections. We must do this before adding the wires, because we need to know which wires will be collapsed
    const connectionsData = input.res.connections?.fibers;
    if (connectionsData) {
      connectionsData.forEach((connection) => {
        this.fiberConnections.push(
          new FiberConnection({
            data: connection,
            parentGrid: this,
          })
        );
      });
    }

    // We add our wires
    wiresData.forEach((wire: WireDataType) => this.addWire(wire));
    this.leftWires.concat(this.rightWires).forEach(function (wire: Wire) {
      wire.calculateSize();
      wire.calculatePosition();
    });

    this.placeSplitters();
    this.drawConnections();

    // We recalculate the height of the grid because wires and fibers may have changed it
    const newHeight: number = this.getHeight();
    if (this.size.height < newHeight) {
      this.size.height = newHeight;
    }

    this.rightUsedSpace += this.getSplittersIncreasedWidth();

    this.onChangeIfNeeded();
  }

  addWire(wireData: WireDataType) {
    const { disposition } = wireData;
    const wires = disposition === "LEFT" ? this.leftWires : this.rightWires;
    wires.push(
      new Wire({
        data: wireData,
        parentGrid: this,
        index: wires.length,
      })
    );
  }

  drawConnections() {
    this.tubeConnections = this.getConnectedPairTubes().map((pair) => {
      return new TubeConnection({ data: pair, parentGrid: this });
    });

    if (this.fiberConnections.length > 0) {
      this.fiberConnections.forEach((connection) =>
        connection.calculatePositionSize()
      );
    }
  }

  placeSplitters() {
    if (this.initialData.res?.elements?.splitters) {
      this.splitters = this.initialData.res?.elements?.splitters.map(
        (splitter, idx) => {
          const { id, fibers_in, fibers_out, index } = splitter as any;
          const splitterIndex = index !== undefined ? index : idx;

          return new Splitter({
            id,
            fibers_in,
            fibers_out,
            parentGrid: this,
            index: splitterIndex,
          });
        }
      );

      this.splitters.forEach((splitter) => {
        splitter.calculateSize();
        splitter.parseFibers();
      });

      this.splitters.forEach((splitter) => {
        splitter.calculatePosition();
      });
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
          splitters: this.splitters.map((splitter) => splitter.getApiJson()),
        },
        connections: {
          fibers: [
            ...this.fiberConnections.map((connection) =>
              connection.getApiJson()
            ),
          ],
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
          splitters: this.splitters.map((splitter) => splitter.getJson()),
        },
        connections: {
          fibers: [
            ...this.fiberConnections.map((connection) => connection.getJson()),
          ],
        },
        leftUsedSpace: this.leftUsedSpace,
        rightUsedSpace: this.rightUsedSpace,
      },
    };

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

    this.splitters.forEach((splitter) => {
      allFibers.push(...splitter.fibersIn);
      allFibers.push(...splitter.fibersOut);
    });

    return allFibers;
  }

  getFiberById(id: number) {
    const allFibers = this.getAllFibers();
    return allFibers.find((fiber) => fiber.id === id);
  }

  getConnectionForFiberId(id: number) {
    return this.fiberConnections.find((fiberConnection) => {
      return (
        fiberConnection.fiber_in === id || fiberConnection.fiber_out === id
      );
    });
  }

  getNFreeIndexesFromYpoint({
    n,
    unitSize,
    fromY,
  }: {
    n: number; // Number of indexes to return
    unitSize: number; // Size of a unit
    fromY: number; // Y point to start from
  }) {
    return getNFreeIndexesFromYpoint({
      n,
      fromY,
      unitSize,
      gridHeight: this.size.height,
      columns: this.verticalUsedIndexes,
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

  addFiberConnection(connection: FiberConnectionApiType) {
    const newConnection = new FiberConnection({
      data: connection,
      parentGrid: this,
    });
    this.fiberConnections.push(newConnection);
    newConnection.calculatePositionSize();
    this.onChangeIfNeeded();
  }

  removeFiberConnection(connection: FiberConnectionDataType) {
    this.verticalUsedIndexes = getClearedVerticalIndexesForElement({
      element: {
        type: "fiber",
        id: connection.fiber_in,
      },
      verticalUsedIndexes: this.verticalUsedIndexes,
    });
    this.verticalUsedIndexes = getClearedVerticalIndexesForElement({
      element: {
        type: "fiber",
        id: connection.fiber_out,
      },
      verticalUsedIndexes: this.verticalUsedIndexes,
    });

    this.fiberConnections = this.fiberConnections.filter((conn) => {
      let fiberId: number;

      if (conn.fiber_in === connection.fiber_in) {
        fiberId = conn.fiber_in;
      }

      if (conn.fiber_out === connection.fiber_out) {
        fiberId = conn.fiber_out;
      }

      const fiber: Fiber = this.getFiberById(fiberId);

      if (fiber) {
        if (fiber.parentTube?.parentWire.disposition === "LEFT") {
          this.leftUsedSpace -=
            Config.baseUnits.fiber.height * Config.angleSeparatorFactor;
        } else {
          this.rightUsedSpace -=
            Config.baseUnits.fiber.height * Config.angleSeparatorFactor;
        }
      }

      return (
        conn.fiber_in !== connection.fiber_in &&
        conn.fiber_out !== connection.fiber_out
      );
    });

    this.onChangeIfNeeded();
  }

  setVerticalUsedIndexWithHeight({
    yPoint,
    height,
    element,
  }: {
    yPoint: number;
    height: number;
    element: VerticalIndexElement;
  }) {
    this.verticalUsedIndexes[yPoint] = element;

    for (let i = yPoint; i < yPoint + height; i++) {
      this.verticalUsedIndexes[i] = element;
    }
  }

  getHeight() {
    return (
      Math.max(
        this.getCurrentWiresHeight(),
        this.getVerticalConnectionsHeight()
      ) + this.getSplittersHeight()
    );
  }

  getSplittersHeight() {
    return this.splitters.reduce((acc, splitter) => {
      return acc + splitter.attr.size.height;
    }, 0);
  }

  getSplittersIncreasedWidth() {
    if (this.splitters.length < 2) {
      return 0;
    }

    const sortedSplitters = this.splitters.sort((a, b) => {
      return b.attr.position.x - a.attr.position.x;
    });

    const increasedWidth =
      sortedSplitters[0].attr.position.x - this.leftSideWidth;

    return increasedWidth;
  }

  getCurrentWiresHeight() {
    const leftHeight = this.leftWires.reduce(
      (a, b) => a + b.attr.size.height + Config.wireSeparation,
      0
    );
    const rightHeight = this.rightWires.reduce(
      (a, b) => a + b.attr.size.height + Config.wireSeparation,
      0
    );
    return Math.max(leftHeight, rightHeight);
  }

  getVerticalConnectionsHeight() {
    const yPoints: number[] = Object.keys(this.verticalUsedIndexes)
      .filter((entry) => {
        return this.verticalUsedIndexes[entry] !== undefined;
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
    });
  }

  checkFibersAreConnectedInSameOrder(fibers: Fiber[]) {
    const tubesConnectedTo: { [key: number]: Tube } = {};

    const sameOrder = fibers.every((fiber) => {
      const fiberConnection = this.getConnectionForFiberId(fiber.id);

      if (!fiberConnection) {
        // Fiber is not connected anywhere
        return false;
      }

      const otherFiberId =
        fiberConnection.fiber_in === fiber.id
          ? fiberConnection.fiber_out
          : fiberConnection.fiber_in;

      const otherFiber: Fiber = this.getFiberById(otherFiberId);

      if (!otherFiber) {
        // TODO: throw error when splitters are implemented
        return false;
      }

      tubesConnectedTo[otherFiber.parentTube.id] = otherFiber.parentTube;

      const indexOfFiber = fiber.parentTube.fibers.indexOf(fiber);
      const indexOfOtherFiber =
        otherFiber.parentTube.fibers.indexOf(otherFiber);
      return indexOfFiber === indexOfOtherFiber;
    });

    return sameOrder && Object.values(tubesConnectedTo).length === 1;
  }

  getConnectedPairTubes() {
    const connectedPairTubes: TubeConnectionApiType[] = [];

    const allTubes = this.getAllTubes();

    allTubes.forEach((tube: Tube) => {
      if (tube.expanded) {
        return;
      }
      if (
        connectedPairTubes.find(
          (conn) => conn.tube_in === tube.id || conn.tube_out === tube.id
        )
      ) {
        return;
      }
      const tubeConnectedTo = tube.getTubeConnectedTo();

      if (tubeConnectedTo) {
        connectedPairTubes.push({
          tube_in: tube.id,
          tube_out: tubeConnectedTo.id,
        });
      }
    });

    return connectedPairTubes;
  }
}
