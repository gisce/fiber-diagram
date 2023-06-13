import React, { useContext, useState } from "react";
import { Modal, Button, Row, Space, Col, Select, Divider } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { LocaleContext, LocaleContextType } from "@/ui/locales/LocaleContext";
import { SplitterOpts } from "@/base/Splitter/Splitter.types";
const { Option } = Select;

type AddSplitterModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (splitterOpts: SplitterOpts) => void;
};

const defaultInputsValue = "1";
const defaultOutputsValue = "3";

export const AddSplitterModal = (props: AddSplitterModalProps) => {
  const { visible, onCancel, onOk } = props;
  const { t } = useContext(LocaleContext) as LocaleContextType;

  const [inputsValue, setInputsValue] = useState(defaultInputsValue);
  const [outputsValue, setOutputsValue] = useState(defaultOutputsValue);

  function onSubmit() {
    const splitterOpts: SplitterOpts = {
      nInputs: parseInt(inputsValue),
      nOutputs: parseInt(outputsValue),
    };
    onOk(splitterOpts);
  }

  function handleInputsChange(value: any) {
    setInputsValue(value);
  }

  function handleOutputsChange(value: any) {
    setOutputsValue(value);
  }

  return (
    <Modal
      title={t("selectInputsOutputs")}
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
            defaultValue={defaultInputsValue}
            style={{ width: 120 }}
            onChange={handleInputsChange}
          >
            <Option value="1">1</Option>
            <Option value="2">2</Option>
          </Select>
        </Col>
      </Row>
      <Row style={{ paddingBottom: 20 }}>
        <Col flex="8rem" style={{ paddingRight: 10 }}>
          {t("outputs")}
        </Col>
        <Col flex="auto">
          <Select
            defaultValue={defaultOutputsValue}
            style={{ width: 120 }}
            onChange={handleOutputsChange}
          >
            <Option value="2">2</Option>
            <Option value="3">3</Option>
            <Option value="4">4</Option>
            <Option value="5">5</Option>
            <Option value="6">6</Option>
            <Option value="7">7</Option>
            <Option value="8">8</Option>
            <Option value="9">9</Option>
            <Option value="10">10</Option>
            <Option value="11">11</Option>
            <Option value="12">12</Option>
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
