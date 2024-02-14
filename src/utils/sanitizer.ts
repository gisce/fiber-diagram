import { GridData } from "@/base/Grid";
import { Wire } from "@/base/Wire";

export const sanitize = (input: any) => {
  if (!input) {
    return undefined;
  }

  const output: GridData = { res: {} };
  output.res.connections = {
    fibers: input.res.connections?.fibers,
  };

  output.res.elements = {};
  output.res.elements.wires = input.res.elements.wires
    ?.sort((a: Wire, b: Wire) => a.position - b.position)
    .map((wire: Wire) => {
      return {
        id: wire.id,
        name: wire.name,
        position: wire.position,
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
    },
  );

  return output;
};
