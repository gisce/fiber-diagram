import { Fiber } from "base/Fiber";
import React from "react";
import { Rect } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";

export const FiberUi = ({ fiber }: { fiber: Fiber }) => {
  const { attr, color } = fiber;

  const opts = convertAttrUnitsToPixels(attr);

  return (
    <Rect
      x={opts.position.x}
      y={opts.position.y}
      width={opts.size.width}
      height={opts.size.height}
      fill={color}
      strokeWidth={1}
      stroke="#555555"
    />
  );
};
