import { Config } from "base/Config";
import React from "react";
import { Group, Rect } from "react-konva";
import { Splitter } from "base/Splitter";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";
import { FiberCircleUi } from "ui/FiberUi/FiberCircleUi";

export const SplitterUi = ({ splitter }: { splitter: Splitter }) => {
  const { attr } = splitter;

  const fiberIsConnected = (fiberId: number) => {
    return splitter.parentGrid.getConnectionForFiberId(fiberId) !== undefined;
  };

  const opts = convertAttrUnitsToPixels(attr);
  const strokeWidth = 4;

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
              <FiberCircleUi
                x={sfOpts.position.x}
                y={sfOpts.position.y}
                fiber={splitterFiber}
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
              <FiberCircleUi
                x={sfOpts.position.x + sfOpts.size.width}
                y={sfOpts.position.y}
                fiber={splitterFiber}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
};
