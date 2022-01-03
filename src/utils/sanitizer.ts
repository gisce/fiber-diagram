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

  return output;
};
