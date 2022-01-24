import { Fiber } from "base/Fiber";
import { PathUnit } from "base/Grid/Grid.types";
import { Splitter } from "base/Splitter";
import { Tube } from "base/Tube";

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

export const validateFiberConnection = ({
  fiberIn,
  fiberOut,
}: {
  fiberIn: Fiber;
  fiberOut: Fiber;
}) => {
  // Check if both fibers are outputs of an splitter
  const parentGrid =
    fiberIn.parentType === "SPLITTER"
      ? (fiberIn.parent as Splitter).parentGrid
      : (fiberIn.parent as Tube).parentWire.parentGrid;

  // Check if both fibers are outputs from the same splitter
  // if (
  //   fiberIn.parentType === "SPLITTER" &&
  //   fiberOut.parentType === "SPLITTER" &&
  //   fiberIn.isSplitterOutput !== undefined &&
  //   fiberIn.isSplitterOutput === fiberOut.isSplitterOutput
  // ) {
  // throw error
  // }

  // Check if both fibers are ouput and input from different splitters, but they have a loop
  // Only allow splitters fibers in to left - check if one fiber is an input of a splitter, and the other one is from the right

  return true;
};
