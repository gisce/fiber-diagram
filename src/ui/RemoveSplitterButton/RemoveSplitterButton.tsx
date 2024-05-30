import React, { useContext } from "react";
import { Button, Modal } from "antd";
import { LocaleContext, LocaleContextType } from "@/ui/locales/LocaleContext";
const confirm = Modal.confirm;

type RemoveSplitterButtonProps = {
  disabled: boolean;
  onRemoveSelectedSplitter: () => void;
  type: "SPLITTER" | "PATCH_PANEL";
};

export const RemoveSplitterButton = (props: RemoveSplitterButtonProps) => {
  const { onRemoveSelectedSplitter, disabled, type } = props;
  const { t } = useContext(LocaleContext) as LocaleContextType;

  const title =
    type === "SPLITTER" ? t("removeSplitter") : t("removePatchPanel");

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          confirm({
            title,
            content:
              type === "SPLITTER"
                ? t("removeSplitterConfirm")
                : t("removePatchPanelConfirm"),
            okText: t("ok"),
            cancelText: t("cancel"),
            onOk() {
              onRemoveSelectedSplitter();
            },
            onCancel() {},
          });
        }}
      >
        {title}
      </Button>
    </>
  );
};
