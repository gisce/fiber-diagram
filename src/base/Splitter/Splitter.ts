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

    this.attr.position = {
      x: this.parentGrid.leftSideWidth,
      y:
        Math.max(
          this.parentGrid.getCurrentWiresHeight(),
          this.parentGrid.getVerticalConnectionsHeight()
        ) + previousSibilingsHeight,
    };

    if (this.orientation === "LEFT") {
      this.fibersIn = this.getFibers(this.fibers_in, "LEFT");
      this.fibersOut = this.getFibers(this.fibers_out, "RIGHT");
    } else {
      this.fibersIn = this.getFibers(this.fibers_out, "LEFT");
      this.fibersOut = this.getFibers(this.fibers_in, "RIGHT");
    }

    [...this.fibersIn, ...this.fibersOut].forEach((fiber) => {
      fiber.calculateSize();
      fiber.calculatePosition();
    });
  }

  getFibers(fibersData: FiberDataType[], side: "LEFT" | "RIGHT") {
    return fibersData.map((fiberEntry, index) => {
      return new Fiber({
        data: { ...fiberEntry, color: "#555555" },
        parentSplitter: this,
        splitterFiberSide: side,
        splitterSibilings: fibersData,
        index: index,
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
