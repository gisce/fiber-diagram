import { Label, Text, Tag } from "react-konva";

export type TooltipProps = {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  direction: "left" | "right";
};

export const Tooltip = ({ visible, text, x, y, direction }: TooltipProps) => {
  if (!visible) {
    return null;
  }

  return (
    <Label x={x} y={y} opacity={0.75}>
      <Tag
        fill="black"
        pointerDirection={direction}
        pointerWidth={10}
        pointerHeight={10}
        lineJoin="round"
        shadowColor="black"
        shadowBlur={10}
        shadowOffsetX={10}
        shadowOffsetY={10}
        shadowOpacity={0.5}
      />
      <Text text={text} fontSize={12} padding={5} fill={"white"} />
    </Label>
  );
};
