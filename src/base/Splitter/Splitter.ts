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
    index,
  }: {
    id: number;
    fibers_in: FiberApiType[];
    fibers_out: FiberApiType[];
    parentGrid: Grid;
    index: number;
  }) {
    this.id = id;
    this.fibers_in = fibers_in;
    this.fibers_out = fibers_out;
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

  parseFibers() {
    if (this.orientation === "LEFT") {
      this.fibersIn = this.getFibers(this.fibers_in, "LEFT", false);
      this.fibersOut = this.getFibers(this.fibers_out, "RIGHT", true);
    } else {
      this.fibersIn = this.getFibers(this.fibers_out, "LEFT", true);
      this.fibersOut = this.getFibers(this.fibers_in, "RIGHT", false);
    }
  }

  calculatePosition() {
    const inputFiberConnection = this.parentGrid.getConnectionForFiberId(
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

      splitterOrigin = inputFiber.parentSplitter !== undefined;

      if (splitterOrigin) {
        this.orientation = inputFiber.parentSplitter.orientation;
      } else {
        this.orientation = inputFiber.parentTube.parentWire.disposition;
      }
    }

    const previousSibilings = this.parentGrid.splitters.filter((splitter) => {
      const splitterIndex = splitter.index;
      return splitterIndex < this.index;
    });

    const previousSibilingsHeight = previousSibilings.reduce(
      (acc, splitter) => {
        return acc + splitter.attr.size.height + Config.separation * 2;
      },
      0
    );

    const x = splitterOrigin
      ? this.parentGrid.leftSideWidth +
        this.attr.size.width +
        Config.baseUnits.fiber.width
      : this.parentGrid.leftSideWidth;

    this.attr.position = {
      x,
      y:
        Math.max(
          this.parentGrid.getCurrentWiresHeight(),
          this.parentGrid.getVerticalConnectionsHeight()
        ) + previousSibilingsHeight,
    };

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
      index: this.index,
    };
  }

  getSplitterConnectedInInput() {
    const fiberConnection = this.parentGrid.getConnectionForFiberId(
      this.fibers_in[0].id
    );
    if (!fiberConnection) {
      return undefined;
    }

    const fiberIdConnectedTo =
      this.fibers_in[0].id === fiberConnection.fiber_in
        ? fiberConnection.fiber_out
        : fiberConnection.fiber_in;
    const fiberConnectedTo = this.parentGrid.getFiberById(fiberIdConnectedTo);

    if (!fiberConnectedTo) {
      return undefined;
    }

    return fiberConnectedTo.parentSplitter;
  }
}
