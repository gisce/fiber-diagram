import { Fiber } from "base/Fiber";
import React from "react";
export declare type FiberConnectionContextType = {
    selectedFiber: Fiber | undefined;
    setSelectedFiber: (fiber: Fiber | undefined) => void;
};
export declare const FiberConnectionContext: React.Context<FiberConnectionContextType>;
declare type FiberConnectionContextProps = {
    children: React.ReactNode;
};
export declare const FiberConnectionContextProvider: (props: FiberConnectionContextProps) => any;
export {};
