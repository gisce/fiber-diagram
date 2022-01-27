import { Config } from "base/Config";
import { Fiber, FiberData } from "base/Fiber";
import { Grid, InitialPositionSize, PositionSize } from "base/Grid";
import { SplitterData } from "./Splitter.types";

export class Splitter {
  id: number;
  attr?: PositionSize = { ...InitialPositionSize };
  parentGrid: Grid;
  fibers_in?: Fiber[] = [];
  fibers_out?: Fiber[] = [];
  index: number;

  constructor({
    data,
    parentGrid,
    index,
  }: {
    data: SplitterData;
    parentGrid: Grid;
    index: number;
  }) {
    const { id, fibers_in, fibers_out } = data;
    this.id = id;
    this.fibers_in = this.getParsedFibers(fibers_in);
    this.fibers_out = this.getParsedFibers(fibers_out);

    this.parentGrid = parentGrid;
    this.index = index;
  }

  calculateSize() {
    this.attr.size = {
      width: Config.splitterWidth + Config.baseUnits.fiber.width * 2,
      height:
        (this.fibers_out.length + this.fibers_out.length + 1) *
        Config.baseUnits.fiber.height,
    };
  }

  calculatePosition() {
    const inputFiberConnections = this.fibers_in
      .map((fiber) => this.parentGrid.getFiberConnectionWithId(fiber.id))
      .filter((fiberConnection) => fiberConnection !== undefined);

    const fiberInputsWithSplitterOrigin = inputFiberConnections
      .map((fiberConnection) => {
        const inputFiberId = this.fibers_in.some(
          (f) => f.id === fiberConnection.fiber_in
        )
          ? fiberConnection.fiber_out
          : fiberConnection.fiber_in;

        const inputFiber = this.parentGrid.getFiberById(inputFiberId);
        const splitterOrigin = inputFiber.parentType === "SPLITTER";

        if (splitterOrigin) {
          return inputFiber;
        } else {
          return undefined;
        }
      })
      .filter((fiber) => fiber !== undefined)
      .sort((a, b) => {
        return a.attr.position.x - b.attr.position.x;
      });

    let x: number;

    if (fiberInputsWithSplitterOrigin.length > 0) {
      const farestFiber: Fiber = fiberInputsWithSplitterOrigin[0];

      const inputSplitter = farestFiber.parent as Splitter;

      if (inputSplitter.attr.position.x === 0) {
        inputSplitter.calculatePosition();
      }
      x =
        inputSplitter.attr.position.x +
        inputSplitter.attr.size.width +
        Config.baseUnits.fiber.height;

      const freeXPoints =
        this.parentGrid.pathController.rightAngleRowController.indexController.getFreeAboveIndexes(
          {
            point: x + Config.baseUnits.fiber.height * 2,
            n: 1,
            unitSize: this.attr.size.width,
          }
        );

      x = freeXPoints[0];
    } else {
      x = this.parentGrid.leftSideWidth;
    }

    const fusionColumnHeight =
      this.parentGrid.pathController.tubeFusionColumnController.indexController.getHeight();
    const wiresHeight = this.parentGrid.getWiresHeight();

    const previousSplitter = this.parentGrid.splitters.find(
      (splitter: Splitter) => {
        return splitter.index === this.index - 1;
      }
    );

    if (previousSplitter) {
      // We have splitters above us
      const previousSplitterYEnd =
        previousSplitter.attr.position.y + previousSplitter.getHeight();

      this.attr.position = {
        x,
        y: previousSplitterYEnd,
      };
    } else {
      // We are the first splitter
      this.attr.position = {
        x,
        y: Math.max(wiresHeight, fusionColumnHeight),
      };
    }
  }

  getParsedFibers(fibersData: FiberData[]) {
    return fibersData.map((fiberEntry, index) => {
      return new Fiber({
        data: { ...fiberEntry, color: Config.colorForSplitters },
        parent: this,
        index: index,
      });
    });
  }

  isFiberInput(fiber: Fiber) {
    return this.fibers_in.find((f) => f.id === fiber.id) !== undefined;
  }

  getSibilingsForFiber(fiber: Fiber) {
    const fibers = this.isFiberInput(fiber) ? this.fibers_in : this.fibers_out;
    return fibers.filter((f) => f.id !== fiber.id);
  }

  getHeight() {
    return this.attr.size.height + Config.separation * 2;
  }

  getPreviousSibilingsHeight() {
    const previousSibilings = this.parentGrid.splitters.filter((splitter) => {
      const splitterIndex = splitter.index;
      return splitterIndex < this.index;
    });

    return previousSibilings.reduce((acc, splitter) => {
      return acc + splitter.getHeight();
    }, 0);
  }

  getSplittersConnectedInInput() {
    return this.fibers_in
      .map((fiber) => {
        return this.getSplitterConnectedInInput(fiber);
      })
      .filter((splitter) => splitter !== undefined);
  }

  getSplitterConnectedInInput(fiber: Fiber) {
    const fiberConnection = this.parentGrid.getFiberConnectionWithId(fiber.id);
    if (!fiberConnection) {
      return undefined;
    }

    const fiberIdConnectedTo =
      fiber.id === fiberConnection.fiber_in
        ? fiberConnection.fiber_out
        : fiberConnection.fiber_in;
    const fiberConnectedTo = this.parentGrid.getFiberById(fiberIdConnectedTo);

    if (!fiberConnectedTo) {
      return undefined;
    }

    if (fiberConnectedTo.parentType !== "SPLITTER") {
      return undefined;
    }

    return fiberConnectedTo.parent as Splitter;
  }

  getJson() {
    return {
      id: this.id,
      fibers_in: this.fibers_in.map((fiber) => fiber.getJson()),
      fibers_out: this.fibers_out.map((fiber) => fiber.getJson()),
      index: this.index,
    };
  }

  getParentGrid() {
    return this.parentGrid;
  }
}
