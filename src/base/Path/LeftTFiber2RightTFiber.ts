import { Config } from "base/Config";
import { Position } from "base/Grid";
import { ColumnController } from "base/PathController/ColumnController/ColumnController";
import { RowController } from "base/PathController/RowController/RowController";

export default ({
  source,
  target,
  columnController,
  rowController,
}: {
  source: Position; // The fiber on the left side
  target: Position; // The fiber on the right side
  columnController: ColumnController; // In order to check where we can vertically place our connection
  rowController: RowController; // In order to check where we can horizontally place our connection
}) => {
  // First we determine the fusion point searching for the vertical available space inside fusionColumn
  const fusionYPoint =
    columnController.indexController.getNFreeIndexesFromPoint({
      point: source.y,
      unitSize: Config.baseUnits.fiber.height,
      n: 1,
    })[0];

  // Check if we can directly connect the fibers if they're flat and there's space in the middle fusion column
  if (source.y === target.y && target.y === fusionYPoint) {
    return getFlatPath({ source, target, columnController });
  }

  // Then we determine the angle point searching horizontal available space inside angleRow
};

const getFlatPath = ({
  source,
  target,
  columnController,
}: {
  source: Position; // The fiber on the left side
  target: Position; // The fiber on the right side
  columnController: ColumnController; // In order to check where we can vertically place our connection
}) => {
    
};
