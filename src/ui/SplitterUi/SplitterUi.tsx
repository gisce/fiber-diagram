import { Config } from "base/Config";
import React from "react";
import { Circle, Group, Rect } from "react-konva";
import { Splitter } from "base/Splitter";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";
import { InitialPositionSize } from "base/Grid";

export const SplitterUi = ({ splitter }: { splitter: Splitter }) => {
  const { attr } = splitter;

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
        y={strokeWidth + opts.position.y}
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
              y={strokeWidth + opts.position.y + sfOpts.position.y}
              width={sfOpts.size.width}
              height={sfOpts.size.height}
              fill={"#555555"}
            />
            <Circle
              x={connectorRadius + sfOpts.position.x}
              y={
                strokeWidth +
                opts.position.y +
                sfOpts.position.y +
                connectorRadius
              }
              radius={connectorRadius}
              fill={"#FFF"}
              stroke={"black"}
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
              }}
            />
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
              y={strokeWidth + opts.position.y + sfOpts.position.y}
              width={sfOpts.size.width}
              height={sfOpts.size.height}
              fill={"#555555"}
            />
            <Circle
              x={sfOpts.position.x + sfOpts.size.width - connectorRadius}
              y={
                strokeWidth +
                opts.position.y +
                sfOpts.position.y +
                connectorRadius
              }
              radius={connectorRadius}
              fill={"#FFF"}
              stroke={"black"}
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
              }}
            />
          </Group>
        );
      })}
    </Group>
  );
};
