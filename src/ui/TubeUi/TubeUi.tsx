import { Tube } from "base/Tube";
import React from "react";
import { Group, Rect, Text } from "react-konva";
import { FiberUi } from "ui/FiberUi/FiberUi";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";

export const TubeUi = ({ tube }: { tube: Tube }) => {
  const { attr, color } = tube;

  const opts = convertAttrUnitsToPixels(attr);

  function onClick() {
    if (tube.expanded === true) {
      tube.collapse();
    } else {
      tube.expand();
    }
  }

  return (
    <Group>
      <Rect
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
        height={opts.size.height}
        onClick={onClick}
        fill={color}
      />
      <Text
        onClick={onClick}
        text={`#${tube.id}`}
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
        height={opts.size.height}
        fontSize={14}
        padding={5}
        fill="red"
        strokeWidth={0.5}
        stroke={"#000000"}
      />
      {tube.expanded &&
        tube.fibers.map((fiber, i) => {
          return <FiberUi key={i} fiber={fiber} />;
        })}
    </Group>
  );
};
