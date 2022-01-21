import { getJsonString } from "utils/jsonUtils";
import { Grid, GridDataType } from ".";
import { sanitize } from "utils/sanitizer";

import exampleInput from "examples/basic2Splitter.json";
import { Tube } from "base/Tube";
import { Config } from "base/Config";
import { Splitter } from "base/Splitter";

describe("A Grid", () => {
  describe("when creating a grid from a JSON parsed input", () => {
    it("should parse grid with wires, tubes, connections and splitters", () => {
      const grid = new Grid({ input: sanitize(exampleInput) });

      expect(grid.leftWires).toHaveLength(1);
      expect(grid.rightWires).toHaveLength(1);
      expect(grid.leftWires[0].tubes).toHaveLength(2);
      expect(grid.leftWires[0].tubes[0].fibers).toHaveLength(4);
      expect(grid.leftWires[0].tubes[1].fibers).toHaveLength(4);

      expect(grid.rightWires[0].tubes).toHaveLength(2);
      expect(grid.rightWires[0].tubes[0].fibers).toHaveLength(4);
      expect(grid.rightWires[0].tubes[1].fibers).toHaveLength(4);

      expect(grid.fiberConnections).toHaveLength(8);

      expect(grid.splitters).toHaveLength(2);
      expect(grid.splitters[0].fibers_in).toHaveLength(1);
      expect(grid.splitters[0].fibers_out).toHaveLength(4);
      expect(grid.splitters[1].fibers_in).toHaveLength(1);
      expect(grid.splitters[1].fibers_out).toHaveLength(3);

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
  });
});
