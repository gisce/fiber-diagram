import { Config } from "@/base/Config";
import { PositionSize } from "@/base/Grid";

export const convertAttrUnitsToPixels = (attr: PositionSize) => {
  const { size, position } = attr;
  const { x, y } = position;
  const { width, height } = size;
  return {
    position: {
      x: x * Config.pixelsPerUnit,
      y: y * Config.pixelsPerUnit,
    },
    size: {
      width: width * Config.pixelsPerUnit,
      height: height * Config.pixelsPerUnit,
    },
  };
};
