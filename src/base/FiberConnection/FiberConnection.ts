import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import { Grid, PathUnit, Position } from "base/Grid";
import { Tube } from "base/Tube";
import { FiberConnectionData } from ".";

export class FiberConnection {
  fiber_in: number;
  fiber_out: number;
  parentGrid: Grid;
  path: PathUnit[] = [];
  fusionPoint: Position = {
    x: 0,
    y: 0,
  };

  constructor({
    data,
    parentGrid,
  }: {
    data: FiberConnectionData;
    parentGrid: Grid;
  }) {
    const { fiber_in, fiber_out } = data;
    this.fiber_in = fiber_in;
    this.fiber_out = fiber_out;
    this.parentGrid = parentGrid;
  }

  fiberIdBelongsToConnection(fiber_id: number) {
    const { fiber_in, fiber_out } = this;
    return fiber_id === fiber_in || fiber_id === fiber_out;
  }

  getOtherFiberId(id: number) {
    const { fiber_in, fiber_out } = this;
    return id === fiber_in ? fiber_out : fiber_in;
  }

  getJson(): FiberConnectionData {
    const { fiber_in, fiber_out } = this;
    return {
      fiber_in,
      fiber_out,
    };
  }

  remove() {
    this.parentGrid.removeFiberConnection({
      fiber_in: this.fiber_in,
      fiber_out: this.fiber_out,
    });
  }

  calculate() {
    const fiberIn = this.parentGrid.getFiberById(this.fiber_in);
    const fiberOut = this.parentGrid.getFiberById(this.fiber_out);

    // First we determine the type of the path's connection

    // Tube fiber to tube fiber
    if (fiberIn.parentType === "TUBE" && fiberOut.parentType === "TUBE") {
      this.calculateTubeFiberConnection(fiberIn, fiberOut);
      return;
    }

    // Tube fiber to splitter fiber
    if (
      (fiberIn.parentType === "SPLITTER" && fiberOut.parentType === "TUBE") ||
      (fiberIn.parentType === "TUBE" && fiberOut.parentType === "SPLITTER")
    ) {
      this.calculateSplitterToTubeFiberConnection(fiberIn, fiberOut);
      return;
    }

    // Splitter fiber to splitter fiber
    if (
      fiberIn.parentType === "SPLITTER" &&
      fiberOut.parentType === "SPLITTER"
    ) {
      this.calculateSplitterToSplitterFiberConnection(fiberIn, fiberOut);
      return;
    }
  }

  calculateTubeFiberConnection(fiberIn: Fiber, fiberOut: Fiber) {
    const parentTubeFiberIn = fiberIn.parent as Tube;
    const parentTubeFiberOut = fiberOut.parent as Tube;

    // Left tube fiber to right tube fiber
    if (
      parentTubeFiberIn.parentWire.disposition !==
      parentTubeFiberOut.parentWire.disposition
    ) {

    } else {
      // Same side tube fiber to same side tube fiber
    }
  }

  calculateSplitterToTubeFiberConnection(fiberIn: Fiber, fiberOut: Fiber) {}

  calculateSplitterToSplitterFiberConnection(fiberIn: Fiber, fiberOut: Fiber) {}
}
