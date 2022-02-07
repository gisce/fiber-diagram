/// <reference types="react" />
import { SplitterOpts } from "base/Splitter/Splitter.types";
declare type AddSplitterModalProps = {
    visible: boolean;
    onCancel: () => void;
    onOk: (splitterOpts: SplitterOpts) => void;
};
export declare const AddSplitterModal: (props: AddSplitterModalProps) => JSX.Element;
export {};
