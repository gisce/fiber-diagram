import { Config } from "base/Config";
import React, { useContext } from "react";
import { Circle, Group, Rect } from "react-konva";
import { Splitter } from "base/Splitter";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";
import {
  FiberConnectionContext,
  FiberConnectionContextType,
} from "ui/FiberConnectionUi/FiberConnectionContext";

export const SplitterUi = ({ splitter }: { splitter: Splitter }) => {
  const { attr } = splitter;

  const { fiber_in, fiber_out, setFiberIn } = useContext(
    FiberConnectionContext
  ) as FiberConnectionContextType;

  const fiberIsConnected = (fiberId: number) => {
    return splitter.parentGrid.getConnectionForFiberId(fiberId) !== undefined;
  };

  function getStrokeColorForFiberId(fiberId: number) {
    if (fiber_in === fiberId) {
      return "#ff0000";
    }
    return "#000000";
  }

  const opts = convertAttrUnitsToPixels(attr);

  const strokeWidth = 4;
  const connectorRadius =
    (Config.baseUnits.fiber.height * Config.pixelsPerUnit) / 2;

  return (
    <Group>
      <Rect
        x={
          opts.position.x + Config.baseUnits.fiber.width * Config.pixelsPerUnit
        }
        y={opts.position.y}
        width={Config.splitterWidth * Config.pixelsPerUnit}
        height={opts.size.height}
        fill={"#d0d0d0"}
        stroke={"#555555"}
        strokeWidth={strokeWidth}
      />
      {/* Inputs */}
      {splitter.fibersIn.map((splitterFiber, index) => {
        const sfOpts = convertAttrUnitsToPixels(splitterFiber.attr);
        return (
          <Group key={index}>
            <Rect
              x={sfOpts.position.x}
              y={sfOpts.position.y}
              width={sfOpts.size.width}
              height={sfOpts.size.height}
              fill={"#555555"}
            />
            {!fiberIsConnected(splitterFiber.id) && (
              <Circle
                x={sfOpts.position.x}
                y={sfOpts.position.y + connectorRadius}
                radius={connectorRadius}
                fill={"#FFff1F"}
                stroke={getStrokeColorForFiberId(splitterFiber.id)}
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
                    setFiberIn(splitterFiber.id);
                  } else if (
                    fiber_out === undefined &&
                    fiber_in !== undefined &&
                    fiber_in !== splitterFiber.id
                  ) {
                    splitter.parentGrid.addFiberConnection({
                      fiber_in: fiber_in,
                      fiber_out: splitterFiber.id,
                    });
                    setFiberIn(undefined);
                  }
                }}
              />
            )}
          </Group>
        );
      })}
      {/* Outputs */}
      {splitter.fibersOut.map((splitterFiber, index) => {
        const sfOpts = convertAttrUnitsToPixels(splitterFiber.attr);
        return (
          <Group key={index}>
            <Rect
              x={sfOpts.position.x}
              y={sfOpts.position.y}
              width={sfOpts.size.width}
              height={sfOpts.size.height}
              fill={"#555555"}
            />
            {!fiberIsConnected(splitterFiber.id) && (
              <Circle
                x={sfOpts.position.x + sfOpts.size.width}
                y={sfOpts.position.y + connectorRadius}
                radius={connectorRadius}
                fill={"#FFff1F"}
                stroke={getStrokeColorForFiberId(splitterFiber.id)}
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
                    setFiberIn(splitterFiber.id);
                  } else if (
                    fiber_out === undefined &&
                    fiber_in !== undefined &&
                    fiber_in !== splitterFiber.id
                  ) {
                    splitter.parentGrid.addFiberConnection({
                      fiber_in: fiber_in,
                      fiber_out: splitterFiber.id,
                    });
                    setFiberIn(undefined);
                  }
                }}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
};
