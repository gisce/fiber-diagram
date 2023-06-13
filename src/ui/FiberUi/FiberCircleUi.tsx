import React, { useContext } from "react";
import { Circle } from "react-konva";
import { Config } from "@/base/Config";
import { Fiber } from "@/base/Fiber";
import {
  FiberConnectionContext,
  FiberConnectionContextType,
} from "@/ui/FiberConnectionUi/FiberConnectionContext";
import { Position } from "@/base/Grid";
import { Splitter } from "@/base/Splitter";
import { Tube } from "@/base/Tube";
import { validateFiberConnection } from "@/utils/connectionUtils";

export type FiberCircleUiProps = Position & {
  fiber: Fiber;
  readonly: boolean;
};

export const FiberCircleUi = (props: FiberCircleUiProps) => {
  const { x, y, fiber, readonly } = props;
  const connectorRadius =
    (Config.baseUnits.fiber.height * Config.pixelsPerUnit) / 2;

  const { selectedFiber, setSelectedFiber } = useContext(
    FiberConnectionContext
  ) as FiberConnectionContextType;

  function getStrokeColor() {
    if (selectedFiber && selectedFiber.id === fiber.id) {
      return "#ff0000";
    }
    return "#000000";
  }

  function onClickCircle() {
    if (readonly) {
      return;
    }

    // If we don't have any selected fiber points, we set it
    if (selectedFiber === undefined) {
      setSelectedFiber(fiber);
      return;
    }

    // Here we have a previously selected fiber (firstFiber) and the fiber we clicked on (fiber)
    const parentGrid =
      fiber.parentType === "SPLITTER"
        ? (fiber.parent as Splitter).parentGrid
        : (fiber.parent as Tube).parentWire.parentGrid;

    // try {
    if (
      validateFiberConnection({
        fiberIn: selectedFiber,
        fiberOut: fiber,
      })
    ) {
      // We add our fiber connection
      parentGrid.addFiberConnection({
        fiber_in: selectedFiber.id,
        fiber_out: fiber.id,
      });

      // And we reset our selected fiber
      setSelectedFiber(undefined);
    } else {
      // alert(err.message);
      setSelectedFiber(undefined);
    }
  }

  return (
    <Circle
      x={x}
      y={y + connectorRadius}
      radius={connectorRadius}
      fill={"#FFff1F"}
      stroke={getStrokeColor()}
      strokeWidth={2}
      onMouseEnter={(e) => {
        if (readonly) {
          return;
        }

        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        if (readonly) {
          return;
        }

        const container = e.target.getStage().container();
        container.style.cursor = "default";
      }}
      onTap={onClickCircle}
      onClick={(e) => {
        if (readonly) {
          return;
        }

        const container = e.target.getStage().container();
        container.style.cursor = "default";
        onClickCircle();
      }}
    />
  );
};
