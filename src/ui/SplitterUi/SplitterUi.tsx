import { Config } from "base/Config";
import React from "react";
import { Group, Rect, Text } from "react-konva";
import { Splitter } from "base/Splitter";
import { convertAttrUnitsToPixels } from "utils/pixelUtils";
import { FiberCircleUi } from "ui/FiberUi/FiberCircleUi";

export const SplitterUi = ({
  splitter,
  splitterIsSelected,
  onSplitterSelected,
  readonly,
}: {
  splitter: Splitter;
  splitterIsSelected: boolean;
  onSplitterSelected: (splitter: Splitter) => void;
  readonly: boolean;
}) => {
  const { attr } = splitter;

  const fiberIsConnected = (fiberId: number) => {
    return splitter.parentGrid.getFiberConnectionWithId(fiberId) !== undefined;
  };

  const opts = convertAttrUnitsToPixels(attr);
  const strokeWidth = 4;

  return (
    <Group>
      {/* Inputs */}
      {splitter.fibers_in.map((splitterFiber, index) => {
        const sfOpts = convertAttrUnitsToPixels(splitterFiber.attr);
        return (
          <Group key={index}>
            <Rect
              x={sfOpts.position.x}
              y={sfOpts.position.y}
              width={sfOpts.size.width}
              height={sfOpts.size.height}
              fill={"#555555"}
            />
            <Text
              text={`#${splitterFiber.id}`}
              x={sfOpts.position.x}
              y={sfOpts.position.y}
              width={sfOpts.size.width * 1.2}
              height={sfOpts.size.height}
              fontSize={10}
              padding={sfOpts.size.height}
              fill="red"
              strokeWidth={0.5}
              stroke={"#000000"}
            />
            {!fiberIsConnected(splitterFiber.id) && (
              <FiberCircleUi
                x={sfOpts.position.x}
                y={sfOpts.position.y}
                fiber={splitterFiber}
                readonly={readonly}
              />
            )}
          </Group>
        );
      })}
      {/* Outputs */}
      {splitter.fibers_out.map((splitterFiber, index) => {
        const sfOpts = convertAttrUnitsToPixels(splitterFiber.attr);
        return (
          <Group key={index}>
            <Rect
              x={sfOpts.position.x}
              y={sfOpts.position.y}
              width={sfOpts.size.width}
              height={sfOpts.size.height}
              fill={"#555555"}
            />
            <Text
              text={`#${splitterFiber.id}`}
              x={sfOpts.position.x}
              y={sfOpts.position.y}
              width={sfOpts.size.width * 1.2}
              height={sfOpts.size.height}
              fontSize={10}
              padding={sfOpts.size.height}
              fill="red"
              strokeWidth={0.5}
              stroke={"#000000"}
            />
            {!fiberIsConnected(splitterFiber.id) && (
              <FiberCircleUi
                x={sfOpts.position.x + sfOpts.size.width}
                y={sfOpts.position.y}
                fiber={splitterFiber}
                readonly={readonly}
              />
            )}
          </Group>
        );
      })}
      <Rect
        x={
          opts.position.x + Config.baseUnits.fiber.width * Config.pixelsPerUnit
        }
        y={opts.position.y}
        width={Config.splitterWidth * Config.pixelsPerUnit}
        height={opts.size.height}
        fill={"#d0d0d0"}
        stroke={splitterIsSelected ? "red" : "#555555"}
        strokeWidth={strokeWidth}
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
        onClick={(e) => {
          onSplitterSelected(splitter);
        }}
        onTap={() => {
          onSplitterSelected(splitter);
        }}
      />
    </Group>
  );
};
