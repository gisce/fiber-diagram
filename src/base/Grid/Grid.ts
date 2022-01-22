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
import {
  TubeConnection,
  TubeConnectionApiType,
  TubeConnectionDataType,
} from "base/TubeConnection";
import { Fiber } from "base/Fiber";
import { Splitter } from "base/Splitter";
import { SplitterDataType } from "base/Splitter/Splitter.types";

export class Grid {
  initialData: GridDataType;
  id: number;
  name: string;
  onChange?: (grid: Grid) => void;

  size: Size;
  leftSideWidth: number;
  rightSideWidth: number;
  leftUsedSpace: number = 0;
  rightUsedSpace: number = 0;

  // Wires > Tubes > Fibers
  leftWires: Wire[] = [];
  rightWires: Wire[] = [];

  // Connections for fibers
  fiberConnections?: FiberConnection[] = [];

  // Connections for tubes whose fibers are connected in the same order and number to another fiber tube
  tubeConnections?: TubeConnection[] = [];

  // Splitters
  splitters: Splitter[] = [];

  constructor({
    input,
    onChange,
  }: {
    input?: GridDataType;
    onChange?: (grid: Grid) => void;
  }) {
    // We store the initial data for later comparing if our process detects any changes
    this.initialData = { ...input };

    this.id = input?.res?.id;
    this.name = input?.res?.name;
    this.onChange = onChange;

    // Initial sizing
    const { width, height } = { ...Config.gridSize };
    this.leftSideWidth = width / 2;
    this.rightSideWidth = width / 2;
    this.size = { width: this.leftSideWidth + this.rightSideWidth, height };

    // We parse the data in order to create our logical objects without position or size
    this.parse({ input });

    // And then we calculate positions and sizes of our elements
    this.calculate();
  }

  parse({ input }: { input?: GridDataType }) {
    // If we don't have data in the input, we just return
    if (!input?.res?.elements) {
      return;
    }

    // Check for wires
    if (!input.res.elements.wires) {
      return;
    }
    this.parseWires(input.res.elements.wires);

    // Check for splitters
    if (input.res?.elements?.splitters) {
      this.parseSplitters(input.res?.elements?.splitters);
    }

    // Check for connections
    if (input.res?.connections?.fibers) {
      this.parseConnections(input.res?.connections?.fibers);
    }
  }

  calculate() {
    // *******
    // First, sizing starting from deeper to outer (FIBER < TUBE < WIRE)
    // *******

    // 1- FIBERS WHOSE PARENTS ARE TUBES - SIZING
    this.getAllFibers().forEach((fiber: Fiber) => {
      if (fiber.parentType === "TUBE") {
        fiber.calculateSize();
      }
    });

    // 2- TUBES SIZING
    this.getAllTubes().forEach((tube: Tube) => {
      tube.calculateSize();
    });

    // 3- WIRES SIZING
    this.getAllWires().forEach((wire: Wire) => {
      wire.calculateSize();
    });

    // *******
    // Then, positioning from outer to deeper (WIRE > TUBE > FIBER)
    // *******

    // 4- WIRES POSITIONING
    this.getAllWires().forEach((wire: Wire) => {
      wire.calculatePosition();
    });

    // 5- TUBES POSITIONING
    this.getAllTubes().forEach((tube: Tube) => {
      tube.calculatePosition();
    });

    // 6- FIBERS WHOSE PARENTS ARE TUBES - POSITIONING
    this.getAllFibers().forEach((fiber: Fiber) => {
      if (fiber.parentType === "TUBE") {
        fiber.calculatePosition();
      }
    });

    // this.splitters.forEach((splitter: Splitter) => {
    //   splitter.calculateSize();
    // });

    // Finally we calculate our width and height
    this.size.height = this.getWiresHeight();
  }

  parseWires(wiresData: WireDataType[]) {
    wiresData.forEach((wireData: WireDataType) => this.addWire({ wireData }));
  }

  parseSplitters(splittersData: SplitterDataType[]) {
    splittersData.forEach((splitterData: SplitterDataType) =>
      this.splitters.push(
        new Splitter({
          data: splitterData,
          parentGrid: this,
          index: this.splitters.length,
        })
      )
    );
  }

  parseConnections(connectionsData: FiberConnectionApiType[]) {
    // We add all our fiber to fiber connections
    connectionsData.forEach((connectionData: FiberConnectionApiType) =>
      this.fiberConnections.push(
        new FiberConnection({
          data: connectionData,
          parentGrid: this,
        })
      )
    );

    // Once we have parsed all the fiber connections, we must evaluate every tube in order to determine if it's expanded or not by default
    this.getAllTubes().forEach((tube: Tube) => {
      tube.evaluateExpanded();
    });

    // We check for those tubes who are connected 1 to 1 to another tube and we add them to this.tubeConnections
    this.getConnectedO2OTubes().forEach(
      (connectedPairTube: TubeConnectionApiType) => {
        this.tubeConnections.push(
          new TubeConnection({
            data: connectedPairTube,
            parentGrid: this,
          })
        );
      }
    );
  }

