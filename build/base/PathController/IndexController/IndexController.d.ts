export declare class IndexController<T> {
    indexes: T;
    constructor();
    checkIfIndexIsFree({ index }: {
        index: number;
    }): boolean;
    getLowestUsedIndex(): number;
    getHighestUsedIndex(): number;
    getFreeBelowIndexes({ n, unitSize, point, }: {
        n: number;
        unitSize: number;
        point: number;
    }): any[];
    getFreeAboveIndexes({ n, unitSize, point, }: {
        n: number;
        unitSize: number;
        point: number;
    }): any[];
    getNFreeIndexesFromPoint({ n, unitSize, point, }: {
        n: number;
        unitSize: number;
        point: number;
    }): number[];
    setUsedIndexWithSize({ element, point, size, }: {
        element: any;
        point: number;
        size: number;
    }): void;
    getHeight(): number;
    getWidth(): number;
}
