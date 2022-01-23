import { PathUnit } from "base/Grid/Grid.types";

export const getUnitsForPath = ({
  pathCoords,
  color,
  unitSize,
}: {
  pathCoords: number[][];
  unitSize: number;
  color: string;
}): PathUnit[] => {
  return pathCoords.map((entry) => {
    return {
      position: {
        x: entry[0],
        y: entry[1],
      },
      size: {
        width: unitSize,
        height: unitSize,
      },
      color,
    };
  });
};
