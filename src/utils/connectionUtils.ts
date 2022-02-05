import { Fiber } from "base/Fiber";
import { Splitter } from "base/Splitter";

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

    if (otherFiber.parentType !== "TUBE") {
      const splittersConnectedToSplitterFiber = (
        splitterFiber.parent as Splitter
      ).getSplittersConnectedInInput();

      const splittersConnectedToOtherFiber = (
        otherFiber.parent as Splitter
      ).getSplittersConnectedInInput();

      const otherFiberIsInput = (otherFiber.parent as Splitter).isFiberInput(
        otherFiber
      );

      // Check if both fibers are ouput and input from different splitters, but they have a loop
      if (
        splittersConnectedToSplitterFiber.length > 0 &&
        splittersConnectedToOtherFiber.length > 0 &&
        splitterFiberIsInput !== otherFiberIsInput &&
        splittersConnectedToSplitterFiber.some((splitter) =>
          splittersConnectedToOtherFiber.some(
            (anotherSplitter) => anotherSplitter.id === splitter.id
          )
        )
      ) {
        return false;
      }

      if (splitterFiberIsInput !== otherFiberIsInput) {
        const inputFiber = splitterFiberIsInput ? splitterFiber : otherFiber;
        const splittersConnected = splitterFiberIsInput
          ? splittersConnectedToOtherFiber
          : splittersConnectedToSplitterFiber;

        if (
          splittersConnected.length > 0 &&
          splittersConnected.some(
            (splitter) => splitter.id === (inputFiber.parent as Splitter).id
          )
        ) {
          return false;
        }
      }
    }
  }

  return true;
};
