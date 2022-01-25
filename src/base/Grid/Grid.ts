import { Config } from "base/Config";
import { FiberConnection, FiberConnectionData } from "base/FiberConnection";
import { Wire, WireData } from "base/Wire";
import { Size } from "./Grid.types";
import { Tube } from "base/Tube";
import { TubeConnection, TubeConnectionData } from "base/TubeConnection";
import { Fiber } from "base/Fiber";
import { Splitter } from "base/Splitter";
import { SplitterData } from "base/Splitter/Splitter.types";
import { GridData } from ".";
import { PathController } from "base/PathController";

export class Grid {
  id: number;
  name: string;
  onChange?: (grid: Grid) => void;

  size: Size;
  leftSideWidth: number;
  rightSideWidth: number;

  // Wires > Tubes > Fibers
  leftWires: Wire[] = [];
  rightWires: Wire[] = [];

  // Connections for fibers
  fiberConnections?: FiberConnection[] = [];

  // Connections for tubes whose fibers are connected in the same order and number to another fiber tube
  tubeConnections?: TubeConnection[] = [];

  // Splitters
  splitters: Splitter[] = [];

  // Path Controller
  pathController: PathController;

  constructor({
    input,
    onChange,
  }: {
    input?: GridData;
    onChange?: (grid: Grid) => void;
  }) {
    this.id = input?.res?.id;
    this.name = input?.res?.name;
    this.onChange = onChange;

    // Initial sizing
    this.size = { ...Config.gridSize };
    this.leftSideWidth = this.size.width / 2;
    this.rightSideWidth = this.size.width / 2;

    if (input?.res?.leftSideWidth) {
      this.leftSideWidth = input?.res?.leftSideWidth;
      this.size.width = this.leftSideWidth + this.rightSideWidth;
    }

    if (input?.res?.rightSideWidth) {
      this.rightSideWidth = input?.res?.rightSideWidth;
      this.size.width = this.leftSideWidth + this.rightSideWidth;
    }

    // We parse the data in order to create our logical objects without position or size
    this.parse({ input });

    // Initialization of path controller
    this.pathController = new PathController({
      middlePoint: this.leftSideWidth,
    });

    // And then we calculate positions and sizes of our elements
    this.calculate();
  }

