import { Wire } from "base/Wire";
import React from "react";
import { Rect, Group } from "react-konva";
import { TubeUi } from "ui/TubeUi";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";

export const WireUi = ({ wire }: { wire: Wire }) => {
  const { attr } = wire;
  const opts = convertAttrUnitsToPixels(attr);

  return (
    <Group>
      <Rect
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
        height={opts.size.height}
        fill="#555555"
      />
      {wire.expanded &&
        wire.tubes.map((tube, i) => {
          return <TubeUi key={i} tube={tube} />;
        })}
    </Group>
  );
};
