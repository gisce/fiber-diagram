/// <reference types="react" />
import { Splitter } from "base/Splitter";
export declare const SplitterUi: ({ splitter, splitterIsSelected, onSplitterSelected, readonly, }: {
    splitter: Splitter;
    splitterIsSelected: boolean;
    onSplitterSelected: (splitter: Splitter) => void;
    readonly: boolean;
}) => JSX.Element;
