import { Rect, Group, Text } from "react-konva";
import { Wire } from "@/base/Wire";
import { TubeUi } from "@/ui/TubeUi";
import { convertAttrUnitsToPixels } from "@/utils/pixelUtils";
import { useTooltip } from "@/hooks/useTooltip";
import { Tooltip } from "../Tooltip";

export const WireUi = ({
  wire,
  readonly,
}: {
  wire: Wire;
  readonly: boolean;
}) => {
  const { attr } = wire;
  const opts = convertAttrUnitsToPixels(attr);
  const {
    tooltipPosition,
    tooltipVisible,
    handleOnMouseEnter,
    handleOnMouseLeave,
    direction,
  } = useTooltip();

  const fontSize = wire.position ? 16 : 12;

  return (
    <Group>
      <Rect
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
        height={opts.size.height}
        fill="#555555"
      />
      <Text
        text={`${wire.position ?? wire.name}`}
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
        height={opts.size.height}
        verticalAlign={"middle"}
        align="center"
        fontSize={fontSize}
        fontWeight="bold"
        padding={5}
        fill="white"
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
      />
      {wire.expanded &&
        wire.tubes.map((tube, i) => {
          return <TubeUi key={i} tube={tube} readonly={readonly} />;
        })}
      <Tooltip
        x={tooltipPosition.x}
        y={tooltipPosition.y}
        visible={tooltipVisible}
        text={wire.name}
        direction={direction}
      />
    </Group>
  );
};
