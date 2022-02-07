/// <reference types="react" />
import { SplitterOpts } from "base/Splitter/Splitter.types";
declare type AddSplitterButtonProps = {
    disabled: boolean;
    onAddSplitter: (splitterOpts: SplitterOpts) => void;
};
export declare const AddSplitterButton: (props: AddSplitterButtonProps) => JSX.Element;
export {};