  parse({ input }: { input?: GridData }) {
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
    } else {
      // If we don't have fiber connections, then we must evaluate our tubes expanded states
      this.getAllTubes().forEach((tube: Tube) => {
        tube.evaluateExpanded();
      });
    }
  }

  calculate() {
    // *******
    // First, sizing starting from deeper to outer (FIBER < TUBE < WIRE)
    // *******

    // 1- FIBERS SIZING
    this.getAllFibers().forEach((fiber: Fiber) => {
      fiber.calculateSize();
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

    // 7- SPLITTERS SIZING
    this.splitters.forEach((splitter: Splitter) => {
      splitter.calculateSize();
    });

    // We calculate the tube connections
    this.tubeConnections.forEach((tubeConnection: TubeConnection) => {
      tubeConnection.calculate();
    });

    // We calculate the fiber connections for tube to tube and that tubes that are expanded
    // We avoid here connections to/from splitter
    this.fiberConnections.forEach((fiberConnection: FiberConnection) => {
      if (
        !fiberConnection.someFiberIsFromSplitter() &&
        fiberConnection.isVisible()
      ) {
        fiberConnection.calculate();
      }
    });

    // We can now position the splitters
    this.splitters.forEach((splitter: Splitter) => {
      splitter.calculatePosition();
    });

    // And the splitters fibers
    this.getAllFibers().forEach((fiber: Fiber) => {
      if (fiber.parentType === "SPLITTER") {
        fiber.calculatePosition();
      }
    });

    // Then we calculate connections from/to splitters
    this.fiberConnections.forEach((fiberConnection: FiberConnection) => {
      if (fiberConnection.someFiberIsFromSplitter()) {
        fiberConnection.calculate();
      }
    });

    // Finally we calculate our height
    const fusionColumnHeight =
      this.pathController.tubeFusionColumnController.indexController.getHeight();
    this.size.height =
      Math.max(this.getWiresHeight(), fusionColumnHeight) +
      this.getSplittersHeight();

    // And recalculate our width if needed
    this.recalculateWidth();
  }

  parseWires(wiresData: WireData[]) {
    wiresData.forEach((wireData: WireData) => this.addWire({ wireData }));
  }

  parseSplitters(splittersData: SplitterData[]) {
    splittersData.forEach((splitterData: SplitterData) =>
      this.splitters.push(
        new Splitter({
          data: splitterData,
          parentGrid: this,
          index: this.splitters.length,
        })
      )
    );
  }

  parseConnections(connectionsData: FiberConnectionData[]) {
    // We add all our fiber to fiber connections
    connectionsData.forEach((connectionData: FiberConnectionData) =>
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
      (connectedPairTube: TubeConnectionData) => {
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
    const connectedPairTubes: TubeConnectionData[] = [];

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

  addWire({ wireData }: { wireData: WireData }) {
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

  addSplitter({ splitterData }: { splitterData: SplitterData }) {
    this.splitters.push(
      new Splitter({
        data: splitterData,
        parentGrid: this,
        index: this.splitters.length,
      })
    );

    this.dataHasChanged();
  }

  addFiberConnection(fiberConnectionData: FiberConnectionData) {
    this.fiberConnections.push(
      new FiberConnection({
        data: fiberConnectionData,
        parentGrid: this,
      })
    );

    this.dataHasChanged();
  }

  removeFiberConnection(fiberConnectionData: FiberConnectionData) {
    this.fiberConnections = this.fiberConnections.filter(
      (fiberConnection) =>
        fiberConnection.fiber_in !== fiberConnectionData.fiber_in &&
        fiberConnection.fiber_out !== fiberConnectionData.fiber_out
    );

    this.dataHasChanged();
  }

  addTubeConnection(tubeConnectionData: TubeConnectionData) {
    this.tubeConnections.push(
      new TubeConnection({
        data: tubeConnectionData,
        parentGrid: this,
      })
    );

    this.dataHasChanged();
  }

  removeTubeConnection(tubeConnectionData: TubeConnectionData) {
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
    } else if (!expanded) {
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

  getSplittersHeight() {
    return this.splitters.reduce((acc, splitter) => {
      return acc + splitter.getHeight();
    }, 0);
  }

  recalculateWidth() {
    let mustRedraw = false;

    const leftAngleUsedWith =
      this.pathController.leftAngleRowController.indexController.getWidth();
    const rightAngleUsedWith =
      this.pathController.rightAngleRowController.indexController.getWidth();

    const wireTubeFiberSize =
      Config.baseUnits.fiber.width +
      Config.baseUnits.tube.width +
      Config.baseUnits.wire.width;

    // If the used width for left angle side is bigger than left width, then we reajust the left width
    if (leftAngleUsedWith >= this.leftSideWidth - wireTubeFiberSize) {
      mustRedraw = true;
      this.leftSideWidth = leftAngleUsedWith + Config.separationWireToAngle;
    }

    if (rightAngleUsedWith >= this.rightSideWidth - wireTubeFiberSize) {
      mustRedraw = true;
      this.rightSideWidth = rightAngleUsedWith + Config.separationWireToAngle;
    }

    if (mustRedraw) {
      this.size.width = this.leftSideWidth + this.rightSideWidth;
      this.pathController = new PathController({
        middlePoint: this.leftSideWidth,
      });
      this.calculate();
    }
  }

  getJson(): GridData {
    const output: GridData = {
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
        rightSideWidth: this.rightSideWidth,
        leftSideWidth: this.leftSideWidth,
      },
    };

    return output;
  }

  dataHasChanged() {
    this.onChange(this);
  }
}
