import { describe, expect, it, vi } from "vitest";
import { Grid } from ".";
import { sanitize } from "../../utils/sanitizer";

import exampleInput from "../../examples/basic2Splitter.json";
import { Tube } from "../../base/Tube";
import { Config } from "../../base/Config";
import { Splitter } from "../../base/Splitter";

const onChange = vi.fn();
const grid = new Grid({ input: sanitize(exampleInput), onChange });

describe("A Grid", () => {
  describe("when creating a grid from a JSON parsed input", () => {
    describe("should parse", () => {
      it("wires with tubes with fibers", () => {
        expect(grid.leftWires).toHaveLength(1);
        expect(grid.rightWires).toHaveLength(1);
        expect(grid.leftWires[0].tubes).toHaveLength(2);
        expect(grid.leftWires[0].tubes[0].fibers).toHaveLength(4);
        expect(grid.leftWires[0].tubes[1].fibers).toHaveLength(4);

        expect(grid.rightWires[0].tubes).toHaveLength(2);
        expect(grid.rightWires[0].tubes[0].fibers).toHaveLength(4);
        expect(grid.rightWires[0].tubes[1].fibers).toHaveLength(4);
      });
      it("fibers", () => {
        expect(grid.getFiberById(223)).toBeDefined();
        expect(grid.getFiberById(223).id).toBe(223);
        expect(grid.getFiberById(223).name).toBe("F1-F1 - ROJA");
        expect(grid.getFiberById(223).color).toBe("#448844");
        expect(grid.getFiberById(223).parent).toBeDefined();
        expect(grid.getFiberById(223).parent instanceof Tube).toBeTruthy();
        expect(grid.getFiberById(223).parentType).toBe("TUBE");

        expect(grid.getFiberById(10)).toBeDefined();
        expect(grid.getFiberById(10).id).toBe(10);
        expect(grid.getFiberById(10).name).toBe("1");
        expect(grid.getFiberById(10).color).toBe(Config.colorForSplitters);
        expect(grid.getFiberById(10).parent).toBeDefined();
        expect(grid.getFiberById(10).parent instanceof Splitter).toBeTruthy();
        expect(grid.getFiberById(10).parentType).toBe("SPLITTER");
      });
      it("fiber and tube connections", () => {
        expect(grid.fiberConnections).toHaveLength(8);
        expect(grid.tubeConnections).toHaveLength(1);
      });
      it("splitters", () => {
        expect(grid.splitters).toHaveLength(2);
        expect(grid.splitters[0].fibers_in).toHaveLength(1);
        expect(grid.splitters[0].fibers_out).toHaveLength(4);
        expect(grid.splitters[1].fibers_in).toHaveLength(1);
        expect(grid.splitters[1].fibers_out).toHaveLength(3);
      });
      it("tube connection collapsed by default", () => {
        const tube23 = grid.getTubeById(23);
        const tube26 = grid.getTubeById(26);

        expect(tube23.expanded).toBe(false);
        expect(tube26.expanded).toBe(false);
        expect(grid.tubeConnections).toHaveLength(1);
      });
    });
  });
  describe("when user interacts with our grid", () => {
    it("should collapse/expand tubes", () => {
      const tube23 = grid.getTubeById(23);
      const tube26 = grid.getTubeById(26);

      // Tube 23 is connected to tube 26, therefore they are collapsed
      expect(tube23.expanded).toBe(false);
      expect(tube26.expanded).toBe(false);

      // Expand tube 23, tube 26 will be also expanded
      grid.getTubeById(23).expand();
      expect(onChange).toHaveBeenCalledTimes(1);

      expect(tube23.expanded).toBe(true);
      expect(tube26.expanded).toBe(true);

      // When we expand a tube the tube connection is removed
      expect(grid.tubeConnections).toHaveLength(0);

      // Collapse tube 26, tube 23 will be also collapsed
      onChange.mockClear();
      grid.getTubeById(26).collapse();
      expect(onChange).toHaveBeenCalledTimes(1);

      expect(tube23.expanded).toBe(false);
      expect(tube26.expanded).toBe(false);

      // When we collapse a tube, a new tube connection is created
      expect(grid.tubeConnections).toHaveLength(1);
    });
    it("should remove a fiber connection", () => {
      const tube23 = grid.getTubeById(23);
      const tube26 = grid.getTubeById(26);

      // We expand both tubes
      grid.getTubeById(23).expand();
      expect(tube23.expanded).toBe(true);
      expect(tube26.expanded).toBe(true);

      expect(grid.fiberConnections).toHaveLength(8);
      const fConnection = grid.getFiberConnectionWithId(tube23.fibers[0].id);
      const otherFiberId = fConnection.getOtherFiberId(tube23.fibers[0].id);
      fConnection.remove();
      expect(grid.fiberConnections).toHaveLength(7);

      // Then we check if we still can expand the tube which are expanded, and we don't get any data change in the callback
      onChange.mockClear();
      grid.getTubeById(23).expand();
      expect(onChange).toHaveBeenCalledTimes(0);

      expect(tube23.expanded).toBe(true);
      expect(tube26.expanded).toBe(true);

      // The tubes now are not connected 1-1, because the first fiber connection was removed, therefore we cannot collapse them
      onChange.mockClear();
      grid.getTubeById(23).collapse();
      expect(onChange).toHaveBeenCalledTimes(0);

      expect(tube23.expanded).toBe(true);
      expect(tube26.expanded).toBe(true);
    });
    it("should add a fiber connection", () => {
      const tube23 = grid.getTubeById(23);
      const tube26 = grid.getTubeById(26);

      onChange.mockClear();
      grid.addFiberConnection({
        fiber_in: tube23.fibers[0].id,
        fiber_out: tube26.fibers[0].id,
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(grid.fiberConnections).toHaveLength(8);

      // We must be able to collapse the tube, as it is connected 1-1 after adding the pending fiber connection
      onChange.mockClear();
      grid.getTubeById(26).collapse();
      expect(onChange).toHaveBeenCalledTimes(1);

      expect(tube23.expanded).toBe(false);
      expect(tube26.expanded).toBe(false);
      expect(grid.tubeConnections).toHaveLength(1);
    });
  });
});
