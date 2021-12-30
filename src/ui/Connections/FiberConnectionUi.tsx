import { Config } from "base/Config";
import { Connection } from "base/Connection";
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
      />
    </Group>
  );
};
