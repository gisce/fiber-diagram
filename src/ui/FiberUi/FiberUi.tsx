import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import React from "react";
import { Group, Rect, Text } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";

export const FiberUi = ({ fiber }: { fiber: Fiber }) => {
  const { attr, color } = fiber;

  const opts = convertAttrUnitsToPixels(attr);

  const rightFiber = fiber.parentTube.parentWire.disposition === "RIGHT";

  // TODO: we must implement this logic in Fiber class
  const areWeConnected = fiber.getConnectedToFiber() !== undefined;

  const leftOffsetWidth = areWeConnected
    ? Config.separation * 2 * Config.pixelsPerUnit
    : 0;
  const rightOffsetWidth = areWeConnected
    ? Config.separation * 2 * Config.pixelsPerUnit
    : 0;

  return (
    <Group>
      <Rect
        x={opts.position.x - (rightFiber ? rightOffsetWidth : 0)}
        y={opts.position.y}
        width={
          opts.size.width + (rightFiber ? rightOffsetWidth : leftOffsetWidth)
        }
        height={opts.size.height}
        fill={color}
      />
      <Text
        text={`#${fiber.id}`}
        x={opts.position.x - (rightFiber ? opts.size.width * 0.1 : 0)}
        y={opts.position.y}
        width={opts.size.width * 1.2}
        height={opts.size.height}
        fontSize={10}
        padding={opts.size.height}
        fill="red"
        strokeWidth={0.5}
        stroke={"#000000"}
      />
    </Group>
  );
};
