import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import React, { useContext } from "react";
import { Circle } from "react-konva";
import {
  FiberConnectionContext,
  FiberConnectionContextType,
} from "ui/FiberConnectionUi/FiberConnectionContext";
import { Position } from "base/Grid";

export type FiberCircleUiProps = Position & {
  fiber: Fiber;
};

export const FiberCircleUi = (props: FiberCircleUiProps) => {
  const { x, y, fiber } = props;
  const connectorRadius =
    (Config.baseUnits.fiber.height * Config.pixelsPerUnit) / 2;

  const { fiber_in, fiber_out, setFiberIn } = useContext(
    FiberConnectionContext
  ) as FiberConnectionContextType;

  function getStrokeColor() {
    if (fiber_in === fiber.id) {
      return "#ff0000";
    }
    return "#000000";
  }

  return (
    <Circle
      x={x}
      y={y + connectorRadius}
      radius={connectorRadius}
      fill={"#FFff1F"}
      stroke={getStrokeColor()}
      strokeWidth={2}
      onMouseEnter={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = "default";
      }}
      onClick={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = "default";

        if (fiber_in === undefined) {
          setFiberIn(fiber.id);
        } else if (
          fiber_out === undefined &&
          fiber_in !== undefined &&
          fiber_in !== fiber.id
        ) {
          const parentGrid =
            fiber.parentTube?.parentWire?.parentGrid ||
            fiber.parentSplitter?.parentGrid;

          const fiberOut: Fiber = parentGrid.getFiberById(fiber.id);
          const fiberIn: Fiber = parentGrid.getFiberById(fiber_in);

          // Check if both fibers are outputs of an splitter
          if (
            fiberIn.parentSplitter !== undefined &&
            fiberOut.parentSplitter !== undefined &&
            fiberIn.isSplitterOutput !== undefined &&
            fiberIn.isSplitterOutput === fiberOut.isSplitterOutput
          ) {
            setFiberIn(undefined);
            return;
          }

          const fiberInSplitterInput =
            fiberIn.parentSplitter?.getSplitterConnectedInInput();
          const fiberOutSplitterInput =
            fiberOut.parentSplitter?.getSplitterConnectedInInput();

          // Check if both fibers are ouput and input from different splitters, but they have a loop
          if (
            fiberIn.parentSplitter !== undefined &&
            fiberOut.parentSplitter !== undefined &&
            fiberInSplitterInput !== undefined &&
            fiberOutSplitterInput === undefined &&
            fiberInSplitterInput.id === fiberOut.parentSplitter.id
          ) {
            setFiberIn(undefined);
            return;
          }

          if (
            fiberIn.parentSplitter !== undefined &&
            fiberOut.parentSplitter !== undefined &&
            fiberInSplitterInput === undefined &&
            fiberOutSplitterInput !== undefined &&
            fiberOutSplitterInput.id === fiberIn.parentSplitter.id
          ) {
            setFiberIn(undefined);
            return;
          }

          // Check if one fiber is an input of a splitter, and the other one is from the right
          if (
            (fiberIn.parentSplitter !== undefined &&
              fiberOut.parentSplitter === undefined) ||
            (fiberIn.parentSplitter === undefined &&
              fiberOut.parentSplitter !== undefined)
          ) {
            const splitterFiber =
              fiberIn.parentSplitter !== undefined ? fiberIn : fiberOut;
            const wireFiber =
              splitterFiber.id === fiberIn.id ? fiberOut : fiberIn;

            if (
              splitterFiber.isSplitterOutput === false &&
              wireFiber.parentTube.parentWire.disposition === "RIGHT"
            ) {
              setFiberIn(undefined);
              return;
            }
          }

          parentGrid.addFiberConnection({
            fiber_in: fiber_in,
            fiber_out: fiber.id,
          });
          setFiberIn(undefined);
        }
      }}
    />
  );
};
