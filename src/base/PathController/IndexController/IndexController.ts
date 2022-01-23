import { getNPointsAbovePoint, getNPointsBelowPoint } from "utils/pathUtils";

export class IndexController<T> {
  indexes: T;

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

  getFreeAboveIndexes({
    n,
    unitSize,
    point,
  }: {
    n: number; // Number of indexes to find
    unitSize: number; // Size of the unit
    point: number; // Y point to start from
  }) {
    let freeBelowIndexes: number[];

    for (let j = point; j >= 0 + n; j--) {
      const indexes = getNPointsAbovePoint({
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
        break;
      }
    }
    return freeBelowIndexes;
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
    let freeAboveIndexes: number[];

    for (let i = point; i < this.getHighestUsedIndex(); i++) {
      const indexes = getNPointsBelowPoint({
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
        break;
      }
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
}
