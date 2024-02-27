import { Config } from "@/base/Config";
import { getNPointsAbovePoint, getNPointsBelowPoint } from "@/utils/pathUtils";

export class IndexController<T> {
  indexes: any;

  constructor() {
    (this.indexes as any) = {};
  }

  checkIfIndexIsFree({ index }: { index: number }) {
    // We don't allow y values below zero
    if (index < 0) {
      return false;
    }

    return this.indexes[index] === undefined;
  }

  getLowestUsedIndex() {
    const indexes = Object.keys(this.indexes).map((k) => parseInt(k));
    return indexes.length > 0 ? Math.min(...indexes) : 0;
  }

  getHighestUsedIndex() {
    const indexes = Object.keys(this.indexes).map((k) => parseInt(k));
    return indexes.length > 0 ? Math.max(...indexes) : 0;
  }

  getFreeBelowIndexes({
    n,
    unitSize,
    point,
  }: {
    n: number; // Number of indexes to find
    unitSize: number; // Size of the unit
    point: number; // Y point to start from
  }) {
    let freeBelowIndexes: number[];

    if (this.getHighestUsedIndex() === 0) {
      return getNPointsBelowPoint({
        point,
        unitSize,
        n,
      });
    }

    let j = point;

    while (!freeBelowIndexes && j > 0) {
      const indexes = getNPointsBelowPoint({
        point: j,
        unitSize,
        n,
      });

      const first = indexes[0];
      const last = indexes[indexes.length - 1];

      const indexesWithSeparation = [...indexes];

      for (let i = first; i >= first - unitSize; i -= 1) {
        indexesWithSeparation.push(i);
      }

      for (let i = last; i <= last + unitSize; i += 1) {
        indexesWithSeparation.push(i);
      }

      const indexesAreFree = indexesWithSeparation.every((index) => {
        return this.checkIfIndexIsFree({
          index,
        });
      });
      if (indexesAreFree) {
        freeBelowIndexes = indexes;
      }

      j -= 1;
    }

    return freeBelowIndexes;
  }

  getFreeAboveIndexes({
    n,
    unitSize,
    point,
  }: {
    n: number; // Number of indexes to find
    unitSize: number; // Size of the unit
    point: number; // Y point to start from
  }) {
    let freeAboveIndexes: number[];

    const highestUsedIndex = this.getHighestUsedIndex();

    if (highestUsedIndex === 0) {
      return getNPointsAbovePoint({
        point,
        unitSize,
        n,
      });
    }

    let i = point;

    while (!freeAboveIndexes) {
      const indexes = getNPointsAbovePoint({
        point: i,
        unitSize,
        n,
      });

      const first = indexes[0];
      const last = indexes[indexes.length - 1];

      const indexesWithSeparation = [
        ...indexes,
        first - unitSize,
        last + unitSize,
      ];

      const indexesAreFree = indexesWithSeparation.every((index) => {
        return this.checkIfIndexIsFree({
          index,
        });
      });

      if (indexesAreFree) {
        freeAboveIndexes = indexes;
      }

      i += 1;
    }

    return freeAboveIndexes;
  }

  getNFreeIndexesFromPoint({
    n,
    unitSize,
    point,
  }: {
    n: number; // Number of indexes to find
    unitSize: number; // Size of the unit
    point: number; // Y point to start from
  }) {
    // First, we check if for free units *BELOW* the y point, and store them in freeAboveIndexes
    const freeBelowIndexes: number[] = this.getFreeBelowIndexes({
      n,
      unitSize,
      point,
    });

    // Next, we check for free units *ABOVE* the y point, and store them in freeBelowIndexes
    const freeAboveIndexes: number[] = this.getFreeAboveIndexes({
      n,
      unitSize,
      point,
    });

    // If we have found free units *BELOW* and *ABOVE*, we must decide the nearest ones
    if (freeAboveIndexes && freeBelowIndexes) {
      const firstPointAbove = freeAboveIndexes[0];
      const firstPointBelow = freeBelowIndexes[0];
      const distanceAbove = Math.abs(point - firstPointAbove);
      const distanceBelow = Math.abs(point - firstPointBelow);
      if (distanceAbove < distanceBelow) {
        return freeAboveIndexes;
      } else {
        return freeBelowIndexes;
      }
    }

    return freeAboveIndexes || freeBelowIndexes;
  }

  setUsedIndexWithSize({
    element,
    point,
    size,
  }: {
    element: any;
    point: number;
    size: number;
  }) {
    this.indexes[point] = element;

    for (let i = point; i < point + size; i++) {
      this.indexes[i] = element;
    }
  }

  getHeight() {
    const yPoints: number[] = Object.keys(this.indexes)
      .filter((entry) => {
        return this.indexes[entry] !== undefined;
      })
      .map((pointKey: string) => {
        return parseInt(pointKey, 10);
      });
    if (yPoints.length === 0) {
      return 0;
    }

    return Math.max(...yPoints) + Config.baseUnits.fiber.height * 3;
  }

  getWidth() {
    const xPoints: number[] = Object.keys(this.indexes)
      .filter((entry) => {
        return this.indexes[entry] !== undefined;
      })
      .map((pointKey: string) => {
        return parseInt(pointKey, 10);
      });

    if (xPoints.length === 0) {
      return 0;
    }

    const maxPoint = Math.max(...xPoints);
    const minPoint = Math.min(...xPoints);

    return Math.abs(maxPoint - minPoint) + Config.baseUnits.fiber.width * 3;
  }
}
