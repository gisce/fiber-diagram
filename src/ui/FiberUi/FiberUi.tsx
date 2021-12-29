import { Fiber } from "base/Fiber";
import React from "react";
import { Group, Rect, Text } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";

export const FiberUi = ({ fiber }: { fiber: Fiber }) => {
  const { attr, color } = fiber;

  const opts = convertAttrUnitsToPixels(attr);

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
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width * 2}
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
