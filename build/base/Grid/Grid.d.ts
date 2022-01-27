import { FiberConnection, FiberConnectionData } from "base/FiberConnection";
import { Wire, WireData } from "base/Wire";
import { Size } from "./Grid.types";
import { Tube } from "base/Tube";
import { TubeConnection, TubeConnectionData } from "base/TubeConnection";
import { Fiber } from "base/Fiber";
import { Splitter } from "base/Splitter";
import { SplitterData } from "base/Splitter/Splitter.types";
import { GridData } from ".";
import { PathController } from "base/PathController";
export declare class Grid {
    id: number;
    name: string;
    onChange?: (grid: Grid) => void;
    size: Size;
    leftSideWidth: number;
    rightSideWidth: number;
    leftWires: Wire[];
    rightWires: Wire[];
    fiberConnections?: FiberConnection[];
    tubeConnections?: TubeConnection[];
    splitters: Splitter[];
    pathController: PathController;
    constructor({ input, onChange, }: {
        input?: GridData;
        onChange?: (grid: Grid) => void;
    });
    parse({ input }: {
        input?: GridData;
    }): void;
    calculate(): void;
    parseWires(wiresData: WireData[]): void;
    parseSplitters(splittersData: SplitterData[]): void;
    parseConnections(connectionsData: FiberConnectionData[]): void;
    getConnectedO2OTubes(): TubeConnectionData[];
    addWire({ wireData }: {
        wireData: WireData;
    }): void;
    addSplitter({ splitterData }: {
        splitterData: SplitterData;
    }): void;
    addFiberConnection(fiberConnectionData: FiberConnectionData): void;
    removeFiberConnection(fiberConnectionData: FiberConnectionData): void;
    addTubeConnection(tubeConnectionData: TubeConnectionData): void;
    removeTubeConnection(tubeConnectionData: TubeConnectionData): void;
    onTubeExpand(tube: Tube): void;
    onTubeCollapse(tube: Tube): void;
    setTubeExpanded({ tube, expanded }: {
        tube: Tube;
        expanded: boolean;
    }): void;
    getAllWires(): Wire[];
    getAllTubes(): Tube[];
    getAllFibers(): Fiber[];
    getFiberById(id: number): Fiber;
    getTubeById(id: number): Tube;
    getFiberConnectionWithId(id: number): FiberConnection;
    getTubeConnectionWithId(id: number): TubeConnection;
    getWiresHeight(): number;
    getSplittersHeight(): number;
    getSplittersMaxHposition(): number;
    recalculateWidth(): void;
    getJson(): GridData;
    dataHasChanged(): void;
}