  getConnectedO2OTubes() {
    const connectedPairTubes: TubeConnectionApiType[] = [];

    this.getAllTubes().forEach((tube: Tube) => {
      // If the tube it's already expanded, this is not a connected pair tube
      if (tube.expanded) {
        return;
      }

      // To avoid duplicates, we check if the tube is already in the array
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

  addWire({ wireData }: { wireData: WireDataType }) {
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

  addSplitter({ splitterData }: { splitterData: SplitterDataType }) {
    this.splitters.push(
      new Splitter({
        data: splitterData,
        parentGrid: this,
        index: this.splitters.length,
      })
    );

    this.dataHasChanged();
  }

  addFiberConnection(fiberConnectionData: FiberConnectionDataType) {
    this.fiberConnections.push(
      new FiberConnection({
        data: fiberConnectionData,
        parentGrid: this,
      })
    );

    this.dataHasChanged();
  }

  removeFiberConnection(fiberConnectionData: FiberConnectionDataType) {
    this.fiberConnections = this.fiberConnections.filter(
      (fiberConnection) =>
        fiberConnection.fiber_in !== fiberConnectionData.fiber_in &&
        fiberConnection.fiber_out !== fiberConnectionData.fiber_out
    );

    this.dataHasChanged();
  }

  addTubeConnection(tubeConnectionData: TubeConnectionDataType) {
    this.tubeConnections.push(
      new TubeConnection({
        data: tubeConnectionData,
        parentGrid: this,
      })
    );

    this.dataHasChanged();
  }

  removeTubeConnection(tubeConnectionData: TubeConnectionDataType) {
    this.tubeConnections = this.tubeConnections.filter(
      (tubeConnection) =>
        tubeConnection.tube_in !== tubeConnectionData.tube_in &&
        tubeConnection.tube_out !== tubeConnectionData.tube_out
    );

    this.dataHasChanged();
  }

  onTubeExpand(tube: Tube) {
    this.setTubeExpanded({ tube, expanded: true });
  }

  onTubeCollapse(tube: Tube) {
    this.setTubeExpanded({ tube, expanded: false });
  }

  setTubeExpanded({ tube, expanded }: { tube: Tube; expanded: boolean }) {
    const tubeConnection = this.getTubeConnectionWithId(tube.id);

    tube.expanded = expanded;

    if (tubeConnection && expanded) {
      // If we're going to expand the tube, we must remove the tube connection
      const otherTubeId = tubeConnection.getOtherTubeId(tube.id);
      const otherTube = this.getTubeById(otherTubeId);
      otherTube.expanded = expanded;

      tubeConnection.remove();
    } else {
      // If we're going to collapse the tube, we must add the tube connection
      const otherTube = tube.getTubeConnectedTo();
      otherTube.expanded = expanded;
      this.addTubeConnection({ tube_in: tube.id, tube_out: otherTube.id });
    }
  }

  getAllWires() {
    return [...this.leftWires, ...this.rightWires];
  }

  getAllTubes() {
    const allWires = this.getAllWires();
    let allTubes: Tube[] = [];
    allWires.forEach((wire) => {
      allTubes = [...allTubes, ...wire.tubes];
    });
    return allTubes;
  }

  getAllFibers() {
    const allTubes = this.getAllTubes();
    let allFibers: Fiber[] = [];

    allTubes.forEach((tube) => {
      allFibers = [...allFibers, ...tube.fibers];
    });

    this.splitters.forEach((splitter) => {
      allFibers = [...allFibers, ...splitter.fibers_in, ...splitter.fibers_out];
    });

    return allFibers;
  }

  getFiberById(id: number) {
    const foundFiber = this.getAllFibers().find((fiber) => fiber.id === id);

    if (!foundFiber) {
      throw new Error(`Fiber not found: ${id}`);
    }

    return foundFiber;
  }

  getTubeById(id: number) {
    const foundTube = this.getAllTubes().find((tube) => tube.id === id);

    if (!foundTube) {
      throw new Error(`Tube not found: ${id}`);
    }

    return foundTube;
  }

  getFiberConnectionWithId(id: number) {
    return this.fiberConnections.find((fiberConnection) =>
      fiberConnection.fiberIdBelongsToConnection(id)
    );
  }

  getTubeConnectionWithId(id: number) {
    return this.tubeConnections.find((tubeConnection) =>
      tubeConnection.tubeIdBelongsToConnection(id)
    );
  }

  getWiresHeight() {
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

  dataHasChanged() {
    this.calculate();
    this.onChange(this);
  }
}
