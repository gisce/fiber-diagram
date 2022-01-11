import { Config } from "base/Config";
import { TubeConnection } from "base/TubeConnection";
import { Tube } from "base/Tube";
import React from "react";
import { Rect, Circle, Group } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";

export const TubeConnectionUi = ({
  connection,
}: {
  connection: TubeConnection;
}) => {
  const { legs } = connection;

  if (!legs) {
    return null;
  }

  const tube_in: Tube = connection.parentGrid.getTubeById(connection.tube_in);
  const tube_out: Tube = connection.parentGrid.getTubeById(connection.tube_out);

  if (tube_in === undefined) {
    console.error(`Tube ${connection.tube_in} not found`);
    return null;
  }

  if (tube_out === undefined) {
    console.error(`Tube ${connection.tube_out} not found`);
    return null;
  }

  const expandedTubeIn = tube_in.expanded;
  const expandedTubeOut = tube_out.expanded;

  if (expandedTubeIn || expandedTubeOut) {
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
    (Config.baseUnits.tube.height * Config.pixelsPerUnit) / 2;

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
        onClick={(e) => {
          const container = e.target.getStage().container();
          container.style.cursor = "default";
          tube_in.expand();
          // connection.remove();
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
