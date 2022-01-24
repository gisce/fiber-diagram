import { Fiber } from "base/Fiber";

export const validateFiberConnection = ({
  fiberIn,
  fiberOut,
}: {
  fiberIn: Fiber;
  fiberOut: Fiber;
}) => {
  // Check if both fibers are outputs of an splitter
  // const parentGrid =
  //   fiberIn.parentType === "SPLITTER"
  //     ? (fiberIn.parent as Splitter).parentGrid
  //     : (fiberIn.parent as Tube).parentWire.parentGrid;

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
