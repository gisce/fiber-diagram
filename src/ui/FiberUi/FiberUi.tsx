import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import React, { useContext } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";
import {
  FiberConnectionContext,
  FiberConnectionContextType,
} from "ui/FiberConnectionUi/FiberConnectionContext";

export const FiberUi = ({ fiber }: { fiber: Fiber }) => {
  const { attr, color } = fiber;

  const { fiber_in, fiber_out, setFiberIn } = useContext(
    FiberConnectionContext
  ) as FiberConnectionContextType;

  const opts = convertAttrUnitsToPixels(attr);

  const rightFiber = fiber.parentTube.parentWire.disposition === "RIGHT";

  const FiberIsConnected =
    fiber.parentTube.parentWire.parentGrid.getConnectionForFiberId(fiber.id) !==
    undefined;

  const connectorRadius =
    (Config.baseUnits.fiber.height * Config.pixelsPerUnit) / 2;

  function getStrokeColor() {
    if (fiber_in?.id === fiber.id) {
      return "#ff0000";
    }
    return "#000000";
  }

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
      {!FiberIsConnected && (
        <Circle
          x={opts.position.x + opts.size.width * (rightFiber ? 0 : 1)}
          y={opts.position.y + connectorRadius}
          radius={connectorRadius}
          fill={"#FFff1F"}
          stroke={getStrokeColor()}
          strokeWidth={2}
          onMouseEnter={(e) => {
            const container = e.target.getStage().container();
            container.style.cursor = "pointer";
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage().container();
            container.style.cursor = "default";
          }}
          onClick={(e) => {
            const container = e.target.getStage().container();
            container.style.cursor = "default";

            if (fiber_in === undefined) {
              setFiberIn(fiber);
            } else if (
              fiber_out === undefined &&
              fiber_in !== undefined &&
              fiber_in.id !== fiber.id
            ) {
              fiber.parentTube.parentWire.parentGrid.addFiberConnection({
                fiber_in: fiber_in.id,
                fiber_out: fiber.id,
              });
              setFiberIn(undefined);
            }
          }}
        />
      )}
    </Group>
  );
};
