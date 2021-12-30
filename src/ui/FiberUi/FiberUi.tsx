import { Config } from "base/Config";
import { Fiber } from "base/Fiber";
import React, { useContext } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";
import {
  ConnectionContext,
  ConnectionContextType,
} from "ui/Connections/ConnectionContext";

export const FiberUi = ({ fiber }: { fiber: Fiber }) => {
  const { attr, color } = fiber;

  const { fiber_in, fiber_out, setFiberIn } = useContext(
    ConnectionContext
  ) as ConnectionContextType;

  const opts = convertAttrUnitsToPixels(attr);

  const rightFiber = fiber.parentTube.parentWire.disposition === "RIGHT";

  const fibberIsConnected =
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
      {!fibberIsConnected && (
        <Circle
          x={opts.position.x + opts.size.width * (rightFiber ? 0 : 1)}
          y={opts.position.y + connectorRadius}
          radius={connectorRadius}
          fill={"#FFff1F"}
          stroke={getStrokeColor()}
          strokeWidth={2}
          onClick={() => {
            if (fiber_in === undefined) {
              setFiberIn(fiber);
            } else if (fiber_out === undefined && fiber_in !== undefined) {
              fiber.parentTube.parentWire.parentGrid.addConnection({
                fiber_in: fiber_in.id,
                fiber_out: fiber.id,
              });
              fiber.parentTube.parentWire.parentGrid.onChangeIfNeeded();
              setFiberIn(undefined);
            }
          }}
        />
      )}
    </Group>
  );
};
