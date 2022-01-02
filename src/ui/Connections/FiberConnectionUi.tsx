import { Config } from "base/Config";
import { Connection } from "base/Connection";
import { Fiber } from "base/Fiber";
import React from "react";
import { Rect, Circle, Group } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";

export const FiberConnectionUi = ({
  connection,
}: {
  connection: Connection;
}) => {
  const { legs } = connection;

  if (!legs) {
    return null;
  }

  const fiber_in: Fiber = connection.parentGrid.getFiberById(
    connection.fiber_in
  );
  const fiber_out: Fiber = connection.parentGrid.getFiberById(
    connection.fiber_out
  );

  if (fiber_in === undefined) {
    console.error(`Fiber ${connection.fiber_in} not found`);
    return null;
  }

  if (fiber_out === undefined) {
    console.error(`Fiber ${connection.fiber_out} not found`);
    return null;
  }

  const expandedFiberIn = fiber_in.parentTube.expanded;
  const expandedFiberOut = fiber_out.parentTube.expanded;

  if (!expandedFiberIn || !expandedFiberOut) {
    return null;
  }

  const legsWithConvertedUnits = legs.map((leg) => {
    const { position, size } = leg;
    const convertedUnits = convertAttrUnitsToPixels({ position, size });
    return { ...leg, ...convertedUnits };
  });

  const legsRects = legsWithConvertedUnits.map((leg, i) => {
    return (
      <Rect
        key={i}
        x={leg.position.x}
        y={leg.position.y}
        width={leg.size.width}
        height={leg.size.height}
        fill={leg.color}
      />
    );
  });

  const fusionPointRaidus =
    (Config.baseUnits.fiber.height * Config.pixelsPerUnit) / 2;

  return (
    <Group>
      {legsRects}
      <Circle
        x={connection.center.x * Config.pixelsPerUnit}
        y={connection.center.y * Config.pixelsPerUnit + fusionPointRaidus}
        radius={fusionPointRaidus}
        fill={"#FFFFFF"}
        stroke={"#000000"}
        strokeWidth={2}
        onClick={() => {
          connection.remove();
        }}
        style={{ cursor: "pointer" }}
        onMouseEnter={(e) => {
          const container = e.target.getStage().container();
          container.style.cursor = "pointer";
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage().container();
          container.style.cursor = "default";
        }}
      />
    </Group>
  );
};
