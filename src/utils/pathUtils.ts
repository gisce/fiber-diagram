import { Config } from "base/Config";

export const correctOverlap = (
  firstPath: number[][],
  secondPath: number[][],
  side: "LEFT" | "RIGHT"
) => {
  const correctedPath: number[][] = [];

  const vector = side === "LEFT" ? -1 : 1;

  secondPath.forEach((point: number[]) => {
    if (
      !checkIfPointIsInPath(point, firstPath) &&
      !checkIfPointIsInPath(
        [point[0] + vector * (Config.baseUnits.fiber.height * 1), point[1]],
        firstPath
      ) &&
      !checkIfPointIsInPath(
        [point[0] + vector * (Config.baseUnits.fiber.height * 2), point[1]],
        firstPath
      ) &&
      !checkIfPointIsInPath(
        [point[0] + vector * (Config.baseUnits.fiber.height * 3), point[1]],
        firstPath
      )
    ) {
      correctedPath.push(point);
    } else {
      correctedPath.push([point[0] - 3, point[1]]);
    }
  });

  return correctedPath;
};

export const checkIfPointIsInPath = (point: number[], path: number[][]) => {
  return path.some((pathPoint: number[]) => {
    return pathPoint[0] === point[0] && pathPoint[1] === point[1];
  });
};

export const pathIsHorizontal = (path: [number, number][]) => {
  const allYs = {};
  path.forEach((point) => (allYs[point[1]] = true));
  return Object.keys(allYs).length === 1;
};
