import { Fiber } from "base/Fiber";
import { Grid, PathUnit, Position } from "base/Grid";
import { Tube } from "base/Tube";
import { FiberConnectionData } from ".";
import LeftTFiber2RightTFiber from "base/Path/LeftTFiber2RightTFiber";
import SameSideTubeFiber from "base/Path/SameSideTubeFiber";
import LeftTFiber2SplitterInput from "base/Path/LeftTFiber2SplitterInput";
import SplitterInput2SplitterOutput from "base/Path/SplitterInput2SplitterOutput";

import { Splitter } from "base/Splitter";

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
      const splitterFiber =
        fiberIn.parentType === "SPLITTER" ? fiberIn : fiberOut;
      const tubeFiber = fiberIn.parentType === "TUBE" ? fiberIn : fiberOut;

      this.calculateSplitterToTubeFiberConnection(splitterFiber, tubeFiber);
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
    const leftFiber =
      fiberIn.attr.position.x < fiberOut.attr.position.x ? fiberIn : fiberOut;
    const rightFiber = leftFiber === fiberIn ? fiberOut : fiberIn;

    // Left tube fiber to right tube fiber
    if (
      parentTubeFiberIn.parentWire.disposition !==
      parentTubeFiberOut.parentWire.disposition
    ) {
      const { path, fusionPoint } = LeftTFiber2RightTFiber({
        elementIn: leftFiber,
        elementOut: rightFiber,
        columnController:
          this.parentGrid.pathController.tubeFusionColumnController,
        leftAngleRowController:
          this.parentGrid.pathController.leftAngleRowController,
        rightAngleRowController:
          this.parentGrid.pathController.rightAngleRowController,
      });
      this.path = path;
      this.fusionPoint = fusionPoint;
    } else {
      // Same side tube fiber to same side tube fiber
      const { path, fusionPoint } = SameSideTubeFiber({
        elementIn: leftFiber,
        elementOut: rightFiber,
        columnController:
          this.parentGrid.pathController.tubeFusionColumnController,
        leftAngleRowController:
          this.parentGrid.pathController.leftAngleRowController,
        rightAngleRowController:
          this.parentGrid.pathController.rightAngleRowController,
      });
      this.path = path;
      this.fusionPoint = fusionPoint;
    }
  }

  isVisible() {
    const oneFiberId = this.getOtherFiberId(this.fiber_in);
    const oneFiber = this.parentGrid.getFiberById(oneFiberId);
    if (oneFiber.parentType === "SPLITTER") {
      return true;
    }
    return oneFiber.parentType === "TUBE" && (oneFiber.parent as Tube).expanded;
  }

  someFiberIsFromSplitter() {
    const fiberIn = this.parentGrid.getFiberById(this.fiber_in);
    const fiberOut = this.parentGrid.getFiberById(this.fiber_out);

    return (
      fiberIn.parentType === "SPLITTER" || fiberOut.parentType === "SPLITTER"
    );
  }

  calculateSplitterToTubeFiberConnection(
    splitterFiber: Fiber,
    tubeFiber: Fiber
  ) {
    if ((splitterFiber.parent as Splitter).isFiberInput(splitterFiber)) {
      this.calculateSplitterInputToTubeFiberConnection(
        splitterFiber,
        tubeFiber
      );
      return;
    }

    this.calculateSplitterOutputToTubeFiberConnection(splitterFiber, tubeFiber);
  }

  calculateSplitterInputToTubeFiberConnection(
    splitterFiber: Fiber,
    tubeFiber: Fiber
  ) {
    const { path, fusionPoint } = LeftTFiber2SplitterInput({
      elementIn: tubeFiber,
      elementOut: splitterFiber,
      columnController:
        this.parentGrid.pathController.tubeFusionColumnController,
      leftAngleRowController:
        this.parentGrid.pathController.leftAngleRowController,
      rightAngleRowController:
        this.parentGrid.pathController.rightAngleRowController,
    });
    this.path = path;
    this.fusionPoint = fusionPoint;
  }

  calculateSplitterOutputToTubeFiberConnection(
    splitterFiber: Fiber,
    tubeFiber: Fiber
  ) {}

  calculateSplitterToSplitterFiberConnection(fiberIn: Fiber, fiberOut: Fiber) {
    const fiberInIsInput = (fiberIn.parent as Splitter).isFiberInput(fiberIn);
    const fiberOutIsInput = (fiberOut.parent as Splitter).isFiberInput(
      fiberOut
    );

    // Fiber output will be the first splitter placed horizontally
    // Fiber input will be placed horizontally after than fiber output
    const fiberOutput = fiberOutIsInput ? fiberIn : fiberOut;
    const fiberInput = fiberInIsInput ? fiberIn : fiberOut;

    const { path, fusionPoint } = SplitterInput2SplitterOutput({
      elementIn: fiberOutput,
      elementOut: fiberInput,
      columnController:
        this.parentGrid.pathController.tubeFusionColumnController,
      leftAngleRowController:
        this.parentGrid.pathController.leftAngleRowController,
      rightAngleRowController:
        this.parentGrid.pathController.rightAngleRowController,
    });
    this.path = path;
    this.fusionPoint = fusionPoint;
  }
}
