import { Tube } from "base/Tube";
import React from "react";
import { Group, Rect } from "react-konva";
import { FiberUi } from "ui/FiberUi/FiberUi";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";

export const TubeUi = ({ tube }: { tube: Tube }) => {
  const { attr, color } = tube;

  const opts = convertAttrUnitsToPixels(attr);

  return (
    <Group>
      <Rect
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
        height={opts.size.height}
        onClick={() => {
          if (tube.expanded) {
            tube.collapse();
          } else {
            tube.expand();
          }
        }}
        fill={color}
      />
      {tube.expanded &&
        tube.fibers.map((fiber, i) => {
          return <FiberUi key={i} fiber={fiber} />;
        })}
    </Group>
  );
};
