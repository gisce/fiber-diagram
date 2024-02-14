import React, { useContext, useState } from "react";
import { Button } from "antd";
import { AddSplitterModal } from "./AddSplitterModal";
import { SplitterOpts } from "@/base/Splitter/Splitter.types";
import { LocaleContext, LocaleContextType } from "@/ui/locales/LocaleContext";

type AddSplitterButtonProps = {
  disabled: boolean;
  onAddSplitter: (splitterOpts: SplitterOpts) => void;
};

export const AddSplitterButton = (props: AddSplitterButtonProps) => {
  const [visible, setVisible] = useState(false);
  const { onAddSplitter, disabled } = props;
  const { t } = useContext(LocaleContext) as LocaleContextType;

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          setVisible(true);
        }}
      >
        {t("addSplitter")}
      </Button>
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
    </>
  );
};