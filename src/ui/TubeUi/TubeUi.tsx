import { Group, Rect } from "react-konva";
import { FiberUi } from "@/ui/FiberUi/FiberUi";
import { convertAttrUnitsToPixels } from "@/utils/pixelUtils";
import { Tube } from "@/base/Tube";

export const TubeUi = ({
  tube,
  readonly,
}: {
  tube: Tube;
  readonly: boolean;
}) => {
  const { attr, color } = tube;

  const opts = convertAttrUnitsToPixels(attr);

  function onClick() {
    if (tube.expanded === true) {
      tube.collapse();
    } else {
      tube.expand();
    }
  }

  return (
    <Group>
      <Rect
        x={opts.position.x}
        y={opts.position.y}
        width={opts.size.width}
        height={opts.size.height}
        onClick={onClick}
        onTap={onClick}
        fill={color}
      />
      {tube.expanded &&
        tube.fibers.map((fiber, i) => {
          return <FiberUi key={i} fiber={fiber} readonly={readonly} />;
        })}
    </Group>
  );
};
