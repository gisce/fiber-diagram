import { getJsonString } from "utils/jsonUtils";
import { Grid, GridDataType } from ".";

const testJsons: GridDataType[] = [
  {
    res: {
      elements: {
        wires: [
          {
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
          },
          {
            id: 2,
            name: "Second",
            disposition: "RIGHT",
            tubes: [],
          },
        ],
      },
    },
  },
];

describe("A Grid", () => {
  describe("when creating a grid from a JSON parsed input", () => {
    it("should parse grid with two wires", () => {
      const grid = new Grid({ input: testJsons[0] });
      expect(grid.leftWires.length).toBe(1);
      expect(grid.rightWires.length).toBe(1);
    });
  });
  describe("when getting a JSON from a grid", () => {
    it("should match json in parse/get with two wires", () => {
      const grid = new Grid({ input: testJsons[0] });
      expect(getJsonString(grid.getApiJson())).toEqual(
        getJsonString(testJsons[0])
      );
    });
  });
  describe("when handling wires", () => {
    it("should parse wires", () => {
      const grid = new Grid({ input: testJsons[0] });
      expect(grid.leftWires.length).toBe(1);
      expect(grid.rightWires.length).toBe(1);
    });
    it("sould add a new wire", () => {
      const onChange = jest.fn();
      const grid = new Grid({ input: testJsons[0], onChange });
      expect(grid.leftWires.length).toBe(1);
      expect(grid.rightWires.length).toBe(1);
      grid.addWire({
        id: 3,
        name: "Third",
        disposition: "LEFT",
      });
      expect(onChange).lastCalledWith(grid);
      expect(grid.leftWires.length).toBe(2);
    });
    it("should fire onChange when expanding/collapsing wires", () => {
      const onChange = jest.fn();
      const grid = new Grid({ input: testJsons[0], onChange });
      grid.leftWires[0].collapse();
      expect(getJsonString(grid.getApiJson())).toEqual(
        getJsonString(testJsons[0])
      );
      expect(onChange).lastCalledWith(grid);
    });
  });
});
