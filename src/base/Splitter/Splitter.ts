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
    const inputFiberConnection = this.parentGrid.getFiberConnectionWithId(
      this.fibers_in[0].id
    );

    let inputFiber: Fiber;
    let splitterOrigin: boolean;

    if (inputFiberConnection) {
      const inputFiberId =
        this.fibers_in[0].id === inputFiberConnection.fiber_in
          ? inputFiberConnection.fiber_out
          : inputFiberConnection.fiber_in;

      inputFiber = this.parentGrid.getFiberById(inputFiberId);
      splitterOrigin = inputFiber.parentType === "SPLITTER";
    }

    const x = splitterOrigin
      ? this.parentGrid.leftSideWidth +
        this.attr.size.width +
        Config.baseUnits.fiber.width
      : this.parentGrid.leftSideWidth;

    const fusionColumnHeight =
      this.parentGrid.pathController.tubeFusionColumnController.indexController.getHeight();
    const wiresHeight = this.parentGrid.getWiresHeight();

    const previousSibilingsHeight = this.getPreviousSibilingsHeight();

    this.attr.position = {
      x,
      y: Math.max(wiresHeight, fusionColumnHeight) + previousSibilingsHeight,
    };
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

  getJson() {
    return {
      id: this.id,
      fibers_in: this.fibers_in.map((fiber) => fiber.getJson()),
      fibers_out: this.fibers_out.map((fiber) => fiber.getJson()),
      index: this.index,
    };
  }
}
