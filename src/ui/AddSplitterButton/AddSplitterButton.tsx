import React, { useContext, useState } from "react";
import { Button } from "antd";
import { AddSplitterModal } from "./AddSplitterModal";
import { SplitterOpts } from "@/base/Splitter/Splitter.types";
import { LocaleContext, LocaleContextType } from "@/ui/locales/LocaleContext";
import { AddPatchPanelModal } from "./AddPatchPanelModal";

type AddSplitterButtonProps = {
  disabled: boolean;
  onAddSplitter: (splitterOpts: SplitterOpts) => void;
  type: "SPLITTER" | "PATCH_PANEL";
};

export const AddSplitterButton = (props: AddSplitterButtonProps) => {
  const [visible, setVisible] = useState(false);
  const { onAddSplitter, disabled, type = "SPLITTER" } = props;
  const { t } = useContext(LocaleContext) as LocaleContextType;

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          setVisible(true);
        }}
      >
        {type === "SPLITTER" ? t("addSplitter") : t("addPatchPanel")}
      </Button>
      {type === "SPLITTER" ? (
        <AddSplitterModal
          visible={visible}
          onCancel={() => {
            setVisible(false);
          }}
          onOk={(splitterOpts: SplitterOpts) => {
            setVisible(false);
            onAddSplitter(splitterOpts);
          }}
        />
      ) : (
        <AddPatchPanelModal
          visible={visible}
          onCancel={() => {
            setVisible(false);
          }}
          onOk={(splitterOpts: SplitterOpts) => {
            setVisible(false);
            onAddSplitter(splitterOpts);
          }}
        />
      )}
    </>
  );
};
