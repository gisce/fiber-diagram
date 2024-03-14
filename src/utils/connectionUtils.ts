import { Fiber } from "@/base/Fiber";
import { Splitter } from "@/base/Splitter";

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
    if (
      splitterIn.id === splitterOut.id &&
      splitterIn.type === splitterOut.type
    ) {
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
        otherFiber,
      );

      // Check if both fibers are ouput and input from different splitters, but they have a loop
      if (
        splittersConnectedToSplitterFiber.length > 0 &&
        splittersConnectedToOtherFiber.length > 0 &&
        splitterFiberIsInput !== otherFiberIsInput &&
        splittersConnectedToSplitterFiber.some((splitter) =>
          splittersConnectedToOtherFiber.some(
            (anotherSplitter) =>
              anotherSplitter.id === splitter.id &&
              anotherSplitter.type === splitter.type,
          ),
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
            (splitter) =>
              splitter.id === (inputFiber.parent as Splitter).id &&
              splitter.type === (inputFiber.parent as Splitter).type,
          )
        ) {
          return false;
        }
      }
    }
  }

  return true;
};

export const arraysContainSameNumbers = (
  arr1: number[],
  arr2: number[],
): boolean => {
  // Step 1: Sort the arrays
  const sortedArr1 = arr1.sort((a, b) => a - b);
  const sortedArr2 = arr2.sort((a, b) => a - b);

  // Step 2: Check array lengths
  if (sortedArr1.length !== sortedArr2.length) {
    return false;
  }

  // Step 3: Compare each element
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  // Step 4: All pairs of elements are equal
  return true;
};
