import { Config } from "base/Config";
import { Grid } from "base/Grid";
import { getJsonString } from "utils/jsonUtils";
import { Wire } from "./Wire";
import { WireDataType } from "./Wire.types";

const wireExample: WireDataType = {
  id: 1,
  name: "First",
  disposition: "LEFT",
  tubes: [
    {
      id: 1,
      name: "Tube 1",
      color: "#00ff00",
      fibers: [],
    },
    {
      id: 2,
      name: "Tube 2",
      color: "#ffff00",
      fibers: [],
    },
    {
      id: 3,
      name: "Tube 3",
      color: "#ff0000",
      fibers: [],
    },
  ],
};

describe("A Wire", () => {
  describe("when creating a wire from a JSON parsed input", () => {
    it("should parse wire with three tubes", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: wireExample,
        index: 1,
        parentGrid: testParentGrid,
      });
      expect(wire.tubes.length).toBe(3);
    });
  });
  describe("when getting a JSON from a wire", () => {
    it("should match json in parse/get with three tubes", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: wireExample,
        index: 1,
        parentGrid: testParentGrid,
      });
      expect(getJsonString(wire.getApiJson())).toEqual(
        getJsonString(wireExample)
      );
    });
  });
  describe("when collapsing/expanding wires", () => {
    it("should be expanded by default", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: wireExample,
        index: 1,
        parentGrid: testParentGrid,
      });
      expect(wire.expanded).toBe(true);
    });
    it("should collapse a wire", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: { ...wireExample, expanded: true },
        index: 1,
        parentGrid: testParentGrid,
      });
      expect(wire.expanded).toBe(true);
      wire.collapse();
      expect(wire.expanded).toBe(false);
    });
    it("should expand a wire", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: { ...wireExample, expanded: false },
        index: 1,
        parentGrid: testParentGrid,
      });
      expect(wire.expanded).toBe(false);
      wire.expand();
      expect(wire.expanded).toBe(true);
    });
    it("shoud not call onChange when collapsing a expanded wire", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: { ...wireExample },
        index: 1,
        parentGrid: testParentGrid,
      });
      expect(wire.expanded).toBe(true);
      wire.collapse();
      expect(wire.expanded).toBe(false);
      expect(onChange).not.toHaveBeenCalled();
    });
    it("shoud not call onChange when expanding an expanded wire", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: { ...wireExample },
        index: 1,
        parentGrid: testParentGrid,
      });
      expect(wire.expanded).toBe(true);
      wire.expand();
      expect(wire.expanded).toBe(true);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
  describe("when setting position and size", () => {
    it("should place one wire on the left", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: wireExample,
        index: 1,
        parentGrid: testParentGrid,
      });
      expect(wire.attr.position.x).toBe(0);
      expect(wire.attr.position.y).toBe(0);
    });
    it("should place one wire on the right", () => {
      const onChange = jest.fn();
      const testParentGrid = new Grid({ input: {}, onChange });
      const wire = new Wire({
        data: { ...wireExample, disposition: "RIGHT" },
        index: 1,
        parentGrid: testParentGrid,
      });
      wire.calculatePosition();
      expect(wire.attr.position.x).toBe(
        Config.gridSize.width - Config.baseUnits.wire.width
      );
      expect(wire.attr.position.y).toBe(0);
    });
  });
});
