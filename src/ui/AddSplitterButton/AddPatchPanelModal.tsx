import React, { useContext, useState } from "react";
import { Modal, Button, Row, Space, Col, Select, Divider } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { LocaleContext, LocaleContextType } from "@/ui/locales/LocaleContext";
import { SplitterOpts } from "@/base/Splitter/Splitter.types";
const { Option } = Select;

type AddPatchPanelModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (splitterOpts: SplitterOpts) => void;
};

const defaultPorts = "12";

export const AddPatchPanelModal = (props: AddPatchPanelModalProps) => {
  const { visible, onCancel, onOk } = props;
  const { t } = useContext(LocaleContext) as LocaleContextType;

  const [portsValue, setPortsValue] = useState(defaultPorts);

  function onSubmit() {
    const splitterOpts: SplitterOpts = {
      nInputs: parseInt(portsValue) / 2,
      nOutputs: parseInt(portsValue) / 2,
      type: "PATCH_PANEL",
    };
    onOk(splitterOpts);
  }

  function handlePortsChange(value: any) {
    setPortsValue(value);
  }

  return (
    <Modal
      title={t("selectPorts")}
      centered
      visible={visible}
      closable={true}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Row style={{ paddingBottom: 20 }}>
        <Col flex="8rem" style={{ paddingRight: 10 }}>
          {t("inputs")}
        </Col>
        <Col flex="auto">
          <Select
            defaultValue={defaultPorts}
            style={{ width: 120 }}
            onChange={handlePortsChange}
          >
            <Option value="12">12</Option>
            <Option value="24">24</Option>
            <Option value="36">36</Option>
            <Option value="48">48</Option>
          </Select>
        </Col>
      </Row>
      <Divider />
      <Row justify="end">
        <Space>
          <Button icon={<CloseOutlined />} onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button
            icon={<CheckOutlined />}
            onClick={onSubmit}
            style={{ marginLeft: 15 }}
          >
            {t("ok")}
          </Button>
        </Space>
      </Row>
    </Modal>
  );
};
