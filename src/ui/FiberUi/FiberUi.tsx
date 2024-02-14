import { Group, Rect } from "react-konva";
import { Fiber } from "@/base/Fiber";
import { Tube } from "@/base/Tube";
import { convertAttrUnitsToPixels } from "@/utils/pixelUtils";
import { FiberCircleUi } from "./FiberCircleUi";

export const FiberUi = ({
  fiber,
  readonly,
}: {
  fiber: Fiber;
  readonly: boolean;
}) => {
  const { attr, color } = fiber;

  const opts = convertAttrUnitsToPixels(attr);

  const rightFiber = (fiber.parent as Tube).parentWire.disposition === "RIGHT";

  const fiberIsConnected =
    (fiber.parent as Tube).parentWire.parentGrid.getFiberConnectionWithId(
      fiber.id,
    ) !== undefined;

  return (
    <Group>
      <Rect
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
        height={opts.size.height}
        fill={color}
      />
      {!fiberIsConnected && (
        <FiberCircleUi
          readonly={readonly}
          x={opts.position.x + opts.size.width * (rightFiber ? 0 : 1)}
          y={opts.position.y}
          fiber={fiber}
        />
      )}
    </Group>
  );
};
