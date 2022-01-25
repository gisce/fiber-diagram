import { Fiber } from "base/Fiber";
import { Splitter } from "base/Splitter";
import { Tube } from "base/Tube";

export const validateFiberConnection = ({
  fiberIn,
  fiberOut,
}: {
  fiberIn: Fiber;
  fiberOut: Fiber;
}) => {
  // Prevent same fiber connection
  if (fiberIn.id === fiberOut.id) {
    return false;
  }

  if (fiberIn.parentType === "SPLITTER" && fiberOut.parentType === "SPLITTER") {
    const splitterIn = fiberIn.parent as Splitter;
    const splitterOut = fiberOut.parent as Splitter;

    const fiberInIsOutput = !splitterIn.isFiberInput(fiberIn);
    const fiberOutIsOutput = !splitterOut.isFiberInput(fiberOut);

    // Prevent connections if both fibers are outputs/inputs from a splitter
    if (fiberInIsOutput === fiberOutIsOutput) {
      return false;
    }

    // Prevent connections if both fibers are from the same splitter
    if (splitterIn.id === splitterOut.id) {
      return false;
    }
  }

  // Prevent connection if one fiber is an input of a splitter, and the other one is from the right
  if (fiberIn.parentType === "SPLITTER" || fiberOut.parentType === "SPLITTER") {
    const splitterFiber =
      fiberIn.parentType === "SPLITTER" ? fiberIn : fiberOut;
    const otherFiber = splitterFiber === fiberIn ? fiberOut : fiberIn;
    const splitterFiberIsInput = (
      splitterFiber.parent as Splitter
    ).isFiberInput(splitterFiber);

    if (otherFiber.parentType === "TUBE") {
      const otherFiberIsFromRight =
        (otherFiber.parent as Tube).parentWire.disposition === "RIGHT";

      if (splitterFiberIsInput && otherFiberIsFromRight) {
        return false;
      }
    } else {
      const splitterConnectedToSplitterFiber = (
        splitterFiber.parent as Splitter
      ).getSplitterConnectedInInput();

      const splitterConnectedToOtherFiber = (
        otherFiber.parent as Splitter
      ).getSplitterConnectedInInput();

      const otherFiberIsInput = (otherFiber.parent as Splitter).isFiberInput(
        otherFiber
      );

      // Check if both fibers are ouput and input from different splitters, but they have a loop
      if (
        splitterConnectedToSplitterFiber !== undefined &&
        splitterConnectedToOtherFiber !== undefined &&
        splitterFiberIsInput !== otherFiberIsInput &&
        splitterConnectedToSplitterFiber.id === splitterConnectedToOtherFiber.id
      ) {
        return false;
      }

      if (
        splitterFiberIsInput !== otherFiberIsInput &&
        splitterConnectedToSplitterFiber !== undefined &&
        splitterConnectedToSplitterFiber.id ===
          (otherFiber.parent as Splitter).id
      ) {
        return false;
      }

      if (
        splitterFiberIsInput !== otherFiberIsInput &&
        splitterConnectedToOtherFiber !== undefined &&
        splitterConnectedToOtherFiber.id ===
          (splitterFiber.parent as Splitter).id
      ) {
        return false;
      }
    }
  }

  return true;
};
