import React, { useContext } from "react";
import { Button, Modal } from "antd";
import { LocaleContext, LocaleContextType } from "ui/locales/LocaleContext";
const confirm = Modal.confirm;

type RemoveSplitterButtonProps = {
  disabled: boolean;
  onRemoveSelectedSplitter: () => void;
};

export const RemoveSplitterButton = (props: RemoveSplitterButtonProps) => {
  const { onRemoveSelectedSplitter, disabled } = props;
  const { t } = useContext(LocaleContext) as LocaleContextType;

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          confirm({
            title: t("removeSplitter"),
            content: t("removeSplitterConfirm"),
            okText: t("ok"),
            cancelText: t("cancel"),
            onOk() {
              onRemoveSelectedSplitter();
            },
            onCancel() {},
          });
        }}
      >
        {t("removeSplitter")}
      </Button>
    </>
  );
};
