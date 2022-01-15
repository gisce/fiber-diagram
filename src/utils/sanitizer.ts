import { GridDataType } from "base/Grid";

export const sanitize = (input: any) => {
  const output: GridDataType = { res: {} };
  output.res.connections = {};
  output.res.connections.fibers = input.res.connections?.fibers;

  output.res.elements = {};
  output.res.elements.wires = input.res.elements.wires?.map((wire: any) => {
    return {
      id: wire.id,
      name: wire.name,
      disposition: wire.position || wire.disposition,
      tubes: wire.tubes?.map((tube: any) => {
        return {
          id: tube.id,
          color: tube.color,
          name: tube.name,
          fibers: tube.fibers?.map((fiber: any) => {
            return {
              id: fiber.id,
              name: fiber.name,
              color: fiber.color,
            };
          }),
        };
      }),
    };
  });

  output.res.elements.splitters = input.res.elements.splitters?.map(
    (splitter: any) => {
      const { id, fibers_in, fibers_out } = splitter;
      return {
        id,
        fibers_in,
        fibers_out,
      };
    }
  );

  return output;
};
