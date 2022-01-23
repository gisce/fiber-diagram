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

export const getNPointsBelowPoint = ({
  point,
  unitSize, // Will be the separation between the points returned
  n,
}: {
  point: number; // Origin point
  unitSize: number; // Will be the separation between the points returned
  n: number; // Number of points to be returned
}) => {
  return getNPoints({
    point,
    unitSize,
    n,
    place: "BELOW",
  });
};

export const getNPointsAbovePoint = ({
  point,
  unitSize,
  n,
}: {
  point: number; // Origin point
  unitSize: number; // Will be the separation between the points returned
  n: number; // Number of points to be returned
}) => {
  return getNPoints({
    point,
    unitSize,
    n,
    place: "ABOVE",
  });
};

export const getNPoints = ({
  point,
  unitSize,
  n,
  place,
}: {
  point: number; // Origin point
  unitSize: number; // Will be the separation between the points returned
  n: number; // Number of points to be returned
  place: "ABOVE" | "BELOW";
}) => {
  const indexes = [];

  for (let i = 0; i < n; i++) {
    indexes.push(point + i * unitSize * (place === "ABOVE" ? -1 : 1));
  }

  return indexes.sort(function (a, b) {
    return a - b;
  });
};
