import { Rect, Group, Text } from "react-konva";
import { Wire } from "@/base/Wire";
import { TubeUi } from "@/ui/TubeUi";
import { convertAttrUnitsToPixels } from "@/utils/pixelUtils";

export const WireUi = ({
  wire,
  readonly,
}: {
  wire: Wire;
  readonly: boolean;
}) => {
  const { attr } = wire;
  const opts = convertAttrUnitsToPixels(attr);

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
        fontSize={12}
        padding={5}
        fill="white"
      />
      {wire.expanded &&
        wire.tubes.map((tube, i) => {
          return <TubeUi key={i} tube={tube} readonly={readonly} />;
        })}
    </Group>
  );
};
