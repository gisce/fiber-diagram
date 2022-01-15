import { Config } from "base/Config";
import { FiberApiType } from "base/Fiber";
import { Grid, InitialPositionSize, PositionSize } from "base/Grid";
import { SplitterFiberDataType } from "./Splitter.types";

export class Splitter {
  id: number;
  fibers_in: FiberApiType[] = [];
  fibers_out: FiberApiType[] = [];
  attr?: PositionSize = { ...InitialPositionSize };
  orientation?: "LEFT" | "RIGHT";
  parentGrid: Grid;
  fibersIn?: SplitterFiberDataType[] = [];
  fibersOut?: SplitterFiberDataType[] = [];
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
        this.parentGrid.getVerticalConnectionsHeight() +
        previousSibilingsHeight,
    };

    this.fibersIn = this.calculateFibersPositions(this.fibers_in, "LEFT");
    this.fibersOut = this.calculateFibersPositions(this.fibers_out, "RIGHT");
  }

  calculateFibersPositions(fibersData: FiberApiType[], side: "LEFT" | "RIGHT") {
    const vUnitSpace =
      this.attr.size.height / (fibersData.length + fibersData.length + 1);

    return fibersData.map((fiberEntry, index) => {
      let y: number, x: number;
      if (fibersData.length === 1) {
        y = this.attr.size.height / 2 - Config.baseUnits.fiber.height / 2;
      } else {
        y = vUnitSpace + vUnitSpace * index * 2;
      }

      if (side === "LEFT") {
        x = this.attr.position.x;
      } else {
        x =
          this.attr.position.x +
          (this.attr.size.width - Config.baseUnits.fiber.width);
      }

      return {
        ...fiberEntry,
        attr: {
          position: {
            x,
            y,
          },
          size: {
            width: Config.baseUnits.fiber.width,
            height: Config.baseUnits.fiber.height,
          },
        },
      };
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
