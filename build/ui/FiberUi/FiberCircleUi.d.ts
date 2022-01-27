/// <reference types="react" />
import { Fiber } from "base/Fiber";
import { Position } from "base/Grid";
export declare type FiberCircleUiProps = Position & {
    fiber: Fiber;
};
export declare const FiberCircleUi: (props: FiberCircleUiProps) => JSX.Element;
