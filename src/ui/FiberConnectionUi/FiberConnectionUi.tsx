import { Config } from "base/Config";
import { FiberConnection } from "base/FiberConnection";
import { Fiber } from "base/Fiber";
import React from "react";
import { Rect, Circle, Group } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";
import { Tube } from "base/Tube";

export const FiberConnectionUi = ({
  connection,
}: {
  connection: FiberConnection;
}) => {
  const { path } = connection;

  if (!path) {
    return null;
  }

  const fiberIn: Fiber = connection.parentGrid.getFiberById(
    connection.fiber_in
  );
  const fiberOut: Fiber = connection.parentGrid.getFiberById(
    connection.fiber_out
  );

  if (fiberIn === undefined) {
    console.error(`Fiber ${connection.fiber_in} not found`);
    return null;
  }

  if (fiberOut === undefined) {
    console.error(`Fiber ${connection.fiber_out} not found`);
    return null;
  }

  const expandedFiberIn =
    fiberIn.parentType === "TUBE" && (fiberIn.parent as Tube).expanded;

  const expandedFiberOut =
    fiberOut.parentType === "TUBE" && (fiberOut.parent as Tube).expanded;

  if (
    (fiberIn.parentType === "TUBE" && !expandedFiberIn) ||
    (fiberOut.parentType === "TUBE" && !expandedFiberOut)
  ) {
    return null;
  }

  const pathWithConvertedUnits = path.map((leg) => {
    const { position, size } = leg;
    const convertedUnits = convertAttrUnitsToPixels({ position, size });
    return { ...leg, ...convertedUnits };
  });

  const pathRects = pathWithConvertedUnits.map((leg, i) => {
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

  const fusionPointRadius =
    (Config.baseUnits.fiber.height * Config.pixelsPerUnit) / 2;

  return (
    <Group>
      {pathRects}
      <Circle
        x={connection.fusionPoint.x * Config.pixelsPerUnit}
        y={connection.fusionPoint.y * Config.pixelsPerUnit + fusionPointRadius}
        radius={fusionPointRadius}
        fill={"#FFFFFF"}
        stroke={"#000000"}
        strokeWidth={2}
        onTap={() => {
          connection.remove();
        }}
        onClick={(e) => {
          const container = e.target.getStage().container();
          container.style.cursor = "default";
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
