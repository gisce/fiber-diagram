import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GridUi } from "./GridUi";
import basic from "../../examples/basic.json";
import eight from "../../examples/8.json";
import nine from "../../examples/9.json";
import ten from "../../examples/10.json";
import simpleConnections from "../../examples/simpleConnections.json";
import basic1Splitter from "../../examples/basic1Splitter.json";
import basic2Splitter from "../../examples/basic2Splitter.json";

const meta: Meta<typeof GridUi> = {
  title: "Components/GridUi",
  component: GridUi,
};

export default meta;
type Story = StoryObj<typeof GridUi>;

export const Basic: Story = {
  args: { inputJson: JSON.stringify(basic) },
};

export const Eight: Story = {
  args: { inputJson: JSON.stringify(eight) },
};

export const Nine: Story = {
  args: { inputJson: JSON.stringify(nine) },
};

export const Ten: Story = {
  args: { inputJson: JSON.stringify(ten) },
};

export const SimpleConnections: Story = {
  args: { inputJson: JSON.stringify(simpleConnections) },
};

export const BasicW1Splitter: Story = {
  args: { inputJson: JSON.stringify(basic1Splitter) },
};

export const BasicW2Splitter: Story = {
  args: { inputJson: JSON.stringify(basic2Splitter) },
};
