import { Config } from "base/Config";
import { Fiber, FiberApiType, FiberDataType } from "base/Fiber";
import { Grid, InitialPositionSize, PositionSize } from "base/Grid";
import { SplitterFiberDataType } from "./Splitter.types";

export class Splitter {
  id: number;
  fibers_in: FiberApiType[] = [];
  fibers_out: FiberApiType[] = [];
  attr?: PositionSize = { ...InitialPositionSize };
  orientation?: "LEFT" | "RIGHT" = "LEFT";
  parentGrid: Grid;
  fibersIn?: Fiber[] = [];
  fibersOut?: Fiber[] = [];
  index: number;

  constructor({
    id,
    fibers_in,
    fibers_out,
    parentGrid,
  }: {
    id: number;
    fibers_in: FiberApiType[];
    fibers_out: FiberApiType[];
    parentGrid: Grid;
  }) {
    this.id = id;
    this.fibers_in = fibers_in;
    this.fibers_out = fibers_out;
    this.parentGrid = parentGrid;
  }

  calculateSize() {
    this.attr.size = {
      width: Config.splitterWidth + Config.baseUnits.fiber.width * 2,
      height:
        (this.fibers_out.length + this.fibers_out.length + 1) *
        Config.baseUnits.fiber.height,
    };

    this.calculatePosition();
  }

  calculatePosition() {
    const inputFiberConnection = this.parentGrid.getConnectionForFiberId(
      this.fibers_in[0].id
    );
    let inputFiber: Fiber;
    let splitterOrigin;

    if (inputFiberConnection) {
      const inputFiberId =
        this.fibers_in[0].id === inputFiberConnection.fiber_in
          ? inputFiberConnection.fiber_out
          : inputFiberConnection.fiber_in;

      inputFiber = this.parentGrid.getFiberById(inputFiberId);

      splitterOrigin = inputFiber.parentSplitter !== undefined;

      if (splitterOrigin) {
        this.orientation = inputFiber.parentSplitter.orientation;
      } else {
        this.orientation = inputFiber.parentTube.parentWire.disposition;
      }
    }

    const myIndex = this.parentGrid.splitters.indexOf(this);

    const previousSibilings = this.parentGrid.splitters.filter((splitter) => {
      const splitterIndex = this.parentGrid.splitters.indexOf(splitter);
      return splitterIndex < myIndex;
    });

    const previousSibilingsHeight = previousSibilings.reduce(
      (acc, splitter) => {
        return acc + splitter.attr.size.height + Config.separation * 2;
      },
      0
    );

    const x = splitterOrigin
      ? inputFiber.parentSplitter.attr.position.x +
        inputFiber.parentSplitter.attr.size.width
      : this.parentGrid.leftSideWidth;

    this.attr.position = {
      x,
      y:
        Math.max(
          this.parentGrid.getCurrentWiresHeight(),
          this.parentGrid.getVerticalConnectionsHeight()
        ) + previousSibilingsHeight,
    };

    if (this.orientation === "LEFT") {
      this.fibersIn = this.getFibers(this.fibers_in, "LEFT", false);
      this.fibersOut = this.getFibers(this.fibers_out, "RIGHT", true);
    } else {
      this.fibersIn = this.getFibers(this.fibers_out, "LEFT", true);
      this.fibersOut = this.getFibers(this.fibers_in, "RIGHT", false);
    }

    [...this.fibersIn, ...this.fibersOut].forEach((fiber) => {
      fiber.calculateSize();
      fiber.calculatePosition();
    });
  }

  getFibers(
    fibersData: FiberDataType[],
    side: "LEFT" | "RIGHT",
    areOuput: boolean = false
  ) {
    return fibersData.map((fiberEntry, index) => {
      return new Fiber({
        data: { ...fiberEntry, color: "#555555" },
        parentSplitter: this,
        splitterFiberSide: side,
        splitterSibilings: fibersData,
        index: index,
        isSplitterOutput: areOuput,
      });
    });
  }

  getApiJson() {
    return {
      id: this.id,
      fibers_in: this.fibers_in,
      fibers_out: this.fibers_out,
    };
  }

  getJson() {
    return {
      id: this.id,
      fibers_in: this.fibers_in,
      fibers_out: this.fibers_out,
    };
  }
}
