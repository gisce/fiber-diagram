import { Grid } from "base/Grid";
import { Wire } from "base/Wire";
import { getJsonString } from "utils/jsonUtils";
import { Tube } from "./Tube";
import { TubeApiType } from "./Tube.types";

const tubeExample: TubeApiType = {
  id: 1,
  name: "Tube 1",
  color: "#00ff00",
  fibers: [
    {
      id: 1,
      name: "Fiber 1",
      color: "#057490",
    },
    {
      id: 2,
      name: "Fiber 2",
      color: "#434091",
    },
    {
      id: 3,
      name: "Fiber 3",
      color: "#4f0f0f",
    },
  ],
};

const getNewGridAndWire = (onChange: any) => {
  const grid = new Grid({ onChange });
  const wire = new Wire({
    index: 1,
    parentGrid: grid,
  });
  grid.addWire(wire);
  return {
    grid,
    wire,
  };
};

describe("A Tube", () => {
  describe("when creating a tube from a JSON parsed input", () => {
    it("should parse tube with three fibers", () => {
      const { wire } = getNewGridAndWire(jest.fn());
      const tube = new Tube({
        data: tubeExample,
        parentWire: wire,
        index: 0,
      });
      expect(tube.fibers.length).toBe(3);
    });
  });
  describe("when getting a JSON from a tube", () => {
    it("should match json in parse/get with three tubes", () => {
      const { wire } = getNewGridAndWire(jest.fn());
      const tube = new Tube({
        data: tubeExample,
        parentWire: wire,
        index: 0,
      });
      expect(getJsonString(tube.getApiJson())).toEqual(
        getJsonString(tubeExample)
      );
    });
  });
  describe("when collapsing/expanding tubes", () => {
    it("should be undefined by default", () => {
      const { wire } = getNewGridAndWire(jest.fn());
      const tube = new Tube({
        data: tubeExample,
        parentWire: wire,
        index: 0,
      });
      expect(tube.expanded).toBe(undefined);
    });
    it("shoud not call onChange when collapsing a expanded tube", () => {
      const onChange = jest.fn();
      const { wire } = getNewGridAndWire(onChange);
      const tube = new Tube({
        data: tubeExample,
        parentWire: wire,
        index: 0,
      });
      wire.addTube(tube);
      onChange.mockClear();
      tube.collapse({
        mustCollapseLinkedTubes: false,
      });
      expect(onChange).not.toHaveBeenCalled();
    });
    it("shoud not call onChange when expanding an expanded tube", () => {
      const onChange = jest.fn();
      const { wire } = getNewGridAndWire(onChange);
      const tube = new Tube({
        data: { ...tubeExample, expanded: false },
        parentWire: wire,
        index: 0,
      });
      wire.addTube(tube);
      onChange.mockClear();
      tube.expand();
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
