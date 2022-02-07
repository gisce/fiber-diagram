import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { GridUi } from "./GridUi";
import basic from "examples/basic.json";
import eight from "examples/8.json";
import nine from "examples/9.json";
import ten from "examples/10.json";
import simpleConnections from "examples/simpleConnections.json";
import basic1Splitter from "examples/basic1Splitter.json";
import basic2Splitter from "examples/basic2Splitter.json";
import "antd/dist/antd.css";

export default {
  title: "Components/GridUi",
  component: GridUi,
} as ComponentMeta<typeof GridUi>;

const Template: ComponentStory<typeof GridUi> = (args) => <GridUi {...args} />;

export const Basic = Template.bind({});
Basic.args = { inputJson: JSON.stringify(basic) };

export const Eight = Template.bind({});
Eight.args = { inputJson: JSON.stringify(eight) };

export const Nine = Template.bind({});
Nine.args = { inputJson: JSON.stringify(nine) };

export const Ten = Template.bind({});
Ten.args = { inputJson: JSON.stringify(ten) };

export const SimpleConnections = Template.bind({});
SimpleConnections.args = { inputJson: JSON.stringify(simpleConnections) };

export const BasicW1Splitter = Template.bind({});
BasicW1Splitter.args = { inputJson: JSON.stringify(basic1Splitter) };

export const BasicW2Splitter = Template.bind({});
BasicW2Splitter.args = { inputJson: JSON.stringify(basic2Splitter) };
