import { Fiber } from "base/Fiber";
import React from "react";
import { Group, Rect, Text } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";
import { FiberCircleUi } from "./FiberCircleUi";

export const FiberUi = ({ fiber }: { fiber: Fiber }) => {
  const { attr, color } = fiber;

  const opts = convertAttrUnitsToPixels(attr);

  const rightFiber = fiber.parentTube.parentWire.disposition === "RIGHT";

  const fiberIsConnected =
    fiber.parentTube.parentWire.parentGrid.getConnectionForFiberId(fiber.id) !==
    undefined;

  return (
    <Group>
      <Rect
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
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
      {!fiberIsConnected && (
        <FiberCircleUi
          x={opts.position.x + opts.size.width * (rightFiber ? 0 : 1)}
          y={opts.position.y}
          fiber={fiber}
        />
      )}
    </Group>
  );
};
